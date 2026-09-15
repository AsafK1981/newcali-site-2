/* Run with a locally installed Playwright. All external requests are blocked.
 * PLAYWRIGHT_MODULE may point to an existing Playwright installation.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const KEY = 'newcali.leadTabFirst.v1';
const read = rel => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const paths = [...read('sitemap.xml').matchAll(/<loc>https:\/\/www.newcaliconstruction.com([^<]*)<\/loc>/g)].map(m => m[1]);
const fileFor = url => url.replace(/^\//, '') + (url.endsWith('/') ? 'index.html' : '');
const forms = paths.flatMap(url => [...read(fileFor(url)).matchAll(/<form\b[^>]*onsubmit="(\w+)\(event\)"/g)].map(m => ({ url, handler: m[1] })));
const EXPECTED = 28;
let count = 0;
function passed(label) { count++; console.log('PASS ' + label); }
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const filename = path.resolve(ROOT, '.' + pathname, pathname.endsWith('/') ? 'index.html' : '');
  if (!filename.startsWith(ROOT + path.sep)) { res.writeHead(403).end(); return; }
  try {
    const type = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.xml': 'text/xml' }[path.extname(filename)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type }); res.end(fs.readFileSync(filename));
  } catch { res.writeHead(404).end(); }
});

(async function () {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
  try {
    assert.equal(forms.length, EXPECTED);
    for (const url of paths) assert.equal((read(fileFor(url)).match(/src="\/js\/lead-attribution.js"/g) || []).length, 1, url);
    passed('all 38 canonical pages load one helper; 28 submit handlers inventoried');

    async function pageAt(url, options = {}) {
      const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      await page.route('**/*', route => {
        const request = route.request();
        if (!request.url().startsWith(base + '/') || ['image', 'media', 'font'].includes(request.resourceType()) || (options.missingHelper && request.url().endsWith('/js/lead-attribution.js'))) return route.abort();
        return route.continue();
      });
      await page.addInitScript(({ storage, key, tampered }) => {
        window.testResponses = []; window.testCalls = []; window.testEvents = []; window.testAlerts = [];
        window.alert = text => window.testAlerts.push(text);
        window.emailjs = { init() {}, send(...args) { window.testResponses.push(args); return Promise.resolve({}); } };
        window.fetch = async function (url, opts) {
          if (url !== 'https://api.web3forms.com/submit') throw new Error('Unexpected request: ' + url);
          window.testCalls.push({ url, method: opts.method, payload: Object.fromEntries(opts.body.entries()) });
          if (window.testTransport === 'throw') throw new Error('Network unavailable');
          return { json: async () => ({ success: window.testTransport !== 'reject' }) };
        };
        if (storage === 'throw') Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage disabled'); } });
        if (storage === 'missing') Object.defineProperty(window, 'sessionStorage', { value: undefined });
        if (tampered) sessionStorage.setItem(key, tampered);
      }, { storage: options.storage, key: KEY, tampered: options.tampered });
      await page.goto(base + url, { waitUntil: 'domcontentloaded' });
      await page.evaluate(mode => {
        window.gtag = mode === 'missing' ? undefined : mode === 'throw' ? function () { throw new Error('Analytics failure'); } : (...args) => window.testEvents.push(args);
      }, options.analytics);
      return { page, context };
    }

    async function submit(page, handler, phone = '') {
      return page.evaluate(({ handler, phone }) => {
        const form = document.querySelector('form[onsubmit="' + handler + '(event)"]');
        const fields = { first_name: 'Test', last_name: 'Visitor', name: 'Test Visitor', email: 'test@example.invalid', phone };
        for (const [name, value] of Object.entries(fields)) {
          const input = form.querySelector('[name="' + name + '"]');
          if (input) input.value = value;
        }
        const baseline = Object.fromEntries(new FormData(form));
        return window[handler]({ preventDefault() {}, target: form }).then(() => baseline);
      }, { handler, phone });
    }

    for (const form of forms) {
      // Exercise the actual page handler twice, including a failed analytics SDK.
      for (const analytics of ['ok', 'throw']) {
        const { page, context } = await pageAt(form.url + '?utm_source=google&utm_medium=cpc&utm_campaign=kitchen-westside', { analytics });
        const baseline = await submit(page, form.handler, '+1 (310) 555-0123');
        const state = await page.evaluate(() => ({ calls: testCalls, replies: testResponses, events: testEvents, alerts: testAlerts, success: document.querySelector('#formOk')?.style.display === 'block' || document.querySelector('#exitPopup')?.innerHTML.includes("We'll be in touch soon.") }));
        assert.equal(state.calls.length, 1, form.url);
        const payload = state.calls[0].payload;
        for (const [key, value] of Object.entries(baseline)) assert.equal(payload[key], value, form.url + ' preserves ' + key);
        assert.equal(payload.lead_tab_first_source, 'google');
        assert.equal(payload.lead_tab_first_medium, 'cpc');
        assert.equal(payload.lead_tab_first_campaign, 'kitchen-westside');
        assert.equal(payload.lead_tab_first_landing_path, form.url);
        assert.equal(payload.lead_submission_path, form.url);
        assert.equal(payload.lead_attribution_scope, 'same_tab_first_touch_30_minutes');
        assert.equal(state.replies.length, 1, 'autoresponder on ' + form.url);
        assert.equal(state.replies[0][0], 'service_eql2h4h');
        assert.equal(state.replies[0][1], 'template_blfuq5c');
        assert.equal(state.replies[0][2].email, baseline.email);
        assert.equal(state.alerts.length, 0);
        assert.ok(state.success, form.url + ' successful UI');
        if (analytics === 'ok') {
          const success = state.events.filter(event => event[1] === 'form_submit_success');
          assert.equal(success.length, 1, form.url + ' exactly one conversion');
          assert.equal(success[0][2].event_category, 'conversion');
          if (form.handler === 'submitExit') assert.equal(success[0][2].event_label, 'exit_form');
          if (form.url === '/fire-rebuild.html') assert.equal(success[0][2].event_label, 'contact_form_fire_rebuild');
        }
        await context.close();
      }
    }
    passed('all 28 actual handlers preserve provider fields, add attribution, confirm once, and send autoresponder even when GA throws');

    for (const transport of ['reject', 'throw']) {
      for (const form of forms) {
        const { page, context } = await pageAt(form.url);
        await page.evaluate(value => { window.testTransport = value; }, transport);
        await submit(page, form.handler);
        assert.deepEqual(await page.evaluate(handler => ({ replies: testResponses.length, conversions: testEvents.filter(e => e[1] === 'form_submit_success').length, disabled: document.querySelector('form[onsubmit="' + handler + '(event)"] button[type="submit"]').disabled }), form.handler), { replies: 0, conversions: 0, disabled: false });
        await page.evaluate(() => { window.testTransport = 'success'; });
        await submit(page, form.handler);
        assert.equal(await page.evaluate(() => testResponses.length), 1);
        await context.close();
      }
    }
    passed('all 28 forms handle provider rejection and network failure without conversions; retry succeeds');

    for (const options of [{ storage: 'throw', analytics: 'missing' }, { storage: 'missing' }, { tampered: '{broken' }, { missingHelper: true }]) {
      const { page, context } = await pageAt('/', options);
      await submit(page, 'submitForm');
      assert.equal(await page.evaluate(() => testResponses.length), 1);
      assert.equal(await page.evaluate(() => testAlerts.length), 0);
      await context.close();
    }
    passed('blocked/missing/corrupt storage, missing analytics and unavailable helper never block delivery');

    const { page, context } = await pageAt('/blog/?utm_source=chatgpt&utm_medium=referral&utm_campaign=westside&email=private%40example.com&gclid=private-click#private');
    await page.goto(base + '/portfolio.html?utm_source=google&utm_medium=cpc&utm_campaign=later');
    await page.goto(base + '/?utm_medium=email&utm_campaign=third');
    await submit(page, 'submitForm');
    let payload = await page.evaluate(() => testCalls[0].payload);
    assert.equal(payload.lead_tab_first_source, 'chatgpt');
    assert.equal(payload.lead_tab_first_medium, 'referral');
    assert.equal(payload.lead_tab_first_campaign, 'westside');
    assert.equal(payload.lead_tab_first_landing_path, '/blog/');
    assert.equal(payload.lead_submission_path, '/');
    assert.ok(!JSON.stringify(payload).includes('private'));
    assert.ok(!JSON.stringify(await page.evaluate(key => sessionStorage.getItem(key), KEY)).includes('private'));
    await context.close();
    passed('blog -> portfolio -> form retains one first-touch tuple and drops unrelated query, click IDs and fragments');

    for (const [query, source, medium, campaign] of [
      ['?utm_campaign=westside', 'tagged_unknown', 'unspecified', 'westside'],
      ['?utm_source=person%40example.com&utm_medium=1234567890&utm_campaign=%3Cscript%3E', 'direct_or_unknown', 'none', ''],
      ['', 'direct_or_unknown', 'none', '']
    ]) {
      const fixture = await pageAt('/' + query);
      await submit(fixture.page, 'submitForm');
      payload = await fixture.page.evaluate(() => testCalls[0].payload);
      assert.equal(payload.lead_tab_first_source, source);
      assert.equal(payload.lead_tab_first_medium, medium);
      assert.equal(payload.lead_tab_first_campaign, campaign);
      await fixture.context.close();
    }
    passed('partial campaigns stay coherent; email/phone/markup tags rejected; unknown stays unknown');

    for (const bad of [
      { source: 'person@example.com' }, { landing: '/?email=private' }, { referrer: 'https://claude.ai/private?query=x' },
      { started: Date.now() + 100000 }, { started: Date.now() - 31 * 60 * 1000 }
    ]) {
      const stored = { version: 1, started: Date.now(), landing: '/blog/', referrer: '', source: 'old', medium: 'cpc', campaign: 'old', ...bad };
      const fixture = await pageAt('/?utm_source=new&utm_medium=email', { tampered: JSON.stringify(stored) });
      await submit(fixture.page, 'submitForm');
      const value = await fixture.page.evaluate(() => testCalls[0].payload);
      assert.equal(value.lead_tab_first_source, 'new');
      assert.equal(value.lead_tab_first_medium, 'email');
      assert.equal(value.lead_tab_first_campaign, '');
      assert.equal(value.lead_tab_first_landing_path, '/');
      await fixture.context.close();
    }
    passed('tampered, expired and future storage discarded without mixing campaigns');

    const phone = await pageAt('/');
    assert.deepEqual(await phone.page.locator('#phone').evaluate(input => ({ type: input.type, required: input.required, autocomplete: input.autocomplete })), { type: 'tel', required: false, autocomplete: 'tel' });
    await phone.page.evaluate(() => document.querySelector('#contactForm').requestSubmit());
    assert.equal(await phone.page.evaluate(() => testCalls.length), 0, 'native required validation');
    await phone.page.fill('#fn', 'Test'); await phone.page.fill('#em', 'invalid');
    await phone.page.evaluate(() => document.querySelector('#contactForm').requestSubmit());
    assert.equal(await phone.page.evaluate(() => testCalls.length), 0, 'native email validation');
    await phone.page.fill('#em', 'test@example.invalid');
    await phone.page.evaluate(() => document.querySelector('#contactForm').requestSubmit());
    await phone.page.waitForFunction(() => testResponses.length === 1);
    assert.equal(await phone.page.evaluate(() => testCalls[0].payload.phone), '');
    await phone.context.close();
    passed('phone optional with native required/email validation preserved');

    // Generate only in a temporary sandbox. Never rewrite checked-in marketing copy.
    const generated = fs.mkdtempSync(path.join(os.tmpdir(), 'newcali-leads-'));
    fs.mkdirSync(path.join(generated, 'tools'));
    for (const name of ['build-area-pages.mjs', 'build-fire-rebuild-page.mjs', 'area-template.html', 'build-area-page.py']) fs.copyFileSync(path.join(ROOT, 'tools', name), path.join(generated, 'tools', name));
    fs.copyFileSync(path.join(ROOT, 'kitchen.html'), path.join(generated, 'kitchen.html'));
    for (const name of ['build-area-pages.mjs', 'build-fire-rebuild-page.mjs']) execFileSync(process.execPath, [path.join(generated, 'tools', name)], { stdio: 'pipe' });
    const generatedPages = ['fire-rebuild.html', 'areas/index.html', ...fs.readdirSync(path.join(generated, 'areas')).filter(s => s !== 'index.html').map(s => 'areas/' + s + '/index.html')];
    for (const rel of generatedPages) {
      const html = fs.readFileSync(path.join(generated, rel), 'utf8');
      assert.equal((html.match(/src="\/js\/lead-attribution.js"/g) || []).length, 1, rel);
      assert.equal((html.match(/newCaliLead\.attach\(data\)/g) || []).length, (html.match(/new FormData\(e.target\)/g) || []).length, rel);
      const expectedLabel = rel === 'fire-rebuild.html' ? 'contact_form_fire_rebuild' : 'contact_form_' + rel.split('/')[1];
      if (rel !== 'areas/index.html') assert.ok(html.includes("'event_label':'" + expectedLabel + "'"), rel);
    }
    assert.ok(read('tools/area-template.html').includes('newCaliLead.attach(data)'));
    passed('both active generators preserve helper, payload integration and fire/area conversion labels');
    console.log('SUCCESS: ' + count + ' regression groups; zero real provider calls. Generator fixtures: ' + generated);
  } finally { await browser.close(); server.close(); }
}()).catch(err => { console.error(err); server.close(); process.exitCode = 1; });
