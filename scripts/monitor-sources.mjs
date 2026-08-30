import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const sources = JSON.parse(readFileSync(new URL('registry/sources.json', root))).sources;
const monitorUrl = new URL('site/data/monitor.json', root);
const prior = (() => { try { return JSON.parse(readFileSync(monitorUrl)); } catch { return { sources: {} }; } })();
const now = new Date().toISOString();
const normalizedText = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const digest = (value) => createHash('sha256').update(value).digest('hex');
const fetchPublic = async (url) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { 'user-agent': 'model-commons-observer/1.0 (+https://github.com/dongsheng123132/model-commons)' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response;
};

const observations = {};
for (const source of sources) {
  const old = prior.sources?.[source.id] ?? {};
  try {
    const response = await fetchPublic(source.url);
    if (source.kind === 'openrouter_models_api') {
      const data = await response.json();
      const models = (data.data ?? []).filter((model) => String(model.id).endsWith(':free'))
        .map(({ id, name, context_length }) => ({ id, name: name ?? id, context_length: context_length ?? null }))
        .sort((a, b) => a.id.localeCompare(b.id));
      mkdirSync(new URL('site/data/', root), { recursive: true });
      writeFileSync(new URL('site/data/openrouter-free.json', root), `${JSON.stringify({ source: source.url, fetched_at: now, count: models.length, models }, null, 2)}\n`);
      observations[source.id] = { status: 'ok', last_attempt_at: now, last_success_at: now, http_status: response.status, content_sha256: digest(JSON.stringify(models)), failure_streak: 0, item_count: models.length };
    } else {
      const text = normalizedText(await response.text());
      const assertions = Object.fromEntries((source.assertions ?? []).map((rule) => [rule.id, new RegExp(rule.pattern, 'i').test(text) ? 'present' : 'absent']));
      observations[source.id] = { status: 'ok', last_attempt_at: now, last_success_at: now, http_status: response.status, content_sha256: digest(text), failure_streak: 0, assertions };
    }
  } catch (error) {
    observations[source.id] = { status: 'unavailable', last_attempt_at: now, last_success_at: old.last_success_at ?? null, http_status: null, content_sha256: old.content_sha256 ?? null, failure_streak: (old.failure_streak ?? 0) + 1, error: String(error.message ?? error).slice(0, 180) };
  }
}
mkdirSync(new URL('site/data/', root), { recursive: true });
writeFileSync(monitorUrl, `${JSON.stringify({ schema: 'model-commons.monitor/v1', generated_at: now, sources: observations }, null, 2)}\n`);
console.log(`observed ${Object.keys(observations).length} public sources`);
