import { loadCatalog, findById } from './catalog.js';

/**
 * TAMYIZ™ payments: prices, coupons, Razorpay orders and verification, download links, receipt email.
 *
 * Runs on Cloudflare Pages Functions (functions/api/*) and in the local Vite dev server (vite.config.js).
 * Settings come in as `env` (Cloudflare: Project → Settings → Variables and secrets), never from the browser.
 *
 * Security rules (23 Oct 2026):
 * - The server decides the payment mode. The browser's "mode" field is ignored.
 * - With Razorpay keys set, a purchase unlocks only after the signature checks out AND Razorpay confirms
 *   the payment belongs to that order and is authorized/captured for the full amount.
 * - What gets unlocked comes from the Razorpay order (written there at creation), never from the browser.
 * - The sandbox simulator (no real payment) only runs when TAMYIZ_SANDBOX is "true". Never set it in production.
 * - Prices and what can be bought come from the catalogue in KV (server/catalog.js), managed on /admin.
 *   Only ebooks with status "on-sale" can be ordered.
 * - Downloads are signed links (/api/download/...), valid for a year, given only after verification.
 */

// Verified Coupon Codes
export const VALID_COUPONS = {
  'DISTINCT10': { type: 'percent', value: 10 },
  'DISTINCT': { type: 'percent', value: 10 },
  'WELCOME10': { type: 'percent', value: 10 },
  'TAMYIZ15': { type: 'percent', value: 15 },
  'HORIZON500': { type: 'flat', value: 500, minOrder: 3000 }
};

/**
 * Validates cart items and computes strict server-side price in INR & paise
 */
export function calculateOrderTotal(items, couponCode = null, catalog = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart contains no valid items");
  }

  let subtotal = 0;
  const validatedItems = [];
  const seen = new Set();

  for (const item of items) {
    const prodId = String(item.productId || item.id || '');
    if (seen.has(prodId)) continue; // one copy of an ebook is enough
    seen.add(prodId);
    const catProd = findById(catalog, prodId);
    if (!catProd) {
      throw new Error('One of the items in your bag is no longer available. Please remove it and try again.');
    }
    const price = catProd.price;
    subtotal += price;
    validatedItems.push({ productId: prodId, name: catProd.name, variant: 'PDF', price, status: catProd.status });
  }

  // Calculate discount if coupon provided
  let discount = 0;
  if (couponCode) {
    const c = VALID_COUPONS[String(couponCode).toUpperCase().trim()];
    if (c) {
      if (c.type === 'percent') {
        discount = Math.round(subtotal * (c.value / 100));
      } else if (c.type === 'flat' && (!c.minOrder || subtotal >= c.minOrder)) {
        discount = c.value;
      }
    }
  }

  const total = Math.max(1, subtotal - discount);
  const amountPaise = total * 100;

  return {
    subtotal,
    discount,
    total,
    amountPaise,
    items: validatedItems
  };
}

/** Secret used to sign download links. Sandbox-only fallback so local testing works without keys. */
function downloadSecret(env) {
  if (env.DOWNLOAD_SECRET) return String(env.DOWNLOAD_SECRET);
  if (env.RAZORPAY_KEY_SECRET) return String(env.RAZORPAY_KEY_SECRET);
  if (sandboxEnabled(env)) return 'tamyiz-sandbox-only';
  return null;
}

const DOWNLOAD_DAYS = 365;

/** A private download link for one paid ebook: /api/download/<id>?p=<payment>&e=<expiry>&s=<signature>. */
export async function signDownload(env, productId, paymentId, now = Date.now()) {
  const secret = downloadSecret(env);
  if (!secret) throw new Error('Downloads are not set up (no signing secret).');
  const exp = Math.floor(now / 1000) + DOWNLOAD_DAYS * 86400;
  const sig = await hmacSha256Hex(secret, `dl|${productId}|${paymentId}|${exp}`);
  return `/api/download/${encodeURIComponent(productId)}?p=${encodeURIComponent(paymentId)}&e=${exp}&s=${sig}`;
}

export async function checkDownload(env, productId, paymentId, exp, sig) {
  const secret = downloadSecret(env);
  if (!secret || !paymentId || !exp || !sig) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmacSha256Hex(secret, `dl|${productId}|${paymentId}|${exp}`);
  return timingSafeEqual(expected, sig);
}

/** GET /api/download/<id>: streams the PDF to someone holding a valid signed link. */
export async function handleDownload(request, env, productId) {
  const u = new URL(request.url);
  const ok = await checkDownload(env, productId, u.searchParams.get('p'), u.searchParams.get('e'), u.searchParams.get('s'));
  if (!ok) return json({ error: 'This download link is not valid or has expired. Message us on WhatsApp with your order reference.' }, 403);
  if (!env.TAMYIZ_STORE) return json({ error: 'Storage is not connected.' }, 503);
  const product = findById(await loadCatalog(env), productId);
  const { value, metadata } = await env.TAMYIZ_STORE.getWithMetadata(`file:${productId}`, 'stream');
  if (!value) return json({ error: 'The file is missing. Message us on WhatsApp and we will send it.' }, 404);
  const filename = `${(product && product.slug) || productId}.pdf`;
  return new Response(value, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      ...(metadata && metadata.size ? { 'Content-Length': String(metadata.size) } : {}),
    },
  });
}

/**
 * Triggers transactional receipt email via Resend REST API if configured
 */
export async function sendReceiptEmail({ email, phone, orderId, referenceId, items, downloads }, env = {}) {
  if (!env.RESEND_API_KEY) {
    return false;
  }
  // Everything below goes into HTML: escape what came from the buyer.
  const toEmail = String(email);
  email = escapeHtml(email);
  phone = escapeHtml(phone);

  const itemsHtml = downloads.map(dl => `
    <tr style="border-bottom: 1px solid #EEEEEE;">
      <td style="padding: 12px 0;">
        <strong style="font-family: monospace; font-size: 13px; color: #000;">${dl.name}</strong><br/>
        <span style="font-family: monospace; font-size: 11px; color: #666; text-transform: uppercase;">FORMAT: ${dl.variant}</span>
      </td>
      <td style="padding: 12px 0; text-align: right;">
        <a href="${dl.downloadUrl}" style="display: inline-block; background: #000000; color: #FFFFFF; font-family: monospace; font-size: 11px; font-weight: bold; text-decoration: none; padding: 6px 14px; text-transform: uppercase;">
          Access Edition ↗
        </a>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F7F4; margin: 0; padding: 24px; color: #000000;">
      <div style="max-width: 580px; margin: 0 auto; background: #FFFFFF; border: 1px solid #000000; padding: 32px;">
        <div style="font-family: monospace; font-size: 10px; letter-spacing: 0.15em; color: #DC2626; text-transform: uppercase; font-weight: bold;">
          ● TRANSACTION CONFIRMED // INSTANT ATELIER DISPATCH
        </div>
        <h1 style="font-family: monospace; font-size: 24px; font-weight: 900; text-transform: uppercase; margin: 8px 0 16px 0; letter-spacing: -0.02em;">
          TAMYIZ™ DIGITAL VAULT
        </h1>
        <p style="font-size: 13px; line-height: 1.5; color: #333333; margin-bottom: 24px;">
          Thank you for collecting from the TAMYIZ atelier. Your cryptographic access tokens have been verified and your editions are unlocked below.
        </p>

        <div style="background: #F4F4F2; padding: 12px 16px; font-family: monospace; font-size: 11px; margin-bottom: 24px; border-left: 3px solid #000000;">
          <div><strong>ORDER REF:</strong> ${referenceId}</div>
          <div><strong>VERIFIED EMAIL:</strong> ${email}</div>
          <div><strong>WHATSAPP:</strong> ${phone}</div>
          <div><strong>LICENSE:</strong> Perpetual Single-Operator Commercial Grant</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
          <thead>
            <tr style="border-bottom: 2px solid #000000; text-align: left; font-family: monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em;">
              <th style="padding-bottom: 8px;">Edition</th>
              <th style="padding-bottom: 8px; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="font-size: 11px; color: #666666; line-height: 1.6; border-top: 1px solid #EEEEEE; padding-top: 20px;">
          <strong>TAMYIZ™ Digital Publishing &amp; Design Systems Studio</strong><br/>
          Sopore, Kashmir 193201, India • Co-Founded by Basit Majeed &amp; Sahil.<br/>
          Concierge Support: <a href="mailto:tamyiz.co@gmail.com" style="color: #000;">tamyiz.co@gmail.com</a> • WhatsApp: +91 95417 22379
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: env.RECEIPT_FROM || 'TAMYIZ <onboarding@resend.dev>',
        to: [toEmail],
        subject: `TAMYIZ™ Order Unlocked // Ref: ${referenceId}`,
        html
      })
    });
    return res.ok;
  } catch (err) {
    console.error('Resend email error:', err);
    return false;
  }
}


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  // Same-site only: the site's own pages call these. No wildcard origin.
  'Cache-Control': 'no-store'
};

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

const NOT_RELEASED = 'This edition is not out yet. Message us on WhatsApp (+91 95417 22379) to pre-order and we will tell you the day it is ready.';

/** Ids of ordered items that are not on sale. */
export function notOnSale(items) {
  return [...new Set(items.filter((i) => i.status !== 'on-sale').map((i) => i.productId))];
}

export function hasRazorpayKeys(env) {
  return Boolean(
    env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET &&
    !String(env.RAZORPAY_KEY_ID).includes('YOUR_') && !String(env.RAZORPAY_KEY_SECRET).includes('YOUR_')
  );
}

export const sandboxEnabled = (env) => String(env.TAMYIZ_SANDBOX || '').toLowerCase() === 'true';

const PAYMENTS_OFF =
  "Online payments aren't switched on yet. Message us on WhatsApp (+91 95417 22379) and we'll sort your order.";

/** HMAC-SHA256 as hex, with Web Crypto (works on Cloudflare and Node 18+). */
export async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Compares two strings in constant time (no early exit), so the signature can't be guessed byte by byte. */
export function timingSafeEqual(a, b) {
  a = String(a); b = String(b);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

const basicAuth = (env) => 'Basic ' + btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`);

/**
 * The cart, written into the Razorpay order's notes so verification can read it back from Razorpay.
 * Format: "productId~variant|productId~variant", split over note keys i0, i1 ... (Razorpay: 256 chars per note).
 */
export function itemsToNotes(items) {
  const flat = items.map((i) => `${i.productId}~${i.variant}`).join('|');
  const notes = {};
  for (let k = 0, i = 0; i < flat.length; i += 250, k++) notes[`i${k}`] = flat.slice(i, i + 250);
  if (Object.keys(notes).length > 12) throw new Error('Too many items in one order. Please split your order.');
  return notes;
}

export function notesToItems(notes = {}) {
  const flat = Object.keys(notes)
    .filter((k) => /^i\d+$/.test(k))
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
    .map((k) => notes[k])
    .join('');
  if (!flat) return [];
  return flat.split('|').map((p) => {
    const [productId, variant] = p.split('~');
    return { productId, variant };
  });
}

function cleanContact(email, phone) {
  const e = String(email || '').trim().toLowerCase();
  const p = String(phone || '').replace(/[^0-9+]/g, '');
  if (!e || !e.includes('@') || !e.includes('.') || e.length > 254) return { error: 'A valid email address is required for digital dispatch.' };
  if (!p || p.length < 10 || p.length > 16) return { error: 'A valid WhatsApp phone number (minimum 10 digits) is required.' };
  return { email: e, phone: p };
}

// ---------------------------------------------------------------------------
// POST /api/create-order
// ---------------------------------------------------------------------------

export async function handleCreateOrder(request, env, fetchImpl = fetch) {
  let body;
  try { body = await request.json(); } catch { body = {}; }
  const { items, email, phone, coupon, couponCode } = body || {};

  if (!Array.isArray(items) || items.length === 0) return json({ error: 'Atelier bag contains no valid items.' }, 400);
  const contact = cleanContact(email, phone);
  if (contact.error) return json({ error: contact.error }, 400);

  const catalog = await loadCatalog(env);
  let order;
  try { order = calculateOrderTotal(items, coupon || couponCode, catalog); }
  catch (err) { return json({ error: err.message }, 400); }

  const notYet = notOnSale(order.items);
  if (notYet.length) return json({ error: NOT_RELEASED, productIds: notYet }, 409);

  if (hasRazorpayKeys(env)) {
    let notes;
    try { notes = { ...itemsToNotes(order.items), email: contact.email, phone: contact.phone }; }
    catch (err) { return json({ error: err.message }, 400); }

    const rzpRes = await fetchImpl('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: basicAuth(env), 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: order.amountPaise, currency: 'INR', receipt: `rcpt_${Date.now()}`, notes })
    });
    if (!rzpRes.ok) {
      console.error('Razorpay order error:', rzpRes.status, await rzpRes.text().catch(() => ''));
      // Never fall back to the free sandbox when real keys are set.
      return json({ error: 'The payment gateway is not responding. Please try again in a minute.' }, 502);
    }
    const rzp = await rzpRes.json();
    return json({
      mode: 'razorpay',
      orderId: rzp.id,
      amount: rzp.amount,
      currency: 'INR',
      keyId: env.RAZORPAY_KEY_ID,
      totalINR: order.total,
      subtotalINR: order.subtotal,
      discountINR: order.discount,
      email: contact.email,
      phone: contact.phone
    });
  }

  if (sandboxEnabled(env)) {
    return json({
      mode: 'atelier_sandbox',
      orderId: `order_sandbox_${Date.now()}`,
      amount: order.amountPaise,
      currency: 'INR',
      totalINR: order.total,
      subtotalINR: order.subtotal,
      discountINR: order.discount,
      email: contact.email,
      phone: contact.phone,
      isSandbox: true
    });
  }

  return json({ error: PAYMENTS_OFF }, 503);
}

// ---------------------------------------------------------------------------
// POST /api/verify-payment
// ---------------------------------------------------------------------------

export async function handleVerifyPayment(request, env, fetchImpl = fetch) {
  let body;
  try { body = await request.json(); } catch { body = {}; }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, email, phone } = body || {};

  let paidItems;
  let paidOrderAmount;
  let mode;

  if (hasRazorpayKeys(env)) {
    mode = 'razorpay';
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return json({ error: 'Incomplete payment details. If you were charged, message us on WhatsApp.' }, 400);
    }
    // 1. Signature: proves Razorpay issued this payment for this order.
    const expected = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET, `${razorpay_order_id}|${razorpay_payment_id}`);
    if (!timingSafeEqual(expected, razorpay_signature)) {
      return json({ error: 'Invalid payment signature. Verification failed.' }, 400);
    }
    // 2. Ask Razorpay: the payment is for this order, authorized or captured, for the order's full amount.
    const [payRes, ordRes] = await Promise.all([
      fetchImpl(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`, { headers: { Authorization: basicAuth(env) } }),
      fetchImpl(`https://api.razorpay.com/v1/orders/${encodeURIComponent(razorpay_order_id)}`, { headers: { Authorization: basicAuth(env) } })
    ]);
    if (!payRes.ok || !ordRes.ok) {
      return json({ error: 'Could not confirm the payment with Razorpay. If you were charged, message us on WhatsApp.' }, 502);
    }
    const payment = await payRes.json();
    const rzpOrder = await ordRes.json();
    const okStatus = payment.status === 'captured' || payment.status === 'authorized';
    if (payment.order_id !== razorpay_order_id || !okStatus || Number(payment.amount) !== Number(rzpOrder.amount)) {
      return json({ error: 'Payment not completed for this order.' }, 400);
    }
    // 3. What was paid for comes from the order Razorpay stored, not from the browser.
    paidItems = notesToItems(rzpOrder.notes);
    paidOrderAmount = rzpOrder.amount;
    if (paidItems.length === 0) return json({ error: 'Order has no items. Message us on WhatsApp.' }, 400);
  } else if (sandboxEnabled(env)) {
    mode = 'atelier_sandbox';
    paidItems = Array.isArray(body.items) ? body.items.map((i) => ({ productId: i.productId || i.id, variant: i.variant || i.size })) : [];
    if (paidItems.length === 0) return json({ error: 'Missing items for digital fulfillment' }, 400);
  } else {
    return json({ error: PAYMENTS_OFF }, 503);
  }

  const contact = cleanContact(email, phone);
  const cleanEmail = contact.email || String(email || '').trim().toLowerCase();
  const cleanPhone = contact.phone || String(phone || '').trim();

  const refBytes = crypto.getRandomValues(new Uint8Array(5));
  const referenceId = 'TAMYIZ-ORD-' + Date.now().toString(36).toUpperCase() + [...refBytes].map((b) => b.toString(36)).join('').toUpperCase().slice(0, 6);
  const paymentId = razorpay_payment_id || `pay_sandbox_${Date.now()}`;
  const orderId = razorpay_order_id || `order_sandbox_${Date.now()}`;
  // Prices for the receipt screen, from the catalogue. Total = what Razorpay charged (or the sandbox total).
  const catalog = await loadCatalog(env);
  let priced;
  try { priced = calculateOrderTotal(paidItems, null, catalog); }
  catch { return json({ error: 'Your payment went through, but an item could not be found. Message us on WhatsApp with this payment ID: ' + paymentId }, 409); }
  // Sandbox (no real money) may only unlock ebooks that are on sale. A real, verified Razorpay payment is
  // always delivered, even if the ebook was switched off after the order was placed.
  if (mode === 'atelier_sandbox' && notOnSale(priced.items).length) return json({ error: NOT_RELEASED }, 409);
  const amountPaise = mode === 'razorpay' ? Number(paidOrderAmount) : priced.amountPaise;
  const totalINR = Math.round(amountPaise / 100);
  const origin = new URL(request.url).origin;
  const downloads = await Promise.all(priced.items.map(async (i) => ({
    productId: i.productId,
    name: i.name,
    variant: 'PDF',
    formatType: 'ebook',
    downloadUrl: origin + (await signDownload(env, i.productId, paymentId)),
    actionLabel: 'Download PDF ↗',
    specs: 'PDF e-book • DRM-free',
    price: i.price,
  })));

  if (cleanEmail.includes('@')) {
    await sendReceiptEmail({ email: cleanEmail, phone: cleanPhone, orderId, referenceId, items: paidItems, downloads }, env)
      .catch((err) => console.error('Email dispatch error (non-blocking):', err));
  }

  return json({
    verified: true,
    mode,
    referenceId,
    paymentId,
    orderId,
    timestamp: new Date().toISOString(),
    email: cleanEmail,
    phone: cleanPhone,
    itemsCount: paidItems.length,
    amount: amountPaise,
    totalINR,
    subtotalINR: priced.subtotal,
    discountINR: Math.max(0, priced.subtotal - totalINR),
    downloads
  });
}
