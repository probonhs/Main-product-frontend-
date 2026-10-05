import "./server-guard";
import { z } from "zod";

// Deterministic corporate-document handler at 889ba54, not contract/playbook review.
export const PINNED_REVIEW_CHECKS = ["T1.6a", "T1.6b", "T1.6c", "T1.7", "T1.4a", "T1.4b", "T1.5", "C.quorum", "T1.8", "T1.1", "T1.2", "T1.3"] as const;
const finding = z.object({
  rule_id: z.string().min(1), status: z.enum(["PASS", "DEFECT", "NEEDS_BOOK", "N/A"]),
  source: z.string().min(1), defect: z.string(), quoted_span: z.string().min(1),
  precedent: z.string(), applies: z.boolean(), advisory_only: z.boolean(), needs_human: z.boolean(),
}).strict().refine(item => item.needs_human === (item.status === "NEEDS_BOOK"), "Human-check flag disagrees with finding")
  .refine(item => item.applies === (item.status !== "N/A"), "Applicability disagrees with finding");
export const documentReviewSchema = z.object({
  doc_type: z.enum(["minutes", "notice", "outcome", "unknown"]),
  status: z.enum(["ANSWERED", "UNCLASSIFIED"]), code: z.literal("CLASSIFICATION_UNCERTAIN").nullable(),
  note: z.string(), meeting_kind: z.enum(["board", "general"]), requires_review: z.boolean(),
  checks_run: z.number().int().nonnegative(), defect_count: z.number().int().nonnegative(),
  needs_human_count: z.number().int().nonnegative(), findings: z.array(finding), run_id: z.string().uuid().nullable(),
}).strict().superRefine((record, context) => {
  const ids = new Set(record.findings.map(item => item.rule_id));
  const invalid = record.checks_run !== record.findings.length
    || ids.size !== record.findings.length
    || (record.status === "ANSWERED" && (ids.size !== PINNED_REVIEW_CHECKS.length || PINNED_REVIEW_CHECKS.some(id => !ids.has(id))))
    || record.defect_count !== record.findings.filter(item => item.status === "DEFECT").length
    || record.needs_human_count !== record.findings.filter(item => item.needs_human).length
    || (record.status === "UNCLASSIFIED" ? record.doc_type !== "unknown" || record.code !== "CLASSIFICATION_UNCERTAIN" || record.findings.length !== 0
      : record.doc_type === "unknown" || record.code !== null)
    || record.requires_review !== (record.status !== "ANSWERED" || record.defect_count > 0 || record.needs_human_count > 0);
  if (invalid) context.addIssue({ code: "custom", message: "Review state or counts disagree; do not present a conclusion" });
});
export type DocumentReview = z.infer<typeof documentReviewSchema>;
export const REVIEW_FINDING_LABELS: Record<DocumentReview["findings"][number]["status"], string> = {
  PASS: "No issue found by this check", DEFECT: "Issue identified",
  NEEDS_BOOK: "Minutes-book inspection needed", "N/A": "Check does not apply",
};
