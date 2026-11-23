const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function boundedJson(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('empty body');
  let length = 0;
  const chunks = [];
  while (true) {
    const {value, done} = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 1024) { await reader.cancel(); throw new Error('oversized body'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {bytes.set(chunk, offset); offset += chunk.length;}
  return JSON.parse(new TextDecoder().decode(bytes));
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = String(env.ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim());
    const cors = allowed.includes(origin) ? {'Access-Control-Allow-Origin': origin, Vary: 'Origin'} : {};
    const respond = (value, status = 200, extra = {}) => Response.json(value, {status,
      headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...cors, ...extra}});
    const path = new URL(request.url).pathname;
    let events;
    try { events = typeof env.ALLOWED_EVENTS === 'string' ? JSON.parse(env.ALLOWED_EVENTS) : env.ALLOWED_EVENTS; }
    catch { return respond({error: 'configuration'}, 503); }
    if (!events || !env.DB) return respond({error: 'configuration'}, 503);
    try {
      if (path === '/counters' && request.method === 'GET') {
        if (!env.READ_TOKEN || request.headers.get('Authorization') !== `Bearer ${env.READ_TOKEN}`) return respond({error: 'unauthorized'}, 401);
        const {results} = await env.DB.prepare('SELECT project, event, value, updated_at AS updatedAt FROM counters').all();
        const now = new Date().toISOString();
        const counters = Object.entries(events).flatMap(([project, types]) => types.map(event =>
          results.find(row => row.project === project && row.event === event) ?? {project, event, value: 0, updatedAt: now}));
        return respond({schemaVersion: 1, counters});
      }
      if (path !== '/events') return respond({error: 'not-found'}, 404);
      if (!allowed.includes(origin)) return respond({error: 'origin'}, 403);
      if (request.method === 'OPTIONS') return new Response(null, {status: 204, headers: {...cors,
        'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '3600'}});
      if (request.method !== 'POST') return respond({error: 'method'}, 405);
      if (!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json')) return respond({error: 'content-type'}, 415);
      if (!env.EVENT_LIMITER) return respond({error: 'configuration'}, 503);
      const {success} = await env.EVENT_LIMITER.limit({key: `${request.headers.get('CF-Connecting-IP') ?? 'unknown'}:events`});
      if (!success) return respond({error: 'rate-limit'}, 429, {'Retry-After': '60'});
      let body;
      try { body = await boundedJson(request); } catch { return respond({error: 'body'}, 400); }
      if (!body || typeof body.project !== 'string' || !Object.hasOwn(events, body.project)
        || !events[body.project].includes(body.event) || typeof body.eventId !== 'string' || !uuid.test(body.eventId)
        || Object.keys(body).some(key => !['project', 'event', 'eventId'].includes(key))) return respond({error: 'event'}, 400);
      await env.DB.prepare('INSERT OR IGNORE INTO download_events (project, event_id, event, created_at) VALUES (?, ?, ?, ?)')
        .bind(body.project, body.eventId, body.event, new Date().toISOString()).run();
      return respond({accepted: true}, 202);
    } catch { return respond({error: 'temporarily-unavailable'}, 503); }
  },
};
