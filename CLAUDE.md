Always make only the specific change requested. Never modify any other part of the code.

All changes must only affect mobile screens. Only edit CSS inside @media (max-width: 768px) blocks. Never touch desktop styles.

## After publishing anything, ping IndexNow

Pushing to main deploys to GitHub Pages, but Bing will not notice on its own for
a while, and ChatGPT's search is Bing-backed. After a deploy that adds or
meaningfully changes pages, wait for the change to be live and then run:

    python tools/indexnow.py

It submits every URL in sitemap.xml. A 200 or 202 means accepted. A 422 almost
always means the key file at the site root is unreachable, not that the URLs
were rejected.

## Two hard content rules

- **No em dashes or en dashes anywhere.** Plain hyphens only. This is Asaf's
  standing rule across every project; the whole site was cleaned of 297 of them
  on 2026-08-25 and must stay clean.
- **Never restate the founding year or licence dates from memory.** The CSLB
  record is authoritative: licence 1008892, class B, issued 12/11/2015. The site
  previously claimed 2014 in 27 files, which contradicted both CSLB and
  BuildZoom. Everything now says 2015.
