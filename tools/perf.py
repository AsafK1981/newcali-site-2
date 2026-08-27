"""Measure real page weight: HTML plus every same-origin asset the browser must fetch.

    python tools/perf.py --local 8899

Splits assets into render-blocking / eagerly-loaded (what the visitor waits for)
and lazy-loaded (what arrives later), because only the first number affects how
fast the page feels or scores.
"""
import os, re, ssl, sys, urllib.request, urllib.error
from collections import defaultdict

BASE = 'https://www.newcaliconstruction.com'
if '--local' in sys.argv:
    BASE = 'http://localhost:' + sys.argv[sys.argv.index('--local') + 1]
CTX = ssl.create_default_context()
UA = 'Mozilla/5.0 (compatible; NewCaliPerf/1.0)'

_sz = {}
def size_of(url):
    if url in _sz: return _sz[url]
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
            n = len(r.read())
    except Exception:
        n = 0
    _sz[url] = n
    return n


def absolute(path, href):
    if href.startswith('http'):
        return href if BASE.split('//')[1].split('/')[0] in href else None
    if href.startswith('//'):
        return None
    if href.startswith('/'):
        return BASE + href
    base = path.rsplit('/', 1)[0]
    return BASE + (base + '/' + href).replace('//', '/')


def measure(path):
    url = BASE + path
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
            html = r.read().decode('utf-8', 'replace')
    except Exception as e:
        print('  %s -> %s' % (path, e)); return None

    eager, lazy = 0, 0
    counts = defaultdict(int)
    html_bytes = len(html.encode('utf-8'))

    for tag in re.findall(r'<img\b[^>]*>', html):
        m = re.search(r'(?<!data-)src="([^"]+)"', tag)
        if not m or not m.group(1).strip():
            continue
        u = absolute(path, m.group(1))
        if not u:
            continue
        n = size_of(u)
        if 'loading="lazy"' in tag:
            lazy += n; counts['img lazy'] += 1
        else:
            eager += n; counts['img eager'] += 1

    for m in re.finditer(r'<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"', html):
        u = absolute(path, m.group(1))
        if u: eager += size_of(u); counts['css'] += 1
    for m in re.finditer(r'<script[^>]+src="([^"]+)"', html):
        u = absolute(path, m.group(1))
        if u: eager += size_of(u); counts['js'] += 1
    for m in re.finditer(r'<video[^>]*>.*?</video>', html, re.S):
        # (?<!data-) so a data-src placeholder is not billed to first paint
        for s2 in re.findall(r'(?<!data-)src="([^"]+)"', m.group(0)):
            u = absolute(path, s2)
            if u: eager += size_of(u); counts['video'] += 1

    total_first = html_bytes + eager
    flag = ''
    if total_first > 3_000_000: flag = '  <-- heavy'
    elif total_first > 1_500_000: flag = '  <-- watch'
    print('  %-34s html %5.0fKB | first paint %6.2fMB | lazy %6.2fMB | %s%s' % (
        path, html_bytes / 1024, total_first / 1e6, lazy / 1e6,
        ' '.join('%s:%d' % (k, v) for k, v in sorted(counts.items())), flag))
    return total_first


if __name__ == '__main__':
    pages = ['/', '/areas/culver-city/', '/permit-guide/', '/blog/',
             '/portfolio.html', '/kitchen.html', '/areas/']
    print('Page weight on %s\n' % BASE)
    tot = [measure(p) for p in pages]
    tot = [t for t in tot if t]
    print('\n  worst first-load: %.2f MB' % (max(tot) / 1e6))
