# Model Commons / 模型公社

An evidence-first public registry for free, trial, local, and low-cost AI model supply.

This is not a token pool. Users obtain and keep their own provider credentials.

## What belongs here

- Officially documented offers, pricing, protocols, regions, and limits
- Community reports with source links and expiry dates
- Compatibility recipes for local tools such as Pi, Claude Code, Codex, and OpenCode

## What never belongs here

- API keys, cookies, accounts, shared credentials, referral secrets, or bypasses
- Claims of permanent free access without first-party evidence

## Schema

`scripts/validate-registry.mjs` is the only authority for accepted values: CI rejects any `classification` or `status` it does not list, so this section, the issue forms, and [the submission skill](skills/model-commons-submit/SKILL.md) must mirror it.

### Trust states

`status` says how much the evidence is trusted. A `stale` entry is what the unattended monitor reports once its deadline passes; `disputed` is the quarantine state that keeps the evidence instead of deleting it.

- `candidate` → submitted with an official URL; not reviewed by two maintainers yet
- `community_reported` → a community report exists; not promoted yet
- `verified` → first-party evidence reviewed and approved by two maintainers
- `stale` → the recheck deadline (`recheck_by`) has passed; treat the entry as unverified until it is re-evidenced
- `disputed` → quarantined after a credible contradiction or a vendor correction; the entry and its evidence stay in the registry instead of being deleted
- `suspended` → withheld pending review, for example a provider pause or an unresolved failure report
- `retired` → no longer offered; kept for history and excluded from the overdue report

### Offer classes

`classification` says what kind of supply the entry describes:

- `permanent_free_tier`, `promo_free`, `trial_credit`, `subscription_bonus` (a paid plan perk), `low_cost` (paid but cheap, not free), `local_open_source`, `community_reported` (a report without a first-party offer page)

## Contribute

Use the repository issue forms for a candidate, verification report, or risk report. AI agents should follow [the submission skill](skills/model-commons-submit/SKILL.md). Every claim must be traceable to a first-party URL.

## Unattended public-source monitor

GitHub Actions monitors the whitelist in [`registry/sources.json`](registry/sources.json) every six hours. It currently holds six sources:

1. `openrouter-free-models` — OpenRouter's public model directory, including its `:free` models
2. `bai-promotions-en` — B.AI's promotions and pricing notices
3. `bai-api-docs-en` — B.AI's API and protocol documentation
4. `gemini-pricing-en` — Google Gemini API pricing and free tier
5. `groq-free-plan-limits` — Groq's free-plan rate limits
6. `opencode-zen-free-models` — OpenCode Zen's free-model documentation

Every run publishes a small observation snapshot and keeps one open Issue per repeated source failure or missing monitored assertion. It also keeps the single `registry-stale` issue in sync with the entries whose recheck deadline has passed: an existing Issue gets its body rewritten on each run (latest overdue list plus timestamp), and it is closed once nothing is overdue. The monitor never marks an offer as verified, renews a deadline, applies for a credential, or handles user traffic; those decisions require public evidence and review.
