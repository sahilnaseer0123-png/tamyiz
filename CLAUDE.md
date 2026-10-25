# TAMYIZ website

The online shop for TAMYIZ™ (co-founded by Sahil and Basit): PDF e-books that Sahil adds himself on /admin,
sold with Razorpay and delivered as private signed download links.

## Stack

- Vite single-page app (plain JavaScript, no framework). `npm run dev` for local work. (three.js and the grain-sparks script were removed 24 Oct 2026: unused.)
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
- Small covers: /admin also makes a 720 px `thumb:<id>` (served at `/api/cover/<id>?s=sm`); cards and the bag use
  `product.thumb` (falls back to the full cover). Opening /admin backfills thumbs for books that lack one.
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
- Visitor stats (25 Oct 2026): Cloudflare Web Analytics is on (Pages project → Metrics → Web Analytics; cookieless, counts
  only, no personal data). The privacy policy (/legal/privacy, section 03) says so; keep it in step if analytics changes.
- Tests: `npm test` (node test runner, `tests/`: payments, downloads, admin). Run before every push. `npm run cf:dev` runs the built site on
  Cloudflare's runtime locally (wrangler, with a local KV store; set ADMIN_PASSWORD/TAMYIZ_SANDBOX in .dev.vars).

## Selling

Coming soon = "COMING SOON" badge, "Pre-order on WhatsApp" button (product filled in), no Buy Now, no Bag/Checkout
in the header unless some book is on sale, product schema PreOrder. To sell a book: upload its PDF on /admin and set
"On sale". Payments also need Razorpay keys in Cloudflare.
No email promise (decided 24 Oct 2026): buyers get the download on screen and are told to download it right away;
lost files are re-sent by hand on WhatsApp. Never say the link is "emailed" until receipts really send (see Open issues).

## Razorpay activation (started 24 Oct 2026)

Status 24 Oct 2026: account activated (KYC complete); website https://tamyiz.pages.dev/ approved. Test purchase passed
(test card → "Payment received" → PDF downloaded). LIVE keys now in Cloudflare (`RAZORPAY_KEY_ID` Text,
`RAZORPAY_KEY_SECRET` Secret, Production): an "On sale" book takes real money. Razorpay customer support details:
tamyiz.co@gmail.com, +91 95417 22379, contact link /legal/contact.
Test mode tips: the UPI tab only shows a QR (real apps can't pay it); use test card 5104 0600 0000 0008, any CVV/future
expiry, OTP of 4+ digits. Payment method is chosen in Razorpay's window; checkout has no method picker of its own.
If test keys are ever put back, an on-sale book can be "bought" with Razorpay's public test card: keep books
"Coming soon" during any test-key period.

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

## Design (redesign 24 Oct 2026, approved by Sahil)

- Black and white. The only colour is the logo's red grain (and book covers further down the page). The old red accent
  variables (`--color-red`, `--color-red-ink`...) now map to black/white in the "REDESIGN 24 Oct 2026" block at the end
  of tamyiz-unified.css; new rules go in that block. Success states (paid, toast) keep their green.
- Logo: `public/assets/brand/tamyiz-dome-sm.webp` (Sahil's red emblem, cropped so the dome is centred, 240 px, 8 KB) +
  `tamyiz-wordmark.svg`, in the header on every page (phones: icon-only menu/bag so it fits).
- Home hero (24 Oct 2026, approved): headline "Learn to tell the difference." (what *Tamyiz* means), the existing
  lede, two buttons, and a proof line counted from the catalogue (`heroProof()`: e-book count, total pages only when
  every book has a page count). Right side: an "About us" card with both founders. It is deliberately NOT tied to
  any product, so it stays right whatever TAMYIZ sells next. Portraits: `founders/<name>-portrait.webp`, cropped so
  both faces are the same size with the eyes on the same line (42% down, 4:5, greyscale); redo both together if a
  photo changes. No logo or book covers in the hero (Sahil's calls).
- About page `/atelier` (24 Oct 2026): plain words ("About us", why we started, what the name means, founders, contact).
  No "atelier/architects/studio/concierge/editions/protocol" wording anywhere visible; the old studio photo is gone
  (it wasn't theirs). Nav: Home · E-books · How we write · About us (→ /atelier) · Read anywhere. Footer: Pages · Shop ·
  Help and policies. The home page's old "Who makes TAMYIZ" section was removed (the hero card covers it).
  Keep URLs and the legal page titles as they are (Razorpay has them on file).
- Headings are sentence case everywhere; page banners are light like the About intro (CSS "Calm type everywhere" block).
- Frosted glass (`.tmz-glass`): the header only for now.
- Hidden menu/bag drawers are `visibility: hidden` with no shadow until opened (their shadows used to leak onto the page edges).

- Start-up: index.html holds a placeholder (logo + loading bar) so slow connections never see a white page; the app
  replaces it once /api/products answers. If that fails, home and /editions say "Couldn't load the e-books" with a
  Try again button (`loadState.failed`, `retryProducts()`), never "first e-books on the way".
- Browser storage can be blocked: every localStorage call must be in try/catch (a throw once stopped checkout).
- Fonts: Inter + Space Grotesk only (Syne dropped; the footer wordmark is the SVG).
- Smoothness (24 Oct 2026): no backdrop-filter on full-screen overlays (menu, bag, pop-ups) or on cards: it made
  phones stutter (100 ms frames). Only the header keeps a glass blur (lighter on touch screens). Never use
  `transition: all`; list the properties (opacity, transform, colours...).

## Phone layout and shared content (24 Oct 2026)

- Phones (<640px): one spacing scale in the "PHONES (up to 639px)" blocks at the end of tamyiz-unified.css: sections
  40px top/bottom, promise strip 2x2, product cards = cover left + details right + buttons below (the cover badge is
  hidden there; `.tamyiz-card-status` shows "Coming soon" instead). Add phone rules there, not scattered.
- Covers are portrait 2:3 everywhere (cards, product page, bag thumbnail). From 640px up, cards show the cover as a book on a
  fixed-height light panel (250–330px) so a whole card fits on one screen; don't go back to full-width covers (~800px tall). The product page reserves the cover's space
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
4. Prices come from the catalogue in KV (set on /admin), read by the server at order time. The bag refreshes every
   item's price from the catalogue on load (`store.pruneUnavailable`), so it always shows what will be charged.
   Promo codes: none (the template's were public and gave 10–15% off; removed 24 Oct 2026). To add one, put the same
   code in `VALID_COUPONS` (server/payments.js) and `AVAILABLE_COUPONS` (store.js); the promo box shows only then.
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
