# -*- coding: utf-8 -*-
"""Modules 03, 04, 05. Source lines 122-158."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chrome import *

NO_CONFUSION = """        <p>
          Module&nbsp;%s carries no Common Confusion callout in the source curriculum. The section is
          kept in place so every module has the same eight-part anatomy and the same anchors &mdash;
          %s
        </p>
"""

NO_CHECK = """        <p>
          Module&nbsp;%s has no Knowledge Check in the source curriculum. %s
        </p>
"""

# ============================== MODULE 3 ==============================

m3_hook = """        <p>
          <a href="module1.html">Module&nbsp;01</a> showed compounding working for you. This module is
          the same arithmetic pointed the other way, and it is the reason a single sentence about
          credit &mdash; &ldquo;pay the high-interest balance first&rdquo; &mdash; is not folk wisdom
          but a direct consequence of the exponent.
        </p>
        <p>
          It also answers a question most people never ask out loud: why <em>are</em> a credit card and
          a mortgage priced so differently, when the same bank is lending in both cases to the same
          person?
        </p>
"""

m3_refresh = refresher('What You Already Half-Remember &mdash; BUS 100',
"""          <p>
            <strong>Fractional reserve banking</strong> &mdash; banks lend out most deposits and share
            a slice of what they earn with depositors.
          </p>
""") + """        <p>
          That slice is the 4% from <a href="module0.html#worked-examples">Module&nbsp;0.2's worked
          example</a>, seen from the bank's side of the counter.
        </p>
"""

m3_definitions = definition('3.1', 'Credit Risk',
"""          <p>The risk a borrower won't repay; priced directly into the rate charged.</p>
""") + """        <p>
          &ldquo;Priced directly into the rate charged&rdquo; is the load-bearing half of that
          definition, and the Common Confusion in <a href="#common-confusions">&sect;5</a> is what it
          looks like in practice.
        </p>
"""

m3_worked = example("""          <p>
            \\$1,000 at 20% APR untouched a year &rarr; \\$1,200 owed &mdash; the same compounding math
            as <a href="module1.html#definitions">Module&nbsp;1</a>, working against you. Why paying
            off high-interest debt usually outranks investing.
          </p>
""") + """        <p>
          Set that against <a href="module1.html#worked-examples">Module&nbsp;1's worked example</a>
          &mdash; \\$1,000 growing to \\$1,157.63 over three years at 5% &mdash; and the comparison is
          stark: the debt gains \\$200 in one year while the investment gains \\$157.63 in three. That
          gap, not a moral argument, is the case for clearing high-interest debt first.
        </p>
        <p>
          The <a href="#sandbox">sandbox</a> below extends this into the form the decision usually
          actually arrives in: a loan with a schedule, where you can see exactly how much of each
          payment is interest and what an extra payment per month is worth.
        </p>
"""

m3_confusions = confusion("""          <p>
            A credit card rate (20%+) vs. a mortgage rate (5-7%) isn't arbitrary &mdash; mortgages are
            <strong>secured</strong> (collateral seizable), cards are <strong>unsecured</strong>
            (nothing to seize but a promise).
          </p>
""")

m3_checks = NO_CHECK % ('03', """Its check is the sandbox below, which is meant to be run against your own
          loan rather than answered from a page. The next Knowledge Checks appear in
          <a href="module6.html#knowledge-checks">Module&nbsp;06</a>.""")

m3_sandbox = """        <p>
          A loan is Module&nbsp;1's formula run monthly, in reverse, until the balance reaches zero.
          Enter an amount, an APR and a term, and the full amortization schedule generates below
          &mdash; every payment split into the part that services interest and the part that actually
          reduces what you owe.
        </p>
        <p>
          The second input is the interesting one. Add an extra amount to each monthly payment and the
          tool recomputes total interest paid and the time saved. On a high-APR balance the numbers
          are usually larger than people expect, and that is the module's worked example generalised:
          the arithmetic that makes debt expensive is the same arithmetic that makes early repayment
          valuable.
        </p>
        <p>
          It opens on <strong>\\$1,000 at 20% APR over one year</strong> &mdash; the worked example's
          own figures. The first line it prints is that example restated exactly: left untouched,
          \\$1,000 becomes \\$1,200. Everything below that line is what happens instead if you pay it
          down, priced against the \\$200 that doing nothing costs.
        </p>
        <div class="sandbox-panel" id="amortization-sandbox" data-widget="amortization">
          <noscript>
            <p class="sandbox-note">
              This sandbox needs JavaScript. The worked example it extends is complete in
              <a href="#worked-examples">&sect;4</a> above.
            </p>
          </noscript>
        </div>
"""

m3_sections = [
    ('hook', 'The Hook: Compounding, Pointed the Other Way', m3_hook),
    ('refresher', 'What You Already Half-Remember', m3_refresh),
    ('definitions', 'Definitions', m3_definitions),
    ('worked-examples', 'Worked Examples', m3_worked),
    ('common-confusions', 'Common Confusions', m3_confusions),
    ('knowledge-checks', 'Knowledge Checks', m3_checks),
    ('sandbox', 'Sandbox: The Amortization Generator', m3_sandbox),
    ('recap', 'Recap &amp; Glossary Terms',
     recap([("Credit Risk", "The risk a borrower won't repay")])),
]

# ============================== MODULE 4 ==============================

m4_hook = """        <p>
          You are considering paying for a certification. It costs money now and might earn you more
          later. Should you?
        </p>
        <p>
          That question has a formal answer, and companies have used it for decades to decide whether
          to build a factory. It is the same question, at a different scale, and
          <a href="module1.html#definitions">Module&nbsp;1's formula</a> is already most of the
          machinery. This module supplies the rest &mdash; and then is honest about the fact that the
          machinery is only ever as good as the guesses you feed it.
        </p>
"""

m4_refresh = refresher('What You Already Half-Remember &mdash; BUS 100',
"""          <p>
            Companies use <strong>capital budgeting</strong> to decide if future cash from a project is
            worth more, today, than its cost now.
          </p>
""")

m4_definitions = definition('4.1', 'NPV',
"""          <p>Present value of future benefits minus present cost.</p>
          <p>$$NPV = \\left(\\sum_{t=1}^{n} \\frac{CF_t}{(1+r)^t}\\right) - \\text{Initial Cost}$$</p>
""") + """        <p>
          Read the sum slowly: it is <a href="module1.html#definitions">Module&nbsp;1's present-value
          formula</a> applied once per year and added up. Nothing new has been introduced &mdash; only
          repeated. The same sum reappears, with free cash flow in the numerator, as the discounted
          cash flow of <a href="module7.html#definitions">Module&nbsp;7.3</a>.
        </p>
"""

m4_worked = example("""          <p>\\$2,000 certification, +\\$3,000/year for 3 years, 6% discount rate:</p>
          <p>$$NPV = 2830.19+2669.99+2518.86-2000=\\$6{,}019.04$$</p>
          <p>
            Strongly positive on these assumptions &mdash; the answer hinges entirely on honest input
            estimates.
          </p>
""") + """        <p>
          The three numbers being added are the three annual \\$3,000 benefits, each discounted back by
          one, two and three years respectively at 6%. Notice how much smaller the third one is than
          the first: that shrinkage is the exponent from
          <a href="module1.html#common-confusions">Module&nbsp;1's Common Confusion</a>, and it is why
          the discount rate is the assumption worth arguing about.
        </p>
        <p>
          The <a href="#sandbox">sandbox</a> below opens on exactly these numbers, so you can test that
          last sentence rather than take it on trust.
        </p>
"""

m4_confusions = NO_CONFUSION % ('04', """the trap here is not conceptual but arithmetic honesty, and the
          worked example names it directly: the answer hinges entirely on honest input estimates. The
          nearest named confusion is
          <a href="module7.html#common-confusions">Module&nbsp;7.3's</a>, which says the same thing
          about a DCF in stronger terms &mdash; a valuation does not produce &ldquo;the&rdquo; correct
          value, it produces <em>a</em> value, entirely dependent on your assumptions.""")

m4_checks = NO_CHECK % ('04', """Its check is the sandbox: change one assumption at a time and watch
          the conclusion move. The next Knowledge Checks appear in
          <a href="module6.html#knowledge-checks">Module&nbsp;06</a>.""")

m4_sandbox = """        <p>
          The worked example's conclusion &mdash; &ldquo;strongly positive&rdquo; &mdash; is a
          conclusion about a specific set of assumptions, not about certifications. This tool lets you
          break it.
        </p>
        <p>
          It opens on the worked example's own figures: <strong>\\$2,000 cost, \\$3,000 per year for
          three years, 6% discount rate</strong>, producing the same \\$6,019.04. Every cash flow is
          editable and the discount rate is a slider. Push the rate up, or cut the third year's
          benefit, and watch how far the assumptions have to move before the answer changes sign
          &mdash; that distance, not the headline number, is what tells you how safe the decision is.
        </p>
        <div class="sandbox-panel" id="npv-sandbox" data-widget="npv">
          <noscript>
            <p class="sandbox-note">
              This sandbox needs JavaScript. The worked example it extends is complete in
              <a href="#worked-examples">&sect;4</a> above.
            </p>
          </noscript>
        </div>
"""

m4_sections = [
    ('hook', 'The Hook: Should You Pay for the Certification?', m4_hook),
    ('refresher', 'What You Already Half-Remember', m4_refresh),
    ('definitions', 'Definitions', m4_definitions),
    ('worked-examples', 'Worked Examples', m4_worked),
    ('common-confusions', 'Common Confusions', m4_confusions),
    ('knowledge-checks', 'Knowledge Checks', m4_checks),
    ('sandbox', 'Sandbox: The NPV Scenario Tool', m4_sandbox),
    ('recap', 'Recap &amp; Glossary Terms',
     recap([('NPV', 'Present value of benefits minus present cost')])),
]

# ============================== MODULE 5 ==============================

m5_hook = """        <p>
          Up to here the book has been about your own money moving through time. From this module on it
          is about other people's businesses, and what it means to own a piece of one or to lend to
          one.
        </p>
        <p>
          Four definitions do all the work, and the fourth is the one that makes the other three
          practical: a single product that delivers the third's benefit in one purchase. Nothing here
          requires a prior course &mdash; which is why this module, unlike the three before it, opens
          with no refresher box.
        </p>
"""

m5_definitions = definition('5.1', 'Stock (Equity)',
"""          <p>Ownership share in a company.</p>
""") + definition('5.2', 'Bond',
"""          <p>
            A loan you make to a company/government, repaid at a set date
            (<strong>principal</strong>) plus interest (<strong>coupons</strong>).
          </p>
""") + why("""          <p>
            A stock is a slice of a bakery &mdash; upside and downside both flow to you. A bond is
            lending the owner money &mdash; a predictable, contractual return regardless of how
            business goes (barring bankruptcy).
          </p>
""", label='Why This Matters (analogy)') + definition('5.3', 'Diversification',
"""          <p>Spreading money so no single failure badly hurts the total.</p>
""") + definition('5.4', 'Index Fund / ETF',
"""          <p>
            One product holding hundreds/thousands of underlying securities &mdash; instant
            diversification in a single purchase.
          </p>
""") + """        <p>
          Definition&nbsp;5.4 is the hinge of the second half of this book.
          <a href="module6.html#definitions">Module&nbsp;6.3</a> builds an entire portfolio core out of
          it, and <a href="module7.html#definitions">Module&nbsp;7.6</a> shows how to check, from a real
          fact sheet, whether a given ETF's diversification is genuine or only nominal.
        </p>
"""

m5_worked = example("""          <p>
            \\$1,000 in one stock, &minus;50% &rarr; \\$500. \\$1,000 spread across 100 stocks, one drops
            50% &rarr; \\$995.
          </p>
""") + """        <p>
          The comparison is the entire argument for Definition&nbsp;5.3, and it is worth noting what it
          does <em>not</em> claim: diversification did not prevent the 50% loss, it made the loss
          irrelevant to the total. That distinction is what
          <a href="module6.html#definitions">Module&nbsp;6.1</a> means when it redefines risk as
          volatility rather than as the chance of losing everything.
        </p>
"""

m5_confusions = NO_CONFUSION % ('05', """this module is definitional groundwork, and its ideas become
          error-prone only once they are being applied. The confusions that belong to them are named
          where that happens: <a href="module6.html#common-confusions">Module&nbsp;6.2</a> on what
          &ldquo;core&rdquo; actually means, and
          <a href="module7.html#common-confusions">Module&nbsp;7.6</a> on holdings count overstating
          real diversification.""")

m5_checks = NO_CHECK % ('05', """Its ideas are checked where they are first applied, in
          <a href="module6.html#knowledge-checks">Module&nbsp;06</a>, whose first check asks you to
          match Definition&nbsp;5.4's product to two different time horizons.""")

m5_sections = [
    ('hook', 'The Hook: Owning a Business, or Lending to One', m5_hook),
    ('definitions', 'Definitions', m5_definitions),
    ('worked-examples', 'Worked Examples', m5_worked),
    ('common-confusions', 'Common Confusions', m5_confusions),
    ('knowledge-checks', 'Knowledge Checks', m5_checks),
    ('recap', 'Recap &amp; Glossary Terms', recap([
        ('Stock', 'Ownership share in a company'),
        ('Bond', 'A loan you make to a company/government'),
        ('Diversification', 'Spreading risk across many investments'),
    ])),
]

if __name__ == '__main__':
    print(write('module3.html', module_page(3, m3_sections, widget='amortization.js')))
    print(write('module4.html', module_page(4, m4_sections, widget='npv-scenario.js')))
    print(write('module5.html', module_page(5, m5_sections)))
