# Frontend loop state

Milestone: 1 COMPLETE — 13 captures, truth map and typed Ask client, commit `8a41d4f`
Current move: `/workspace` shell and Ask → result → Sources → revise
Status: VERIFYING — full browser acceptance is not complete
Branch: site/footer-icons-features-council
Base commit: `b84c910`
Latest loop commit: `8a41d4f` (engine-pinned fixtures and validated Ask client)
Working tree state: product UI remains uncommitted pending browser acceptance; preserve it.
Files intentionally changed: `.env.example`, `next.config.ts`, package test wiring, workspace analytics
  exclusion, `src/app/workspace/`, `src/app/api/workspace/`, `src/lib/engine/workspace.ts`,
  `src/lib/workspace-samples.ts`, gateway/render tests and loop records.
Tests last run: 773 fixture assertions / 13 captures; 7 Ask captures plus provider/schema checks;
  452 gateway assertions / 47 cases; existing 38 contracts; runner 8 assertions; loop validation,
  TypeScript, ESLint, production build PASS (25 routes); client budget PASS (18 chunks, 276,192 gzip bytes).
  Capture reproduction: 13 byte-identical fixtures, no writes. See VERIFY_workspace-ask.md.
Backend commit inspected: `9486600`; core API 86/86, Ask 127/127, obligations 114/114,
  prescribed-thresholds 86/86, assistant-contract 37/37 and goldset 5/5 passed; six environment/dependency or
  Gazette-rendering suites remain to classify
Decisions in force: `docs/decisions/DATE_AND_LEGAL_LANGUAGE.md`; `docs/council/FINAL_DECISION_FRONTEND.md`;
  D-004 automatic effort and token routing
Open blockers: GitHub token still lacks workflow scope. Browser control became unreliable during remaining
  viewport checks; attempted blank captures do not count as passes. Production identity, portfolio
  persistence, practitioner testing and deployment remain gated.
Next safe action: finish Brave viewport, missing-fact correction, keyboard/source-return, zoom, contrast,
  reduced-motion and analytics/network checks, then commit the UI after GO. Do not repeat the old council.
Ignored `.env.local` contains only loopback engine origin. Do not stage it. Push only to `probonhs`, not origin.
Updated by: Codex, 28 September 2026
