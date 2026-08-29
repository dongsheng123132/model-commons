# Registry contract

`offers.json` is a public, evidence-first list of access offers, not a list of shared accounts.

Every entry needs an official evidence URL, a classification, a last-check date, and a recheck deadline. Credentials, invite codes, personal quotas, and claims that cannot be reproduced from public evidence do not belong here.

OpenRouter free models are intentionally represented by its `openrouter/free` router entry rather than copied one by one: the provider changes the available free models dynamically, and the site reads its public model directory for display.
