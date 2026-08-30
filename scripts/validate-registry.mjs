import { readFileSync } from 'node:fs';

const registry = JSON.parse(readFileSync(new URL('../registry/offers.json', import.meta.url)));
const sources = JSON.parse(readFileSync(new URL('../registry/sources.json', import.meta.url)));
const classes = new Set(['permanent_free_tier', 'promo_free', 'trial_credit', 'local_open_source', 'community_reported']);
const secret = /(?:sk-[A-Za-z0-9_-]{12,}|ghp_[A-Za-z0-9]{20,}|AIza[A-Za-z0-9_-]{20,}|Bearer\s+)/;
const fail = (message) => { console.error(`registry invalid: ${message}`); process.exitCode = 1; };
if (!registry || typeof registry !== 'object' || !Array.isArray(registry.offers)) fail('offers must be an array');
if (!Array.isArray(sources.sources)) fail('sources must be an array');
for (const source of sources.sources ?? []) {
  if (!source.id || !source.url || !source.official_domain) fail('every source needs id, url, and official_domain');
  try { if (new URL(source.url).hostname !== source.official_domain) fail(`${source.id}: URL hostname must match official_domain`); } catch { fail(`${source.id}: invalid URL`); }
}
if (secret.test(JSON.stringify(registry))) fail('registry must never contain an API key or bearer token');
for (const offer of registry.offers ?? []) {
  for (const field of ['id', 'provider', 'classification', 'status', 'checked_at', 'recheck_by']) if (!offer[field] || typeof offer[field] !== 'string') fail(`${offer.id ?? '<unknown>'}: missing ${field}`);
  if (!classes.has(offer.classification)) fail(`${offer.id}: unsupported classification`);
  if (!['verified', 'candidate', 'suspended', 'retired', 'community_reported'].includes(offer.status)) fail(`${offer.id}: unsupported status`);
  for (const item of [offer.signup_url, offer.dynamic_models_url, ...(offer.evidence ?? []).map((x) => x.url)]) if (item && !/^https:\/\//.test(item)) fail(`${offer.id}: URLs must use https`);
  if (!Array.isArray(offer.evidence) || offer.evidence.length === 0) fail(`${offer.id}: official evidence is required`);
  for (const sourceId of offer.monitor_source_ids ?? []) if (!sources.sources.some((source) => source.id === sourceId)) fail(`${offer.id}: unknown monitor source ${sourceId}`);
}
if (!process.exitCode) console.log(`registry valid: ${registry.offers.length} offers`);
