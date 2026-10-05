# Open questions and decisions needed

Items need evidence or a human choice. Continue independent work; do not answer these silently in code.

Founder sequencing D-013 (3 October): sign-in decision, live connections and remaining accessibility/error
acceptance are deferred until after the main frontend build/five phase commits. Q-001/Q-007/Q-008 remain
open for integration/release, not reasons to stop independent frontend implementation. No gates are waived.

| ID | Question | Owner | Blocks | Current fact / next evidence |
|---|---|---|---|---|
| Q-001 | Which human login/session method and principal provisioning/revocation mapping will we use? | Founder decision; teammate contract support | Production multi-user access | Backend `889ba54` has actors/invites and viewer/lawyer/admin checks. Confirm missing HTTP/session boundary; do not rebuild existing roles. |
| Q-002 | Which real practitioners and first organisation enter the pilot? | Founder | Practitioner acceptance | Simulated personas do not count; named participants needed. |
| Q-003 | What approved public statement describes model use and permitted client-data processing? | Founder/legal | Trust copy and real document processing | Use backend trace/configuration; no invented provider, region or confidence. |
| Q-004 | When will bounded historical provision/text coverage exist? | Backend | Earlier-date control only | Today-only remains default; requires tested coverage and point-in-time text. |
| Q-005 | What feedback destination, consent and retention/deletion policy are approved? | Founder; narrow backend support | Real feedback and privacy controls | No integrated sink/deletion service here; choose minimum pilot policy. |
| Q-006 | Which product deployment project/domain/owner and rollback process will we use? | Founder/engineering | Production release | Separate from website Vercel; immutable revision and founder approval. |
| Q-007 | Is connected synthetic local setup available at the pinned latest backend SHA? | Teammate | Live v2 acceptance | Store/worker/migrations, lawyer/admin test principal, private credential delivery. |
| Q-008 | Can citation lookup select the originating message when IDs repeat? | Teammate, narrow fix | Later colliding source inspection | Current handler returns first c1; frontend rejects wrong reply. Add message-scoped lookup + regression and correct stale screen fields. |
| Q-009 | What durable idempotency/recovery contract identifies a conversation submission after its response is lost? | Teammate contract clarification | Post-build duplicate-send acceptance | No client-generated submission key is verified in inspected send handler. Frontend pauses/refreshes/requires explicit acknowledgment, but this is page-memory only and not a duplicate-prevention guarantee across reload or unknown returned identity. |
| Q-010 | What proven upload→review text and retention contract will attachments use? | Teammate, narrow contract/fix; founder processing permission | Connected attachments/review, not local preparation | At 889ba54 upload stores hash/size/name/reason in memory, not text; _task_args looks for document.text then falls back to conversation text. Prove exact extracted text reaches the chosen review across required persistence boundaries; do not treat a READ file panel as that proof. |
| Q-011 | Can corporate pattern checks distinguish negative statements and incomplete evidence? | Teammate, narrow detector review | Pilot reliance on corporate checks, not captured frontend examples | Captured pinned889ba54 negative-quorum specimen returns C.quorum PASS for “quorum being absent”. Frontend preserves output and states detector limits; it does not fix the detector. Require a backend regression/clarification before reliance or approval enablement. PHASE_3_REVIEW_FINDINGS.md. |

Q-012 — Contract evidence and match scope: backend owner should confirm a real item-bound extracted quote
path before approval integration. At889ba54 review_contract findings do not serve extracted spans; absence
rules can MATCH on omitted extraction, and jurisdiction matches a fixed city list, not company presence.
Frontend qualifiers preserve these boundaries; Q-010 alone does not resolve them. Blocks live contract
decision/reliance, not captured standards UI. Request a narrow clarification/regression, not a backend rewrite.

Git workflow scope is an operational access condition, not a product decision. Record the actual push
failure if it occurs; never drop workflow history or claim remote publication from a local commit.

Q-013 — CSV/spending boundary before download: pinned889ba54 guard misses leading-space headers/names and
BOM-prefixed values (committed harmless adversary). Embedded CR also breaks rows under system Python3.9.6,
not bundled3.12.14; prove exact production/runtime download bytes, matrix identity and formula safeguards.
No spreadsheet execution tested. CSV lacks evidence and cancellation context. Rounded cost totals are not
strict lower bounds and unpriced/pending work need not add a bill. Frontend shows priced subtotal, does not
rewrite backend outputs or enable downloads. Owner: teammate narrow export/cost clarification/regressions,
founder download/integration/review UX. Blocks safe live downloads, not captured text inspection.

Q-014 — Reopen a table with matching context: status returns integer document/column counts and cells_detail,
not persisted names, questions or kinds. Captured samples use creation/setup context. Confirm an authenticated,
tenant-scoped retrieval path for those definitions, documents and exact text before live table reopening;
do not infer column types or names from cells. Owner: teammate contract clarification, founder integration.
Blocks connected table rendering/reopening, not static captured examples. PHASE_4_REVIEW_TABLES.md.
