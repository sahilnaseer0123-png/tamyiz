# TAMYIZ website

The online shop for TAMYIZ™ (co-founded by Sahil and Basit): digital products (e-books, Notion templates, design kits),
sold with Razorpay and delivered as download / duplicate links.

## Stack

- Vite single-page app (plain JavaScript, no framework) + three.js for the hero. `npm run dev` for local work.
- Hosting (moved from Vercel 23 Oct 2026): Cloudflare Pages, free plan (Vercel's free plan forbids business sites).
  Build `npm run build` (= `vite build` + `scripts/build-pages.js`), output `dist`. Production branch: `main`
  (Settings → Build → Branch control); pushes to any other branch only make Preview builds.
- Pages: `scripts/build-pages.js` writes one HTML file per address (`editions.html`, `edition/<slug>.html`,
  `legal/<slug>.html` ...) with that page's title, description and share picture from `src/data/seo.js`, plus
  `sitemap.xml` and `404.html`. Cloudflare answers unknown addresses with a real 404. A NEW route in
  `parseRoute()` (tamyiz-unified-app.js) must also be added to `allPages()` in seo.js, or it 404s when opened directly.
- Share pictures: `public/og/` (1200×630 JPG per product + `tamyiz.jpg`). Product photos are WebP in
  `public/assets/images/products/`; keep new images WebP and under ~150 KB.
- Server code: Cloudflare Pages Functions in `functions/api/` (`create-order`, `verify-payment`). They are thin; all logic
  is in `server/payments.js`, which the Vite dev server also uses (`vite.config.js`), so local and live behave the same.
- Settings (Cloudflare: project → Settings → Variables and secrets; locally `.dev.vars` for wrangler or `.env` for Vite,
  both git-ignored): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (secret), `RESEND_API_KEY` (secret, optional receipts),
  `RECEIPT_FROM` (optional, a verified Resend sender), `URL_*` download links (see `.env.example`), `TAMYIZ_SANDBOX`.
- Deploys stop silently if Cloudflare loses access to this repo (yellow "disconnected" banner in the Pages project).
  Fix: GitHub → Settings → Applications → Cloudflare Workers and Pages → Configure → Repository access must list
  BOTH tamyiz and eternal-polyclinic → Save. (Happened 23 Oct 2026.)
- Tests: `npm test` (node test runner, `tests/`). Run before every push. `npm run cf:dev` runs the built site on
  Cloudflare's runtime locally (wrangler).

## Quality baseline (24 Oct 2026, local build)

axe: 0 violations on every page, phone and desktop. Lighthouse mobile: performance 83–87, accessibility 100,
SEO 100, best practices 100. Touch screens get 44px tap areas (`@media (pointer: coarse)` block at the end of
tamyiz-unified.css). Don't ship below this.

## Payment rules (security; do not loosen)

1. The server decides the payment mode. Never trust a `mode`, price or item list sent by the browser.
2. With Razorpay keys set: unlock only after the HMAC signature matches (Web Crypto, constant-time compare) AND
   Razorpay's API confirms the payment belongs to that order, is authorized/captured, and covers the order amount.
3. What gets unlocked is read back from the Razorpay order notes written at creation (`itemsToNotes`/`notesToItems`).
4. Prices and coupons live only in `server/payments.js` (`CATALOG_PRICES`, `VALID_COUPONS`). Keep them in step with
   `src/data/products.js`, which is display-only.
5. The sandbox simulator (free unlock, for testing) runs only when `TAMYIZ_SANDBOX=true`. Never set it in production.
   Without keys and without sandbox, checkout returns a polite 503 pointing buyers to WhatsApp.
6. Never commit keys. The repo is public.

## Open issues (as of 23 Oct 2026, decisions for Sahil and Basit)

- Product ratings and review counts in `src/data/products.js` (e.g. 5.0 from 54 reviews) are not from real customers.
- "Original" prices shown struck through (e.g. ~~₹999~~ ₹499) are not prices anything was sold at.
- Download links default to `assets.tamyiz.in` / `tamyiz.notion.site`; they must point at real files before payments go live.
- The legal page and receipt email name `tamyiz.in`; the live address is https://tamyiz.pages.dev.
