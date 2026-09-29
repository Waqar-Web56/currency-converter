const { getRate } = require("../lib/frankfurter");

module.exports = async (req, res) => {
  const from = String(req.query.from || "").toUpperCase();
  const to = String(req.query.to || "").toUpperCase();
  const amount = Number(req.query.amount);

  if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
    return res.status(400).json({ error: "Choose two valid currencies." });
  }
  if (!Number.isFinite(amount) || amount < 0 || amount > 1e12) {
    return res.status(400).json({ error: "Enter an amount between 0 and 1,000,000,000,000." });
  }

  try {
    const data = await getRate(from, to);
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    res.status(200).json({
      from, to, amount,
      rate: data.rate,
      result: amount * data.rate,
      date: data.date
    });
  } catch (e) {
    const notFound = e.status === 404 || e.status === 422;
    res.status(notFound ? 404 : 502).json({
      error: notFound ? `No rate available for ${from} to ${to}.` : "Rate service is unavailable. Try again shortly."
    });
  }
};
