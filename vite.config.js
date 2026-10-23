import { defineConfig, loadEnv } from 'vite';
import { handleCreateOrder, handleVerifyPayment } from './server/payments.js';

// Local dev only: answers /api/create-order and /api/verify-payment with the same code Cloudflare runs
// (functions/api/* -> server/payments.js). Settings come from .env (never committed), e.g. TAMYIZ_SANDBOX=true.
function paymentsApi(env) {
  const routes = { '/api/create-order': handleCreateOrder, '/api/verify-payment': handleVerifyPayment };

  const middleware = (req, res, next) => {
    const path = (req.url || '').split('?')[0];
    const handler = routes[path];
    if (!handler) return next();
    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Method Not Allowed. Use POST.' }));
    }
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const request = new Request(`http://localhost${req.url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        const response = await handler(request, env);
        res.statusCode = response.status;
        response.headers.forEach((value, key) => res.setHeader(key, value));
        res.end(await response.text());
      } catch (err) {
        console.error('Local payments API error:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      }
    });
  };

  return {
    name: 'tamyiz-payments-api',
    configureServer(server) { server.middlewares.use(middleware); },
    configurePreviewServer(server) { server.middlewares.use(middleware); },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [paymentsApi(loadEnv(mode, process.cwd(), ''))],
  server: { port: 5173 },
  preview: { port: 4173 },
}));
