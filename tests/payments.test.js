// Payment security tests: run with `npm test`. Razorpay is faked with a stub fetch.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleCreateOrder, handleVerifyPayment, hmacSha256Hex, timingSafeEqual,
  itemsToNotes, notesToItems, calculateOrderTotal
} from '../server/payments.js';

const post = (body) => new Request('http://x/api', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const LIVE = { RAZORPAY_KEY_ID: 'rzp_test_abc', RAZORPAY_KEY_SECRET: 'shh-secret' };
const buyer = { email: 'a@b.co', phone: '9876543210' };
const cart = [{ productId: 'tmz-dig-007', variant: 'Student Edition' }]; // ₹299

// A fake Razorpay: remembers created orders and payments.
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

test('no keys and no sandbox: checkout is refused with a clear message (no free downloads)', async () => {
  const r = await handleCreateOrder(post({ items: cart, ...buyer }), {});
  assert.equal(r.status, 503);
  assert.match((await r.json()).error, /WhatsApp/);
  const v = await handleVerifyPayment(post({ mode: 'atelier_sandbox', items: cart, ...buyer }), {});
  assert.equal(v.status, 503);
});

test('with real keys, a browser claiming "sandbox" mode gets nothing', async () => {
  const rz = fakeRazorpay();
  const v = await handleVerifyPayment(post({ mode: 'atelier_sandbox', items: cart, ...buyer }), LIVE, rz.fetchImpl);
  assert.equal(v.status, 400);
  assert.equal((await v.json()).verified, undefined);
});

test('a forged signature is rejected', async () => {
  const rz = fakeRazorpay();
  const o = await (await handleCreateOrder(post({ items: cart, ...buyer }), LIVE, rz.fetchImpl)).json();
  rz.payments.pay_1 = { id: 'pay_1', order_id: o.orderId, status: 'captured', amount: o.amount };
  const v = await handleVerifyPayment(post({ razorpay_order_id: o.orderId, razorpay_payment_id: 'pay_1', razorpay_signature: 'sandbox_verified_signature', ...buyer }), LIVE, rz.fetchImpl);
  assert.equal(v.status, 400);
});

test('a real payment unlocks exactly what was ordered, even if the browser asks for more', async () => {
  const rz = fakeRazorpay();
  const o = await (await handleCreateOrder(post({ items: cart, ...buyer }), LIVE, rz.fetchImpl)).json();
  assert.equal(o.mode, 'razorpay');
  assert.equal(o.amount, 29900);
  rz.payments.pay_1 = { id: 'pay_1', order_id: o.orderId, status: 'captured', amount: 29900 };
  const sig = await hmacSha256Hex(LIVE.RAZORPAY_KEY_SECRET, `${o.orderId}|pay_1`);
  const greedy = [...cart, { productId: 'tmz-dig-008', variant: 'Figma + Tailwind Code' }, { productId: 'tmz-dig-005' }];
  const v = await handleVerifyPayment(post({ razorpay_order_id: o.orderId, razorpay_payment_id: 'pay_1', razorpay_signature: sig, items: greedy, ...buyer }), LIVE, rz.fetchImpl);
  assert.equal(v.status, 200);
  const res = await v.json();
  assert.equal(res.verified, true);
  assert.deepEqual(res.downloads.map((d) => d.productId), ['tmz-dig-007']);
});

test('a payment from a different order cannot unlock this order', async () => {
  const rz = fakeRazorpay();
  const cheap = await (await handleCreateOrder(post({ items: cart, ...buyer }), LIVE, rz.fetchImpl)).json();
  const dear = await (await handleCreateOrder(post({ items: [{ productId: 'tmz-dig-008' }], ...buyer }), LIVE, rz.fetchImpl)).json();
  rz.payments.pay_cheap = { id: 'pay_cheap', order_id: cheap.orderId, status: 'captured', amount: cheap.amount };
  // Signature for the expensive order with the cheap payment: valid HMAC form, but Razorpay says the payment belongs elsewhere.
  const sig = await hmacSha256Hex(LIVE.RAZORPAY_KEY_SECRET, `${dear.orderId}|pay_cheap`);
  const v = await handleVerifyPayment(post({ razorpay_order_id: dear.orderId, razorpay_payment_id: 'pay_cheap', razorpay_signature: sig, ...buyer }), LIVE, rz.fetchImpl);
  assert.equal(v.status, 400);
});

test('an unpaid (failed) payment is rejected', async () => {
  const rz = fakeRazorpay();
  const o = await (await handleCreateOrder(post({ items: cart, ...buyer }), LIVE, rz.fetchImpl)).json();
  rz.payments.pay_1 = { id: 'pay_1', order_id: o.orderId, status: 'failed', amount: o.amount };
  const sig = await hmacSha256Hex(LIVE.RAZORPAY_KEY_SECRET, `${o.orderId}|pay_1`);
  const v = await handleVerifyPayment(post({ razorpay_order_id: o.orderId, razorpay_payment_id: 'pay_1', razorpay_signature: sig, ...buyer }), LIVE, rz.fetchImpl);
  assert.equal(v.status, 400);
});

test('gateway error never falls back to the free sandbox', async () => {
  const r = await handleCreateOrder(post({ items: cart, ...buyer }), LIVE, async () => new Response('bad', { status: 401 }));
  assert.equal(r.status, 502);
});

test('sandbox only when TAMYIZ_SANDBOX=true (for local testing)', async () => {
  const env = { TAMYIZ_SANDBOX: 'true' };
  const o = await (await handleCreateOrder(post({ items: cart, ...buyer }), env)).json();
  assert.equal(o.mode, 'atelier_sandbox');
  const v = await (await handleVerifyPayment(post({ items: cart, ...buyer }), env)).json();
  assert.equal(v.verified, true);
});

test('prices come from the server catalog, not the cart', () => {
  const t = calculateOrderTotal([{ productId: 'tmz-dig-007', variant: 'Student Edition', price: 1 }], 'TAMYIZ15');
  assert.equal(t.subtotal, 299);
  assert.equal(t.total, 254);
});

test('order notes round-trip and stay within Razorpay limits', () => {
  const items = Array.from({ length: 20 }, (_, i) => ({ productId: 'tmz-dig-00' + ((i % 8) + 1), variant: 'Notion Template + Zotero Guide' }));
  const notes = itemsToNotes(items);
  assert.ok(Object.values(notes).every((v) => v.length <= 256));
  assert.deepEqual(notesToItems(notes), items);
});

test('helpers', async () => {
  assert.ok(timingSafeEqual('abc', 'abc'));
  assert.ok(!timingSafeEqual('abc', 'abd'));
  assert.ok(!timingSafeEqual('abc', 'abcd'));
  // Known HMAC-SHA256 vector (RFC 4231 case 2)
  assert.equal(await hmacSha256Hex('Jefe', 'what do ya want for nothing?'), '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843');
});

test('verification returns prices for the receipt screen', async () => {
  const rz = fakeRazorpay();
  const o = await (await handleCreateOrder(post({ items: cart, ...buyer, couponCode: 'TAMYIZ15' }), LIVE, rz.fetchImpl)).json();
  rz.payments.pay_1 = { id: 'pay_1', order_id: o.orderId, status: 'captured', amount: o.amount };
  const sig = await hmacSha256Hex(LIVE.RAZORPAY_KEY_SECRET, `${o.orderId}|pay_1`);
  const res = await (await handleVerifyPayment(post({ razorpay_order_id: o.orderId, razorpay_payment_id: 'pay_1', razorpay_signature: sig, ...buyer }), LIVE, rz.fetchImpl)).json();
  assert.equal(res.amount, 25400);
  assert.equal(res.totalINR, 254);
  assert.equal(res.subtotalINR, 299);
  assert.equal(res.discountINR, 45);
  assert.equal(res.downloads[0].price, 299);
});
