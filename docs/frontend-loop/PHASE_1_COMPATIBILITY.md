# Phase 1 — bounded compatibility move, 2 October 2026

Status: BUILT / NEEDS_VERIFICATION. No production identity or connected acceptance claim.
Backend inspected: `889ba548083ea67c8bd72b552a2bcf6d68cdf70b`; previous client reference `127ef70`.

## Implemented

- Typed gateway errors: authentication, role denial, missing record, rate limit, invalid input/response,
  service outage and unavailable workflow. Safe copy/codes replace raw upstream details. These are not
  legal abstention states. No automatic resend.
- Latest trace preserves critic true/false/null/absent, returned note and provider. Not recorded is not Off;
  unknown/unpriced cost is not zero. The real zero value still renders as zero.
- Thread validation checks distinct message IDs, ordering, ownership, known tasks and consistent task/run
  links. Returned GET/send/trace IDs are correlated to their requests.
- Source inspection requires the originating message ID locally. The server retrieves that stored message,
  locates the expected citation and compares the source response's message ID plus all citation fields.
  A mismatch returns 409 without a quote; a failed re-verification does not display its passage.
- The Sources toolbar retains the selected citation's message ID. Queued replies with a run reference are
  distinguished from missing replies with no run reference. Neither is displayed as an answer.

## Independent audit and factual check

One read-only backend-contract auditor found a critical collision: `_citations_from_summary` generates local
IDs such as c1; `_citation_get` loops messages and returns the first matching ID. The main agent verified the
actual handler at `gateway/verbs.py:2079` and the return fields. The checked screen map still lists stale flat
citation fields, while the handler returns nested citation plus message/re-verification metadata.

After the fix, the same independent auditor re-reviewed actual code and ran focused tests. Verdict:
**critical source objection closed for safe local preservation**. This does not fix upstream lookup availability.
The complete later-collision source path remains gated on a backend message-scoped selector (Q-008).

The audit also found that uploaded document text/restart durability is not established by `stored:memory`.
Attachments remain disabled. Memory storage does not establish multi-tenant isolation; dev/single-operator
restriction remains, and production expansion requires actual RLS/session/role acceptance.

## Verification

TypeScript, ESLint, full contract suite, loop configuration/tests and webpack production build PASS.
Build: 27 routes, compiled 3.4s. Budget: 49 chunks / 399,238 gzip bytes PASS.
Expanded tests cover duplicate/order/task/run invariants, IDs, 401/403/404/429 errors and credential redaction;
critic null/absent/false/true, unknown versus real zero cost; repeated c1, changed quote and false re-verification.
All test payloads are explicitly synthetic non-legal records, not claimed legal evidence.

Brave accessibility state confirmed the independent Ask shell and navigation. Navigation/control was repeatedly
interrupted; the changed source/trace UI and responsive/focus/privacy acceptance remain NOT VERIFIED. Connected
gateway, restart durability, tenant isolation, CI, preview and founder approval remain NOT RUN.

No backend mutation, new credentials, real client submission, paid model request or teammate message occurred.
Publication remains blocked by missing GitHub workflow permission. Preserve the commit; do not bypass CI.

## Next smallest work

Teammate: message-scoped citation selector and two-reply collision regression, using existing source validation.
Founder: connect approved synthetic local setup, validate persistence/roles and finish Brave source/focus states.
Identity/provider and data-processing choices remain human decisions; independent frontend work may continue.
