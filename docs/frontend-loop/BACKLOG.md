# Frontend backlog — five phases

Track implementation, connected acceptance and founder approval separately. A backend dependency blocks
only dependent work. Select the first valuable unblocked slice; do not start five simultaneous screens.

Sequencing override D-013: founder approves frontend-first progression into Phase 2. Sign-in, connected
acceptance and remaining full accessibility/error checks move to post-build; original release gates stay open.

| Phase | Slice | Status | Next evidence / dependency |
|---|---|---|---|
| 1 | Legacy truth map, typed client and captured fixtures | DONE (pinned) | `8a41d4f`; remains legacy evidence, not latest v2 certification |
| 1 | Approved shell, branding and independent Ask | BUILT / PARTIAL_BROWSER_ACCEPTANCE | Eight widths, keyboard, zoom and sampled motion/contrast pass; VERIFY_phase1-brave-2026-10-03.md; full accessibility/other states remain |
| 1 | Latest v2 contracts/roles/screens compatibility | GUARDED_SLICE_BUILT / NEEDS_CONNECTED_VERIFICATION | PHASE_1_COMPATIBILITY.md; source collision rejected, Q-008 pending |
| 1 | Production session/principal boundary | DEFERRED_TO_POST_BUILD | D-013/Q-001; reuse existing viewer/lawyer/admin primitives; not a frontend-build blocker |
| 2 | Local conversations, source re-check and trace | BUILT / NEEDS_CONNECTED_VERIFICATION | Gateway/store/principal setup; ASK_CONVERSATION_SLICE.md |
| 2 | Run polling/terminal states/retry safety | BUILT / NEEDS_FINAL_ACCEPTANCE | PHASE_2_RUN_UPDATES.md; bounded message-owned reads, terminal/refusal distinctions and explicit recovery; mounted/live checks and Q-009 remain |
| 2 | Complete Ask browser acceptance | DEFERRED_TO_POST_BUILD | D-013; live synthetic flow, refusal/error/stale source, follow-up/reload still required before release |
| 2 | Retain prior evidence while inputs are edited | BUILT / NEEDS_FINAL_ACCEPTANCE | PHASE_2_RETAINED_EVIDENCE.md; 256 reducer/render assertions and bounded Brave pass; full acceptance deferred D-013 |
| 3 | Extraction and attachments | LOCAL_PREPARATION_BUILT / NOT_INTEGRATED | PHASE_3_INTAKE_REFINEMENT.md; document-first local text/snapshot, 284 assertions; PDF/DOCX/attachment/storage/processing and Q-010 remain gated |
| 3 | Corporate-document and contract review | CORPORATE_CAPTURED_VIEW_BUILT / NOT_INTEGRATED | PHASE_3_REVIEW_FINDINGS.md;262 assertions; final Brave pending; live quote/reason/role and separately grounded contract/playbook view remain |
| 4 | Review tables/spend/cancellation/CSV | NOT_INTEGRATED | Current grid contracts and safe export |
| 4 | Drafts/blocking/version/diff/DOCX | NOT_INTEGRATED | Current draft contracts and support/approval boundary |
| 4 | Company/source/law-change workspace | PARTIAL_LEGACY / NOT_CANONICAL | Real scope; no live MCA or company-filtered event promise |
| 5 | Limitations/feedback/privacy controls | LIMITATIONS_BUILT / REST_GATED | Q-005, retention/deletion contract |
| 5 | Responsive/a11y/performance/security acceptance | NEEDS_VERIFICATION | Changed states in Brave, measured gates |
| 5 | Real practitioner pilot and release | HUMAN_GATED | Q-002/Q-006; founder final approval |

Deferred: stored portfolio/matters without verified persistence; Vault; alerts; historical controls until
bounded provision-level coverage and point-in-time text exist (Q-004). No placeholder success screens.

Organization/backup: current review branch `codex/frontend-handoff`. See STATE/HANDOFF for real commit and
push state. WIP preservation never converts any row into DONE.
