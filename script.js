// ============================================================
// Investment Portfolio Analyzer - script.js
// Flow: read table rows -> validate -> calculate -> update page
// ============================================================

// ---------- Grab the page elements we need ----------
const rowsBody = document.getElementById("asset-rows");
const messageEl = document.getElementById("message");

// Colors for each asset type (match style.css)
const TYPE_COLORS = { Equity: "#0f766e", Debt: "#c98a1b", Other: "#7a8aa0" };

// Starter data so the page isn't empty
const EXAMPLE_ASSETS = [
  { name: "Nifty 50",  amount: 20000, returnPct: 12, type: "Equity" },
  { name: "Flexi Cap", amount: 15000, returnPct: 14, type: "Equity" },
  { name: "Debt Fund", amount: 10000, returnPct: 7,  type: "Debt" },
];

// ---------- Small helper functions ----------

// Format a number as rupees with Indian grouping, e.g. 125000 -> ₹1,25,000
function formatRupees(n) {
  const sign = n < 0 ? "-" : "";
  return sign + "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

// Format a percentage with 2 decimals, e.g. 11.5555 -> 11.56%
function formatPct(n) {
  return n.toFixed(2) + "%";
}

// Stop text typed by users from being treated as HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ---------- Table: add, delete, reset ----------

// Add one row to the table (values are optional)
function addRow(asset = { name: "", amount: "", returnPct: "", type: "Equity" }) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="text" class="f-name" placeholder="e.g. Nifty 50" value="${escapeHtml(asset.name).replace(/"/g, "&quot;")}"></td>
    <td><input type="number" class="f-amount" min="0" step="any" placeholder="20000" value="${asset.amount}"></td>
    <td><input type="number" class="f-return" step="any" placeholder="12" value="${asset.returnPct}"></td>
    <td>
      <select class="f-type">
        <option ${asset.type === "Equity" ? "selected" : ""}>Equity</option>
        <option ${asset.type === "Debt" ? "selected" : ""}>Debt</option>
        <option ${asset.type === "Other" ? "selected" : ""}>Other</option>
      </select>
    </td>
    <td><button class="btn delete" type="button">Delete</button></td>`;

  // Delete button removes just this row
  tr.querySelector(".delete").addEventListener("click", () => tr.remove());
  rowsBody.appendChild(tr);
}

// Read all rows into an array of asset objects.
// Returns null (and shows a message) if something is invalid.
function readAssets() {
  const assets = [];
  const rows = rowsBody.querySelectorAll("tr");

  if (rows.length === 0) {
    showMessage("Add at least one asset to analyze.");
    return null;
  }

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = row.querySelector(".f-name").value.trim();
    const amount = parseFloat(row.querySelector(".f-amount").value);
    const returnPct = parseFloat(row.querySelector(".f-return").value);
    const type = row.querySelector(".f-type").value;
    const rowNo = i + 1;

    if (name === "") { showMessage(`Row ${rowNo}: enter an asset name.`); return null; }
    if (isNaN(amount) || amount <= 0) { showMessage(`Row ${rowNo}: amount must be greater than 0.`); return null; }
    if (isNaN(returnPct)) { showMessage(`Row ${rowNo}: enter a return % (negative values are allowed).`); return null; }
    if (returnPct < -100) { showMessage(`Row ${rowNo}: return can't be below -100% (that would mean losing more than you invested).`); return null; }

    assets.push({ name, amount, returnPct, type });
  }
  return assets;
}

function showMessage(text) {
  messageEl.textContent = text;
}

// ---------- Calculations ----------
// Takes the list of assets and returns every number the dashboard needs.
function calculate(assets) {
  // 1. Total investment = sum of all amounts
  const total = assets.reduce((sum, a) => sum + a.amount, 0);

  // 2. Add allocation % to each asset = amount / total * 100
  const withAllocation = assets.map(a => ({ ...a, allocation: (a.amount / total) * 100 }));

  // 3. Weighted return = sum of (allocation% x return%) / 100
  const weightedReturn = withAllocation.reduce((sum, a) => sum + (a.allocation * a.returnPct) / 100, 0);

  // 4. Estimated gain = sum of (amount x return% / 100)
  const gain = assets.reduce((sum, a) => sum + (a.amount * a.returnPct) / 100, 0);

  // 5 & 6. Allocation by type = amounts of that type / total * 100
  const typeAmount = type => assets.filter(a => a.type === type).reduce((s, a) => s + a.amount, 0);
  const equityPct = (typeAmount("Equity") / total) * 100;
  const debtPct = (typeAmount("Debt") / total) * 100;
  const otherPct = (typeAmount("Other") / total) * 100;

  // 7, 8, 9. Find the asset with the highest allocation, highest return, lowest return.
  // We start with the first asset and replace it only if another is strictly better,
  // so on a tie the first one entered is shown.
  let concentrated = withAllocation[0], best = withAllocation[0], worst = withAllocation[0];
  for (const a of withAllocation) {
    if (a.allocation > concentrated.allocation) concentrated = a;
    if (a.returnPct > best.returnPct) best = a;
    if (a.returnPct < worst.returnPct) worst = a;
  }

  return { total, withAllocation, weightedReturn, gain, equityPct, debtPct, otherPct, concentrated, best, worst };
}

// ---------- Updating the page ----------

function updateCards(r) {
  document.getElementById("card-total").textContent = formatRupees(r.total);

  const returnEl = document.getElementById("card-return");
  returnEl.textContent = formatPct(r.weightedReturn);
  returnEl.classList.toggle("negative", r.weightedReturn < 0);

  const gainEl = document.getElementById("card-gain");
  gainEl.textContent = formatRupees(r.gain);
  gainEl.classList.toggle("negative", r.gain < 0);

  document.getElementById("card-equity").textContent = formatPct(r.equityPct);
  document.getElementById("card-debt").textContent = formatPct(r.debtPct);
}

// Donut: build a "conic-gradient" - a circle split into colored slices.
// Each asset gets a slice with its own shade of the type color.
function updateDonut(assets) {
  const shades = {};          // how many assets of each type so far
  let start = 0;
  const slices = [];
  const legend = document.getElementById("legend");
  legend.innerHTML = "";

  assets.forEach(a => {
    const n = shades[a.type] || 0;
    shades[a.type] = n + 1;
    // Same type = same color family; later assets get slightly lighter
    const color = lighten(TYPE_COLORS[a.type], n * 0.25);
    const end = start + a.allocation;
    slices.push(`${color} ${start}% ${end}%`);
    start = end;

    const li = document.createElement("li");
    li.innerHTML = `<span class="dot" style="background:${color}"></span>${escapeHtml(a.name)} (${formatPct(a.allocation)}, ${a.type})`;
    legend.appendChild(li);
  });

  document.getElementById("donut").style.background = `conic-gradient(${slices.join(", ")})`;
}

// Mix a hex color with white. amount 0 = original, 1 = white.
function lighten(hex, amount) {
  amount = Math.min(amount, 0.7);
  const num = parseInt(hex.slice(1), 16);
  const mix = shift => Math.round(((num >> shift) & 255) * (1 - amount) + 255 * amount);
  return `rgb(${mix(16)}, ${mix(8)}, ${mix(0)})`;
}

// Return bars: the longest absolute return fills the track, others scale to it.
function updateBars(assets) {
  // (|| 1 only protects against dividing by zero when every return is 0)
  const maxAbs = Math.max(...assets.map(a => Math.abs(a.returnPct))) || 1;
  const bars = document.getElementById("bars");
  bars.innerHTML = assets.map(a => {
    const width = (Math.abs(a.returnPct) / maxAbs) * 100;
    return `<div class="bar-row">
      <span class="bar-name" title="${escapeHtml(a.name)}">${escapeHtml(a.name)}</span>
      <div class="bar-track"><div class="bar-fill ${a.returnPct < 0 ? "neg" : ""}" style="width:${width}%"></div></div>
      <span class="bar-value">${a.returnPct}%</span>
    </div>`;
  }).join("");
}

function updateInsights(r) {
  const text = (a, extra) => `${a.name} (${extra})`;
  document.getElementById("in-concentrated").textContent = text(r.concentrated, formatPct(r.concentrated.allocation) + " of portfolio");
  // If every asset has the same return, there is no real best or worst
  const allTied = r.withAllocation.length > 1 && r.best.returnPct === r.worst.returnPct;
  const tiedText = "All assets tied (" + r.best.returnPct + "% return)";
  document.getElementById("in-best").textContent = allTied ? tiedText : text(r.best, r.best.returnPct + "% return");
  document.getElementById("in-worst").textContent = allTied ? tiedText : text(r.worst, r.worst.returnPct + "% return");
}

// The summary only describes the numbers - it never gives advice.
function updateSummary(r, count) {
  const gainWord = r.gain >= 0 ? "gain" : "loss";
  let text = `Your portfolio of ${formatRupees(r.total)} is spread across ${count} asset${count > 1 ? "s" : ""}. ` +
    `The weighted return is ${formatPct(r.weightedReturn)}, an estimated ${gainWord} of ${formatRupees(Math.abs(r.gain))}. ` +
    `Equity makes up ${formatPct(r.equityPct)} and debt ${formatPct(r.debtPct)}`;
  if (r.otherPct > 0) text += `, with ${formatPct(r.otherPct)} in other assets`;
  text += `. ${r.concentrated.name} is the largest holding at ${formatPct(r.concentrated.allocation)}.`;
  if (count > 1 && r.best.returnPct === r.worst.returnPct) {
    text += ` All assets have the same return of ${r.best.returnPct}%.`;
  } else if (count > 1) {
    text += ` ${r.best.name} has the highest return (${r.best.returnPct}%) and ${r.worst.name} the lowest (${r.worst.returnPct}%).`;
  }
  document.getElementById("summary").textContent = text;
}

// ---------- Button handlers ----------

function analyze() {
  showMessage("");
  const assets = readAssets();
  if (!assets) {                       // validation failed, message already shown
    clearDashboard();                  // don't leave old results next to a table that no longer matches
    return;
  }

  const result = calculate(assets);

  // Absurdly large amounts can overflow to Infinity and produce meaningless output
  if (!Number.isFinite(result.total) || !Number.isFinite(result.gain)) {
    clearDashboard();
    showMessage("These amounts are too large to calculate. Please enter smaller values.");
    return;
  }

  updateCards(result);
  updateDonut(result.withAllocation);
  updateBars(assets);
  updateInsights(result);
  updateSummary(result, assets.length);
}

// Blank out all results (cards, charts, highlights, summary).
// The table and the message are left alone.
function clearDashboard() {
  ["card-total", "card-return", "card-gain", "card-equity", "card-debt",
   "in-concentrated", "in-best", "in-worst"].forEach(id => {
    const el = document.getElementById(id);
    el.textContent = "–";
    el.classList.remove("negative");
  });
  document.getElementById("donut").style.background = "";
  document.getElementById("legend").innerHTML = "";
  document.getElementById("bars").innerHTML = "";
  document.getElementById("summary").textContent = "Click “Analyze portfolio” to see your summary.";
}

// Reset: back to one empty row and a blank dashboard
function reset() {
  rowsBody.innerHTML = "";
  addRow();
  showMessage("");
  clearDashboard();
}

document.getElementById("add-btn").addEventListener("click", () => addRow());
document.getElementById("analyze-btn").addEventListener("click", analyze);
document.getElementById("reset-btn").addEventListener("click", reset);

// ---------- Start-up: load example data and show the dashboard ----------
EXAMPLE_ASSETS.forEach(addRow);
analyze();
