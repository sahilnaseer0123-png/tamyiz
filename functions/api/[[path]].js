// Cloudflare Pages Function for every /api/* address. All logic lives in server/router.js.
import { route } from '../../server/router.js';

export const onRequest = ({ request, env }) => route(request, env);
