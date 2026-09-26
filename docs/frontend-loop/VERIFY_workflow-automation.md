# Verification — workflow automation and prompt reduction

Date: 27 September 2026

Risk: R2 because the change corrects the frontend/backend contract authority as well as developer tooling.

## Checks

- `npm run loop:validate` — PASS.
- `npm run test:loop` — PASS, 8 assertions.
- `npm run typecheck` — PASS.
- `npm run lint` — PASS.
- `npm run test:contracts` — PASS, 38 assertions; no external requests.
- `npm run build` — PASS, Next.js 16.3.4, 22 routes. The sandboxed build stalled at worker creation;
  the same command completed outside the sandbox.
- `npm run performance:budget` — PASS, 16 client chunks and 266,179 gzip bytes against the 409,600-byte
  aggregate limit; no chunk exceeded 81,920 bytes gzip.
- `git diff --check` — PASS after removing Markdown trailing whitespace.

## Contract evidence

Backend commit `9486600`, `checker/api.py:8-15` and `checker/api.py:655-661`, lists eight routes including
`POST /v1/ask` and `POST /v1/mca-strip`. This corrects the stale six-route and Ask-denial statements formerly
present in frontend `AGENTS.md`.

## Prompt-size result

The two always-loaded prompts changed from 7,371 words to 3,263 words, a 55.73% reduction. Detailed runner,
fixture and quality rules are now loaded only for relevant moves. A normalised duplicate-line scan found no
repeated long-form lines between the two active prompts.

## Not exercised

No external agent CLI was configured, so real provider dispatch was not run. The adapter-independent routing,
prompt rendering, config validation and output contract are covered by local tests. Application UI and browser
screens did not change, so responsive visual checks are not applicable to this move.
