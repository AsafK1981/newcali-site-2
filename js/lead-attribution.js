/* Same-tab first touch, fixed 30-minute window. No requests or visitor identifiers.
 * Missing referrers mean direct OR unknown, never proof of an AI acquisition.
 * Campaign tags must be short slugs. Do not put customer details in campaign tags.
 */
(function () {
  'use strict';
  var KEY = 'newcali.leadTabFirst.v1';
  var TTL = 30 * 60 * 1000;
  var touch;

  function slug(value) {
    return typeof value === 'string' && /^[a-z0-9][a-z0-9_.-]{0,79}$/i.test(value) &&
      !/\d{7}/.test(value) ? value : '';
  }

  function pathname(value) {
    return typeof value === 'string' && value.length <= 180 &&
      /^\/[a-z0-9/_-]*(?:\.html)?$/i.test(value) ? value : '/';
  }

  function hostname(value) {
    return typeof value === 'string' && value.length <= 253 &&
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(value) ? value : '';
  }

  function externalReferrer() {
    try {
      var url = new URL(document.referrer);
      var host = hostname(url.hostname.toLowerCase());
      if (!/^https?:$/.test(url.protocol) || host === location.hostname.toLowerCase() ||
          /^(?:www\.)?newcaliconstruction\.com$/.test(host)) return '';
      return host;
    } catch (err) { return ''; }
  }

  function fresh(now) {
    var ref = externalReferrer();
    var result = {
      version: 1, started: now, landing: pathname(location.pathname), referrer: ref,
      source: ref || 'direct_or_unknown', medium: ref ? 'referral' : 'none', campaign: ''
    };
    if (/^(chatgpt\.com|chat\.openai\.com|claude\.ai|gemini\.google\.com)$/.test(ref)) {
      result.medium = 'ai_referral';
    }
    try {
      var params = new URLSearchParams(location.search);
      var source = slug(params.get('utm_source'));
      var medium = slug(params.get('utm_medium'));
      var campaign = slug(params.get('utm_campaign'));
      if (source || medium || campaign) {
        // One tuple from this arrival. Never mix tags with a previous campaign.
        result.source = source || 'tagged_unknown';
        result.medium = medium || 'unspecified';
        result.campaign = campaign;
      }
    } catch (err) { /* Referrer-only attribution remains usable. */ }
    return result;
  }

  function valid(value, now) {
    return value && value.version === 1 && Number.isFinite(value.started) &&
      value.started <= now && now - value.started < TTL &&
      typeof value.landing === 'string' && pathname(value.landing) === value.landing &&
      typeof value.referrer === 'string' && hostname(value.referrer) === value.referrer &&
      typeof value.source === 'string' && value.source !== '' &&
      (slug(value.source) === value.source || (value.referrer && value.source === value.referrer)) &&
      typeof value.medium === 'string' && value.medium !== '' && slug(value.medium) === value.medium &&
      typeof value.campaign === 'string' && slug(value.campaign) === value.campaign;
  }

  function firstTouch() {
    var now = Date.now();
    if (valid(touch, now)) return touch;
    try {
      var stored = JSON.parse(sessionStorage.getItem(KEY));
      if (valid(stored, now)) touch = stored;
    } catch (err) { /* Storage may be blocked or malformed. */ }
    if (!valid(touch, now)) {
      touch = fresh(now);
      try { sessionStorage.setItem(KEY, JSON.stringify(touch)); } catch (err) { /* Page-only fallback. */ }
    }
    return touch;
  }

  window.newCaliLead = {
    attach: function (data) {
      try {
        var first = firstTouch();
        data.set('lead_attribution_scope', 'same_tab_first_touch_30_minutes');
        data.set('lead_tab_first_source', first.source);
        data.set('lead_tab_first_medium', first.medium);
        data.set('lead_tab_first_campaign', first.campaign);
        data.set('lead_tab_first_landing_path', first.landing);
        data.set('lead_tab_first_referrer_host', first.referrer);
        data.set('lead_submission_path', pathname(location.pathname));
      } catch (err) { /* Attribution must never stop a lead. */ }
    }
  };
  // Capture entry even on a blog or portfolio page without a form.
  firstTouch();
}());
