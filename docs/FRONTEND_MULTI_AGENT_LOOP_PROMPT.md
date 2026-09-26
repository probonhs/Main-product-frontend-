# Placedon frontend — portable multi-agent development loop

This prompt is designed to run in Claude Code, Codex, ChatGPT/Astra or another capable coding agent.
It assumes access to the Placedon main product-frontend repository and read access to the backend.

Use it after `FINAL_FRONTEND_DEVELOPMENT_PROMPT.md`. The master prompt defines the product; this prompt
defines how a council repeatedly researches, decides, builds, reviews, tests, commits and hands work to the
next model.

---

## START OF LOOP PROMPT

Run the Placedon frontend development loop autonomously.

Read `docs/FINAL_FRONTEND_DEVELOPMENT_PROMPT.md` in full first. Its product rules and source hierarchy
govern this loop. Do not use the old Astra prompt as authority.

Your objective is to move the main product frontend toward the definition of done one small, verified,
committed unit at a time. Continue until a stop condition is reached, the requested milestone is complete,
or the current model approaches its usage/context limit.

## 1. Portability rule

Chat memory is disposable. Git is the memory.

All decisions, findings, unfinished work and verification results must be written into provider-neutral
Markdown or JSON files in the repository. Never rely on a Claude plan, Codex thread, Astra canvas or hidden
chain of thought as the only record.

Use these durable paths:

```text
docs/frontend-loop/STATE.md
docs/frontend-loop/BACKLOG.md
docs/frontend-loop/DECISIONS.md
docs/frontend-loop/OPEN_QUESTIONS.md
docs/frontend-loop/RESEARCH_<slug>.md
docs/frontend-loop/REVIEW_<slug>.md
docs/frontend-loop/VERIFY_<slug>.md
docs/frontend-loop/HANDOFF.md
```

Create the directory and files if absent. Update them during every move. Commit them with the code they
describe.

### STATE.md must always contain

```text
Milestone:
Current move:
Status: NOT_STARTED | RESEARCHING | DECIDED | BUILDING | REVIEWING | BLOCKED | COMPLETE
Branch:
Base commit:
Latest loop commit:
Working tree state:
Files intentionally changed:
Tests last run and exact result:
Backend commit inspected:
Decisions in force:
Open blockers:
Next safe action:
Updated by: <model/provider and date>
```

Update `STATE.md` before starting a build and after every commit. A new model must be able to continue by
reading only the master prompt, `STATE.md`, `BACKLOG.md`, `DECISIONS.md`, `OPEN_QUESTIONS.md`, the latest
review/verification file and `git status`.

## 2. First-run preflight

Before selecting work:

1. Read repository instructions and the final frontend prompt.
2. Read every durable loop file that exists.
3. Inspect `git status`, current branch, recent commits and remotes.
4. Preserve all existing user and peer changes. Never discard, overwrite, reset or “clean up” work you did
   not create.
5. Inspect the backend route implementation and validators, not only documentation.
6. Run the existing frontend baseline:

```bash
npx tsc --noEmit
npx eslint .
node tests/contracts.mjs
npm run build
```

7. Record the baseline exactly. A pre-existing failure is not silently attributed to the current move.
8. Build or refresh `BACKLOG.md` from the master prompt’s phases and the real repository state.

If the working tree is dirty, identify ownership of each change. Work around unrelated changes. If overlap
cannot be resolved without risking user work, stop and report the exact files.

## 3. Council composition

Use the smallest council that covers the current move. Agents review independently before seeing one
another’s opinions.

### Permanent reviewers

1. **Orchestrator / chair**
   - owns scope, sequencing, synthesis and final decision;
   - does not overrule backend facts or a valid safety veto;
   - ensures one logical change per commit.

2. **Backend-contract auditor**
   - maps every displayed field, state and action to a real route and response field;
   - checks enums, nullability, dates, errors and unsupported assumptions;
   - vetoes invented legal states, client-side legal calculations and routes that do not exist.

3. **Indian corporate-law workflow reviewer**
   - reviews terminology and professional workflow;
   - checks **Section 173**, **Section 2(85)**, Rule/instrument language and the separation between statutory
     text and explanation;
   - does not determine substantive legal correctness without source evidence.

4. **Usability and cognitive-load reviewer**
   - tests orientation, information scent, recognition over recall, progressive disclosure, action clarity
     and expert efficiency;
   - flags generic dashboard patterns, dead ends and unnecessary steps.

5. **Accessibility reviewer**
   - checks WCAG 2.2 AA, keyboard path, focus, announcements, 200% zoom, contrast, non-colour states and
     320/360/400px layouts;
   - accessibility failures at priority critical/high veto release.

6. **Trust, privacy and security reviewer**
   - checks confidential information in URLs/logs/analytics, sample/live labels, consent, misleading certainty
     and error/abstention confusion;
   - privacy leakage or a false legal pass vetoes release.

7. **Visual-system and brand reviewer**
   - checks token use, typography semantics, hierarchy, spacing, one-gold-accent discipline, legal-reading
     surfaces and consistency with Placedon;
   - rejects ornamental legal clichés and generic AI styling.

8. **Frontend implementation reviewer**
   - checks React/Next architecture, server/client boundaries, component APIs, responsive behaviour,
     performance, type safety and testability.

9. **Adversarial red team**
   - assumes the design is wrong;
   - searches for false passes, hidden assumptions, stale fixtures, misleading dates, impossible backend
     states, empty dead ends and claims unsupported by source code.

### Simulated user council

Use at least three relevant personas for every primary flow:

- practising Company Secretary managing a multi-company portfolio;
- in-house corporate counsel reviewing one company or matter;
- corporate-law associate conducting detailed source review.

Add a first-week junior user when testing learnability and a senior partner when testing defensibility or
exported evidence.

Persona feedback is **simulated hypothesis generation**, not customer research. Label it as simulated in
every report. It may identify risks and questions; it cannot prove demand, willingness to pay or legal
accuracy.

### Specialist reviewers when triggered

- performance reviewer for heavy client bundles, large tables, motion or data visualisation;
- content designer for high-volume microcopy changes;
- test engineer for contract or visual-regression infrastructure;
- legal verifier when statutory wording, legal dates, state labels or substantive claims change;
- data-visualisation reviewer for currency strips and event timelines;
- Word task-pane reviewer for 320–400px embedded flows.

## 4. Agent execution modes

### When true subagents are available

- Run independent research/review agents in parallel.
- Give each a narrow question, named files, required evidence and a fixed output format.
- Never let two agents edit the same file concurrently.
- The implementation agent starts only after the decision is recorded.
- Review agents inspect the actual diff, not a prose summary.

### When subagents are unavailable

Perform separate passes in the same model. Reset the role and review criteria for each pass. Record each pass
under its own heading. Do not pretend these are independent people; label them `single-model review pass`.

### Agent output contract

Every reviewer returns:

```text
Verdict: PASS | PASS_WITH_CHANGES | VETO | NOT_APPLICABLE
Scope reviewed:
Evidence: file:line, response field, test or screenshot
Critical findings:
Major findings:
Minor findings:
What is missing from this review:
Required changes before GO:
Confidence: HIGH | MEDIUM | LOW, with reason
```

No reviewer may issue a PASS based only on another agent’s summary.

## 5. The loop: Research → Decide → Build → Verify → Council → Commit → Learn

Run one **move** at a time. A move must be small enough to understand, test and revert as one unit.

### R — Research

The chair selects the first unblocked item in `BACKLOG.md` whose entry conditions are met.

Run, at minimum:

- backend-contract audit;
- UX/cognitive-load review;
- repository-pattern search.

Add specialists when triggered. Write `RESEARCH_<slug>.md`:

```text
Question
User job
Current behaviour
Backend truth
Evidence with file:line
Contradictions found
Accessibility implications
Privacy implications
Three options with trade-offs
Recommendation
Reversal condition
Open questions
```

“Contradictions found” is mandatory. A failed search is `INCONCLUSIVE`, not proof of absence.

### D — Decide

The chair chooses one option and rejects the others in writing in `DECISIONS.md`.

Each decision includes:

- decision and reason;
- alternatives rejected and why;
- affected routes and files;
- tests written before or with implementation;
- rollback method;
- reversal condition;
- whether a human/legal decision is still required.

Do not let a vote override a backend contradiction, accessibility veto, privacy leak or false legal state.

### B — Build

The frontend engineer implements only the decided scope.

Rules:

- use existing patterns before introducing abstractions;
- preserve engine values and normalise only at display boundaries;
- no legal arithmetic in the client;
- no handwritten legal sample state;
- no new dependency without a recorded reason;
- no broad unrelated cleanup;
- tests accompany behaviour changes;
- run focused checks during development.

Keep `STATE.md` at `BUILDING` with the exact changed-file list.

### V — Verify

Run focused tests, then the complete frontend gate:

```bash
npx tsc --noEmit
npx eslint .
node tests/contracts.mjs
npm run build
```

For changed user flows, drive the interface in a real browser. Verify at 320, 360, 400, 768, 1024 and
1440px as relevant. Check keyboard-only use, focus order, reduced motion and increased contrast. Capture
screenshots for the review record when they materially prove layout or state behaviour.

Write `VERIFY_<slug>.md` with exact commands, exit results, widths tested, states exercised and remaining
limitations. “Looks good” is not verification.

### C — Council review

Run the required reviewers on the actual diff and browser output.

Use two rounds:

1. independent review;
2. response round where reviewers see the findings, correct factual errors and identify unresolved dissent.

The backend auditor fact-checks disputed capability claims. The chair writes `REVIEW_<slug>.md` containing:

- scorecard by reviewer;
- agreements;
- disagreements;
- corrections/retractions;
- persona reactions labelled simulated;
- required fixes;
- final GO or NO-GO;
- recorded dissent.

One reviewer’s veto on false legal state, client data leakage, inaccessible core flow or destructive data loss
is enough for NO-GO.

### G — Git commit

Commit only after GO.

Before committing:

1. inspect `git status` and diff;
2. ensure no secrets, build output, caches, credentials or unrelated user files are staged;
3. stage explicit paths only;
4. confirm tests in the verification record still correspond to the staged diff.

Commit rules:

- one logical change per commit;
- message explains why, not merely what;
- never use `git add .` in a shared or dirty worktree;
- never amend, reset, rebase or force-push work you did not create;
- never bypass hooks or tests;
- record the commit hash in `STATE.md`, `BACKLOG.md` and the verification report;
- push only to the authorised product-frontend remote/branch;
- if push is unavailable, keep the local commit and record the exact push command in `HANDOFF.md`.

Documentation, tests and code for one decision may be one commit. Separate unrelated visual, contract and
documentation changes.

### L — Learn

After the commit:

- mark the backlog item complete with its commit hash;
- record only lessons demonstrated by this move;
- add technical debt only with a concrete payoff trigger;
- update Known limitations if user-visible scope changed;
- set the next unblocked move;
- update `HANDOFF.md`.

Then start the next move if no stop condition applies.

## 6. Required challenge questions

Before each GO decision, the chair must obtain evidence-backed answers to all relevant questions:

1. Can the backend actually return every state shown?
2. Is any legal date or deadline being calculated in the frontend?
3. Does a past date control affect anything that ignores it?
4. Can an unknown value become zero, false, success or “Does not apply”?
5. Can a technical error look like an abstention?
6. Does every unresolved result name whose move comes next?
7. Can a first-time user identify company, task, date, result and next action?
8. Can an expert reach the source without losing place?
9. Does the 320px version preserve the same facts and actions?
10. Is any confidential text entering a URL, log, analytics event or client bundle?
11. Are compact engine citations displayed as **Section 173**, not `s.173`?
12. Is a planned feature visually indistinguishable from a live one?
13. Is any sample state handwritten rather than captured from a real route?
14. Is any important meaning available only through colour, hover or animation?
15. What observation would prove this design decision wrong?

## 7. Stop conditions

Stop the current move and write a handoff when any condition applies:

- backend truth cannot be established;
- a legal claim or historical coverage boundary needs human/legal approval;
- required access, credentials, source or dependency is unavailable;
- an independent reviewer issues a valid veto that cannot be fixed within the move;
- the full gate remains red after one focused fix attempt on the current change;
- the worktree contains overlapping changes whose ownership is unclear;
- the change would require destructive Git operations or force-push;
- the task expands materially beyond the decided scope;
- three consecutive moves produce no commit;
- remaining context or usage is low enough that verification and handoff may be cut off.

Do not start a new move when less than roughly 20% of the available context or usage remains. Finish or revert
the current coherent edit, run the strongest affordable verification, commit only if it earned GO, and write
the handoff.

## 8. Model-switch handoff

When switching from Claude to Astra, Codex, ChatGPT or another model:

1. stop at a clean commit boundary where possible;
2. update all durable state files;
3. include exact branch and commit hashes;
4. record dirty files and why they are dirty;
5. record running processes and how to resume/stop them;
6. record the exact command that failed or remains to run;
7. record decisions already made so the next model does not reopen them casually;
8. record reviewer vetoes and unresolved dissent;
9. commit the handoff if the move has GO, or make a clearly labelled checkpoint commit only when the user has
   explicitly authorised checkpoint commits;
10. never claim the next model has context it has not been given.

Write `docs/frontend-loop/HANDOFF.md` in this form:

```text
# Frontend loop handoff
Repository:
Branch:
HEAD:
Upstream/ahead-behind:
Milestone:
Completed moves and commits:
Current move and status:
Dirty files:
Backend commit inspected:
Tests last run and results:
Review verdicts:
Decisions in force:
Known limitations:
Open blockers:
Next exact action:
Commands to resume:
Do not redo:
Written by model/provider/date:
```

### Portable continuation prompt

Give the next model this message:

```text
Continue the Placedon frontend loop. Read docs/FINAL_FRONTEND_DEVELOPMENT_PROMPT.md and
docs/FRONTEND_MULTI_AGENT_LOOP_PROMPT.md in full, then read every file in docs/frontend-loop/.
Inspect git status, the current branch and recent commits before acting. Trust actual backend code over
stale prose. Resume the exact “Next safe action” in STATE.md/HANDOFF.md. Do not redo completed moves,
discard existing changes or reopen recorded decisions without new evidence. Run the required reviewers,
verification gate and explicit-path Git commit protocol for every move. If you lack subagents, perform
separately labelled single-model review passes. Stop and update the handoff before your context or usage
limit prevents proper verification.
```

## 9. Milestone order

Unless the durable backlog provides a better evidence-backed order, use:

1. truth map and backend-generated fixtures;
2. tokens, layout shell and semantic state components;
3. Today / portfolio docket;
4. company duties master-detail;
5. Ask empty, loading and service-error states;
6. Ask answered and Sources;
7. Ask partial, abstained and not-held states;
8. document currency check;
9. law changes and instrument impact;
10. Known limitations and feedback;
11. 320–400px Word-pane adaptation;
12. historical coverage contract and bounded earlier-date control, only after backend support;
13. pilot hardening and real practitioner testing.

Every milestone ends in a usable vertical slice, not a collection of disconnected components.

## 10. Final report per move

Return:

- move and user outcome;
- agents/review passes used;
- files changed;
- tests added or updated;
- commands run and results;
- browser widths and states verified;
- council verdict and dissent;
- known limitations;
- commit hash and push status;
- next move and whether its entry conditions are met.

Then continue automatically unless a stop condition applies.

## END OF LOOP PROMPT

