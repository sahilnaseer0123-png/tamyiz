# TAMYIZ website

The online shop for TAMYIZ™ (co-founded by Sahil and Basit): PDF e-books that Sahil adds himself on /admin,
sold with Razorpay and delivered as private signed download links.

## Stack

- Vite single-page app (plain JavaScript, no framework) + three.js for the hero. `npm run dev` for local work.
- Hosting (moved from Vercel 23 Oct 2026): Cloudflare Pages, free plan (Vercel's free plan forbids business sites).
  Build `npm run build` (= `vite build` + `scripts/build-pages.js`), output `dist`. Production branch: `main`
  (Settings → Build → Branch control); pushes to any other branch only make Preview builds.
- Pages: `scripts/build-pages.js` writes one HTML file per fixed page (`editions.html`, `legal/<slug>.html` ...) with
  that page's title, description and share picture from `src/data/seo.js`, plus `404.html` (the `<!-- seo -->` markers
  stay in). Cloudflare answers unknown addresses with a real 404. A NEW fixed route in `parseRoute()`
  (tamyiz-unified-app.js) must also be added to `allPages()` in seo.js, or it 404s when opened directly.
- E-book pages `/edition/<slug>` and `/sitemap.xml` are made live by Pages Functions (`functions/edition/[slug].js`,
  `functions/sitemap.xml.js`) from the catalogue, so each e-book's cover is its share preview. Default share picture: `public/og/tamyiz.jpg`.
- Server code: one Pages Function for all of `/api/*` (`functions/api/[[path]].js` → `server/router.js`). The Vite dev
  server runs the same router (`vite.config.js`), so local and live behave the same.

## E-books and /admin (24 Oct 2026)

- The 8 template products are gone. Every e-book is added on `/admin` (`admin.html`, `src/admin/admin.js`): title,
  one-line summary, price, pages, description, chapters, cover (shrunk to 1200 px in the browser), PDF (max 25 MB).
- Storage: Cloudflare KV, binding `TAMYIZ_STORE` (free; 1 GB, 25 MiB per value, 1,000 writes/day). Keys: `products`
  (JSON list), `cover:<id>`, `file:<id>`. See `server/catalog.js`. Locally: `.local-store/` (`server/dev-kv.js`).
- Status per e-book: `draft` (admin only) · `soon` (shop, "Pre-order on WhatsApp") · `on-sale` (buyable; needs the PDF).
  The payment server sells only `on-sale` books (409 otherwise), so the page can't be tampered into selling others.
- The shop loads `/api/products` before drawing (preloaded in index.html); `src/data/products.js` is filled in place.
  Text from /admin is HTML-escaped by the server (`publicProduct`) because the shop draws with innerHTML; seo.js and the
  WhatsApp pre-order message unescape it. The admin page itself only uses textContent.
- Admin login: Cloudflare secret `ADMIN_PASSWORD` (12+ chars) → signed cookie (HttpOnly, Secure, SameSite=Strict,
  Path=/api/admin, 12 h). 10 wrong passwords per IP → 15 min lock. Changes also need header `X-Tamyiz-Admin: 1`.
- Downloads: after a verified payment, `/api/download/<id>?p=<payment>&e=<expiry>&s=<HMAC>` (1 year), signed with
  `DOWNLOAD_SECRET` or `RAZORPAY_KEY_SECRET`. The PDF is never at a public address. A paid order is delivered even if
  the book is switched off later; deleting a book breaks its links (admin warns).
- Settings (Cloudflare: project → Settings → Variables and secrets; locally `.dev.vars` for wrangler or `.env` for Vite,
  both git-ignored): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (secret), `RESEND_API_KEY` (secret, optional receipts),
  `RECEIPT_FROM` (optional, a verified Resend sender), `URL_*` download links (see `.env.example`), `TAMYIZ_SANDBOX`.
- Deploys stop silently if Cloudflare loses access to this repo (yellow "disconnected" banner in the Pages project).
  Fix: GitHub → Settings → Applications → Cloudflare Workers and Pages → Configure → Repository access must list
  BOTH tamyiz and eternal-polyclinic → Save. (Happened 23 Oct 2026.)
- Tests: `npm test` (node test runner, `tests/`: payments, downloads, admin). Run before every push. `npm run cf:dev` runs the built site on
  Cloudflare's runtime locally (wrangler, with a local KV store; set ADMIN_PASSWORD/TAMYIZ_SANDBOX in .dev.vars).

## Selling

Coming soon = "COMING SOON" badge, "Pre-order on WhatsApp" button (product filled in), no Buy Now, no Bag/Checkout
in the header unless some book is on sale, product schema PreOrder. To sell a book: upload its PDF on /admin and set
"On sale". Payments also need Razorpay keys in Cloudflare (and `RESEND_API_KEY`, since the page promises an email).

## Razorpay activation (started 24 Oct 2026)

Razorpay checks the site for these pages; give them these addresses:
About `/atelier` · Contact `/legal/contact` · Pricing `/editions` · Terms `/legal/terms` · Privacy `/legal/privacy` ·
Refunds `/legal/license` (titled "Refund, Cancellation & License Policy"). Keep them live and named like this.
The contact form has no mail server: it opens WhatsApp with the message filled in. Never fake a "message received".

## Honesty rules (decided by Sahil and Basit, 24 Oct 2026)

- No struck-through "was" prices, "SAVE x%", "BESTSELLER", star ratings or review counts until they are real.
- It is a "Receipt", never a "Tax invoice" (that needs GST registration).
- Nothing is sent on WhatsApp automatically; never claim it. Page counts stay "planned" until the book exists.
- Sopore/Kashmir only in legal contact details and receipts, not in brand copy (TAMYIZ is a global brand).

## Quality baseline (24 Oct 2026, local build)

axe: 0 violations on every page incl. /admin, phone and desktop. Lighthouse mobile: performance 82–93, accessibility 100,
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

## Open issues (as of 24 Oct 2026)

- Cloudflare setup still to do by Sahil: KV namespace + binding `TAMYIZ_STORE`, secret `ADMIN_PASSWORD`. Until then
  the shop shows "First e-books on the way" and /admin explains what's missing.
- Receipt emails send from Resend's test sender until `RECEIPT_FROM` is a verified address.
- Home/philosophy copy still mentions Notion and Figma formats from the old template.
