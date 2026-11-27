export async function collect(source, {project, request = fetch, env = process.env}) {
  if (!env.DOWNLOAD_COUNTER_URL || !env.DOWNLOAD_COUNTER_READ_TOKEN) throw new Error('internal-counter-not-configured');
  const url = new URL('/counters', env.DOWNLOAD_COUNTER_URL);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') throw new Error('Counter URL must use HTTPS');
  const response = await request(url, {headers: {Authorization: `Bearer ${env.DOWNLOAD_COUNTER_READ_TOKEN}`}, signal: AbortSignal.timeout(15000)});
  if (!response.ok) throw new Error(`Internal counter HTTP ${response.status}`);
  const data = await response.json();
  const record = data.schemaVersion === 1 && data.counters?.find(row => row.project === project.id && row.event === source.event);
  if (!record) throw new Error('Internal counter missing project/event');
  if (!Number.isSafeInteger(record.value) || record.value < 0 || !Number.isFinite(Date.parse(record.updatedAt))) {
    throw new Error('Internal counter returned an invalid count or date');
  }
  return {value: record.value, metric: 'download-starts', updatedAt: record.updatedAt, metadata: {event: source.event}};
}
