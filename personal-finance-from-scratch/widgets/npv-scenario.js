/* ============================================================
   PERSONAL FINANCE FROM SCRATCH — widgets/npv-scenario.js
   Module 04 · #sandbox

   The module's certification decision, made editable. Defaults
   are the worked example's own numbers — $2,000 cost, $3,000 a
   year for three years, 6% discount rate — and they reproduce
   its published answer, $6,019.04, on load.

   Every discounted term is shown separately, because the point
   of the module is that later benefits are worth visibly less,
   and a single NPV figure hides that.

   Vanilla JS, no dependencies, no network.
   ============================================================ */

(function () {
  'use strict';

  var mount = document.getElementById('npv-sandbox');
  if (!mount) { return; }

  var DEFAULTS = { cost: 2000, rate: 6, flows: [3000, 3000, 3000] };
  var MAX_YEARS = 12;

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

  var flows = DEFAULTS.flows.slice();

  mount.innerHTML =
    '<div class="sandbox-controls">' +
      '<label class="stacked" for="npv-cost">' +
        '<span class="ctl-name">Initial cost (today)</span>' +
        '<input type="number" id="npv-cost" value="' + DEFAULTS.cost + '" min="0" max="1000000" step="100">' +
      '</label>' +
      '<label class="stacked" for="npv-rate">' +
        '<span class="ctl-name">Discount rate <span id="npv-rate-out">' + DEFAULTS.rate + '</span>%</span>' +
        '<input type="range" id="npv-rate" value="' + DEFAULTS.rate + '" min="0" max="30" step="0.1">' +
      '</label>' +
      '<button type="button" id="npv-add">+ year</button>' +
      '<button type="button" id="npv-remove">&minus; year</button>' +
      '<button type="button" id="npv-reset">Reset to the worked example</button>' +
    '</div>' +
    '<div id="npv-flows" class="sandbox-controls"></div>' +
    '<div class="sandbox-error" id="npv-error" role="alert" hidden></div>' +
    '<div class="sandbox-scroll"><table id="npv-table">' +
      '<thead><tr>' +
        '<th scope="col">Year</th><th scope="col" class="num">Cash flow</th>' +
        '<th scope="col" class="num">Discount factor</th>' +
        '<th scope="col" class="num">Present value</th>' +
      '</tr></thead><tbody></tbody>' +
    '</table></div>' +
    '<div class="sandbox-readout" id="npv-readout" aria-live="polite"></div>' +
    '<p class="sandbox-note">' +
      'The discount factor column is 1/(1+r)<sup>t</sup> — the fraction of face value a benefit ' +
      't years out is worth today. Watch it fall away as you raise the rate: that is the whole ' +
      'reason the discount-rate assumption deserves more argument than the cash-flow forecast.' +
    '</p>';

  var elCost = document.getElementById('npv-cost');
  var elRate = document.getElementById('npv-rate');
  var elRateOut = document.getElementById('npv-rate-out');
  var elFlows = document.getElementById('npv-flows');
  var elError = document.getElementById('npv-error');
  var elBody = document.querySelector('#npv-table tbody');
  var elReadout = document.getElementById('npv-readout');

  function drawFlowInputs() {
    var html = '';
    for (var t = 0; t < flows.length; t++) {
      html += '<label class="stacked" for="npv-cf-' + (t + 1) + '">' +
                '<span class="ctl-name">Year ' + (t + 1) + ' cash flow</span>' +
                '<input type="number" id="npv-cf-' + (t + 1) + '" data-year="' + t + '" ' +
                       'value="' + flows[t] + '" min="-1000000" max="1000000" step="100">' +
              '</label>';
    }
    elFlows.innerHTML = html;
    Array.prototype.forEach.call(elFlows.querySelectorAll('input'), function (input) {
      input.addEventListener('input', function () {
        var idx = parseInt(input.getAttribute('data-year'), 10);
        flows[idx] = input.value;
        render();
      });
    });
  }

  function validate() {
    var cost = parseFloat(elCost.value);
    var rate = parseFloat(elRate.value);

    if (!isFinite(cost) || cost < 0) {
      return { error: 'Initial cost cannot be negative. A cost of 0 is allowed; a negative one is not a cost.' };
    }
    if (cost > 1000000) { return { error: 'Initial cost is capped at $1,000,000 here.' }; }
    if (!isFinite(rate)) { return { error: 'Enter a discount rate as a percentage.' }; }
    if (rate < 0) {
      return { error: 'A negative discount rate would make later dollars worth more than today\'s, ' +
                      'which inverts the whole premise of Module 1. Enter 0% or more.' };
    }
    if (rate > 30) { return { error: 'Discount rate is capped at 30% here.' }; }

    var clean = [];
    for (var t = 0; t < flows.length; t++) {
      var cf = parseFloat(flows[t]);
      if (!isFinite(cf)) {
        return { error: 'Year ' + (t + 1) + '\'s cash flow is not a number. Enter a figure, or 0.' };
      }
      if (Math.abs(cf) > 1000000) {
        return { error: 'Year ' + (t + 1) + '\'s cash flow is outside the ±$1,000,000 range used here.' };
      }
      clean.push(cf);
    }
    return { cost: cost, rate: rate, flows: clean };
  }

  function render() {
    elRateOut.textContent = parseFloat(elRate.value).toFixed(1).replace(/\.0$/, '');

    var v = validate();
    if (v.error) {
      elError.hidden = false;
      elError.textContent = v.error;
      elBody.innerHTML = '';
      elReadout.innerHTML = '';
      return;
    }
    elError.hidden = true;

    var r = v.rate / 100;
    var pvSum = 0;
    var rows = '';

    for (var t = 1; t <= v.flows.length; t++) {
      var factor = 1 / Math.pow(1 + r, t);
      var pv = v.flows[t - 1] * factor;
      pvSum += pv;
      rows += '<tr>' +
        '<td>' + t + '</td>' +
        '<td class="num">' + esc(money(v.flows[t - 1])) + '</td>' +
        '<td class="num">' + factor.toFixed(4) + '</td>' +
        '<td class="num">' + esc(money(pv)) + '</td>' +
      '</tr>';
    }
    elBody.innerHTML = rows;

    var npv = pvSum - v.cost;
    var verdict = npv > 0
      ? 'Positive NPV — worth more today than it costs, <em>on these assumptions</em>.'
      : (npv < 0
         ? 'Negative NPV — the benefits do not cover the cost, on these assumptions.'
         : 'NPV is exactly zero — the break-even point.');

    elReadout.innerHTML =
      'Sum of present values: <span class="val">' + esc(money(pvSum)) + '</span>' +
      ' &nbsp;&minus;&nbsp; initial cost <span class="val">' + esc(money(v.cost)) + '</span><br>' +
      'NPV = <span class="val">' + esc(money(npv)) + '</span><br>' + verdict;
  }

  elCost.addEventListener('input', render);
  elRate.addEventListener('input', render);

  document.getElementById('npv-add').addEventListener('click', function () {
    if (flows.length >= MAX_YEARS) {
      elError.hidden = false;
      elError.textContent = 'This tool goes to ' + MAX_YEARS + ' years. Past that, a spreadsheet is the right instrument.';
      return;
    }
    flows.push(0);
    drawFlowInputs();
    render();
  });

  document.getElementById('npv-remove').addEventListener('click', function () {
    if (flows.length <= 1) {
      elError.hidden = false;
      elError.textContent = 'At least one year of cash flow is needed for there to be anything to discount.';
      return;
    }
    flows.pop();
    drawFlowInputs();
    render();
  });

  document.getElementById('npv-reset').addEventListener('click', function () {
    flows = DEFAULTS.flows.slice();
    elCost.value = DEFAULTS.cost;
    elRate.value = DEFAULTS.rate;
    drawFlowInputs();
    render();
  });

  drawFlowInputs();
  render();
})();
