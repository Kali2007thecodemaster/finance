# -*- coding: utf-8 -*-
"""Modules 08 and 09 — short by design. Source lines 354-364."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chrome import *

# ============================== MODULE 8 ==============================

m8_hook = """        <p>
          This module is short, and is meant to be. It introduces no new machinery. It restates one
          identity from <a href="module1.html#refresher">Module&nbsp;1's ECON&nbsp;202 refresher</a>
          at the point where it finally has consequences, and then stops.
        </p>
""" + refresher('ECON 202 refresher, restated',
"""          <p>
            $r_{\\text{real}} \\approx r_{\\text{nominal}} - \\pi$. A 4% savings account with 3%
            inflation nets ~1% real &mdash; why &ldquo;just save&rdquo; often underperforms investing
            over long horizons.
          </p>
""") + """        <p>
          Note where this box sits. Modules&nbsp;01 through&nbsp;04 open with a
          &ldquo;What&nbsp;You&nbsp;Already&nbsp;Half-Remember&rdquo; refresher because they are about to
          build on a course you took; this module <em>is</em> the refresher, arriving on its own, which
          is why it has no separate refresher section of its own.
        </p>
"""

m8_definitions = """        <p>
          Module&nbsp;08 introduces no numbered definition. The identity above is
          <a href="module7.html#definitions">Definition&nbsp;7.9</a>, already defined during
          Pillar&nbsp;1 of the four-pillar framework, where it explained why a non-yielding asset gets
          more attractive as real rates fall. Here the same identity is turned on your own savings
          account instead of on gold.
        </p>
        <p>
          The one term this module contributes to the Glossary &mdash; <em>real return</em> &mdash; is
          the identity's consequence rather than a new concept, and it is listed in
          <a href="#recap">&sect;5</a>.
        </p>
"""

m8_worked = """        <p>
          Module&nbsp;08 has no separate Worked Example in the source curriculum: the refresher above
          carries its own numbers inline, and they are the whole of it &mdash; 4% nominal, 3%
          inflation, roughly 1% real.
        </p>
        <p>
          It is worth putting that 1% next to
          <a href="module1.html#worked-examples">Module&nbsp;1.2's compound table</a>, which grew
          \\$1,000 to \\$1,225.04 in three years at 7%. Run the same table at 1% and the third year ends
          at about \\$1,030. The compounding machinery is identical; only the rate changed, and the rate
          that matters is the one left after inflation.
        </p>
"""

m8_confusions = """        <p>
          Module&nbsp;08 has no Common Confusion callout in the source curriculum. The section is kept
          in place so every module carries the same anatomy and the same anchors.
        </p>
"""

m8_checks = """        <p>
          Module&nbsp;08 has no Knowledge Check in the source curriculum. The closest one is
          <a href="module7.html#knowledge-checks">Module&nbsp;7's first check</a>, which asks what
          falling real rates do to gold &mdash; the same identity, applied to an asset instead of to a
          savings account.
        </p>
"""

m8_sections = [
    ('hook', 'The Hook: The Rate That Actually Matters', m8_hook),
    ('definitions', 'Definitions', m8_definitions),
    ('worked-examples', 'Worked Examples', m8_worked),
    ('common-confusions', 'Common Confusions', m8_confusions),
    ('knowledge-checks', 'Knowledge Checks', m8_checks),
    ('recap', 'Recap &amp; Glossary Terms',
     recap([('Real Return', 'Return after subtracting inflation')])),
]

# ============================== MODULE 9 ==============================

m9_hook = """        <p>
          The book closes on the one variable none of the previous eight modules can compute: you.
        </p>
        <p>
          Every framework here &mdash; the glide path, the satellite bound, the four pillars, the
          scenario range &mdash; assumes it will still be followed during a bad year. That assumption
          is the weakest link in the entire structure, and this module names why.
        </p>
        <p>
          Like <a href="module8.html">Module&nbsp;08</a>, it is deliberately short. One definition, one
          consequence.
        </p>
"""

m9_definitions = definition('9.1', 'Loss Aversion',
"""          <p>
            Losses feel roughly twice as painful as equal gains feel good &mdash; causing panic-selling
            at the worst moments.
          </p>
""") + why("""          <p>
            A portfolio you can psychologically hold through a real downturn beats a theoretically
            superior one you abandon in a panic &mdash; matching risk to actual time horizon matters
            more than chasing &ldquo;optimal.&rdquo;
          </p>
""", label='Why This Matters, tied to Module 6.2') + """        <p>
          Read that against
          <a href="module6.html#definitions">Module&nbsp;6.2's core-satellite definition</a> and the
          whole architecture reads differently. The bounded satellite is not only a diversification
          device; it is a behavioural one. A 10% sleeve can halve without threatening the plan, which
          means it can also halve without triggering the reaction that would.
        </p>
"""

m9_worked = """        <p>
          Module&nbsp;09 has no Worked Example in the source curriculum, and the omission is
          appropriate: its claim is about behaviour under loss, which cannot be worked through on
          paper the way a discount rate can.
        </p>
        <p>
          The nearest thing to a worked example is
          <a href="module6.html#worked-examples">Module&nbsp;6.5's</a>, which is worth re-reading here
          with the definition above in mind. A satellite going to \\$0 costs a 90/10 portfolio ten
          percent of its value &mdash; and, if Definition&nbsp;9.1 is right, feels roughly like losing
          twenty. Sizing the sleeve is as much about what you can sit through as about what you can
          afford.
        </p>
"""

m9_confusions = """        <p>
          Module&nbsp;09 has no Common Confusion callout in the source curriculum. The section is kept
          in place so every module carries the same anatomy and the same anchors.
        </p>
"""

m9_checks = """        <p>
          Module&nbsp;09 has no Knowledge Check in the source curriculum, and it is the one module where
          a hidden answer would be the wrong device: the check is whether you actually hold the
          allocation, and only a real drawdown can administer it.
        </p>
        <p>
          If you want a last one on paper, go back to
          <a href="module6.html#knowledge-checks">Module&nbsp;6's second check</a> &mdash; the doubled
          gold miner &mdash; and answer it again, this time noticing that trimming a winner is the same
          reflex as not selling a loser, and is opposed by the same instinct.
        </p>
"""

m9_sections = [
    ('hook', 'The Hook: The Variable You Cannot Compute', m9_hook),
    ('definitions', 'Definitions', m9_definitions),
    ('worked-examples', 'Worked Examples', m9_worked),
    ('common-confusions', 'Common Confusions', m9_confusions),
    ('knowledge-checks', 'Knowledge Checks', m9_checks),
    ('recap', 'Recap &amp; Glossary Terms',
     recap([('Loss Aversion', 'Losses feel worse than equal gains feel good')])),
]

if __name__ == '__main__':
    print(write('module8.html', module_page(8, m8_sections)))
    print(write('module9.html', module_page(9, m9_sections)))
