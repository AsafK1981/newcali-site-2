Always make only the specific change requested. Never modify any other part of the code.

Changes apply to **both desktop and mobile**. Every effect, section and trust
signal should be present on both; the mobile layout may compact or restack
something, but it should not be the only place an effect exists, and it should
not hide content that matters.

(This replaces an older instruction that restricted all edits to
`@media (max-width: 768px)`. That was scoped to one past mobile-polish task and
Asaf confirmed on 2026-08-25 that it is stale.)

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

## Two tools that check this site

    python tools/audit.py      # SEO, schema, links, a11y, hygiene, against the live site
    python tools/perf.py       # page weight, split into first paint vs lazy

Both take `--local <port>` to run against a local `python -m http.server` before
deploying. Run them after any structural change. Baseline as of 2026-08-27:
zero critical, zero high, five thin-content pages, and 1.07 MB worst first load.

A blank-looking image in a full-page screenshot is usually the capture finishing
before a lazy image decodes, not a bug. Confirm with
`browse scroll <sel>` then `browse wait --networkidle` before assuming a regression.
