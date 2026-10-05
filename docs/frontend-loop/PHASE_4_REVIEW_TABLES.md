# Review tables — 5 October 2026

**BUILT / NEEDS_VERIFICATION**, not connected review, safe-download acceptance or Phase 4 complete.
Baseline `c3c2120`; product review branch `codex/frontend-handoff` only.
Backend pinned to `889ba548083ea67c8bd72b552a2bcf6d68cdf70b`.

## Outcome and decision

`/workspace/documents/table-example` presents documents as rows and questions as columns, with native
cell disclosures for quoted evidence or failure reasons. Four captured states: pending, mixed, all attempted
and cancelled. It remains a secondary Documents sample, opens separately without consuming a preparation,
and preserves the approved cream/ink workspace. No client boundary, dependency, live create/cancel/download,
auth change or provider spending. Rejected a simulated live table/progress bar or blank unresolved cells.

Research: pinned `checker/review_grid.py`, `agents/review_grid.py`, `gateway/verbs.py` review-table handlers,
cell runner/spend and `gateway/store.py`/`roles.py`. Each cell is a separate run. FOUND requires a quotation;
NOT_FOUND is not PENDING or FAILED. `complete` means no pending cells, including technical failures, not clearance.
Cancellation retains findings; it is not a refund or proof every active provider call stopped.
Status/export require viewer; create/cancel require lawyer. Roles are not implemented by disabled buttons.

The status handler returns counts, not full column definitions/document names. The sample obtains those
from captured creation/context; a connected reopening path must establish matching persisted context (Q-014).
Quote membership, kind format, unique matrix identity/counts, spend null/count/flag and export correlation are
validated before rendering. Unreadable documents cannot carry FOUND. Backend NOT_FOUND on an unreadable
specimen is labelled “Unreadable document — not checked”; raw state/count remains unchanged.

## Capture and review evidence

Ten JSON envelopes in `fixtures/review-table/`: four paired status/export cases and one hostile paired case.
The capture script verifies all archive Python bytes against Git, blocks sockets, invokes actual pinned
handlers with isolated MemoryBackend/MemoryQueue and a fixed answerer. It deliberately seeds synthetic text
because upload does not retain text (Q-010); this is not upload/store/worker/HTTP/auth acceptance. Successful
handler calls are recorded as response_status 200, not an HTTP observation. Setup/request/response hashes
are checked. Mixed costs seed the pinned test's synthetic ₹0.0412 debit; no bill or model reading is claimed.
Bundle interpreter used: Python 3.12.14; exact path/arguments are in each envelope.

Arendt read-only backend/security/Devil's Advocate audit found an embedded-CR export row-breakout on system
Python 3.9.6; the bundled 3.12 capture instead quotes CR. Do not generalise that runtime-specific result.
The committed adversary independently captures leading-space names/headers and a BOM-prefixed value escaping
the pinned formula guard. Harmless arithmetic only; no external URL or spreadsheet execution. The frontend
parser/risk checks reject that record. Downloads stay disabled pending exact-byte/runtime/security evidence
(Q-013), not “fixed” by the UI. The displayed CSV contains values/labels only, not quotes/reasons or cancellation
context; it is not an evidence-complete report.

Arendt also found that the rounded backend “lower bound” may round upwards, and unknown/unattempted work does
not necessarily add a bill. Display **reported priced subtotal**, not guaranteed minimum or final bill; keep
unknown/pending counts and explicitly synthetic pricing. Raw backend values/notes remain in captured records.

Popper independently reviewed actual code/fixtures from combined backend, usability/basic accessibility,
simulated Indian lawyer, execution checker and Devil's Advocate perspectives. Two guard gaps corrected:
FOUND with a date-format mismatch, and FOUND on cannot_read. Targeted recheck cleared both and independently
ran 910 assertions. Format checks are not calendar/legal correctness. Personas are not customer feedback.

## Verification and next step

- PASS baseline and final typecheck, quiet lint, offline contracts, loop validation/eight runner tests,
  webpack build (30 routes), whitespace and unchanged budget: 52 chunks / 408,170 gzip bytes;
  cap 409,600, headroom 1,430 bytes. No route-performance claim.
- PASS 262 corporate + 252 contract + **396 table** assertions: provenance/setup hashes, state counts,
  kinds, quotes, unreadability, correlation, unsafe/invalid CSV, escaping and disabled actions.
- Brave loaded current page, confirmed all five cell states, quoted-evidence disclosures and disabled actions
  in AX; screenshot inspected. Further disclosure clicks were interrupted by unavailable browser windows;
  no click/keyboard/responsive acceptance or saved screenshot claimed. Unrelated browser content excluded.
- Local HTTP state checks recorded separately in STATE; they are not visual acceptance.
- CI, mounted interaction/320px/full a11y, live auth/tenant/processing/store/worker/export and founder release
  remain pending. Development server PID 46363 / session 19460 remains on 127.0.0.1:3300; no restart/config edit.

Next bounded frontend slice: pinned draft status/blocking slots/version/diff/DOCX boundaries, before drafting
UI. Do not broaden into paid inference, backend fixes, production sessions, merge or deployment. Preserve
the accepted table guards/captures and Q-010–Q-014; only re-review changed evidence.
