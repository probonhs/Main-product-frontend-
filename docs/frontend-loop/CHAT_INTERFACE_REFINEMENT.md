# Chat-first interface — 4 October 2026

Status: **BUILT / PARTIAL_BROWSER_VERIFICATION**, not connected acceptance or release.
Baseline `68da9d5`; product review branch `codex/frontend-handoff`. Founder asks for a chatbot experience
similar to Anthropic/OpenAI interfaces. Adopt interaction patterns, not their branding or unsupported features.

## Outcome

Centred greeting/composer on an empty Ask screen; question bubble and evidence-bearing reply above the
composer after a result. Hide the redundant scope topbar on chat surfaces only. Keep Placedon's cream/ink,
black mark/controls, brand fonts and legal-reference treatment. No fixed overlay or new transcript storage.

Composer uses an accessible icon Send control, compact Add context disclosure and a persistent statement
that independent Ask checks each question separately. Suggested questions fill/focus the draft without
sending; captured sample results stay in a separate labelled disclosure. An unconfigured independent Ask
can draft, but cannot submit: disabled Send plus a submit-path guard. No fake answer, memory or availability.

Saved-conversation UI uses the same composer styling/keyboard behavior. Existing pending-reply, uncertain-send,
message/source/run guards remain. Attachments remain unavailable; company-context limits and the need to
include relevant facts are preserved. No API, backend, auth, processing, model or legal-state changes.

Enter sends only when allowed; Shift+Enter inserts a line. Composition lifecycle/native composition/keyCode229
leave candidate entry alone. Repeated unmodified Enter is consumed, not sent and not inserted as a draft edit
that could abort the independent check. The shared helper and both handler paths are covered offline.

## Review and verification

Independent R2 reviewer Erdos combined simulated Indian-lawyer, Devil's Advocate and execution/basic-accessibility
perspectives. Two P2 findings: IME-confirmation risk and held Enter editing/aborting a check. Both corrected;
targeted keyboard recheck PASS by source inspection. Persona judgments are not real practitioner evidence.

PASS: quiet lint; final standalone TypeScript check and production compiler;
full offline contracts (38 core, 773 fixture, seven Ask fixtures, 452 gateway, **316 Ask render/reducer/key
assertions**, conversation/process guards, 284 local-document assertions); loop validation/eight runner
assertions; final webpack build (28 routes); whitespace. Budget **50 chunks / 407,792 gzip bytes**;
409,600-byte cap unchanged, 1,808 bytes headroom. Optimize measured shared client code before large additions.

Bounded Brave PASS after preview recovery: starting layout visible; suggestion fills draft and enables Send
without producing an answer; Shift+Enter adds a line; disposable draft cleared; context opens; a pinned
captured partial reply retains label/date/status; Inspect sources focuses Sources with held-text/date
qualification and Back to result returns. No live question/model submission or attachment occurred.
No network counter, full keyboard/IME campaign, numeric responsive measurements or live conversation claim.

Initial old preview had 403 development-resource/HMR failures and nonresponsive draft suggestions. Verified
the task's own Next dev process/repo, restarted using the existing `npm run dev` script bound to127.0.0.1;
HMR then connected and draft interactions worked. No allowed-origin/CSP/security setting was weakened.
Current server PID46363, port3300, tool session19460. No credentials/config introduced.

Page screenshots were visually inspected in tool output. A page-only saved screenshot attempt was interrupted
when browser control reported the user changing the app; stopped further actions. No new image committed,
no personal browser chrome/history published. Full responsive/a11y/error, live gateway/CI and practitioner
acceptance remain deferred under D-013. Review the current app; capture a clean snapshot when available.
