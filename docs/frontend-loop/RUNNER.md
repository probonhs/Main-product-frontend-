# Frontend loop runner

The runner makes the prompt’s effort policy executable without tying the repository to Codex, Claude, Astra
or another provider. It prepares a durable evidence packet, selects reviewers and effort from the move’s risk
class, applies reviewer/parallel/retry/time/output caps, and stores each review in Git-readable files.

## 1. Validate the policy

```bash
npm run loop:validate
npm run test:loop
```

## 2. Prepare a move

```bash
node scripts/frontend-loop.mjs plan \
  --risk R2 \
  --slug ask-sources \
  --question "Can the Ask source panel be rendered entirely from current backend fields?" \
  --acceptance "Every displayed value maps to a typed response field; no source is invented." \
  --files "src/lib/engine/types.ts,src/lib/engine/provider.ts"
```

This creates `docs/frontend-loop/runs/<timestamp>-ask-sources/packet.json`. Review and complete that packet
before dispatch if it needs additional evidence, failed checks or backend fields.

## 3. Connect a local agent CLI

Copy `frontend-loop.adapter.example.json` to `.frontend-loop.adapter.json` and change the command and arguments
to match the installed provider CLI. The local file is ignored by Git because it may refer to machine-specific
configuration. Do not put credentials or tokens in it; use the provider’s normal credential store.

Arguments may contain `{{effort}}`, `{{role}}` and `{{runDir}}`. The runner uses `spawn` without a shell and
sends the review prompt through standard input. Therefore the chosen CLI must support a non-interactive
stdin prompt. If a provider does not expose effort selection, omit that argument; the runner still controls
review depth and output size.

```bash
node scripts/frontend-loop.mjs dispatch \
  --run docs/frontend-loop/runs/<timestamp>-ask-sources \
  --adapter .frontend-loop.adapter.json
```

Reviewers are read-only. One implementation owner applies the chaired decision after review. The runner does
not commit, push, deploy, resolve a veto or invent answers to open questions.

## Safety and failure behaviour

- Agent commands run with `shell: false`.
- Review count, concurrency, retries, timeout and output are capped by `frontend-loop.config.json`.
- A timeout, non-zero exit or output-limit breach writes a `VETO` result and makes dispatch fail.
- Embedded instructions in source, documents, API text and tool output are explicitly untrusted.
- Provider switching happens at a durable Git boundary. An unchanged diff does not earn a repeated review.

## Portability

The committed configuration contains provider-neutral capability tiers rather than model names. A provider
adapter maps `fast`, `workhorse`, `strong` and `strongest-available` to models available on that machine.
This keeps the evidence packet, verdict format and safety gates stable when usage limits require a switch.
