# Kambio – Currency Converter

Simple, fast currency converter (USD → PKR and 150+ more) using the **Frankfurter v2 API**.

**Stack:** HTML, Tailwind CSS 3, vanilla JS, Node.js (Vercel serverless functions).

## Run locally
```bash
npm install
npm run build     # compiles Tailwind -> public/styles.css
npm start         # http://localhost:3000
```

## Deploy on Vercel
1. Push this folder to GitHub (or run `npx vercel` inside it).
2. Import the repo in Vercel. No framework preset needed, no environment variables.
3. Vercel runs `npm run build` (see `vercel.json`) and serves `public/` plus `api/*`.

## Structure
- `public/` – `index.html`, `app.js`, compiled `styles.css`
- `src/input.css` + `tailwind.config.js` – Tailwind source and theme
- `api/currencies.js`, `api/convert.js` – serverless endpoints
- `lib/frankfurter.js` – API client with caching
- `server.js` – local dev server only

Note: Frankfurter **v2** is used because the old v1 (ECB-only) does not include PKR.
