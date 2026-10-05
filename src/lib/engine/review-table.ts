import "./server-guard";
import { z } from "zod";

export const TABLE_STATES = ["FOUND", "NOT_FOUND", "NEEDS_LAWYER", "PENDING", "FAILED"] as const;
export const TABLE_LABELS = {
  FOUND: "Answer found in document", NOT_FOUND: "Not found — inspect document",
  NEEDS_LAWYER: "Needs professional review", PENDING: "Not attempted", FAILED: "Could not run",
} as const;
const count = z.number().int().nonnegative();
const text = z.string().refine(value => value.trim().length > 0, "Empty text");
const cell = z.object({ document_id: text, column: text, state: z.enum(TABLE_STATES), value: z.string(), quote: z.string(), reason: z.string() }).strict()
  .refine(item => item.state === "FOUND" ? !!item.value.trim() && item.quote.trim().length >= 8 : item.value === "" && item.quote === "" && item.reason.trim().length >= 10, "Cell evidence disagrees with its state");
export const reviewTableStatusSchema = z.object({
  grid_id: text, name: text, documents: count, columns: count, cells: count, findings: count,
  by_state: z.object({ FOUND: count, NOT_FOUND: count, NEEDS_LAWYER: count, PENDING: count, FAILED: count }).strict(),
  complete: z.boolean(), cancelled: z.boolean(), note: text, cells_detail: z.array(cell),
  spend: z.object({ total_inr: z.number().finite().nonnegative().nullable(), priced_cells: count, unpriced_cells: count, pending_cells: count, is_lower_bound: z.boolean(), note: text }).strict(),
}).strict().superRefine((record, context) => {
  const counts = Object.fromEntries(TABLE_STATES.map(state => [state, record.cells_detail.filter(item => item.state === state).length]));
  const spend = record.spend;
  const bad = !record.documents || !record.columns || record.cells > 500 || record.cells !== record.documents * record.columns
    || record.cells_detail.length !== record.cells || TABLE_STATES.some(state => record.by_state[state] !== counts[state])
    || record.findings !== counts.FOUND + counts.NOT_FOUND + counts.NEEDS_LAWYER
    || record.complete !== (counts.PENDING === 0)
    || new Set(record.cells_detail.map(item => JSON.stringify([item.document_id, item.column]))).size !== record.cells
    || spend.pending_cells !== counts.PENDING || spend.priced_cells + spend.unpriced_cells + spend.pending_cells !== record.cells
    || (spend.total_inr === null ? spend.priced_cells !== 0 : spend.priced_cells === 0)
    || spend.is_lower_bound !== (spend.total_inr !== null && (spend.unpriced_cells > 0 || spend.pending_cells > 0));
  if (bad) context.addIssue({ code: "custom", message: "Table counts, completion or spend disagree; no result may be shown" });
});
export const reviewTableExportSchema = z.object({
  grid_id: text, filename: text, content_type: z.literal("text/csv"), csv: text,
  complete: z.boolean(), cancelled: z.boolean(), findings: count, cells: count, note: text,
}).strict();
export const tableContextSchema = z.object({
  documents: z.array(z.object({ document_id: text, name: text, text: z.string().optional(), cannot_read: text.optional() }).strict()).min(1),
  columns: z.array(z.object({ name: text, question: text, kind: z.enum(["text", "date", "amount", "yes_no", "clause"]) }).strict()).min(1),
}).strict();
// Value-format checks from pinned checker/review_grid.py, not legal calculations.
function valueFits(kind: string, value: string): boolean {
  const clean = value.trim();
  if (kind === "date") return /^\d{4}-\d{2}-\d{2}$/u.test(clean);
  if (kind === "yes_no") return ["yes", "no"].includes(clean.toLowerCase());
  if (kind === "amount") return /^(?:unlimited|(?:[A-Z]{3}\s*|[₹$€£]\s*)?[\d,]+(?:\.\d+)?(?:\s*(?:lakh|crore|million|billion))?)$/iu.test(clean);
  return clean.length > 0;
}
export const reviewTableRecordSchema = z.object({ status: reviewTableStatusSchema, context: tableContextSchema, exported: reviewTableExportSchema }).strict()
  .superRefine((record, issue) => {
    const { status, context, exported } = record;
    const docs = new Map(context.documents.map(doc => [doc.document_id, doc]));
    const cols = new Map(context.columns.map(col => [col.name, col]));
    const bad = docs.size !== status.documents || cols.size !== status.columns || docs.size !== context.documents.length || cols.size !== context.columns.length
      || status.cells_detail.some(item => !docs.has(item.document_id) || !cols.has(item.column) || (item.state === "FOUND" && (!!docs.get(item.document_id)?.cannot_read || !(docs.get(item.document_id)?.text || "").includes(item.quote) || !valueFits(cols.get(item.column)?.kind || "", item.value))))
      || exported.grid_id !== status.grid_id || exported.cells !== status.cells || exported.findings !== status.findings || exported.complete !== status.complete || exported.cancelled !== status.cancelled;
    const rows = csvRows(exported.csv);
    // Match captured export cells to this table, including the pinned backend's
    // apostrophe guard. This checks identity/shape, not spreadsheet execution.
    const guarded = (value: string) => /^[=+\-@\t\r]/u.test(value) ? "'" + value : value;
    const expected = [["document", ...context.columns.map(col => guarded(col.name))], ...context.documents.map(doc => [guarded(doc.name), ...context.columns.map(col => {
      const item = status.cells_detail.find(cell => cell.document_id === doc.document_id && cell.column === col.name);
      return item ? guarded(item.state === "FOUND" ? item.value : ({ NOT_FOUND: "NOT FOUND", NEEDS_LAWYER: "NEEDS LAWYER", PENDING: "PENDING", FAILED: "COULD NOT RUN" } as const)[item.state]) : "";
    })])];
    if (bad || rows === null || csvHasUnsafeCell(rows) || JSON.stringify(rows) !== JSON.stringify(expected)) issue.addIssue({ code: "custom", message: "Table context, quoted document or export safety disagrees" });
  });
export type ReviewTableRecord = z.infer<typeof reviewTableRecordSchema>;

// Parser for inspection, not a CSV generator or a spreadsheet-safety certification.
export function csvRows(csv: string): string[][] | null {
  if (csv.length > 200_000) return null;
  const rows: string[][] = []; let row: string[] = [], value = "", quoted = false, closed = false;
  for (let index = 0; index < csv.length; index++) {
    const char = csv[index];
    if (quoted) {
      if (char === '"' && csv[index + 1] === '"') { value += '"'; index++; }
      else if (char === '"') { quoted = false; closed = true; }
      else value += char;
    } else if (char === '"') {
      if (value || closed) return null;
      quoted = true;
    } else if (char === "," || char === "\n" || char === "\r") {
      row.push(value); value = ""; closed = false;
      if (char !== ",") { rows.push(row); row = []; if (char === "\r" && csv[index + 1] === "\n") index++; }
    } else { if (closed) return null; value += char; }
  }
  if (quoted) return null;
  if (row.length || value || closed) { row.push(value); rows.push(row); }
  return rows;
}
export function csvHasUnsafeCell(rows: string[][]): boolean {
  return rows.some(row => row.some(value => /^[\s\u0000-\u001f\u007f-\u009f\ufeff]*[=+\-@]/u.test(value) || /^[\t\r\n]/u.test(value)));
}
