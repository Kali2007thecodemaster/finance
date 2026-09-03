# Personal Finance From Scratch
### A Zero-Knowledge Curriculum, Taught Through the Lens of Investment Banking — Canadian Edition

**Who this is for:** someone who has *heard* the words "APR," "diversification," and "balance sheet" but couldn't confidently explain any of them out loud. This document assumes nothing. Every term is defined the first time it's used. Every formula gets an analogy before it gets symbols.

**On ECON 201, ECON 202, BUS 100:** treated as *refreshers*, not prerequisites assumed retained cold. Relevant modules open with a "What You Already Half-Remember" box rebuilding what's needed in one paragraph before building on top of it.

---

## How to Read This Document

> **Definition X.X** — a term, defined precisely, first use. Every one is also in the Glossary at the end.

> **Why This Matters** — before any formula, a plain-English reason you'd ever care.

> **Worked Example** — real numbers, done by hand.

> **Common Confusion** — the specific way beginners get this wrong, named explicitly.

> **Knowledge Check** — a question with the answer hidden below it. Don't peek until you've tried.

---

## Module 0 — The Absolute Basics

### 0.1 What Even *Is* Money, Functionally?

> **Definition 0.1 — Asset:** anything you own that has value.
> **Definition 0.2 — Liability:** anything you owe.
> **Definition 0.3 — Net Worth:** what you actually have, once debts are subtracted.
> $$\text{Net Worth} = \text{Assets} - \text{Liabilities}$$

**Why This Matters:** "how much money do I have" is a trick question if you only look at your bank balance. Net worth is the number that tells the truth.

**Worked Example:** $2,000 chequing + $1,500 laptop − $500 credit card balance:
$$\text{Net Worth} = 3500 - 500 = \$3,000$$

> **Knowledge Check:** $10,000 savings, $12,000 student debt — positive or negative net worth?
> <details><summary>Show Answer</summary>Negative: $10{,}000-12{,}000=-\$2{,}000$. Completely normal for a student — what matters is the trajectory.</details>

### 0.2 What Even *Is* Interest?

> **Definition 0.4 — Interest:** the price of using someone else's money.

**Worked Example:** $1,000 at 4%/year → $40 interest in year one. The bank pays you for the use of your money — literally what a bank *is* (Module 3).

---

## Module 1 — ECON 201/202 Refresher, and the Time Value of Money

> **ECON 201 refresher:** every decision has an **opportunity cost** — the value of the next-best thing given up.

> **ECON 202 refresher:** **inflation** erodes purchasing power over time; the **Bank of Canada**'s target rate ripples through every rate you'll encounter.

### 1.1 The Time Value of Money

> **Definition 1.1 — TVM:** a dollar today is worth more than a dollar later, because today's dollar can be invested immediately.
> **Definition 1.2 — Present Value (PV) / Definition 1.3 — Future Value (FV).**

$$FV = PV \times (1+r)^n \qquad \Longleftrightarrow \qquad PV = \frac{FV}{(1+r)^n}$$

**Worked Example:** $1,000 at 5%/year, 3 years: $FV = 1000 \times 1.05^3 = \$1,157.63$. Reversed, $1,157.63 in 3 years at 5% is worth exactly $1,000 today.

> **Common Confusion:** a higher discount rate shrinks PV *fast* because of the exponent — always sanity-check the rate assumption.

> **Knowledge Check:** At 6%, $500 in 1 year vs. $520 in 2 years — which is worth more today?
> <details><summary>Show Answer</summary>$PV_1=471.70$, $PV_2=462.85$ — the sooner payment wins.</details>

### 1.2 Compound Interest

> **Definition 1.4 — Compound Interest:** interest earned on previously earned interest.

| Year | Start | Interest | End |
|---|---|---|---|
| 1 | $1,000.00 | $70.00 | $1,070.00 |
| 2 | $1,070.00 | $74.90 | $1,144.90 |
| 3 | $1,144.90 | $80.14 | $1,225.04 |

Year 2's interest exceeds Year 1's with no new deposit — interest-on-interest, the real reason "start early" matters.

---

## Module 2 — BUS 100 (Ch. 17) Refresher: Your Personal Financial Statements

> **BUS 100 refresher:** a **balance sheet** is a snapshot (owns vs. owes, one day); an **income statement** is a video (money in vs. out, over a period).

### 2.1 Personal Balance Sheet

> **Definition 2.1 — Liquid Asset:** convertible to cash quickly without losing value. Contrast **illiquid asset**.

### 2.2 Personal Income Statement

> **Definition 2.2 — Cash Flow:** $\text{Income} - \text{Expenses}$, over a period.

> **Common Confusion:** a raise doesn't help if expenses rise to match (*lifestyle creep*) — cash flow stays flat.

**Worked Example:**

*Balance Sheet:*

| Assets | | Liabilities | |
|---|---|---|---|
| Chequing | $800 | Credit card | $300 |
| TFSA | $2,200 | Student loan | $8,000 |
| **Total** | **$3,000** | **Total** | **$8,300** |

$\text{Net Worth} = -\$5,300$

*Income Statement (1 month):*

| Income | | Expenses | |
|---|---|---|---|
| Job | $900 | Rent | $450 |
| | | Food | $250 |
| | | Subscriptions | $60 |
| **Total** | **$900** | **Total** | **$760** |

$\text{Cash Flow} = +\$140$/month — negative net worth, but improving monthly. Watch cash flow month-to-month, net worth year-to-year.

---

## Module 3 — BUS 100 (Ch. 18) Refresher: Banking and Credit

> **BUS 100 refresher:** **fractional reserve banking** — banks lend out most deposits and share a slice of what they earn with depositors.

> **Definition 3.1 — Credit Risk:** the risk a borrower won't repay; priced directly into the rate charged.

> **Common Confusion:** a credit card rate (20%+) vs. a mortgage rate (5-7%) isn't arbitrary — mortgages are **secured** (collateral seizable), cards are **unsecured** (nothing to seize but a promise).

**Worked Example:** $1,000 at 20% APR untouched a year → $1,200 owed — the same compounding math as Module 1, working against you. Why paying off high-interest debt usually outranks investing.

---

## Module 4 — BUS 100 (Ch. 19) Refresher: Capital Budgeting for Your Own Life

> **BUS 100 refresher:** companies use **capital budgeting** to decide if future cash from a project is worth more, today, than its cost now.

> **Definition 4.1 — NPV:** present value of future benefits minus present cost.
$$NPV = \left(\sum_{t=1}^{n} \frac{CF_t}{(1+r)^t}\right) - \text{Initial Cost}$$

**Worked Example:** $2,000 certification, +$3,000/year for 3 years, 6% discount rate:
$$NPV = 2830.19+2669.99+2518.86-2000=\$6{,}019.04$$
Strongly positive on these assumptions — the answer hinges entirely on honest input estimates.

---

## Module 5 — Investment Markets, From Absolute Zero

> **Definition 5.1 — Stock (Equity):** ownership share in a company.
> **Definition 5.2 — Bond:** a loan you make to a company/government, repaid at a set date (**principal**) plus interest (**coupons**).

**Why This Matters (analogy):** a stock is a slice of a bakery — upside and downside both flow to you. A bond is lending the owner money — a predictable, contractual return regardless of how business goes (barring bankruptcy).

> **Definition 5.3 — Diversification:** spreading money so no single failure badly hurts the total.

**Worked Example:** $1,000 in one stock, −50% → $500. $1,000 spread across 100 stocks, one drops 50% → $995.

> **Definition 5.4 — Index Fund / ETF:** one product holding hundreds/thousands of underlying securities — instant diversification in a single purchase.

---

## Module 6 — Building a Canadian Investment Strategy: ETFs as a Core, Stocks as a Satellite

### 6.1 Why Structure Beats Stock-Picking Skill

> **Definition 6.1 — Risk (financial sense):** volatility — how much a value bounces around, not "chance of losing everything."

**Why This Matters:** most of a portfolio's long-run outcome comes from *structure* — equity/bond split, diversification, discipline — not which individual stock got picked. Structure is the foundation; individual analysis (Module 7) is layered on top deliberately.

### 6.2 The Core-Satellite Strategy

> **Definition 6.2 — Core-Satellite Strategy:** most capital ("core") in broad, low-cost, diversified holdings; a smaller, bounded portion ("satellite") in individual stock picks or higher-conviction ideas.

**Why This Matters (analogy):** the core is a building's foundation — boring on purpose, built to never fail. The satellite is the architecture on top, where deliberate risk is allowed because a mistake there can't take the whole structure down.

> **Common Confusion:** core-satellite isn't "safe stocks vs. risky stocks." The core is about *structural diversification* (an ETF holding hundreds of companies) — a single stock, however stable, is never structurally "core."

### 6.3 Building the Core: Canadian All-in-One ETFs

> **Definition 6.3 — All-in-One ETF:** a single ETF holding a fixed, auto-rebalanced mix of other ETFs (Canadian/US/international equity, bonds).

| Ticker | Equity / Bond split | Use case |
|---|---|---|
| VEQT / XEQT | 100 / 0 | Long horizon (10+ yrs), full growth |
| VGRO / XGRO | 80 / 20 | Long horizon, slightly more stability |
| VBAL / XBAL | 60 / 40 | Medium horizon, balanced |
| VCNS / XCNS | 40 / 60 | Shorter horizon, capital preservation leaning |
| VCIP / XCIP | 20 / 80 | Very short horizon, mostly stability |

This table *is* the glide path for a house-purchase bucket (VBAL sliding toward VCNS/VCIP) and the retirement-bucket logic (VEQT/XEQT) from earlier in your planning.

> **Knowledge Check:** retirement (40 yrs out) vs. house (6 yrs out) — which ETF fits each?
> <details><summary>Show Answer</summary>Retirement: VEQT/XEQT (long horizon, full equity). House: closer to VBAL, gliding toward VCNS/VCIP as the date nears (shorter horizon → more stability).</details>

### 6.4 Account Placement: A Distinctly Canadian Consideration

> **Definition 6.4 — Withholding Tax:** tax a foreign government deducts at source from dividends paid abroad.

**Why This Matters:** the US withholds 15% on dividends to Canadian investors by default — but:
- **RRSP:** the Canada-US tax treaty **eliminates** this withholding on US-listed holdings — RRSP's biggest asset-location edge over a TFSA.
- **TFSA / FHSA:** the treaty exemption does **not** apply — the 15% is withheld and effectively lost, since these accounts' tax-free status isn't recognized by the IRS.

> **Common Confusion:** this applies to **US-listed** holdings directly. A Canadian-listed all-in-one ETF (Section 6.3) has a different wrapper structure — for most beginner core holdings this matters far less than it does for individual US stocks/ETFs held directly. **Practical takeaway:** this nuance mostly affects the *satellite*, not a Canadian-listed core.

> **Definition 6.5 — Dividend Tax Credit:** reduces tax on *Canadian* corporate dividends, **non-registered accounts only** — irrelevant inside TFSA/RRSP/FHSA, since those aren't taxed on dividends at all. One more reason to fill registered accounts first.

### 6.5 Building the Satellite: How Much, and How

> **Definition 6.6 — Satellite Allocation:** the deliberately bounded % of a portfolio set aside for individual stock selection.

**Worked Example:** 90/10 core/satellite, satellite → $0: portfolio retains 90% of value. 50/50 split, same bad outcome: loses half. **Satellite size is a risk decision made before any stock is picked.**

**Practical starting range:** 5-15% of total invested capital while still learning equity analysis.

Every satellite pick runs through the full Module 7 framework — filings (7.4), four-pillar thesis (7.2), bull/base/bear scenarios — never bought on a headline or tip.

> **Common Confusion:** letting a winning satellite pick drift unchecked to 30-40% of the portfolio. A tripled stock doesn't just make you richer — it silently turns a bounded bet into an oversized, undiversified one.

### 6.6 Rebalancing Mechanics

> **Definition 6.7 — Rebalancing:** selling what's grown beyond target weight, buying what's fallen below, to restore the original structure.

**Worked Example:** 90/10 drifts to 80/20 after a strong satellite year — concentration risk has doubled relative to plan. Rebalancing trims back to 90/10, banking gains, restoring the deliberate risk level.

**Simple rule:** rebalance annually, or whenever an allocation drifts more than 5 percentage points from target — whichever comes first.

### 6.7 A Worked Canadian Portfolio Blueprint

| Bucket | Account | Holding | % of that bucket |
|---|---|---|---|
| Retirement (core) | TFSA | VEQT or XEQT | 100% |
| House, 6 yrs out (core) | FHSA | VBAL → VCNS/VCIP glide path | 100% |
| Learning satellite | Non-registered or separate TFSA sleeve | 3-5 stocks, each run through Module 7's full checklist | 5-15% of total invested capital |

> **Knowledge Check:** a satellite gold miner doubles while the core stays flat — what next?
> <details><summary>Show Answer</summary>Check drift against target %. If it's drifted more than ~5pp beyond target, trim back toward the intended allocation — banking gains, restoring the original risk level — rather than letting it grow unchecked.</details>

---

## Module 7 — Institutional-Grade Equity & Sector Analysis
### From Reading a Single Stock Quote to a Full Sector Research Thesis

Everything above is the engine; this module is how you drive it, the way a junior equity research analyst would on day one. Gold mining runs as the example throughout.

### 7.1 How to Read a Stock

> **Definition 7.1 — Ticker:** the short code identifying a stock on an exchange.
> **Definition 7.2 — Market Capitalization:** $\text{Share Price} \times \text{Shares Outstanding}$.
> **Why This Matters:** price alone tells you almost nothing about size — always think in market cap, never raw price.
> **Definition 7.3 — EPS:** $\text{Net Income} / \text{Shares Outstanding}$.
> **Definition 7.4 — P/E Ratio:** $\text{Share Price}/EPS$ — roughly, years of unchanged profit to "earn back" the price. High P/E → growth expectations (or expensive); low P/E → cheap, or declining-profit expectations. P/E alone never tells you which.
> **Definition 7.5 — Dividend Yield:** $\text{Annual Dividend per Share}/\text{Share Price}$.
> **Definition 7.6 — Beta ($\beta$):** sensitivity to overall market moves. **Worked Example:** TSX +10%, a miner with $\beta=1.8$ → roughly 18% expected move same direction — why mining equities are "leveraged plays" on their commodity.
> **Definition 7.7 — 52-Week Range** and **Definition 7.8 — Volume:** a big move on low volume is a weaker signal than the same move on high volume.

> **Common Confusion:** treating a low nominal share price as "cheap." Always normalize through market cap and P/E.

### 7.2 The Four-Pillar Institutional Research Framework

**Pillar 1 — Macroeconomic Environment.** *What's the broad backdrop doing to this asset?*
> **Definition 7.9 — Real Interest Rate:** $r_{\text{real}} \approx r_{\text{nominal}} - \pi$.
Gold is non-yielding — holding it costs the interest given up elsewhere (its opportunity cost = the real rate). Real rates fall → gold demand tends to rise. Track: central bank policy path (and its *expected future direction*), geopolitical risk premium, currency strength (DXY — a weaker USD tends to support USD-priced commodities).

> **Knowledge Check:** Fed signals faster rate cuts — first-order effect on gold?
> <details><summary>Show Answer</summary>Real rates expected to fall further → opportunity cost of holding gold falls → demand (and typically price) tends to rise, all else equal — "all else equal" being exactly what Pillars 2-4 unpack.</details>

**Pillar 2 — Industry & Fundamental Drivers.** *What's happening at the industry level?*
> **Definition 7.10 — Operating Leverage:** profit changes disproportionately to revenue because costs are largely fixed. **Worked Example:** fixed cost $1,200/oz, gold $2,000→$2,200 (+10%) → margin $800→$1,000/oz (+25%) — why miner equities often out-move the commodity itself. Track supply/demand mapping and M&A consolidation trends (majors acquiring juniors when exploration budgets shrink).

**Pillar 3 — Structural Asset & Index Mechanics.** *Does the actual instrument behave the way the thesis suggests?*
> **Definition 7.11 — Market-Cap-Weighted Index** vs. **Definition 7.12 — Equal-Weighted Index.** A market-cap-weighted miners ETF behaves mostly like its largest few names; an equal-weighted version (e.g., the index behind [TSE:ZGD]) gives mid-tier miners equal say — typically higher volatility, stronger upside capture in a rally, sharper downside in a downturn. Neither is "better" — they express different bets.
> **Definition 7.13 — Stock Split:** always use **split-adjusted** price data; an unadjusted chart can show a fake "90% crash" on a split date.

**Pillar 4 — Predictive Frameworks & Scenario Modeling.** *What are the plausible forward paths?*
> **Definition 7.14 — Scenario Analysis:** multiple internally consistent narratives (bull/base/bear) instead of one point forecast — the same DCF (7.3), run multiple times under different assumptions.

| Scenario | Macro (Pillar 1) | Industry (Pillar 2) | Thesis |
|---|---|---|---|
| Bull | Faster rate cuts, elevated geopolitical premium | Continued central bank accumulation, constrained supply | Price and margins expand; equal-weighted outperforms |
| Base | Slow, expected easing | Moderate demand/supply growth | Range-bound; performance driven by execution |
| Bear | Resilience delays cuts, elevated real rates | Demand stalls | Underperformance; high-beta names hit hardest |

> **Common Confusion:** treating "base case" as the prediction. The *range* across scenarios, and sensitivity to key assumptions, often matters more than any single point estimate.

### 7.3 Valuation Core: Discounted Cash Flow (DCF)

> **Definition 7.15 — Valuation:** estimating true worth vs. current price.
> **Definition 7.16 — DCF:** forecasting future cash, discounting each year to present value (Module 1's formula), summing.
$$\text{Company Value} = \sum_{t=1}^{n} \frac{FCF_t}{(1+r)^t}$$
> **Common Confusion:** a DCF doesn't produce "the" correct value — it produces *a* value, entirely dependent on your assumptions. Valuation is reasoned estimation, not precise measurement.

### 7.4 A Practical Reading Checklist

1. Annual report / 10-K (US) or SEDAR+ filing (Canada) — management's narrative, risk factors, audited statements.
2. Revenue/margin trend, 3-5 years — improving, flat, or deteriorating, and why (per management).
3. Balance sheet health — debt relative to cash flow (Module 2's ratios).
4. Free cash flow, not just net income — harder to manipulate via accounting choices.
5. Peer comparison — does a P/E/margin/growth gap make sense given Pillars 1-4, or is it a pricing anomaly?

### 7.5 Using Google Finance in Practice (With Google One)

**Good for:** real-time-ish quotes/charting (the 7.1 vocabulary), watchlists (sync via Google One), news-per-ticker, quick peer P/E comparison.

**Not built for — go elsewhere instead:** deep historical financials → **SEDAR+** (Canada) / **EDGAR** (US); custom screening → **TradingView** / **Yahoo Finance** screeners; corporate-actions/split auditing → exchange announcements or Yahoo's historical export; DCF modeling → your own spreadsheet, using filing data as inputs.

**Workflow:** watchlist in Google Finance → pull filings from SEDAR+/EDGAR for interesting names → screen peers on TradingView/Yahoo → build your own DCF/scenario table.

### 7.6 Reading an ETF Fact Sheet, Financial Reports, and News

Worked using Global X's **PAVE** (U.S. Infrastructure Development ETF) fact sheet.

**Header/category:** "Equity - Thematic - Infrastructure & Environment."
> **Definition 7.17 — Thematic ETF:** built around a narrative/trend, not a broad market segment. **Why This Matters:** a thematic ETF is never core-portfolio material (Module 6.2) — by definition it's concentrated, not structurally diversified. It belongs in the satellite sleeve, sized and researched like a stock pick.

**Key Information:**
> **Definition 7.18 — Inception Date** (PAVE: 03/06/2017, ~9-year track record — a fund under 3 years old has little history worth weighting).
> **Definition 7.19 — Underlying Index** (PAVE tracks the Indxx U.S. Infrastructure Development Index — the ETF follows this rulebook, it doesn't invent its own holdings).
> **Number of Holdings (100):** diversified *within the theme*, not across the whole economy.
> **Definition 7.20 — AUM** ($14.57B — higher AUM → better liquidity, lower shutdown risk).
> **Total Expense Ratio (0.47%):** roughly double a Module 6.3 all-in-one ETF — the cost of a narrower, curated exposure.

**Trading Details:**
> **Definition 7.21 — CUSIP:** a security's unique "serial number." Listing on Cboe BZX (vs. NYSE/Nasdaq) says nothing about quality — just a different legitimate venue.

**Performance table (real PAVE numbers):**

| | 1Y |
|---|---|
| NAV | 36.30% |
| Market Price | 36.36% |
| Index | 36.93% |

> **Definitions 7.22-7.24 — NAV, Market Price return, Tracking Difference.** Here: Index 36.93% vs. NAV 36.30% → **−0.63pp tracking difference**, mostly explained by the 0.47% expense ratio — the fee's drag, made visible on a real sheet.

> **Knowledge Check:** two ETFs on the same index, 0.10% vs. 0.80% expense ratio — which shows a bigger negative tracking difference over 5 years?
> <details><summary>Show Answer</summary>The 0.80% fund — a bigger structural drag, compounding the same way Module 1.2's math works, in reverse.</details>

**Holdings/sector breakdown:** top holding (Quanta Services) is only 4.06% — no single-name dominance — but sector breakdown shows 73.34% Industrials, confirming the "Thematic" concentration despite 100 nominal holdings. **This is how you check whether diversification (Module 5.2) is real or superficial** — holdings count alone can overstate it.

**The fine print:** risk disclosures ("narrowly focused investments typically exhibit higher volatility," specific regulatory/construction-financing/environmental risks) are effectively the fund manager's own pre-written Pillar 1/2 risk factors — never skip this section.

**Reading financial reports — extending 7.4:**
> **Definition 7.25 — MD&A:** management's own explanation of *why* the numbers moved, not just what they are. Two companies can post identical revenue growth for very different (and very differently durable) reasons — MD&A is where you find out which. Read it as management's framing, not a neutral account; cross-check specific claims against the statements themselves.

**Reading financial news — a filter, not a trigger:**
> **Definition 7.26 — News Flow.**
1. Which pillar does this headline actually touch?
2. Does it change your bull/base/bear table, or was it already priced in? (Markets react to *surprises relative to expectations*, not confirmations.)
3. Is it a single data point or a trend? Update the thesis — don't discard or blindly confirm it on one headline.
> **Common Confusion:** news *volume* ≠ news *importance* — go back to step 1 rather than reacting to how loudly something is covered.

---

## Module 8 — Macro Reconnection

> **ECON 202 refresher, restated:** $r_{\text{real}} \approx r_{\text{nominal}} - \pi$. A 4% savings account with 3% inflation nets ~1% real — why "just save" often underperforms investing over long horizons.

---

## Module 9 — Professional Discipline: Behavior and Ethics

> **Definition 9.1 — Loss Aversion:** losses feel roughly twice as painful as equal gains feel good — causing panic-selling at the worst moments.

**Why This Matters, tied to Module 6.2:** a portfolio you can psychologically hold through a real downturn beats a theoretically superior one you abandon in a panic — matching risk to actual time horizon matters more than chasing "optimal."

---

## Glossary (Complete)

| Term | One-line meaning |
|---|---|
| Asset | Something you own with value |
| Liability | Something you owe |
| Net Worth | Assets − Liabilities |
| Interest | The price of using someone else's money |
| Time Value of Money | A dollar today > a dollar later |
| Present/Future Value | What a future/present sum is worth at another point in time |
| Compound Interest | Interest earned on previous interest |
| Liquid Asset | Easily convertible to spendable cash |
| Cash Flow | Income − Expenses, over a period |
| Credit Risk | The risk a borrower won't repay |
| NPV | Present value of benefits minus present cost |
| Stock | Ownership share in a company |
| Bond | A loan you make to a company/government |
| Diversification | Spreading risk across many investments |
| Volatility | How much a value bounces around over time |
| Time Horizon | How long until you need the money |
| Core-Satellite Strategy | Broad ETF core + smaller bounded individual-stock satellite |
| All-in-One ETF | A single ETF holding a fixed, auto-rebalanced mix of other ETFs |
| Withholding Tax | Tax a foreign government deducts at source from dividends paid abroad |
| Dividend Tax Credit | Canadian credit reducing tax on Canadian-corporation dividends, non-registered only |
| Satellite Allocation | The bounded % of a portfolio set aside for individual stock selection |
| Rebalancing | Restoring a portfolio's original target weights as holdings drift |
| Ticker | Short code identifying a stock on an exchange |
| Market Cap | Share price × shares outstanding |
| EPS | Net income ÷ shares outstanding |
| P/E Ratio | Share price ÷ EPS |
| Dividend Yield | Annual dividend per share ÷ share price |
| Beta | A stock's sensitivity to overall market moves |
| Operating Leverage | Profit changing disproportionately to revenue due to fixed costs |
| Market-Cap-Weighted Index | Index weighted by company size |
| Equal-Weighted Index | Index weighting all holdings equally |
| Stock Split | Share count up, price per share down proportionally |
| Scenario Analysis | Multiple forward narratives (bull/base/bear) instead of one forecast |
| Valuation | Estimating true worth vs. current price |
| DCF | Valuing something by discounting its future cash flows |
| Real Return | Return after subtracting inflation |
| Loss Aversion | Losses feel worse than equal gains feel good |
| Thematic ETF | An ETF built around a narrative/trend rather than a broad market segment |
| Inception Date | The date a fund began trading |
| Underlying Index | The rulebook an ETF is built to track |
| AUM | Total dollar value currently invested in a fund |
| CUSIP | A unique identifying "serial number" for a security |
| NAV | The theoretical per-share value of everything a fund holds |
| Market Price Return | What you'd actually earn trading the ETF on-exchange |
| Tracking Difference | The gap between a fund's actual return and its index's return |
| MD&A | Management's own written explanation of why the numbers moved |
| News Flow | The ongoing stream of headlines about a company/sector/economy |

---

## Where This Goes Next

This document rebuilds every concept from zero — analogy, definition, worked example, knowledge check, every time — the same pedagogy as the LLM-From-Scratch book. The natural next step, matching [[putnam-from-scratch]], is an interactive web-book version: live TVM/NPV calculators, a portfolio volatility simulator, an amortization-table generator, and a working DCF/scenario-table sandbox for Module 7 — in place of static worked examples on a page.
