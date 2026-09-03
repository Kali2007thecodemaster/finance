# -*- coding: utf-8 -*-
"""
Shared chrome for every moduleN.html and for appendix-glossary.html.

The structure here is copied from the reference site's chapter0.html: the
same <head> (MathJax config + CDN script, chapter.css link), the same slim
topbar (back / gear / title / heart+forward), the same
.page > main.reading + aside.contents grid, the same .chapter-nav and
.book-footer, and the same <body data-chapter="N"> convention that
reader.js reads. Only the content inside the reading column changes from
one module to the next, exactly as the reference book's chapters do.
"""

import re, os

SITE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    'personal-finance-from-scratch')

MODULE_TITLES = {
    0: 'The Absolute Basics',
    1: 'ECON 201/202 Refresher, and the Time Value of Money',
    2: 'BUS 100 (Ch. 17) Refresher: Your Personal Financial Statements',
    3: 'BUS 100 (Ch. 18) Refresher: Banking and Credit',
    4: 'BUS 100 (Ch. 19) Refresher: Capital Budgeting for Your Own Life',
    5: 'Investment Markets, From Absolute Zero',
    6: 'Building a Canadian Investment Strategy: ETFs as a Core, Stocks as a Satellite',
    7: 'Institutional-Grade Equity &amp; Sector Analysis',
    8: 'Macro Reconnection',
    9: 'Professional Discipline: Behavior and Ethics',
}

SHORT_TITLES = {
    0: 'The Absolute Basics',
    1: 'The Time Value of Money',
    2: 'Your Personal Financial Statements',
    3: 'Banking and Credit',
    4: 'Capital Budgeting for Your Own Life',
    5: 'Investment Markets, From Absolute Zero',
    6: 'A Canadian Investment Strategy',
    7: 'Equity &amp; Sector Analysis',
    8: 'Macro Reconnection',
    9: 'Behavior and Ethics',
}

PHASES = {0: ('phase I', 'foundations'), 1: ('phase I', 'foundations'), 2: ('phase I', 'foundations'),
          3: ('phase II', 'credit &amp; capital'), 4: ('phase II', 'credit &amp; capital'),
          5: ('phase II', 'credit &amp; capital'),
          6: ('phase III', 'strategy &amp; analysis'), 7: ('phase III', 'strategy &amp; analysis'),
          8: ('phase IV', 'macro &amp; discipline'), 9: ('phase IV', 'macro &amp; discipline')}

SUBTITLES = {
    0: 'Studied from Desai, <em>How Finance Works</em> &middot; written from scratch',
    1: 'Studied from DeFusco et al., <em>Quantitative Investment Analysis</em>, with an ECON&nbsp;201/202 refresher &middot; written from scratch',
    2: 'Studied from Desai, <em>How Finance Works</em>, with a BUS&nbsp;100 (Ch.&nbsp;17) refresher &middot; written from scratch',
    3: 'Studied from Desai, <em>How Finance Works</em> and Bodie, Kane &amp; Marcus, <em>Investments</em>, with a BUS&nbsp;100 (Ch.&nbsp;18) refresher &middot; written from scratch',
    4: 'Studied from DeFusco et al., <em>Quantitative Investment Analysis</em>, with a BUS&nbsp;100 (Ch.&nbsp;19) refresher &middot; written from scratch',
    5: 'Studied from Bodie, Kane &amp; Marcus, <em>Investments</em> &middot; written from scratch',
    6: 'Studied from Bodie, Kane &amp; Marcus, <em>Investments</em>, with Canadian account and tax-treaty detail from Canadian regulation and published fund documentation &middot; written from scratch',
    7: 'Studied from Bodie, Kane &amp; Marcus, <em>Investments</em> and Desai, <em>How Finance Works</em>, with fact-sheet figures published by Global X for PAVE &middot; written from scratch',
    8: 'Studied from DeFusco et al., <em>Quantitative Investment Analysis</em>, restating the ECON&nbsp;202 refresher &middot; written from scratch',
    9: 'Studied from Bodie, Kane &amp; Marcus, <em>Investments</em> &middot; written from scratch',
}

SECTION_LABELS = [
    ('hook',              'The Hook'),
    ('refresher',         'What You Already Half-Remember'),
    ('definitions',       'Definitions'),
    ('worked-examples',   'Worked Examples'),
    ('common-confusions', 'Common Confusions'),
    ('knowledge-checks',  'Knowledge Checks'),
    ('sandbox',           'Sandbox'),
    ('recap',             'Recap &amp; Glossary Terms'),
]


def slug(term):
    """Glossary anchor slug. Shared by appendix-glossary.html and by every
    module's #recap links, so the two can never drift apart."""
    s = term.lower().replace('&amp;', ' and ').replace('&', ' and ')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return 'g-' + s


def head(title_text, description, extra_head=''):
    return """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#222222">
  <script>
    (function () {
      try {
        var t = localStorage.getItem('pfs-finance:theme') ||
          (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.setAttribute('data-theme', t);
      } catch (e) { document.documentElement.setAttribute('data-theme', 'dark'); }
    })();
  </script>
  <title>%s &middot; Personal Finance From Scratch</title>
  <meta name="description" content="%s">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400..700&family=Inter:wght@400;600;700&family=Fira+Code:wght@400;500;700&display=swap" rel="stylesheet">

  <script>
    MathJax = { tex: { inlineMath: [['$','$'],['\\\\(','\\\\)']], displayMath: [['$$','$$'],['\\\\[','\\\\]']] } };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>

  <link rel="stylesheet" href="chapter.css">%s
</head>
""" % (title_text, description, extra_head)


def module_page(n, sections, widget=None):
    """sections: ordered list of (anchor_id, heading_html, body_html)."""
    prev_href, prev_label = ('index.html', '&larr; Curriculum')
    if n > 0:
        prev_href = 'module%d.html' % (n - 1)
        prev_label = '&larr; Module %02d &mdash; %s' % (n - 1, SHORT_TITLES[n - 1])

    if n < 9:
        next_href = 'module%d.html' % (n + 1)
        next_label = 'Module %02d &mdash; %s &rarr;' % (n + 1, SHORT_TITLES[n + 1])
    else:
        next_href = 'appendix-glossary.html'
        next_label = 'Appendix &mdash; Glossary &rarr;'

    contents = '\n'.join(
        '        <li><a href="#%s">%d. %s</a></li>' % (sid, i + 1, label)
        for i, (sid, label) in enumerate(
            [(s[0], dict(SECTION_LABELS)[s[0]]) for s in sections]))

    body_sections = '\n'.join(
        """      <!-- ============ %d. %s ============ -->
      <section id="%s">
        <h2>%d. %s</h2>
%s      </section>
""" % (i + 1, dict(SECTION_LABELS)[sid].upper(), sid, i + 1, heading, body)
        for i, (sid, heading, body) in enumerate(sections))

    phase_num, phase_name = PHASES[n]
    widget_tag = ('\n  <script src="widgets/%s"></script>' % widget) if widget else ''

    return head(
        'Module %02d &mdash; %s' % (n, re.sub('<[^>]+>', '', MODULE_TITLES[n])),
        SHORT_TITLES[n].replace('&amp;', 'and') + ' — module %02d of Personal Finance From Scratch.' % n
    ) + """<body data-chapter="%d">

  <nav class="topbar" aria-label="Reader controls">
    <a href="index.html" aria-label="Back to curriculum">&larr;</a>
    <button class="gear" type="button" aria-label="Cycle reading text size">&#9881;</button>
    <span class="bar-title">%s</span>
    <span>
      <button class="theme-toggle" type="button" aria-label="Switch to light mode" aria-pressed="true" title="Light mode">
        <svg class="tt-icon" viewBox="0 0 24 24" aria-hidden="true">
          <mask id="tt-moon-mask"><rect x="0" y="0" width="24" height="24" fill="#fff"></rect><circle class="tt-moon-cut" cx="24" cy="9" r="6" fill="#000"></circle></mask>
          <circle class="tt-core" cx="12" cy="12" r="5.6" mask="url(#tt-moon-mask)"></circle>
          <g class="tt-rays" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
            <line x1="12" y1="1.4" x2="12" y2="3.4"></line><line x1="12" y1="20.6" x2="12" y2="22.6"></line>
            <line x1="1.4" y1="12" x2="3.4" y2="12"></line><line x1="20.6" y1="12" x2="22.6" y2="12"></line>
            <line x1="4.4" y1="4.4" x2="5.8" y2="5.8"></line><line x1="18.2" y1="18.2" x2="19.6" y2="19.6"></line>
            <line x1="4.4" y1="19.6" x2="5.8" y2="18.2"></line><line x1="18.2" y1="5.8" x2="19.6" y2="4.4"></line>
          </g>
        </svg>
      </button>
      <button class="heart" type="button" data-complete-toggle aria-pressed="false" aria-label="Toggle module complete">&hearts;<span data-complete-label hidden></span></button>
      <a href="%s" aria-label="Forward">&rarr;</a>
    </span>
  </nav>

  <div class="page">
    <main class="reading">

      <header class="title-block">
        <p class="kicker">%s &middot; module %02d</p>
        <h1>%s</h1>
        <hr class="rule">
        <p class="subtitle">%s</p>
      </header>

%s
      <nav class="chapter-nav">
        <a href="%s">%s</a>
        <a href="%s">%s</a>
      </nav>

    </main>

    <aside class="contents" aria-label="Module contents">
      <p class="contents-label">Contents</p>
      <ol>
%s
      </ol>
      <button type="button" class="mark-complete" data-complete-toggle aria-pressed="false">
        <span data-complete-label>Mark module complete</span>
      </button>
    </aside>
  </div>

  <footer class="book-footer">
    PERSONAL FINANCE FROM SCRATCH &mdash; a zero-knowledge curriculum, Canadian edition. Educational material, not financial advice.
  </footer>

  <script src="reader.js"></script>%s
  <script src="theme.js"></script>
</body>
</html>
""" % (n, SHORT_TITLES[n], next_href, phase_num, n, MODULE_TITLES[n], SUBTITLES[n],
       body_sections, prev_href, prev_label, next_href, next_label, contents, widget_tag)


def write(name, text):
    path = os.path.join(SITE, name)
    with open(path, 'w') as f:
        f.write(text)
    return path


# ---------- device helpers: one function per pedagogy device ----------

def definition(num, term, body):
    return ('        <div class="definition-box">\n'
            '          <span class="box-label">Definition %s &mdash; %s</span>\n'
            '%s'
            '        </div>\n') % (num, term, body)


def why(body, label='Why This Matters'):
    return ('        <div class="tip-box">\n'
            '          <span class="box-label">%s</span>\n'
            '%s'
            '        </div>\n') % (label, body)


def example(body, label='Worked Example'):
    return ('        <div class="example-box">\n'
            '          <span class="box-label">%s</span>\n'
            '%s'
            '        </div>\n') % (label, body)


def confusion(body):
    return ('        <div class="warn-box">\n'
            '          <span class="box-label">Common Confusion</span>\n'
            '%s'
            '        </div>\n') % body


def refresher(label, body):
    return ('        <div class="refresher-box">\n'
            '          <span class="box-label">%s</span>\n'
            '%s'
            '        </div>\n') % (label, body)


def check(drill_id, source, question, answer):
    """A Knowledge Check.

    reader.js tracks attempts via `.drill details[data-drill]` — the wrapper
    class AND the attribute are both required, so a bare <details> would be
    invisible to the progress store. Every check on the site uses this shape.
    """
    return ('        <div class="drill">\n'
            '          <div class="drill-head">\n'
            '            <span class="drill-num">KNOWLEDGE CHECK %s</span>\n'
            '            <span class="drill-source">%s</span>\n'
            '          </div>\n'
            '%s'
            '          <details data-drill="%s">\n'
            '            <summary>Show Answer</summary>\n'
            '%s'
            '          </details>\n'
            '        </div>\n') % (drill_id, source, question, drill_id, answer)


def table(head_row, body_rows, caption=None, classes=''):
    cap = ('          <caption>%s</caption>\n' % caption) if caption else ''
    th = ''.join('<th scope="col">%s</th>' % c for c in head_row)
    rows = ''
    for r in body_rows:
        cls = ''
        cells = r
        if isinstance(r, tuple):
            cls, cells = r
        rows += '            <tr%s>%s</tr>\n' % (
            (' class="%s"' % cls) if cls else '',
            ''.join('<td>%s</td>' % c for c in cells))
    return ('        <div class="table-wrap">\n'
            '          <table%s>\n'
            '%s'
            '            <thead><tr>%s</tr></thead>\n'
            '            <tbody>\n%s            </tbody>\n'
            '          </table>\n'
            '        </div>\n') % ((' class="%s"' % classes) if classes else '', cap, th, rows)


def recap(terms):
    """terms: list of (glossary term, one-line meaning) — pulled verbatim
    from the source Glossary, each linking into the consolidated appendix."""
    items = '\n'.join(
        '          <li><a href="appendix-glossary.html#%s">%s</a>'
        '<span class="recap-gloss"> &mdash; %s</span></li>' % (slug(t), t, m)
        for t, m in terms)
    return ('        <p>Every term introduced above, with its one-line meaning. '
            'Each links through to its entry in the '
            '<a href="appendix-glossary.html">consolidated Glossary</a>.</p>\n'
            '        <ul class="recap-list">\n%s\n        </ul>\n' % items)
