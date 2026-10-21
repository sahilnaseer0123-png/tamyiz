import { defineConfig } from 'vite';
import createOrderHandler from './api/create-order.js';
import verifyPaymentHandler from './api/verify-payment.js';

function serverlessApiMiddleware() {
  const handleApi = (req, res, next) => {
    const url = (req.url || '').split('?')[0];

    if (url === '/api/create-order' && (req.method === 'POST' || req.method === 'OPTIONS')) {
      return runHandler(createOrderHandler, req, res);
    }
    if (url === '/api/verify-payment' && (req.method === 'POST' || req.method === 'OPTIONS')) {
      return runHandler(verifyPaymentHandler, req, res);
    }
    next();
  };

  const runHandler = (handler, req, res) => {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        req.body = bodyStr ? JSON.parse(bodyStr) : {};
      } catch {
        req.body = {};
      }

      // Emulate Vercel Serverless Response methods
      res.status = (statusCode) => {
        res.statusCode = statusCode;
        return res;
      };
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };

      try {
        await handler(req, res);
      } catch (err) {
        console.error('Serverless local API error:', err);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
      }
    });
  };

  return {
    name: 'serverless-api-middleware',
    configureServer(server) {
      server.middlewares.use(handleApi);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApi);
    }
  };
}

export default defineConfig({
  plugins: [serverlessApiMiddleware()],
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
});
