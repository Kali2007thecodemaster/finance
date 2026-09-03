# -*- coding: utf-8 -*-
"""Module 02 — Personal Financial Statements. Source lines 83-118."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chrome import *

hook = """        <p>
          <a href="module0.html">Module&nbsp;00</a> gave you one number: net worth, assets minus
          liabilities. This module gives you the two documents that number lives in, and a second
          number that behaves completely differently.
        </p>
        <p>
          The distinction between them is the whole module, and it is a distinction about
          <em>time</em>: one document describes an instant, the other describes an interval. Companies
          keep both for exactly this reason, and the reason applies unchanged to a person.
        </p>
"""

refresh = refresher('What You Already Half-Remember &mdash; BUS 100',
"""          <p>
            A <strong>balance sheet</strong> is a snapshot (owns vs. owes, one day); an <strong>income
            statement</strong> is a video (money in vs. out, over a period).
          </p>
""") + """        <p>
          Hold on to the snapshot-versus-video framing &mdash; it is what makes the closing line of
          this module ("watch cash flow month-to-month, net worth year-to-year") follow rather than
          just sound sensible.
        </p>
"""

definitions = """        <h3>2.1 Personal Balance Sheet</h3>
""" + definition('2.1', 'Liquid Asset',
"""          <p>
            Convertible to cash quickly without losing value. Contrast <strong>illiquid
            asset</strong>.
          </p>
""") + """        <h3>2.2 Personal Income Statement</h3>
""" + definition('2.2', 'Cash Flow',
"""          <p>$\\text{Income} - \\text{Expenses}$, over a period.</p>
""")

worked = """        <p>
          Both statements below describe the same person on the same day. Read them together: the
          balance sheet is badly negative, the income statement is positive, and neither reading is
          wrong.
        </p>
        <h3>Balance Sheet</h3>
""" + table(
    ['Assets', '', 'Liabilities', ''],
    [['Chequing', '\\$800', 'Credit card', '\\$300'],
     ['TFSA', '\\$2,200', 'Student loan', '\\$8,000'],
     ('total', ['<strong>Total</strong>', '<strong>\\$3,000</strong>',
                '<strong>Total</strong>', '<strong>\\$8,300</strong>'])]) + """        <p>$\\text{Net Worth} = -\\$5,300$</p>

        <h3>Income Statement (1 month)</h3>
""" + table(
    ['Income', '', 'Expenses', ''],
    [['Job', '\\$900', 'Rent', '\\$450'],
     ['', '', 'Food', '\\$250'],
     ['', '', 'Subscriptions', '\\$60'],
     ('total', ['<strong>Total</strong>', '<strong>\\$900</strong>',
                '<strong>Total</strong>', '<strong>\\$760</strong>'])]) + """        <p>
          $\\text{Cash Flow} = +\\$140$/month &mdash; negative net worth, but improving monthly. Watch
          cash flow month-to-month, net worth year-to-year.
        </p>
"""

confusions = confusion("""          <p>
            A raise doesn't help if expenses rise to match (<em>lifestyle creep</em>) &mdash; cash flow
            stays flat.
          </p>
""") + """        <p>
          Note what this confusion is actually about: it is a statement about the income statement, not
          the balance sheet. A raise changes the top line of the video; lifestyle creep changes the
          bottom line by the same amount; the snapshot never moves. Reading only one of the two
          documents is what lets the mistake hide.
        </p>
"""

confusion_note = ''

checks = """        <p>
          Module&nbsp;02 has no Knowledge Check in the source curriculum &mdash; its check is the
          worked example itself, which is meant to be rebuilt from your own numbers rather than
          answered. Do that: write your own balance sheet and your own one-month income statement in
          the same two shapes as <a href="#worked-examples">&sect;4</a>, and read the two resulting
          numbers separately. This section is kept in place so every module carries the same anatomy
          and the same anchors.
        </p>
        <p>
          The next Knowledge Checks appear in
          <a href="module6.html#knowledge-checks">Module&nbsp;06</a>.
        </p>
"""

recap_terms = [
    ('Liquid Asset', 'Easily convertible to spendable cash'),
    ('Cash Flow', 'Income &minus; Expenses, over a period'),
]

sections = [
    ('hook', 'The Hook: A Snapshot and a Video', hook),
    ('refresher', 'What You Already Half-Remember', refresh),
    ('definitions', 'Definitions', definitions),
    ('worked-examples', 'Worked Examples', worked),
    ('common-confusions', 'Common Confusions', confusions),
    ('knowledge-checks', 'Knowledge Checks', checks),
    ('recap', 'Recap &amp; Glossary Terms', recap(recap_terms)),
]

if __name__ == '__main__':
    print(write('module2.html', module_page(2, sections)))
