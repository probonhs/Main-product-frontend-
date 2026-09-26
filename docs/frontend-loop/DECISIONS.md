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
- **Source:** `docs/FRONTEND_MULTI_AGENT_LOOP_PROMPT.md`, section 4A.
- **Reversal condition:** Measured delivery data shows a different routing policy improves lead time without
  increasing escaped critical defects or repeated work.
