# Placedon product re-entry and frontend plan

Historical re-entry snapshot from earlier on 2 October, retained for context. Current reconciled status is
`docs/START_HERE.md` and `docs/product/FEATURE_API_GAPS.md`: backend has advanced to `889ba54`, donor PR head
is `8461a06`, local conversations have since been implemented, and `/workspace` remains the current entry.
The current five-phase loop supersedes the phase-zero/migration recommendations below; do not treat the
older absence statements, role proposals or account architecture as approved current contracts.

**As of:** 2 October 2026
**Purpose:** founder re-entry after time away; one factual account of what exists, how the product works,
and the sequence for building the canonical frontend.

## 1. The short version

Placedon is becoming an evidence-backed legal workbench for Indian in-house legal teams. The backend now
does much more than the original Companies Act question screen: it holds tenant-scoped conversations,
runs, documents, contract reviews, review tables, drafts, citations, decisions and audit records. It can
route bounded work through deterministic code and hosted models, but models may not decide legal status,
authority or dates.

The missing piece is not another isolated mockup. It is one canonical frontend, with real identity and
tenant membership, that exposes the backend's supported workflows without merging three incompatible
prototypes blindly.

## 2. What is actually where

### Merged backend (`bubblebee1408/placedon-law-backend`, `main` at `127ef70`)

This is the current technical authority. Relative to the frontend's previously pinned backend `9486600`,
it is 215 commits ahead: 281 files changed, about 52,547 additions and 2,582 deletions.

Built on `main`:

- one verb table generating REST, read-only MCP and CLI surfaces;
- API keys resolving to both a tenant UUID and actor UUID;
- tenant-scoped PostgreSQL schema with forced row-level security;
- hash-chained metadata audit records that exclude question and document contents;
- conversations and ordered user/assistant messages;
- document upload and source records;
- research questions, contract review and board-document review;
- durable runs, steps, jobs, cancellation and human decisions;
- contract review tables and CSV export;
- drafts, versions, exact diffs and `.docx` export;
- exact citation lookup and quoted-span verification;
- company-fact extraction from user-supplied MCA master data;
- source tiers, retrieval, bounded question decomposition, an answer cache and a narrowing critic;
- model routing and cost records; and
- a forecasting layer isolated from legal decisions.

The backend currently defines 29 verbs, including `ask`, `review_contract`, `review_document`,
`runs.*`, `events.assess`, `sources.*`, `company_facts.extract`, `intake.classify`,
`conversation.*`, `citation.get`, `review_table.*`, `draft.*` and `documents.upload`.

### Nishant's frontend (`placedon-claude-legal-3300`, PR #2)

This is a substantial **open, unmerged prototype**, not deployed product code. It adds `/app` with Ask,
Contracts, Documents and Runs; a server-only gateway client; document extraction; review decisions; polling;
and a shared-passcode gate. It is 49 files / 4,859 additions and GitHub currently marks it conflicting.
The Vercel check is failing.

Useful work to preserve:

- typed `/v2` gateway client and fail-closed response parsing;
- API key kept in the server process, never sent to the browser;
- clear separation of refusal from technical failure;
- contract/document upload extraction and refusal on unreadable scans;
- human review gate requiring the quote to be opened and a reason entered;
- run polling that stops at terminal states; and
- honest UI for `UNPRICED`, test-data residency and incomplete run listings.

Not production-ready:

- one shared passcode, no users, memberships, roles or user-level revocation;
- one gateway key means every session sees one tenant;
- `/app` conflicts conceptually with the local `/workspace` route;
- its branch conflicts with current `main`; and
- it implements only part of the backend's now larger verb set.

### Our local product frontend (`/workspace`)

This is uncommitted local work. It supplies the more familiar assistant-style shell requested by the
founder: compact navigation, a primary question composer, progressive company facts, answer states,
on-demand Sources and lawyer-facing statutory typography. It has a guarded local `/v1/ask` bridge and
captured engine fixtures, but deliberately has no identity, persistence, conversations, uploads or
production gateway integration.

### Business-plan repository

No recent Nishant work after early September. It remains useful for strategy and research history, but
it is not the current implementation authority. The backend code and current decision documents win.

### Main product frontend repository (`probonhs/Main-product-frontend-`)

No Nishant commits or pull requests. Remote `main` remains at `b84c910`. Our newer commits and current
workspace changes are not present there.

## 3. How the finished product should work

```text
Browser
  │  secure session cookie (never a backend API key)
  ▼
Next.js product frontend / BFF
  │  verifies user + organisation membership + role
  │  maps the request to tenant_id + actor_id
  │  validates and rate-limits input
  │  calls with server-held credential
  ▼
Placedon Gateway /v2
  │  auth → tenant + actor → audit metadata
  │  fixed intent → persisted plan → budget → durable run
  ▼
Deterministic legal engine + retrieval + permitted model call
  │  exact evidence, dates, source tier, refusal/failure state
  ▼
Persisted answer envelope → BFF validation → browser rendering
```

The browser never calls the Python gateway directly. It calls a same-origin Next.js route or Server
Action. The Next server holds the gateway credential, validates the backend response and sends only the
user-facing envelope to the browser.

## 4. Accounts and login

There are three different concepts that must not be collapsed:

1. **Identity:** who the human is. Use a production OIDC/email identity provider; exact vendor remains an
   explicit product/deployment decision.
2. **Membership:** which organisation or legal team the person belongs to, and their role there.
3. **Gateway principal:** the tenant UUID and actor UUID attached to every backend request and audit row.

Minimum product data model:

- `users`: identity-provider subject, name, email and status;
- `organisations`: customer/legal team and lifecycle state;
- `memberships`: user + organisation + role (`owner`, `admin`, `lawyer`, `reviewer`, later `viewer`);
- `sessions`: server-managed login session;
- `invitations`: organisation, email, role, expiry and acceptance state; and
- gateway credential mapping kept only in server secrets.

Login flow:

1. User signs in through the identity provider.
2. Next.js receives and verifies the identity callback.
3. Next.js loads active organisation memberships.
4. The user selects an organisation only if more than one exists.
5. Next.js creates a secure, HTTP-only session.
6. Every product request checks session, membership and role.
7. The BFF calls the gateway as the correct tenant and actor.
8. Sign-out revokes the frontend session; removing membership immediately blocks access.

Nishant's shared passcode can remain only as a clearly labelled local/demo gate. It is not the account
system to ship.

## 5. Chat, calls and API calls

“Chat” is the interaction shape; an API call is how it is executed.

For a new message:

1. The browser submits text and optional file IDs to a same-origin frontend endpoint.
2. The frontend sends `conversation.send` to `/v2` with its server credential.
3. Intake classifies the message into one of the fixed supported tasks.
4. The backend writes the user message and creates/persists a run.
5. For longer work, the frontend receives a run/conversation identifier and watches status through
   bounded polling initially. Server-sent events can replace polling later when real load justifies it.
6. The worker executes fixed steps. A model may select among fixed options, read, extract, label or phrase.
7. Deterministic checks verify citations, scope, dates and legal states.
8. The assistant message stores an answer envelope with citations and boundaries.
9. The frontend renders the conclusion first, then sources, facts, unresolved items and trace.

Do not simulate token-by-token AI streaming before the backend can serve a verified answer incrementally.
A staged “checking sources / verifying citations” animation would also be misleading unless those stage
events are returned by the run. Start with honest run status and a complete verified response.

Conversation history should come from `conversation.list` and `conversation.get`, not browser storage.
The current local `/workspace` explicitly has no memory and must keep saying so until connected.

## 6. Which AI is used where

Current backend policy:

- deterministic Python decides legal scope, applicability, authority, dates and final state;
- BM25 is the statute-retrieval incumbent;
- Azure-hosted `llama-3-3-70b` and `gpt-5-mini` are available model deployments;
- Azure-hosted models may read permitted matter content only under the region/data policy;
- Gemini free tier is backup for repository-public text only, never client documents;
- Anthropic code exists but the project records no usable credit, so it is unavailable;
- local models are limited by the development machine and are not the production plan;
- OCR provider selection remains measurement- and privacy-gated; and
- no model training or fine-tuning is planned until at least 1,000 lawyer-reviewed traces and a repeated,
  workflow-specific model failure justify it.

Models may:

- classify an ambiguous request among fixed intents;
- extract clauses or fields;
- propose grounded language;
- phrase an answer from verified findings;
- split a compound question within the coded limit; and
- flag/remove unsupported answer text.

Models may not:

- decide whether a legal obligation applies;
- choose the controlling authority;
- invent a provision, figure, date, citation or source;
- convert a technical failure into an abstention; or
- let a forecast become a legal conclusion.

## 7. Canonical frontend information architecture

Use one route family, recommended as `/app`; redirect `/workspace` during migration and later retire it.

### Global shell

- organisation switcher;
- New question;
- conversations;
- Ask;
- Documents;
- Contract review;
- Review tables;
- Drafts;
- Runs/activity;
- Sources;
- known limitations; and
- account/organisation settings.

Only show a navigation item when the supporting contract is integrated and tested. Planned features do
not appear as disabled theatre.

### Ask

- familiar composer;
- optional source/file/company context;
- explicit scope and date;
- persisted conversation;
- answer/refusal/failure distinction;
- sentence-level citations;
- on-demand source drawer; and
- run trace/provenance under progressive disclosure.

### Documents

- upload or paste;
- extraction status and refusal on unreadable text;
- document type classification;
- deterministic checks;
- findings requiring a person; and
- quote-open + reason-required approval/rejection.

### Contract review

- document and represented party/context;
- selected approved playbook;
- finding state, quoted clause, standard and rationale;
- filtering and per-finding review; and
- no claim that a draft playbook is a firm's policy.

### Review tables

- documents as rows and questions as columns;
- cost estimate/guard before starting;
- cell status and exact supporting quote;
- cancellation; and
- safe CSV export.

### Drafts

- create only from an existing verified run;
- show blocking slots and citations;
- revision instructions;
- version history and exact diff;
- approval state; and
- `.docx` export.

### Sources and company facts

- source tier and permitted use;
- held versus declared law;
- uploaded MCA master data with user confirmation; and
- no claim of a live MCA21 connection until one actually exists.

## 8. Delivery plan

### Phase 0 — reconcile and freeze contracts

1. Preserve the current local branch and commit its verified work.
2. Create an integration branch from the intended product repository.
3. Treat Nishant's PR as a donor branch, not a merge button.
4. Generate a frontend contract from backend `127ef70`: verbs, paths, request/response schemas and states.
5. Run backend gates and capture versioned frontend fixtures.
6. Decide the canonical route (`/app` recommended) and record redirects.

**Exit:** one compatibility matrix; no unknown endpoint/state reaches UI work.

### Phase 1 — foundation and real accounts

1. Establish one product design system and shell.
2. Add identity-provider adapter, users, organisations, memberships, invitations and sessions.
3. Map every frontend request to backend tenant and actor.
4. Add server-only gateway client, schema validation, CSRF/origin controls, rate limits and security headers.
5. Add error, refusal, loading, offline and unauthorized states.

**Exit:** two test organisations cannot read each other's data; revoked users lose access; browser bundles
contain no gateway key.

### Phase 2 — conversation vertical slice

1. Conversation list/get/send.
2. Familiar Ask composer and context attachment.
3. Durable run status and terminal result.
4. Sources drawer, citations and provenance.
5. Technical-failure and refusal tests.

**Exit:** sign in → create conversation → ask → inspect exact source → reload → conversation persists.

### Phase 3 — documents and contract review

1. Upload/paste and extraction.
2. Document review and human gate.
3. Contract review against approved/test playbooks.
4. Review decisions and audit visibility.

**Exit:** unreadable documents refuse; findings cannot be approved without quote + reason; client documents
never go to an unapproved model region.

### Phase 4 — review tables and drafts

1. Review-table create/status/cancel/export.
2. Draft create/status/revise/versions/diff/export.
3. Cost and `UNPRICED` handling.

**Exit:** a draft cannot be approved with blocking slots; every table cell marked found carries a verified
quote; exported CSV is formula-safe.

### Phase 5 — product hardening

1. Accessibility and responsive acceptance.
2. Threat model and penetration/security review.
3. Retention, deletion, export and privacy controls.
4. Observability without legal/client content in logs.
5. Real practitioner usability tests.
6. Deployment, rollback and incident runbooks.

**Exit:** pilot GO requires engineering, security, legal-data and practitioner gates—not only a green build.

## 9. The development loop

For each vertical slice:

1. **Inspect:** read backend verb, schema, tests and current state.
2. **Record:** update the compatibility matrix and acceptance criteria.
3. **Implement:** one end-to-end user outcome, not disconnected screens.
4. **Adversarial review:** backend alignment, legal honesty, privacy/security, accessibility, usability and
   Devil's Advocate.
5. **Verify:** contract tests, typecheck, lint, build, budget, browser flows and responsive widths.
6. **Document:** decision, evidence, known limits and rollback.
7. **Commit:** small, named commit to the product repository.
8. **Push/review:** CI and preview must be green before merge.
9. **Repeat:** choose the next highest-value unblocked slice.

Use multiple agents only for disjoint tasks. The main implementation path stays with one owner; agents do
bounded contract, security, accessibility and Devil's Advocate reviews. Token optimisation never removes
the legal-truth, privacy, accessibility or production-build gates.

## 10. Decisions still required from the founder

These are real product decisions, not coding questions:

1. Identity provider and first login method (email magic link, Google/Microsoft SSO, or both).
2. Whether the first pilot is one organisation or genuinely multi-organisation.
3. Initial role set and who may approve findings/drafts.
4. Permitted region/model treatment for real client documents.
5. Database operating budget and what happens after the Azure student credit ends.
6. Retention/deletion period for conversations and documents.
7. Whether `/app` becomes canonical (recommended) and `/workspace` redirects.
8. Which workflow ships first after Ask: document review or contract review.

Until these are decided, development can safely complete contract reconciliation, the design system,
gateway boundary and local test fixtures. It must not pretend production identity, residency or retention
has been settled.

## 11. Immediate next move

Do **Phase 0 only** before adding another screen. The backend changed too much for either frontend prototype
to remain authoritative. Reconcile contracts, preserve the best parts of both UIs, choose `/app`, and produce
one authenticated Ask vertical slice. That is the shortest route back to a coherent product.
