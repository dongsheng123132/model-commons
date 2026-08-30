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

## Trust states

`verified` → reviewed evidence; `community_reported` → not yet promoted; `stale` → recheck overdue; `retired` → no longer offered; `disputed` → quarantined.

## Contribute

Use the repository issue forms for a candidate, verification report, or risk report. AI agents should follow [the submission skill](skills/model-commons-submit/SKILL.md). Every claim must be traceable to a first-party URL.

## Unattended public-source monitor

GitHub Actions monitors a whitelist of official public sources every six hours: OpenRouter's `:free` model directory, B.AI's promotions page, and B.AI's pricing/protocol documentation. It publishes a small observation snapshot and creates a source-specific Issue for repeated source failure or a missing monitored assertion. It also opens one `registry-stale` issue when an entry passes its recheck deadline. The monitor never marks an offer as verified, renews a deadline, applies for a credential, or handles user traffic; those decisions require public evidence and review.
