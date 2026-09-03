# -*- coding: utf-8 -*-
"""appendix-glossary.html — the complete Glossary, one consolidated table.

The 47 rows are parsed straight out of the source markdown's Glossary section
rather than retyped, so the appendix and the source can never drift. The
"first defined in" column is added from the module each term is introduced in;
the term and its one-line meaning are the source's own text, unaltered.
"""
import sys, os, re, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chrome import *

SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   'Personal_Finance_From_Scratch_Complete.md')

# term -> (module number, anchor within that module's page)
ORIGIN = {
    'Asset': (0, 'definitions'), 'Liability': (0, 'definitions'),
    'Net Worth': (0, 'definitions'), 'Interest': (0, 'definitions'),
    'Time Value of Money': (1, 'definitions'), 'Present/Future Value': (1, 'definitions'),
    'Compound Interest': (1, 'definitions'),
    'Liquid Asset': (2, 'definitions'), 'Cash Flow': (2, 'definitions'),
    'Credit Risk': (3, 'definitions'),
    'NPV': (4, 'definitions'),
    'Stock': (5, 'definitions'), 'Bond': (5, 'definitions'), 'Diversification': (5, 'definitions'),
    'Volatility': (6, 'definitions'), 'Time Horizon': (6, 'definitions'),
    'Core-Satellite Strategy': (6, 'definitions'), 'All-in-One ETF': (6, 'definitions'),
    'Withholding Tax': (6, 'definitions'), 'Dividend Tax Credit': (6, 'definitions'),
    'Satellite Allocation': (6, 'definitions'), 'Rebalancing': (6, 'definitions'),
    'Ticker': (7, 'definitions'), 'Market Cap': (7, 'definitions'), 'EPS': (7, 'definitions'),
    'P/E Ratio': (7, 'definitions'), 'Dividend Yield': (7, 'definitions'),
    'Beta': (7, 'definitions'), 'Operating Leverage': (7, 'definitions'),
    'Market-Cap-Weighted Index': (7, 'definitions'), 'Equal-Weighted Index': (7, 'definitions'),
    'Stock Split': (7, 'definitions'), 'Scenario Analysis': (7, 'definitions'),
    'Valuation': (7, 'definitions'), 'DCF': (7, 'definitions'),
    'Thematic ETF': (7, 'definitions'), 'Inception Date': (7, 'definitions'),
    'Underlying Index': (7, 'definitions'), 'AUM': (7, 'definitions'),
    'CUSIP': (7, 'definitions'), 'NAV': (7, 'definitions'),
    'Market Price Return': (7, 'definitions'), 'Tracking Difference': (7, 'definitions'),
    'MD&A': (7, 'definitions'), 'News Flow': (7, 'definitions'),
    'Real Return': (8, 'definitions'),
    'Loss Aversion': (9, 'definitions'),
}


def parse_glossary():
    text = open(SRC).read()
    block = text.split('## Glossary (Complete)')[1].split('## Where This Goes Next')[0]
    rows = []
    for line in block.splitlines():
        line = line.strip()
        if not line.startswith('|') or set(line) <= set('|- '):
            continue
        cells = [c.strip() for c in line.strip('|').split('|')]
        if len(cells) != 2 or cells[0] == 'Term':
            continue
        rows.append((cells[0], cells[1]))
    return rows


def esc(s):
    # the source's meanings contain −, ×, ÷, & and quotes; keep them literal but
    # make & safe, and normalise the source's own straight quotes to typographic
    s = s.replace('&', '&amp;')
    s = re.sub(r'"([^"]*)"', r'&ldquo;\1&rdquo;', s)
    return s


rows = parse_glossary()
assert len(rows) == 47, 'expected 47 glossary rows, parsed %d' % len(rows)

# ---- the A-Z jump index ----
letters = sorted({r[0][0].upper() for r in rows})
index = ('        <nav class="glossary-index" aria-label="Jump to letter">\n'
         + '\n'.join('          <a href="#letter-%s">%s</a>' % (L, L) for L in letters)
         + '\n        </nav>\n')

# ---- the consolidated table, alphabetical, with per-letter anchors ----
body_rows = ''
seen_letters = set()
for term, meaning in sorted(rows, key=lambda r: r[0].lower()):
    L = term[0].upper()
    anchor_attr = ''
    if L not in seen_letters:
        seen_letters.add(L)
        anchor_attr = ' id="letter-%s"' % L
    mod, sec = ORIGIN[term]
    body_rows += (
        '            <tr class="glossary-row"%s>\n'
        '              <th scope="row" id="%s">%s</th>\n'
        '              <td>%s<span class="from-module">'
        '<a href="module%d.html#%s">first defined in Module %02d</a></span></td>\n'
        '            </tr>\n'
        % (anchor_attr, slug(esc(term)), esc(term), esc(meaning), mod, sec, mod))

gloss_table = ('        <div class="table-wrap">\n'
               '          <table>\n'
               '            <caption>The complete Glossary &mdash; 47 terms</caption>\n'
               '            <thead><tr><th scope="col">Term</th>'
               '<th scope="col">One-line meaning</th></tr></thead>\n'
               '            <tbody>\n%s            </tbody>\n'
               '          </table>\n'
               '        </div>\n' % body_rows)

intro = """        <p>
          Every term defined anywhere in this book, in one place. The list is the source curriculum's
          own Glossary, unaltered &mdash; forty-seven terms, each with the one-line meaning it was given
          when it was written. The only thing added here is the link at the end of each meaning, which
          takes you back to the module where the term was first defined in full, with its worked
          example and its context.
        </p>
        <p>
          The table is alphabetical rather than grouped by module, deliberately: you reach for a
          glossary when you have met a word, not when you have reached a chapter.
        </p>
"""

page = head('Appendix &mdash; Glossary',
            'The complete 47-term glossary for Personal Finance From Scratch, alphabetical and cross-linked to the module each term is defined in.') + """<body data-chapter="glossary">

  <nav class="topbar" aria-label="Reader controls">
    <a href="index.html" aria-label="Back to curriculum">&larr;</a>
    <button class="gear" type="button" aria-label="Cycle reading text size">&#9881;</button>
    <span class="bar-title">Appendix &mdash; Glossary</span>
    <span>
      <a href="index.html" aria-label="Back to curriculum">&rarr;</a>
    </span>
  </nav>

  <div class="page">
    <main class="reading">

      <header class="title-block">
        <p class="kicker">appendix</p>
        <h1>Glossary</h1>
        <hr class="rule">
        <p class="subtitle">Every term in the book, consolidated &middot; 47 entries</p>
      </header>

      <!-- ============ 1. THE COMPLETE GLOSSARY ============ -->
      <section id="glossary">
        <h2>1. The Complete Glossary</h2>
%s%s%s      </section>

      <nav class="chapter-nav">
        <a href="module9.html">&larr; Module 09 &mdash; Behavior and Ethics</a>
        <a href="index.html">Curriculum &rarr;</a>
      </nav>

    </main>

    <aside class="contents" aria-label="Appendix contents">
      <p class="contents-label">Contents</p>
      <ol>
        <li><a href="#glossary">1. The Complete Glossary</a></li>
      </ol>
    </aside>
  </div>

  <footer class="book-footer">
    PERSONAL FINANCE FROM SCRATCH &mdash; a zero-knowledge curriculum, Canadian edition. Educational material, not financial advice.
  </footer>

  <script src="reader.js"></script>
</body>
</html>
""" % (intro, index, gloss_table)

if __name__ == '__main__':
    print(write('appendix-glossary.html', page))
    print('%d terms' % len(rows))
