// Builds the exact issue payloads the unattended monitor applies, so the workflow
// shell only has to call `gh issue edit` / `gh issue create` (see .github/scripts/upsert-issues.sh).
//
// usage: node scripts/monitor-issues.mjs [sources|registry|all]
//   sources  -> one source-monitor issue per repeated failure / missing assertion
//   registry -> the single registry-stale issue, or a close instruction when nothing is overdue
import { readFileSync } from 'node:fs';

import { buildAlerts } from './monitor-alerts.mjs';
import { buildStaleReport, runUrlFromEnv } from './stale-report.mjs';

const root = new URL('../', import.meta.url);
const readJson = (path) => JSON.parse(readFileSync(new URL(path, root)));
const STALE_TITLE = 'Registry recheck overdue';

const now = new Date();
const runUrl = runUrlFromEnv();
const footer = `\n---\n_由 unattended monitor 生成；正文刷新时间 ${now.toISOString()}${runUrl ? `（[运行记录](${runUrl})）` : ''}。每次运行都会覆盖本正文，请勿手工编辑；判断仍需要人工用官方证据复核。_\n`;
const sourcePayloads = () => buildAlerts(readJson('registry/sources.json').sources, readJson('site/data/monitor.json')).map((alert) => ({
  action: 'upsert',
  label: 'source-monitor',
  title: `[monitor:${alert.id}:${alert.type}] official source needs review`,
  body: `${alert.body}${footer}`,
}));
const registryPayloads = () => {
  const offers = readJson('registry/offers.json').offers;
  const report = buildStaleReport(offers, { now, runUrl });
  if (report) return [{ action: 'upsert', label: 'registry-stale', title: STALE_TITLE, body: report }];
  return [{
    action: 'close',
    label: 'registry-stale',
    title: STALE_TITLE,
    comment: `registry/offers.json 里已经没有逾期条目（本次检查 ${now.toISOString()}，0 / ${offers.length} 条逾期），自动关闭此 issue；再有条目逾期会重新创建。`,
  }];
};

const scope = process.argv[2] ?? 'all';
if (!['all', 'sources', 'registry'].includes(scope)) {
  console.error(`unknown scope ${scope}; expected sources, registry, or all`);
  process.exit(2);
}
const payloads = [];
if (scope !== 'registry') payloads.push(...sourcePayloads());
if (scope !== 'sources') payloads.push(...registryPayloads());
process.stdout.write(`${JSON.stringify(payloads, null, 2)}\n`);
console.error(`monitor-issues: ${payloads.length} payload(s), scope ${scope}`);
