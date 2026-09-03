/* ============================================================
   PERSONAL FINANCE FROM SCRATCH — theme.js
   Shared by the landing page and every reader page.

   Wires the light/dark toggle. The initial theme is set by a
   tiny inline <head> script (so there is no flash of the wrong
   theme before this file loads); this file only handles clicks,
   keeps the toggle's aria state in sync, follows the system
   preference while the reader has made no explicit choice, and
   announces a `themechange` event that scene.js listens for to
   re-light the coin.

   Storage key: pfs-finance:theme  ->  "light" | "dark"
   ============================================================ */

(function () {
  'use strict';

  var root = document.documentElement;
  var KEY = 'pfs-finance:theme';

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function current() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function apply(theme, persist) {
    root.setAttribute('data-theme', theme);
    if (persist) { try { localStorage.setItem(KEY, theme); } catch (e) { /* fine */ } }

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) { meta.setAttribute('content', theme === 'light' ? '#F4F1E9' : '#222222'); }

    Array.prototype.forEach.call(document.querySelectorAll('.theme-toggle'), function (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('title', theme === 'dark' ? 'Light mode' : 'Dark mode');
    });

    try { window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme } })); }
    catch (e) { /* older browsers: coin simply keeps its current lighting */ }
  }

  Array.prototype.forEach.call(document.querySelectorAll('.theme-toggle'), function (btn) {
    btn.addEventListener('click', function () {
      apply(current() === 'dark' ? 'light' : 'dark', true);
    });
  });

  /* follow the OS while the reader has made no explicit choice */
  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
        if (!stored()) { apply(e.matches ? 'light' : 'dark', false); }
      });
    } catch (e) { /* Safari <14 has no addEventListener on MediaQueryList; fine */ }
  }

  /* sync toggle aria + notify scene.js of the head-script's initial theme */
  apply(current(), false);
})();
