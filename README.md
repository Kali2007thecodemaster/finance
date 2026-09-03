# Personal Finance From Scratch

A standalone static web-book: **a zero-knowledge personal finance curriculum,
taught through the lens of investment banking — Canadian edition.**

The site is `personal-finance-from-scratch/`. It is plain static files with no
build step for deployment: open `index.html`, or serve the directory.

## Layout

```
personal-finance-from-scratch/
├── index.html               landing page (three.js hero scene)
├── style.css                landing stylesheet
├── scene.js                 scroll-driven WebGL scene
├── three.min.js             three.js r149, vendored (MIT)
├── main.js                  marquee, reveals, filter, rail, progress badges
├── chapter.css              reader stylesheet
├── reader.js                reader behaviour (contents spy, progress, font size)
├── module0.html … module9.html
├── appendix-glossary.html   all 47 glossary terms, cross-linked
└── widgets/
    ├── tvm-calculator.js        Module 1 sandbox
    ├── amortization.js          Module 3 sandbox
    ├── npv-scenario.js          Module 4 sandbox
    └── dcf-scenario-sandbox.js  Module 7 sandbox
```

## Two systems, one publication

The landing page and the reader are deliberately different registers, and the
boundary between them is load-bearing:

- **`index.html`** is the only page that loads `three.js` and `scene.js`. A
  five-waypoint camera rig moves through a procedurally generated financial
  district as you scroll, starting at street level and ending high above it —
  the camera's altitude tracks the curriculum's own arc from "zero knowledge"
  to the macro view.
- **The module pages** load neither. They are as fast and dependency-light as
  a book page should be: one stylesheet, one script, MathJax from a CDN.

The hero scene never initialises under `prefers-reduced-motion` or without a
WebGL context. In both cases the page falls back to a static CSS gradient and
horizon grid — painted by the canvas element itself, so it is on screen before
any script runs.

## Content source

Every definition, worked example, common confusion, knowledge check, table and
formula traces to `Personal_Finance_From_Scratch_Complete.md`, which is
committed alongside the site. Counted, not estimated: **50 definitions, 11
worked examples, 10 common confusions, 6 knowledge checks, 47 glossary terms**
across 10 modules.

`build/` holds the Python generators that emit the module pages. They exist so
the chrome — head, topbar, contents sidebar, footer — is provably identical
across all ten modules; only the content differs. Regenerate with:

```sh
python3 build/m0.py && python3 build/m1.py && python3 build/m2.py \
  && python3 build/m345.py && python3 build/m6.py && python3 build/m7.py \
  && python3 build/m89.py && python3 build/glossary.py
```

`appendix-glossary.html` parses its 47 rows straight out of the source markdown
rather than retyping them, so the appendix and the curriculum cannot drift.

## Progress storage

Reading progress lives in `localStorage` under `pfs-finance:progress`, with
reader font size under `pfs-finance:reader-size`. The namespace is deliberate:
these keys never collide with the `pfs:` keys used by the separate "Putnam From
Scratch" site whose architecture this project reuses.

## Note

Educational material, not financial advice.
