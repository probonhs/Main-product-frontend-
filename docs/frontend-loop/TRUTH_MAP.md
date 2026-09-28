# Engine truth map and captured fixtures

Verified against clean backend `948660041b73e610e017b2036ab97848efe7a26e` on 27 September 2026.
Backend path: `/Users/abdulazeez/Desktop/Placedon-workspace/backend`. All source references below refer to
that commit. Captures call `checker.api.handle` with fixed `generated_at=2026-09-27T00:00:00Z` under Python
3.12, with the backend as working directory so corpus and provenance readers resolve correctly.
Only synthetic requests from `scripts/assistant_contract.py:69` and explicit synthetic route inputs are used.
No client, pilot or production data is included. Dates named `as_of` are adapted to `2026-09-27`; document
and incorporation dates are preserved. Capturing a fixture does not validate the law or authorise live use.

## Reproduction and envelope contract

From the frontend repository root:

```sh
/Users/abdulazeez/.local/share/uv/python/cpython-3.12-macos-aarch64-none/bin/python3.12 scripts/capture-engine-fixtures.py
/Users/abdulazeez/.local/share/uv/python/cpython-3.12-macos-aarch64-none/bin/python3.12 scripts/capture-engine-fixtures.py --check
node tests/engine-fixtures.mjs
```

The generator refuses a different backend commit or tracked/untracked dirt before and after capture.
Backend bytecode writes are disabled. Exceptions propagate; unexpected HTTP status, Ask state or Ask validator
failure aborts before fixture writes. `--check` reproduces all responses and compares the exact bytes and
inventory without writing. No HTTP server, network or model is required. The Node verifier uses only built-ins
and committed files; it has no backend dependency. Its printed assertion count increments only after an
assertion passes, including each nested Ask forbidden-field check.

Envelopes follow [FIXTURE_SPEC.md](FIXTURE_SPEC.md): `schema_version`, `fixture_id`, `captured_at`, full
`backend_commit`, concrete `route`, `request`, `response_status`, `response`, both SHA256 hashes,
`contains_personal_data:false`, `sanitisation:[]`, `capture_command`, `verified_by`.
`request` is `{method, path, body}`; GET bodies are null and query parameters remain in `path`. The `route`
field omits the query. Hash the complete request object and the response body separately, not the envelope or
HTTP status. The fixed capture time equals the fixed generation time; it is not a claim about wall-clock execution.
`verified_by` identifies the verification methods; rerun them to establish verification in another checkout.

Canonical hash input is JSON with recursively sorted object keys, preserved array order, no whitespace and
ASCII escaping (`json.dumps(sort_keys=True, ensure_ascii=True, allow_nan=False, separators=(",", ":"))`).
Encode those bytes as ASCII and SHA256 them. Node matches Python Unicode code-point key ordering and lowercase
`\uXXXX` escapes, including surrogate pairs and DEL. Current fixtures contain only safe integer JSON numbers;
the Node canonical encoder refuses fractions, unsafe integers and negative zero instead of hashing rounded
values. Hashes detect drift, not legal correctness. Consumers unwrap `response` only after checking status.

## Captured inventory

| Fixture | Actual HTTP / state | Request basis and meaning |
|---|---|---|
| `ask-answered` | 200 / `answered` | `answered_small_company`; supplied facts, named Section 2(85), named capital/turnover figures. Decided row is `DOES_NOT_APPLY`, not a compliance pass. |
| `ask-resident-evidence` | 200 / `answered` | Section 149(3), synthetic resident-day and dated-meeting evidence; preserves nested `facts.evidence.value` rather than treating it as a scalar. |
| `ask-partial` | 200 / `partial` | `partial_s173_s16`; confirmed text plus unresolved items. |
| `ask-abstained` | 200 / `partial` | `partial_nothing_confirmed`; Rule 2(1)(t) is unresolved, `confirmed:[]`. This filename is a display scenario, not an engine enum. |
| `ask-not-held` | 200 / `out_of_scope` | `out_of_scope_fema`; register refusal for law not held. |
| `ask-document` | 200 / `partial` | `document_context_2024`; original document date, adapted read date, superseded/confirmed/unresolved scope. |
| `ask-invalid` | 400 / no state | Empty question; actual `bad_request` response, not an abstention or service outage. |
| `compliance-pack` | 200 / row states | Answered scenario's supplied profile; all returned duties and unresolved dependencies preserved. |
| `document-check` | 200 / three buckets | Document scenario's facts; real verified, superseded and cannot-verify entries in one response. |
| `events` | 200 / event classes | Synthetic CIN and explicit read date; global law events, no company filtering. |
| `instrument-impact` | 200 / obligations | Instrument fragment `880`; actual affected obligation identifiers. |
| `health` | 200 / `ok` | Actual version/provenance fields from the pinned checkout. |
| `mca-strip` | 200 / no check ran | Only read date; no parties/registers. Empty chips/findings with three `not_run` reasons, not registry clearance. |

Successful Ask fixtures also pass the backend's `checker.ask_contract.validate`. The offline verifier checks
envelope inventory/provenance/hashes, actual Ask states, citations against evidence-pack keys, figure intervals,
row enum/summary agreement, document bucket counts, text-basis boundaries and route-specific scope fields.
It is a focused fixture verifier, not a replacement for the full backend validator or application UI tests.

## Route and field truth

Eight routes are dispatched by `checker/api.py:572`; the exhaustive route list is at `:653`.

| Route | Input / response truth | Source |
|---|---|---|
| GET `/v1/health` | Status, `no_model`, versions; provenance failure substitutes `provenance_error`. | `api.py:611` |
| POST `/v1/ask` | Only question/context/facts/provisions/figures/as_of/parent_turn_id; unknown keys rejected. `placedon.ask/0`, three states, `uses_model:false`. Output validation failure is HTTP 500 `contract_violation` with no legal state. | `ask.py:65`, `:312`; `api.py:621` |
| POST `/v1/compliance-pack` | Required class, incorporation date, read date; optional profile/evidence. Monetary facts require FY. Rows, summary, unverified, currency watch, provenance, boundaries; no `no_model`. | `api.py:70`, `:103`, `:209` |
| POST `/v1/document-check` | Structured profile facts and document date, optional read date; not a file/upload. Summary, superseded/cannot_verify/verified, `coverage`, boundaries, `no_model`. | `api.py:340`, `:466` |
| GET `/v1/company/{cin}/events` | as_of/since/kind/class filters. CIN echoed, never filters; `kind=company` returns empty. Global scope and `no_model`. | `api.py:276` |
| GET `/v1/company/{cin}/events/{event_id}` | Optional as_of/since; event, CIN, timestamps, `no_model`. Unknown event is 404 without `routes`; no list scope field. Not separately captured here. | `api.py:580` |
| GET `/v1/instruments/{fragment}/affected` | Fragment, generation time, affected identifiers, `no_model`; no read date. | `api.py:600` |
| POST `/v1/mca-strip` | Caller supplies parties/registers/document facts. No corporate-data aggregator. Chips/findings/subjects/not_run, evidence grade and boundaries. | `api.py:485`, `:510`, `:568` |

Evidence accepted by HTTP is exactly the eight fields in `api.py:168`: AGM dates, financial-year end, board
meetings, calendar year, AOC-4 filing date, annual-return filing date, resident-director days, first FY end.
The richer internal `obligations.Evidence` transaction/graph fields are not exposed by this API.
Absent evidence is unknown; empty lists mean supplied evidence of none (`obligations.py:62`).

## Ask state-to-display mapping

Use the returned `state`; do not infer answered from usable text or convert failures to a legal state.

| Wire state | Display | What must remain visible |
|---|---|---|
| `answered` | Answered | Deterministic rows/figures and actual citations/boundaries. Answered does not imply satisfied. Figure-only answers may omit citations, evidence pack and law version. |
| `partial` with confirmed text, decided rows or figures | Abstained in part | Every `not_confirmed` reason beside established evidence; source text does not establish applicability. |
| `partial` with no confirmed/decided content | Abstained | Unresolved items and what was not reached. No fourth wire state is introduced. |
| `out_of_scope` | Not held — law/source not held | Register `reason`, `body` metadata and held scope; never imply a meeting was not held. |
| Non-200 / exception | Technical/validation error | Actual status/error/detail or transport failure. No legal-state chip. |

General `confirmed` entries are citation records plus `verbatim`; document `confirmed` entries are verified
obligation rows. Document turns also carry `superseded`, `scope_frame`, and `law_version`; do not assume the
general citation shape. Mixed held/unheld questions can return partial. Unknown enums are errors.
Sources: `ask.py:122`, `:184`, `:217`, `:238`, `:269`, `:419`; `ask_contract.py:13`, `:102`.

Obligation states remain separate: satisfied / not satisfied / applies-information-needed / does-not-apply /
cannot-determine (`obligations.py:46`). The last two unresolved states, `APPLIES_UNDETERMINED` and
`CANNOT_DETERMINE`, never become false, zero or a negative applicability finding.

## Citations, figures, dates and provenance

Ask citations carry `ref`, `cite`, `title`, `evidence_state`, `usable_for_answering`, nullable
`unusable_reason`, `defects`, `retrieved_on[]`, nullable `source_url`; partial general confirmations add
`verbatim`. They do not carry SHA256 or operative dates (`ask_read.py:29`). Pack row `cited_spans` separately
carry `path`, `sha256`, `resolved` (`api.py:194`); do not pretend these are source URLs.

Figures carry `key`, display `amount`, numeric `rupees`, `instrument`, `effective_from`, nullable
`effective_to`, `evidence_state`, `source_url` (`ask_read.py:69`). Their dated threshold lookup does not
establish historical section text. An unavailable threshold is unresolved, not replaced by a statutory floor.

`generated_at` is generation time (server UTC); `as_of` is requested/default read date. Defaults use the day
of generation; pack requires explicit read date (`serve_api.py:32`, `ask.py:368`, `api.py:111`).
`law_version` records `basis`, `point_in_time_verified`, `corpus_fetched`, `statement`; document Ask also
records `point_in_time_requested` (`ask_read.py:41`). Section text is current consolidation as ingested,
`point_in_time_verified:false` (`evidence_pack.py:352`). Display this boundary even on an answered turn.
Earlier-date controls remain unavailable until bounded provision-level historical coverage exists.

Ask forbids recursive `confidence` and `coverage`; document scope instead uses `scope_frame`. Citation and
confirmed section-text `effective_from` is forbidden (`ask_contract.py:18`, `:83`, `:111`). General turns
have no stages; these captures contain no stages on either path. `parent_turn_id` is supplied/echoed linkage,
not conversation memory. Stable turn IDs exclude facts/provisions/figures and are unsafe unique cache keys
(`ask.py:102`, `:392`).

## Unsupported and remaining work

- `UNSUPPORTED`: distinct wire `abstained`; the fixture is empty-confirmed partial.
- `UNSUPPORTED` for deterministic natural capture here: service outage/500 fixture. The dispatcher can
  withhold invalid Ask output as 500, but this clean capture has no natural failing scenario. No exception is
  injected or committed as fabricated response evidence. Technical failure testing remains separate work.
- Portfolio persistence, company standing, saved matters, alerts and company-specific event monitoring have no
  routes. Stateless per-profile packs cannot establish a stored multi-company docket.
- Feedback submission/storage/consent has no route. `demand_signal.action=tell_us_blocking` is a response hint,
  not a working sink (`ask.py:233`).
- Authentication, roles and tenancy have no API contract. The server binds loopback and is unauthenticated;
  response headers do not provide CORS (`serve_api.py:8`, `:24`, `:35`). A frontend token option does not prove
  backend authentication.
- Past dates cannot establish historical section wording or bounded historical coverage. Keep the product
  today-only under the recorded date decision.
- MCA fixture proves the no-input boundary only. No live registry fetching, party resolution success or
  capital reconciliation is demonstrated. Secondary registry evidence is not primary proof or warranty clearance.
- Baseline frontend `types.ts:3` and `provider.ts:26` had six routes and denied Ask; `mock.ts:278` ignored
  inputs with fixed provenance. The main agent owns Ask/provider/UI integration separately. No such files
  are changed by this bounded capture work; fixture verification does not certify that integration.
