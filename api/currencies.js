const { getCurrencies } = require("../lib/frankfurter");

module.exports = async (req, res) => {
  try {
    const currencies = await getCurrencies();
    res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
    res.status(200).json({ currencies });
  } catch (e) {
    res.status(502).json({ error: "Could not load currencies. Try again in a moment." });
  }
};
