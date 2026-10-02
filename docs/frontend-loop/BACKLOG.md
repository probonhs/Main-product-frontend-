# Frontend backlog — five phases

Track implementation, connected acceptance and founder approval separately. A backend dependency blocks
only dependent work. Select the first valuable unblocked slice; do not start five simultaneous screens.

| Phase | Slice | Status | Next evidence / dependency |
|---|---|---|---|
| 1 | Legacy truth map, typed client and captured fixtures | DONE (pinned) | `8a41d4f`; remains legacy evidence, not latest v2 certification |
| 1 | Approved shell, branding and independent Ask | BUILT / NEEDS_BROWSER_VERIFICATION | Responsive/focus/privacy gates; snapshots are design-only |
| 1 | Latest v2 contracts/roles/screens compatibility | GUARDED_SLICE_BUILT / NEEDS_CONNECTED_VERIFICATION | PHASE_1_COMPATIBILITY.md; source collision rejected, Q-008 pending |
| 1 | Production session/principal boundary | DECISION_GATED | Q-001; reuse existing viewer/lawyer/admin primitives |
| 2 | Local conversations, source re-check and trace | BUILT / NEEDS_CONNECTED_VERIFICATION | Gateway/store/principal setup; ASK_CONVERSATION_SLICE.md |
| 2 | Run polling/terminal states/retry safety | READY_AFTER_CONTRACT_RECONCILIATION | Actual runs.get/cancel semantics; no fake streaming/stages |
| 2 | Complete Ask browser acceptance | NEEDS_VERIFICATION | Live synthetic flow, refusal/error/stale source, follow-up/reload |
| 3 | Extraction and attachments | NOT_INTEGRATED | Donor patterns, limits/scan refusal, processing permission |
| 3 | Corporate-document and contract review | NOT_INTEGRATED | Quote/reason, playbook and role gates |
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
