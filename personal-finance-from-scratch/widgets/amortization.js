/* ============================================================
   PERSONAL FINANCE FROM SCRATCH — widgets/amortization.js
   Module 03 · #sandbox

   Generates a full amortization schedule, then answers the
   question the module's worked example raises but does not
   compute: what an extra payment each month is actually worth,
   in total interest and in months saved.

   Defaults are Module 3's worked example — $1,000 at 20% APR
   over one year. That example describes a balance left UNTOUCHED,
   which an amortization schedule by definition cannot reproduce:
   the schedule exists because payments are being made. So the
   widget opens by printing the untouched figure first, on the
   example's own simple-APR basis, which lands on exactly the
   $1,200 the module prints — and the schedule underneath is then
   the alternative to doing nothing, priced against it.

   Vanilla JS, no dependencies, no network.
   ============================================================ */

(function () {
  'use strict';

  var mount = document.getElementById('amortization-sandbox');
  if (!mount) { return; }

  var DEFAULTS = { amount: 1000, apr: 20, years: 1, extra: 0 };
  var MAX_MONTHS = 600;              /* 50 years — the hard loop bound */

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

  function months(n) {
    var y = Math.floor(n / 12), m = n % 12;
    if (!y) { return m + (m === 1 ? ' month' : ' months'); }
    if (!m) { return y + (y === 1 ? ' year' : ' years'); }
    return y + (y === 1 ? ' year ' : ' years ') + m + (m === 1 ? ' month' : ' months');
  }

  mount.innerHTML =
    '<div class="sandbox-controls">' +
      '<label class="stacked" for="am-amount">' +
        '<span class="ctl-name">Loan amount</span>' +
        '<input type="number" id="am-amount" value="' + DEFAULTS.amount + '" min="100" max="5000000" step="500">' +
      '</label>' +
      '<label class="stacked" for="am-apr">' +
        '<span class="ctl-name">APR <span id="am-apr-out">' + DEFAULTS.apr + '</span>%</span>' +
        '<input type="range" id="am-apr" value="' + DEFAULTS.apr + '" min="0" max="35" step="0.05">' +
      '</label>' +
      '<label class="stacked" for="am-years">' +
        '<span class="ctl-name">Term <span id="am-years-out">' + DEFAULTS.years + '</span> yr</span>' +
        '<input type="range" id="am-years" value="' + DEFAULTS.years + '" min="1" max="40" step="1">' +
      '</label>' +
      '<label class="stacked" for="am-extra">' +
        '<span class="ctl-name">Extra per month</span>' +
        '<input type="number" id="am-extra" value="' + DEFAULTS.extra + '" min="0" max="100000" step="25">' +
      '</label>' +
      '<button type="button" id="am-reset">Reset to the worked example</button>' +
    '</div>' +
    '<div class="sandbox-readout" id="am-untouched" aria-live="polite"></div>' +
    '<div class="sandbox-readout" id="am-readout" aria-live="polite"></div>' +
    '<div class="sandbox-error" id="am-error" role="alert" hidden></div>' +
    '<div class="sandbox-scroll"><table id="am-table">' +
      '<thead><tr>' +
        '<th scope="col">#</th><th scope="col" class="num">Payment</th>' +
        '<th scope="col" class="num">Interest</th><th scope="col" class="num">Principal</th>' +
        '<th scope="col" class="num">Balance</th>' +
      '</tr></thead><tbody></tbody>' +
    '</table></div>' +
    '<p class="sandbox-note">' +
      'The scheduled payment is fixed for the term; what changes month to month is its split. ' +
      'Early on, most of it services interest. An extra payment goes entirely against principal, ' +
      'which is why a small monthly addition removes a disproportionate amount of total interest.' +
    '</p>';

  var elAmount = document.getElementById('am-amount');
  var elApr = document.getElementById('am-apr');
  var elYears = document.getElementById('am-years');
  var elExtra = document.getElementById('am-extra');
  var elAprOut = document.getElementById('am-apr-out');
  var elYearsOut = document.getElementById('am-years-out');
  var elReadout = document.getElementById('am-readout');
  var elUntouched = document.getElementById('am-untouched');
  var elError = document.getElementById('am-error');
  var elBody = document.querySelector('#am-table tbody');
  var elReset = document.getElementById('am-reset');

  function validate() {
    var amount = parseFloat(elAmount.value);
    var apr = parseFloat(elApr.value);
    var years = parseInt(elYears.value, 10);
    var extra = parseFloat(elExtra.value);

    if (!isFinite(amount) || amount <= 0) {
      return { error: 'Enter a loan amount greater than zero.' };
    }
    if (amount > 5000000) {
      return { error: 'Loan amount is capped at $5,000,000 here.' };
    }
    if (!isFinite(apr) || apr < 0) {
      return { error: 'APR cannot be negative. Enter 0 or more.' };
    }
    if (apr > 35) { return { error: 'APR is capped at 35% here.' }; }
    if (!isFinite(years) || years < 1 || years > 40) {
      return { error: 'Term must be a whole number of years between 1 and 40.' };
    }
    if (!isFinite(extra) || extra < 0) {
      return { error: 'Extra payment cannot be negative. Enter 0 or more.' };
    }
    return { amount: amount, apr: apr, years: years, extra: extra };
  }

  /* ---------- the schedule ----------
     Standard level-payment formula, with the 0% APR case handled
     separately so the division by i can never produce Infinity.  */

  function scheduledPayment(principal, i, n) {
    if (i === 0) { return principal / n; }
    return principal * i / (1 - Math.pow(1 + i, -n));
  }

  function amortize(principal, i, payment, cap) {
    var rows = [];
    var balance = principal;
    var totalInterest = 0;
    var m = 0;
    while (balance > 0.005 && m < cap) {
      m++;
      var interest = balance * i;
      var due = payment;
      if (due > balance + interest) { due = balance + interest; }   /* final short payment */
      var toPrincipal = due - interest;
      balance = balance - toPrincipal;
      if (balance < 0) { balance = 0; }
      totalInterest += interest;
      rows.push([m, due, interest, toPrincipal, balance]);
    }
    return { rows: rows, totalInterest: totalInterest, months: m, cleared: balance <= 0.005 };
  }

  function render() {
    elAprOut.textContent = parseFloat(elApr.value).toFixed(2).replace(/\.?0+$/, '') || '0';
    elYearsOut.textContent = elYears.value;

    var v = validate();
    if (v.error) {
      elError.hidden = false;
      elError.textContent = v.error;
      elBody.innerHTML = '';
      elReadout.innerHTML = '';
      elUntouched.innerHTML = '';
      return;
    }
    elError.hidden = true;

    /* The module's own worked example, restated live: a balance left
       untouched, on the simple-APR basis the example itself uses
       ("$1,000 at 20% APR untouched a year -> $1,200 owed"). This is
       deliberately NOT compounded monthly — matching the source's
       arithmetic matters more here than picking a different convention. */
    var untouched = v.amount * (1 + (v.apr / 100) * v.years);
    elUntouched.innerHTML =
      'Left untouched for ' + months(v.years * 12) + ' at ' + v.apr + '% APR, ' +
      esc(money(v.amount)) + ' becomes <span class="val">' + esc(money(untouched)) + '</span>' +
      ' — <span class="val">' + esc(money(untouched - v.amount)) + '</span> of interest for doing nothing.';

    var i = v.apr / 100 / 12;
    var n = v.years * 12;
    var base = scheduledPayment(v.amount, i, n);

    /* An extra payment large enough to clear the loan immediately
       is legal input, not an error — the schedule simply ends in
       one row. But if the scheduled payment cannot cover the
       first month's interest, the balance would grow forever, so
       that case is caught and explained rather than looped.      */
    if (base + v.extra <= v.amount * i + 0.004) {
      elError.hidden = false;
      elError.textContent =
        'At ' + v.apr + '% APR this payment would not even cover the first month\'s interest (' +
        money(v.amount * i) + '), so the balance would never fall. Raise the payment, ' +
        'shorten the term, or lower the rate.';
      elBody.innerHTML = '';
      elReadout.innerHTML = '';
      return;
    }

    var plain = amortize(v.amount, i, base, MAX_MONTHS);
    var actual = v.extra > 0 ? amortize(v.amount, i, base + v.extra, MAX_MONTHS) : plain;

    var rows = '';
    for (var k = 0; k < actual.rows.length; k++) {
      var r = actual.rows[k];
      rows += '<tr>' +
        '<td>' + r[0] + '</td>' +
        '<td class="num">' + esc(money(r[1])) + '</td>' +
        '<td class="num">' + esc(money(r[2])) + '</td>' +
        '<td class="num">' + esc(money(r[3])) + '</td>' +
        '<td class="num">' + esc(money(r[4])) + '</td>' +
      '</tr>';
    }
    elBody.innerHTML = rows;

    var out =
      'Scheduled payment: <span class="val">' + esc(money(base)) + '</span>/month' +
      (v.extra > 0 ? ' &nbsp;+&nbsp; extra <span class="val">' + esc(money(v.extra)) + '</span>' : '') +
      '<br>' +
      'Total interest paid: <span class="val">' + esc(money(actual.totalInterest)) + '</span>' +
      ' &nbsp;·&nbsp; paid off in <span class="val">' + months(actual.months) + '</span>';

    if (v.extra > 0) {
      var saved = plain.totalInterest - actual.totalInterest;
      var sooner = plain.months - actual.months;
      out += '<br>With the extra payment: <span class="val">' + esc(money(saved)) +
             '</span> less interest, and cleared <span class="val">' + months(sooner) +
             '</span> sooner.';
    }
    out += '<br>Against the untouched balance above, paying it down costs <span class="val">' +
           esc(money(untouched - v.amount - actual.totalInterest)) +
           '</span> less in interest.';
    elReadout.innerHTML = out;
  }

  elAmount.addEventListener('input', render);
  elApr.addEventListener('input', render);
  elYears.addEventListener('input', render);
  elExtra.addEventListener('input', render);
  elReset.addEventListener('click', function () {
    elAmount.value = DEFAULTS.amount;
    elApr.value = DEFAULTS.apr;
    elYears.value = DEFAULTS.years;
    elExtra.value = DEFAULTS.extra;
    render();
  });

  render();
})();
