# -*- coding: utf-8 -*-
"""Module 07 — Institutional-Grade Equity & Sector Analysis. Source lines 240-350, all six subsections."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chrome import *

hook = """        <p>
          Everything above is the engine; this module is how you drive it, the way a junior equity
          research analyst would on day one. Gold mining runs as the example throughout.
        </p>
        <p>
          Six sections, and the shape is the shape of an actual research process: the vocabulary of a
          quote (7.1), the four-pillar framework that turns a quote into a thesis (7.2), the valuation
          method that framework feeds (7.3), the documents you have to read to fill it in (7.4), the
          tools that get you there and their limits (7.5), and a real ETF fact sheet read line by line
          (7.6).
        </p>
        <p>
          One thing to hold in mind throughout: <a href="module6.html#definitions">Module&nbsp;6.5</a>
          already decided how much money any conclusion reached here is allowed to move. This module
          tells you what to buy; it does not tell you how much, because that was settled before you
          opened it.
        </p>
"""

definitions = """        <h3>7.1 How to Read a Stock</h3>
""" + definition('7.1', 'Ticker', '          <p>The short code identifying a stock on an exchange.</p>\n') \
  + definition('7.2', 'Market Capitalization',
"""          <p>$\\text{Share Price} \\times \\text{Shares Outstanding}$.</p>
""") + why("""          <p>
            Price alone tells you almost nothing about size &mdash; always think in market cap, never
            raw price.
          </p>
""") + definition('7.3', 'EPS', """          <p>$\\text{Net Income} / \\text{Shares Outstanding}$.</p>\n""") \
  + definition('7.4', 'P/E Ratio',
"""          <p>
            $\\text{Share Price}/EPS$ &mdash; roughly, years of unchanged profit to &ldquo;earn
            back&rdquo; the price. High P/E &rarr; growth expectations (or expensive); low P/E &rarr;
            cheap, or declining-profit expectations. P/E alone never tells you which.
          </p>
""") + definition('7.5', 'Dividend Yield',
"""          <p>$\\text{Annual Dividend per Share}/\\text{Share Price}$.</p>
""") + definition('7.6', 'Beta ($\\beta$)',
"""          <p>
            Sensitivity to overall market moves. Its worked example &mdash; a miner with
            $\\beta=1.8$ against a 10% TSX move &mdash; is in
            <a href="#worked-examples">&sect;4</a>.
          </p>
""") + definition('7.7 &amp; 7.8', '52-Week Range and Volume',
"""          <p>
            A big move on low volume is a weaker signal than the same move on high volume.
          </p>
""") + """
        <h3>7.2 The Four-Pillar Institutional Research Framework</h3>

        <h4>Pillar 1 &mdash; Macroeconomic Environment</h4>
        <p><em>What's the broad backdrop doing to this asset?</em></p>
""" + definition('7.9', 'Real Interest Rate',
"""          <p>$r_{\\text{real}} \\approx r_{\\text{nominal}} - \\pi$.</p>
""") + """        <p>
          Gold is non-yielding &mdash; holding it costs the interest given up elsewhere (its opportunity
          cost = the real rate). Real rates fall &rarr; gold demand tends to rise. Track: central bank
          policy path (and its <em>expected future direction</em>), geopolitical risk premium, currency
          strength (DXY &mdash; a weaker USD tends to support USD-priced commodities).
        </p>
        <p>
          That &ldquo;opportunity cost&rdquo; is
          <a href="module1.html#refresher">Module&nbsp;1's ECON&nbsp;201 refresher</a>, arriving with
          real money attached; the identity itself returns as
          <a href="module8.html">Module&nbsp;08</a>.
        </p>

        <h4>Pillar 2 &mdash; Industry &amp; Fundamental Drivers</h4>
        <p><em>What's happening at the industry level?</em></p>
""" + definition('7.10', 'Operating Leverage',
"""          <p>
            Profit changes disproportionately to revenue because costs are largely fixed. Its worked
            example &mdash; a \\$1,200/oz fixed cost against a 10% gold move &mdash; is in
            <a href="#worked-examples">&sect;4</a>.
          </p>
""") + """        <p>
          Track supply/demand mapping and M&amp;A consolidation trends (majors acquiring juniors when
          exploration budgets shrink).
        </p>

        <h4>Pillar 3 &mdash; Structural Asset &amp; Index Mechanics</h4>
        <p><em>Does the actual instrument behave the way the thesis suggests?</em></p>
""" + definition('7.11 &amp; 7.12', 'Market-Cap-Weighted Index vs. Equal-Weighted Index',
"""          <p>
            A market-cap-weighted miners ETF behaves mostly like its largest few names; an
            equal-weighted version (e.g., the index behind [TSE:ZGD]) gives mid-tier miners equal say
            &mdash; typically higher volatility, stronger upside capture in a rally, sharper downside in
            a downturn. Neither is &ldquo;better&rdquo; &mdash; they express different bets.
          </p>
""") + definition('7.13', 'Stock Split',
"""          <p>
            Always use <strong>split-adjusted</strong> price data; an unadjusted chart can show a fake
            &ldquo;90% crash&rdquo; on a split date.
          </p>
""") + """
        <h4>Pillar 4 &mdash; Predictive Frameworks &amp; Scenario Modeling</h4>
        <p><em>What are the plausible forward paths?</em></p>
""" + definition('7.14', 'Scenario Analysis',
"""          <p>
            Multiple internally consistent narratives (bull/base/bear) instead of one point forecast
            &mdash; the same DCF (<a href="#definitions">7.3</a>), run multiple times under different
            assumptions.
          </p>
""") + table(
    ['Scenario', 'Macro (Pillar 1)', 'Industry (Pillar 2)', 'Thesis'],
    [['Bull', 'Faster rate cuts, elevated geopolitical premium',
      'Continued central bank accumulation, constrained supply',
      'Price and margins expand; equal-weighted outperforms'],
     ['Base', 'Slow, expected easing', 'Moderate demand/supply growth',
      'Range-bound; performance driven by execution'],
     ['Bear', 'Resilience delays cuts, elevated real rates', 'Demand stalls',
      'Underperformance; high-beta names hit hardest']],
    caption='The bull / base / bear scenario table') + """        <p>
          The <a href="#sandbox">sandbox</a> in &sect;7 makes this table live: each of the three
          scenarios gets its own editable growth and discount rate, feeding a simplified DCF, so the
          <em>range</em> across scenarios becomes a number rather than three sentences.
        </p>

        <h3>7.3 Valuation Core: Discounted Cash Flow (DCF)</h3>
""" + definition('7.15', 'Valuation', '          <p>Estimating true worth vs. current price.</p>\n') \
  + definition('7.16', 'DCF',
"""          <p>
            Forecasting future cash, discounting each year to present value
            (<a href="module1.html#definitions">Module&nbsp;1's formula</a>), summing.
          </p>
          <p>$$\\text{Company Value} = \\sum_{t=1}^{n} \\frac{FCF_t}{(1+r)^t}$$</p>
""") + """        <p>
          That sum is <a href="module4.html#definitions">Module&nbsp;4's NPV</a> with free cash flow in
          the numerator and no initial cost subtracted. The book has now used the same discounting
          operation four times &mdash; a savings account, a loan, a certification, and a company
          &mdash; without ever introducing a second one.
        </p>

        <h3>7.4 A Practical Reading Checklist</h3>
        <ol>
          <li>
            Annual report / 10-K (US) or SEDAR+ filing (Canada) &mdash; management's narrative, risk
            factors, audited statements.
          </li>
          <li>
            Revenue/margin trend, 3-5 years &mdash; improving, flat, or deteriorating, and why (per
            management).
          </li>
          <li>
            Balance sheet health &mdash; debt relative to cash flow
            (<a href="module2.html">Module&nbsp;2's</a> ratios).
          </li>
          <li>
            Free cash flow, not just net income &mdash; harder to manipulate via accounting choices.
          </li>
          <li>
            Peer comparison &mdash; does a P/E/margin/growth gap make sense given Pillars&nbsp;1-4, or
            is it a pricing anomaly?
          </li>
        </ol>

        <h3>7.5 Using Google Finance in Practice (With Google One)</h3>
        <p>
          <strong>Good for:</strong> real-time-ish quotes/charting (the 7.1 vocabulary), watchlists
          (sync via Google One), news-per-ticker, quick peer P/E comparison.
        </p>
        <p>
          <strong>Not built for &mdash; go elsewhere instead:</strong> deep historical financials
          &rarr; <strong>SEDAR+</strong> (Canada) / <strong>EDGAR</strong> (US); custom screening
          &rarr; <strong>TradingView</strong> / <strong>Yahoo Finance</strong> screeners;
          corporate-actions/split auditing &rarr; exchange announcements or Yahoo's historical export;
          DCF modeling &rarr; your own spreadsheet, using filing data as inputs.
        </p>
        <p>
          <strong>Workflow:</strong> watchlist in Google Finance &rarr; pull filings from SEDAR+/EDGAR
          for interesting names &rarr; screen peers on TradingView/Yahoo &rarr; build your own
          DCF/scenario table.
        </p>

        <h3>7.6 Reading an ETF Fact Sheet, Financial Reports, and News</h3>
        <p>Worked using Global X's <strong>PAVE</strong> (U.S. Infrastructure Development ETF) fact sheet.</p>

        <h4>Header/category</h4>
        <p>&ldquo;Equity - Thematic - Infrastructure &amp; Environment.&rdquo;</p>
""" + definition('7.17', 'Thematic ETF',
"""          <p>Built around a narrative/trend, not a broad market segment.</p>
""") + why("""          <p>
            A thematic ETF is never core-portfolio material
            (<a href="module6.html#definitions">Module&nbsp;6.2</a>) &mdash; by definition it's
            concentrated, not structurally diversified. It belongs in the satellite sleeve, sized and
            researched like a stock pick.
          </p>
""") + """
        <h4>Key Information</h4>
""" + definition('7.18', 'Inception Date',
"""          <p>
            PAVE: 03/06/2017, ~9-year track record &mdash; a fund under 3 years old has little history
            worth weighting.
          </p>
""") + definition('7.19', 'Underlying Index',
"""          <p>
            PAVE tracks the Indxx U.S. Infrastructure Development Index &mdash; the ETF follows this
            rulebook, it doesn't invent its own holdings.
          </p>
""") + """        <p>
          <strong>Number of Holdings (100):</strong> diversified <em>within the theme</em>, not across
          the whole economy.
        </p>
""" + definition('7.20', 'AUM',
"""          <p>\\$14.57B &mdash; higher AUM &rarr; better liquidity, lower shutdown risk.</p>
""") + """        <p>
          <strong>Total Expense Ratio (0.47%):</strong> roughly double a
          <a href="module6.html#definitions">Module&nbsp;6.3</a> all-in-one ETF &mdash; the cost of a
          narrower, curated exposure.
        </p>

        <h4>Trading Details</h4>
""" + definition('7.21', 'CUSIP',
"""          <p>
            A security's unique &ldquo;serial number.&rdquo; Listing on Cboe BZX (vs. NYSE/Nasdaq) says
            nothing about quality &mdash; just a different legitimate venue.
          </p>
""") + """
        <h4>Performance table (real PAVE numbers)</h4>
""" + table(
    ['', '1Y'],
    [['NAV', '36.30%'], ['Market Price', '36.36%'], ['Index', '36.93%']],
    caption='PAVE, 1-year returns as published') + definition('7.22-7.24',
    'NAV, Market Price return, Tracking Difference',
"""          <p>
            Here: Index 36.93% vs. NAV 36.30% &rarr; <strong>&minus;0.63pp tracking difference</strong>,
            mostly explained by the 0.47% expense ratio &mdash; the fee's drag, made visible on a real
            sheet.
          </p>
""") + """        <p>
          The Knowledge Check in <a href="#knowledge-checks">&sect;6</a> generalises exactly this
          arithmetic.
        </p>

        <h4>Holdings/sector breakdown</h4>
        <p>
          Top holding (Quanta Services) is only 4.06% &mdash; no single-name dominance &mdash; but
          sector breakdown shows 73.34% Industrials, confirming the &ldquo;Thematic&rdquo;
          concentration despite 100 nominal holdings. <strong>This is how you check whether
          diversification (<a href="module5.html#definitions">Module&nbsp;5.2</a>) is real or
          superficial</strong> &mdash; holdings count alone can overstate it.
        </p>

        <h4>The fine print</h4>
        <p>
          Risk disclosures (&ldquo;narrowly focused investments typically exhibit higher
          volatility,&rdquo; specific regulatory/construction-financing/environmental risks) are
          effectively the fund manager's own pre-written Pillar&nbsp;1/2 risk factors &mdash; never skip
          this section.
        </p>

        <h4>Reading financial reports &mdash; extending 7.4</h4>
""" + definition('7.25', 'MD&amp;A',
"""          <p>
            Management's own explanation of <em>why</em> the numbers moved, not just what they are. Two
            companies can post identical revenue growth for very different (and very differently
            durable) reasons &mdash; MD&amp;A is where you find out which. Read it as management's
            framing, not a neutral account; cross-check specific claims against the statements
            themselves.
          </p>
""") + """
        <h4>Reading financial news &mdash; a filter, not a trigger</h4>
""" + definition('7.26', 'News Flow',
"""          <p>The ongoing stream of headlines about a company, sector or economy.</p>
""") + """        <ol>
          <li>Which pillar does this headline actually touch?</li>
          <li>
            Does it change your bull/base/bear table, or was it already priced in? (Markets react to
            <em>surprises relative to expectations</em>, not confirmations.)
          </li>
          <li>
            Is it a single data point or a trend? Update the thesis &mdash; don't discard or blindly
            confirm it on one headline.
          </li>
        </ol>
"""

worked = """        <h3>From 7.1 &mdash; Beta, and why miners are leveraged plays</h3>
""" + example("""          <p>
            TSX +10%, a miner with $\\beta=1.8$ &rarr; roughly 18% expected move same direction &mdash;
            why mining equities are &ldquo;leveraged plays&rdquo; on their commodity.
          </p>
""") + """        <h3>From 7.2 &mdash; Operating leverage on a gold miner's margin</h3>
""" + example("""          <p>
            Fixed cost \\$1,200/oz, gold \\$2,000&rarr;\\$2,200 (+10%) &rarr; margin
            \\$800&rarr;\\$1,000/oz (+25%) &mdash; why miner equities often out-move the commodity
            itself.
          </p>
""") + """        <p>
          Read the two together and they are the same phenomenon seen from two levels. Beta measures the
          amplification statistically, from price history; operating leverage explains where the
          amplification physically comes from, in the cost structure. A thesis that cites one without
          the other is only half a thesis.
        </p>
"""

confusions = """        <h3>From 7.1 &mdash; &ldquo;Cheap&rdquo; is not a share price</h3>
""" + confusion("""          <p>
            Treating a low nominal share price as &ldquo;cheap.&rdquo; Always normalize through market
            cap and P/E.
          </p>
""") + """        <h3>From 7.2 &mdash; The base case is not the prediction</h3>
""" + confusion("""          <p>
            Treating &ldquo;base case&rdquo; as the prediction. The <em>range</em> across scenarios, and
            sensitivity to key assumptions, often matters more than any single point estimate.
          </p>
""") + """        <h3>From 7.3 &mdash; A DCF produces <em>a</em> value, not <em>the</em> value</h3>
""" + confusion("""          <p>
            A DCF doesn't produce &ldquo;the&rdquo; correct value &mdash; it produces <em>a</em> value,
            entirely dependent on your assumptions. Valuation is reasoned estimation, not precise
            measurement.
          </p>
""") + """        <h3>From 7.6 &mdash; Volume of coverage is not importance</h3>
""" + confusion("""          <p>
            News <em>volume</em> &ne; news <em>importance</em> &mdash; go back to step 1 rather than
            reacting to how loudly something is covered.
          </p>
""")

checks = check('7.1', 'Module 7.2, Pillar 1 &middot; real rates and gold',
"""          <p>Fed signals faster rate cuts &mdash; first-order effect on gold?</p>
""",
"""            <p>
              Real rates expected to fall further &rarr; opportunity cost of holding gold falls &rarr;
              demand (and typically price) tends to rise, all else equal &mdash; &ldquo;all else
              equal&rdquo; being exactly what Pillars&nbsp;2-4 unpack.
            </p>
""") + check('7.2', 'Module 7.6 &middot; expense ratio and tracking difference',
"""          <p>
            Two ETFs on the same index, 0.10% vs. 0.80% expense ratio &mdash; which shows a bigger
            negative tracking difference over 5 years?
          </p>
""",
"""            <p>
              The 0.80% fund &mdash; a bigger structural drag, compounding the same way
              <a href="module1.html#worked-examples">Module&nbsp;1.2's math</a> works, in reverse.
            </p>
""")

sandbox = """        <p>
          The scenario table in <a href="#definitions">7.2</a> is three narratives. This turns them into
          three numbers.
        </p>
        <p>
          Each of bull, base and bear gets its own growth-rate and discount-rate input, feeding the
          simplified DCF of <a href="#definitions">7.3</a> &mdash; a five-year free-cash-flow forecast
          discounted back and summed. The three outputs sit side by side, with the spread between bull
          and bear reported underneath.
        </p>
        <p>
          That spread is the point. <a href="#common-confusions">&sect;5's second Common
          Confusion</a> says the range across scenarios often matters more than any single point
          estimate; this is where you can check how quickly that range widens when you move a
          discount rate by a single percentage point.
        </p>
        <div class="sandbox-panel" id="dcf-sandbox" data-widget="dcf">
          <noscript>
            <p class="sandbox-note">
              This sandbox needs JavaScript. The scenario table it operationalises is complete in
              <a href="#definitions">&sect;3</a> above.
            </p>
          </noscript>
        </div>
"""

recap_terms = [
    ('Ticker', 'Short code identifying a stock on an exchange'),
    ('Market Cap', 'Share price &times; shares outstanding'),
    ('EPS', 'Net income &divide; shares outstanding'),
    ('P/E Ratio', 'Share price &divide; EPS'),
    ('Dividend Yield', 'Annual dividend per share &divide; share price'),
    ('Beta', "A stock's sensitivity to overall market moves"),
    ('Operating Leverage', 'Profit changing disproportionately to revenue due to fixed costs'),
    ('Market-Cap-Weighted Index', 'Index weighted by company size'),
    ('Equal-Weighted Index', 'Index weighting all holdings equally'),
    ('Stock Split', 'Share count up, price per share down proportionally'),
    ('Scenario Analysis', 'Multiple forward narratives (bull/base/bear) instead of one forecast'),
    ('Valuation', 'Estimating true worth vs. current price'),
    ('DCF', 'Valuing something by discounting its future cash flows'),
    ('Thematic ETF', 'An ETF built around a narrative/trend rather than a broad market segment'),
    ('Inception Date', 'The date a fund began trading'),
    ('Underlying Index', 'The rulebook an ETF is built to track'),
    ('AUM', 'Total dollar value currently invested in a fund'),
    ('CUSIP', 'A unique identifying &ldquo;serial number&rdquo; for a security'),
    ('NAV', 'The theoretical per-share value of everything a fund holds'),
    ('Market Price Return', "What you'd actually earn trading the ETF on-exchange"),
    ('Tracking Difference', "The gap between a fund's actual return and its index's return"),
    ('MD&amp;A', "Management's own written explanation of why the numbers moved"),
    ('News Flow', 'The ongoing stream of headlines about a company/sector/economy'),
]

sections = [
    ('hook', 'The Hook: Driving the Engine', hook),
    ('definitions', 'Definitions', definitions),
    ('worked-examples', 'Worked Examples', worked),
    ('common-confusions', 'Common Confusions', confusions),
    ('knowledge-checks', 'Knowledge Checks', checks),
    ('sandbox', 'Sandbox: The DCF / Scenario Table', sandbox),
    ('recap', 'Recap &amp; Glossary Terms', recap(recap_terms)),
]

if __name__ == '__main__':
    print(write('module7.html', module_page(7, sections, widget='dcf-scenario-sandbox.js')))
