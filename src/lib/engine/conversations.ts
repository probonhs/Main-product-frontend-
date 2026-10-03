import "./server-guard";
import { z } from "zod";

// Core envelope: backend 127ef70. Trace/role compatibility inspected at 889ba54.
// Connected acceptance remains separate from the offline contract checks.
const nonempty = z.string().min(1);
const id = z.string().uuid();
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const taskSchema = z.enum(["RESEARCH_QUESTION", "REVIEW_CONTRACT", "REVIEW_DOCUMENT", "COMPANY_STANDING", "LAW_CHANGES", "EVENT_ASSESS", "DRAFT", "REVIEW_TABLE", "NEEDS_CLARIFICATION"]);
export const citationSchema = z.object({
  id: nonempty, instrument: nonempty, provision: nonempty, source: nonempty,
  fetched_at: nonempty, sha256: z.string().regex(/^[a-f0-9]{64}$/), quote: nonempty,
  in_force_from: date.nullable().optional(),
}).strict();
export const envelopeSchema = z.object({
  schema: z.literal("answer_envelope.v1"),
  status: z.enum(["ANSWERED", "PARTIAL", "NEEDS_LAWYER", "ABSTAINED", "NEEDS_CLARIFICATION", "FAILED"]),
  task: taskSchema,
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
const messageSchema = z.object({ message_id: id, conversation_id: id, ordinal: z.number().int().nonnegative(), role: z.enum(["user", "assistant"]), text: z.string(), file_ids: z.array(z.string()), task: taskSchema.nullable(), run_id: z.string().nullable(), envelope: envelopeSchema.nullable() });
export const threadSchema = z.object({ conversation: conversationSchema, messages: z.array(messageSchema) }).superRefine((value, ctx) => {
  const messageIds = new Set<string>();
  let previousOrdinal = -1;
  for (const message of value.messages) {
    if (message.conversation_id !== value.conversation.conversation_id || messageIds.has(message.message_id) || message.ordinal <= previousOrdinal || (message.role === "user" && message.envelope !== null)) ctx.addIssue({ code: "custom", message: "Message ownership or ordering is invalid" });
    if (message.envelope && ((message.task !== null && message.task !== message.envelope.task) || (message.run_id && message.envelope.run_id && message.run_id !== message.envelope.run_id))) ctx.addIssue({ code: "custom", message: "Message task or run linkage is invalid" });
    messageIds.add(message.message_id); previousOrdinal = message.ordinal;
  }
});
const listSchema = z.object({ conversations: z.array(conversationSchema) }).superRefine((value, ctx) => {
  if (new Set(value.conversations.map(item => item.conversation_id)).size !== value.conversations.length) ctx.addIssue({ code: "custom", message: "Duplicate conversation identifiers" });
});
const sendSchema = z.object({ conversation_id: id, message_id: id, envelope: envelopeSchema.nullable(), run_id: z.string().nullable().optional() }).passthrough();
const verifiedCitationSchema = z.object({ citation: citationSchema, message_id: id, reverified: z.boolean(), reverified_note: z.string(), note: z.string() });
export const traceSchema = z.object({
  run_id: z.string().nullable(),
  critic_enabled: z.boolean().nullable().optional(),
  critic_note: z.string().nullable().optional(),
  steps: z.array(z.object({ capability: z.string(), status: z.string(), model: z.string().nullable(), provider: z.string().nullable(), region: z.string().nullable(), cost_inr: z.number().nonnegative().nullable(), cost_note: z.string().nullable() })),
});
export type Conversation = z.infer<typeof conversationSchema>;
export type Thread = z.infer<typeof threadSchema>;
export type Envelope = z.infer<typeof envelopeSchema>;
export type Citation = z.infer<typeof verifiedCitationSchema>;
export type Trace = z.infer<typeof traceSchema>;
// runs.get is a process record, not an answer envelope. Strip result, failure detail,
// propositions and any other internal fields before returning it to the browser.
export const runStatusSchema = z.object({
  id,
  status: z.enum(["PLANNED", "RUNNING", "AWAITING_HUMAN", "ANSWERED", "PARTIAL", "REFUSED", "FAILED"]),
  refusal_code: z.enum(["NO_BUDGET", "NO_MODEL", "UNKNOWN_INTENT", "OUT_OF_SCOPE_LAW", "NOT_APPROVED", "CANCELLED", "CORRECTIONS_EXHAUSTED", "NO_EVIDENCE", "NOTHING_TRACED"]).nullable(),
}).superRefine((value, ctx) => {
  if ((value.status === "REFUSED") !== (value.refusal_code !== null)) ctx.addIssue({ code: "custom", message: "Run refusal linkage is invalid" });
});
export type RunStatus = z.infer<typeof runStatusSchema>;
export const conversationCommand = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }).strict(),
  z.object({ action: z.literal("get"), conversationId: id }).strict(),
  z.object({ action: z.literal("send"), conversationId: id.optional(), text: z.string().trim().min(1).max(2000) }).strict(),
  z.object({ action: z.literal("citation"), conversationId: id, messageId: id, citationId: z.string().min(1).max(200) }).strict(),
  z.object({ action: z.literal("trace"), runId: id }).strict(),
  z.object({ action: z.literal("run"), conversationId: id, messageId: id, runId: id }).strict(),
]);
type Command = z.infer<typeof conversationCommand>;

export class ConversationServiceError extends Error {
  constructor(readonly code: string, readonly httpStatus: number, message: string) {
    super(message);
    this.name = "ConversationServiceError";
  }
}

function upstreamError(status: number) {
  if (status === 401) return new ConversationServiceError("AUTHENTICATION_REQUIRED", 401, "The local gateway credential is missing, expired or revoked. The operator needs to reconnect it.");
  if (status === 403) return new ConversationServiceError("ACCESS_DENIED", 403, "The configured gateway role cannot perform this action. Sending questions requires a lawyer or admin principal.");
  if (status === 404) return new ConversationServiceError("NOT_FOUND", 404, "This saved record is unavailable to the configured account. Refresh saved work to check the available records.");
  if (status === 429) return new ConversationServiceError("RATE_LIMITED", 429, "The gateway is limiting requests. Wait before refreshing saved work; do not resend a question automatically.");
  if (status >= 400 && status < 500) return new ConversationServiceError("INVALID_REQUEST", 400, "The gateway could not accept this request. Check the question or saved record reference.");
  return new ConversationServiceError("SERVICE_UNAVAILABLE", 502, "The conversation service is unavailable. Refresh saved work before sending again; a submitted message may already have been stored.");
}

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
  if (!config) throw new ConversationServiceError("NOT_CONFIGURED", 503, "Saved conversations are not connected. Configure the local authenticated gateway to use this workflow.");
  const timeout = AbortSignal.timeout(command.action === "run" ? 15_000 : 120_000);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let path: string, schema: z.ZodType, body: unknown;
  let method = "POST";
  let expectedCitation: z.infer<typeof citationSchema> | undefined;
  switch (command.action) {
    case "list": path = "/v2/conversation/list"; schema = listSchema; body = { limit: "50" }; break;
    case "get": path = `/v2/conversation/${encodeURIComponent(command.conversationId)}`; schema = threadSchema; method = "GET"; break;
    case "send": path = "/v2/conversation/send"; schema = sendSchema; body = { text: command.text, task_override: "RESEARCH_QUESTION", ...(command.conversationId ? { conversation_id: command.conversationId } : {}) }; break;
    case "citation": {
      // Citation IDs are reply-local, but the current upstream route selects the first matching ID.
      // Read the originating record and reject collisions rather than attaching another reply's source.
      const thread = await callConversation({ action: "get", conversationId: command.conversationId }, combined) as Thread;
      expectedCitation = thread.messages.find(message => message.message_id === command.messageId)?.envelope?.citations.find(citation => citation.id === command.citationId);
      if (!expectedCitation) throw new ConversationServiceError("SOURCE_NOT_FOUND", 404, "This source reference was not found in the selected reply. Refresh the conversation.");
      path = "/v2/citation"; schema = verifiedCitationSchema; body = { citation_id: command.citationId, conversation_id: command.conversationId }; break;
    }
    case "trace": path = `/v2/runs/${encodeURIComponent(command.runId)}/trace`; schema = traceSchema; method = "GET"; break;
    case "run": {
      const thread = await callConversation({ action: "get", conversationId: command.conversationId }, combined) as Thread;
      const message = thread.messages.find(item => item.message_id === command.messageId && item.role === "assistant");
      if (!message || message.run_id !== command.runId) throw new ConversationServiceError("RUN_NOT_FOUND", 404, "No matching run is recorded for this reply. Refresh the conversation.");
      path = `/v2/runs/${encodeURIComponent(command.runId)}`; schema = runStatusSchema; method = "GET"; break;
    }
  }
  try {
    const response = await fetch(new URL(path, config.origin), { method, headers: { Authorization: `Bearer ${config.key}`, ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: "no-store", redirect: "error", signal: combined });
    // Never expose upstream detail (which may contain matter text or credential fragments).
    if (!response.ok) {
      await response.body?.cancel();
      throw upstreamError(response.status);
    }
    const reader = response.body?.getReader();
    if (!reader) throw new Error("empty");
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 2_000_000) { await reader.cancel(); throw new Error("too large"); } chunks.push(part.value); }
    const data: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (data && typeof data === "object" && "status" in data && data.status === "REFUSED" && !(command.action === "run" && "id" in data)) throw new ConversationServiceError("WORKFLOW_UNAVAILABLE", 422, "The gateway could not start this workflow. No legal answer was returned.");
    const parsed = schema.safeParse(data);
    if (!parsed.success) throw new ConversationServiceError("INVALID_RESPONSE", 502, "The service returned an unsupported record. No result was displayed. Refresh saved work before sending again.");
    const mismatch = () => new ConversationServiceError("RECORD_MISMATCH", 502, "The service returned a different saved record. Nothing from that response was displayed.");
    if (command.action === "get" && (parsed.data as Thread).conversation.conversation_id !== command.conversationId) throw mismatch();
    if (command.action === "send" && command.conversationId && (parsed.data as z.infer<typeof sendSchema>).conversation_id !== command.conversationId) throw mismatch();
    if (command.action === "trace" && (parsed.data as Trace).run_id !== command.runId) throw mismatch();
    if (command.action === "run" && (parsed.data as RunStatus).id !== command.runId) throw mismatch();
    if (command.action === "citation") {
      const result = parsed.data as Citation;
      const fields = ["id", "instrument", "provision", "source", "fetched_at", "sha256", "quote", "in_force_from"] as const;
      if (result.message_id !== command.messageId || fields.some(field => (result.citation[field] ?? null) !== (expectedCitation![field] ?? null))) throw new ConversationServiceError("SOURCE_REFERENCE_MISMATCH", 409, "The returned source does not belong to this reply. It was not displayed. Message-scoped source lookup needs to be corrected before this passage can be inspected.");
    }
    return parsed.data;
  } catch (error) {
    if (error instanceof ConversationServiceError) throw error;
    throw new ConversationServiceError("SERVICE_UNAVAILABLE", 502, "The conversation service could not complete this request. Refresh the conversation before sending again; a submitted message may already have been stored.");
  }
}
