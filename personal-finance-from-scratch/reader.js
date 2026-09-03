/* ============================================================
   PERSONAL FINANCE FROM SCRATCH — reader.js
   Shared by every moduleN.html:
     · Contents-sidebar scrollspy against this chapter's sections
     · localStorage progress helpers (key: pfs-finance:progress)
         schema: { "chapters": { "<n>": { "complete": bool,
                                          "drills": { "<id>": "attempted" } } } }
     · drills marked "attempted" when their <details> is opened
     · "Mark module complete" toggle (+ heart shortcut in topbar)
     · gear control cycles reader font size (key: pfs-finance:reader-size)
   All storage access is wrapped in try/catch — the page must
   keep working with localStorage unavailable.
   ============================================================ */

(function () {
  'use strict';

  var chapterId = document.body.getAttribute('data-chapter');

  /* ---------- storage helpers ---------- */

  function readProgress() {
    try {
      var raw = window.localStorage.getItem('pfs-finance:progress');
      if (!raw) return { chapters: {} };
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' ||
          typeof parsed.chapters !== 'object' || parsed.chapters === null) {
        return { chapters: {} };
      }
      return parsed;
    } catch (err) {
      return { chapters: {} };
    }
  }

  function writeProgress(progress) {
    try {
      window.localStorage.setItem('pfs-finance:progress', JSON.stringify(progress));
      return true;
    } catch (err) {
      return false;
    }
  }

  function chapterEntry(progress) {
    if (!progress.chapters[chapterId]) {
      progress.chapters[chapterId] = { complete: false, drills: {} };
    }
    if (typeof progress.chapters[chapterId].drills !== 'object' ||
        progress.chapters[chapterId].drills === null) {
      progress.chapters[chapterId].drills = {};
    }
    return progress.chapters[chapterId];
  }

  /* ---------- contents scrollspy ---------- */

  var contentsLinks = document.querySelectorAll('.contents a[href^="#"]');
  var sections = [];
  contentsLinks.forEach(function (a) {
    var target = document.getElementById(a.getAttribute('href').slice(1));
    if (target) sections.push({ link: a, el: target });
  });

  if (sections.length && 'IntersectionObserver' in window) {
    var setCurrent = function (el) {
      sections.forEach(function (s) {
        s.link.classList.toggle('current', s.el === el);
      });
    };
    var spy = new IntersectionObserver(function (entries) {
      var best = null;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!best || entry.boundingClientRect.top < best.boundingClientRect.top) {
            best = entry;
          }
        }
      });
      if (best) setCurrent(best.target);
    }, { rootMargin: '-10% 0px -70% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s.el); });
  }

  /* ---------- drill attempt tracking ---------- */

  if (chapterId !== null) {
    document.querySelectorAll('.drill details[data-drill]').forEach(function (det) {
      det.addEventListener('toggle', function () {
        if (!det.open) return;
        var progress = readProgress();
        var entry = chapterEntry(progress);
        var id = det.getAttribute('data-drill');
        if (entry.drills[id] !== 'attempted') {
          entry.drills[id] = 'attempted';
          writeProgress(progress);
        }
      });
    });
  }

  /* ---------- chapter-complete toggle (+ heart shortcut) ---------- */

  var completeButtons = document.querySelectorAll('[data-complete-toggle]');

  function renderComplete(isComplete) {
    completeButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', isComplete ? 'true' : 'false');
      var label = btn.querySelector('[data-complete-label]');
      if (label) {
        label.textContent = isComplete
          ? '✓ Module marked complete'
          : 'Mark module complete';
      }
    });
  }

  function toggleComplete() {
    var progress = readProgress();
    var entry = chapterEntry(progress);
    entry.complete = !entry.complete;
    writeProgress(progress);
    renderComplete(entry.complete);
  }

  if (chapterId !== null && completeButtons.length) {
    completeButtons.forEach(function (btn) {
      btn.addEventListener('click', toggleComplete);
    });
    var initial = readProgress();
    var entry0 = initial.chapters[chapterId];
    renderComplete(!!(entry0 && entry0.complete));
  }

  /* ---------- gear: reader font-size cycle ---------- */

  var SIZES = ['normal', 'large', 'small'];

  function readSize() {
    try {
      var s = window.localStorage.getItem('pfs-finance:reader-size');
      return SIZES.indexOf(s) >= 0 ? s : 'normal';
    } catch (err) {
      return 'normal';
    }
  }

  function applySize(size) {
    if (size === 'normal') {
      document.body.removeAttribute('data-reader-size');
    } else {
      document.body.setAttribute('data-reader-size', size);
    }
  }

  applySize(readSize());

  var gear = document.querySelector('.topbar .gear');
  if (gear) {
    gear.addEventListener('click', function () {
      var next = SIZES[(SIZES.indexOf(readSize()) + 1) % SIZES.length];
      try { window.localStorage.setItem('pfs-finance:reader-size', next); } catch (err) { /* fine */ }
      applySize(next);
    });
  }

})();
