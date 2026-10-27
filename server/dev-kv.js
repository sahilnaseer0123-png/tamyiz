/**
 * Local stand-in for Cloudflare KV (only used by `npm run dev` / `vite preview` and the tests).
 * With a folder it saves to disk (.local-store/, git-ignored); without one it keeps everything in memory.
 * Supports what the app uses: get, getWithMetadata, put (with metadata), delete. Expiry is ignored.
 */
import fs from 'node:fs';
import path from 'node:path';

export function devKV(dir = null) {
  const mem = new Map();
  const file = (key) => path.join(dir, encodeURIComponent(key));
  if (dir) fs.mkdirSync(dir, { recursive: true });

  const read = (key) => {
    if (!dir) return mem.get(key) || null;
    if (!fs.existsSync(file(key))) return null;
    const meta = fs.existsSync(file(key) + '.meta') ? JSON.parse(fs.readFileSync(file(key) + '.meta', 'utf8')) : null;
    return { bytes: new Uint8Array(fs.readFileSync(file(key))), metadata: meta };
  };
  const as = (bytes, type) => {
    if (type === 'json') return JSON.parse(new TextDecoder().decode(bytes));
    if (type === 'arrayBuffer') return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    if (type === 'stream') return new Blob([bytes]).stream();
    return new TextDecoder().decode(bytes);
  };

  return {
    // Cloudflare also accepts get(key, { type, cacheTtl }); cacheTtl means nothing locally.
    async get(key, opts = 'text') { const type = typeof opts === 'string' ? opts : (opts && opts.type) || 'text'; const e = read(key); return e ? as(e.bytes, type) : null; },
    async getWithMetadata(key, type = 'text') {
      const e = read(key);
      return e ? { value: as(e.bytes, type), metadata: e.metadata } : { value: null, metadata: null };
    },
    async put(key, value, opts = {}) {
      const bytes = typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value);
      if (!dir) return void mem.set(key, { bytes, metadata: opts.metadata || null });
      fs.writeFileSync(file(key), bytes);
      if (opts.metadata) fs.writeFileSync(file(key) + '.meta', JSON.stringify(opts.metadata));
    },
    async delete(key) {
      if (!dir) return void mem.delete(key);
      for (const f of [file(key), file(key) + '.meta']) if (fs.existsSync(f)) fs.unlinkSync(f);
    },
  };
}
