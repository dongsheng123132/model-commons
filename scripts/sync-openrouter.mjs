import { mkdirSync, writeFileSync } from 'node:fs';

const response = await fetch('https://openrouter.ai/api/v1/models', {
  headers: { 'user-agent': 'model-commons-public-monitor/1.0' },
});
if (!response.ok) throw new Error(`OpenRouter model directory returned ${response.status}`);
const payload = await response.json();
const models = (payload.data ?? [])
  .filter((model) => String(model.id).endsWith(':free'))
  .map(({ id, name, context_length }) => ({ id, name: name ?? id, context_length: context_length ?? null }))
  .sort((a, b) => a.id.localeCompare(b.id));

mkdirSync(new URL('../site/data/', import.meta.url), { recursive: true });
writeFileSync(new URL('../site/data/openrouter-free.json', import.meta.url), `${JSON.stringify({
  source: 'https://openrouter.ai/api/v1/models',
  fetched_at: new Date().toISOString(),
  count: models.length,
  models,
}, null, 2)}\n`);
console.log(`saved ${models.length} OpenRouter free-model records`);
