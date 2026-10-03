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

Git workflow scope is an operational access condition, not a product decision. Record the actual push
failure if it occurs; never drop workflow history or claim remote publication from a local commit.
