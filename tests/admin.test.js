// /admin security and upload tests: run with `npm test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { route } from '../server/router.js';
import { devKV } from '../server/dev-kv.js';
import { hmacSha256Hex } from '../server/payments.js';

const PASSWORD = 'correct-horse-battery';
const BASE = 'https://shop.test';
const env = (extra = {}) => ({ TAMYIZ_STORE: devKV(), ADMIN_PASSWORD: PASSWORD, ...extra });
const PDF = new TextEncoder().encode('%PDF-1.4\nhello');
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70, 0, 1]);

const call = (e, path, opts = {}) => route(new Request(BASE + path, opts), e);

async function login(e, password = PASSWORD, ip = '1.2.3.4') {
  return call(e, '/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': ip }, body: JSON.stringify({ password }),
  });
}
async function session(e) {
  const r = await login(e);
  return r.headers.get('Set-Cookie').split(';')[0];
}
const authed = (cookie, extra = {}) => ({ Cookie: cookie, 'X-Tamyiz-Admin': '1', ...extra });

function form(fields, files = {}) {
  const f = new FormData();
  for (const [k, v] of Object.entries({ name: 'Research, Write & Cite with AI', price: '299', status: 'draft', ...fields })) f.append(k, v);
  for (const [k, [bytes, name]] of Object.entries(files)) f.append(k, new Blob([bytes]), name);
  return f;
}
const save = (e, cookie, f, id = '') => call(e, `/api/admin/products${id ? '/' + id : ''}`, { method: 'POST', headers: authed(cookie), body: f });

test('TAMYIZ_ADMIN_PASSWORD works as the password name too', async () => {
  const e = { TAMYIZ_STORE: devKV(), TAMYIZ_ADMIN_PASSWORD: PASSWORD };
  assert.equal((await login(e)).status, 200);
  assert.equal((await login(e, 'wrong-but-long-enough')).status, 401);
});

test('admin is closed until a long enough ADMIN_PASSWORD is set', async () => {
  assert.equal((await login(env({ ADMIN_PASSWORD: '' }))).status, 503);
  assert.equal((await login(env({ ADMIN_PASSWORD: 'short' }), 'short')).status, 503);
});

test('wrong password is refused; correct one gives a secure cookie', async () => {
  const e = env();
  assert.equal((await login(e, 'guess')).status, 401);
  const r = await login(e);
  assert.equal(r.status, 200);
  const c = r.headers.get('Set-Cookie');
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/api/admin']) assert.ok(c.includes(flag), flag);
});

test('ten wrong passwords lock that address out', async () => {
  const e = env();
  for (let i = 0; i < 10; i++) await login(e, 'nope' + i, '9.9.9.9');
  assert.equal((await login(e, PASSWORD, '9.9.9.9')).status, 429);
  assert.equal((await login(e, PASSWORD, '8.8.8.8')).status, 200);
});

test('no, fake, expired or old-password cookies get nothing', async () => {
  const e = env();
  assert.equal((await call(e, '/api/admin/products')).status, 401);
  assert.equal((await call(e, '/api/admin/products', { headers: { Cookie: 'tmz_admin=9999999999.abc' } })).status, 401);
  const past = Math.floor(Date.now() / 1000) - 10;
  const sig = await hmacSha256Hex(PASSWORD, `admin|${past}`);
  assert.equal((await call(e, '/api/admin/products', { headers: { Cookie: `tmz_admin=${past}.${sig}` } })).status, 401);
  const cookie = await session(e);
  assert.equal((await call(env({ ADMIN_PASSWORD: 'a-new-password-now' }), '/api/admin/products', { headers: { Cookie: cookie } })).status, 401);
  assert.equal((await call(e, '/api/admin/products', { headers: { Cookie: cookie } })).status, 200);
});

test('changes need the X-Tamyiz-Admin header (blocks forms posted from other sites)', async () => {
  const e = env(); const cookie = await session(e);
  const r = await call(e, '/api/admin/products', { method: 'POST', headers: { Cookie: cookie }, body: form({}) });
  assert.equal(r.status, 403);
});

test('add an e-book: drafts stay hidden, coming soon shows, text is escaped for the shop', async () => {
  const e = env(); const cookie = await session(e);
  const r = await save(e, cookie, form({ tagline: '<img src=x onerror=alert(1)>' }, { cover: [JPEG, 'c.jpg'] }));
  assert.equal(r.status, 201);
  const { product } = await r.json();
  assert.equal(product.slug, 'research-write-and-cite-with-ai');
  assert.deepEqual((await (await call(e, '/api/products')).json()).products, []);

  await save(e, cookie, form({ status: 'soon', tagline: '<img src=x onerror=alert(1)>' }), product.id);
  const shop = (await (await call(e, '/api/products')).json()).products;
  assert.equal(shop.length, 1);
  assert.equal(shop[0].available, false);
  assert.equal(shop[0].name, 'Research, Write &amp; Cite with AI');
  assert.ok(!shop[0].tagline.includes('<'));
  assert.ok(!('fileName' in shop[0]));
  const cover = await call(e, shop[0].images[0]);
  assert.equal(cover.headers.get('Content-Type'), 'image/jpeg');
});

test('"On sale" needs a real PDF; a fake PDF is refused', async () => {
  const e = env(); const cookie = await session(e);
  const noPdf = await save(e, cookie, form({ status: 'on-sale' }));
  assert.equal(noPdf.status, 422);
  assert.equal((await noPdf.json()).product.status, 'soon');

  const fake = await save(e, cookie, form({ status: 'on-sale' }, { pdf: [new TextEncoder().encode('MZ not a pdf'), 'book.pdf'] }));
  assert.equal(fake.status, 400);

  const ok = await save(e, cookie, form({ status: 'on-sale' }, { pdf: [PDF, 'book.pdf'] }));
  assert.equal(ok.status, 201);
  const shop = (await (await call(e, '/api/products')).json()).products;
  assert.equal(shop[0].available, true);
  // The PDF itself is never public.
  assert.equal((await call(e, `/api/download/${shop[0].id}`)).status, 403);
});

test('bad fields are explained', async () => {
  const e = env(); const cookie = await session(e);
  const r = await save(e, cookie, form({ price: '0' }));
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /Price/);
});

test('delete removes the book, its cover and its PDF', async () => {
  const e = env(); const cookie = await session(e);
  const { product } = await (await save(e, cookie, form({ status: 'on-sale' }, { pdf: [PDF, 'b.pdf'], cover: [JPEG, 'c.jpg'] }))).json();
  const d = await call(e, `/api/admin/products/${product.id}`, { method: 'DELETE', headers: authed(cookie) });
  assert.equal(d.status, 200);
  assert.equal(await e.TAMYIZ_STORE.get(`file:${product.id}`), null);
  assert.equal(await e.TAMYIZ_STORE.get(`cover:${product.id}`), null);
  assert.deepEqual((await (await call(e, '/api/products')).json()).products, []);
});

test('without storage connected the shop is empty and admin explains why', async () => {
  const e = { ADMIN_PASSWORD: PASSWORD };
  assert.deepEqual((await (await call(e, '/api/products')).json()).products, []);
  const cookie = await session(e);
  const r = await save(e, cookie, form({}));
  assert.equal(r.status, 503);
  assert.match((await r.json()).error, /TAMYIZ_STORE/);
});
