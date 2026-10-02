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
