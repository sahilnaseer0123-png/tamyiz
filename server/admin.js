/**
 * /api/admin/*: the private side of /admin.
 *
 * Login: the password is the Cloudflare secret ADMIN_PASSWORD (12+ characters). A correct password gets a
 * signed cookie (HttpOnly, Secure, SameSite=Strict, 12 hours). Changing ADMIN_PASSWORD logs everyone out.
 * Ten wrong passwords from one address lock logins from it for 15 minutes.
 * Every change also needs the header X-Tamyiz-Admin: 1 (pages on other sites can't send it).
 */
import { json, hmacSha256Hex, timingSafeEqual } from './payments.js';
import {
  loadCatalog, saveCatalog, store, findById, readFields, sniff, newId, uniqueSlug,
  MAX_PDF_BYTES, MAX_COVER_BYTES, StoreMissing,
} from './catalog.js';

const COOKIE = 'tmz_admin';
const SESSION_SECONDS = 12 * 60 * 60;
const MIN_PASSWORD = 12;
const MAX_FAILS = 10;

const passwordReady = (env) => String(env.ADMIN_PASSWORD || '').length >= MIN_PASSWORD;

async function sha256Hex(s) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s)));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readCookie(request, name) {
  const all = request.headers.get('Cookie') || '';
  for (const part of all.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return v.join('=');
  }
  return null;
}

const cookieHeader = (value, maxAge) =>
  `${COOKIE}=${value}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;

export async function isAdmin(request, env) {
  if (!passwordReady(env)) return false;
  const raw = readCookie(request, COOKIE);
  if (!raw) return false;
  const [exp, sig] = raw.split('.');
  if (!exp || !sig || Number(exp) < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmacSha256Hex(env.ADMIN_PASSWORD, `admin|${exp}`);
  return timingSafeEqual(expected, sig);
}

const clientIp = (request) => request.headers.get('CF-Connecting-IP') || 'local';

async function login(request, env) {
  if (!passwordReady(env)) {
    return json({ error: `Admin password not set. In Cloudflare add the secret ADMIN_PASSWORD (at least ${MIN_PASSWORD} characters).` }, 503);
  }
  const kv = env.TAMYIZ_STORE;
  const failKey = `login-fail:${clientIp(request)}`;
  const fails = kv ? Number(await kv.get(failKey)) || 0 : 0;
  if (fails >= MAX_FAILS) return json({ error: 'Too many wrong passwords. Try again in 15 minutes.' }, 429);

  let body = {};
  try { body = await request.json(); } catch {}
  // Compare hashes, so the comparison takes the same time whatever the password length.
  const ok = timingSafeEqual(await sha256Hex(body.password || ''), await sha256Hex(env.ADMIN_PASSWORD));
  if (!ok) {
    if (kv) await kv.put(failKey, String(fails + 1), { expirationTtl: 15 * 60 });
    await new Promise((r) => setTimeout(r, 400));
    return json({ error: 'Wrong password.' }, 401);
  }
  const exp = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const sig = await hmacSha256Hex(env.ADMIN_PASSWORD, `admin|${exp}`);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Set-Cookie': cookieHeader(`${exp}.${sig}`, SESSION_SECONDS) },
  });
}

function logout() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Set-Cookie': cookieHeader('', 0) },
  });
}

/** Admin's view of one ebook: everything except the file bytes. */
const adminView = (p) => ({ ...p, coverUrl: p.coverType ? `/api/cover/${p.id}?v=${p.updatedAt}` : null });

async function fileFrom(form, field, maxBytes, allowed, label) {
  const f = form.get(field);
  if (!f || typeof f === 'string' || !f.size) return null;
  if (f.size > maxBytes) throw new Error(`${label} is too big: ${(f.size / 1048576).toFixed(1)} MB (limit ${Math.round(maxBytes / 1048576)} MB).`);
  const bytes = await f.arrayBuffer();
  const type = sniff(bytes);
  if (!allowed.includes(type)) throw new Error(`${label} must be ${allowed.map((t) => t.split('/')[1].toUpperCase()).join(' or ')}.`);
  return { bytes, type, name: String(f.name || '').slice(0, 120), size: f.size };
}

async function saveProduct(request, env, id) {
  const kv = store(env);
  let form;
  try { form = await request.formData(); } catch { return json({ error: 'Could not read the upload. Try again.' }, 400); }

  let fields, cover, pdf;
  try {
    fields = readFields(form);
    cover = await fileFrom(form, 'cover', MAX_COVER_BYTES, ['image/jpeg', 'image/png', 'image/webp'], 'The cover');
    pdf = await fileFrom(form, 'pdf', MAX_PDF_BYTES, ['application/pdf'], 'The ebook file');
  } catch (err) {
    return json({ error: err.message }, 400);
  }

  const list = await loadCatalog(env);
  const existing = id ? findById(list, id) : null;
  if (id && !existing) return json({ error: 'That ebook no longer exists.' }, 404);

  const now = Date.now();
  const rec = existing ? { ...existing } : { id: newId(), createdAt: now };
  Object.assign(rec, fields, { updatedAt: now });
  rec.slug = uniqueSlug(list, form.get('slug') || rec.slug || fields.name, rec.id);

  if (cover) {
    await kv.put(`cover:${rec.id}`, cover.bytes, { metadata: { type: cover.type } });
    rec.coverType = cover.type;
  }
  if (pdf) {
    await kv.put(`file:${rec.id}`, pdf.bytes, { metadata: { type: pdf.type, name: pdf.name, size: pdf.size } });
    Object.assign(rec, { fileName: pdf.name, fileSize: pdf.size, fileUploadedAt: now });
  }
  if (rec.status === 'on-sale' && !rec.fileSize) {
    rec.status = existing && existing.status !== 'on-sale' ? existing.status : 'soon';
    await saveCatalog(env, upsert(list, rec));
    return json({ error: 'Saved, but it can only be "On sale" once the PDF is uploaded. Status kept as ' + statusName(rec.status) + '.', product: adminView(rec) }, 422);
  }
  await saveCatalog(env, upsert(list, rec));
  return json({ ok: true, product: adminView(rec) }, existing ? 200 : 201);
}

const statusName = (s) => ({ draft: 'Draft', soon: 'Coming soon', 'on-sale': 'On sale' })[s] || s;
const upsert = (list, rec) => [rec, ...list.filter((p) => p.id !== rec.id)].sort((a, b) => b.createdAt - a.createdAt);

async function deleteProduct(env, id) {
  const kv = store(env);
  const list = await loadCatalog(env);
  if (!findById(list, id)) return json({ error: 'That ebook no longer exists.' }, 404);
  await saveCatalog(env, list.filter((p) => p.id !== id));
  await Promise.all([kv.delete(`cover:${id}`), kv.delete(`file:${id}`)]);
  return json({ ok: true });
}

/** Routes for /api/admin/<rest>. */
export async function handleAdmin(request, env, rest) {
  const method = request.method;
  try {
    if (rest === 'login' && method === 'POST') return await login(request, env);
    if (rest === 'logout' && method === 'POST') return logout();

    if (!(await isAdmin(request, env))) return json({ error: 'Please log in.' }, 401);
    if (method !== 'GET' && request.headers.get('X-Tamyiz-Admin') !== '1') return json({ error: 'Forbidden.' }, 403);

    if (rest === 'session' && method === 'GET') {
      return json({ ok: true, storage: Boolean(env.TAMYIZ_STORE) });
    }
    if (rest === 'products' && method === 'GET') return json({ products: (await loadCatalog(env)).map(adminView) });
    if (rest === 'products' && method === 'POST') return await saveProduct(request, env, null);
    const m = rest.match(/^products\/([a-z0-9-]{3,40})$/);
    if (m && method === 'POST') return await saveProduct(request, env, m[1]);
    if (m && method === 'DELETE') return await deleteProduct(env, m[1]);
    return json({ error: 'Not found.' }, 404);
  } catch (err) {
    if (err instanceof StoreMissing) return json({ error: err.message }, 503);
    console.error('Admin error:', err);
    return json({ error: 'Something went wrong on the server. Try again.' }, 500);
  }
}
