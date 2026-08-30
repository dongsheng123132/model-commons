import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const sources = JSON.parse(readFileSync(new URL('registry/sources.json', root))).sources;
const monitor = JSON.parse(readFileSync(new URL('site/data/monitor.json', root)));
const alerts = [];
for (const source of sources) {
  const observed = monitor.sources[source.id];
  if (!observed) continue;
  if (observed.failure_streak >= source.alert_after_failures) alerts.push({ id: source.id, type: 'source-unavailable', body: `${source.id} has failed ${observed.failure_streak} consecutive public checks. Last success: ${observed.last_success_at ?? 'never'}. Error: ${observed.error ?? 'unknown'}` });
  for (const [assertion, result] of Object.entries(observed.assertions ?? {})) if (result === 'absent') alerts.push({ id: source.id, type: `assertion-${assertion}`, body: `${source.id} no longer contains the monitored official assertion ${assertion}. This withholds recommendation; it does not prove an offer was cancelled.` });
}
process.stdout.write(JSON.stringify(alerts));
