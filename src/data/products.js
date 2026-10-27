/**
 * The ebooks in the shop. They are added on /admin and kept in Cloudflare storage (server/catalog.js);
 * the app fills this list from /api/products before it draws a page (see loadProducts below).
 * Everything else imports this same array, so filling it in place updates every page.
 */
export const products = [];

async function fetchProducts(timeoutMs, fresh) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    // First try matches the <link rel=preload> in index.html (same address), so it reuses that download.
    const res = await fetch(fresh ? `/api/products?r=${Date.now()}` : '/api/products', { signal: ctrl.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches the shop's ebooks. The page is already drawn while this runs (cards show as placeholders),
 * so a slow answer only delays the cards. One retry before the shop says "Couldn't load".
 */
export async function loadProducts() {
  loadState.loading = true;
  let data = null;
  for (const [timeoutMs, fresh] of [[10000, false], [10000, true]]) {
    try { data = await fetchProducts(timeoutMs, fresh); break; }
    catch (err) { console.warn('Could not load ebooks:', err.message); }
  }
  if (data) products.splice(0, products.length, ...(Array.isArray(data.products) ? data.products : []));
  // Network down, server error or timeout twice: the shop must say so, not pretend it has no books.
  loadState.failed = !data;
  loadState.loading = false;
  return products;
}

/**
 * loading: the first answer hasn't arrived yet (placeholder cards).
 * failed: the last attempt failed (the "Couldn't load" state on home and /editions).
 */
export const loadState = { failed: false, loading: true };

export function findProductBySlugOrId(identifier) {
  if (!identifier) return null;
  const clean = String(identifier).toLowerCase().trim();
  return products.find(p => p.id.toLowerCase() === clean || (p.slug && p.slug.toLowerCase() === clean));
}

export function getRelatedProducts(productOrId, count = 2) {
  const prod = typeof productOrId === 'string'
    ? findProductBySlugOrId(productOrId)
    : productOrId;

  if (!prod) return products.slice(0, count);

  if (prod.relatedIds && prod.relatedIds.length > 0) {
    const list = prod.relatedIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean);
    if (list.length >= count) return list.slice(0, count);
  }

  // Fallback: items from other categories
  return products.filter(p => p.id !== prod.id).slice(0, count);
}

/** A product can be bought only when its files exist and are ready to deliver (`available: true`). */
export const isAvailable = (p) => Boolean(p && p.available);
export const anyAvailable = () => products.some(isAvailable);

/** Button text for a product's main action, in each place it appears. */
export function buyLabel(p, price, where) {
  const inr = `₹${Number(price).toLocaleString('en-IN')}`;
  if (!isAvailable(p)) {
    return { card: 'Pre-order on WhatsApp', pdp: '<span>Pre-order on WhatsApp</span>', modal: 'PRE-ORDER ON WHATSAPP →' }[where];
  }
  return {
    card: `Instant Access • ${inr}`,
    pdp: `<span>Add to Bag • Instant Access</span><span>•</span><span>${inr}</span>`,
    modal: `UNLOCK FULL EDITION • ${inr} →`
  }[where];
}

export function getDigitalProducts() {
  return products.filter(p => p.isDigital);
}
