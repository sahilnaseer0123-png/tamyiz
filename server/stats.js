/**
 * Visitor numbers for /admin, read from Cloudflare Web Analytics (cookieless; counts only, never who someone is).
 *
 * Needs the Cloudflare secret CF_API_TOKEN: an API token with only "Account → Account Analytics → Read".
 * The account id and Web Analytics site tag below are identifiers, not secrets; CF_ACCOUNT_ID / CF_SITE_TAG override them.
 * Served at GET /api/admin/stats?days=1|7|30 (admin login required: see server/admin.js).
 */
import { json } from './payments.js';

const ACCOUNT_ID = '70ab4642e5e7f13626acb8b675922176';
const SITE_TAG = 'da55b249914c42c4817657abaf63898c'; // tamyiz.pages.dev in Web Analytics
const GRAPHQL = 'https://api.cloudflare.com/client/v4/graphql';
const RANGES = [1, 7, 30];

const QUERY = `query Stats($account: string!, $filter: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject!) {
  viewer {
    accounts(filter: { accountTag: $account }) {
      total: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 1) { count sum { visits } }
      days: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 31, orderBy: [date_ASC]) { count sum { visits } dimensions { date } }
      pages: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 8, orderBy: [count_DESC]) { count dimensions { requestPath } }
      sources: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 8, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { refererHost } }
      countries: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 6, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { countryName } }
      devices: rumPageloadEventsAdaptiveGroups(filter: $filter, limit: 4, orderBy: [sum_visits_DESC]) { sum { visits } dimensions { deviceType } }
    }
  }
}`;

/** Friendly name for where a visit came from. */
export function sourceName(host) {
  const h = String(host || '').toLowerCase().replace(/^www\./, '');
  if (!h) return 'Direct, WhatsApp or app';
  if (h.includes('instagram')) return 'Instagram';
  if (h.includes('facebook') || h === 'fb.com' || h.endsWith('.fb.com')) return 'Facebook';
  if (h.includes('whatsapp')) return 'WhatsApp';
  if (h.startsWith('google.') || h.includes('.google.')) return 'Google';
  if (h.includes('bing.')) return 'Bing';
  if (h.includes('youtube')) return 'YouTube';
  if (h === 't.co' || h.includes('twitter') || h === 'x.com') return 'X (Twitter)';
  if (h.includes('linkedin')) return 'LinkedIn';
  if (h.includes('tamyiz')) return 'Your own site';
  return h;
}

/** Turns Cloudflare's answer into what the /admin card shows. Sources with the same friendly name are added together. */
export function shapeStats(acc, days) {
  const total = (acc.total && acc.total[0]) || { count: 0, sum: { visits: 0 } };
  const merge = new Map();
  for (const s of acc.sources || []) {
    const name = sourceName(s.dimensions.refererHost);
    merge.set(name, (merge.get(name) || 0) + (s.sum.visits || 0));
  }
  return {
    days,
    visits: total.sum.visits || 0,
    pageViews: total.count || 0,
    byDay: (acc.days || []).map((d) => ({ date: d.dimensions.date, visits: d.sum.visits || 0, pageViews: d.count || 0 })),
    pages: (acc.pages || []).map((p) => ({ path: p.dimensions.requestPath || '/', pageViews: p.count || 0 })),
    sources: [...merge.entries()].map(([name, visits]) => ({ name, visits })).sort((a, b) => b.visits - a.visits),
    countries: (acc.countries || []).map((c) => ({ name: c.dimensions.countryName || 'Unknown', visits: c.sum.visits || 0 })),
    devices: (acc.devices || []).map((d) => ({ name: d.dimensions.deviceType || 'Unknown', visits: d.sum.visits || 0 })),
  };
}

export async function getStats(request, env, fetchImpl = fetch) {
  const token = String(env.CF_API_TOKEN || '');
  if (!token) {
    return json({ error: 'Visitor numbers are not connected yet. In Cloudflare add the secret CF_API_TOKEN (an API token with Account Analytics: Read), then redeploy.', setup: true }, 503);
  }
  const asked = Number(new URL(request.url).searchParams.get('days'));
  const days = RANGES.includes(asked) ? asked : 7;
  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const filter = { AND: [{ datetime_geq: start.toISOString(), datetime_leq: end.toISOString() }, { siteTag: env.CF_SITE_TAG || SITE_TAG }] };

  let res, body;
  try {
    res = await fetchImpl(GRAPHQL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: QUERY, variables: { account: env.CF_ACCOUNT_ID || ACCOUNT_ID, filter } }),
    });
    body = await res.json();
  } catch {
    return json({ error: "Couldn't reach Cloudflare for visitor numbers. Try again in a minute." }, 502);
  }
  const errs = (body && body.errors) || [];
  if (!res.ok || errs.length) {
    const text = errs.map((e) => e.message).join(' ').slice(0, 200);
    const auth = res.status === 401 || res.status === 403 || /auth|permission|not authorized/i.test(text);
    return json({ error: auth
      ? 'Cloudflare refused the token. Check that CF_API_TOKEN has Account Analytics: Read for your account.'
      : `Cloudflare couldn't give visitor numbers right now${text ? ` (${text})` : ''}.` }, auth ? 403 : 502);
  }
  const acc = body.data && body.data.viewer && body.data.viewer.accounts && body.data.viewer.accounts[0];
  if (!acc) return json({ error: 'Cloudflare found no analytics for this account. Check CF_ACCOUNT_ID.' }, 502);
  return json(shapeStats(acc, days));
}
