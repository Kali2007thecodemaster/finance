/* ============================================================
   PERSONAL FINANCE FROM SCRATCH — widgets/dcf-scenario-sandbox.js
   Module 07 · #sandbox

   Module 7.2's bull/base/bear table, operationalised. Each of
   the three scenarios carries its own growth rate and discount
   rate, feeding the simplified DCF of Module 7.3:

       Value = sum over t=1..n of  FCF_0 (1+g)^t / (1+r)^t

   The defaults encode the source table's own narratives — the
   bull case has faster cuts (a lower discount rate) and expanding
   margins (higher growth); the bear case has elevated real rates
   and stalling demand. The spread between bull and bear is
   reported underneath, because Module 7.2's Common Confusion is
   that the range matters more than any single point estimate.

   Vanilla JS, no dependencies, no network.
   ============================================================ */

(function () {
  'use strict';

  var mount = document.getElementById('dcf-sandbox');
  if (!mount) { return; }

  /* base-year free cash flow, in millions — one shared starting point,
     so the three scenarios differ only in their assumptions */
  var FCF0 = 100;
  var YEARS = 5;

  var SCENARIOS = [
    { key: 'bull', name: 'Bull', growth: 12, rate: 8,
      note: 'Faster rate cuts, elevated geopolitical premium; constrained supply.' },
    { key: 'base', name: 'Base', growth: 5, rate: 10,
      note: 'Slow, expected easing; moderate demand/supply growth.' },
    { key: 'bear', name: 'Bear', growth: -2, rate: 13,
      note: 'Resilience delays cuts, elevated real rates; demand stalls.' }
  ];

  var DEFAULTS = SCENARIOS.map(function (s) { return { growth: s.growth, rate: s.rate }; });

  function millions(v) {
    var sign = v < 0 ? '-' : '';
    return sign + '$' + Math.abs(v).toLocaleString('en-CA', {
      minimumFractionDigits: 1, maximumFractionDigits: 1
    }) + 'M';
  }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var cards = SCENARIOS.map(function (s) {
    return '<div class="scenario-card">' +
      '<h4>' + s.name + '</h4>' +
      '<label class="scenario-field" for="dcf-g-' + s.key + '">' +
        '<span class="ctl-name">FCF growth ' +
          '<span id="dcf-g-out-' + s.key + '">' + s.growth + '</span>% / yr</span>' +
        '<input type="range" id="dcf-g-' + s.key + '" data-k="' + s.key + '" data-f="growth" ' +
               'value="' + s.growth + '" min="-25" max="35" step="0.5">' +
      '</label>' +
      '<label class="scenario-field" for="dcf-r-' + s.key + '">' +
        '<span class="ctl-name">Discount rate ' +
          '<span id="dcf-r-out-' + s.key + '">' + s.rate + '</span>%</span>' +
        '<input type="range" id="dcf-r-' + s.key + '" data-k="' + s.key + '" data-f="rate" ' +
               'value="' + s.rate + '" min="1" max="30" step="0.25">' +
      '</label>' +
      '<div class="scenario-out" id="dcf-out-' + s.key + '"></div>' +
      '<p class="sandbox-note" style="margin-top:8px;">' + s.note + '</p>' +
    '</div>';
  }).join('');

  mount.innerHTML =
    '<p class="sandbox-note" style="margin-top:0;">' +
      'All three scenarios start from the same base-year free cash flow of ' + millions(FCF0) +
      ' and run for ' + YEARS + ' years. Only the assumptions differ — which is exactly what ' +
      'scenario analysis is: one model, run several times.' +
    '</p>' +
    '<div class="scenario-grid">' + cards + '</div>' +
    '<div class="sandbox-error" id="dcf-error" role="alert" hidden></div>' +
    '<div class="sandbox-readout" id="dcf-spread" aria-live="polite"></div>' +
    '<div class="sandbox-controls">' +
      '<button type="button" id="dcf-reset">Reset to the scenario table</button>' +
    '</div>' +
    '<p class="sandbox-note">' +
      'Note what happens when you move a discount rate by one percentage point and leave growth ' +
      'alone. The valuation moves further than most people expect, and it moves furthest in the ' +
      'bull case — where the cash flows being discounted are largest and furthest out. That ' +
      'sensitivity is the honest content of a DCF; the headline number is not.' +
    '</p>';

  var state = {};
  SCENARIOS.forEach(function (s) { state[s.key] = { growth: s.growth, rate: s.rate }; });

  var elError = document.getElementById('dcf-error');
  var elSpread = document.getElementById('dcf-spread');

  /* ---------- the model ---------- */

  function value(growthPct, ratePct) {
    var g = growthPct / 100;
    var r = ratePct / 100;
    var sum = 0;
    for (var t = 1; t <= YEARS; t++) {
      sum += FCF0 * Math.pow(1 + g, t) / Math.pow(1 + r, t);
    }
    return sum;
  }

  function validate() {
    for (var i = 0; i < SCENARIOS.length; i++) {
      var s = SCENARIOS[i];
      var st = state[s.key];
      var g = parseFloat(st.growth), r = parseFloat(st.rate);
      if (!isFinite(g) || g < -25 || g > 35) {
        return { error: s.name + ' growth must be between −25% and 35%.' };
      }
      if (!isFinite(r) || r <= 0 || r > 30) {
        return { error: s.name + ' discount rate must be above 0% and at most 30%. ' +
                        'A rate of zero would mean a dollar in five years is worth a dollar today, ' +
                        'which is the one thing Module 1 rules out.' };
      }
    }
    return {};
  }

  function render() {
    var v = validate();
    if (v.error) {
      elError.hidden = false;
      elError.textContent = v.error;
      elSpread.innerHTML = '';
      return;
    }
    elError.hidden = true;

    var values = {};
    SCENARIOS.forEach(function (s) {
      var st = state[s.key];
      var val = value(parseFloat(st.growth), parseFloat(st.rate));
      values[s.key] = val;

      document.getElementById('dcf-g-out-' + s.key).textContent =
        parseFloat(st.growth).toFixed(1).replace(/\.0$/, '');
      document.getElementById('dcf-r-out-' + s.key).textContent =
        parseFloat(st.rate).toFixed(2).replace(/\.?0+$/, '') || '0';

      document.getElementById('dcf-out-' + s.key).innerHTML =
        'Value of 5 yrs of FCF:<br><span class="val">' + esc(millions(val)) + '</span>';
    });

    var bull = values.bull, base = values.base, bear = values.bear;
    var spread = bull - bear;
    var relative = base !== 0 ? (spread / base) * 100 : 0;

    elSpread.innerHTML =
      'Bull <span class="val">' + esc(millions(bull)) + '</span>' +
      ' &nbsp;·&nbsp; Base <span class="val">' + esc(millions(base)) + '</span>' +
      ' &nbsp;·&nbsp; Bear <span class="val">' + esc(millions(bear)) + '</span><br>' +
      'Bull&ndash;bear spread: <span class="val">' + esc(millions(spread)) + '</span>' +
      ' — that is <span class="val">' + Math.abs(relative).toFixed(0) + '%</span> of the base case. ' +
      'The base case is one number inside that range, not a forecast of where the answer lands.';
  }

  Array.prototype.forEach.call(mount.querySelectorAll('input[type="range"]'), function (input) {
    input.addEventListener('input', function () {
      state[input.getAttribute('data-k')][input.getAttribute('data-f')] = input.value;
      render();
    });
  });

  document.getElementById('dcf-reset').addEventListener('click', function () {
    SCENARIOS.forEach(function (s, i) {
      state[s.key] = { growth: DEFAULTS[i].growth, rate: DEFAULTS[i].rate };
      document.getElementById('dcf-g-' + s.key).value = DEFAULTS[i].growth;
      document.getElementById('dcf-r-' + s.key).value = DEFAULTS[i].rate;
    });
    render();
  });

  render();
})();
