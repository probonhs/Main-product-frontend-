import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { REQUIRED_GATES, assessReadiness } from "../scripts/pilot-readiness.mjs";

let checks = 0;
function equal(a, b) { assert.deepEqual(a, b); checks++; }
function invalid(value) { assert.throws(() => assessReadiness(value)); checks++; }
const manifest = JSON.parse(readFileSync(new URL("../docs/frontend-loop/PILOT_ACCEPTANCE.json", import.meta.url), "utf8"));
const result = assessReadiness(manifest);
equal(result.assessment, "INCOMPLETE"); equal(result.releaseAuthorized, false); equal(result.unresolved.length, 11);
equal(manifest.candidate.frontendCommit, null); equal(result.unresolved.map(gate => gate.id).sort(), Object.keys(REQUIRED_GATES).sort());
equal(manifest.gates.every(gate => gate.status === "NOT_RUN" && gate.evidence.length === 0), true);
invalid({ ...manifest, ignoredGate: true }); invalid({ ...manifest, candidate: { ...manifest.candidate, frontendCommit: "short" } });
for (const assessmentDate of ["2026-99-99", "2026-02-29", "2026-04-31", "2026-00-01", "2026-01-00"]) invalid({ ...manifest, assessmentDate });
equal(assessReadiness({ ...manifest, assessmentDate: "2024-02-29" }).assessment, "INCOMPLETE");
invalid({ ...manifest, gates: manifest.gates.slice(1) }); invalid({ ...manifest, gates: [...manifest.gates, manifest.gates[0]] });
for (const status of ["READY", "DEFERRED", "N/A", "", null]) invalid({ ...manifest, gates: manifest.gates.map((gate, index) => index === 0 ? { ...gate, status } : gate) });
invalid({ ...manifest, gates: manifest.gates.map((gate, index) => index === 0 ? { ...gate, id: "invented", status: "PASS" } : gate) });
invalid({ ...manifest, gates: manifest.gates.map(gate => ({ ...gate, status: "PASS" })) });
// Synthetic unit variant only: never saved as a real sign-off.
const complete = { ...structuredClone(manifest), candidate: { ...manifest.candidate, frontendCommit: "a".repeat(40) } };
complete.gates = complete.gates.map(gate => ({ ...gate, status: "PASS", evidence: REQUIRED_GATES[gate.id].map(kind => ({ kind, reference: "docs/frontend-loop/PHASE_5_PREPARATION.md", frontendCommit: complete.candidate.frontendCommit, backendCommit: complete.candidate.backendCommit, recordedBy: "Synthetic unit-test declaration" })) }));
equal(assessReadiness(complete).assessment, "RECORDS_COMPLETE_REQUIRES_HUMAN_REVIEW"); equal(assessReadiness(complete).releaseAuthorized, false);
for (const index of complete.gates.keys()) {
  const missing = structuredClone(complete); missing.gates[index].evidence = []; invalid(missing);
  for (const kind of REQUIRED_GATES[complete.gates[index].id]) {
    const omitted = structuredClone(complete); omitted.gates[index].evidence = omitted.gates[index].evidence.filter(item => item.kind !== kind); invalid(omitted);
  }
  const stale = structuredClone(complete); stale.gates[index].evidence[0].frontendCommit = "b".repeat(40); invalid(stale);
  const backend = structuredClone(complete); backend.gates[index].evidence[0].backendCommit = "b".repeat(40); invalid(backend);
  const wrongKind = structuredClone(complete); wrongKind.gates[index].evidence = [{ ...wrongKind.gates[index].evidence[0], kind: "founder" }];
  if (wrongKind.gates[index].id !== "founder_review") invalid(wrongKind);
  const failed = structuredClone(complete); failed.gates[index].status = "FAIL";
  equal(assessReadiness(failed).assessment, "INCOMPLETE"); equal(assessReadiness(failed).unresolved.length, 1);
}
for (const reference of ["docs/../secret.md", "/private/client.txt", "https://example.com/?token=secret", "docs/matter.txt"]) {
  const unsafe = structuredClone(complete); unsafe.gates[0].evidence[0].reference = reference; invalid(unsafe);
}
const cli = spawnSync(process.execPath, [new URL("../scripts/pilot-readiness.mjs", import.meta.url).pathname], { encoding: "utf8" });
equal(cli.status, 2); equal(JSON.parse(cli.stdout).releaseAuthorized, false); equal(JSON.parse(cli.stdout).assessment, "INCOMPLETE"); equal(cli.stderr, "");
const workflow = readFileSync(new URL("../.github/workflows/frontend-quality.yml", import.meta.url), "utf8");
equal(workflow.includes('"codex/**"'), true); equal(workflow.includes("npm run test:readiness"), true); equal(workflow.includes("npm run pilot:readiness"), false);
console.log(`PASS: ${checks} readiness inventory/CLI/CI assertions; records never authorize release. Candidate acceptance remains INCOMPLETE.`);
