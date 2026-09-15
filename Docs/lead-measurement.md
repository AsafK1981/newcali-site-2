# Website lead measurement

Prepared 2026-09-15. Local implementation; publication still requires approval.

## What changed

- The homepage contact form accepts an optional phone number, using the existing form layout and native email/required validation.
- All 38 canonical sitemap pages load one deferred first-party helper, including pages without a form.
- All 28 existing submit handlers attach attribution to the same FormData sent to the existing provider.
- Existing conversion event names and labels remain intact. The exit form and three project forms now also emit form_submit_success after provider acceptance.
- Success analytics failures are contained so that unavailable or throwing analytics cannot interrupt the existing autoresponder or successful UI.
- Existing provider URL, routing fields, subjects, confirmation content, EmailJS templates and watchdog behavior remain unchanged.

## Attribution scope

This is the first captured arrival in a browser tab during a fixed 30-minute window. It is not a lifetime first acquisition or a complete sales attribution system. A later tagged campaign during that window does not replace or mix with the original tuple. After expiry, the next page visit or form submission starts a new window. Reloads and same-tab navigation retain the first arrival when session storage works.

Storage is sessionStorage, with an in-memory page fallback when reads or writes fail. Expired records are rejected at use and replaced; a dormant tab may retain unused expired JSON until next use or tab closure. Browser-restored tabs and new tabs opened with an opener can follow the browser's own session-storage behavior.

| Submitted field | Meaning |
| --- | --- |
| lead_attribution_scope | same_tab_first_touch_30_minutes |
| lead_tab_first_source | Safe utm_source, external referrer hostname, or explicit unknown label |
| lead_tab_first_medium | Safe utm_medium, referral, exact known AI referral, or explicit unknown label |
| lead_tab_first_campaign | Safe utm_campaign slug, otherwise empty |
| lead_tab_first_landing_path | First landing pathname only |
| lead_tab_first_referrer_host | External referrer hostname only |
| lead_submission_path | Pathname containing the submitted form |

Campaign values must be short slugs using letters, numbers, underscores, dots or hyphens, at most 80 characters, without seven consecutive digits. Email addresses, markup, phone-like strings and URL values fail validation. Campaign owners must still avoid putting personal details in campaign names. No term/content tags, arbitrary query parameters, click IDs, fragments, full referrer URLs, contact fields or visitor identifiers are copied into attribution storage. Contact details remain in the existing form payload and autoresponder only.

Exact referral hosts chatgpt.com, chat.openai.com, claude.ai and gemini.google.com use ai_referral. Similar-looking hosts do not. Missing referrer and absent tags produce direct_or_unknown, not an invented AI source. Campaign tags are declared metadata, not independently verified proof of acquisition. All client-side fields can be modified by visitors; never use them for routing, authorization or billing.

## Known limits

- Existing noncanonical legacy redirects can discard query parameters before the canonical page loads. This change leaves those redirects intact; use canonical URLs in campaigns.
- A person can discover the company in AI, then search Google or call directly. That journey is not recoverable from browser tags alone. The existing lead ledger can record a separately reported first discovery source.
- Form success means the provider accepted the payload. It does not prove inbox delivery, reply delivery, a qualified opportunity or a signed project. The existing watchdog and lead ledger remain necessary.
- Missing helper, blocked storage and analytics failure preserve lead delivery, but can reduce attribution or analytics completeness.

## Verification

- tools/test-lead-attribution.cjs runs 17 pure JavaScript cases for referral classification, privacy, fixed expiry, navigation, storage faults and tampering.
- tools/test-lead-forms.cjs runs actual handlers in headless Chrome with every external request blocked and Web3Forms, EmailJS and analytics mocked. It covers all 28 handlers for success, throwing analytics, provider rejection, network failure and retry; also storage failures, multi-page navigation, optional phone, native validation and JavaScript generator output.
- The Python area generator was rendered in a temporary fixture and checked for helper, payload integration and preserved area labels.
- Existing tools/audit.py --local and tools/perf.py --local were run before and after. Both audits returned 0 critical/high issues and 0 broken internal links. The existing 4 medium title-length findings and 1 low description-length finding remain. Worst reported first load changed from 1.07 MB to 1.08 MB; the helper is about 4.1 KB before compression.
- No real forms, emails, paid calls or campaigns were sent by these tests. No commit, push or publication was performed.

Run the attribution tests with Node. Browser tests need a locally installed Playwright and Chrome; PLAYWRIGHT_MODULE and CHROME_PATH can point to existing installations. Browser tests start and close their own server bound to 127.0.0.1 and do not use a personal browser profile.
