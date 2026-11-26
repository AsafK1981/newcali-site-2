/* Lead funnel tracking for Google Tag Manager (GTM-K4HV2NGB).
 *
 * Pushes these dataLayer events, which GTM sends to GA4 and Google Ads:
 *   form_start      first focus inside a lead form
 *   cta_click       click on an estimate / contact call to action
 *   phone_click     click on a tel: link
 *   whatsapp_click  click on a wa.me link
 *   email_click     click on a mailto: link
 *   generate_lead   form accepted by Web3Forms (the Google Ads lead conversion)
 *
 * generate_lead carries user_data (email, phone, name, ZIP) for Google Ads
 * enhanced conversions. GTM hashes it before it leaves the browser. Right
 * after the lead event, user_data is reset in GTM's data model so later
 * events do not carry it. The pushed object itself stays in the
 * window.dataLayer array until the page unloads.
 *
 * Every page's form handler already calls gtag('event', 'form_submit_success')
 * after Web3Forms answers success. This file defines that gtag() and turns the
 * call into generate_lead, so the 39 form handlers stay untouched.
 * Tracking must never break a form: every path is wrapped in try/catch.
 */
(function () {
  'use strict';
  var w = window;
  w.dataLayer = w.dataLayer || [];
  var SNAP_TTL = 5 * 60 * 1000;
  var pending = [];
  var started = [];

  function push(obj) {
    try { w.dataLayer.push(obj); } catch (err) { /* never block the page */ }
  }

  function clean(value, max) {
    return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max || 100) : '';
  }

  function phoneE164(raw) {
    var digits = String(raw || '').replace(/\D/g, '');
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.charAt(0) === '1') return '+' + digits;
    if (/^\s*\+/.test(String(raw || '')) && digits.length >= 8 && digits.length <= 15) return '+' + digits;
    return '';
  }

  function formId(form) {
    if (form.id) return form.id;
    var holder = form.closest('[id]');
    return holder ? holder.id : 'form';
  }

  function field(form, names) {
    for (var i = 0; i < names.length; i++) {
      var el = form.querySelector('[name="' + names[i] + '"]');
      if (el && typeof el.value === 'string' && el.value.trim()) return el.value.trim();
    }
    return '';
  }

  function isLeadForm(form) {
    return !!(form && form.tagName === 'FORM' &&
      form.querySelector('input[type="email"], input[name="email"], input[type="tel"], input[name="phone"]'));
  }

  function snapshot(form) {
    var first = field(form, ['first_name', 'firstname', 'fname']);
    var last = field(form, ['last_name', 'lastname', 'lname']);
    if (!first) {
      var full = field(form, ['name', 'full_name']).split(/\s+/);
      first = full.shift() || '';
      if (!last) last = full.join(' ');
    }
    var email = field(form, ['email']).toLowerCase();
    var phone = phoneE164(field(form, ['phone', 'tel', 'phone_number']));
    var zip = field(form, ['zip', 'zipcode', 'postal_code']).replace(/[^0-9-]/g, '').slice(0, 10);
    var userData = {};
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) userData.email = email;
    if (phone) userData.phone_number = phone;
    var address = {};
    if (first) address.first_name = clean(first, 50).toLowerCase();
    if (last) address.last_name = clean(last, 50).toLowerCase();
    if (zip) address.postal_code = zip;
    if (first || last || zip) { address.country = 'US'; userData.address = address; }
    return {
      at: Date.now(),
      form_id: formId(form),
      project_type: clean(field(form, ['project', 'service', 'project_type']), 60),
      user_data: userData
    };
  }

  // One pending snapshot per form, so two forms in flight at once (main form
  // and exit popup) never swap details. The inline handlers pass event_label
  // 'exit_form' for the popup and 'contact_form...' for the page forms.
  function takeSnap(label) {
    var wantExit = /exit/i.test(String(label || ''));
    var now = Date.now();
    var best = -1;
    for (var i = 0; i < pending.length; i++) {
      var s = pending[i];
      if (now - s.at >= SNAP_TTL) continue;
      if (/exit/i.test(s.form_id) !== wantExit) continue;
      if (best === -1 || s.at > pending[best].at) best = i;
    }
    var snap = best === -1 ? null : pending[best];
    pending = pending.filter(function (s, i) { return i !== best && now - s.at < SNAP_TTL; });
    return snap;
  }

  function remember(snap) {
    pending = pending.filter(function (s) { return s.form_id !== snap.form_id; });
    pending.push(snap);
  }

  function lead(label) {
    var snap = takeSnap(label);
    var evt = {
      event: 'generate_lead',
      form_id: snap ? snap.form_id : clean(label, 60) || 'form',
      project_type: snap ? snap.project_type : ''
    };
    if (snap && (snap.user_data.email || snap.user_data.phone_number)) evt.user_data = snap.user_data;
    push(evt);
    // Do not let the next event inherit the visitor's details.
    push({ user_data: undefined, form_id: undefined, project_type: undefined });
  }

  // Bridge for the inline handlers: gtag('event', 'form_submit_success', {...}).
  // Click events from the old inline listeners are ignored; the click
  // listener below covers every tel:, wa.me and mailto: link instead.
  if (typeof w.gtag !== 'function') {
    w.gtag = function (command, name, params) {
      try {
        if (command === 'event' && name === 'form_submit_success') {
          lead(params && params.event_label);
        }
      } catch (err) { /* never block the form */ }
    };
  }

  // Remember what the visitor typed at the moment they press Send.
  document.addEventListener('submit', function (e) {
    try { if (isLeadForm(e.target)) remember(snapshot(e.target)); } catch (err) { /* ignore */ }
  }, true);

  document.addEventListener('focusin', function (e) {
    try {
      var form = e.target && e.target.closest && e.target.closest('form');
      if (!isLeadForm(form)) return;
      var id = formId(form);
      if (started.indexOf(id) !== -1) return;
      started.push(id);
      push({ event: 'form_start', form_id: id });
    } catch (err) { /* ignore */ }
  }, true);

  var CTA = /(free\s+(estimate|assessment|consultation|quote)|get\s+(a|your)\s+(free\s+)?(estimate|quote)|request\s+(an?\s+)?(estimate|quote)|book\s+(a|your)|contact\s+us|talk\s+to\s+us|discuss\s+your)/i;

  document.addEventListener('click', function (e) {
    try {
      var el = e.target && e.target.closest && e.target.closest('a, button');
      if (!el) return;
      var href = el.getAttribute('href') || '';
      var text = clean(el.textContent, 80);
      if (/^tel:/i.test(href)) { push({ event: 'phone_click', link_url: href }); return; }
      if (/^mailto:/i.test(href)) { push({ event: 'email_click', link_url: 'mailto' }); return; }
      if (/(wa\.me\/|api\.whatsapp\.com)/i.test(href)) { push({ event: 'whatsapp_click', link_url: 'whatsapp' }); return; }
      if (el.type === 'submit') return;
      if (CTA.test(text) || /#(contact|cform|estimate)/i.test(href)) {
        var zone = el.closest('nav, header, footer, section[id], div[id]');
        push({
          event: 'cta_click',
          cta_text: text,
          cta_location: zone ? (zone.id || zone.tagName.toLowerCase()) : 'page',
          link_url: href.slice(0, 120)
        });
      }
    } catch (err) { /* ignore */ }
  }, true);
})();
