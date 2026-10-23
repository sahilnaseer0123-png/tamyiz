// Runs after `vite build`. Writes one HTML file per page (same app, page-specific <head>), a 404 page and the sitemap.
// Cloudflare Pages serves dist/editions.html at /editions and dist/404.html (status 404) for any unknown address.
import fs from 'node:fs';
import path from 'node:path';
import { allPages, headTags, pageMeta, SITE_URL } from '../src/data/seo.js';

const dist = path.resolve('dist');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const SEO_BLOCK = /<!-- seo:[\s\S]*?<!-- \/seo -->/;
if (!SEO_BLOCK.test(template)) throw new Error('index.html is missing the <!-- seo --> ... <!-- /seo --> block');

const render = (meta) => template.replace(SEO_BLOCK, headTags(meta).trimStart());
const fileFor = (urlPath) => (urlPath === '/' ? 'index.html' : urlPath.slice(1) + '.html');

const written = [];
for (const { page, slug } of allPages()) {
  const meta = pageMeta(page, slug);
  const file = path.join(dist, fileFor(meta.path));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, render(meta));
  written.push(meta);
}
// /legal on its own opens the first policy.
fs.writeFileSync(path.join(dist, 'legal.html'), render(pageMeta('legal', 'delivery-protocol')));
fs.writeFileSync(path.join(dist, '404.html'), render(pageMeta('notfound')));

const urls = written
  .filter((m) => !m.noindex)
  .map((m) => `  <url><loc>${SITE_URL}${m.path}</loc></url>`)
  .join('\n');
fs.writeFileSync(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
);
console.log(`build-pages: ${written.length} pages + legal.html + 404.html + sitemap.xml`);
