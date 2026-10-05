import "./server-guard";
import { z } from "zod";

// NDA playbook served at 889ba54. Its standards are not statements of law.
const finding = z.object({
  rule_id: z.string().min(1), clause: z.string().min(1),
  status: z.enum(["MATCHES", "DEVIATES", "MISSING", "NEEDS_LAWYER"]),
  kind: z.literal("POTENTIAL_ISSUE"), detail: z.string().min(1),
  standard_text: z.string().min(1), rationale: z.string().min(1),
}).strict();
export const contractReviewSchema = z.object({
  playbook_status: z.enum(["DRAFT", "APPROVED"]), requires_review: z.boolean(),
  model: z.string().min(1).nullable(), clauses_in_contract: z.number().int().nonnegative(),
  findings: z.array(finding), unverified: z.array(z.object({ clause: z.string().min(1), why: z.string().min(1) }).strict()),
  law_not_held: z.array(z.object({ body: z.string().min(1), refusal: z.string().min(1) }).strict()),
  run_id: z.string().uuid().nullable(),
}).strict().superRefine((record, context) => {
  const ids = new Set(record.findings.map(item => item.rule_id));
  const bodies = new Set(record.law_not_held.map(item => item.body));
  if (ids.size !== 10 || record.findings.length !== 10
    || Array.from({ length: 10 }, (_, index) => `NDA-${String(index + 1).padStart(2, "0")}`).some(id => !ids.has(id))
    || bodies.size !== 3 || record.law_not_held.length !== 3 || ["CONTRACT1872", "ARBITRATION1996", "STAMP"].some(body => !bodies.has(body))
    || (record.playbook_status === "DRAFT" && !record.requires_review)) {
    context.addIssue({ code: "custom", message: "Incomplete or contradictory pinned playbook record; no finding may be shown" });
  }
});
export type ContractReview = z.infer<typeof contractReviewSchema>;
export const CONTRACT_FINDING_LABELS: Record<ContractReview["findings"][number]["status"], string> = {
  MATCHES: "Reported match — confirm scope", DEVIATES: "Differs from the standard",
  MISSING: "No clause extracted", NEEDS_LAWYER: "Professional judgment needed",
};
