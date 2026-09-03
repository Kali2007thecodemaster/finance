# -*- coding: utf-8 -*-
"""Module 00 — The Absolute Basics. Source: Personal_Finance_From_Scratch_Complete.md, lines 24-46."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chrome import *

hook = """        <p>
          This module assumes nothing at all. It exists because two words &mdash; <em>asset</em> and
          <em>liability</em> &mdash; do almost all the work in every module that follows, and because
          the single most common question in personal finance, &ldquo;how much money do I have,&rdquo;
          turns out to be a trick question.
        </p>
        <p>
          There are two sections here. The first asks what money functionally <em>is</em>, and answers
          it with one subtraction. The second asks what interest is, and answers it with one sentence
          that also happens to define what a bank does &mdash; which is why
          <a href="module3.html">Module&nbsp;03</a> can be about banking without introducing anything
          new.
        </p>
"""

definitions = """        <h3>0.1 What Even <em>Is</em> Money, Functionally?</h3>
""" + definition('0.1', 'Asset', '          <p>Anything you own that has value.</p>\n') \
    + definition('0.2', 'Liability', '          <p>Anything you owe.</p>\n') \
    + definition('0.3', 'Net Worth', """          <p>What you actually have, once debts are subtracted.</p>
          <p>$$\\text{Net Worth} = \\text{Assets} - \\text{Liabilities}$$</p>
""") \
    + why("""          <p>
            &ldquo;How much money do I have&rdquo; is a trick question if you only look at your bank
            balance. Net worth is the number that tells the truth.
          </p>
""") \
    + """        <h3>0.2 What Even <em>Is</em> Interest?</h3>
""" + definition('0.4', 'Interest', '          <p>The price of using someone else\'s money.</p>\n')

worked = """        <h3>From 0.1 &mdash; Net worth, computed</h3>
""" + example("""          <p>\\$2,000 chequing + \\$1,500 laptop &minus; \\$500 credit card balance:</p>
          <p>$$\\text{Net Worth} = 3500 - 500 = \\$3,000$$</p>
""") + """        <h3>From 0.2 &mdash; Interest, computed</h3>
""" + example("""          <p>
            \\$1,000 at 4%/year &rarr; \\$40 interest in year one. The bank pays you for the use of your
            money &mdash; literally what a bank <em>is</em> (<a href="module3.html">Module&nbsp;3</a>).
          </p>
""") + """        <p>
          That second example is worth sitting with, because it runs in both directions. When the bank
          pays you 4%, you are the lender. When you carry a balance at 20%, you are the borrower and the
          same arithmetic is pointed at you &mdash; which is exactly what
          <a href="module3.html#worked-examples">Module&nbsp;3's worked example</a> shows.
        </p>
"""

confusions = """        <p>
          Module&nbsp;00 has no Common Confusion callout in the source curriculum &mdash; the two ideas
          here are definitional rather than error-prone, and the first genuine trap appears in
          <a href="module1.html#common-confusions">Module&nbsp;1</a>, where the discount rate's exponent
          starts to bite. This section is kept in place so that every module has the same eight-part
          anatomy and the same anchors.
        </p>
"""

checks = check('0.1', 'Module 0.1 &middot; net worth',
"""          <p>\\$10,000 savings, \\$12,000 student debt &mdash; positive or negative net worth?</p>
""",
"""            <p>
              Negative: $10{,}000-12{,}000=-\\$2{,}000$. Completely normal for a student &mdash; what
              matters is the trajectory.
            </p>
""")

recap_terms = [
    ('Asset', 'Something you own with value'),
    ('Liability', 'Something you owe'),
    ('Net Worth', 'Assets &minus; Liabilities'),
    ('Interest', "The price of using someone else's money"),
]

sections = [
    ('hook', 'The Hook: Two Words, One Subtraction', hook),
    ('definitions', 'Definitions', definitions),
    ('worked-examples', 'Worked Examples', worked),
    ('common-confusions', 'Common Confusions', confusions),
    ('knowledge-checks', 'Knowledge Checks', checks),
    ('recap', 'Recap &amp; Glossary Terms', recap(recap_terms)),
]

if __name__ == '__main__':
    print(write('module0.html', module_page(0, sections)))
