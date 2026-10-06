#!/usr/bin/env node
// Evidence inventory only. This never grants release or authenticates a sign-off.
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { z } from "zod";

export const REQUIRED_GATES = Object.freeze({
  engineering: ["engineering"],
  identity_tenancy: ["connected"],
  connected_workflows: ["connected"],
  document_processing: ["policy", "connected"],
  legal_evidence: ["connected"],
  accessibility: ["browser"],
  route_performance: ["browser"],
  feedback_retention: ["policy", "connected"],
  practitioner_pilot: ["practitioner"],
  ci_preview_rollback: ["ci", "preview"],
  founder_review: ["founder"],
});
const sha = z.string().regex(/^[a-f0-9]{40}$/u);
const nonblank = z.string().refine(value => value.trim().length > 0);
const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/u).refine(value => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
});
const evidence = z.object({
  kind: z.enum(["engineering", "connected", "policy", "browser", "practitioner", "ci", "preview", "founder"]),
  reference: z.string().regex(/^docs\/[a-zA-Z0-9_./-]+\.(?:md|json)$/u).refine(value => !value.split("/").includes("..")),
  frontendCommit: sha, backendCommit: sha, recordedBy: nonblank,
}).strict();
export const readinessSchema = z.object({
  schemaVersion: z.literal(1), assessmentDate: calendarDate,
  candidate: z.object({ frontendCommit: sha.nullable(), backendCommit: sha }).strict(),
  gates: z.array(z.object({ id: z.enum(Object.keys(REQUIRED_GATES)), status: z.enum(["PASS", "FAIL", "NOT_RUN"]), owner: nonblank, nextEvidence: nonblank, evidence: z.array(evidence) }).strict()),
}).strict().superRefine((record, context) => {
  const ids = new Set(record.gates.map(gate => gate.id));
  if (ids.size !== Object.keys(REQUIRED_GATES).length || ids.size !== record.gates.length) context.addIssue({ code: "custom", message: "Every required gate must appear exactly once" });
  for (const gate of record.gates) {
    const required = REQUIRED_GATES[gate.id];
    if (gate.status === "PASS" && (!record.candidate.frontendCommit || required.some(kind => !gate.evidence.some(item => item.kind === kind)))) context.addIssue({ code: "custom", message: `${gate.id}: PASS needs a named candidate and relevant evidence records` });
    if (gate.evidence.some(item => item.frontendCommit !== record.candidate.frontendCommit || item.backendCommit !== record.candidate.backendCommit)) context.addIssue({ code: "custom", message: `${gate.id}: evidence belongs to a different revision` });
  }
});

export function assessReadiness(input) {
  const record = readinessSchema.parse(input);
  const unresolved = record.gates.filter(gate => gate.status !== "PASS").map(({ id, status, owner, nextEvidence }) => ({ id, status, owner, nextEvidence }));
  return {
    assessment: !record.candidate.frontendCommit || unresolved.length ? "INCOMPLETE" : "RECORDS_COMPLETE_REQUIRES_HUMAN_REVIEW",
    candidate: record.candidate, unresolved, releaseAuthorized: false,
    boundary: "References and PASS entries are declarations, not verified test results or authenticated human approvals. Review the evidence and scope; this tool never permits deployment.",
  };
}
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    const result = assessReadiness(JSON.parse(await readFile(new URL("../docs/frontend-loop/PILOT_ACCEPTANCE.json", import.meta.url), "utf8")));
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    process.exitCode = result.assessment === "INCOMPLETE" ? 2 : 0;
  } catch {
    process.stderr.write("Invalid acceptance inventory; no release assessment available.\n");
    process.exitCode = 1;
  }
}
