# Phase 3 — local document preparation, 3 October 2026

Status: **BUILT / NEEDS_VERIFICATION**, not attachment/review integration or Phase 3 complete.
Baseline `e9d6b40`; product review branch `codex/frontend-handoff`. Backend reference `889ba54`.

## Outcome and boundary

Documents navigation now opens `/workspace/documents` in the approved cream/ink workspace. Users can choose
corporate-document or playbook-contract review, name a working copy, paste text or read a UTF-8 `.txt` locally,
and explicitly prepare an unchanged text snapshot. Edits retain the previous snapshot with a warning.
Clear removes this page's preparation. No application restore feature is supplied; browser history may retain
page memory, so navigation is not promised as secure erasure. No network submission, browser
document storage, legal result, attachment, approval, provider call or upload success is simulated.

Frontend policy: 256 KiB and 200,000 UTF-16 characters, not an asserted backend/document-size limit. Blank,
invalid UTF-8, binary/control-containing, renamed PDF/RTF and unsupported files reject with an explanation.
No PDF/Word/OCR support is claimed. Oversized paste/edit rejects without shortening or replacing existing
text. Field-specific errors remain associated. Pending, superseded, stopped and cleared reads cannot replace
edited drafts. Prepared text renders literally and preserves spacing/numbering, without HTML execution or
legal-reference rewriting. A text snapshot is not a hash of original file bytes or verified completeness.

## Evidence and decisions

Main agent inspected backend `gateway/verbs.py:2755` upload, `:1472` file panel and `:2008` task arguments:
upload records hash/size/name/reason in process memory but **not extracted text**; task dispatch looks for
`ctx.documents[file_id].text` and otherwise uses conversation text. Q-010 records the missing proven
upload→review text/retention boundary. Corporate review classifies documents in code; contract review uses
playbook standards, not statements of law, and has processing restrictions. No backend files/config changed.

Donor `8461a06:src/lib/documents/index.ts` inspected, not blindly copied. Its “larger than 10 MB means scan”
inference is unsupported, and its non-fatal text decoding risks replacement characters. Local strict decoding
is deliberately narrower; PDF/DOCX parser audit, permission and safe extraction remain separate work.

Independent R2 reviewer Singer combined privacy/backend, execution checker, Devil's Advocate and **simulated**
Indian-lawyer perspectives. PASS_WITH_CHANGES identified native maxlength truncation and unassociated errors.
Both fixed; targeted response round PASS, no residual concrete truncation defect. Tests inspected, not rerun
by reviewer. Simulated personas are not practitioner acceptance. D-016 records scope/reversal.

## Verification

PASS: typecheck; quiet lint; full test:contracts (38 core / 773 fixture / seven Ask fixtures / 452 gateway /
256 Ask render-reducer assertions / conversation checks / **230 new local preparation assertions**);
loop:validate; test:loop (8); webpack build (28 routes); performance:budget (50 chunks / **407,147 gzip bytes**);
diff whitespace. Existing 409,600-byte cap unchanged; only 2,453 bytes remain. Optimize measured shared
client code before substantially expanding interactive screens; do not raise the cap simply to pass.

Tests use synthetic non-legal text and block network calls. Cover strict decoding, file/byte/character limits,
immutable snapshots, draft edits, stale/canceled reads, rejection without data loss, private-error redaction,
HTML escaping, radio/preview/unavailable markup and field-association wiring. Pure/static evidence does not
establish mounted React or clipboard/file-picker interactions.

Brave **NOT RUN**: explicit installed app path timed out again. No alternate browser or fabricated screenshot.
Initial localhost HTTP render check was sandbox-denied (EPERM); authorized read-only retry PASS: HTTP200,
heading, local boundary, Documents navigation and review-unavailable copy present. This is not browser QA. Full
visual/a11y/error/connected/CI/practitioner acceptance stays deferred D-013. Production sign-in, uploads,
processing permission, paid calls, merge and deployment remain gated.

At 82% five-hour usage, finish this checkpoint; no large new slice. Next: measured client sharing/budget
headroom, then contract-grounded review-results/quote-and-reason frontend. Do not connect uploads merely to
make the UI look functioning. Review approval remains a separate authenticated, role-controlled write.
