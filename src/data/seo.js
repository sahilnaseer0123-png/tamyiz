// Title, description, address and share picture for every page.
// Used twice: by scripts/build-pages.js (writes one HTML file per page, so search engines and WhatsApp/Instagram
// link previews see the right title and picture), and by the app (updates the tab title when you move between pages).
import { products } from './products.js';
import { legalDocs } from '../scripts/pages/legal-page.js';

export const SITE_URL = 'https://tamyiz.pages.dev';
const BRAND = 'TAMYIZ™';
const DEFAULT_IMAGE = '/og/tamyiz.jpg';
const DEFAULT_DESCRIPTION =
  'E-books, Notion templates and design kits by TAMYIZ™. First editions coming soon.';

const STATIC_PAGES = {
  home: {
    path: '/',
    title: `${BRAND} | E-books, Notion templates and design kits`,
    description: DEFAULT_DESCRIPTION,
  },
  editions: {
    path: '/editions',
    title: `All editions | ${BRAND}`,
    description: `All ${products.length} TAMYIZ™ editions: e-books, Notion templates and a Figma UI kit.`,
  },
  philosophy: {
    path: '/philosophy',
    title: `Philosophy and format guide | ${BRAND}`,
    description: 'How TAMYIZ™ editions are made, and which file formats work on which device (PDF, EPUB, Kindle, Notion, Figma).',
  },
  atelier: {
    path: '/atelier',
    title: `About us | ${BRAND}`,
    description: 'TAMYIZ™ is a small digital publishing studio run by co-founders Basit and Sahil.',
  },
  checkout: {
    path: '/checkout',
    title: `Checkout | ${BRAND}`,
    description: DEFAULT_DESCRIPTION,
    noindex: true,
  },
  notfound: {
    path: null,
    title: `Page not found | ${BRAND}`,
    description: DEFAULT_DESCRIPTION,
    noindex: true,
  },
};

export const ogImageFor = (product) => `/og/${product.slug}.jpg`;

/** Meta for one page. `page` and `slug` are what the router's parseRoute() returns. */
export function pageMeta(page, slug) {
  if (page === 'edition') {
    const product = products.find((p) => p.slug === slug || p.id.toLowerCase() === slug);
    if (!product) return { ...STATIC_PAGES.notfound, image: DEFAULT_IMAGE };
    return {
      path: `/edition/${product.slug}`,
      title: `${product.name} | ${BRAND}`,
      description: `${product.tagline}. ${product.category}, ₹${product.price}, ${product.available ? 'instant digital download' : 'coming soon, pre-order on WhatsApp'}.`,
      image: ogImageFor(product),
      product,
    };
  }
  if (page === 'legal') {
    const doc = legalDocs[slug] || legalDocs['delivery-protocol'];
    return {
      path: `/legal/${doc.slug}`,
      title: `${doc.title} | ${BRAND}`,
      description: `${doc.title}: ${doc.subtitle}`,
      image: DEFAULT_IMAGE,
    };
  }
  return { ...(STATIC_PAGES[page] || STATIC_PAGES.notfound), image: DEFAULT_IMAGE };
}

/** Every real page address, for the build script and the sitemap. */
export function allPages() {
  return [
    ...['home', 'editions', 'philosophy', 'atelier', 'checkout'].map((page) => ({ page, slug: null })),
    ...products.map((p) => ({ page: 'edition', slug: p.slug })),
    ...Object.keys(legalDocs).map((slug) => ({ page: 'legal', slug })),
  ];
}

/** schema.org data for a product page (price from the catalogue; no ratings until real customers leave them). */
export function productSchema(product) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.tagline,
    image: product.images.map((src) => SITE_URL + src),
    brand: { '@type': 'Brand', name: 'TAMYIZ' },
    category: product.category,
    url: `${SITE_URL}/edition/${product.slug}`,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'INR',
      availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      url: `${SITE_URL}/edition/${product.slug}`,
    },
  };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** The <head> tags for one page, as HTML (between the <!-- seo --> markers in index.html). */
export function headTags(meta) {
  const url = meta.path ? SITE_URL + meta.path : null;
  const image = SITE_URL + meta.image;
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    meta.noindex ? `<meta name="robots" content="noindex" />` : '',
    url ? `<link rel="canonical" href="${url}" />` : '',
    `<meta property="og:site_name" content="TAMYIZ™" />`,
    `<meta property="og:type" content="${meta.product ? 'product' : 'website'}" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    url ? `<meta property="og:url" content="${url}" />` : '',
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    meta.product
      ? `<script type="application/ld+json">${JSON.stringify(productSchema(meta.product)).replace(/</g, '\\u003c')}</script>`
      : '',
  ];
  return tags.filter(Boolean).map((t) => '  ' + t).join('\n');
}
