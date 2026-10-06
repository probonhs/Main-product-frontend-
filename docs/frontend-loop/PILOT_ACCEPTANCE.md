# Pilot acceptance inventory

The eleven gates in `PILOT_ACCEPTANCE.json` track a **named release candidate**, not ordinary WIP progress.
The current inventory is intentionally INCOMPLETE: candidate frontend commit null; all gates NOT_RUN.
Prior builds, partial browser checks and checkpoint approvals remain evidence in their own reports, but do
not approve a future candidate. Do not fill PASS merely to make a command green.

## Use

1. Founder agrees enabled pilot scope and exclusions. Unbuilt Phase 4 work stays unbuilt; Today/portfolio
   tasks in QUALITY_GATES.md require an explicit scope decision, not a silent replacement.
2. Name full immutable frontend/backend Git revisions. Evidence must refer to those revisions.
3. Perform each check, record results, limitations, reviewer and relevant evidence in a repository-local
   `docs/...md` or `docs/...json` report. Never commit client facts, participant identities or credentials.
4. Update status and evidence kind(s) only after the actual check and authorized review. Every gate remains
   present exactly once; engineering, browser, connected, policy, practitioner, CI/preview and founder
   evidence are different kinds and cannot substitute for each other.
5. Run `npm run pilot:readiness`. Exit2 means INCOMPLETE; exit1 invalid inventory; exit0 means only
   RECORDS_COMPLETE_REQUIRES_HUMAN_REVIEW. `releaseAuthorized` is always false.
6. Human reviewers inspect evidence and authority separately. A report reference does not authenticate its
   author, verify the file exists, prove test results or grant consent. The checker validates declarations
   and revision consistency only. Release/merge/deployment still needs explicit founder approval.

`npm run test:readiness` tests these rules with synthetic variants; no variant is saved as a real sign-off.
CI runs those tests independently of the incomplete acceptance command. Do not add the latter as a green
engineering prerequisite while the release candidate is unset. Gate criteria, budgets and research
thresholds remain in QUALITY_GATES.md; this inventory does not weaken or duplicate them.

Owners and next required evidence are recorded per gate. Q-001/005/006 and affected legal/document gaps
remain unresolved. A backend gap may be excluded only through approved scope with truthful disabled UI,
not by marking an untested path PASS. Persona simulations never count as real practitioner sessions.
