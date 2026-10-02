# Two-person ownership and backend handoff

## Responsibility split

| Work | Founder — primary owner | Backend teammate — bounded support |
|---|---|---|
| Product and UX | Scope, screens, interaction, copy, brand and final review | Consult only on capability constraints |
| Frontend engineering | Components, routes, session UI/BFF adapter, typed clients, tests, accessibility, responsive work and integration | Review a compact API diff when needed; no parallel UI redesign |
| Backend | Read contracts, reproduce reported gaps, specify minimum request | Own backend correctness, store/worker/auth primitives and narrow fixes |
| Data / release policy | Choose pilot, login approach, processing permission, retention and release | Explain backend implications; provide checks and operational facts |
| Git | Founder product review branch and frontend PRs | Separate backend PRs; provide SHA, contract change and verification |

The goal is not an artificial workload percentage. The founder implements the whole product experience;
the teammate supplies the minimum backend enablement rather than taking over frontend delivery again.

## Small initial request — reuse what already exists

This is an existing-artifact handoff, not a request to build all missing infrastructure. Point to present
commands/tests first. If an item is missing, identify it and separately scope the smallest fix; effort reduction
is the intended split, not a measured workload claim.

1. Confirm backend `889ba54` (or a newer explicitly pinned SHA) as the integration target. Point to
   `gateway/verbs.py`, `screens.py`, answer-envelope schema, role table and any changed response fields.
   Avoid writing a second hand-maintained API specification.
2. Provide a reproducible **synthetic-data local setup**: migrations, store, worker, health and operator
   principal with the role needed for research. Share secrets through the team's approved private channel,
   never Git, chat prompts or fixture files. State what persists after restart and what does not.
3. Explain the existing actor/invite/revocation primitives and the intended browser-session → tenant/actor
   mapping. Identify only the missing auth surface; do not rebuild identity before we choose the approach.
4. Point to an existing synthetic happy-path and refusal/failure example for Ask → citation → reload, with commands/tests
   and backend SHA. Review one compact frontend compatibility report after we connect it.

Optional later work must arrive as one reproducible blocker: expected/actual result, request shape, role,
backend revision and frontend impact. Request the smallest backend patch; independent UI work continues.
Do not ask for Vault, live MCA integration, historical reconstruction, new model training or a generic
backend rewrite just to complete this frontend handoff.

## Copy-ready message to teammate

You’ve already built the backend backbone and a useful frontend prototype. I want to take ownership of the
main frontend from here: the design, screens, interactions, API integration, testing and final review.
We’ll preserve and reuse your existing work rather than ask you to rebuild it.

For now, could you help me with a small integration handoff?

Existing commands, tests and links are enough for this first handoff. If something does not exist yet,
flag it so we can separately scope the smallest backend fix; this is not a request to rebuild infrastructure.

- Confirm the backend commit we should target and point me to the existing verb, screen, envelope and role contracts.
- Give me a reproducible local setup with synthetic data, the store/worker running, and a correctly scoped test
  principal. Please share any credentials privately, not in GitHub.
- Explain how the existing users/roles/invites connect to browser login, tenant and actor, and what is still missing.
- Share one tested Ask → source → reload example, including refusal/error behaviour. After I connect the frontend,
  I’d like one focused contract review from you.

I’ll handle the frontend work and send you specific, reproducible backend blockers only when necessary.
Please keep backend fixes in separate PRs with the commit, contract change and verification. We can reuse your
console as a donor without merging its whole design. I’ll make the final product/design and release calls.

## Founder decisions that should not be delegated to the model

Login/provider and pilot organisation scope; permitted client-data region/providers; retention/deletion;
which playbook is approved; deployment ownership and the final release. The model may recommend options,
but must not silently choose paid commitments, broaden data permissions or publish the product.
