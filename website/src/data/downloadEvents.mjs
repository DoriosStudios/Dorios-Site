// Attempts have no user identity. Retries reuse the same UUID; the server owns deduplication.
const attempts = new Set();
export const downloadAttempt = () => globalThis.crypto?.randomUUID?.();
export async function recordDownloadStarted({endpoint, project, event, eventId}, {request = globalThis.fetch} = {}) {
  if (!endpoint || !eventId || attempts.has(eventId)) return false;
  attempts.add(eventId);
  if (attempts.size > 256) attempts.delete(attempts.values().next().value);
  let recorded = false;
  try {
    const url = new URL('/events', endpoint);
    if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') return false;
    for (let retry = 0; retry < 2; retry++) {
      try {
        const response = await request(url, {method: 'POST', credentials: 'omit', keepalive: true,
          headers: {'Content-Type': 'application/json'}, body: JSON.stringify({project, event, eventId}), signal: AbortSignal.timeout(4000)});
        if (response.ok) {
          recorded = true;
          return true;
        }
        if (response.status < 500) return false;
      } catch { /* Telemetry never interrupts the local download. */ }
    }
  } catch { /* Invalid configuration is optional telemetry. */ }
  finally { if (!recorded) attempts.delete(eventId); }
  return false;
}
