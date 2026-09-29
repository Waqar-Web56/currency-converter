(() => {
  const $ = (id) => document.getElementById(id);
  const amountEl = $("amount"), fromEl = $("from"), toEl = $("to");
  const PAIRS = [["USD","PKR"],["EUR","PKR"],["GBP","PKR"],["AED","PKR"],["SAR","PKR"],["USD","EUR"],["USD","INR"]];
  const PRIORITY = ["USD","EUR","GBP","PKR","AED","SAR","INR","CAD","AUD","JPY","CNY"];

  let names;
  try { names = new Intl.DisplayNames(["en"], { type: "currency" }); } catch { names = null; }

  const fmt = (n, code, maxFrac) => {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: code, currencyDisplay: "code", maximumFractionDigits: maxFrac ?? 2 })
        .format(n).replace(/\u00a0/g, " ");
    } catch { return `${n.toFixed(2)} ${code}`; }
  };
  const parseAmount = () => Number(amountEl.value.replace(/,/g, "").trim());
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const setErr = (m = "") => { $("err").textContent = m; };

  async function api(path) {
    const res = await fetch(path);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Something went wrong. Try again.");
    return data;
  }

  function fillSelects(list) {
    const rank = (c) => { const i = PRIORITY.indexOf(c.code); return i === -1 ? 99 : i; };
    const sorted = [...list].sort((a, b) => rank(a) - rank(b) || a.code.localeCompare(b.code));
    const opts = sorted.map((c) => {
      const name = (names && names.of(c.code)) || c.name || "";
      const label = name && name !== c.code ? `${c.code} – ${name}` : c.code;
      return `<option value="${c.code}">${label}</option>`;
    }).join("");
    fromEl.innerHTML = opts; toEl.innerHTML = opts;
    const url = new URLSearchParams(location.search);
    fromEl.value = has(list, url.get("from")) || "USD";
    toEl.value = has(list, url.get("to")) || "PKR";
    if (url.get("amount")) amountEl.value = url.get("amount");
  }
  const has = (list, code) => code && list.some((c) => c.code === code.toUpperCase()) ? code.toUpperCase() : null;

  async function convert() {
    const amount = parseAmount();
    if (!Number.isFinite(amount) || amount < 0) { setErr("Enter a valid amount, like 100 or 2500.50."); return; }
    setErr();
    const from = fromEl.value, to = toEl.value;
    try {
      const d = await api(`/api/convert?from=${from}&to=${to}&amount=${amount}`);
      $("fromText").textContent = `${fmt(d.amount, from)} equals`;
      $("result").textContent = fmt(d.result, to, d.result < 1 ? 6 : 2);
      $("rateText").textContent = `1 ${from} = ${d.rate.toLocaleString("en-US", { maximumFractionDigits: 6 })} ${to} · Updated ${d.date}`;
      $("heroLine").textContent = `1 ${from} =`;
      $("heroRate").textContent = `${d.rate.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${to}`;
      $("heroMeta").textContent = `Latest published rate, ${d.date}. Change the amount or currencies to convert instantly.`;
      const u = new URL(location.href);
      u.search = new URLSearchParams({ from, to, amount }).toString();
      history.replaceState(null, "", u);
    } catch (e) { setErr(e.message); }
  }
  const convertSoon = debounce(convert, 250);

  function renderChips() {
    $("chips").innerHTML = PAIRS.map(([a, b]) => `<button type="button" class="chip" data-a="${a}" data-b="${b}">${a} to ${b}</button>`).join("");
    $("chips").addEventListener("click", (e) => {
      const btn = e.target.closest("button"); if (!btn) return;
      fromEl.value = btn.dataset.a; toEl.value = btn.dataset.b; convert();
    });
  }

  amountEl.addEventListener("input", convertSoon);
  fromEl.addEventListener("change", convert);
  toEl.addEventListener("change", convert);
  $("swap").addEventListener("click", () => { [fromEl.value, toEl.value] = [toEl.value, fromEl.value]; convert(); });

  (async function init() {
    renderChips();
    try {
      const { currencies } = await api("/api/currencies");
      fillSelects(currencies);
      convert();
    } catch (e) { setErr(e.message); }
  })();
})();
