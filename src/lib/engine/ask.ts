import { z } from "zod";
import { rowStateSchema } from "./types";

// Mirrors checker/ask.py and checker/ask_contract.py; no inferred legal states.
const text = z.string();
const nonempty = text.refine((v) => Boolean(v.trim()), "Must not be empty");
const date = z.iso.date();
const nullableDate = date.nullable().optional();
const scalar = z.union([text, z.number(), z.boolean(), z.null()]);
const evidence = z.object({
  agm_dates: z.array(date).nullable().optional(),
  financial_year_end: nullableDate,
  board_meetings: z.array(date).nullable().optional(),
  calendar_year: z.number().int().min(2015).nullable().optional(),
  aoc4_filed_on: nullableDate,
  annual_return_filed_on: nullableDate,
  resident_director_days: z.number().int().min(0).max(366).nullable().optional(),
  first_financial_year_end: nullableDate,
}).strict();
const money = z.number().int().nonnegative().nullable().optional();
const bool = z.boolean().nullable().optional();
const factFields = {
  company_class: z.enum(["private", "public", "opc"]).optional(),
  incorporation_date: nullableDate, as_of: nullableDate,
  cin: text.nullable().optional(), financial_year: text.nullable().optional(),
  is_listed: bool, is_section_8: bool, is_holding_company: bool,
  is_subsidiary_company: bool, governed_by_special_act: bool,
  director_count: money, paid_up_capital_rupees: money, turnover_rupees: money,
  net_worth_rupees: money, net_profit_rupees: money,
  evidence: evidence.nullable().optional(),
};
const generalFacts = z.object(factFields).strict();
const documentFacts = z.object({ ...factFields, document_date: nullableDate }).strict();
const requestFields = {
  question: nonempty.max(2000).refine((v) => !/[\x00-\x08\x0b-\x1f\x7f]/.test(v), "Control characters are forbidden"),
  as_of: nullableDate, parent_turn_id: nonempty.optional(),
  provisions: z.array(nonempty).nullable().optional(),
  figures: z.array(nonempty).nullable().optional(),
};
export const askRequestSchema = z.union([
  z.object({ ...requestFields, context: z.object({ kind: z.literal("general").optional(), document_date: z.null().optional() }).strict().nullable().optional(), facts: generalFacts.nullable().optional() }).strict(),
  z.object({ ...requestFields, context: z.object({ kind: z.literal("document"), document_date: nullableDate }).strict(), facts: documentFacts.nullable().optional() }).strict(),
]).superRefine((value, ctx) => {
  const fail = (path: string[], message: string) => ctx.addIssue({ code: "custom", path, message });
  const facts = value.facts;
  if (facts?.as_of && value.as_of && facts.as_of !== value.as_of) fail(["facts", "as_of"], "Contradicts turn as_of");
  for (const key of ["paid_up_capital_rupees", "turnover_rupees", "net_worth_rupees", "net_profit_rupees"] as const)
    if (facts?.[key] != null && !facts.financial_year) fail(["facts", "financial_year"], "Required alongside money");
  if (value.context?.kind === "document") {
    const inFacts = facts && "document_date" in facts ? facts.document_date : null;
    if (!value.context.document_date && !inFacts) fail(["context", "document_date"], "Document date is required");
    if (value.context.document_date && inFacts && value.context.document_date !== inFacts) fail(["context", "document_date"], "Contradicts facts.document_date");
    if (value.provisions?.length || value.figures?.length) fail(["context"], "Document turns use currency checks, not provisions or figures");
  }
});
export type AskRequest = z.input<typeof askRequestSchema>;

const row = z.object({ obligation_id: text, duty: text, provision: text, state: rowStateSchema, basis: text, missing_facts: z.array(text).optional(), blocked_by: text.nullable().optional(), cited_spans: z.array(z.object({ path: text, sha256: text, resolved: z.boolean() }).passthrough()).optional() }).passthrough();
const citationFields = {
  ref: text, cite: text, title: text, evidence_state: text,
  usable_for_answering: z.boolean(), unusable_reason: text.nullable(),
  defects: z.array(z.unknown()), retrieved_on: z.array(text), source_url: text.nullable(),
};
const citation = z.object(citationFields).passthrough();
const confirmedText = z.object({ ...citationFields, verbatim: text }).passthrough();
const figure = z.object({ key: text, amount: nonempty, rupees: z.number(), instrument: nonempty, effective_from: date, effective_to: date.nullable(), evidence_state: text, source_url: text.nullable() }).passthrough();
const lawVersion = z.object({ basis: text, point_in_time_verified: z.boolean(), corpus_fetched: z.array(text), statement: text, point_in_time_requested: z.unknown().optional() }).passthrough();
const pack = z.object({ retrieval_query: text, route: text, usable_keys: z.array(text), unusable_keys: z.array(text), missing: z.array(text), insufficient_evidence: z.boolean() }).passthrough();
const gap = z.object({ kind: text, ref: text.optional(), detail: text.optional(), missing_facts: z.array(text).optional(), blocked_by: text.nullable().optional() }).passthrough();
const scopeFrame = z.object({
  checked: z.array(text), checked_count: z.number().int().nonnegative(),
  unchecked: z.array(z.object({ what: text, why: text, acquire: text, state: text }).passthrough()),
  unchecked_count: z.number().int().nonnegative(), corpus: text, as_of: text,
  sentence: text, establishes_compliance: z.literal(false), dismissable: z.literal(false),
}).passthrough();
const fields = {
  schema: z.literal("placedon.ask/0"), state: z.enum(["answered", "partial", "out_of_scope"]),
  turn_id: nonempty, question: text, generated_at: nonempty, as_of: date,
  uses_model: z.boolean(), parent_turn_id: nonempty.optional(),
  scope: z.object({ held: z.array(text), sentence: text }).passthrough(),
  rows: z.array(row).optional(), figures: z.array(figure).optional(),
  citations: z.array(citation).optional(), not_confirmed: z.array(gap).optional(),
  law_version: lawVersion.optional(), evidence_pack: pack.optional(),
  facts: z.record(text, z.object({ value: z.union([scalar, evidence]), provenance: z.unknown() }).passthrough()).optional(),
  what_it_is_not: z.union([text, z.array(text)]).optional(),
  body: z.object({ key: text, name: text, regulator: text, covers: z.unknown(), scope_status: text }).passthrough().optional(),
  reason: nonempty.optional(), held: z.array(text).optional(),
};
const generalResponse = z.object({ ...fields, context: z.object({ kind: z.literal("general"), document_date: z.null() }).passthrough(), confirmed: z.array(confirmedText).optional(), stages: z.never().optional(), scope_frame: z.never().optional(), superseded: z.never().optional() }).passthrough();
const documentResponse = z.object({ ...fields, context: z.object({ kind: z.literal("document"), document_date: date }).passthrough(), confirmed: z.array(row).optional(), superseded: z.array(z.object({ obligation_id: text, duty: text, provision: text, detail: text }).passthrough()).optional(), scope_frame: scopeFrame.optional(), stages: z.array(z.object({ what: z.enum(["capability", "date", "model", "review", "correction", "abstain"]) }).passthrough()).optional() }).passthrough();
export const askResponseSchema = z.union([generalResponse, documentResponse]).superRefine((value, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: "custom", message });
  function inspect(obj: unknown): void {
    if (Array.isArray(obj)) {
      if (obj.length > 2 && obj.every((v) => typeof v === "string" && v.length === 1)) fail("Split character list is forbidden");
      obj.forEach(inspect);
    } else if (obj && typeof obj === "object") {
      for (const [key, nested] of Object.entries(obj)) {
        if (key === "confidence" || key === "coverage") fail(`Forbidden Ask key: ${key}`);
        inspect(nested);
      }
    }
  }
  inspect(value);
  const keys = new Set([...(value.evidence_pack?.usable_keys ?? []), ...(value.evidence_pack?.unusable_keys ?? [])]);
  for (const cit of value.citations ?? []) {
    if ("effective_from" in cit) fail("Citation text has no effective_from");
    if (!keys.has(cit.ref)) fail("Citation is outside evidence pack");
    if (value.state === "answered" && !cit.usable_for_answering) fail("Answered citation must be usable");
  }
  for (const item of value.confirmed ?? []) {
    if ("effective_from" in item) fail("Confirmed text has no effective_from");
    if (typeof item.ref === "string" && keys.size && !keys.has(item.ref)) fail("Confirmed text is outside evidence pack");
  }
  if (value.state !== "out_of_scope" && [value.rows, value.confirmed, value.superseded, value.citations].some((v) => Array.isArray(v) && v.length) && !value.law_version) fail("Legal text or rows require law_version");
  if (value.state === "answered" && (value.uses_model !== false || !(value.rows?.length || value.figures?.length))) fail("Answered requires deterministic rows or figures");
  if (value.state === "partial" && !value.not_confirmed?.length) fail("Partial requires not_confirmed");
  if (value.state === "out_of_scope" && (!value.reason || !value.body?.scope_status || value.body.scope_status === "IN_CORPUS")) fail("Out of scope requires unheld law and its reason");
});
export type AskResponse = z.infer<typeof askResponseSchema>;

export { askLabel } from "./ask-label";
