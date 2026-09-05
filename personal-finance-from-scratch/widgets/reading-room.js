/* ============================================================
   PERSONAL FINANCE FROM SCRATCH — reading-room.js

   Powers the interactive "Reading Room" module. Every explainable
   figure on the page carries data-explain="<key>"; the plain-English
   copy for each key lives in a JSON island (#reading-explains) so the
   content stays in the page and only the wiring is here.

   Click (or keyboard-activate) any highlighted figure and its
   explanation appears in the sticky panel, with the figure marked
   active. Nothing is fetched; everything is local and works offline.
   ============================================================ */

(function () {
  'use strict';

  var dataEl = document.getElementById('reading-explains');
  var panel = document.getElementById('explain-panel');
  if (!dataEl || !panel) { return; }

  var DICT = {};
  try { DICT = JSON.parse(dataEl.textContent || '{}'); }
  catch (e) { DICT = {}; }

  var termEl = panel.querySelector('.explain-term');
  var tagEl  = panel.querySelector('.explain-tag');
  var descEl = panel.querySelector('.explain-desc');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-explain]'));

  var active = null;

  function show(el) {
    var key = el.getAttribute('data-explain');
    var entry = DICT[key];
    if (!entry) { return; }

    if (active) { active.classList.remove('explain-active'); active.setAttribute('aria-pressed', 'false'); }
    active = el;
    el.classList.add('explain-active');
    el.setAttribute('aria-pressed', 'true');

    if (tagEl)  { tagEl.textContent = entry.tag || 'Reading it'; }
    if (termEl) { termEl.textContent = entry.term || ''; }
    if (descEl) { descEl.innerHTML = entry.desc || ''; }
    panel.classList.add('explain-shown');

    /* on a narrow screen the panel is rendered inline below the block —
       bring it into view so the answer is never off-screen */
    if (window.matchMedia && window.matchMedia('(max-width: 1100px)').matches) {
      try { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) { /* fine */ }
    }
  }

  items.forEach(function (el) {
    if (!DICT[el.getAttribute('data-explain')]) { return; }  /* skip keys with no copy */
    el.classList.add('explainable');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-pressed', 'false');
    el.addEventListener('click', function () { show(el); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        show(el);
      }
    });
  });

  /* open on the first item so the panel is never empty on load */
  var first = items.filter(function (el) { return DICT[el.getAttribute('data-explain')]; })[0];
  if (first) { show(first); }
})();
