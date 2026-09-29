// Small Frankfurter (v2) client with in-memory caching.
// v2 is required for currencies like PKR that the old ECB-only API lacked.
const BASE = "https://api.frankfurter.dev/v2";

const FALLBACK = ["USD","EUR","GBP","PKR","INR","AED","SAR","CAD","AUD","JPY","CNY","CHF","TRY","SGD","MYR","NZD","SEK","NOK","DKK","ZAR","BDT","LKR","QAR","KWD","OMR","BHD","EGP","THB","IDR","KRW","HKD","PHP","BRL","MXN"];

const cache = new Map();
async function cached(key, ttlMs, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t < ttlMs) return hit.v;
  const v = await loader();
  cache.set(key, { t: Date.now(), v });
  return v;
}

async function getJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const err = new Error(`Frankfurter responded with ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function normalizeCurrencies(data) {
  let list = [];
  if (Array.isArray(data)) {
    list = data.map((i) => ({
      code: String(i.iso_code || i.code || i.currency || "").toUpperCase(),
      name: i.name || ""
    }));
  } else if (data && typeof data === "object") {
    list = Object.entries(data).map(([code, v]) => ({
      code: code.toUpperCase(),
      name: typeof v === "string" ? v : (v && v.name) || ""
    }));
  }
  return list.filter((c) => /^[A-Z]{3}$/.test(c.code));
}

async function getCurrencies() {
  return cached("currencies", 6 * 60 * 60 * 1000, async () => {
    try {
      const list = normalizeCurrencies(await getJson(`${BASE}/currencies`));
      if (list.length > 10) return list.sort((a, b) => a.code.localeCompare(b.code));
    } catch (_) { /* fall through to the built-in list */ }
    return FALLBACK.map((code) => ({ code, name: "" }));
  });
}

async function getRate(from, to) {
  if (from === to) return { base: from, quote: to, rate: 1, date: new Date().toISOString().slice(0, 10) };
  return cached(`rate:${from}:${to}`, 10 * 60 * 1000, () => getJson(`${BASE}/rate/${from}/${to}`));
}

module.exports = { getCurrencies, getRate };
