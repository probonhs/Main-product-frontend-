# Ask appearance checkpoint — 7–8 October 2026

Founder request: centre and simplify Ask, remove introductory/company-context/footer clutter,
consolidate help/data into Known limitations, add dark mode. Follow-up explicitly replaces the tall
Claude-style composer with a thinner rectangular ChatGPT-style input. Placedon branding stays intact.

## Built

- One centred welcome heading, left-aligned input and quiet draft-only starters. Empty composer is about
  70px tall on desktop: one text row, restrained 12px corners, info/send controls alongside the input.
  Text can grow up to 180px; longer text scrolls. Mobile retains 44px controls and 10px corners.
- No welcome introduction, company-context button/panel, empty Sources control or workspace footer links.
  Sources, legal basis, date, evidence defects and result boundaries remain attached to actual answers.
- Detailed independent fact checks remain at `/workspace/ask?details=1`, linked from Known limitations;
  a local unresolved answer can reveal the same existing input controls. This is a UI flag, not matter data.
- Known limitations holds eight closed native disclosures: answer boundaries, dates, working copies,
  questions/conversations, processing/deletion, issue note, unavailable actions and captured examples.
  `/workspace/help` redirects there; feedback/deletion remain unavailable, with no invented service/policy.
- Workspace-wide light/dark toggle. Default follows the system after hydration, explicit choice persists
  under `placedon-workspace-theme`. Only the appearance flag is stored, never matter content.
  Palette changes are scoped to `.workspace`; marketing appearance and content are untouched.

## Review and verification

- Independent execution/privacy/devil's-advocate delta review found: pre-send processing discoverability,
  stale disconnected-example navigation, undersized mobile toggle and notice navigation losing a draft.
  Fixed with a compact named info link, corrected examples target, 44px minimum and new-tab notices.
  Targeted final review confirmed the draft-preservation fix; no claim of complete product acceptance.
- Typecheck and quiet lint PASS. Full offline contracts PASS, including 311 Ask renders, 51 consolidated
  Help/limitations assertions, conversation recovery/ownership guards and unchanged document-review fixtures.
- Readiness 115 and loop-runner 8 PASS; loop configuration valid. Pilot acceptance still INCOMPLETE.
- Default Turbopack production build PASS: 31 routes; budget PASS at 20 chunks / 291,766 gzip bytes.
  Do not compare chunk count/headroom directly with the previous webpack checkpoint. Cap unchanged.
  Initial sandbox build was interrupted; its lock cleared before the successful host build.
- Brave: compact homepage visually inspected in light and dark; toggle and dark preference across
  navigation confirmed; Known limitations questions/examples disclosures and actual links inspected.
  Help HTTP 307 redirect confirmed. Later answer navigation was interrupted by user browser activity.
  Full responsive, live gateway, IME, error-state and accessibility acceptance are still outstanding.
- No backend/env/credential/provider changes, paid model calls, merge or deployment.

Git publication: use the scoped product review branch `probonhs/codex/frontend-handoff`; inspect Git for
the final SHA. Remote checks for this new checkpoint must be observed separately from local verification.
