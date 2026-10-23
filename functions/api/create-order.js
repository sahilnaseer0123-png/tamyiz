// POST /api/create-order on Cloudflare Pages Functions. All logic lives in server/payments.js.
import { handleCreateOrder, json } from '../../server/payments.js';

export const onRequestPost = ({ request, env }) => handleCreateOrder(request, env);
export const onRequest = () => json({ error: 'Method Not Allowed. Use POST.' }, 405);
