# Engine foundation — review and verification, 28 September 2026

Verdict: GO for the captured-fixture and typed Ask-client foundation only. This is not UI, pilot,
deployment or legal sign-off.

Backend: `948660041b73e610e017b2036ab97848efe7a26e`, unmodified. Thirteen synthetic captures cover
the routed surfaces and Ask states. Captures preserve wire output, read date, full engine commit,
request/response hashes and personal-data exclusion. No transport failure is represented as abstention.

Independent work: Hooke inspected backend semantics, built the capture verifier and audited integration.
Hegel mapped Ask validators and implemented request/response validation and provider tests. The chair
integrated and reran checks. Huygens reviewed the UI separately; that evidence is not this foundation's gate.

Material correction: the initial response schema accepted scalar fact values only. A real Section 149(3)
check returned a nested evidence object. The schema now accepts the declared structure and a captured
resident-evidence regression preserves the returned object and dates. The regression runs offline; a local
backend is required only to regenerate/reproduce captures.

Verification run by the chair:

- `node tests/engine-fixtures.mjs`: 773 assertions, 13 fixtures, PASS.
- `node tests/ask-contracts.mjs`: 7 captured Ask fixtures plus request, label and HTTP-error tests, PASS.
- Python 3.12 `scripts/capture-engine-fixtures.py --check`: 13 byte-identical reproductions, no writes, PASS.
- Existing `tests/contracts.mjs`: 38 assertions, PASS.
- TypeScript and ESLint: PASS in the integrated workspace.

Boundaries: backend factual behaviour is not an independent validation of the law. Document checks and
MCA strip are captured, not newly exposed as product workflows. No profile store, authentication,
historical-coverage contract or source-ingestion change is included. The mock provider rejects arbitrary
Ask requests; it does not substitute a canned answer for user inputs. Ask labels are client-safe and do
not require bundling the full validator in the browser.

Rollback: revert the foundation commit. Reversal: a changed backend contract or failed reproduction
requires refreshed captures and review; never manually edit a legal result to make a test pass.
