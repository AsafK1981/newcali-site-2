"""Push the sitemap's URLs to Bing and Yandex via IndexNow.

IndexNow is a free, no-login protocol: a key file sits at the site root, and a
single POST tells participating engines which URLs changed so they recrawl on
their own schedule instead of waiting to rediscover them. Bing is the one that
matters here, since ChatGPT's search is Bing-backed.

    python tools/indexnow.py            # submit every URL in sitemap.xml
    python tools/indexnow.py --dry-run  # print what would be sent

The key file must stay published at https://www.newcaliconstruction.com/<key>.txt
containing exactly the key, or submissions are rejected.
"""
import io, json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOST = 'www.newcaliconstruction.com'
KEY = '93b8be63c3d0dc1d8bacefe6b1e6756f5c74d6a568e44b4a5ecde40e090eddb0'
KEY_LOCATION = 'https://%s/%s.txt' % (HOST, KEY)
ENDPOINT = 'https://api.indexnow.org/indexnow'


def sitemap_urls():
    s = io.open(os.path.join(ROOT, 'sitemap.xml'), encoding='utf-8').read()
    return re.findall(r'<loc>([^<]+)</loc>', s)


def submit(urls, dry_run=False):
    payload = {
        'host': HOST,
        'key': KEY,
        'keyLocation': KEY_LOCATION,
        'urlList': urls,
    }
    print('%d URLs' % len(urls))
    for u in urls:
        print('  ', u)
    if dry_run:
        print('dry run, nothing sent')
        return 0

    body = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        ENDPOINT, data=body,
        headers={'Content-Type': 'application/json; charset=utf-8'},
        method='POST')
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            print('HTTP %s %s' % (r.status, r.reason))
            return 0 if r.status in (200, 202) else 1
    except urllib.error.HTTPError as e:
        # 422 usually means the key file is not reachable yet.
        print('HTTP %s %s' % (e.code, e.reason))
        print(e.read().decode('utf-8', 'replace')[:400])
        return 1
    except Exception as e:
        print('failed: %s' % e)
        return 1


if __name__ == '__main__':
    sys.exit(submit(sitemap_urls(), dry_run='--dry-run' in sys.argv))
