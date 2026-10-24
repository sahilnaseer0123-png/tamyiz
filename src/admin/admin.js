// /admin: add, edit and remove the shop's e-books. Talks to /api/admin/* (server/admin.js).
// Everything shown here is built with textContent / DOM nodes, never innerHTML, so typed text can't run as code.

const $ = (id) => document.getElementById(id);
const views = ['login-view', 'list-view', 'form-view'];
const show = (id) => views.forEach((v) => { $(v).hidden = v !== id; });
const STATUS = { draft: 'Draft', soon: 'Coming soon', 'on-sale': 'On sale' };
const MAX_PDF = 25 * 1024 * 1024;

let books = [];
let editing = null; // the e-book being edited, or null when adding
let coverBlob = null; // resized cover, ready to upload
let thumbBlob = null; // small version of it for the shop's cards and bag

function message(el, text, kind = 'error') {
  el.replaceChildren();
  if (!text) return;
  const d = document.createElement('div');
  d.className = `msg ${kind}`;
  d.textContent = text;
  el.append(d);
}

const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;

async function api(path, opts = {}) {
  const res = await fetch(`/api/admin/${path}`, {
    credentials: 'same-origin',
    ...opts,
    headers: { 'X-Tamyiz-Admin': '1', ...(opts.headers || {}) },
  });
  let data = {};
  try { data = await res.json(); } catch {}
  return { status: res.status, ok: res.ok, data };
}

// ---------------------------------------------------------------- log in / out
async function start() {
  const r = await api('session');
  if (r.ok) return openList(r.data.storage ? '' : 'Storage is not connected yet, so nothing can be saved. See the setup steps.');
  show('login-view');
  if (r.status === 503) message($('login-msg'), r.data.error);
  $('password').focus();
}

$('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.submitter || $('login-form').querySelector('button');
  btn.disabled = true;
  const r = await api('login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: $('password').value }) });
  btn.disabled = false;
  if (!r.ok) return message($('login-msg'), r.data.error || 'Could not log in.');
  $('password').value = '';
  message($('login-msg'), '');
  openList();
});

$('logout').addEventListener('click', async () => {
  await api('logout', { method: 'POST' });
  $('logout').hidden = true;
  show('login-view');
});

// ---------------------------------------------------------------- list
async function openList(note = '', kind = 'warn') {
  $('logout').hidden = false;
  show('list-view');
  const r = await api('products');
  if (r.status === 401) return start();
  if (!r.ok) return message($('list-msg'), r.data.error || 'Could not load your e-books.');
  books = r.data.products || [];
  message($('list-msg'), note, kind);
  drawList();
  makeMissingThumbs();
}

// Books added before small covers existed get one now, made from their full cover (quietly, once each).
async function makeMissingThumbs() {
  for (const b of books.filter((x) => x.coverUrl && !x.thumbType)) {
    try {
      const img = await fetch(b.coverUrl);
      if (!img.ok) continue;
      const { blob } = await shrink(await createImageBitmap(await img.blob()), 720, 0.8);
      const data = new FormData();
      data.append('thumb', blob, 'thumb.jpg');
      await fetch(`/api/admin/products/${b.id}/thumb`, { method: 'POST', headers: { 'X-Tamyiz-Admin': '1' }, body: data, credentials: 'same-origin' });
    } catch { /* not important: the shop falls back to the full cover */ }
  }
}

function drawList() {
  const list = $('list');
  list.replaceChildren();
  if (!books.length) {
    const p = document.createElement('div');
    p.className = 'card empty';
    p.textContent = 'No e-books yet. Press "Add an e-book" to put your first one in the shop.';
    list.append(p);
    return;
  }
  for (const b of books) {
    const card = document.createElement('article');
    card.className = 'card item';

    let pic;
    if (b.coverUrl) { pic = document.createElement('img'); pic.src = b.coverUrl; pic.alt = ''; }
    else { pic = document.createElement('div'); pic.className = 'noimg'; }

    const body = document.createElement('div');
    const h = document.createElement('h3'); h.textContent = b.name;
    const chip = document.createElement('span'); chip.className = `chip ${b.status}`; chip.textContent = STATUS[b.status] || b.status;
    const meta = document.createElement('div'); meta.className = 'meta';
    meta.append(chip, `₹${Number(b.price).toLocaleString('en-IN')} · `, b.fileSize ? `PDF ${mb(b.fileSize)}` : 'No PDF yet');

    const actions = document.createElement('div'); actions.className = 'actions';
    const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'ghost'; edit.textContent = 'Edit';
    edit.setAttribute('aria-label', `Edit ${b.name}`);
    edit.onclick = () => openForm(b);
    actions.append(edit);
    if (b.status !== 'draft') {
      const view = document.createElement('a'); view.className = 'btn ghost'; view.href = `/edition/${b.slug}`; view.target = '_blank'; view.rel = 'noopener';
      view.textContent = 'View in shop ↗';
      actions.append(view);
    }
    const del = document.createElement('button'); del.type = 'button'; del.className = 'danger'; del.textContent = 'Delete';
    del.setAttribute('aria-label', `Delete ${b.name}`);
    del.onclick = () => remove(b);
    actions.append(del);

    body.append(h, meta, actions);
    card.append(pic, body);
    list.append(card);
  }
}

async function remove(b) {
  if (!confirm(`Delete "${b.name}"? This removes it from the shop and deletes its PDF. Buyers' links stop working.`)) return;
  const r = await api(`products/${b.id}`, { method: 'DELETE' });
  if (!r.ok) return message($('list-msg'), r.data.error || 'Could not delete.');
  openList(`Deleted "${b.name}".`, 'ok');
}

// ---------------------------------------------------------------- add / edit
$('add').addEventListener('click', () => openForm(null));
$('cancel').addEventListener('click', () => openList());

function openForm(b) {
  editing = b;
  coverBlob = null;
  const f = $('book-form');
  f.reset();
  message($('form-msg'), '');
  $('form-title').textContent = b ? 'Edit e-book' : 'Add an e-book';
  $('f-name').value = b ? b.name : '';
  $('f-tagline').value = b ? b.tagline || '' : '';
  $('f-price').value = b ? b.price : '';
  $('f-pages').value = b && b.pages ? b.pages : '';
  $('f-description').value = b ? b.description || '' : '';
  $('f-contents').value = b && b.contents ? b.contents.join('\n') : '';
  f.querySelector(`input[name=status][value="${b ? b.status : 'draft'}"]`).checked = true;
  $('cover-preview').hidden = !(b && b.coverUrl);
  if (b && b.coverUrl) { $('cover-img').src = b.coverUrl; $('cover-note').textContent = 'Current cover. Choose a new image to replace it.'; }
  $('pdf-note').textContent = b && b.fileSize ? `Current PDF: ${b.fileName || 'ebook.pdf'} (${mb(b.fileSize)}). Choose a new file only to replace it.` : 'No PDF uploaded yet.';
  show('form-view');
  window.scrollTo(0, 0);
  $('f-name').focus();
}

// Draw an image no bigger than maxSide on either edge, as a JPEG.
async function shrink(bmp, maxSide, quality) {
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
  return { blob, canvas };
}

// Mockup covers (a book photographed on a plain backdrop) come with a wide empty border, which makes the book look
// smaller than flat covers on the shop. Cut the border off: find where the picture stops matching the corner colour.
// A row or column counts as picture only if a fifth of it clearly differs, so soft shadows and thin lines are trimmed too. Returns the bitmap unchanged if there is no border.
async function trimBorder(bmp) {
  const k = Math.min(1, 400 / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * k)), h = Math.max(1, Math.round(bmp.height * k));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0, w, h);
  const px = ctx.getImageData(0, 0, w, h).data;
  const at = (x, y) => { const i = (y * w + x) * 4; return [px[i], px[i + 1], px[i + 2]]; };
  const corners = [at(1, 1), at(w - 2, 1), at(1, h - 2), at(w - 2, h - 2)];
  // Backdrop = the lightest corner (a board's or a shadow's corner is darker); skip if a corner is wildly different.
  const lum = (q) => q[0] + q[1] + q[2];
  const bg = corners.reduce((a, q) => (lum(q) > lum(a) ? q : a));
  if (corners.filter((q) => Math.abs(lum(q) - lum(bg)) < 120).length < 2) return bmp;
  const differs = (x, y) => { const q = at(x, y); return Math.abs(q[0] - bg[0]) + Math.abs(q[1] - bg[1]) + Math.abs(q[2] - bg[2]) > 150; };
  const rowHit = (y) => { let n = 0; for (let x = 0; x < w; x++) n += differs(x, y); return n > w * 0.2; };
  const colHit = (x) => { let n = 0; for (let y = 0; y < h; y++) n += differs(x, y); return n > h * 0.2; };
  // The book is the longest unbroken run of picture rows/columns; a separate band (a board's drop shadow) is skipped.
  const longestRun = (n, hit) => {
    let best = [0, -1], start = -1;
    for (let i = 0; i <= n; i++) {
      if (i < n && hit(i)) { if (start < 0) start = i; }
      else if (start >= 0) { if (i - 1 - start > best[1] - best[0]) best = [start, i - 1]; start = -1; }
    }
    return best;
  };
  const [top, bot] = longestRun(h, rowHit);
  const [left, right] = longestRun(w, colHit);
  const sw = right - left + 1, sh = bot - top + 1;
  if (sw < w * 0.3 || sh < h * 0.3) return bmp;            // found almost nothing: leave it alone
  if (sw > w * 0.95 && sh > h * 0.95) return bmp;          // no real border
  const pad = 1; // keep a hair of edge so the cover's corners aren't clipped
  const sx = Math.max(0, (left - pad) / k), sy = Math.max(0, (top - pad) / k);
  const ex = Math.min(bmp.width, (right + 1 + pad) / k), ey = Math.min(bmp.height, (bot + 1 + pad) / k);
  return createImageBitmap(bmp, Math.round(sx), Math.round(sy), Math.round(ex - sx), Math.round(ey - sy));
}

// Covers are shrunk in the browser (max 1200 px) so the shop stays fast, plus a 720 px version for cards and the bag.
$('f-cover').addEventListener('change', async () => {
  const file = $('f-cover').files[0];
  coverBlob = null; thumbBlob = null;
  if (!file) return;
  try {
    const raw = await createImageBitmap(file);
    // A mockup can have layers (page, then a lighter board behind the book): trim until nothing more comes off.
    let bmp = raw;
    for (let i = 0; i < 3; i++) { const next = await trimBorder(bmp); if (next === bmp) break; bmp = next; }
    const trimmed = bmp !== raw;
    const { blob, canvas } = await shrink(bmp, 1200, 0.86);
    coverBlob = blob;
    thumbBlob = (await shrink(bmp, 720, 0.8)).blob;
    $('cover-img').src = URL.createObjectURL(coverBlob);
    $('cover-note').textContent = `New cover, ${canvas.width}×${canvas.height}, ${Math.round(coverBlob.size / 1024)} KB.${trimmed ? ' Empty border around the book cut off, so it shows as big as the other covers.' : ''}`;
    $('cover-preview').hidden = false;
  } catch {
    message($('form-msg'), 'That image could not be opened. Try a JPG or PNG.');
    $('f-cover').value = '';
  }
});

$('f-pdf').addEventListener('change', () => {
  const file = $('f-pdf').files[0];
  if (!file) return;
  if (file.size > MAX_PDF) {
    message($('form-msg'), `That PDF is ${mb(file.size)}. The limit is 25 MB: compress it (for example with ilovepdf.com) and try again.`);
    $('f-pdf').value = '';
    return;
  }
  $('pdf-note').textContent = `Ready to upload: ${file.name} (${mb(file.size)}).`;
});

$('book-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = $('book-form');
  message($('form-msg'), '');
  if ($('f-name').value.trim().length < 3) return message($('form-msg'), 'Give the e-book a title.'), $('f-name').focus();
  const price = Number($('f-price').value);
  if (!Number.isInteger(price) || price < 1) return message($('form-msg'), 'Enter the price as a whole number of rupees, like 299.'), $('f-price').focus();
  const status = f.querySelector('input[name=status]:checked').value;
  const hasPdf = $('f-pdf').files[0] || (editing && editing.fileSize);
  if (status === 'on-sale' && !hasPdf) return message($('form-msg'), 'To put it on sale, upload the PDF too (or choose "Coming soon" for now).');

  const data = new FormData();
  for (const k of ['name', 'tagline', 'price', 'pages', 'description', 'contents']) data.append(k, $(`f-${k}`).value);
  data.append('status', status);
  if (coverBlob) data.append('cover', coverBlob, 'cover.jpg');
  if (coverBlob && thumbBlob) data.append('thumb', thumbBlob, 'thumb.jpg');
  if ($('f-pdf').files[0]) data.append('pdf', $('f-pdf').files[0]);

  // XMLHttpRequest, because it can report upload progress for big PDFs.
  const xhr = new XMLHttpRequest();
  xhr.open('POST', editing ? `/api/admin/products/${editing.id}` : '/api/admin/products');
  xhr.setRequestHeader('X-Tamyiz-Admin', '1');
  const bar = $('progress');
  bar.hidden = false; bar.value = 0;
  $('save').disabled = true;
  $('save').textContent = 'Saving…';
  xhr.upload.onprogress = (ev) => { if (ev.lengthComputable) bar.value = Math.round((ev.loaded / ev.total) * 100); };
  xhr.onloadend = () => {
    bar.hidden = true;
    $('save').disabled = false;
    $('save').textContent = 'Save';
    let res = {};
    try { res = JSON.parse(xhr.responseText); } catch {}
    if (xhr.status === 401) return start();
    if (xhr.status === 422 && res.product) return openList(res.error, 'warn');
    if (xhr.status < 200 || xhr.status >= 300) return message($('form-msg'), res.error || 'Saving failed. Check your connection and try again.');
    const p = res.product;
    const where = p.status === 'draft' ? 'It is a draft, so only you can see it.' : 'It is in the shop now (it can take up to a minute to show everywhere).';
    openList(`Saved "${p.name}". ${where}`, 'ok');
  };
  xhr.send(data);
});

start();
