# Feature, API and gap map

Backend inspected 2 October 2026; frontend status updated 6 October. Latest fetched main: `889ba548083ea67c8bd72b552a2bcf6d68cdf70b`.
Frontend conversations currently target `127ef70a1187273707dd7e19aa9a6c7e0dc61220`; original deterministic
fixtures target `9486600`. Code existence, connected acceptance and production readiness are separate statuses.

## Request boundary

`Browser → same-origin Next server → authenticated gateway → tenant-scoped store / worker / permitted model → validated response → UI`

Today the server uses one local operator key, never a key supplied by the browser. Production must verify a
human session and map it to the correct tenant, actor and role. Tenant IDs in client input are not authority.
The browser never picks a model or decides legal applicability. Research follow-ups do not imply inferred
company facts or conversational reasoning memory; each question needs its own relevant context.

## Supported work versus unfinished UI

| User job | Real backend operations | Frontend now | Gap / owner |
|---|---|---|---|
| Start, follow up, reopen | `conversation.list/get/send` | Local-only adapter and UI; offline tests pass | Founder: reconcile latest responses, connected persistence test, role/error UX. Teammate: reproducible local store + appropriate principal. |
| Inspect an answer's basis | `citation.get`, `runs.trace` | Citation re-check and trace panel | Founder: expose newly returned critic metadata; browser focus and stale-source acceptance. |
| Check supplied company facts | legacy `/v1/ask`, `/v1/compliance-pack`; `company_facts.extract` | Independent structured Ask; captured examples | Founder: confirmed-context UI. Extracted facts are supplied, not verified, and do not steer v2 research. No live MCA21 claim. |
| Sign in / invite / remove access | Actor/role/invite persistence; `gateway/roles.py`, `passwords.py` | No production identity/session UI | Founder builds frontend auth/session adapter after decision. Teammate confirms principal provisioning/revocation and missing server endpoints only. |
| Watch a durable run | `runs.submit/get/trace/cancel` | Message-owned bounded updates, trace and explicit uncertain-send recovery built; offline verification | Connected/mounted checks and Q-009 remain. True server cancellation is not implemented; Stop waiting aborts browser work only. |
| Attach/read a document | `documents.upload` | Local pasted/UTF-8 .txt preparation and unchanged snapshot at `/workspace/documents`; no upload | Founder: PDF/DOCX extraction/permission/integration. Backend upload records hash/size/name/reason, not text or durable storage; Q-010 proves upload→review content before attachment enablement. |
| Review corporate documents | `review_document`, `runs.approve/reject` | Server-only captured findings/evidence/basis examples built; not integrated | Founder: live quote/reason gate, roles and audit. PHASE_3_REVIEW_FINDINGS.md; Q-010 text path and Q-011 detector limitations remain. |
| Review a contract | `review_contract`, review decisions | Server-only captured draft-playbook comparison built; not integrated | PHASE_3_CONTRACT_FINDINGS.md; Founder: exact clause evidence/role/reason gate, approved company playbook, permitted processing. Q-012 quote/match-scope clarification. |
| Compare many documents | `review_table.create/status/cancel/export` | Server-only captured table/evidence/spend/CSV-text view built; not integrated | PHASE_4_REVIEW_TABLES.md; Founder: real context/load/role/processing/cancellation and safe download. Q-013 CSV safeguards/subtotal semantics, Q-014 persisted column/document context. |
| Draft/revise/export | `draft.create/revise/status/versions/diff/export` | Not integrated | Founder: verified support, blocking slots, version/diff, approval boundary, authenticated DOCX. Do not assume drafts must originate from a run unless the contract says so. |
| Browse available sources | `sources.list/search` | Answer-specific sources only | Founder: held/client/external scope and terms/refusal display. External listing is not permission to fetch. |
| See law changes | `/v1/company/{cin}/events`, instrument impact; `events.assess` | Older product surfaces; not canonical workspace | Founder: scope-correct integration. Legacy CIN does not filter events; no company-alert promise. |
| Portfolio / stored company matters | No verified profile/portfolio store contract in this handoff | Not built | Defer UI dependent on persistence; request a narrow backend contract only if pilot needs it. |
| Earlier-date check | No approved bounded provision/text coverage contract | Intentionally absent | Keep today-only. One contextual date only after tested coverage and point-in-time text exist. |
| Feedback / retention / deletion | No integrated end-user contract here | Limitations and Help/data; native unsent note, sending/deletion disabled | PHASE_5_PREPARATION.md; Q-005. Founder selects policy/destination; teammate implements narrowly specified backend gap, not generic infrastructure. Browser restoration is not secure erasure. |

## Exact integrated v2 calls

All browser operations go to POST `/api/workspace/conversations`; the server dispatches:

| Action | Upstream | Current request |
|---|---|---|
| List | POST `/v2/conversation/list` | `limit: "50"` |
| Reopen | GET `/v2/conversation/{conversation_id}` | UUID path only |
| Send | POST `/v2/conversation/send` | `text`, optional `conversation_id`, `task_override: "RESEARCH_QUESTION"` |
| Source | POST `/v2/citation` | `conversation_id`, `citation_id` |
| Trace | GET `/v2/runs/{run_id}/trace` | UUID path only |
| Run status | GET `/v2/runs/{run_id}` after originating thread read | Local conversation/message/run UUID correlation; projected id/status/refusal_code only; three user-started checks |

`citation.get` is **not** `/v2/citation/get`. Approval is POST `/v2/runs/approve/{run_id}`,
rejection `/v2/runs/reject/{run_id}`, cancellation `/v2/runs/cancel/{run_id}`. Do not guess REST paths from
screen names. The [29-verb input inventory](API_INPUT_INVENTORY.json) includes exact generated paths and
required inputs. It also records the separate GET binary downloads:
`/v2/drafts/{draft_id}/export.docx` and `/v2/review_tables/{grid_id}/export.csv`.

Phase 1 now requires a local `messageId` for source inspection and verifies the returned citation against
that stored reply. The upstream route still receives only conversation/citation IDs. Repeated c1 IDs across
replies can resolve to the first reply: the frontend rejects the mismatch (409, no quote) until Q-008 is fixed.
This is a safe guard, not proof that later citations can be inspected successfully.

## Latest backend changes to reconcile first

Since `127ef70`, backend main added a long-lived worker, failure categories, critic recording/citation pruning,
calibration records, `gateway/screens.py`, binary downloads, actor/invitation persistence and roles.
Roles are **viewer, lawyer, admin**, checked per verb. A default viewer principal cannot send conversations
or upload documents. Do not introduce extra owner/reviewer roles without a new agreed contract.

`screens.py` is useful checked mapping, not proof that a frontend screen exists. Its vault entry is explicitly
PLANNED. User persistence/password hashing does not establish a complete browser login/session/reset service;
those HTTP endpoints were not found in the inspected app mounting. Confirm the intended identity boundary
before implementing or asking for new endpoints. No latest-backend runtime suite was executed in this handoff.

The screen map's citation display names are stale versus the handler: actual response is nested `citation`,
`message_id`, `reverified`, `reverified_note`, `note`. Follow handler fields, not the prose/display map alone.
`documents.upload` does not establish durable extracted-text storage; keep attachments gated until that
contract is proven. See `docs/frontend-loop/PHASE_1_COMPATIBILITY.md` for the audit and guarded changes.

Calibration/nonconformity is not an accuracy percentage. Critic absent/null means not recorded, not disabled.
Cost null/UNPRICED is not ₹0. A refusal or missing evidence is not a network failure. Preserve these distinctions.

## Model and data policy

Backend code/configuration chooses deterministic versus model work and permitted deployment. Development
agents (Astra, Claude, etc.) are not automatically product inference providers. Use returned trace values;
never promise a provider, cost, region or confidence from frontend defaults. No client documents may be sent
to reviewers or paid inference in this development loop without an approved processing path and budget.

## Integration order

Follow the five phases in `docs/FIVE_PHASE_FRONTEND_LOOP_PROMPT.md`. Ask stays first. Identity and contract
reconciliation unblock connected acceptance; document review follows; tables/drafts are later gated slices.
Keep unsupported navigation absent or explicitly contextual, not a collection of fake active controls.
