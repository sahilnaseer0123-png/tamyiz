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
- Admin login: Cloudflare secret `TAMYIZ_ADMIN_PASSWORD` (or `ADMIN_PASSWORD`; 12+ chars) → signed cookie (HttpOnly, Secure, SameSite=Strict,
  Path=/api/admin, 12 h). 10 wrong passwords per IP → 15 min lock. Changes also need header `X-Tamyiz-Admin: 1`.
- Downloads: after a verified payment, `/api/download/<id>?p=<payment>&e=<expiry>&s=<HMAC>` (1 year), signed with
  `DOWNLOAD_SECRET` or `RAZORPAY_KEY_SECRET`. The PDF is never at a public address. A paid order is delivered even if
  the book is switched off later; deleting a book breaks its links (admin warns).
- Settings (Cloudflare: project → Settings → Variables and secrets; locally `.dev.vars` for wrangler or `.env` for Vite,
  both git-ignored): `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (secret), `RESEND_API_KEY` (secret, optional receipts),
  `RECEIPT_FROM` (optional, a verified Resend sender), `DOWNLOAD_SECRET` (optional), `TAMYIZ_SANDBOX` (never in production).
- Deploys stop silently if Cloudflare loses access to this repo (yellow "disconnected" banner in the Pages project).
  Fix: GitHub → Settings → Applications → Cloudflare Workers and Pages → Configure → Repository access must list
  BOTH tamyiz and eternal-polyclinic → Save. (Happened 23 Oct 2026.)
- Tests: `npm test` (node test runner, `tests/`: payments, downloads, admin). Run before every push. `npm run cf:dev` runs the built site on
  Cloudflare's runtime locally (wrangler, with a local KV store; set ADMIN_PASSWORD/TAMYIZ_SANDBOX in .dev.vars).

## Selling

Coming soon = "COMING SOON" badge, "Pre-order on WhatsApp" button (product filled in), no Buy Now, no Bag/Checkout
in the header unless some book is on sale, product schema PreOrder. To sell a book: upload its PDF on /admin and set
"On sale". Payments also need Razorpay keys in Cloudflare.
No email promise (decided 24 Oct 2026): buyers get the download on screen and are told to download it right away;
lost files are re-sent by hand on WhatsApp. Never say the link is "emailed" until receipts really send (see Open issues).

## Razorpay activation (started 24 Oct 2026)

Razorpay checks the site for these pages; give them these addresses:
About `/atelier` · Contact `/legal/contact` · Pricing `/editions` · Terms `/legal/terms` · Privacy `/legal/privacy` ·
Refunds `/legal/license` (titled "Refund, Cancellation & License Policy") · Shipping `/legal/delivery-protocol`
(titled "Shipping & Delivery Policy"; Razorpay asks for a shipping policy even for digital goods). Keep them live and named like this.
Razorpay also asks for a sample invoice: a sample receipt PDF can be made from `server/payments.js`'s receipt layout.
The contact form has no mail server: it opens WhatsApp with the message filled in. Never fake a "message received".

## Honesty rules (decided by Sahil and Basit, 24 Oct 2026)

- No struck-through "was" prices, "SAVE x%", "BESTSELLER", star ratings or review counts until they are real.
- It is a "Receipt", never a "Tax invoice" (that needs GST registration).
- Nothing is sent on WhatsApp automatically; never claim it. Page counts stay "planned" until the book exists.
- Sopore/Kashmir only in legal contact details and receipts, not in brand copy (TAMYIZ is a global brand).

## Phone layout and shared content (24 Oct 2026)

- Phones (<640px): one spacing scale in the "PHONES (up to 639px)" blocks at the end of tamyiz-unified.css: sections
  40px top/bottom, promise strip 2x2, product cards = cover left + details right + buttons below (the cover badge is
  hidden there; `.tamyiz-card-status` shows "Coming soon" instead). Add phone rules there, not scattered.
- Covers are portrait 2:3 everywhere (cards, product page, bag thumbnail). The product page reserves the cover's space
  (no layout shift: keep CLS < 0.1).
- "How we write" and "Read it anywhere" live once in `src/scripts/pages/sections.js` (home + /philosophy). FAQ in
  `src/data/content.js`. Everything describes PDF e-books only: no Notion/Figma/EPUB, no "lifetime updates", nothing
  "sent on WhatsApp".

## Quality baseline (24 Oct 2026, local build, rechecked after the phone pass)

axe: 0 violations on every page incl. /admin, phone and desktop. Lighthouse mobile: performance 91–99, accessibility 100,
SEO 100, best practices 100. Touch screens get 44px tap areas (`@media (pointer: coarse)` block at the end of
tamyiz-unified.css). Don't ship below this.

## Payment rules (security; do not loosen)

1. The server decides the payment mode. Never trust a `mode`, price or item list sent by the browser.
2. With Razorpay keys set: unlock only after the HMAC signature matches (Web Crypto, constant-time compare) AND
   Razorpay's API confirms the payment belongs to that order, is authorized/captured, and covers the order amount.
3. What gets unlocked is read back from the Razorpay order notes written at creation (`itemsToNotes`/`notesToItems`).
4. Prices come from the catalogue in KV (set on /admin), read by the server at order time; coupons live only in
   `server/payments.js` (`VALID_COUPONS`). The browser's prices are display-only.
5. The sandbox simulator (free unlock, for testing) runs only when `TAMYIZ_SANDBOX=true`. Never set it in production.
   Without keys and without sandbox, checkout returns a polite 503 pointing buyers to WhatsApp.
6. Never commit keys. The repo is public.

## Open issues (as of 24 Oct 2026)

- Cloudflare setup 24 Oct 2026: KV namespace `tamyiz-store` bound as `TAMYIZ_STORE` (Production). The first names were
  saved with a trailing dot ("TAMYIZ_STORE.") and didn't work; names must match exactly. The dashboard then refused
  "ADMIN_PASSWORD" as already existing while not listing it, so the password secret is `TAMYIZ_ADMIN_PASSWORD`.
  Bindings and secrets only apply after a new deployment.
- Receipt emails are off: Resend only sends to strangers from a domain you own (not Gmail). Plan: once sales start,
  buy a domain (e.g. tamyiz.in), verify it in Resend, set `RESEND_API_KEY` + `RECEIPT_FROM`, then put the email
  wording back (checkout, product page, FAQ, delivery policy, after-payment modal).
- Checkout's "Select payment method" radios are decorative (Razorpay asks in its own window): remove once Razorpay is live.
