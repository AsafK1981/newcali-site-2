"""Stamp every sitemap URL with the real last-modified date from git history.

    python tools/sitemap-lastmod.py

Crawlers use lastmod to decide what to re-fetch first. Without it they either
guess or ignore the sitemap's ordering, which wastes crawl budget on pages that
have not changed. Dates come from the file's last commit, so they cannot drift
away from reality the way hand-maintained dates do.
"""
import io, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SITE = 'https://www.newcaliconstruction.com'


def path_for(loc):
    p = loc.replace(SITE, '').lstrip('/')
    if p == '' or p.endswith('/'):
        p = p + 'index.html'
    return p


def last_commit_date(path):
    if not os.path.exists(path):
        return None
    try:
        out = subprocess.run(['git', 'log', '-1', '--format=%cs', '--', path],
                             capture_output=True, text=True, timeout=20)
        d = out.stdout.strip()
        return d if re.match(r'^\d{4}-\d{2}-\d{2}$', d) else None
    except Exception:
        return None


s = io.open('sitemap.xml', encoding='utf-8').read()
blocks = re.findall(r'<url>.*?</url>', s, re.S)
stamped, missing = 0, []

for b in blocks:
    m = re.search(r'<loc>([^<]+)</loc>', b)
    if not m:
        continue
    path = path_for(m.group(1))
    d = last_commit_date(path)
    if not d:
        missing.append(path)
        continue
    nb = re.sub(r'\s*<lastmod>[^<]*</lastmod>', '', b)
    nb = nb.replace('</loc>', '</loc>\n    <lastmod>%s</lastmod>' % d, 1)
    if nb != b:
        s = s.replace(b, nb, 1)
        stamped += 1

io.open('sitemap.xml', 'w', encoding='utf-8', newline='').write(s)
print('lastmod stamped on %d of %d URLs' % (stamped, len(blocks)))
if missing:
    print('no file resolved for: %s' % ', '.join(missing))

# sanity: the sitemap must still be well-formed
import xml.etree.ElementTree as ET
try:
    ET.fromstring(s)
    print('sitemap.xml parses cleanly')
except Exception as e:
    print('BROKEN sitemap: %s' % e)
    sys.exit(1)
