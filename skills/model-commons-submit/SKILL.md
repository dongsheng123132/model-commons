---
name: model-commons-submit
description: Submit or verify evidence for free, trial, local, or low-cost AI model supply in the Model Commons GitHub registry. Use for candidate offers, expiry reports, regional compatibility reports, and provider corrections; never use for keys, account sharing, or bypasses.
---

# Model Commons submission

Submit a claim as evidence, never as a promise of free access.

## Before submitting

- Prefer the provider's pricing, promotion, API, terms, or status page.
- Classify exactly one of: `permanent_free_tier`, `promo_free`, `trial_credit`, `subscription_bonus`, `low_cost`, `local_open_source`, `retired`.
- State account, card, region, commercial-use, and automatic-charge conditions as `confirmed`, `unknown`, or `not_applicable`.
- Do not include secrets, cookies, OAuth redirects, user prompts, full responses, or private account screenshots.

## Submit

Open a Candidate issue or add a record under `registry/`. Include the official URL, observation date, protocol, model IDs if official, and a short reproduction using a user-owned key only.

AI may summarize sources, detect stale evidence, and draft an issue or PR. AI must not label an entry `verified`, approve its own PR, or infer a free tier from a successful call alone.

## Verification and failure reports

For a failed offer, include only provider, country/region at coarse level, client, timestamp, HTTP status/error class, and whether a user-owned key was used. Report suspected phishing or hidden billing as a risk issue immediately.
