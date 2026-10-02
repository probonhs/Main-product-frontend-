# Ask conversation slice — 2 October 2026

User approved the sequence: Ask → inspect evidence → follow up → reopen conversation.
The approved cream workspace, official logo, black controls and brand fonts remain the visual direction.

## Implemented

- `/workspace/conversations`: server-owned conversation list and ordered messages, explicit follow-up
  composer, preserved unsent text, read-only refresh after an uncertain send, and stop-waiting behaviour.
- Same-origin server endpoint validates every operation and the backend's versioned answer envelope.
- Sources are fetched through `citation.get`, which re-verifies the passage against the held corpus.
  A failed re-check hides the passage and identifies the failure; stored prose is not silently changed.
- Copy includes answer status, legal date, body boundaries, citations and source retrieval details.
- Run details preserve unknown model, region and cost; null cost is never displayed as zero.
- No browser storage or question/document text in URLs. Only opaque conversation identifiers are routed.
- When a local authenticated gateway is configured, the main Ask entry uses this conversation flow.
  Captured examples and the independent company-fact check remain accessible.

## Inspected backend

Reference: `origin/main` at `127ef70a1187273707dd7e19aa9a6c7e0dc61220`.
Read `gateway/verbs.py`, `gateway/store.py`, `gateway/auth.py`, `gateway/app.py` and
`gateway/schemas/answer_envelope.v1.json` from that revision.

Actual routes derived by `rest_path`:

| Operation | Route |
|---|---|
| List | POST `/v2/conversation/list` |
| Reopen | GET `/v2/conversation/{conversation_id}` |
| Send | POST `/v2/conversation/send` |
| Inspect source | POST `/v2/citation` |
| Run trace | GET `/v2/runs/{run_id}/trace` |

Send names `RESEARCH_QUESTION`; it cannot silently dispatch a draft, contract review or other write task.
The research route does not infer company facts from previous messages. The UI states this beside the
composer. Company facts are not presented as applied when they are merely recorded by the newer route.

## Operational boundary

Requires `GATEWAY_URL` (loopback) and `PLACEDON_GATEWAY_KEY` in development, with a compatible backend
and its configured conversation store. The credential stays server-side. This is a single configured local
operator/tenant, not production identity. Production and non-loopback requests fail closed.

No credentials were created, no backend was modified, and no paid model request or client text was sent.
Attachments remain unavailable on this research slice; the interface identifies that boundary.

## Verification

TypeScript, ESLint and the complete contract suite passed, including existing captured-Ask render tests.
Production build passed with `next build --webpack` (27 routes). The default Turbopack build stalled at
compilation without diagnostics and was stopped; the fallback compiled in 7.1 seconds.
Client-size budget passed (49 chunks, 399,026 bytes gzip total). The development server binds to
`127.0.0.1:3300`; the conversation page returned successfully with its honest unconfigured state.
New checks cover unknown states, missing citation links, thread ownership, duplicate message ordinals,
failed-result semantics, unreadable-file reasons, local/production gates, cross-origin refusal, real gateway
path selection, unknown inputs, schema mismatches and credential redaction.

Live end-to-end operation and connected browser acceptance remain pending gateway configuration.
Do not mark those gates passed from the offline tests. Production identity and deployment remain Q-001/Q-006.

Phase 1 follow-up: `PHASE_1_COMPATIBILITY.md` adds typed auth/role/errors, latest critic trace fields and
request correlation. Source inspection now includes originating message ID locally and rejects wrong-reply
citations; backend c1 collisions still require Q-008. This updates the original slice without claiming live GO.
