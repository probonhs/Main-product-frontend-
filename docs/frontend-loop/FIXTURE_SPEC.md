# Backend fixture provenance specification

Fixtures are captured evidence, not hand-written demonstrations. They live under `fixtures/engine/` and are
versioned with the frontend. A milestone that needs a state remains blocked until the required response is
captured from backend code at a named commit.

Each fixture is a JSON envelope:

```json
{
  "schema_version": 1,
  "fixture_id": "ask-partial-missing-board-meeting-count",
  "captured_at": "2026-09-27T00:00:00Z",
  "backend_commit": "full-40-character-commit",
  "route": "POST /v1/ask",
  "request": {},
  "response_status": 200,
  "response": {},
  "request_sha256": "sha256-of-canonical-request",
  "response_sha256": "sha256-of-canonical-response",
  "contains_personal_data": false,
  "sanitisation": [],
  "capture_command": "exact command used",
  "verified_by": "test or reviewer record"
}
```

Rules:

1. Use deterministic synthetic companies and documents. Never commit client, pilot or production content.
2. Capture through the real route handler or HTTP route; do not reproduce expected output by hand.
3. Preserve nulls, enum values, citations, dates, response status and error bodies exactly.
4. Canonicalise JSON with sorted keys before hashing. Hashes prove accidental drift, not legal correctness.
5. Record the full backend commit and capture command. A backend-commit change marks affected fixtures stale
   until contract comparison shows they remain valid.
6. Redaction is allowed only before commit and must be listed in `sanitisation`. If redaction changes a field
   under test, generate a new synthetic input and recapture instead.
7. Validation rejects missing provenance, malformed hashes, unknown route names and personal-data declarations
   other than `false`.
8. Fixture consumers unwrap `response`; they must not convert unknown, null, errors or abstentions into success.

Required initial scenarios are answered, partial, abstained/not-held where the backend can actually return
them, service error, compliance-pack unresolved dependency, document current/outdated/unknown and instrument
impact. If the backend cannot produce a named state, record `UNSUPPORTED` in the truth map instead of creating
the fixture.
