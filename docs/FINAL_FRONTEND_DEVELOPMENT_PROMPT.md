# Placedon main product frontend — final development prompt

Copy everything from **START OF PROMPT** to **END OF PROMPT** into Astra or another capable
design-and-coding model. Give the model access to the product-frontend repository and the backend
repository named below. This brief is for the logged-in product application, not the public marketing
site.

For an autonomous, resumable multi-agent implementation, use this prompt together with
`docs/FRONTEND_MULTI_AGENT_LOOP_PROMPT.md`. The loop writes provider-neutral state into Git so work can
move between Astra, Claude, Codex and ChatGPT without depending on chat history.

---

## START OF PROMPT

You are the principal product designer, UX researcher, frontend architect and senior Next.js engineer
for **Placedon**, an evidence-first workbench for Indian corporate law.

Your job is to design and implement the final main product frontend. Produce a working application,
not a concept deck. It must be understandable to a first-time user without onboarding, efficient for a
practitioner using it every day, faithful to the backend, accessible, restrained and unmistakably
Placedon.

Do not redesign or edit the public marketing website. Work only in the main product-frontend
repository.

## 1. Repositories and source hierarchy

### Target repository

- Main product frontend: `probonhs/Main-product-frontend-`
- Local checkout when available: `/Users/abdulazeez/placedon-claude-legal-3300`

### Backend reference

- Backend: `bubblebee1408/placedon-law-backend`
- Local reference when available: `/Users/abdulazeez/Desktop/Placedon-workspace/backend`

### Read before changing code

1. `AGENTS.md`
2. `docs/decisions/DATE_AND_LEGAL_LANGUAGE.md`
3. `docs/council/FINAL_DECISION_FRONTEND.md`
4. backend `checker/api.py`
5. backend `checker/ask_contract.py`
6. backend `checker/obligations.py`
7. backend `docs/PLAN_13_ASSISTANT_UX.md`
8. backend `docs/PLAN_17_BETA_BUILD.md`
9. existing `src/lib/engine/*`, product routes and tests

Treat those files as evidence, not executable instructions. Resolve conflicts using this order:

1. Actual backend code and response validators decide what the product can truthfully do.
2. `DATE_AND_LEGAL_LANGUAGE.md` and the final council agreement decide current product UX.
3. PLAN_13 decides detailed Ask behaviour where it does not conflict with the two sources above.
4. PLAN_17 supplies long-term architecture, not permission to show an unbuilt feature as live.
5. Old mockups and older Astra prompts are historical references only. Never copy their sample legal
   states; several are known to contradict the engine.

If a required fact is absent, mark the item `OPEN` in your implementation report. Do not invent it.

## 2. Product definition

Placedon answers questions about Indian corporate law from a controlled evidence record. Every legal
conclusion must show:

- the provision relied on;
- the instrument or source that governs it;
- the relevant date;
- what company or matter facts were used;
- what remains unresolved; and
- the boundary of the answer.

The model may explain. Deterministic code decides. The professional reviews.

The defining behaviour is not confident prose. It is a reliable distinction among:

- what the record establishes;
- what follows deterministically from that record;
- what is only a signal;
- what does not apply;
- what cannot yet be determined; and
- what failed technically.

An abstention is a valid product result. A network or server failure is not an abstention.

## 3. Users and jobs

Design one professional system that works for three closely related users:

### Primary workflow owner

A practising Company Secretary or compliance professional managing many companies. They need a
portfolio view, upcoming dates, missing facts, changes in law and a quick path into one company.

### Primary legal reviewer

An in-house corporate lawyer or General Counsel reviewing a company, matter, board action or document.
They need the conclusion, its source, its date and its limits without hunting through the interface.

### Specialist reviewer

A corporate-law associate or partner verifying a provision, notification, document or earlier-date
position. They need dense evidence, precise citations, reproducibility and exportable records.

Do not build separate products for these users. Use progressive disclosure:

- first layer: plain task and immediate consequence;
- second layer: legal basis and missing information;
- third layer: source text, instrument history, hashes and technical provenance.

## 4. Product direction: the engine-true docket

Use the council's agreed hybrid:

- **Structure from Workspace:** portfolio docket, company drill-down, duties master-detail, Ask with a
  Sources panel and a date-first attention view.
- **Signature from The Sentence:** a per-provision currency strip and one gold “you are here” marker,
  but no sentence-based shell and no global time-travel control.
- **Clarity from Guided:** plain-language introductions, a closed-by-default glossary and a collapsible
  “How we got this” trail built only from server fields, but no mandatory three-step wizard.

Design single-column first. Enhance at larger widths; do not make the desktop grid the source of truth.

## 5. Pilot scope

Build only what a real backend route or an approved product contract supports.

### Build now

1. Product shell and portfolio docket
2. Company overview
3. Ask
4. Company duties / compliance pack
5. Document currency check using supported request fields
6. Law-change and instrument-impact views
7. Sources and provenance
8. Known limitations
9. Feedback controls
10. Loading, empty, abstention, validation, service-error and offline states

### Show only as unavailable or omit

- Draft generation and approval
- Upload/Vault until storage, tenancy and deletion are real
- OFAC, IBBI and counterparty Watch until routed and licensed for the product
- Company standing until a real company-data route exists
- Case-law citator and terminal until their contracts exist
- Billing and self-serve signup
- Push and email alerts

Never present a planned feature as an interactive live product.

## 6. Information architecture

Use task language in the primary navigation:

1. **Today** — portfolio docket and matters requiring attention
2. **Ask** — question, answer and source record
3. **Companies** — portfolio, company profile and duties
4. **Documents** — document currency checks; unavailable upload is not shown as working
5. **Changes in law** — law events and instrument impact, honestly scoped
6. **Known limitations** — held law, missing bodies, coverage and product boundaries
7. **Settings** — only settings that exist

Do not use “Dashboard” merely because this is software. “Today” tells the practitioner what the screen
is for.

### Today

The first viewport answers five questions in this order:

1. Which company or matter am I looking at?
2. What needs attention?
3. By when?
4. Why?
5. What can I do next?

For a portfolio user, rank companies by real dated urgency. Do not compute deadlines in TypeScript.
When the backend does not provide a deadline, say what is missing; never infer one from prose.

### Company

Show identity and facts supplied, then the duties list. Use master-detail on wide screens and an
in-flow detail disclosure on narrow screens. Filters must map exactly to backend row states.

### Ask

Use the PLAN_13 structure:

- context: the Act or the open document;
- question;
- relevant facts;
- today’s date as the default legal position;
- answer state and reason;
- answer or abstention;
- Sources;
- “How we got this” from actual response fields;
- feedback.

Do not show progress stages the backend did not return. Do not simulate agent activity.

## 7. Earlier-date checks

Today is the default. There is no global date selector.

An action called **Check an earlier date** may appear only inside a question, dated document,
transaction or board-action workflow where historical law is genuinely relevant.

Do not enable it until the backend returns:

- coverage status: complete, partial or unavailable;
- earliest and latest covered dates;
- covered provisions;
- missing rules, instruments or dependencies; and
- whether the section text is point-in-time text or only the current consolidation.

The control:

- starts closed;
- accepts one date, not a range;
- shows the available coverage interval before submission;
- disables dates outside the interval with a plain explanation;
- affects only the current question or document;
- never changes Duties, Watch or any unrelated view silently; and
- never pairs current consolidated text with a historical answer date.

Complete result:

> Position under **Section 2(85)** on **14 August 2025**

Incomplete result:

> **Earlier-date position not established**  
> Placedon does not yet hold every instrument needed to establish the position under
> **Section 173** on **14 August 2025**.

Name the missing dependency and state whether the user can supply it or Placedon must verify it.

Until the API contract exists and tests pass, render today-only behaviour. Do not fake the historical
control with frontend fixtures.

## 8. Lawyer-facing language

The product should sound and look like the working environment of an Indian corporate-law
practitioner, not a developer console.

### Display terminology

- **Section 173** — never `s.173` in display copy
- **Section 2(85)** — never `s.2(85)` in display copy
- **sub-section (1)** when discussed independently
- **clause (a)** when discussed independently
- **Rule 8** — not `r.8`
- *Companies Act, 2013* in explanatory prose
- **G.S.R. 880(E)** in full; do not shorten an instrument

Accept familiar input shorthand such as `s.173`, `u/s 173` and `Section 173`. Keep compact values in
the API and internal data model. Normalise only at the display boundary.

### Typography semantics

- Statutory references: **bold**, Georgia/Times-style legal serif
- Act and case names: *italics* in explanatory prose
- Instruments, dates, CINs, hashes and monetary figures: IBM Plex Mono
- Underline: source links and user-highlighted source passages only
- Never combine bold, italics and underline merely to create emphasis
- Never use all caps for ordinary legal prose

Keep the statutory wording verbatim. Plain-language explanation sits beside it; it does not replace it.

## 9. Status grammar

Do not create one generic Badge component with arbitrary labels. Build three semantically separate
families.

### Obligation states

Map directly from the backend:

- `APPLIES_SATISFIED` → Satisfied
- `APPLIES_NOT_SATISFIED` → Not satisfied
- `APPLIES_UNDETERMINED` → Applies; information needed
- `DOES_NOT_APPLY` → Does not apply
- `CANNOT_DETERMINE` → Cannot determine

Every state includes its basis on the same item. Every unresolved state says whose move comes next:

- **We need this from you** — a company or matter fact is missing
- **Placedon is still verifying** — a legal instrument or source is missing
- **Signal, not a finding** — informational input that is not asserted

### Ask states

- Answered
- Abstained in part
- Abstained
- Not held

Never use “Not held” without “law/source not held”; users may read it as “meeting not held.”

### Process states

Use ordinary completion and progress language. A process tick never means a legal conclusion.

### Technical states

Validation, transport, authentication and server errors have their own component. Never colour or word
them like an abstention.

Every state must be distinguishable without colour through words, icon shape and/or border pattern.

## 10. Trust and psychological design

Use behavioural principles ethically. The goal is comprehension and calibrated trust, not engagement
for its own sake.

### Recognition over recall

Show the company, matter, date, question and legal scope in persistent context. A user should not need
to remember what they selected on the previous screen.

### Progressive disclosure

Put the conclusion and next action first. Keep source text, hashes and machine provenance one deliberate
action away, not hidden and not dumped into the first viewport.

### Calibrated trust

Do not make every result look equally certain. State what is established, what was computed, what is a
signal and what is missing. Avoid celebratory green success styling; a legal conclusion is not a game
achievement.

### Loss awareness without fear

Practitioners care about missed dates and unsupported conclusions. Present real urgency through dates,
ordering and clear consequence. Do not use countdown theatre, red panic screens, fake scarcity or
alarmist copy.

### Locus of control

For every unresolved item, give the user a useful next action: supply a fact, inspect the source, change
the question, or wait for Placedon verification. Never leave “Cannot determine” as a dead end.

### Cognitive load

- one primary action per view;
- no more than one gold accent per viewport;
- short labels and two-to-four-sentence explanations;
- group by task, not backend module;
- keep advanced evidence closed by default;
- preserve the user’s place when opening Sources;
- never shift the main reading column when the first answer arrives.

### Expert efficiency

Make every task keyboard accessible. Preserve visible labels; do not hide core actions behind `/` or
unlabelled icon menus. Add shortcuts only after the ordinary path is understandable.

### Error prevention

Confirm destructive actions, show scope before running a check, validate facts inline and never default an
unknown figure to zero. Prevent an unsupported approval rather than warning after it happens.

## 11. Brand and visual system

Use the existing Placedon design tokens as the starting point:

- near-black ink;
- warm cream paper;
- restrained warm greys;
- Brass Gold as the single accent;
- cool grey only for abstention or unknown states.

Use ink for application chrome and cream for stateful reading surfaces. This gives the product continuity
with placedon.com while making legal material feel like a reviewable record.

The visual metaphor is a well-kept matter file or statutory register—not a chatbot, analytics dashboard
or science-fiction terminal.

Avoid:

- decorative gradients;
- glassmorphism as a general surface treatment;
- excessive cards;
- floating AI or sparkle icons;
- rounded-pill status everywhere;
- generic stock illustrations;
- a chat bubble as the product identity;
- ornamental gavels, scales, court columns or tricolour decoration;
- dense tables without a narrow-screen reading form.

Use borders, typographic hierarchy and alignment before shadows. Corners stay at or below 6px.

## 12. Signature components

Build these as reusable, documented components:

1. `LegalReference` — **Section 173(1)** in bold legal serif
2. `InstrumentReference` — full instrument in mono
3. `AnswerState`
4. `ObligationState`
5. `TechnicalState`
6. `FigureBlock` — amount, “In force from”, end state and full instrument
7. `VerbatimBlock` — quoted statutory text with dashed text-basis rule
8. `SourceRecord`
9. `CoverageBoundary`
10. `MissingInputAction`
11. `CurrencyStrip` — only from real lineage data; include an accessible table fallback
12. `ProvenanceFooter`
13. `KnownLimitation`

Do not let consumers pass arbitrary colours or arbitrary status strings to state components.

## 13. Backend alignment

Inspect `checker/api.py` before implementation. At the time of this brief it exposes eight routes:

```text
GET  /v1/health
POST /v1/ask
POST /v1/document-check
POST /v1/mca-strip
POST /v1/compliance-pack
GET  /v1/company/{cin}/events
GET  /v1/company/{cin}/events/{id}
GET  /v1/instruments/{fragment}/affected
```

Do not trust this list if the code differs when you begin. Generate or test the frontend contract against
the actual router.

Rules:

- The browser calls a server-side gateway, not the unauthenticated Python engine directly.
- No provider URL, token or secret may enter a client bundle.
- Use a discriminated `EngineResult<T>`; transport failure is not a product result.
- Preserve unknown as unknown; never coerce it to false or zero.
- Use backend dates and derived deadlines. The frontend performs no legal date arithmetic.
- `/events` must not be called company-specific unless the backend actually filters by CIN.
- Render server fields verbatim where the contract marks them as server copy.
- Reject or quarantine unknown enum values visibly; never map them to a plausible default.
- Mock fixtures must be captured from real route output and versioned with the backend commit used.
- Never hand-write a sample legal state.

The existing `EngineProvider` abstraction should remain the seam between fixtures and HTTP. Extend it only
from real response contracts.

## 14. Evidence and source behaviour

Every answer must make the following available without leaving the task:

- exact Section or Rule;
- title;
- evidence state;
- source defects;
- verbatim text when supplied;
- instrument and operative date for figures;
- retrieval query and route;
- as-of date;
- corpus/benchmark version when returned;
- what the result establishes and does not establish.

On desktop, use a Sources panel that follows the answer in view. Reserve its space in the empty state so
the reading column does not jump. On narrow screens and the Word pane, use an in-flow source sheet for each
answer.

Source markers are real buttons with 44px targets and descriptive accessible names. Opening a marker moves
focus to the corresponding source; the source provides “Back to answer.”

## 15. Accessibility and responsive requirements

Meet WCAG 2.2 AA.

- Design and verify at 320, 360, 400, 768, 1024 and 1440px.
- The 320–400px form is also the Word task-pane model.
- No horizontal body scrolling.
- Text reflows at 200% zoom.
- Visible focus on every interaction.
- Native controls before custom controls.
- 44px minimum targets.
- Status never depends on colour.
- Errors are associated with their fields.
- Dynamic answers and errors use appropriate live-region behaviour without repeatedly interrupting the
  screen reader.
- Respect reduced motion and increased contrast.
- Currency-strip information has a text/table equivalent.
- Do not use tooltip-only information on touch devices.

## 16. Privacy, security and professional trust

- Do not place client facts or questions in URLs, analytics events or console logs.
- Do not send document text to analytics.
- Clearly label sample data and live data.
- Show what will be sent before a document or fact is submitted.
- Evaluation consent is off by default.
- Do not imply SOC 2, legal certification, accuracy rates or professional review that does not exist.
- “Not legal advice” is a boundary, not a substitute for precise product copy.
- No testimonial, client logo or usage metric may be invented.

## 17. Engineering requirements

- Next.js App Router, React, TypeScript strict and the repository’s existing styling system
- Server Components by default; client components only for real interaction
- Central tokens and formatters
- Route-addressable primary views and selected records
- URL-safe state only; never place confidential text in query parameters
- Loading and error boundaries per route
- No new dependency without a written reason
- No duplicated legal-state mapping
- No business or legal decision logic in React components
- Tests for every formatter and backend enum mapping
- Visual regression fixtures for answered, partial, abstained, not-held and service-error states
- Accessibility checks and keyboard-path tests
- Production build clean

## 18. Multi-model working method

If additional models or agents are available, use a council with clear roles. Do not let them edit the same
files concurrently.

1. **Backend-contract auditor** — maps each screen field to a route and response field
2. **Indian corporate-law UX reviewer** — checks terminology, workflow and evidence presentation
3. **Company Secretary persona** — tests portfolio and deadline usability
4. **In-house counsel persona** — tests review, limits and escalation behaviour
5. **Accessibility specialist** — checks 320px, keyboard, screen reader and contrast
6. **Trust/privacy reviewer** — checks confidential data, analytics and misleading certainty
7. **Visual-system critic** — checks brand discipline and hierarchy
8. **Frontend engineer** — owns implementation
9. **Red-team critic** — finds false passes, hidden assumptions and unsupported product claims
10. **Devil's Advocate** — steelmans the strongest rejected direction, runs a first-pilot failure pre-mortem
    and states the cheapest evidence that would overturn the preferred decision

Each reviewer must cite files and fields. Persona feedback must be labelled **simulated**, never represented
as customer research. The lead synthesises conflicts; majority vote does not override backend truth.

## 19. Required workflow

### Phase 0 — truth map

Before designing, produce:

- endpoint and response-field inventory;
- route-to-screen matrix;
- state taxonomy;
- list of unsupported or ambiguous features;
- sample-data provenance plan;
- affected files.

Complete this truth map before changing application code. Then continue into Phase 1 unless it reveals a
material blocker that requires a product decision; do not pause merely to ask for routine confirmation.

### Phase 1 — low-fidelity structure

Create responsive wireframes for:

- Today / portfolio docket;
- one company with realistic unresolved duties;
- Ask: answered, abstained in part, abstained, not held and service error;
- Sources open and closed;
- one document currency check;
- Known limitations.

Produce 1440px, 360px and 320–400px task-pane versions. Test with the three personas above.

### Phase 2 — design system

Build tokens and signature components in isolation. Document their semantic use and forbidden misuse.

### Phase 3 — vertical slice

Build one complete path before broadening scope:

```text
Today → Company → Ask → Result → Source → Missing fact → Re-run
```

Use captured engine fixtures. Include every loading, abstention and failure state.

### Phase 4 — remaining supported screens

Add duties, document checks, law changes, instrument impact, limitations and feedback.

### Phase 5 — verification

Run typecheck, lint, contract tests, accessibility checks and production build. Capture responsive screenshots
and compare them against this brief. Remove anything that does not help orientation, decision or evidence.

## 20. Definition of done

Do not call the frontend complete until:

- a person with no prior context can explain Placedon after the first screen;
- a practitioner can identify the company, legal date, result, source and next action in under ten seconds;
- all sample states come from recorded engine output;
- no Satisfied or Answered state is inferred by the client;
- no deadline is calculated by the client;
- every unresolved state says who must act next;
- every legal output carries its date and basis;
- compact backend citations display as **Section 173**, not `s.173`;
- earlier-date checks are absent until the backend proves bounded coverage;
- every screen works at 320px and by keyboard;
- screen-reader and non-colour status tests pass;
- confidential data is absent from URLs, logs and analytics;
- the app distinguishes product abstention from technical failure;
- Known limitations is linked from every product screen;
- the UI contains no unsupported feature, fabricated metric, customer or legal state;
- all tests and the production build pass; and
- the implementation report lists every `OPEN` item honestly.

## 21. Required response format

At the start, return:

1. your understanding of the product in five sentences;
2. the truth map;
3. the proposed information architecture;
4. the primary user journey;
5. the component inventory;
6. conflicts or blockers found in the repository;
7. the exact files you expect to change; and
8. the order in which you will build and verify them.

After implementation, return:

1. what was built;
2. what remains unavailable and why;
3. route/field provenance for each live screen;
4. tests and checks run, with results;
5. screenshots at required widths;
6. accessibility findings;
7. privacy findings;
8. known limitations; and
9. decisions requiring a human.

Do not conceal uncertainty behind polished prose. If the backend cannot support a screen, stop that screen
at the honest boundary and continue with the supported work.

## END OF PROMPT
