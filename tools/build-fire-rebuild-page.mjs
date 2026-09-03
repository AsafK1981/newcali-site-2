/**
 * Builds /fire-rebuild.html - the Fire Rebuild & Smoke Damage Restoration service page.
 *
 *   node tools/build-fire-rebuild-page.mjs
 *
 * It clones the chrome from kitchen.html (inline CSS, nav, footer, WhatsApp float,
 * accessibility widget, form-submit script) so this page stays pixel-identical to the
 * other service pages, then swaps in its own head metadata, JSON-LD and body content.
 * Re-run after editing kitchen.html's shared chrome.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.newcaliconstruction.com';
const SRC = readFileSync(join(ROOT, 'kitchen.html'), 'utf8');

const TITLE = 'Fire Rebuild & Smoke Damage Restoration Los Angeles | New Cali Construction';
const DESC = 'Ground-up fire rebuilds and smoke, soot and heat damage renovation across LA and the Westside. Insurance scope review, permits, design-build. Lic #1008892.';
const URL = `${SITE}/fire-rebuild.html`;
const OGIMG = `${SITE}/images/home-remodel/home-remodel-1.jpg`;

const FAQS = [
  {
    q: 'Do you do full ground-up rebuilds after a fire?',
    a: 'Yes. New Cali Construction is a licensed design-build general contractor (California License #1008892) and we take total-loss rebuilds end to end - reviewing your insurance scope of loss, coordinating the architect and engineer, soils and utilities, permitting, and the build through final inspection. One contract, one company accountable for the schedule, instead of you coordinating five separate trades from wherever you are living now.'
  },
  {
    q: 'My house survived but smells of smoke. Can that be fixed?',
    a: 'Usually, but not with paint. Soot and odour settle into insulation, ductwork, attic spaces and wall cavities, and sealing or repainting over it fails within months. We assess what actually has to be removed and replaced, do that work, and scope it in writing so it lines up with what your insurer has agreed to cover.'
  },
  {
    q: 'Will my insurance payout cover the full rebuild?',
    a: 'Often not by itself, and that gap is the single most common reason a rebuild budget breaks. Insurance settles on what you lost; the city permits what current code requires. Fire-zone exterior materials, updated energy and electrical standards and sprinkler requirements can all be required now and were not covered then. We identify that difference in writing at estimate stage so you are negotiating a known number instead of discovering one in month four.'
  },
  {
    q: 'How much does a fire rebuild cost?',
    a: 'We do not publish a per-square-foot figure, because it moves too much to be useful - slope, street access, fire-zone assemblies and how much of the lot’s utilities survived all change it materially. We walk the lot, read your insurance scope, and give you a written line-item price rather than a wide range designed to win the job and get revised later.'
  },
  {
    q: 'How long does a rebuild take?',
    a: 'Permitting is usually the longest and least predictable phase, and it varies with which pathway your property qualifies for. Construction on a single-family rebuild typically runs several months once permits are issued. We give you a realistic schedule up front and tell you plainly which parts of it we control and which we do not.'
  },
  {
    q: 'Can I build an ADU on the lot while the main house is rebuilt?',
    a: 'Often yes, and it is one of the more practical moves available: a permitted ADU can be the first structure back on the lot and it stays valuable once the main house is finished. Rules for ADUs on fire-affected parcels have been handled differently from a standard build and have changed more than once, so we confirm what currently applies to your address before design.'
  }
];

const head = `<title>${TITLE}</title>
<meta name="description" content="${DESC}">
<link rel="canonical" href="${URL}">
<meta property="og:type" content="website">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${URL}">
<meta property="og:image" content="${OGIMG}">
<meta property="og:site_name" content="New Cali Construction">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${TITLE}">
<meta name="twitter:description" content="${DESC}">`;

const ldBreadcrumb = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
    { '@type': 'ListItem', position: 2, name: 'Fire Rebuild & Smoke Damage Restoration', item: URL }
  ]
}, null, 2);

const ldFaq = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a }
  }))
}, null, 2);

const ldService = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Fire Rebuild & Smoke Damage Restoration',
  serviceType: 'Fire damage rebuilding and restoration',
  description: 'Ground-up rebuilding of fire-destroyed homes and renovation of homes damaged by smoke, soot and heat, across Los Angeles and the Westside. Design-build service covering insurance scope review, architect and engineer coordination, soils and utilities, permitting, wildfire construction standards, and construction through final inspection. Every project starts with a written line-item scope and a locked price.',
  provider: {
    '@type': 'GeneralContractor',
    name: 'New Cali Construction Inc.',
    telephone: '+18002161005',
    email: 'Info@NewCaliConstruction.com',
    url: `${SITE}/`,
    areaServed: 'Culver City, Los Angeles, CA'
  },
  areaServed: [
    { '@type': 'City', name: 'Pacific Palisades' },
    { '@type': 'City', name: 'Malibu' },
    { '@type': 'City', name: 'Los Angeles' },
    { '@type': 'City', name: 'Culver City' },
    { '@type': 'City', name: 'Bel Air' }
  ],
  audience: { '@type': 'Audience', audienceType: 'Homeowners rebuilding or repairing after a wildfire' },
  url: URL
}, null, 2);

const body = `<section class="svc-hero" style="background-image:url('images/home-remodel/home-remodel-1.jpg')">
  <div class="svc-hero-inner">
    <a href="index.html" class="back-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
      Back to Home
    </a>
    <h1>Fire Rebuild &amp; Smoke Damage Restoration</h1>
    <p>Rebuilding what burned, and repairing what didn't. One licensed design-build contractor from insurance scope to final inspection.</p>
    <a href="#contact" class="btn-green" style="font-size:14px;padding:14px 32px;">Talk to Us About Your Property →</a>
  </div>
</section>

<div class="svc-content">

  <div class="svc-intro">
    <div class="svc-intro-text">
      <h2>Two Very Different Jobs<br><em>Under One Contract</em></h2>
      <p>After a fire there are two kinds of property, and they need two different contractors' worth of thinking. There is the lot where the house is gone and everything has to be built again from the ground. And there is the house still standing that took smoke, soot and heat - damage that hides in insulation, ductwork, attic voids and wall cavities, and that comes straight back through any cosmetic work laid over the top of it.</p>
      <p>We do both. What does not change between them is how we run the job: we read your insurance scope of loss against what the city will actually require you to build, we put the difference in writing before you commit to anything, and then one company carries the project through permitting, construction and final inspection. Written line-item scope. Locked price. Weekly photo updates, so you are never driving out to see whether anyone showed up.</p>
      <a href="#contact" class="btn-green" style="margin-top:8px;display:inline-flex;">Get a Free Assessment →</a>
    </div>
  </div>

  <div class="svc-includes">
    <h3>What's Included</h3>
    <ul>
      <li><strong>Insurance Scope Review:</strong> We read the carrier's scope of loss against current code requirements and show you the gap in writing - before it becomes a change order.</li>
<li><strong>Design, Engineering &amp; Permits:</strong> Architect and engineer coordination, soils and utilities, and the full permit submittal, including expedited rebuild pathways where your property qualifies for one.</li>
<li><strong>Ground-Up Construction:</strong> Foundation, framing, systems, exterior assemblies and finishes - one contract and one company accountable for the schedule.</li>
<li><strong>Smoke, Soot &amp; Heat Damage Renovation:</strong> Removing and replacing what is actually contaminated rather than sealing over it, so the odour and staining do not return.</li>
<li><strong>Wildfire Construction Standards:</strong> Ignition-resistant exteriors, ember-resistant vents and rated glazing where code requires them - priced in from day one, not discovered at inspection.</li>
    </ul>
  </div>

  <div class="svc-gallery">
    <h2>We Build Structure, Not Just Finishes</h2>
    <div class="svc-gallery-grid">
      <img width="1600" height="1200" src="images/home-remodel/home-remodel-8.jpg" alt="Structural framing on a New Cali Construction build">
<img width="1600" height="1200" loading="lazy" src="images/home-remodel/home-remodel-10.jpg" alt="Framing and structural work by New Cali Construction">
<img width="1600" height="1200" loading="lazy" src="images/home-remodel/home-remodel-6.jpg" alt="Interior construction in progress by New Cali Construction">
<img width="1600" height="1200" loading="lazy" src="images/home-remodel/home-remodel-1.jpg" alt="Completed home by New Cali Construction">
    </div>
  </div>

  <div class="svc-why">
    <h2>How a Rebuild Runs With Us</h2>
    <div class="svc-why-grid">
      <div class="svc-why-card"><h4>1. We Walk the Property</h4><p>No quotes off a photo and a phone call. We see the lot or the house, and we look at what the fire actually did.</p></div>
<div class="svc-why-card"><h4>2. We Read Your Insurance Scope</h4><p>We compare what your carrier agreed to pay for against what plan check will require you to build, and we show you the difference in writing.</p></div>
<div class="svc-why-card"><h4>3. You Get a Line-Item Price</h4><p>Not a range. A written, itemized scope with a locked price, so you know what you are signing before anyone breaks ground.</p></div>
<div class="svc-why-card"><h4>4. Design, Engineering &amp; Permits</h4><p>Architect, engineer, soils, utilities and the permit submittal - handled by us, tracked by us, with honest updates on where it stands.</p></div>
<div class="svc-why-card"><h4>5. We Build It</h4><p>Foundation through final inspection with our own crews and long-standing subs, and weekly photo updates the whole way.</p></div>
<div class="svc-why-card"><h4>6. We Stand Behind It</h4><p>Every project carries a warranty and our commitment long after the last inspection is signed off.</p></div>
    </div>
  </div>

  <!-- FAQ -->
  <div class="svc-faq">
    <div style="text-align:center;margin-bottom:40px;">
      <p class="eyebrow">Common Questions</p>
      <h2 style="font-family:'Merriweather',serif;font-size:clamp(24px,3vw,36px);font-weight:700;color:var(--text);margin-bottom:8px;line-height:1.25;">Frequently Asked <em style="color:var(--green);font-style:italic;font-weight:400;">Questions</em></h2>
    </div>
    <div class="faq-list">
${FAQS.map(f => `      <div class="faq-item"><h3 class="faq-q">${f.q}</h3><p class="faq-a">${f.a}</p></div>`).join('\n')}
    </div>
  </div>

  <!-- Pricing note -->
  <section class="svc-pricing">
    <div class="svc-pricing-inner">
      <div class="svc-pricing-hdr">
        <p class="svc-pricing-eyebrow">Transparent Pricing</p>
        <h2 class="svc-pricing-title">What a Rebuild <em>Costs</em></h2>
        <p class="svc-pricing-sub">We are not going to put a per-square-foot number on this page. On a fire rebuild it would be close to meaningless - slope, street access, fire-zone assemblies and how much of the lot's utilities survived move the figure more than the square footage does.</p>
      </div>
      <div class="svc-why-grid" style="max-width:900px;margin:0 auto">
        <div class="svc-why-card"><h4>What we do instead</h4><p>Walk the property, read your insurance scope of loss, and come back with a written line-item price you can actually check line by line.</p></div>
        <div class="svc-why-card"><h4>What breaks most budgets</h4><p>The gap between what insurance settled on and what current code requires. We put that number in front of you at estimate stage, not in month four.</p></div>
        <div class="svc-why-card"><h4>What stays fixed</h4><p>The price is locked in writing before work begins. Scope changes need your signed approval, and overages on locked items are ours, not yours.</p></div>
      </div>
      <p class="svc-pricing-foot"><strong>Free assessments always.</strong> For remodel and ADU pricing ranges, see our <a href="index.html#pricing" style="color:var(--green-dk);font-weight:600">standard project tiers</a>.</p>
    </div>
  </section>

  <script type="application/ld+json">
${ldService}
  </script>

  <!-- Guarantee -->
  <section class="svc-guarantee">
    <div class="svc-guarantee-inner">
      <div class="svc-guarantee-hdr">
        <p class="svc-guarantee-eyebrow">The New Cali Promise</p>
        <h2 class="svc-guarantee-title">Our Guarantee <em>to You</em></h2>
        <p class="svc-guarantee-sub">You have already been let down by something outside your control. Every promise below is in writing.</p>
      </div>
      <div class="svc-guarantee-cards">
        <div class="svc-guarantee-card">
          <span class="svc-guarantee-num">01</span>
          <div class="svc-guarantee-icon-wrap"><svg width="24" height="24" viewBox="0 0 40 40" fill="none"><rect x="4" y="7" width="32" height="29" rx="3" stroke="#2c5f33" stroke-width="1.8"/><path d="M4 15h32" stroke="#2c5f33" stroke-width="1.8"/><path d="M13 4v6M27 4v6" stroke="#2c5f33" stroke-width="1.8" stroke-linecap="round"/><path d="M13 25l5 5 9-9" stroke="#2c5f33" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div class="svc-guarantee-body">
            <h3>We Show Up Day 1</h3>
            <p>If we don't show up on the agreed start date, you owe us nothing. No deposit held, no questions asked.</p>
          </div>
        </div>
        <div class="svc-guarantee-card">
          <span class="svc-guarantee-num">02</span>
          <div class="svc-guarantee-icon-wrap"><svg width="24" height="24" viewBox="0 0 40 40" fill="none"><path d="M8 4h17l9 9v23H8V4z" stroke="#2c5f33" stroke-width="1.8" stroke-linejoin="round"/><path d="M25 4v9h9" stroke="#2c5f33" stroke-width="1.8" stroke-linejoin="round"/><path d="M13 19h14M13 25h10M13 31h7" stroke="#2c5f33" stroke-width="1.8" stroke-linecap="round"/></svg></div>
          <div class="svc-guarantee-body">
            <h3>Written Scope Before We Touch Anything</h3>
            <p>Every project starts with a detailed, line-item scope of work - signed by both parties before a single nail is driven.</p>
          </div>
        </div>
        <div class="svc-guarantee-card">
          <span class="svc-guarantee-num">03</span>
          <div class="svc-guarantee-icon-wrap"><svg width="24" height="24" viewBox="0 0 40 40" fill="none"><rect x="3" y="11" width="34" height="24" rx="3" stroke="#2c5f33" stroke-width="1.8"/><circle cx="20" cy="23" r="6.5" stroke="#2c5f33" stroke-width="1.8"/><path d="M14 11l3-5h6l3 5" stroke="#2c5f33" stroke-width="1.8" stroke-linejoin="round"/><circle cx="30" cy="17" r="2" fill="#2c5f33"/></svg></div>
          <div class="svc-guarantee-body">
            <h3>Weekly Photo Updates</h3>
            <p>You'll never be left wondering what's happening. We send progress photos every week - so you're always in the loop.</p>
          </div>
        </div>
        <div class="svc-guarantee-card">
          <span class="svc-guarantee-num">04</span>
          <div class="svc-guarantee-icon-wrap"><svg width="24" height="24" viewBox="0 0 40 40" fill="none"><path d="M20 4L6 10v13c0 9 6.3 15 14 16.5C27.7 38 34 32 34 23V10L20 4z" stroke="#2c5f33" stroke-width="1.8" stroke-linejoin="round"/><path d="M13 21l5 5 9-9" stroke="#2c5f33" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
          <div class="svc-guarantee-body">
            <h3>On-Time, On-Budget - Or We Make It Right</h3>
            <p>No surprise invoices. No scope creep without your approval. If we go over on a locked item, that's on us - not you.</p>
          </div>
        </div>
      </div>
      <div class="svc-guarantee-footer">
        <span class="svc-guarantee-footer-line"></span>
        <span class="svc-guarantee-footer-txt">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3 3 7-7" stroke="#2c5f33" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Every promise is in writing
        </span>
        <span class="svc-guarantee-footer-line"></span>
      </div>
    </div>
  </section>

  <!-- Contact Form -->
<div id="contact" style="background:var(--off);padding:70px 60px;">
  <div style="max-width:680px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:36px;">
      <p class="eyebrow">Get in Touch</p>
      <h2 style="font-family:'Merriweather',serif;font-size:clamp(26px,3vw,38px);font-weight:700;color:var(--text);margin-bottom:12px;">Tell Us About <em style="color:var(--green);font-style:italic;">Your Property</em></h2>
      <p style="font-size:15px;color:var(--muted);font-weight:300;">Free assessment on site. No pressure - just a straight read on what your property needs and what it will take.</p>
    </div>
    <div class="cform-box" id="cform" style="background:white;">
      <form id="contactForm" onsubmit="submitForm(event)">
        <input type="hidden" name="access_key" value="3f2d97e0-cedd-4b40-9bfc-72cab8332e94">
        <input type="hidden" name="subject" value="New Lead (Fire Rebuild) - New Cali Construction Website">
        <input type="hidden" name="service_line" value="Fire Rebuild / Smoke Damage">
        <div class="form-row">
          <div class="fg"><label>First Name</label><input type="text" name="first_name" id="fn" placeholder="John" required></div>
          <div class="fg"><label>Last Name</label><input type="text" name="last_name" placeholder="Smith"></div>
        </div>
        <div class="fg"><label>Email</label><input type="email" name="email" id="em" placeholder="john@email.com" required></div>
        <div class="fg"><label>Phone</label><input type="tel" name="phone" placeholder="(310) 555-0000"></div>
        <div class="fg"><label>Property ZIP Code</label><input type="text" name="zip" inputmode="numeric" placeholder="90272"></div>
        <div class="fg">
          <label>What is the situation?</label>
          <select name="project" id="proj">
            <option value="">Choose an option</option>
            <option>Ground-Up Rebuild (total loss)</option>
            <option>Smoke / Heat Damage Renovation</option>
            <option>ADU on a fire-affected lot</option>
            <option>Not sure yet - need an assessment</option>
            <option>Other</option>
          </select>
        </div>
        <div class="fg"><label>Message</label><textarea name="message" placeholder="Tell us about the property, and where you are with your insurance claim if that's relevant..."></textarea></div>
        <button type="submit" class="form-btn">Send Message</button>
      </form>
    </div>
    <div class="form-ok" id="formOk" style="display:none;text-align:center;padding:44px 20px;">
      <div style="font-size:44px;margin-bottom:12px">✅</div>
      <h4 style="font-family:Merriweather,serif;font-size:20px;color:var(--green-dk);margin-bottom:6px;">Thanks for reaching out!</h4>
      <p style="color:var(--muted);font-size:14px;margin-bottom:18px;">We received your message and will get back to you within a few hours - weekdays and weekends.</p>
      <p style="font-size:13px;color:var(--muted);margin-bottom:14px;">Want a faster response?</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="tel:8002161005" style="display:inline-flex;align-items:center;gap:8px;padding:11px 22px;background:var(--green);color:white;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">📞 (800) 216-1005</a>
        <a href="https://wa.me/17149289011" target="_blank" style="display:inline-flex;align-items:center;gap:8px;padding:11px 22px;background:#25D366;color:white;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">💬 WhatsApp Us</a>
      </div>
    </div>
  </div>
</div>

</div>

`;

/* ------------------------------------------------------------------ build - */

function replaceBetween(src, startMarker, endMarker, replacement, label) {
  const a = src.indexOf(startMarker);
  const b = src.indexOf(endMarker, a + 1);
  if (a === -1 || b === -1) throw new Error(`marker not found: ${label}`);
  return src.slice(0, a) + replacement + src.slice(b);
}

let out = SRC;

// 1. head metadata (title .. twitter:description block)
out = replaceBetween(out, '<title>', '<link href="https://fonts.googleapis.com', head + '\n', 'head meta');

// 2. breadcrumb + business + FAQ JSON-LD -> keep the LocalBusiness block, swap the other two
const ldBlocks = [...out.matchAll(/<script type="application\/ld\+json">\n([\s\S]*?)\n<\/script>/g)];
if (ldBlocks.length < 3) throw new Error('expected 3 head JSON-LD blocks');
out = out.replace(ldBlocks[0][0], `<script type="application/ld+json">\n${ldBreadcrumb}\n</script>`);
out = out.replace(ldBlocks[2][0], `<script type="application/ld+json">\n${ldFaq}\n</script>`);

// 3. body: hero through end of .svc-content
out = replaceBetween(out, '<section class="svc-hero">', '<footer>', body, 'body');

// 4. footer: ensure the new service link is present exactly once
//    (kitchen.html already carries it site-wide; only add it if that ever changes)
if (!out.includes('<a href="fire-rebuild.html">')) {
  out = out.replace(
    '      <a href="home-remodel.html">Home Remodel</a>',
    '      <a href="home-remodel.html">Home Remodel</a>\n      <a href="fire-rebuild.html">Fire Rebuild &amp; Smoke Damage</a>'
  );
}

// 5. GA conversion label
out = out.replace("'event_label':'contact_form'", "'event_label':'contact_form_fire_rebuild'");

writeFileSync(join(ROOT, 'fire-rebuild.html'), out, 'utf8');
console.log('wrote fire-rebuild.html');
