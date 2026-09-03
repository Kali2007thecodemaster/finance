/* ============================================================
   PERSONAL FINANCE FROM SCRATCH — main.js
   Landing-page behaviour, minus the 3D hero scene (see scene.js):
   marquee · fade-up reveals · source-weight filter
   market-rail scrollspy · localStorage progress badges

   The reference site's ASCII fluid canvas is gone from here — the
   hero background is a WebGL scene owned by scene.js, which carries
   its own prefers-reduced-motion and no-WebGL fallbacks.
   ============================================================ */

(function () {
  'use strict';

  var REDUCED_MOTION = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TOTAL_MODULES = 10;                       // Modules 00-09

  /* ============================================================
     1. MARQUEE — duplicate content once for a seamless loop
     ============================================================ */

  var track = document.getElementById('marquee-track');
  if (track) {
    track.innerHTML += track.innerHTML;
  }

  /* ============================================================
     2. FADE-UP REVEALS
     ============================================================ */

  var faders = document.querySelectorAll('.fade-up');
  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    faders.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    faders.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ============================================================
     3. SOURCE-WEIGHT LEGEND FILTER
     Dims topic tags that don't match the selected source weight.
     ============================================================ */

  var legendButtons = document.querySelectorAll('.legend-btn');
  var allTags = document.querySelectorAll('.tag');

  var applyFilter = function (filter) {
    allTags.forEach(function (tag) {
      var match = (filter === 'all') || (tag.getAttribute('data-source') === filter);
      tag.classList.toggle('dim', !match);
    });
    legendButtons.forEach(function (btn) {
      var active = btn.getAttribute('data-filter') === filter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  legendButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  /* ============================================================
     4. MARKET RAIL SCROLLSPY
     ============================================================ */

  var railLinks = document.querySelectorAll('.market-rail a[data-target]');
  var spied = document.querySelectorAll('[data-rail]');

  if (railLinks.length && spied.length && 'IntersectionObserver' in window) {
    var current = null;
    var setCurrent = function (id) {
      if (id === current) return;
      current = id;
      railLinks.forEach(function (a) {
        a.classList.toggle('current', a.getAttribute('data-target') === id);
      });
    };

    var railObserver = new IntersectionObserver(function (entries) {
      // choose the visible section closest to the top band of the viewport
      var best = null;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!best || entry.boundingClientRect.top < best.boundingClientRect.top) {
            best = entry;
          }
        }
      });
      if (best) setCurrent(best.target.getAttribute('data-rail'));
    }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });

    spied.forEach(function (el) { railObserver.observe(el); });
  }

  /* ============================================================
     5. PROGRESS BADGES — reads the shared pfs-finance:progress store
     Schema (written by reader.js on module pages):
       { "chapters": { "<n>": { "complete": true, "drills": {...} } } }
     All storage access is wrapped so the page works without it.
     ============================================================ */

  var readProgress = function () {
    try {
      var raw = window.localStorage.getItem('pfs-finance:progress');
      if (!raw) return { chapters: {} };
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.chapters !== 'object' || parsed.chapters === null) {
        return { chapters: {} };
      }
      return parsed;
    } catch (err) {
      return { chapters: {} };
    }
  };

  var renderProgress = function () {
    var progress = readProgress();
    var completeCount = 0;

    // per-chapter dots
    document.querySelectorAll('.list-row[data-chapter]').forEach(function (row) {
      var n = row.getAttribute('data-chapter');
      var entry = progress.chapters[n];
      var done = !!(entry && entry.complete);
      if (done) completeCount++;
      var dot = row.querySelector('.done-dot');
      if (dot) dot.classList.toggle('done', done);
      if (done) {
        row.setAttribute('aria-label', 'Module ' + n + ' — complete');
      }
    });

    // hero progress bar + nav chip
    var fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = ((completeCount / TOTAL_MODULES) * 100) + '%';
    var count = document.getElementById('progress-count');
    if (count) count.textContent = String(completeCount);
    var navCount = document.getElementById('nav-progress-count');
    if (navCount) navCount.textContent = String(completeCount);

    // phase badges: filled dot when every chapter in the phase is complete
    document.querySelectorAll('.phase[data-phase]').forEach(function (phaseEl) {
      var rowsInPhase = phaseEl.querySelectorAll('.list-row[data-chapter]');
      var dot = phaseEl.querySelector('.phase-dot');
      if (!dot) return;
      if (!rowsInPhase.length) {                  // a phase with no module rows
        dot.classList.remove('filled');
        return;
      }
      var allDone = true;
      rowsInPhase.forEach(function (row) {
        var n = row.getAttribute('data-chapter');
        var entry = progress.chapters[n];
        if (!entry || !entry.complete) allDone = false;
      });
      dot.classList.toggle('filled', allDone);
    });
  };

  renderProgress();

  // refresh badges if another tab (a chapter page) updates progress
  window.addEventListener('storage', function (e) {
    if (e.key === 'pfs-finance:progress') renderProgress();
  });

})();
