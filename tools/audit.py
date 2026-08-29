"""Full-site audit against the LIVE site: SEO, structured data, accessibility and hygiene.

    python tools/audit.py                 # audit https://www.newcaliconstruction.com
    python tools/audit.py --local 8899    # audit a local http.server instead

Fetches every URL in the live sitemap, plus robots.txt and llms.txt, and reports
findings grouped by severity. Exits non-zero if anything CRITICAL is found.
"""
import html as _html
import io, json, os, re, sys, ssl, urllib.request, urllib.error
from collections import defaultdict


def rendered(s):
    """Length as a search engine shows it: entities count as one character."""
    return _html.unescape(s)

BASE = 'https://www.newcaliconstruction.com'
if '--local' in sys.argv:
    BASE = 'http://localhost:' + sys.argv[sys.argv.index('--local') + 1]

CTX = ssl.create_default_context()
UA = 'Mozilla/5.0 (compatible; NewCaliSiteAudit/1.0)'
EM, EN = chr(8212), chr(8211)

findings = defaultdict(list)   # severity -> [(page, message)]
def add(sev, page, msg): findings[sev].append((page, msg))

_cache = {}
def fetch(url):
    if url in _cache: return _cache[url]
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
            body = r.read()
            out = (r.status, body.decode('utf-8', 'replace'), len(body))
    except urllib.error.HTTPError as e:
        out = (e.code, '', 0)
    except Exception as e:
        out = (0, str(e), 0)
    _cache[url] = out
    return out


def head_ok(url):
    """Status only, cheap, for link checking."""
    s, _, _ = fetch(url)
    return s


def text_of(html):
    h = re.sub(r'<script.*?</script>', ' ', html, flags=re.S)
    h = re.sub(r'<style.*?</style>', ' ', h, flags=re.S)
    return re.sub(r'<[^>]+>', ' ', h)


def audit_page(url):
    status, html, nbytes = fetch(url)
    p = url.replace(BASE, '') or '/'
    if status != 200:
        add('CRITICAL', p, 'HTTP %s' % status)
        return None

    # --- title ---
    m = re.search(r'<title>(.*?)</title>', html, re.S)
    title = rendered(m.group(1).strip()) if m else ''
    if not title:
        add('CRITICAL', p, 'no <title>')
    elif len(title) > 65:
        add('MEDIUM', p, 'title %d chars, truncates in results: %r' % (len(title), title[:70]))
    elif len(title) < 25:
        add('MEDIUM', p, 'title only %d chars: %r' % (len(title), title))

    # --- meta description ---
    m = re.search(r'<meta name="description" content="(.*?)"', html, re.S)
    desc = rendered(m.group(1).strip()) if m else ''
    if not desc:
        add('HIGH', p, 'no meta description')
    elif len(desc) > 165:
        add('LOW', p, 'meta description %d chars, will be truncated' % len(desc))
    elif len(desc) < 70:
        add('LOW', p, 'meta description only %d chars' % len(desc))

    # --- canonical ---
    m = re.search(r'<link rel="canonical" href="(.*?)"', html)
    canon = m.group(1) if m else ''
    if not canon:
        add('HIGH', p, 'no canonical')

    # --- one H1 ---
    h1s = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.S)
    if len(h1s) == 0:
        add('HIGH', p, 'no H1')
    elif len(h1s) > 1:
        add('MEDIUM', p, '%d H1 tags' % len(h1s))

    # --- lang + viewport ---
    if not re.search(r'<html[^>]+lang=', html):
        add('MEDIUM', p, 'no lang attribute on <html>')
    if not re.search(r'name="viewport"', html):
        add('CRITICAL', p, 'no viewport meta, mobile will render zoomed out')

    # --- JSON-LD ---
    types = []
    for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            d = json.loads(b)
            t = d.get('@type')
            types += t if isinstance(t, list) else [t]
        except Exception as e:
            add('HIGH', p, 'invalid JSON-LD: %s' % str(e)[:60])
        # An aggregateRating with a reviewCount but no Review objects on the page
        # is the "review count without object" error Search Console reported on
        # 2026-08-29, and the number behind it was never sourced. Flag the shape,
        # not just the presence: a rating backed by real reviews is legitimate.
        if 'aggregateRating' in b and '"@type": "Review"' not in b.replace('"@type":"Review"', '"@type": "Review"'):
            add('CRITICAL', p, 'aggregateRating with no Review objects (Search Console rejects it)')

    # --- images ---
    imgs = re.findall(r'<img\b[^>]*>', html)
    # An empty src is a lightbox placeholder that JS fills and sizes at click time.
    # It is not part of the layout, so it cannot shift it. Counting those as CLS
    # risk made the report noisy enough to bury the real ones.
    imgs = [i for i in imgs if not re.search(r'src="\s*"', i)]
    no_alt = [i for i in imgs if 'alt=' not in i]
    no_dim = [i for i in imgs if not ('width=' in i and 'height=' in i)]
    if no_alt:
        add('MEDIUM', p, '%d of %d <img> without alt' % (len(no_alt), len(imgs)))
    if no_dim:
        add('LOW', p, '%d of %d <img> without width+height (layout shift)' % (len(no_dim), len(imgs)))

    # --- hygiene ---
    nd = html.count(EM) + html.count(EN)
    if nd:
        add('HIGH', p, '%d long dash(es)' % nd)
    if re.search(r'\b2014\b', html):
        add('HIGH', p, 'still references 2014')

    # --- social ---
    if not re.search(r'property="og:title"', html):
        add('LOW', p, 'no og:title')

    # --- weight ---
    if nbytes > 250_000:
        add('MEDIUM', p, 'HTML is %.0f KB before assets' % (nbytes / 1024))

    words = len(text_of(html).split())
    if words < 300 and 'Redirecting' not in title:
        add('MEDIUM', p, 'thin content, ~%d words' % words)

    # Both absolute (/foo) and relative (foo.html) internal hrefs. Matching only
    # absolute paths made every relatively-linked page look like an orphan.
    raw = re.findall(r'href="([^"#?:]+)"', html)
    links = set()
    for h in raw:
        if not h or h.startswith(('//', 'mailto', 'tel')):
            continue
        if h.startswith('/'):
            links.add(h)
        elif not h.startswith(('http', '#')):
            base = p.rsplit('/', 1)[0]
            links.add((base + '/' + h).replace('//', '/'))
    return dict(url=url, path=p, title=title, desc=desc, canon=canon,
                types=types, bytes=nbytes, words=words, links=links, html=html)


def main():
    print('Auditing %s\n' % BASE)
    s, sm, _ = fetch(BASE + '/sitemap.xml')
    if s != 200:
        print('sitemap unreachable, HTTP %s' % s); return 1
    urls = re.findall(r'<loc>([^<]+)</loc>', sm)
    urls = [u.replace('https://www.newcaliconstruction.com', BASE) for u in urls]
    print('%d URLs in sitemap\n' % len(urls))

    pages = []
    for u in urls:
        r = audit_page(u)
        if r: pages.append(r)
        sys.stdout.write('.'); sys.stdout.flush()
    print('\n')

    # --- duplicate titles / descriptions ---
    for field, sev in (('title', 'MEDIUM'), ('desc', 'LOW')):
        seen = defaultdict(list)
        for pg in pages:
            if pg[field]: seen[pg[field]].append(pg['path'])
        for val, paths in seen.items():
            if len(paths) > 1:
                add(sev, ', '.join(paths[:4]), 'duplicate %s: %r' % (field, val[:60]))

    # --- canonical self-reference ---
    for pg in pages:
        if pg['canon'] and pg['canon'].rstrip('/') != pg['url'].rstrip('/').replace(BASE, 'https://www.newcaliconstruction.com'):
            add('MEDIUM', pg['path'], 'canonical points elsewhere: %s' % pg['canon'])

    # --- internal links resolve ---
    checked, broken = set(), 0
    for pg in pages:
        for l in pg['links']:
            if l in checked or l.startswith('//'): continue
            checked.add(l)
            st = head_ok(BASE + l)
            if st != 200:
                add('HIGH', pg['path'], 'internal link -> HTTP %s : %s' % (st, l))
                broken += 1
    print('checked %d unique internal links, %d broken\n' % (len(checked), broken))

    # --- orphan check: every sitemap page should be linked from somewhere ---
    all_links = set()
    for pg in pages: all_links |= pg['links']
    for pg in pages:
        p = pg['path']
        if p == '/': continue
        if p not in all_links and p.rstrip('/') not in {l.rstrip('/') for l in all_links}:
            add('MEDIUM', p, 'orphan: in sitemap but not linked from any audited page')

    # --- site-level files ---
    st, rob, _ = fetch(BASE + '/robots.txt')
    if st != 200:
        add('HIGH', '/robots.txt', 'HTTP %s' % st)
    else:
        if 'Sitemap:' not in rob:
            add('MEDIUM', '/robots.txt', 'does not declare the sitemap')
        if re.search(r'Disallow:\s*/\s*$', rob, re.M):
            add('CRITICAL', '/robots.txt', 'disallows the whole site')
    st, llms, _ = fetch(BASE + '/llms.txt')
    if st != 200:
        add('MEDIUM', '/llms.txt', 'HTTP %s' % st)

    # --- schema coverage ---
    have_lb = [pg['path'] for pg in pages if any(
        t in ('LocalBusiness', 'GeneralContractor', 'HomeAndConstructionBusiness') for t in pg['types'])]
    have_faq = [pg['path'] for pg in pages if 'FAQPage' in pg['types']]
    print('LocalBusiness/GeneralContractor schema on %d pages' % len(have_lb))
    print('FAQPage schema on %d pages' % len(have_faq))
    print('total HTML weight: %.1f MB across %d pages\n' % (
        sum(p['bytes'] for p in pages) / 1e6, len(pages)))

    order = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']
    total = sum(len(findings[s]) for s in order)
    for sev in order:
        rows = findings[sev]
        if not rows: continue
        print('%s  (%d)' % (sev, len(rows)))
        for page, msg in rows[:40]:
            print('   %-34s %s' % (page[:34], msg))
        if len(rows) > 40:
            print('   ... and %d more' % (len(rows) - 40))
        print()
    if not total:
        print('No findings.')
    return 1 if findings['CRITICAL'] else 0


if __name__ == '__main__':
    sys.exit(main())
