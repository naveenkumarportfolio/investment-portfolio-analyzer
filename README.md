# Investment Portfolio Analyzer

A lightweight, browser-based tool that analyzes portfolio allocation, returns and asset exposure in seconds. Built with plain HTML, CSS and JavaScript. No frameworks, no backend and no external services.

> **Educational project.** This tool is for educational and analytical purposes only. It does not provide investment advice. See the [Disclaimer](#12-disclaimer).

---

## 1. Project Overview

Investment Portfolio Analyzer lets a user enter a set of investments (name, amount, return %, asset type) and instantly see how the portfolio is built and how it has performed. It calculates allocation, weighted return, estimated gain and equity/debt exposure, and presents the results as dashboard cards, charts and a plain-English summary.

The project runs entirely in the browser. Open `index.html` and it works. It was built as a finance-and-coding learning project and designed to be small enough to read and understand end to end.

## 2. Problem Statement

Individual investors often hold several assets, such as index funds, flexi-cap funds and debt funds, and track them in separate apps or spreadsheets. Two questions are hard to answer at a glance:

- *How is my money actually split across assets and asset classes?*
- *What is my overall return once bigger and smaller holdings are weighted properly?*

A simple average of returns is misleading because a ₹4,000 holding and a ₹40,000 holding would count equally. This project calculates the correct weighted figures and shows them clearly.

## 3. Objectives

- Apply core portfolio-analysis concepts (allocation, weighted return, asset-class exposure) in a working application.
- Keep the code beginner-friendly, well commented and free of unnecessary dependencies.
- Present results in a clean, professional, responsive dashboard.
- Validate calculations against hand-worked examples and test edge cases.
- Keep the tool analytical only, with no buy, sell or hold recommendations.

## 4. Features

- **Dynamic asset table:** add and delete assets with name, amount (₹), return (%) and type (Equity / Debt / Other).
- **Dashboard cards:** Total Investment, Portfolio Return, Estimated Gain, Equity Allocation and Debt Allocation.
- **Portfolio allocation chart:** a donut chart with a legend showing each asset's share.
- **Asset return comparison:** horizontal bars, with negative returns shown in red.
- **Highlights:** most concentrated asset, best-performing asset and worst-performing asset, with a note when all returns are tied.
- **Portfolio summary:** an auto-generated, descriptive paragraph (numbers only, no advice).
- **Input validation:** clear messages for empty names, zero or negative amounts, missing returns, returns below -100% and amounts too large to calculate.
- **Indian number formatting:** for example ₹1,25,000.
- **Methodology section:** the formulas explained in plain language on the page itself.
- **Responsive layout:** works from phone to desktop with no sideways scrolling.
- **Reset button:** clears the table and dashboard.

## 5. Financial Formulas

Let each asset *i* have an investment amount `Aᵢ` and a return `Rᵢ` (in %). Σ means "add up the result for every asset".

| Metric | Formula |
|---|---|
| Total investment | `Total = Σ Aᵢ` |
| Portfolio allocation | `Allocationᵢ (%) = Aᵢ ÷ Total × 100` |
| Weighted portfolio return | `Weighted Return = Σ (Weightᵢ × Rᵢ)` where `Weightᵢ = Aᵢ ÷ Total` |
| Estimated gain | `Gain = Σ (Aᵢ × Rᵢ ÷ 100)` |
| Equity allocation | `Equity % = Total equity investment ÷ Total × 100` |
| Debt allocation | `Debt % = Total debt investment ÷ Total × 100` |

Notes:
- The *weight* is the allocation written as a decimal (44.44% = 0.4444).
- Weighted return and estimated gain are consistent with each other: `Total × Weighted Return ÷ 100 = Estimated Gain`.
- Equity, Debt and Other allocations always add up to 100%.
- **Most concentrated asset** is the one with the highest allocation. **Best / worst performer** are the assets with the highest and lowest return %.

## 6. Example Portfolio

| Asset | Amount | Return | Type | Allocation | Gain |
|---|---|---|---|---|---|
| Nifty 50 | ₹20,000 | 12% | Equity | 44.44% | ₹2,400 |
| Flexi Cap | ₹15,000 | 14% | Equity | 33.33% | ₹2,100 |
| Debt Fund | ₹10,000 | 7% | Debt | 22.22% | ₹700 |

**Results**

| Metric | Value |
|---|---|
| Total investment | ₹45,000 |
| Weighted portfolio return | 11.56% |
| Estimated gain | ₹5,200 |
| Equity allocation | 77.78% |
| Debt allocation | 22.22% |
| Most concentrated asset | Nifty 50 (44.44%) |
| Best-performing asset | Flexi Cap (14%) |
| Worst-performing asset | Debt Fund (7%) |

**Worked example (weighted return):**
`(0.4444 × 12) + (0.3333 × 14) + (0.2222 × 7) = 5.33 + 4.67 + 1.56 = 11.56%`

The app loads with this portfolio pre-filled so the dashboard is visible straight away.

## 7. Technology Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, Grid, Flexbox, `conic-gradient` for the donut chart) |
| Logic | Vanilla JavaScript (ES6) |
| Charts | Hand-built with CSS and DOM, no chart library |
| Backend / database / APIs | None |

**Project structure**

```
portfolio-analyzer/
├── index.html   # page structure
├── style.css    # dashboard styling and responsive layout
├── script.js    # input handling, calculations, charts, validation
└── README.md
```

**Run locally:** download or clone the repository and open `index.html` in any modern browser. No installation or build step is needed.

## 8. How the Project Was Developed Using Claude Code

The project followed a structured, AI-assisted workflow with Claude (Anthropic's AI assistant), with the developer steering each stage:

1. **Specification first:** the scope, constraints (HTML/CSS/vanilla JS only, 2-hour limit) and required outputs were defined before any code was written.
2. **Plan and formulas before code:** an implementation plan and beginner-friendly explanations of every formula were reviewed and approved up front.
3. **File-by-file build:** `index.html`, `style.css` and `script.js` were created one at a time, with each file explained as it was written.
4. **Formula review:** the calculation code was audited as a "financial calculation reviewer". Expected results were worked out by hand and compared with the app's output.
5. **Iteration:** a project header, a Methodology section and tie-handling were added in small, focused steps.
6. **Final QA:** ten scenarios were tested in a real browser, and only genuine bugs were fixed.

The developer reviewed the plan, the formulas and the results at each stage. The workflow doubled as a way to learn how to prompt, review and verify AI-generated code.

## 9. Testing and Validation

**Calculation check.** The app's `calculate()` function was run against the example portfolio and compared with hand-computed values. All results matched: total, each allocation, weighted return, estimated gain, equity %, debt %, and the concentrated, best and worst assets. The allocations sum to exactly 100%, and `Total × Weighted Return ÷ 100` equals the estimated gain.

**QA scenarios.** The real page was driven in headless Chromium (Playwright), clicking the buttons and typing into the inputs:

| # | Scenario | Outcome |
|---|---|---|
| 1 | Empty portfolio | Friendly message; dashboard cleared |
| 2 | One asset | Correct; the same asset is largest, best and worst |
| 3 | Multiple assets | Matches hand calculation |
| 4 | Zero investment | Rejected with a clear message |
| 5 | Negative investment | Rejected with a clear message |
| 6 | Negative return | Correct loss figures; shown in red |
| 7 | 100% equity | 100% / 0% split |
| 8 | 100% debt | 0% / 100% split |
| 9 | Very large amounts | Correct for ₹7.5 quadrillion; overflow to Infinity is caught |
| 10 | Delete an asset and recalculate | All cards, charts and highlights update |

**Bugs found and fixed during review:**
- Bar chart scaling was wrong for returns below 1%.
- Tied returns named one asset as both best and worst.
- Returns below -100% were accepted.
- Stale results stayed on screen after invalid input.
- Overflow to Infinity displayed "₹∞".
- On phones, the page scrolled sideways, partly because of a hidden table header and long numbers.

Layout was checked at 320, 360, 375, 414, 768 and 1280 px with no sideways scrolling. No console errors were observed in any scenario. The test scripts are not included in this repository, and testing was done in Chromium only.

## 10. Limitations

- **Single-period estimate:** returns are applied once. They are not compounded or annualized, and the tool does not model time.
- **User-entered returns:** results are only as accurate as the returns entered. There is no live market data.
- **No saved data:** assets are lost when the page is refreshed.
- **Simplified asset classes:** only Equity, Debt and Other are supported.
- **Costs ignored:** taxes, fees, expense ratios and inflation are not modeled.
- **No risk analysis:** volatility, drawdown and correlation are not calculated.
- **Rounded display:** percentages show 2 decimals, so displayed values may add up to 99.99% or 100.01% even though the underlying figures are exact.
- **Rupee-only formatting:** the currency is fixed to ₹.
- **Browser coverage:** tested in Chromium; other browsers are expected to work but were not formally tested.

## 11. Future Improvements

- Save and restore portfolios with `localStorage`.
- Import and export portfolios as CSV.
- Annualized return (CAGR) with an investment date or holding period.
- Risk measures such as volatility and a simple diversification index.
- More asset classes (gold, real estate, international) and a currency selector.
- A comparison of a user-defined target allocation against actual allocation.
- Dark mode and a print-friendly or PDF report.
- Automated unit tests for the calculation functions, plus a formal accessibility audit.

## 12. Disclaimer

This application is for **educational and analytical purposes only**. It performs arithmetic on figures entered by the user and does not provide investment, financial, tax or legal advice. It does not recommend buying, selling or holding any security or asset. Results depend entirely on the inputs provided, and past or expected returns do not guarantee future performance. Consult a qualified financial professional before making investment decisions.

## 13. Author

**Naveen Kumar**
BBA Finance & Marketing Analytics
CHRIST (Deemed to be University)
