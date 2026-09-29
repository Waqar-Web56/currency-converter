// Local development server. On Vercel, /api/* runs as serverless functions instead.
const express = require("express");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/api/currencies", require("./api/currencies"));
app.get("/api/convert", require("./api/convert"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Currency converter running at http://localhost:${port}`));
