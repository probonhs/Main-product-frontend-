# PLACEDON Mockup Review: Council Report

**Scope:** Mockup A "Workspace" (`Main.dc.html`), Mockup B "The Sentence" (`Sentence.dc.html`) and Mockup C "Guided" (`Guided.dc.html`). Sample company: Sample Company Pvt Ltd. Board "today" is 26 Sep 2026.
**Record used:** ten Round 1 reviews, four simulated practitioner personas, ten Round 2 debate positions with votes, one independent fact-check, and three extra checks by the chair (listed in §5).

---

## 1. Verdict

None of the three mockups should be built as it stands. The biggest defect is shared by all three and has nothing to do with layout: the sample data contradicts the engine. They show G.S.R. 880(E) as "not yet checked", although it is held as `CORROBORATED`. They show s.173(1) and s.149(1) as "Met", which the engine cannot return. They show "When is our AGM due?" as "Answered", but `/v1/ask` returns `partial` for it. Every visual hierarchy in the three files was built around those invented states.

The council agreed unanimously in Round 2 (10 of 10 votes) on a hybrid called **"A-shell, engine-true docket"**:

- **From A:** the information architecture. That means the duties master-detail, Ask with a Sources column, and an attention home. The home is recast as a multi-entity docket, with the single company as the drill-down.
- **From B:** the brand devices only. That means the per-provision currency strip with rupee figures, the single gold "you are here" cursor, and an as-of date control limited to what the engine covers. B's sentence shell and its date travel across every view are cut.
- **From C:** the plain language (rewritten in the house register), the glossary as a drawer that starts closed, and "How we got this" as a collapsible trail built only from response fields. C's step-gated wizard is cut.
- **Cut from the pilot:** Drafts, OFAC/IBBI/counterparty Watch, and file upload.

The gate before any build: regenerate every sample state from real engine output, and have the founder settle the buyer question in writing.

---

## 2. Scoreboard

| Member | A | B | C | Round 1 preferred | Round 2 vote | Changed mind? |
|---|---|---|---|---|---|---|
| Usability & first-time comprehension | 7 | 4 | 6 | A base | A-core hybrid (+ portfolio) | Yes (portfolio, engine-true samples) |
| Accessibility (WCAG 2.2 AA) | 5 | 3 | 6 | **C** shell | Single-column-first core, A content | Partly (dropped C's wizard) |
| Backend alignment | 5 | 3 | 4 | A shell | A-shell, engine-true | Yes (portfolio; narrow date travel kept) |
| Brand identity | 5 | **7.5** | 5 | **B** frame | A structure in B's skin | Yes (B's date travel dishonest) |
| Legal accuracy & honesty | 5 | 3 | 4 | A base | A shell hybrid | Yes (s.96 state; OFAC/IBBI cut) |
| Product strategist | 6 | 5 | 4 | A hybrid | A-shell docket | Yes (bounded date control) |
| Interaction & visual design | 6 | 5 | 6 | A shell + C home | A-shell docket | Yes (portfolio; gold-muted critical) |
| Frontend feasibility | 6 | 3 | **7** | **C** shell | A-routed | Yes (C's step 2 is invented) |
| Trust, privacy & data protection | 5 | 3 | 4.5 | **C** shell | A shell hybrid + trust layer | Yes |
| Devil's advocate | 4 | 6 | 4 | None (portfolio docket) | A-shell, portfolio-first | Yes (retracted SOURCE_880 claim) |
| **Mean** | **5.40** | **4.25** | **5.05** | | | |

**Tally**
- **Round 1 preferred base:** A 5, C 3, B 1, none 1.
- **Round 2 vote:** 10 of 10 for an A-derived hybrid. Accessibility attached a binding condition: design single-column first.
- **Simulated personas' preference:** A 3 (senior partner, GC, practising CS), C 1 (week-one associate), B 0.

The scores reward A for the parts that matter (the detail panel, urgency on arrival, fewest unsupported claims). They were given before the members learned how much of A's sample data is false. Several members said so explicitly (Devil's advocate: "Usability researcher score A=7 … too high while the sample data is wrong").

---

## 3. The discussion

### Where the council agreed early and did not move

- **False passes are the number-one trust risk.** In Round 1, three members found independently that s.173(1) "Met" cannot happen: the Legal auditor, the Backend engineer and the Usability researcher. `_decide_board` refuses while s.2(85) is undetermined, and three meetings in September is not four. All four simulated personas named this, unprompted, as a dealbreaker. The Usability researcher's Round 2 summary quoted the CS persona: *"Once I see one confident green tick that is wrong, I stop trusting every green tick."*
- **One status grammar.** At least five members reached the same conclusion from different starting points (Usability, Accessibility, Interaction, Frontend, Backend). The same black chip currently means Met, Verified, Answered, Checked and Done. The Interaction critic's three-component split was adopted by all:
  1. obligation row states (5, from `ROW_STATES`);
  2. the Ask turn state, shown as a heading word;
  3. plain process ticks.
- **Cut Drafts and OFAC/IBBI.** The Strategist cited the business plan exclusion. The Trust reviewer cited `ofac_sdn.py`: an empty result means "not on the list as published on <date>", "fuzzy matching invents hits", and the licence is unverified. The Backend engineer confirmed that neither has a route.
- **A 360px frame is a precondition.** Accessibility raised it as critical. The Interaction critic, the Strategist and the Frontend lead agreed. This requirement alone rules out B's shell.

### The disagreements, in the order they were argued

**1. Is the moat broken, or was the copy wrong?** In Round 1 the Devil's advocate's headline was that the currency strip "abstains in every demo state", citing `prescribed_thresholds.py:108 SOURCE_880 = 'UNRESOLVED'`, and he recommended holding the UI decision. In Round 2 five members challenged this: Backend, Legal, Strategist, Interaction and Trust. Their evidence was that SOURCE_880 is only the fallback URL marker, and that the registration record reads `VERIFIED_INSTRUMENT / CORROBORATED`. The Devil's advocate retracted: *"I was wrong … The moat does not abstain; the mockups under-claim it."* The fact-check refuted his original claim. **Outcome:** do not hold the decision. Regenerate the samples. The hero demo shows ₹10 cr under 880(E), in force from 01 Dec 2025.

**2. Which shell: A, B or C?**
- **Round 1 split three ways.** Brand wanted B as the frame (B is the only mockup that matches the site's ink shell, and it has one gold element). Accessibility, Frontend and Trust wanted C: it reflows, it is URL-addressable, and its intake step is a natural place for disclosure. The rest wanted A.
- **Against C.** The Backend engineer showed that C's step 2 narrates engine stages that no route returns: contract.md D11 says there are no stages on the general path, and `ask_contract` rejects `effective_from` on section citations. Three of the four personas rejected the gated wizard. The CS persona: *"120 clicks I don't have."* The Interaction critic's reply to Accessibility: *"C's structural advantage is really its single column, not its wizard."* The Frontend lead added that nothing in the mockup markup survives the port anyway, so whether the result reflows depends on how it is rebuilt, not on which mockup it came from. Frontend, Trust and (partly) Accessibility then switched to A.
- **Against B.** Backend, Legal, Usability and the Devil's advocate all attacked B as a frame. PLAN_13 §9 limits `as_of` to today in v1. B's date control silently ignores Watch and Draft. There is no free-text Ask. The 50px sentence cannot reflow. Brand conceded: *"I now keep B's visual identity … not its interaction model."*

**3. Date control: fixed at today, bounded, or open?**
- The Interaction critic and (in Round 1) the Legal auditor wanted the cursor fixed at today.
- The Strategist and the partner and GC personas wanted any date.
- The Backend engineer settled it with live runs: the engine does honour `as_of` for thresholds. At 14 Aug 2025 it returns 700(E) at ₹4 cr. Section text, however, is always today's consolidation, and anything before 15 Sep 2022 raises `ThresholdUnavailable`.
- The Legal auditor then called the fixed-cursor position "over-corrected". The Strategist withdrew the unrestricted picker.

**Outcome:** a control bounded by what the engine covers for each figure, gated on a written PLAN_13 §9 amendment. v1 defaults to today. The Interaction critic still holds that v1 ships fixed at today unless the amendment exists, which is consistent with the gate.

**4. Portfolio: gate or later layer?**
- The Strategist and the Devil's advocate called single-company scope the wrong unit of work. The CS, GC and partner personas said so independently (*"I have forty clients. Where is the list of forty clients?"*).
- The Frontend lead objected that no profile store exists, since `compliance-pack` is stateless and events ignore the CIN.
- The Usability researcher argued that the portfolio sits on top of the per-company views and does not replace them.

**Outcome:** design the docket now, and put the entity in the route from day one (`/app/c/[cin]/…`). The portfolio index ships once persistence exists. The founder names the buyer before build.

**5. Glossary.** The Strategist wanted it cut and the Devil's advocate called it patronising. The Usability researcher, Accessibility and the Interaction critic pointed to the junior persona: *"the first time any legal database has explained what a G.S.R. is without making me feel stupid"*. **Outcome:** an on-demand drawer, closed by default, with dotted-underline `<dfn>` popovers.

**6. Lexicon.** Brand insisted on PLAN_13 §27's "Abstained in part", and the chair confirmed it at `PLAN_13_ASSISTANT_UX.md:970` and `:1661`. The Usability researcher accepted it only if every badge carries its reason on the same line, because the junior persona read "Not held" as "meeting not held". **Outcome:** use the brand words plus an inline reason, then test with 5 users before freezing them.

**7. Which abstention to show in the demo.** Backend and Legal proposed s.177 / Rule 6. The Devil's advocate objected that practitioners read "can't tell" on s.177 for a private company as ignorance, and three personas said exactly that. **Outcome:** demo s.149(3) for a missing fact (the user can fix it) and s.203 KMP Rules for a missing rule. Review Rule 6 in the backend.

**8. The s.137(2) backstop.** The Strategist and the Devil's advocate both claimed in Round 2 that `_decide_aoc4` already implements s.137(2). **That claim is wrong.** Both the fact-check and the chair's re-read of `obligations.py` show that `_decide_aoc4` returns `None`, "no AGM date was given", with no should-have-been-held branch. Only `_decide_annual_return` (s.92(4)) has one. **Outcome:** s.137(2) is a backend ticket. s.92(4)'s outer date is only a UI omission.

**9. Who computes deadlines.** The Legal auditor and the personas want AOC-4 and MGT-7 outer dates and the s.101 notice-by date shown. The Frontend lead: *"If the UI does the date arithmetic, we have created a second, unaudited legal engine in TypeScript."* **Outcome:** the backend exposes derived deadlines, including an `agm.py` route, and the UI only renders them.

---

## 4. Simulated customer feedback

> **These are simulated personas written by a model, not interviews.** Treat every quote, objection and price as a hypothesis to test with real practitioners (§8). The legal points they raise are marked where the record could not verify them.

### 4.1 Senior partner, corporate/M&A, large Mumbai firm (next to the buyer, not the buyer, per BUSINESS_PLAN §3)

- **Preferred:** A, with B's any-date as-of control and currency strip, and C's "We check" turned into real evidence.
- **Key quotes:**
  - *"You quoted the opening words of 96(1) and gave me the answer from the proviso. That is the exact failure that got the last AI tool thrown out of my practice group."* (The fact-check confirmed this at Main.dc.html:396.)
  - *"Honestly, 'can't tell' is the most reassuring thing on the screen. It's the green ticks that worry me."*
  - *"The 'as of' date is the only thing here I'd pay for."*
- **Objections:**
  - s.96 ignores the fifteen-month limb and the ROC extension.
  - No s.101 notice advice four days out.
  - s.137(2) backstop missing.
  - s.173 "Met".
  - "Law has changed" rests on an instrument the product calls unverified.
  - Draft notice has no time or agenda and certifies itself.
  - OFAC is not a sanctions clearance for India.
  - No pinned corpus version or hash on outputs.
- **Dealbreakers:**
  - any false pass;
  - a quote that lacks the operative words;
  - no data-residency or confidentiality statement before upload;
  - no reproducible version or date on outputs;
  - canned-only interaction (B).
- **Willingness to pay (simulated):** a free pilot on two mandates, then ₹3–6 lakh a year firm-wide for exportable, date-pinned DD schedules across many entities. Zero if a false pass appears.

### 4.2 General Counsel, listed manufacturing group (13 entities)

- **Preferred:** A, plus B's free-entry as-of control and C's step 2 trace as an expandable panel on each row.
- **Key quotes:**
  - *"Where's the dropdown for the other twelve companies? I'm not buying thirteen logins."*
  - *"Three board meetings is not 'Met'."*
  - *"Tell me the notice deadline, not the meeting deadline."*
  - *"The honest 'we couldn't read the scanned minutes, nothing here is a finding' line — that's the first thing in a legal-tech demo that's made me trust a vendor."*
- **Objections:**
  - The s.2(85) proviso (holding/subsidiary) would settle all 12 subsidiaries without thresholds, but the mockups never ask. (Plausible: `classify.py` models this. Not independently fact-checked.)
  - No calendar, owners or export.
  - SEBI LODR is out of scope.
  - An inconsistency on AI use: see §9.
- **Dealbreakers:**
  - single-entity only;
  - a "Met" that rests on facts the product never collected;
  - internal contradictions on verification status;
  - no export or audit trail;
  - unclear model use.
- **Willingness to pay (simulated):** nothing for the single-entity version. About ₹1.5–3 lakh a year for the group once it has multi-entity support, a calendar, export and an audit trail, after a paid one-quarter pilot.

### 4.3 Practising Company Secretary, Bengaluru, about 40 clients (the named buyer)

- **Preferred:** A, with a client switcher and portfolio home, and B's timeline plus date picker as a feature. C only as an optional "explain" mode.
- **Key quotes:**
  - *"I have forty clients. Where is the list of forty clients?"*
  - *"Audit committee, can't tell, for a private limited? … That one row makes me doubt the rest."*
  - *"Copy with sources is the one button I'd press daily."*
  - *"ComplyRelax is free. For money I need something ComplyRelax can't do."*
- **Objections:**
  - Needs deadlines expressed as MCA forms (AOC-4, MGT-7/7A, ADT-1, DIR-3 KYC), not only section numbers.
  - s.101 short-notice consent and GNL-1 extension are missing.
  - WhatsApp scans fail.
  - The draft notice cannot be sent as is.
  - OFAC is irrelevant to her clients.
- **Dealbreakers:**
  - single-company;
  - one wrong "Met";
  - scans failing by default;
  - drafts that are not sendable;
  - B as the main UI;
  - C's wizard at her volume;
  - per-client pricing.
- **Willingness to pay (simulated):** ₹1,000–2,000 a year per practice to try it. ₹3,000–6,000 a year only with a 40-client deadline dashboard, form-level dates with late-fee exposure, and the point-in-time timeline. Drafting is worth zero to her because ComplyRelax is free.

### 4.4 Week-one junior associate, mid-size Delhi firm

- **Preferred:** C, then A's detail panel and "9 of 15" honesty. B last.
- **Key quotes:**
  - *"Where do I put MY company's CIN?"*
  - *"I read '□ Not held' as 'the meeting wasn't held'."*
  - *"I moved the date to August 2025 and the Watch list still showed me September 2026. After that I didn't believe the date on anything."*
  - *"The 'We check' list in C is the bit I'd actually paste into my email to my senior."*
- **Objections:**
  - No way to enter a real company.
  - Coverage is partial and silent (7 or 9 duties shown as "the position").
  - "Is this a small company?" is listed as a duty.
  - CSR "doesn't apply" with no figures or year.
  - No "not legal advice" line.
- **Dealbreakers:**
  - any wrong green row;
  - sample-only;
  - silent partial coverage;
  - a date control that ignores the date;
  - "Approve" on a legally incomplete draft.
- **Willingness to pay:** none personally, since the associate is not the buyer. Would push for a firm trial if the product produced an exportable, dated memo for a real CIN.

**Pattern across personas:** all four rank a false pass above every layout concern. Three of four name single-entity scope as disqualifying. All four independently single out the as-of/timeline idea as the one differentiator. Nobody wants C's wizard for repeat use.

---

## 5. Fact-check outcomes

| # | Claim | Raised by | Verdict | Evidence |
|---|---|---|---|---|
| 1 | 880(E) and 700(E) are held as CORROBORATED, so "not yet checked" copy is false | Backend, Legal, Strategist | **CONFIRMED** | `gsr880e_registration.json`: VERIFIED_INSTRUMENT, CORROBORATED, match "identical". Same for 700(E). `currency.py` ~252-258. Caveat: `downloaded_from/at` are null (provenance_note). Live serving was not re-run by the fact-checker. |
| 2 | `SOURCE_880='UNRESOLVED'` proves 880(E) is unresolved | Devil's advocate | **REFUTED** (claimant retracted) | `prescribed_thresholds.py:103-108`: a fallback URL marker. State comes from the registration record. |
| 3 | s.173(1) "Met" is impossible while s.2(85) is undetermined | Legal, Backend, personas | **CONFIRMED** | `obligations.py _decide_board` 249-275 returns None. Main.dc.html:363 shows `met`. |
| 4 | s.96: the Registrar extension limb is not decided, so "Answered" overclaims | Legal, personas | **CONFIRMED** | `_decide_agm` docstring. Main.dc.html:396 has `answered`. |
| 5 | s.92(4) has a should-have-been-held branch; s.137 has no s.137(2) branch | Legal, partner | **CONFIRMED** | `_decide_annual_return` 447-470 vs `_decide_aoc4` 429-445. Re-checked by the chair. |
| 5b | `_decide_aoc4` already implements s.137(2) | Strategist, Devil's advocate (Round 2) | **REFUTED** | Same lines: `return None, "…no AGM date was given"`. |
| 6 | s.177 returns can't-tell for all non-listed-public companies | Legal, CS, associate | **CONFIRMED** (engine behaviour) | `_audit_committee` 145-164. The legal claim that Rule 6 covers only public companies is **UNVERIFIED** (rule text not reviewed in corpus). |
| 7 | 8 routes including /v1/ask and /v1/mca-strip; no drafts, upload or OFAC routes | Backend, Frontend, Devil's advocate | **CONFIRMED** | `api.py` docstring lines 8-15 and dispatcher 611-660. |
| 8 | "No OFAC code in the backend" | Legal | **PARTLY** | Code exists in `feeds/ofac_sdn.py` and elsewhere. No route. LICENCE_UNVERIFIED. |
| 9 | OFAC "✓ Checked" contradicts the backend; "similar name" IBBI match unsupported | Trust | **CONFIRMED** | `ofac_sdn.py:58`, `:64`. Sentence.dc.html:286-287. |
| 10 | `drafting.py` has only the AGM notice; approve needs a named reviewer | Backend | **CONFIRMED** | `drafting.py:9`, `:58`. |
| 11 | PLAN_13 forbids past `as_of` in v1; no point-in-time text | Backend, Legal, Interaction | **CONFIRMED** (thresholds are dated from 15 Sep 2022) | `PLAN_13:842`, `ask.py:615`, `prescribed_thresholds.py:310,358`. |
| 12 | B's timeline shows 92(E), which is not held; marks are hard-coded | Usability, Legal, Backend | **CONFIRMED** | Sentence.dc.html:237-245. |
| 13 | B's Watch and Draft ignore the date under an "as of" header | Usability, associate | **CONFIRMED** | Sentence.dc.html:285-290 vs :78. |
| 14 | A's s.96(1) quote is the opening words, not the proviso | Partner | **CONFIRMED** | Main.dc.html:396. |
| 15 | A's Ask form reloads on Enter | Accessibility | **PARTLY** | Implicit submission applies in HTML. The dc runtime is absent, so this cannot be confirmed. |
| 16 | Focus outlines are 1.0:1 on A/C chrome and B's sheet | Accessibility | **CONFIRMED** | Main:17/24, Guided:17, Sentence:17/74. |
| 17 | Contrast figures (5.21, 1.49, 1.68, 1.16 …) | Accessibility | **PARTLY** | The listed pairs recompute correctly. "All text passes" was not exhaustively checked. |
| 18 | C's step-1 inputs are read-only but styled as editable | Usability, personas | **CONFIRMED** | Guided.dc.html:103. |
| 19 | C claims "Checked each section is in force" | Backend, Legal | **CONFIRMED** (unbacked) | Guided:207, 213. `point_in_time_verified=False`. |
| 20 | `types.ts` is stale (six routes; "/v1/ask DOES NOT EXIST") | Frontend | **CONFIRMED** | `types.ts:1-14`. |
| 21 | Engine enums: 15 obligations, 5 ROW_STATES, 3 Ask STATES, KINDS, OUTPUT_CLASSES | Multiple | **CONFIRMED** | `obligations.py:53`, `ask_contract.py:13,18`, `event_log.py:46,52`. |
| 22 | AGENTS.md reserves #9F743B for citations and #5B6472 for abstention | Brand, Interaction | **CONFIRMED** | `AGENTS.md:14`. Chip misuse at Main:336 was not re-read line by line. |
| 23 | UX spec cut document upload | Legal | **CONFIRMED** | `UX_INTERACTION_SPEC.md:213`. Conflicts with PLAN_17 M5 (not re-verified). |
| 24 | dc runtime `onChange`/`disabled='false'` semantics | Usability, Accessibility | **UNVERIFIED** | No `support.js` present. Irrelevant for the Next.js rebuild. |
| 25 | PLAN_13 §27 replaces "Partly answered" with "Abstained in part" | Brand | **CONFIRMED** (chair) | `PLAN_13_ASSISTANT_UX.md:970`, `:1661` (§27, 2026-09-17). Row 1 at :52 is superseded. |
| 26 | "No language model decides anything" | Brief / GC persona | **CONFIRMED for the engine; open for the business** (chair) | `contract.md:5`, D13: `uses_model` always false. But `BUSINESS_PLAN.md:69-77` measures "₹2.91 per answer … (Sonnet)". The two documents must be reconciled. |

**Weighting applied:**
- Claim 2 is dropped. It was the Devil's advocate's Round 1 critical.
- Claim 5b is dropped. It was the Strategist and Devil's advocate Round 2 challenge.
- Claim 6's legal half is flagged for practitioner verification.
- **Caveat on the live engine outputs.** Every "live" figure in this report (the `compliance-pack` summary 0/10/3/1/1, `/v1/ask` returning partial, ₹10 cr served) comes from the Backend engineer's scratch copy, patched for Python 3.9. None was re-run on the real checkout. Treat them as strong but provisional.

---

## 6. Critical and major findings that must be fixed

### 6.1 Legal accuracy and engine truth (critical)

| Finding | Fix |
|---|---|
| Sample states contradict the engine in all mockups: 880(E)/700(E) "unchecked"; s.173(1) and s.149(1) "Met"; s.96 "Not met" with 4 days left, when the engine returns APPLIES_UNDETERMINED; AGM shown as "Answered". | Record golden fixtures from `/v1/compliance-pack`, `/v1/ask`, `/v1/document-check` and `/v1/company/{cin}/events` on the real checkout. Hand-written legal state is banned. The realistic baseline (about 10 undetermined, 3 cannot-determine) must be designed for, not hidden. |
| s.96 answer omits the fifteen-month limb, the ROC extension (GNL-1) and the s.101 21-clear-day notice consequence. | Show the AGM as a derived-deadline item (backend route on `agm.py`): "By 30 Sep 2026 under the six-month limb, or earlier if the last AGM was before 30 Jun 2025; unless extended by the RoC (not decided)". Name "date of last AGM" as missing. Show the notice-by date. |
| A's quote cites the s.96(1) opening words, not the operative proviso. | Quotes must contain the words the answer relies on. |
| s.137(1)/s.92(4) rows say the deadline "isn't set yet". | Render the engine's s.92(4) outer date (29 Nov 2026) now. Add a s.137(2) branch to `_decide_aoc4` (backend) for 30 Oct 2026. |
| "⟳ Law has changed" on documents rests on 880(E) and treats a *raised* threshold as a risk. | The verdict must come from the engine's superseded / cannot_verify / verified buckets. Report the direction of change, and flag only where the outcome could flip. |
| C's "Checked each section is in force" and "No notification has changed this rule". | Delete them. Only `figures[].effective_from` may say "In force from". Every answer shows the law_version line: "current consolidation, not a point-in-time version". |
| Scope overclaim: "every duty the Act gives" appears in all three. | Use "the 15 duties Placedon checks today" everywhere, keep all 15 reachable, and add a "what we don't check" link. |
| Draft notice certifies its own dispatch and lacks time, agenda and signatory. | Drafts are cut. If they return, no self-certifying text, all SS-1 elements present before Approve, and a named approver. |

### 6.2 Trust and privacy (critical)

| Finding | Fix |
|---|---|
| OFAC "no match" is shown with the met-style tick. | Cut for the pilot. If ever shown: "Not found on <list> as published on <date>; exact-name only; not a sanctions clearance". Never the met chip, and nothing at all while LICENCE_UNVERIFIED. |
| IBBI "similar name" places a named company next to "insolvency". | Cut. If ever shown: match on CIN or exact name, include the attribution text, and require a logged human confirmation before the name appears in any title. |
| Upload has no residency, retention, deletion, access or processor disclosure. | Upload is cut from the pilot. Before it ships: on-screen disclosure, per-document delete, and a Settings screen with retention, evaluation consent off by default and delete-all, subject to DPDP counsel review (PLAN_17 step 0.6). |
| Approval is anonymous. | Show the named approver, IST timestamp and version. Use "Approved for use by <name>". Offer maker-checker. |
| User input and verified facts look the same. | Put a provenance tag on every ✓ row. Show output_class (VERIFIED_FACT / DETERMINISTIC_CONSEQUENCE / SIGNAL). A SIGNAL never uses the verified style. |
| Outputs cannot be reproduced later. | Every answer and export carries the as-of date, law_version, corpus fetched_at and hash, the scope sentence, "not legal advice", and a sample/live flag. |

### 6.3 Backend alignment (critical and major)

- **Stale site client.** `types.ts` and `AGENTS.md` deny that `/v1/ask` exists. Add a zod `askSchema` (a discriminated union on state) and `ask()` / `mcaStrip()` in both providers, then extend `tests/contracts.mjs`.
- **Document check** takes facts plus `document_date`, not a file. Render the three buckets, `governed_then → governs_now`, `coverage.sentence` and the unchecked list.
- **Watch** is law-change only and ignores the CIN. Show the `_V0_SCOPE` sentence verbatim, both dates ("at" and "known_at"), and a causal chain taken only from `/instruments/{frag}/affected`. A's "Board's report duties" link is invented.
- **Unshown engine fields.** Summary counts, `evidence_state`, `blocked_by`, `missing_facts` and `what_it_is_not` must all be rendered.
- **No TypeScript legal arithmetic.** Deadlines, notice dates and backstops come from the engine or are not shown.

### 6.4 Usability (critical and major)

- **B's date control lies.** An as-of header sits over content that ignores the date. Rule: a date control applies to every visible view, or the view hides the control and says why.
- **Non-answers are dead ends.** Split them visibly:
  - **"We need from you"** (APPLIES_UNDETERMINED): name the missing fact and give an inline input.
  - **"Placedon is still verifying"** (CANNOT_DETERMINE): show the `blocked_by` rule, with an owner and ETA.
  - **"Signal, not a finding."**

  With real engine output, most rows will be one of these three. This is the design problem that decides churn.
- **Urgency is hidden in C.** A's home shows urgency but derives it from false states. Replace KPI tiles with a ranked, date-first deadline list ("Due 30 Sep 2026 · 4 days") that is separate from the state chips.
- **Dead controls.** "Copy with sources", "Was this useful?", "+ Upload" and "9 of 15" with no way to see the rest. C's read-only inputs look editable. Disable controls with a stated reason, or wire them up. Replace "Was this useful?" with "This is blocking me" on every partial or can't-tell item, logged with the provision ID.
- **Jargon.** Glossary drawer adding AGM, CSR, small company, RoC, Registrar and G.S.R. "Not held" becomes "Abstained: law not in Placedon (FEMA)".

### 6.5 Accessibility (critical and major)

- **Reflow.** A fixed 1440 board with `overflow:hidden` and fixed-px grids fails 1.4.10 and 1.4.4. Require 360px and 320-400px (Word pane) frames. Below 820px, use one column. Detail views become routes.
- **Focus.** The focus ring is 1.0:1 on ink chrome and on the cream sheet. Use a two-tone ring (ink plus cream halo) at 3:1 or better everywhere.
- **Silent state changes.** Each result is an `<article>` with an `h2`. Move focus to that `h2` on change, announce the state word in a polite live region, and use `role=alert` for ServiceError.
- **Selection is visual only.** Add `aria-current`, `aria-pressed` and `aria-selected`. Use radio groups instead of trays. Selection indicators must reach 3:1 (A's row tint is 1.16:1).
- **Provenance by underline style alone.** Carry it in text or `aria-describedby`.
- **Timeline.** Any timeline needs a real `<table>` underneath, and the cursor needs a text label.
- **Boundaries and type.** Input and secondary-button borders must reach 3:1. Minimum text 12px, and 13px for sections, instruments and dates. Put glyphs in `aria-hidden` spans.

### 6.6 Brand (critical and major)

- **Colour misuse.** Gold-muted #9F743B is used on "needs action" chips, and Cool Grey dashed on the sample badge, the "What to do" box and the roadmap card. Fix: "needs action" is ink-only (bold border plus "!"), and a lint rule enforces the token reservations.
- **Lexicon.** Use Answered / Abstained in part / Abstained / Not held (PLAN_13 §27), each with an inline reason.
- **Mono coverage.** Mono is missing in prose, headlines and titles. Apply it with a tokenizer that wraps every section, instrument, ₹ figure and statutory date. No mono on row numbers.
- **Accent rule.** Exactly one Brass Gold element per view. C has none. A has two.
- **Register.** Cut the feature tour and "the way you'd ask a colleague". Write claim, then basis.
- **Assets.** Use the brand-kit logo and the 3px radius. No italics on legal content (B's slots become roman).
- **ServiceError** uses a solid rule. Amend PLAN_13 §7.11's dashed border.

### 6.7 Engineering (major)

- The mockups are specs only and none of their markup is reusable. Rebuild in Tailwind v4 against `tokens.ts`.
- State must live in URLs: `/app/c/[cin]/duties/[obligationId]`, `?asof=`, `/ask/[turnId]`.
- One `StateChip` and label table in `src/lib`, keyed on ROW_STATES (5), Ask STATES (3) and output_class (3). Snapshot tests assert that out_of_scope, CANNOT_DETERMINE, APPLIES_UNDETERMINED and SIGNAL never share a style.
- Split the client-safe helpers from the server-only providers, using the `server-only` package or an eslint rule.
- No streaming: use a server action with `useActionState`, and correct PLAN_17 M10 to match.
- Wire a real test runner (vitest or `node:test`) plus Playwright into `package.json` before M10.

---

## 7. The final agreement

### Direction: "A-shell, engine-true docket"

**Structure (from A, rebuilt, not ported)**
1. **Portfolio docket home.** Entities × nearest hard deadline, with non-answers grouped by cause ("s.203 KMP Rules unreviewed blocks 31 clients"). It drills down to a **per-company attention list**: a ranked, date-first list of deadlines and "we need from you" counts, with no KPI tile grid and no feature tour. The entity is in the route from day one. The index ships when a profile store exists.
2. **Duties.** All 15, with summary counts and a scope line in the header. Master-detail with "What we found / Still needed / The rule". The detail is a route and collapses to list → detail below 820px. Missing-fact rows get inline inputs.
3. **Ask + Sources.** Composer first. A single evidence stack:
   - stamp;
   - state heading word;
   - NOT CONFIRMED;
   - CONFIRMED;
   - figure (value · instrument · in force from · evidence_state);
   - verbatim text with the text-basis line;
   - sources.

   All three Ask states are demonstrated, with the flagship "Are we a small company?" answered at ₹10 cr under G.S.R. 880(E), in force from 01 Dec 2025.
4. **Document check.** A form with `document_date` plus facts. Renders the engine's three buckets. No upload, OCR, signature or "What it is ✓ Verified".
5. **Watch.** Law-change events only, with an output_class badge, both dates, `_V0_SCOPE` verbatim and a causal chain taken from `/affected`.
6. **ServiceError card.** Solid rule, no chip, the question kept, "Send again".

**Grafted from B:** the per-provision **currency strip** in the Sources column, built only from engine-held instruments with ₹ figures on each node, an `evidence_state` style and a table fallback. The **single gold "you are here" cursor**. An **as-of control** that defaults to today, and only after a written PLAN_13 §9 amendment accepts past dates within each figure's coverage floor (s.2(85) from 15 Sep 2022). Views that ignore the date hide the control, and past views print "section text is today's consolidation". Visually: ink chrome with cream answer surfaces.

**Grafted from C:** plain-language copy rewritten in the house register. A **glossary drawer** that starts closed, with `<dfn>` popovers. **"How we got this"** as a collapsible trail built only from response fields (`law_version`, `evidence_pack.retrieval_query`, `not_confirmed`, `cannot_verify`). C's one-column order and its `<ol>` / `aria-current` semantics for any multi-input flow.

**Cut from the pilot:**
- B's sentence shell and its global date travel;
- C's step gating and invented "We check" ticks;
- A's feature tour, KPI tiles and "Was this useful?";
- Drafts;
- OFAC, IBBI and counterparty Watch;
- file upload, OCR and signature forensics;
- the permanent glossary column.

### Non-negotiables everyone accepted

1. Every sample value and state is recorded from real engine output. No state the engine cannot return. No abstention with a false reason.
2. No "Met" or "Answered" unless the engine returns APPLIES_SATISFIED or `answered`. A dependency rule holds: no pass while a row it depends on is undetermined.
3. One verification status per instrument, shown identically everywhere.
4. Three separate state components, from one label table in code, keyed to backend enums. out_of_scope, abstain, SIGNAL and ServiceError never share a style. Every abstention badge carries its reason inline.
5. Non-answers say whose move it is: "we need from you", "Placedon is still verifying" or "signal".
6. Any date control is honest about what it governs and bounded by what the engine covers. A written PLAN_13 §9 amendment comes before any past date.
7. Coverage is honest: 15 duties, a denominator, a "not covered" link, and never "every duty the Act gives".
8. No legal arithmetic in the client.
9. 360px and pane frames of the home, the Ask partial answer and Duties pass reflow before sign-off. The accessibility acceptance criteria in §6.5 gate every merge.
10. Colour tokens are enforced by lint. Exactly one Brass Gold element per view. Mono for every citation.
11. Every output and export carries its as-of date, law_version, corpus version, scope, "not legal advice" and sample/live flag. Approvals name the person.
12. Features without a route are absent or explicitly marked "not available yet".
13. The founder names the buyer (practising CS per BUSINESS_PLAN vs in-house per PLAN_17) in writing before the home is finalised.

### Dissent recorded

- **Brand guardian:** wants the full canvas in the ink shell, matching the site. The Interaction critic and the Frontend lead want ink chrome only, with cream on every stateful surface, because status hues fail contrast on ink (PLAN_13 §27). **Unresolved.** The brand owner rules. The agreement defaults to ink chrome plus cream surfaces.
- **Interaction critic:** v1 ships with the cursor fixed at today, whatever the amendment timetable. This is compatible with the default, but it is recorded as opposing any Phase C schedule pressure.
- **Accessibility specialist:** the build order must be single-column first, with desktop multi-column as enhancement. Accepted as a condition. Still holds that "A's first-60-seconds advantage is unmeasured in the target container."
- **Devil's advocate:** would keep the AGM-notice draft (the only template the engine implements) behind a "not available" label rather than delete it. Minority position.
- **Devil's advocate and Product strategist:** the portfolio layer must be *designed* before any single-company screen is finalised. The Frontend lead holds that it must not *block* Phase 1 build. Resolved as: design now, build when a store exists.
- **Usability researcher:** the "Abstained" lexicon is accepted only if it passes a 5-user comprehension test. If it fails, the words are reopened.

---

## 8. Next steps

### A. Decisions (founder, before any design round)
1. **Buyer:** a practising CS with a portfolio, or in-house legal with Matters. This decides the home screen.
2. **Design system of record:** confirm `placedon-claude-legal-3300` per PLAN_13 §27 and retire the conflicting `bp/docs/DESIGN_SYSTEM.md` tokens. Rule on italics, date format and ₹ formatting (crore vs full digits).
3. **Primary container:** the Word task pane ("the pane is the deliverable") or the web app.
4. **PLAN_13 §9 amendment:** whether to allow past `as_of` for figures, the per-key coverage floors, and the rule that no figure's `effective_from` may be later than `as_of`.
5. **Model-use statement:** reconcile "no model is called on any path" (contract.md D13) with the business plan's measured ₹2.91 per answer on Sonnet. Publish one sentence customers can rely on.
6. **Streaming:** confirm there is none, and correct PLAN_17 M10.

### B. Backend preconditions (tickets, not UI tasks)
1. Re-run all handlers on the real checkout under the project's Python and commit golden fixtures for the sample profile. Confirm 880(E) is served, and fix `served_source_url` / download provenance.
2. Add a s.137(2) branch to `_decide_aoc4`.
3. Add a derived-deadline route on `checker/agm.py`: six-month and fifteen-month limbs, extension undecided, and s.101 and s.173(3) notice-by dates.
4. Review Rule 6 (S-177-RULES) so private companies resolve to DOES_NOT_APPLY.
5. Narrow `document_check` to the obligations a document relies on, or report the direction of change.
6. Add a profile/entity store for the portfolio (PLAN_17 M3/M5).

### C. Site foundation (Next.js)
1. Fix the `types.ts` header and `AGENTS.md`. Add `askSchema`, `ask()` and `mcaStrip()` in both providers. Extend contract tests.
2. Split `src/lib/engine` into shared (client-safe) and server-only, enforced by lint or the `server-only` package.
3. Wire vitest or `node:test` plus Playwright into `package.json`.
4. Build the `StateChip` and label table, the token lint, the two-tone focus ring, and the ServiceError card.

### D. Next mockup round (before build)
Produce 1440, 360 and pane frames of the portfolio home, the company attention list, Ask (answered, abstained-in-part and abstained), and Duties, all from golden fixtures. Review them against the §7 non-negotiables. The same council reconvenes for one pass/fail review.

### E. Build order
1. Duties (compliance-pack).
2. Ask + Sources with the currency strip.
3. Document check (form).
4. Law-change Watch.
5. Portfolio index, once the store exists.
6. As-of control, once the amendment is written.

### F. Validation with real practitioners
1. **Comprehension test** with 5 target users, at least 2 of them practising CSs, on the regenerated mockups. Pass bar: each user can explain the difference between "we need a fact from you" and "Placedon is still verifying", and none reads a "Met" or screening row as more than it is. Test "Abstained in part" against "Partly answered".
2. **Falsifier test** (UX_INTERACTION_SPEC §9): show the realistic, mostly-undetermined duties sheet to CSs. If most say "useless, just give me an answer", the inline-input design is not enough, and the product must rethink before the pilot.
3. **Legal review** by a practising CS or corporate lawyer of every statutory claim the council could not verify:
   - Rule 6 scope;
   - s.101 short notice and the effect of the private-company exemption;
   - s.173(1) 120-day counting (14 vs 15 Oct);
   - SS-1 notice elements;
   - s.149(3) "financial year" wording;
   - the s.2(85) proviso treatment;
   - the commencement instrument for s.96/s.173 (S.O. 902(E)?).
4. **Willingness-to-pay interviews** testing the simulated bands: per practice vs per client for CSs, firm-wide for law firms, group licence for GCs. Also test the export format (DD schedule, compliance annexure) as the paid artefact.
5. **DPDP counsel opinion** before any upload or counterparty feature returns.
6. **Screen reader and keyboard testing** (NVDA/VoiceOver) on the rebuilt screens, not the mockups.

---

## 9. What the council missed or could not assess

- **Nobody ran the mockups.** Every review is a static source reading. The dc runtime (`support.js`) is absent, so interaction behaviour (Enter-to-submit, `disabled="false"`, blur vs keystroke `onChange`) is unverified. It does not matter for the rebuild, but it does mean nobody observed a real click-through.
- **The engine outputs were never run on the real checkout.** All live results came from one member's patched Python 3.9 scratch copy. The fact-checker could not execute anything.
- **Missing personas.** There was no founder or SME owner (the secondary segment and the actual audience for C), no Chartered Accountant (named in BUSINESS_PLAN §3), no compliance head at a mid-size unlisted company, and no auditor.
- **Language.** INTERVIEWS.md quotes buyers in Hindi. No member assessed Hindi or bilingual UI, or regional-language needs for the SME segment.
- **How facts get in.** Every direction assumes company facts exist, but no mockup designs fact entry, MCA master-data prefill via `/v1/mca-strip`, or fact editing and history. The "we need from you" inline input implies a facts store and provenance nobody has specified.
- **The model-use contradiction.** It was raised only by a simulated persona and confirmed by the chair (§5 row 26). It affects the core positioning and was not debated.
- **Alerts and delivery.** Email, WhatsApp and calendar (ICS) notifications were requested by the GC and CS personas and never designed. The same goes for the export artefact (DD schedule, compliance annexure), which the Devil's advocate argued may be the real paid product.
- **Auth, roles, tenancy and security.** Maker-checker, seats and matter scoping were named but never reviewed as a security lens (tenant isolation, audit log integrity).
- **Professional liability.** Terms of service, disclaimers, professional indemnity, and whether ICSI or Bar Council rules on advertising or solicitation constrain how practitioners can use or promote outputs. None of these was assessed.
- **Competitive teardown.** ComplyRelax, ROC calendars and GC AI were mentioned only in passing. No member compared them feature by feature.
- **Performance and failure modes** beyond ServiceError: timeouts, partial engine outages, and a stale corpus (what the UI shows when `fetched_at` is old).
- **Marketing site vs app.** The site's existing `/product` pages use different labels ("Satisfied / Cannot determine"). Migrating those pages to the new lexicon was not scoped.