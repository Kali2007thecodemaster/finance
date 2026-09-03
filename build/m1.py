# -*- coding: utf-8 -*-
"""Module 01 — TVM. Source: Personal_Finance_From_Scratch_Complete.md, lines 49-80."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chrome import *

hook = """        <p>
          Everything after this module &mdash; the amortization schedule in
          <a href="module3.html">Module&nbsp;03</a>, the net present value in
          <a href="module4.html">Module&nbsp;04</a>, the discounted cash flow in
          <a href="module7.html#definitions">Module&nbsp;7.3</a> &mdash; is one formula, rearranged.
          This is that formula.
        </p>
        <p>
          Two ideas carry it. The first is that a dollar has a date attached to it, and that moving the
          date changes what it is worth. The second is that interest paid on interest already earned
          compounds, so the change is not linear. The module opens with a refresher on the two
          background facts it leans on, then builds both ideas from nothing.
        </p>
"""

refresh = refresher('What You Already Half-Remember &mdash; ECON 201',
"""          <p>
            Every decision has an <strong>opportunity cost</strong> &mdash; the value of the next-best
            thing given up.
          </p>
""") + refresher('What You Already Half-Remember &mdash; ECON 202',
"""          <p>
            <strong>Inflation</strong> erodes purchasing power over time; the <strong>Bank of
            Canada</strong>'s target rate ripples through every rate you'll encounter.
          </p>
""") + """        <p>
          Both come back later and by name: opportunity cost is what makes a non-yielding asset
          expensive to hold in <a href="module7.html#definitions">Module&nbsp;7.2</a>, and inflation is
          what turns a nominal rate into a real one in
          <a href="module8.html">Module&nbsp;08</a>.
        </p>
"""

definitions = """        <h3>1.1 The Time Value of Money</h3>
""" + definition('1.1', 'TVM',
"""          <p>
            A dollar today is worth more than a dollar later, because today's dollar can be invested
            immediately.
          </p>
""") + definition('1.2 &amp; 1.3', 'Present Value (PV) / Future Value (FV)',
"""          <p>
            The source names these two together, because neither is meaningful alone: each is the
            other, moved across $n$ years at rate $r$. The formula below is the move, written in both
            directions.
          </p>
          <p>$$FV = PV \\times (1+r)^n \\qquad \\Longleftrightarrow \\qquad PV = \\frac{FV}{(1+r)^n}$$</p>
""") + """        <h3>1.2 Compound Interest</h3>
""" + definition('1.4', 'Compound Interest',
"""          <p>Interest earned on previously earned interest.</p>
""")

worked = """        <h3>From 1.1 &mdash; Moving a dollar in both directions</h3>
""" + example("""          <p>
            \\$1,000 at 5%/year, 3 years: $FV = 1000 \\times 1.05^3 = \\$1,157.63$. Reversed, \\$1,157.63
            in 3 years at 5% is worth exactly \\$1,000 today.
          </p>
""") + """        <h3>From 1.2 &mdash; Three years of interest-on-interest</h3>
        <p>
          The table below is the source's compound-growth example at 7%. The
          <a href="#sandbox">sandbox</a> further down regenerates exactly this table live, at whatever
          principal, rate and term you set &mdash; the static version is here so you can check the live
          one against it.
        </p>
""" + table(
    ['Year', 'Start', 'Interest', 'End'],
    [['1', '\\$1,000.00', '\\$70.00', '\\$1,070.00'],
     ['2', '\\$1,070.00', '\\$74.90', '\\$1,144.90'],
     ['3', '\\$1,144.90', '\\$80.14', '\\$1,225.04']],
    caption='Compound growth, \\$1,000 at 7%') + """        <p>
          Year 2's interest exceeds Year 1's with no new deposit &mdash; interest-on-interest, the real
          reason &ldquo;start early&rdquo; matters.
        </p>
"""

confusions = confusion("""          <p>
            A higher discount rate shrinks PV <em>fast</em> because of the exponent &mdash; always
            sanity-check the rate assumption.
          </p>
""") + """        <p>
          This one is worth feeling rather than reading. In the <a href="#sandbox">sandbox</a>, hold the
          principal and term fixed and drag the rate: the future value does not rise along a line, it
          bends. The same bend, pointed the other way, is what makes
          <a href="module4.html#sandbox">Module&nbsp;4's NPV</a> so sensitive to its discount-rate
          assumption.
        </p>
"""

checks = check('1.1', 'Module 1.1 &middot; present value',
"""          <p>At 6%, \\$500 in 1 year vs. \\$520 in 2 years &mdash; which is worth more today?</p>
""",
"""            <p>$PV_1=471.70$, $PV_2=462.85$ &mdash; the sooner payment wins.</p>
""")

sandbox = """        <p>
          The static table in <a href="#worked-examples">&sect;4</a> is one row of assumptions. This is
          the same table, live. Set the principal, the annual rate and the term; the future value and
          the full year-by-year compound-growth schedule regenerate as you drag. It opens on
          <strong>\\$1,000 at 7% over 3 years</strong> &mdash; the source's own numbers &mdash; so the
          first thing you see reproduces the worked example exactly, and every change from there is a
          change you made.
        </p>
        <div class="sandbox-panel" id="tvm-sandbox" data-widget="tvm">
          <noscript>
            <p class="sandbox-note">
              This sandbox needs JavaScript. The worked example it extends is complete and
              self-contained in <a href="#worked-examples">&sect;4</a> above.
            </p>
          </noscript>
        </div>
"""

recap_terms = [
    ('Time Value of Money', 'A dollar today &gt; a dollar later'),
    ('Present/Future Value', 'What a future/present sum is worth at another point in time'),
    ('Compound Interest', 'Interest earned on previous interest'),
]

sections = [
    ('hook', 'The Hook: One Formula, Rearranged Forever', hook),
    ('refresher', 'What You Already Half-Remember', refresh),
    ('definitions', 'Definitions', definitions),
    ('worked-examples', 'Worked Examples', worked),
    ('common-confusions', 'Common Confusions', confusions),
    ('knowledge-checks', 'Knowledge Checks', checks),
    ('sandbox', 'Sandbox: The Live TVM Calculator', sandbox),
    ('recap', 'Recap &amp; Glossary Terms', recap(recap_terms)),
]

if __name__ == '__main__':
    print(write('module1.html', module_page(1, sections, widget='tvm-calculator.js')))
