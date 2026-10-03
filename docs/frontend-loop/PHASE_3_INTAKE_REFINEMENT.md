# Document-first intake and workspace refinement — 4 October 2026

Status: **BUILT / NEEDS_VERIFICATION**. Baseline `395560e`; product branch `codex/frontend-handoff`.
This implements the founder's seven browser comments, not full Phase 3 or production acceptance.

## What changed

- Removed the Documents' large local-preparation banner, shared sidebar Product preview/gateway notice,
  sidebar Examples navigation and Preview workspace label. Removed their unused styles/imports.
- Documents starts with Choose file or Or paste document text. After text is present, it shows an editable
  document name (filename supplied for local files) and corporate-document vs playbook-contract choices.
  Text inspection is on demand for selected files; pasted text remains editable. No fake classification.
- Long processing/storage explanations are in a closed Supported files & storage disclosure. Short local
  status and review-unavailable qualifiers stay at intake, review selection and the disabled Start review
  action. Prepared text is still explicitly not uploaded/not reviewed; edited drafts retain a labelled snapshot.
- Ask's welcome no longer names the Companies Act, 2013. Sources, legal text and supported scope are unchanged.
  Check context is in a closed About this check disclosure. Captured fixtures are secondary See sample results,
  not a pretend conversation list; their result/provenance labels remain. Return-to-samples opens the disclosure.

## Boundaries and review

Same strict local UTF-8 `.txt`/paste policy, 256 KiB/200,000-character limits, immutable prepared snapshot,
field-associated rejection and current-read guards. No PDF/DOCX/OCR support, upload, persistence, model call,
API or backend change. Backend `889ba54:gateway/verbs.py` upload rechecked: metadata storage does not prove
retained extracted text. Q-010 and processing permissions still gate integration. D-013 sequencing remains.

Independent read-only R2 reviewer Sagan combined simulated Indian-lawyer, Devil's Advocate and execution
checker perspectives. Initial PASS_WITH_CHANGES: unavailable reviews were disclosed too late. Fixed with
brief qualifiers before intake and immediately under the review legend; targeted follow-up **PASS**, limited
to corrected copy without repeating tests/build/browser review.
Simulated persona judgments are not customer feedback or practitioner acceptance.

## Verification

- PASS: typecheck, quiet lint, full offline contracts (38 core, 773 fixture, seven Ask fixtures, 452 gateway,
  276 Ask render/reducer assertions, conversation safety/process checks). Local document checks pass at
  **284** assertions after the qualifier correction. Network is blocked in document tests.
- PASS: loop validation, eight runner assertions, webpack production build (28 routes), whitespace check.
- PASS: unchanged client budget, **50 chunks / 407,164 gzip bytes**, cap409,600; 2,436-byte headroom.
- PASS: authorized read-only HTTP200 checks for `/workspace`, `/workspace/documents`, `/workspace/limitations`:
  revised copy, intake-first initial render and shared notice removal. Not mounted interaction or visual evidence.
- NOT RUN: Brave inspection (`/Applications/Brave Browser.app` timeout), mounted file-picker/paste flow,
  full accessibility/error/connected/CI/practitioner acceptance. No alternate browser or new screenshot used.

Next: bounded Brave verification when its controls are available; measured bundle sharing before substantially
expanding client screens, then pinned review-result/quote-and-reason frontend. No merge or release.
