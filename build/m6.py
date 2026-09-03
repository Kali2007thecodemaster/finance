# -*- coding: utf-8 -*-
"""Module 06 — Canadian Investment Strategy. Source lines 162-236, all seven subsections."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chrome import *

hook = """        <p>
          <a href="module5.html">Module&nbsp;05</a> ended with a product that delivers diversification
          in a single purchase. This module is about what to do with it &mdash; and the answer turns
          out to be mostly a question about <em>structure</em> rather than about which company to buy.
        </p>
        <p>
          Seven sections, and they run in a deliberate order: why structure matters more than picking
          skill (6.1), the split that operationalises it (6.2), what goes in the large half (6.3),
          which account to hold it in &mdash; the one distinctly Canadian question here (6.4), how big
          the small half is allowed to be (6.5), how to keep it that size (6.6), and one complete
          worked blueprint (6.7).
        </p>
        <p>
          Individual stock analysis is deliberately <em>not</em> in this module. It is
          <a href="module7.html">Module&nbsp;07</a>, and the ordering is the point: the structure is
          decided first, and only then is anything allowed into it.
        </p>
"""

definitions = """        <h3>6.1 Why Structure Beats Stock-Picking Skill</h3>
""" + definition('6.1', 'Risk (financial sense)',
"""          <p>
            Volatility &mdash; how much a value bounces around, not &ldquo;chance of losing
            everything.&rdquo;
          </p>
""") + why("""          <p>
            Most of a portfolio's long-run outcome comes from <em>structure</em> &mdash; equity/bond
            split, diversification, discipline &mdash; not which individual stock got picked. Structure
            is the foundation; individual analysis (<a href="module7.html">Module&nbsp;7</a>) is layered
            on top deliberately.
          </p>
""") + """
        <h3>6.2 The Core-Satellite Strategy</h3>
""" + definition('6.2', 'Core-Satellite Strategy',
"""          <p>
            Most capital (&ldquo;core&rdquo;) in broad, low-cost, diversified holdings; a smaller,
            bounded portion (&ldquo;satellite&rdquo;) in individual stock picks or higher-conviction
            ideas.
          </p>
""") + why("""          <p>
            The core is a building's foundation &mdash; boring on purpose, built to never fail. The
            satellite is the architecture on top, where deliberate risk is allowed because a mistake
            there can't take the whole structure down.
          </p>
""", label='Why This Matters (analogy)') + """
        <h3>6.3 Building the Core: Canadian All-in-One ETFs</h3>
""" + definition('6.3', 'All-in-One ETF',
"""          <p>
            A single ETF holding a fixed, auto-rebalanced mix of other ETFs (Canadian/US/international
            equity, bonds).
          </p>
""") + table(
    ['Ticker', 'Equity / Bond split', 'Use case'],
    [['VEQT / XEQT', '100 / 0', 'Long horizon (10+ yrs), full growth'],
     ['VGRO / XGRO', '80 / 20', 'Long horizon, slightly more stability'],
     ['VBAL / XBAL', '60 / 40', 'Medium horizon, balanced'],
     ['VCNS / XCNS', '40 / 60', 'Shorter horizon, capital preservation leaning'],
     ['VCIP / XCIP', '20 / 80', 'Very short horizon, mostly stability']],
    caption='Canadian all-in-one ETFs, by equity/bond split') + """        <p>
          This table <em>is</em> the glide path for a house-purchase bucket (VBAL sliding toward
          VCNS/VCIP) and the retirement-bucket logic (VEQT/XEQT) from earlier in your planning.
        </p>
        <p>
          The first Knowledge Check in <a href="#knowledge-checks">&sect;6</a> is on exactly this table.
        </p>

        <h3>6.4 Account Placement: A Distinctly Canadian Consideration</h3>
""" + definition('6.4', 'Withholding Tax',
"""          <p>Tax a foreign government deducts at source from dividends paid abroad.</p>
""") + why("""          <p>
            The US withholds 15% on dividends to Canadian investors by default &mdash; but:
          </p>
          <ul>
            <li>
              <strong>RRSP:</strong> the Canada-US tax treaty <strong>eliminates</strong> this
              withholding on US-listed holdings &mdash; RRSP's biggest asset-location edge over a
              TFSA.
            </li>
            <li>
              <strong>TFSA / FHSA:</strong> the treaty exemption does <strong>not</strong> apply
              &mdash; the 15% is withheld and effectively lost, since these accounts' tax-free status
              isn't recognized by the IRS.
            </li>
          </ul>
""") + definition('6.5', 'Dividend Tax Credit',
"""          <p>
            Reduces tax on <em>Canadian</em> corporate dividends, <strong>non-registered accounts
            only</strong> &mdash; irrelevant inside TFSA/RRSP/FHSA, since those aren't taxed on
            dividends at all. One more reason to fill registered accounts first.
          </p>
""") + """
        <h3>6.5 Building the Satellite: How Much, and How</h3>
""" + definition('6.6', 'Satellite Allocation',
"""          <p>The deliberately bounded % of a portfolio set aside for individual stock selection.</p>
""") + """        <p>
          <strong>Practical starting range:</strong> 5-15% of total invested capital while still
          learning equity analysis.
        </p>
        <p>
          Every satellite pick runs through the full <a href="module7.html">Module&nbsp;7</a> framework
          &mdash; filings (<a href="module7.html#definitions">7.4</a>), four-pillar thesis
          (<a href="module7.html#definitions">7.2</a>), bull/base/bear scenarios &mdash; never bought on
          a headline or tip.
        </p>

        <h3>6.6 Rebalancing Mechanics</h3>
""" + definition('6.7', 'Rebalancing',
"""          <p>
            Selling what's grown beyond target weight, buying what's fallen below, to restore the
            original structure.
          </p>
""") + """        <p>
          <strong>Simple rule:</strong> rebalance annually, or whenever an allocation drifts more than
          5 percentage points from target &mdash; whichever comes first.
        </p>

        <h3>6.7 A Worked Canadian Portfolio Blueprint</h3>
        <p>
          The blueprint itself is in <a href="#worked-examples">&sect;4</a>, with this module's other
          worked examples.
        </p>
"""

worked = """        <h3>From 6.5 &mdash; Satellite size is a decision made in advance</h3>
""" + example("""          <p>
            90/10 core/satellite, satellite &rarr; \\$0: portfolio retains 90% of value. 50/50 split,
            same bad outcome: loses half. <strong>Satellite size is a risk decision made before any
            stock is picked.</strong>
          </p>
""") + """        <h3>From 6.6 &mdash; What drift actually costs</h3>
""" + example("""          <p>
            90/10 drifts to 80/20 after a strong satellite year &mdash; concentration risk has doubled
            relative to plan. Rebalancing trims back to 90/10, banking gains, restoring the deliberate
            risk level.
          </p>
""") + """        <h3>6.7 &mdash; A Worked Canadian Portfolio Blueprint</h3>
""" + table(
    ['Bucket', 'Account', 'Holding', '% of that bucket'],
    [['Retirement (core)', 'TFSA', 'VEQT or XEQT', '100%'],
     ['House, 6 yrs out (core)', 'FHSA', 'VBAL &rarr; VCNS/VCIP glide path', '100%'],
     ['Learning satellite', 'Non-registered or separate TFSA sleeve',
      "3-5 stocks, each run through <a href=\"module7.html\">Module 7</a>'s full checklist",
      '5-15% of total invested capital']],
    caption='A worked Canadian portfolio blueprint') + """        <p>
          Read the blueprint against 6.3's table and 6.5's range and it is entirely determined by them:
          the retirement bucket's forty-year horizon selects the 100/0 row, the six-year house bucket
          selects the 60/40 row and its glide path, and the satellite sits inside the 5-15% band rather
          than being sized after the fact.
        </p>
"""

confusions = """        <h3>From 6.2 &mdash; What &ldquo;core&rdquo; actually means</h3>
""" + confusion("""          <p>
            Core-satellite isn't &ldquo;safe stocks vs. risky stocks.&rdquo; The core is about
            <em>structural diversification</em> (an ETF holding hundreds of companies) &mdash; a single
            stock, however stable, is never structurally &ldquo;core.&rdquo;
          </p>
""") + """        <h3>From 6.4 &mdash; Where the withholding actually bites</h3>
""" + confusion("""          <p>
            This applies to <strong>US-listed</strong> holdings directly. A Canadian-listed all-in-one
            ETF (Section&nbsp;6.3) has a different wrapper structure &mdash; for most beginner core
            holdings this matters far less than it does for individual US stocks/ETFs held directly.
            <strong>Practical takeaway:</strong> this nuance mostly affects the <em>satellite</em>, not
            a Canadian-listed core.
          </p>
""") + """        <h3>From 6.5 &mdash; A winner that quietly stops being bounded</h3>
""" + confusion("""          <p>
            Letting a winning satellite pick drift unchecked to 30-40% of the portfolio. A tripled
            stock doesn't just make you richer &mdash; it silently turns a bounded bet into an
            oversized, undiversified one.
          </p>
""") + """        <p>
          That third confusion is precisely what Definition&nbsp;6.7 exists to prevent, and it is what
          the second Knowledge Check in <a href="#knowledge-checks">&sect;6</a> asks you to act on.
        </p>
"""

checks = check('6.1', 'Module 6.3 &middot; matching an ETF to a horizon',
"""          <p>Retirement (40 yrs out) vs. house (6 yrs out) &mdash; which ETF fits each?</p>
""",
"""            <p>
              Retirement: VEQT/XEQT (long horizon, full equity). House: closer to VBAL, gliding toward
              VCNS/VCIP as the date nears (shorter horizon &rarr; more stability).
            </p>
""") + check('6.2', 'Module 6.7 &middot; acting on drift',
"""          <p>A satellite gold miner doubles while the core stays flat &mdash; what next?</p>
""",
"""            <p>
              Check drift against target %. If it's drifted more than ~5pp beyond target, trim back
              toward the intended allocation &mdash; banking gains, restoring the original risk level
              &mdash; rather than letting it grow unchecked.
            </p>
""")

recap_terms = [
    ('Volatility', 'How much a value bounces around over time'),
    ('Time Horizon', 'How long until you need the money'),
    ('Core-Satellite Strategy', 'Broad ETF core + smaller bounded individual-stock satellite'),
    ('All-in-One ETF', 'A single ETF holding a fixed, auto-rebalanced mix of other ETFs'),
    ('Withholding Tax', 'Tax a foreign government deducts at source from dividends paid abroad'),
    ('Dividend Tax Credit', 'Canadian credit reducing tax on Canadian-corporation dividends, non-registered only'),
    ('Satellite Allocation', 'The bounded % of a portfolio set aside for individual stock selection'),
    ('Rebalancing', "Restoring a portfolio's original target weights as holdings drift"),
]

sections = [
    ('hook', 'The Hook: Structure First, Selection Second', hook),
    ('definitions', 'Definitions', definitions),
    ('worked-examples', 'Worked Examples', worked),
    ('common-confusions', 'Common Confusions', confusions),
    ('knowledge-checks', 'Knowledge Checks', checks),
    ('recap', 'Recap &amp; Glossary Terms', recap(recap_terms)),
]

if __name__ == '__main__':
    print(write('module6.html', module_page(6, sections)))
