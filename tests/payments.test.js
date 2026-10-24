// Payment and download security tests: run with `npm test`. Razorpay is faked with a stub fetch; KV with devKV().
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleCreateOrder, handleVerifyPayment, hmacSha256Hex, timingSafeEqual,
  itemsToNotes, notesToItems, calculateOrderTotal, VALID_COUPONS,
} from '../server/payments.js';
import { route } from '../server/router.js';
import { devKV } from '../server/dev-kv.js';

// The shop has no public promo codes; tests use their own.
VALID_COUPONS.TESTCODE15 = { type: 'percent', value: 15 };

const post = (body) => new Request('https://shop.test/api/x', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const buyer = { email: 'a@b.co', phone: '9876543210' };
const KEYS = { RAZORPAY_KEY_ID: 'rzp_test_abc', RAZORPAY_KEY_SECRET: 'shh-secret' };
const PDF = new TextEncoder().encode('%PDF-1.7\nfake ebook bytes');

/** A shop with one e-book on sale (₹299) and one coming soon (₹999). */
async function shop(extra = {}) {
  const kv = devKV();
  const now = Date.now();
  await kv.put('products', JSON.stringify([
    { id: 'eb-onsale1', slug: 'research-with-ai', name: 'Research, Write & Cite with AI', price: 299, status: 'on-sale', fileSize: PDF.length, createdAt: now, updatedAt: now },
    { id: 'eb-soon0002', slug: 'next-book', name: 'Next Book', price: 999, status: 'soon', createdAt: now - 1, updatedAt: now },
  ]));
  await kv.put('file:eb-onsale1', PDF, { metadata: { type: 'application/pdf', size: PDF.length } });
  return { TAMYIZ_STORE: kv, ...extra };
}
const cart = [{ productId: 'eb-onsale1', variant: 'PDF' }];

function fakeRazorpay() {
  const orders = {}, payments = {};
  const fetchImpl = async (url, init = {}) => {
    const u = String(url);
    if (u.endsWith('/v1/orders') && init.method === 'POST') {
      const b = JSON.parse(init.body);
      const id = 'order_' + (Object.keys(orders).length + 1);
      orders[id] = { id, amount: b.amount, notes: b.notes, status: 'created' };
      return Response.json(orders[id]);
    }
    let m = u.match(/\/v1\/orders\/(.+)$/);
    if (m) return orders[m[1]] ? Response.json(orders[m[1]]) : new Response('{}', { status: 404 });
    m = u.match(/\/v1\/payments\/(.+)$/);
    if (m) return payments[m[1]] ? Response.json(payments[m[1]]) : new Response('{}', { status: 404 });
    return new Response('{}', { status: 404 });
  };
  return { orders, payments, fetchImpl };
}

async function paidOrder(env, rz, items = cart, coupon) {
  const o = await (await handleCreateOrder(post({ items, ...buyer, couponCode: coupon }), env, rz.fetchImpl)).json();
  rz.payments.pay_1 = { id: 'pay_1', order_id: o.orderId, status: 'captured', amount: o.amount };
  const sig = await hmacSha256Hex(KEYS.RAZORPAY_KEY_SECRET, `${o.orderId}|pay_1`);
  return { o, verify: post({ razorpay_order_id: o.orderId, razorpay_payment_id: 'pay_1', razorpay_signature: sig, ...buyer }) };
}

test('no keys and no sandbox: checkout is refused with a clear message (no free downloads)', async () => {
  const env = await shop();
  const r = await handleCreateOrder(post({ items: cart, ...buyer }), env);
  assert.equal(r.status, 503);
  assert.match((await r.json()).error, /WhatsApp/);
  assert.equal((await handleVerifyPayment(post({ mode: 'atelier_sandbox', items: cart, ...buyer }), env)).status, 503);
});

test('with real keys, a browser claiming "sandbox" mode gets nothing', async () => {
  const v = await handleVerifyPayment(post({ mode: 'atelier_sandbox', items: cart, ...buyer }), await shop(KEYS), fakeRazorpay().fetchImpl);
  assert.equal(v.status, 400);
});

test('a forged signature is rejected', async () => {
  const env = await shop(KEYS); const rz = fakeRazorpay();
  const { o } = await paidOrder(env, rz);
  const v = await handleVerifyPayment(post({ razorpay_order_id: o.orderId, razorpay_payment_id: 'pay_1', razorpay_signature: 'nope', ...buyer }), env, rz.fetchImpl);
  assert.equal(v.status, 400);
});

test('a real payment unlocks exactly what was ordered, and the download link works', async () => {
  const env = await shop(KEYS); const rz = fakeRazorpay();
  const { o, verify } = await paidOrder(env, rz);
  assert.equal(o.amount, 29900);
  const res = await (await handleVerifyPayment(verify, env, rz.fetchImpl)).json();
  assert.equal(res.verified, true);
  assert.deepEqual(res.downloads.map((d) => d.productId), ['eb-onsale1']);
  const link = new URL(res.downloads[0].downloadUrl);
  assert.equal(link.origin, 'https://shop.test');
  const dl = await route(new Request(link), env);
  assert.equal(dl.status, 200);
  assert.equal(dl.headers.get('Content-Type'), 'application/pdf');
  assert.match(dl.headers.get('Content-Disposition'), /research-with-ai\.pdf/);
  assert.deepEqual(new Uint8Array(await dl.arrayBuffer()), PDF);
});

test('download links cannot be forged, reused for another book, or used after expiry', async () => {
  const env = await shop(KEYS); const rz = fakeRazorpay();
  const { verify } = await paidOrder(env, rz);
  const url = new URL((await (await handleVerifyPayment(verify, env, rz.fetchImpl)).json()).downloads[0].downloadUrl);
  const tampered = new URL(url); tampered.searchParams.set('s', '0'.repeat(64));
  assert.equal((await route(new Request(tampered), env)).status, 403);
  const other = new URL(url.toString().replace('/eb-onsale1', '/eb-soon0002'));
  assert.equal((await route(new Request(other), env)).status, 403);
  const old = new URL(url); old.searchParams.set('e', '1000');
  assert.equal((await route(new Request(old), env)).status, 403);
  const noSig = new URL(`https://shop.test/api/download/eb-onsale1`);
  assert.equal((await route(new Request(noSig), env)).status, 403);
});

test('a payment from a different order cannot unlock this order', async () => {
  const env = await shop(KEYS); const rz = fakeRazorpay();
  const cheap = await (await handleCreateOrder(post({ items: cart, ...buyer }), env, rz.fetchImpl)).json();
  rz.payments.pay_cheap = { id: 'pay_cheap', order_id: cheap.orderId, status: 'captured', amount: cheap.amount };
  const sig = await hmacSha256Hex(KEYS.RAZORPAY_KEY_SECRET, `order_999|pay_cheap`);
  const v = await handleVerifyPayment(post({ razorpay_order_id: 'order_999', razorpay_payment_id: 'pay_cheap', razorpay_signature: sig, ...buyer }), env, rz.fetchImpl);
  assert.notEqual(v.status, 200);
});

test('an unpaid (failed) payment is rejected', async () => {
  const env = await shop(KEYS); const rz = fakeRazorpay();
  const { verify } = await paidOrder(env, rz);
  rz.payments.pay_1.status = 'failed';
  assert.equal((await handleVerifyPayment(verify, env, rz.fetchImpl)).status, 400);
});

test('gateway error never falls back to the free sandbox', async () => {
  const r = await handleCreateOrder(post({ items: cart, ...buyer }), await shop({ ...KEYS, TAMYIZ_SANDBOX: 'true' }), async () => new Response('bad', { status: 401 }));
  assert.equal(r.status, 502);
});

test('sandbox (TAMYIZ_SANDBOX=true) works for on-sale books only', async () => {
  const env = await shop({ TAMYIZ_SANDBOX: 'true' });
  assert.equal((await (await handleCreateOrder(post({ items: cart, ...buyer }), env)).json()).mode, 'atelier_sandbox');
  const v = await (await handleVerifyPayment(post({ items: cart, ...buyer }), env)).json();
  assert.equal(v.verified, true);
  assert.equal((await route(new Request(v.downloads[0].downloadUrl), env)).status, 200);
  assert.equal((await handleVerifyPayment(post({ items: [{ productId: 'eb-soon0002' }], ...buyer }), env)).status, 409);
  // A sandbox link is worthless once the sandbox is off.
  assert.equal((await route(new Request(v.downloads[0].downloadUrl), await shop())).status, 403);
});

test('coming soon: cannot be ordered, even with real keys; no Razorpay order is made', async () => {
  const rz = fakeRazorpay();
  for (const env of [await shop(KEYS), await shop({ TAMYIZ_SANDBOX: 'true' })]) {
    const r = await handleCreateOrder(post({ items: [{ productId: 'eb-soon0002' }], ...buyer }), env, rz.fetchImpl);
    assert.equal(r.status, 409);
  }
  assert.equal(Object.keys(rz.orders).length, 0);
});

test('unknown or deleted books are refused', async () => {
  const r = await handleCreateOrder(post({ items: [{ productId: 'eb-gone0000' }], ...buyer }), await shop(KEYS), fakeRazorpay().fetchImpl);
  assert.equal(r.status, 400);
});

test('prices come from the catalogue, not the cart; one copy per book', async () => {
  const catalog = [{ id: 'eb-onsale1', name: 'x', price: 299, status: 'on-sale' }];
  const t = calculateOrderTotal([{ productId: 'eb-onsale1', price: 1 }, { productId: 'eb-onsale1' }], 'TESTCODE15', catalog);
  assert.equal(t.subtotal, 299);
  assert.equal(t.total, 254);
});

test('verification returns prices for the receipt screen', async () => {
  const env = await shop(KEYS); const rz = fakeRazorpay();
  const { verify } = await paidOrder(env, rz, cart, 'TESTCODE15');
  const res = await (await handleVerifyPayment(verify, env, rz.fetchImpl)).json();
  assert.equal(res.amount, 25400);
  assert.equal(res.totalINR, 254);
  assert.equal(res.subtotalINR, 299);
  assert.equal(res.discountINR, 45);
  assert.equal(res.downloads[0].price, 299);
});

test('a paid order is still delivered if the book is switched off afterwards', async () => {
  const env = await shop(KEYS); const rz = fakeRazorpay();
  const { verify } = await paidOrder(env, rz);
  const list = await env.TAMYIZ_STORE.get('products', 'json');
  list[0].status = 'soon';
  await env.TAMYIZ_STORE.put('products', JSON.stringify(list));
  assert.equal((await handleVerifyPayment(verify, env, rz.fetchImpl)).status, 200);
});

test('order notes round-trip and stay within Razorpay limits', () => {
  const items = Array.from({ length: 20 }, (_, i) => ({ productId: 'eb-' + String(i).padStart(8, '0'), variant: 'PDF' }));
  const notes = itemsToNotes(items);
  assert.ok(Object.values(notes).every((v) => v.length <= 256));
  assert.deepEqual(notesToItems(notes), items);
});

test('helpers', async () => {
  assert.ok(timingSafeEqual('abc', 'abc'));
  assert.ok(!timingSafeEqual('abc', 'abd'));
  assert.ok(!timingSafeEqual('abc', 'abcd'));
  assert.equal(await hmacSha256Hex('Jefe', 'what do ya want for nothing?'), '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843');
});

test('the template\'s public promo codes no longer give a discount', () => {
  const catalog = [{ id: 'eb-onsale1', name: 'x', price: 299, status: 'on-sale' }];
  for (const code of ['TAMYIZ15', 'WELCOME10', 'DISTINCT10', 'DISTINCT', 'HORIZON500']) {
    assert.equal(calculateOrderTotal([{ productId: 'eb-onsale1' }], code, catalog).total, 299, code);
  }
});
