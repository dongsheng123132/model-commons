import { readFileSync } from 'node:fs';

const registry = JSON.parse(readFileSync(new URL('../registry/offers.json', import.meta.url)));
const stale = registry.offers.filter((offer) => offer.status !== 'retired' && Date.parse(offer.recheck_by) <= Date.now());
if (stale.length) {
  console.log('以下公开条目已过复核期限，请不要将它们视为当前可用，直到有人用官方证据复核：\n');
  for (const offer of stale) console.log(`- ${offer.id}：复核期限 ${offer.recheck_by}，证据 ${offer.evidence[0]?.url ?? '缺失'}`);
  console.log('\n自动监控只发现过期，不会自动续期或改变可信状态。');
}
