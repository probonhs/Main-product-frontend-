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
