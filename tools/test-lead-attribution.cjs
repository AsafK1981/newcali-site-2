const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const code = fs.readFileSync(path.join(__dirname, '../js/lead-attribution.js'), 'utf8');
const KEY = 'newcali.leadTabFirst.v1';
let count = 0;
function load({ referrer = '', query = '', pathname = '/', now = 1800000000000, storage = new Map(), failRead = false, failWrite = false } = {}) {
  const clock = { now };
  const context = {
    window: {}, URL, URLSearchParams, Number,
    Date: { now: () => clock.now },
    document: { referrer },
    location: { hostname: 'www.newcaliconstruction.com', pathname, search: query },
    sessionStorage: {
      getItem(key) { if (failRead) throw new Error('blocked'); return storage.get(key) || null; },
      setItem(key, value) { if (failWrite) throw new Error('quota'); storage.set(key, value); }
    }
  };
  vm.runInNewContext(code, context);
  return { storage, context, clock, payload() { const data = new Map(); context.window.newCaliLead.attach(data); return Object.fromEntries(data); } };
}
for (const [referrer, source, medium, host] of [
  ['https://chatgpt.com/c/private?email=person@example.com#fragment', 'chatgpt.com', 'ai_referral', 'chatgpt.com'],
  ['https://chat.openai.com/c/private', 'chat.openai.com', 'ai_referral', 'chat.openai.com'],
  ['https://claude.ai/chat/private', 'claude.ai', 'ai_referral', 'claude.ai'],
  ['https://gemini.google.com/app/private', 'gemini.google.com', 'ai_referral', 'gemini.google.com'],
  ['https://claude.ai.evil.example/chat', 'claude.ai.evil.example', 'referral', 'claude.ai.evil.example'],
  ['https://www.google.com/search?q=private', 'www.google.com', 'referral', 'www.google.com'],
  ['https://newcaliconstruction.com/kitchen.html?email=private', 'direct_or_unknown', 'none', ''],
  ['https://www.newcaliconstruction.com/kitchen.html', 'direct_or_unknown', 'none', ''],
  ['javascript:private', 'direct_or_unknown', 'none', ''],
  ['', 'direct_or_unknown', 'none', '']
]) {
  const fixture = load({ referrer }); const value = fixture.payload();
  assert.equal(value.lead_tab_first_source, source);
  assert.equal(value.lead_tab_first_medium, medium);
  assert.equal(value.lead_tab_first_referrer_host, host);
  assert.ok(!JSON.stringify([...fixture.storage.values()]).includes('private'));
  count++;
}
const initial = load({ pathname: '/blog/', query: '?utm_source=google&utm_medium=cpc&utm_campaign=original' });
const next = load({ pathname: '/kitchen.html', query: '?utm_source=chatgpt', storage: initial.storage, now: initial.clock.now + 1000 });
assert.equal(next.payload().lead_tab_first_campaign, 'original');
assert.equal(next.payload().lead_tab_first_medium, 'cpc');
assert.equal(next.payload().lead_tab_first_source, 'google');
assert.equal(next.payload().lead_submission_path, '/kitchen.html');
next.clock.now = initial.clock.now + 30 * 60 * 1000;
const expired = next.payload();
assert.equal(expired.lead_tab_first_source, 'chatgpt');
assert.equal(expired.lead_tab_first_medium, 'unspecified');
assert.equal(expired.lead_tab_first_campaign, '');
assert.equal(expired.lead_tab_first_landing_path, '/kitchen.html');
count++;
for (const options of [{ failRead: true }, { failWrite: true }, { failRead: true, failWrite: true }]) {
  const fixture = load({ query: '?utm_source=google', ...options });
  fixture.context.location.search = '?utm_source=other';
  assert.equal(fixture.payload().lead_tab_first_source, 'google', 'in-memory fallback stays stable');
  count++;
}
const stored = JSON.parse(initial.storage.get(KEY));
stored.campaign = 7;
const tampered = load({ storage: new Map([[KEY, JSON.stringify(stored)]]) });
assert.equal(tampered.payload().lead_tab_first_campaign, '');
assert.equal(tampered.payload().lead_tab_first_source, 'direct_or_unknown');
const arbitrary = load({ pathname: '/?email=private', query: '?utm_source=' + 'x'.repeat(81) + '&utm_term=private&fbclid=private' });
assert.equal(arbitrary.payload().lead_tab_first_landing_path, '/');
assert.ok(!JSON.stringify([...arbitrary.storage.values()]).includes('private'));
const brokenPayload = load();
assert.doesNotThrow(() => brokenPayload.context.window.newCaliLead.attach({ set() { throw new Error('unavailable'); } }));
count += 3;
console.log('PASS ' + count + ' attribution cases: exact referrers, privacy, fixed expiry, navigation, storage faults, tampering and invalid metadata');
