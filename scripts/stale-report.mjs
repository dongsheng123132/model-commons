import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const DAY_MS = 86_400_000;

// Links the issue body back to the workflow run that produced it, when running in Actions.
export const runUrlFromEnv = (env = process.env) => (env.GITHUB_RUN_ID && env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY
  ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
  : undefined);

// An entry is overdue when its recheck deadline has passed and it was not retired.
export const overdueOffers = (offers, now = Date.now()) => (offers ?? []).filter((offer) => offer.status !== 'retired' && Date.parse(offer.recheck_by) <= now);

// Body of the single `registry-stale` issue. Returns '' when nothing is overdue so the
// caller can close the issue instead of leaving a stale body behind.
export const buildStaleReport = (offers, { now = new Date(), runUrl } = {}) => {
  const stale = overdueOffers(offers, now.getTime());
  if (!stale.length) return '';
  const daysOverdue = (offer) => Math.max(0, Math.floor((now.getTime() - Date.parse(offer.recheck_by)) / DAY_MS));
  return [
    '以下公开条目已过复核期限，请不要将它们视为当前可用，直到有人用官方证据复核：',
    '',
    ...stale.map((offer) => `- \`${offer.id}\`：复核期限 ${offer.recheck_by}（已逾期 ${daysOverdue(offer)} 天），证据 ${offer.evidence?.[0]?.url ?? '缺失'}`),
    '',
    `逾期 **${stale.length} / ${offers.length}** 条；正文刷新时间 ${now.toISOString()}${runUrl ? `（[运行记录](${runUrl})）` : ''}。`,
    '',
    '自动监控只发现过期，不会自动续期或改变可信状态；续期需要有人用官方证据复核后提交 PR。本清单每次由 `registry/offers.json` 重新生成，请勿手工追加。',
    '',
  ].join('\n');
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const registry = JSON.parse(readFileSync(new URL('../registry/offers.json', import.meta.url)));
  const report = buildStaleReport(registry.offers, { runUrl: runUrlFromEnv() });
  if (report) process.stdout.write(report);
}
