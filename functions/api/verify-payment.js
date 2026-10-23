// POST /api/verify-payment on Cloudflare Pages Functions. All logic lives in server/payments.js.
import { handleVerifyPayment, json } from '../../server/payments.js';

export const onRequestPost = ({ request, env }) => handleVerifyPayment(request, env);
export const onRequest = () => json({ error: 'Method Not Allowed. Use POST.' }, 405);
