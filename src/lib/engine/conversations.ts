import "./server-guard";
import { z } from "zod";

// Backend 127ef70: gateway/verbs.py and schemas/answer_envelope.v1.json.
const nonempty = z.string().min(1);
const id = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const citationSchema = z.object({
  id: nonempty, instrument: nonempty, provision: nonempty, source: nonempty,
  fetched_at: nonempty, sha256: z.string().regex(/^[a-f0-9]{64}$/), quote: nonempty,
  in_force_from: date.nullable().optional(),
}).strict();
export const envelopeSchema = z.object({
  schema: z.literal("answer_envelope.v1"),
  status: z.enum(["ANSWERED", "PARTIAL", "NEEDS_LAWYER", "ABSTAINED", "NEEDS_CLARIFICATION", "FAILED"]),
  task: z.enum(["RESEARCH_QUESTION", "REVIEW_CONTRACT", "REVIEW_DOCUMENT", "COMPANY_STANDING", "LAW_CHANGES", "EVENT_ASSESS", "DRAFT", "REVIEW_TABLE", "NEEDS_CLARIFICATION"]),
  as_of: date,
  text_blocks: z.array(z.object({ text: nonempty, citation_ids: z.array(nonempty) }).strict()),
  bodies: z.array(z.object({ body_id: nonempty, name: nonempty, status: z.enum(["ANSWERED", "NOT_HELD", "CURRENT_ONLY", "NEED_FACT", "NOT_ENGAGED"]), note: nonempty }).strict()),
  citations: z.array(citationSchema),
  files: z.array(z.object({ file_id: nonempty, name: nonempty, state: z.enum(["READING", "READ", "CANNOT_READ"]), pages: z.number().int().nonnegative().nullable().optional(), reason: z.string().nullable().optional() }).strict()),
  run_id: z.string().nullable().optional(), trace_url: z.string().nullable().optional(),
}).strict().superRefine((value, ctx) => {
  const ids = new Set(value.citations.map(c => c.id));
  if (ids.size !== value.citations.length || value.text_blocks.some(block => block.citation_ids.some(ref => !ids.has(ref)))) ctx.addIssue({ code: "custom", message: "Citation linkage is invalid" });
  if (value.status === "FAILED" && (value.citations.length || value.bodies.length)) ctx.addIssue({ code: "custom", message: "A technical failure cannot carry legal evidence" });
  if (value.files.some(file => file.state === "CANNOT_READ" && !file.reason?.trim())) ctx.addIssue({ code: "custom", message: "An unreadable file requires a reason" });
});
const conversationSchema = z.object({ conversation_id: id, title: z.string().nullable(), created_at: z.string().nullable(), updated_at: z.string().nullable() });
const messageSchema = z.object({ message_id: id, conversation_id: id, ordinal: z.number().int().nonnegative(), role: z.enum(["user", "assistant"]), text: z.string(), file_ids: z.array(z.string()), task: z.string().nullable(), run_id: z.string().nullable(), envelope: envelopeSchema.nullable() });
export const threadSchema = z.object({ conversation: conversationSchema, messages: z.array(messageSchema) }).superRefine((value, ctx) => {
  const ordinals = new Set<number>();
  for (const message of value.messages) {
    if (message.conversation_id !== value.conversation.conversation_id || ordinals.has(message.ordinal) || (message.role === "user" && message.envelope !== null)) ctx.addIssue({ code: "custom", message: "Message ownership or ordering is invalid" });
    ordinals.add(message.ordinal);
  }
});
const listSchema = z.object({ conversations: z.array(conversationSchema) });
const sendSchema = z.object({ conversation_id: id, message_id: id, envelope: envelopeSchema.nullable(), run_id: z.string().nullable().optional() }).passthrough();
const verifiedCitationSchema = z.object({ citation: citationSchema, message_id: id, reverified: z.boolean(), reverified_note: z.string(), note: z.string() });
const traceSchema = z.object({ run_id: z.string().nullable(), steps: z.array(z.object({ capability: z.string(), status: z.string(), model: z.string().nullable(), provider: z.string().nullable(), region: z.string().nullable(), cost_inr: z.number().nullable(), cost_note: z.string().nullable() })) });
export type Conversation = z.infer<typeof conversationSchema>;
export type Thread = z.infer<typeof threadSchema>;
export type Envelope = z.infer<typeof envelopeSchema>;
export type Citation = z.infer<typeof verifiedCitationSchema>;
export type Trace = z.infer<typeof traceSchema>;
export const conversationCommand = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }).strict(),
  z.object({ action: z.literal("get"), conversationId: id }).strict(),
  z.object({ action: z.literal("send"), conversationId: id.optional(), text: z.string().trim().min(1).max(2000) }).strict(),
  z.object({ action: z.literal("citation"), conversationId: id, citationId: z.string().min(1).max(200) }).strict(),
  z.object({ action: z.literal("trace"), runId: id }).strict(),
]);
type Command = z.infer<typeof conversationCommand>;

export function conversationConfiguration() {
  if (process.env.NODE_ENV !== "development" || !process.env.PLACEDON_GATEWAY_KEY?.trim()) return null;
  try {
    const origin = new URL(process.env.GATEWAY_URL || "");
    if (!["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname) || !["http:", "https:"].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) return null;
    return { origin: origin.origin, key: process.env.PLACEDON_GATEWAY_KEY.trim() };
  } catch { return null; }
}

export async function callConversation(command: Command, signal?: AbortSignal): Promise<unknown> {
  const config = conversationConfiguration();
  if (!config) throw new Error("Saved conversations are not connected. Configure the local authenticated gateway to use this workflow.");
  const timeout = AbortSignal.timeout(120_000);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let path: string, schema: z.ZodType, body: unknown;
  let method = "POST";
  switch (command.action) {
    case "list": path = "/v2/conversation/list"; schema = listSchema; body = { limit: "50" }; break;
    case "get": path = `/v2/conversation/${encodeURIComponent(command.conversationId)}`; schema = threadSchema; method = "GET"; break;
    case "send": path = "/v2/conversation/send"; schema = sendSchema; body = { text: command.text, task_override: "RESEARCH_QUESTION", ...(command.conversationId ? { conversation_id: command.conversationId } : {}) }; break;
    case "citation": path = "/v2/citation"; schema = verifiedCitationSchema; body = { citation_id: command.citationId, conversation_id: command.conversationId }; break;
    case "trace": path = `/v2/runs/${encodeURIComponent(command.runId)}/trace`; schema = traceSchema; method = "GET"; break;
  }
  try {
    const response = await fetch(new URL(path, config.origin), { method, headers: { Authorization: `Bearer ${config.key}`, ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: "no-store", redirect: "error", signal: combined });
    const reader = response.body?.getReader();
    if (!reader) throw new Error("empty");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 2_000_000) { await reader.cancel(); throw new Error("too large"); } chunks.push(part.value); }
    const data: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!response.ok || (data && typeof data === "object" && "status" in data && data.status === "REFUSED")) throw new Error("refused");
    return schema.parse(data);
  } catch {
    throw new Error("The conversation service could not complete this request. Refresh the conversation before sending again; a submitted message may already have been stored.");
  }
}
