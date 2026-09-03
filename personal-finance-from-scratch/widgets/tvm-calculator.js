/* ============================================================
   PERSONAL FINANCE FROM SCRATCH — widgets/tvm-calculator.js
   Module 01 · #sandbox

   A live version of Module 1.2's compound-growth table. Defaults
   reproduce the module's own worked example exactly — $1,000 at
   7% over 3 years, ending at $1,225.04 — so the first thing a
   reader sees on load is the printed example, not a disconnected
   calculator.

   Vanilla JS, no dependencies, no network. Renders into
   #tvm-sandbox using chapter.css's existing .sandbox-* classes.
   ============================================================ */

(function () {
  'use strict';

  var mount = document.getElementById('tvm-sandbox');
  if (!mount) { return; }

  /* ---------- defaults: Module 1.2's worked example ---------- */
  var DEFAULTS = { principal: 1000, rate: 7, years: 3 };

  var LIMITS = {
    principal: { min: 0, max: 1000000, label: 'principal' },
    rate:      { min: -20, max: 40,    label: 'annual rate' },
    years:     { min: 1, max: 50,      label: 'term' }
  };

  /* ---------- formatting ---------- */

  function money(v) {
    var sign = v < 0 ? '-' : '';
    return sign + '$' + Math.abs(v).toLocaleString('en-CA', {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- markup ---------- */

  mount.innerHTML =
    '<div class="sandbox-controls">' +
      '<label class="stacked" for="tvm-principal">' +
        '<span class="ctl-name">Principal (PV)</span>' +
        '<input type="number" id="tvm-principal" value="' + DEFAULTS.principal + '" ' +
               'min="0" max="1000000" step="50">' +
      '</label>' +
      '<label class="stacked" for="tvm-rate">' +
        '<span class="ctl-name">Annual rate <span id="tvm-rate-out">' + DEFAULTS.rate + '</span>%</span>' +
        '<input type="range" id="tvm-rate" value="' + DEFAULTS.rate + '" min="-20" max="40" step="0.1">' +
      '</label>' +
      '<label class="stacked" for="tvm-years">' +
        '<span class="ctl-name">Years <span id="tvm-years-out">' + DEFAULTS.years + '</span></span>' +
        '<input type="range" id="tvm-years" value="' + DEFAULTS.years + '" min="1" max="50" step="1">' +
      '</label>' +
      '<button type="button" id="tvm-reset">Reset to the worked example</button>' +
    '</div>' +
    '<div class="sandbox-readout" id="tvm-readout" aria-live="polite"></div>' +
    '<div class="sandbox-error" id="tvm-error" role="alert" hidden></div>' +
    '<div class="sandbox-scroll"><table id="tvm-table">' +
      '<caption>Year-by-year compound growth</caption>' +
      '<thead><tr>' +
        '<th scope="col">Year</th><th scope="col" class="num">Start</th>' +
        '<th scope="col" class="num">Interest</th><th scope="col" class="num">End</th>' +
      '</tr></thead><tbody></tbody>' +
    '</table></div>' +
    '<p class="sandbox-note">' +
      'Rows are computed year by year, each year\'s interest applied to the previous year\'s ' +
      'closing balance — which is what makes the interest column grow with no new deposit. ' +
      'Rounding is applied for display only; the running balance carries full precision.' +
    '</p>';

  var elPrincipal = document.getElementById('tvm-principal');
  var elRate = document.getElementById('tvm-rate');
  var elYears = document.getElementById('tvm-years');
  var elRateOut = document.getElementById('tvm-rate-out');
  var elYearsOut = document.getElementById('tvm-years-out');
  var elReadout = document.getElementById('tvm-readout');
  var elError = document.getElementById('tvm-error');
  var elBody = document.querySelector('#tvm-table tbody');
  var elReset = document.getElementById('tvm-reset');

  /* ---------- validation ----------
     No widget on this site is allowed to print NaN or Infinity at
     a reader. Every input is checked before any arithmetic runs,
     and a failure produces a sentence, not a broken number.      */

  function validate() {
    var p = parseFloat(elPrincipal.value);
    var r = parseFloat(elRate.value);
    var n = parseInt(elYears.value, 10);

    if (!isFinite(p)) { return { error: 'Enter a principal amount — a number, in dollars.' }; }
    if (p < LIMITS.principal.min) { return { error: 'Principal cannot be negative. Enter 0 or more.' }; }
    if (p > LIMITS.principal.max) {
      return { error: 'Principal is capped at $1,000,000 here, to keep the table readable.' };
    }
    if (!isFinite(r)) { return { error: 'Enter an annual rate as a percentage.' }; }
    if (r < LIMITS.rate.min || r > LIMITS.rate.max) {
      return { error: 'Annual rate must be between −20% and 40%.' };
    }
    if (!isFinite(n) || n < LIMITS.years.min || n > LIMITS.years.max) {
      return { error: 'Term must be a whole number of years between 1 and 50.' };
    }
    return { principal: p, rate: r, years: n };
  }

  /* ---------- render ---------- */

  function render() {
    elRateOut.textContent = parseFloat(elRate.value).toFixed(1).replace(/\.0$/, '');
    elYearsOut.textContent = elYears.value;

    var v = validate();
    if (v.error) {
      elError.hidden = false;
      elError.textContent = v.error;
      elPrincipal.classList.add('bad');
      elBody.innerHTML = '';
      elReadout.innerHTML = '';
      return;
    }
    elError.hidden = true;
    elPrincipal.classList.remove('bad');

    var r = v.rate / 100;
    var balance = v.principal;
    var rows = '';
    var totalInterest = 0;

    for (var year = 1; year <= v.years; year++) {
      var start = balance;
      var interest = start * r;
      balance = start + interest;
      totalInterest += interest;
      rows += '<tr>' +
        '<td>' + year + '</td>' +
        '<td class="num">' + esc(money(start)) + '</td>' +
        '<td class="num">' + esc(money(interest)) + '</td>' +
        '<td class="num">' + esc(money(balance)) + '</td>' +
      '</tr>';
    }
    elBody.innerHTML = rows;

    /* the closed form, as a cross-check on the row-by-row loop */
    var closed = v.principal * Math.pow(1 + r, v.years);

    elReadout.innerHTML =
      'FV = PV(1+r)<sup>n</sup> = ' + esc(money(v.principal)) + ' &times; (1 + ' +
        (r).toFixed(4) + ')<sup>' + v.years + '</sup> = ' +
        '<span class="val">' + esc(money(closed)) + '</span><br>' +
      'Total interest earned: <span class="val">' + esc(money(totalInterest)) + '</span>' +
      ' &nbsp;·&nbsp; growth: <span class="val">' +
        (v.principal > 0 ? ((closed / v.principal - 1) * 100).toFixed(1) + '%' : 'n/a') +
      '</span>';
  }

  elPrincipal.addEventListener('input', render);
  elRate.addEventListener('input', render);
  elYears.addEventListener('input', render);
  elReset.addEventListener('click', function () {
    elPrincipal.value = DEFAULTS.principal;
    elRate.value = DEFAULTS.rate;
    elYears.value = DEFAULTS.years;
    render();
  });

  render();
})();
