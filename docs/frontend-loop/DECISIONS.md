# Frontend loop decisions

Do not copy historical decisions here unless they are still in force. Link their evidence.

## D-001 — Product direction

- **Decision:** Use the “A-shell, engine-true docket” direction.
- **Source:** `docs/council/FINAL_DECISION_FRONTEND.md`.
- **Reversal condition:** Real practitioner testing demonstrates that another structure materially improves
  task completion without weakening backend truth, accessibility or trust.

## D-002 — Earlier-date checks

- **Decision:** Today is the default. **Check an earlier date** is contextual and remains unavailable until
  the backend supplies bounded provision-level historical coverage.
- **Source:** `docs/decisions/DATE_AND_LEGAL_LANGUAGE.md`.
- **Reversal condition:** A verified backend contract safely supports a broader scope and is approved in a
  new decision.

## D-003 — Statutory references

- **Decision:** Reader-facing references use **Section 173(1)** in bold legal serif. Compact `s.173(1)` is
  internal/input shorthand only.
- **Source:** `docs/decisions/DATE_AND_LEGAL_LANGUAGE.md`.
- **Reversal condition:** Practitioner testing shows a different display grammar is more familiar without
  losing clarity.

## D-004 — Automatic effort and token routing

- **Decision:** Route work by risk. Use low/minimal effort for deterministic work, medium for bounded
  implementation, high for product/contract decisions and extra-high/max only for critical legal, historical,
  security or release conflicts. Escalate on cited evidence and de-escalate after focused proof.
- **Reason:** This gives the earliest verified usable frontend without paying the time and context cost of a
  full council for every mechanical change.
- **Safety boundary:** Optimisation never removes backend-truth, accessibility, privacy, legal-state or final
  production-build gates.
- **Source:** `frontend-loop.config.json`, `scripts/frontend-loop.mjs` and section 3 of
  `docs/FRONTEND_MULTI_AGENT_LOOP_PROMPT.md`.
- **Reversal condition:** Measured delivery data shows a different routing policy improves lead time without
  increasing escaped critical defects or repeated work.

## D-005 — Supported Ask before portfolio breadth

- **Decision:** `/workspace` starts with question → facts → result → Sources. Portfolio waits for identity
  and profile persistence. The council explicitly permits that index to wait for a store.
- **Boundary:** Live workspace checks require development mode plus loopback engine/gateway hosts.
  Production remains captured-example-only. No historical selector or document upload.
- **Evidence:** `TRUTH_MAP.md`, `REVIEW_workspace-ask.md`. Q-001, Q-002 and Q-006 remain open; no buyer choice
  is inferred from this implementation sequence.
- **Reversal:** Authenticated tenant/profile contracts and practitioner evidence support a portfolio flow.
- **Rollback:** Remove workspace routes/scoped CSS; marketing routes remain independent.

## D-006 — Validate Ask at the server boundary

- **Decision:** Full request/response schemas run in the gateway/provider. Browser imports only types and
  lightweight state labels, with a defensive response-envelope check.
- **Reason:** Client runtime schemas produced a 94,319-byte gzip chunk, exceeding 80 KiB. Server validation
  preserves the fail-closed boundary. Revised full client output: 276,192 gzip bytes, budget PASS.
- **Tests:** Captured Ask, gateway, unknown-state, transport and production bundle checks.
- **Reversal:** A demonstrated client-validation need justifies a separate small validator within budget.

## D-007 — Familiar assistant workspace (30 September 2026)

- **Decision:** The user rejected the statutory-register presentation as alien and requested UX familiar
  from Harvey, Spellbook and Claude. Replace the masthead/landing page with compact navigation, immediate
  Ask entry, a question composer, progressively disclosed provisions/company facts, and on-demand Sources.
- **Authority:** Direct current user feedback supersedes D-001's visual shell and the older brief's
  anti-chatbot wording. Evidence/state/date requirements are unchanged.
- **Boundary:** One independent check at a time; no conversation memory, saved chats, uploads, drafting,
  or pretend portfolio. Samples remain labelled captured examples. Production remains sample-only.
- **References:** Harvey's [May 2025 interface update](https://www.harvey.ai/blog/the-brief-may-2025),
  [Spellbook overview](https://help.spellbook.legal/en/articles/9926203-spellbook-overview), and
  [Claude getting started](https://academy.claude.com/tutorials/getting-started-with-claude).
  These informed patterns, not a claim that authenticated competitor products were tested.
- **Review:** One bounded CSS implementation agent and one render-test/Devil's Advocate reviewer;
  no repeat of the full council. Browser and release gates remain separate from implementation.

## D-008 — Backend-owned Ask conversations (2 October 2026)

- **Authority:** User approved Ask → evidence → follow-up → reopen as the next development slice.
- **Decision:** Add a typed adapter for the backend's conversation and citation verbs at revision
  `127ef70`; use real stored envelopes, not reconstructed conversation history or browser persistence.
- **Boundary:** Development and loopback only, one configured server credential/operator. Production
  identity remains open. Unconfigured deployments retain captured examples and independent checks.
- **Follow-ups:** Shared thread does not imply inferred context; the research route requires explicit
  relevant facts in each question. Attachments are not connected on this slice.
- **Evidence:** `ASK_CONVERSATION_SLICE.md`, `tests/conversations.mjs`.

## D-009 — Founder-owned five-phase implementation and checkpoints (2 October 2026)

- **Authority:** User requests organized GitHub preservation, major frontend ownership, a smaller teammate
  backend handoff, autonomous routine decisions, pre-limit saves and founder final review.
- **Decision:** Use `docs/FIVE_PHASE_FRONTEND_LOOP_PROMPT.md`; keep `/workspace` as the current implementation
  entry, not an unapproved `/app` migration. Phase order: groundwork/access → Ask → documents/review → advanced
  supported workflows → pilot acceptance. Preserve the approved hybrid starting appearance.
- **Git:** Safe WIP checkpoints may be committed/pushed to product review branches before all gates pass.
  This explicitly supersedes commit-only-after-GO for backups. WIP is not readiness, founder acceptance or release.
  No automatic merge, deployment, destructive Git or unsafe data publication.
- **Ownership:** Founder owns UI/integration/testing; teammate reuses existing backend work and resolves narrow
  reproducible blockers. No teammate messaging authorized by this document alone.
- **Limits:** Checkpoint before reported usage/context limits and after coherent slices; unknown quotas remain
  unknown. No guarantee of saving after hard cutoff or automatic cross-provider switching.
- **Backend:** Latest fetched `889ba54` adds users/roles, screen contracts and downloads; reconcile actual
  responses before replacing the existing adapter pin. Code presence is not connected acceptance.
- **Evidence:** START_HERE.md, product/FEATURE_API_GAPS.md, product/TEAM_HANDOFF.md, design/README.md.
- **Reversal:** A current user instruction or verified contract/practitioner finding warrants a new decision.

## D-010 — Message-bound source inspection, not first-match trust

- **Evidence:** Backend `889ba54` assigns reply-local c1 IDs; citation.get returns the first match across a thread.
- **Decision:** Require originating message ID in the local BFF operation, read the stored expected citation,
  and reject any response message/field mismatch without displaying a quote. Preserve source re-verification.
- **Boundary:** This prevents misattribution; it does not repair availability for later colliding citations.
  Q-008 requests a narrow backend selector/regression. No backend files were changed.
- **Verification:** Expanded tests and independent audit response round; PHASE_1_COMPATIBILITY.md.
- **Reversal:** Verified message-scoped upstream lookup removes the redundant thread read only after regression
  evidence preserves identity/quote binding. No presumed legal truth or availability from a majority vote.

## D-011 — Phase 1 keyboard bypass and stable source comparison (3 October 2026)

- **Authority:** User selects Phase 1; preserve approved cream/black workspace.
- **Decision:** Add a workspace-local skip control targeting focusable content after the sidebar. Keep the
  independent Ask reading column's width and position when Sources opens; use an in-flow drawer until
  1800px, then a 320px panel in the right spare margin beside the existing 800px answer.
- **Reason:** Repeated navigation should be bypassable; comparing a finding with its source should not
  rewrap that finding. No legal state, API route, identity gate, website or source text was changed.
- **Evidence:** PHASE_1_SHELL_ACCEPTANCE.md; focused independent review and structural/runtime render checks.
- **Reversal:** Measured Brave reflow/focus or practitioner comparison testing warrants a narrower adjustment.
  Full browser and connected gates remain pending; this is a safe NEEDS_VERIFICATION checkpoint, not release.

## D-012 — Founder approval of reviewed frontend checkpoint (3 October 2026)

- **Authority:** User: “I have reviewed everything up until now and I approve it. Commit these changes”.
- **Accepted checkpoint:** `5343e98`, including the approved workspace appearance, stable independent-Ask
  Sources, keyboard bypass, source-record/date qualifications and documented Brave verification.
- **Decision:** Preserve the reviewed implementation and record founder approval in Git. No further UI
  changes were requested in this approval turn; the implementation was already committed and published.
- **Boundary:** Approval of the reviewed work is not proof that pending checks passed. Production identity,
  connected gateway/store/source acceptance, remaining accessibility coverage and release gates stay open.
  This instruction requests a commit, not a merge or deployment.
- **Evidence:** VERIFY_phase1-brave-2026-10-03.md; working tree was clean at the start of this approval turn.

## D-013 — Frontend build before integration and final acceptance (3 October 2026)

- **Authority:** Founder defers remaining accessibility/error-state checks until afterwards, connections
  until all five frontend phases are committed, and sign-in until the main product frontend is complete.
- **Decision:** Move into Phase 2 frontend implementation. Carry Phase 1 pending gates into a post-build
  checklist; do not repeatedly block independent build work on them or describe them as passed.
- **Boundary:** Reviewed Phase 1 UI is approved for progression, not fully accepted for release. Maintain
  pinned contracts, basic accessible semantics, technical failures, source guards, focused tests and build
  gates. No fake connected features, credential provisioning, multi-user enablement, model spending or release.
- **Follow-through:** After frontend build checkpoints, choose sign-in mapping, connect approved synthetic
  backend setup/fix source collisions, then run full accessibility/error/integration acceptance before pilot GO.
- **Reversal:** Founder changes sequence, or a concrete safety defect cannot be isolated behind existing gates.

## D-014 — Retain independent-Ask evidence while drafts change (3 October 2026)

- **Decision:** Keep the complete returned record when editing or clearing context, while requesting a new
  result, and after failed/invalid requests. Show an explicit draft/previous-record boundary before the
  answer, beside the composer and within Sources. Original question/facts/dates/provenance remain unchanged.
- **Safety:** Only an accepted response for the current request replaces the record; edits abort pending
  requests and invalidate their completion IDs. No automatic retry or inferred legal result. Opening a
  captured example does not mark an existing draft checked. Evidence remains in memory for this page only.
- **Rejected:** Clearing evidence loses comparison context; retaining it without a warning risks false
  applicability. Exact-input comparison/restoration is deferred: even reverted edits conservatively remain
  unchecked until a new accepted local response.
- **Scope:** Independent Ask only; no change to backend-owned conversations, API contracts or legal text.
- **Review:** Bounded R2 Devil's Advocate/execution-checker with simulated Indian-lawyer perspective;
  reducer/render regression plus bounded Brave inspection, not full deferred acceptance.
- **Reversal:** Observed confusion between previous evidence and edited facts warrants stronger separation
  or hiding the old answer behind an explicit previous-record disclosure.

## D-015 — Bounded process updates and explicit send recovery (3 October 2026)

- **Decision:** Add user-started, read-only reply updates: three status checks/five-second gaps/60-second
  window, with at most seven backend reads including ownership guards and terminal reply refresh.
  Stop on terminal/review, hidden tab, abort or error. No streaming, percentage or auto-restart/resend.
- **Truth boundary:** Process completion never supplies a legal answer. Only the stored validated envelope
  does. Status projection removes internal result/failure data; conversation/message/run IDs must correlate.
- **Recovery:** Pause uncertain submissions until refreshed saved work is inspected and the user deliberately
  acknowledges duplication risk. Known-thread recovery requires that thread's read. No guarantee across reload
  or missing returned identity; Q-009 remains open. Preserve unsent edits and same-thread inspected evidence.
- **Rejected:** Unlimited/background polling adds load; blind retry can create duplicate paid work; server
  cancellation needs a separate confirmed mutation contract and is not represented by Stop waiting.
- **Review/evidence:** PHASE_2_RUN_UPDATES.md; independent R2 corrections accepted. Mounted/live/full browser
  acceptance is not claimed. Roll back this frontend slice if connected tests violate correlation or recovery.
- **Next:** Contract-grounded Phase 3 UI preparation; integration/auth/acceptance remain post-build per D-013.

## D-016 — Local document preparation before connected reviews (3 October 2026)

- **Decision:** Build one working Documents intake/snapshot route, not a fake upload or review. Plain UTF-8
  .txt/pasted text only, local 256 KiB/200,000-character limits, strict decoding and explicit preparation.
  Snapshot stays separate from edits; unknown/stale reads cannot replace the draft. No browser persistence.
- **Reason:** Backend upload is not extraction or durable text storage. Q-010 must prove the document text
  reaching review before attachment integration. Review type describes intended scope, not a finding.
- **Rejected:** Blindly transplanting donor PDF/DOCX parser/size→scan assumptions; truncating oversized paste;
  connected success without permissions; preview text formatted as verified legal evidence.
- **Review:** PHASE_3_LOCAL_PREPARATION.md; independent R2 corrections to truncation/field association accepted.
  Browser/mounted/live gates remain NOT RUN. Roll back or narrow the local reader if completeness/privacy
  tests show altered, exposed or misleading text. Founder retains processing/retention/release decisions.

## D-017 — Document-first intake and remove development chrome (4 October 2026)

- **Authority:** Founder’s seven browser comments: remove the main local-preparation and sidebar preview
  notices; add document before review/naming; remove statute-specific welcome; question sidebar Examples.
- **Decision:** File/paste first, name and review choice only after text is present. Explanatory storage copy
  stays closed; short availability qualifiers remain where action is offered. Preserve the cream/ink shell.
  Remove shared demo navigation; offer labelled sample results secondarily on Ask, never as saved history.
- **Boundary:** Neutral welcome does not broaden actual legal coverage or remove Act names from sources.
  Local selection is not upload. Review stays disabled until verified integration/processing; no fake success.
- **Review:** PHASE_3_INTAKE_REFINEMENT.md; independent R2 late-disclosure finding corrected. Static/code/build
  evidence passes; Brave/mounted/full acceptance is not claimed. Revisit if real users confuse preparation
  with review or connected capabilities change; do not restore development scaffolding to the final shell.

## D-018 — Chat-first Ask and conversation interaction (4 October 2026)

- **Authority:** Founder asks to keep UX similar to Anthropic/OpenAI chatbot interfaces.
- **Decision:** Centred start/composer, message-style question/reply, compact context and on-demand Sources;
  draft-only starter questions and Enter/Shift+Enter behavior shared across both Ask surfaces. Preserve brand.
- **Boundary:** Chat appearance does not add memory to independent Ask. Samples remain captured examples,
  unavailable sending/attachments remain gated, and backend-owned saved conversations keep recovery/source guards.
  No provider integration, fake streaming, auto-send suggestions or unapproved model spending.
- **Review:** CHAT_INTERFACE_REFINEMENT.md; independent R2 IME/held-Enter findings fixed. Bounded Brave
  interactions pass after refreshing the verified preview runtime; full responsive/live acceptance pending.
  Revisit keyboard behavior if actual input-method testing finds premature sends. No automatic release.

## D-019 — Captured corporate-review findings (5 October 2026)

- **Decision:** Server-only captured result: all pinned checks, status-specific action, reported evidence,
  stated basis and detector limits. Local intake unchanged; samples open separately, do not consume drafts.
- **Boundary:** Run completion/PASS do not certify compliance; criteria are not findings, absence is not a
  quotation. Missing legal date/source retrieval stays missing. No live review, client-only approval or spending.
- **Evidence:** PHASE_3_REVIEW_FINDINGS.md; real-handler synthetic captures889ba54; R2 corrections cleared.
  Native disclosures keep existing budget cap, not a runtime performance or complete acceptance claim.
- **Reversal:** Changed pinned checks or practitioner confusion requires recapture/stronger separation.
  Processing, auth, connected decisions, browser/final acceptance and founder release stay gated.

## D-020 — Captured contract comparison, not invented clause approval (5 October 2026)

- **Decision:** Reuse server-only review-example route for finding versus playbook standard/rationale;
  fixed-extraction captures explicitly not actual model reading. DRAFT is not adopted company policy.
- **Boundary:** No clause quotation returned means no manufactured quote/approval. MATCHES based on no
  extraction is not confirmed absence; city-list match does not verify company operations. Raw data preserved.
  Existing processing/auth/live/approval gates remain. No new client boundary or spending.
- **Evidence:** PHASE_3_CONTRACT_FINDINGS.md; pinned889ba54 stubbed-handler captures, Curie R2 qualifiers cleared.
- **Reversal:** Verified exact item-bound quote/match context or changed playbook contract enables a new slice,
  not silent reinterpretation. Real practitioner/browser/release approval remain outstanding.

## D-021 — Captured review tables with evidence and qualified spending (5 October 2026)

- **Decision:** Server-only document/question matrix, cell disclosures, truthful pending/failure/cancellation
  states, reported priced subtotal and captured CSV inspection. Secondary Documents sample; no live actions.
- **Reason:** Backend completion does not mean legal clearance; null is not free; rounded priced totals are
  not guaranteed minimums. Unreadable NOT_FOUND is explicitly not a checked document. Reject unsafe CSV.
- **Evidence:** PHASE_4_REVIEW_TABLES.md; ten pinned-handler envelopes, Arendt audit/Popper targeted corrections,
  396 table assertions. Production budget unchanged; Brave load only, not final interaction acceptance.
- **Boundary/reversal:** Q-010/Q-013/Q-014 and verified roles/store/processing/download bytes must precede live
  enablement. New contracts or practitioner confusion warrant a scoped change, not fake capability. Rollback:
  remove the sample link/route; no client/backend state migration. Founder retains final release authority.

## D-022 — Phase 5 preparation after the saved Phase 4 checkpoint (6 October 2026)

- **Authority:** Founder says “phase 4 done continue phase 5”; proceed from published47909e3 under D-013.
  Progression is not evidence that unfinished drafts/version/diff/DOCX or company/law-change work exists.
- **Decision:** Compact server-only Help & data, native unsent feedback note, corrected limitations and
  an eleven-gate release-candidate declaration inventory. Preserve chat/brand/primary navigation.
- **Boundary:** No feedback sink, processing consent, retention policy, deletion guarantee, auth choice or
  pilot scope invented. Failed response does not prove no server work/storage. Even complete declarations
  never authorize release; actual checks and human review remain mandatory.
- **Evidence:** PHASE_5_PREPARATION.md; Hilbert privacy/backend and Newton R2/Devil's Advocate reviews cleared
  targeted fixes;115 readiness +46 Help assertions. Local webpack pass is not remote CI or browser proof.
- **CI:** Add missing codex/** push coverage with existing read-only permissions; test declarations, not
  incomplete pilot acceptance. No merge/deploy/back-end changes. Revisit if validated contracts/policy change.

## D-023 — Minimal Ask, thin rectangular composer and dark mode (7 October 2026)

- **Authority:** Founder asks for minimal welcome, no company-context/footer clutter, consolidated Known
  limitations and dark mode; follow-up specifically rejects a tall composer and requests ChatGPT-like thinness.
- **Decision:** Approximately70px empty composer with one starting text row, 12px corners and adjacent
  info/send controls; centre welcome only, keep question/answer reading left-aligned. Workspace theme toggle
  stores only appearance. Help/data/samples move into closed Known limitations disclosures.
- **Override:** Current explicit request supersedes the old ≤6px rule for chat composer/message bubbles
  only. Legal records/source panels retain restrained corners; no copied provider identity/model controls.
- **Boundary:** Facts remain optional in a dedicated check/revision flow, not a welcome control. No source,
  legal result boundary or unavailable-service guard removed. Notice links open separately to preserve drafts.
  No model, auth, API, processing policy, upload, deletion or feedback capability added.
- **Evidence:** ASK_MINIMAL_APPEARANCE.md; targeted independent review fixes, full offline tests, production
  build and unchanged budget pass. Brave light/dark start and disclosures inspected; full acceptance pending.
- **Revisit:** Practitioner confusion about independent checks versus saved conversations or browser reflow
  regressions warrants a scoped change. Founder retains final appearance/release review.
