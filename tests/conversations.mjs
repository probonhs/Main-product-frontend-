import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const hooks = registerHooks({
  resolve(specifier, context, next) {
    const base = specifier.startsWith("@/") ? new URL(`src/${specifier.slice(2)}`, root) : specifier.startsWith(".") && /\.tsx?$/.test(context.parentURL ?? "") ? new URL(specifier, context.parentURL) : null;
    if (base) for (const extension of [".ts", ".tsx"]) { const candidate = new URL(base.href + extension); if (existsSync(fileURLToPath(candidate))) return { url: candidate.href, shortCircuit: true }; }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith(root.href) && /\.tsx?$/.test(url) && !url.includes("node_modules")) return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(new URL(url), "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX } }).outputText };
    return next(url, context);
  },
});
const saved = { mode: process.env.NODE_ENV, origin: process.env.GATEWAY_URL, key: process.env.PLACEDON_GATEWAY_KEY, fetch: globalThis.fetch };
try {
  const { conversationConfiguration, conversationCommand, envelopeSchema, threadSchema, callConversation } = await import("../src/lib/engine/conversations.ts");
  const { POST } = await import("../src/app/api/workspace/conversations/route.ts");
  const uuid = "11111111-1111-4111-8111-111111111111";
  const envelope = { schema: "answer_envelope.v1", status: "NEEDS_CLARIFICATION", task: "NEEDS_CLARIFICATION", as_of: "2026-10-02", text_blocks: [{ text: "Non-legal test message", citation_ids: [] }], bodies: [], citations: [], files: [] };
  assert.equal(envelopeSchema.safeParse(envelope).success, true);
  assert.equal(envelopeSchema.safeParse({ ...envelope, status: "MAGIC" }).success, false);
  assert.equal(envelopeSchema.safeParse({ ...envelope, text_blocks: [{ text: "Test", citation_ids: ["absent"] }] }).success, false);
  assert.equal(envelopeSchema.safeParse({ ...envelope, files: [{ file_id: "x", name: "x", state: "CANNOT_READ" }] }).success, false);
  assert.equal(envelopeSchema.safeParse({ ...envelope, status: "FAILED", bodies: [{ body_id: "test", name: "test", status: "ANSWERED", note: "test" }] }).success, false);
  const conversation = { conversation_id: uuid, title: "Test thread", created_at: null, updated_at: null };
  const message = { message_id: uuid, conversation_id: uuid, ordinal: 0, role: "assistant", text: "", file_ids: [], task: null, run_id: null, envelope: null };
  assert.equal(threadSchema.safeParse({ conversation, messages: [message] }).success, true);
  assert.equal(threadSchema.safeParse({ conversation, messages: [message, message] }).success, false);
  assert.equal(threadSchema.safeParse({ conversation, messages: [{ ...message, conversation_id: "22222222-2222-4222-8222-222222222222" }] }).success, false);
  assert.equal(conversationCommand.safeParse({ action: "get", conversationId: "../../secrets" }).success, false);
  assert.equal(conversationCommand.safeParse({ action: "send", text: "test", tenant_id: uuid }).success, false);
  process.env.NODE_ENV = "production"; process.env.GATEWAY_URL = "http://localhost:8020"; process.env.PLACEDON_GATEWAY_KEY = "test-only-key";
  assert.equal(conversationConfiguration(), null);
  process.env.NODE_ENV = "development";
  assert.ok(conversationConfiguration());
  for (const origin of ["http://example.com", "http://user:password@localhost:8020", "http://localhost:8020/path", "http://localhost:8020?x=1"]) { process.env.GATEWAY_URL = origin; assert.equal(conversationConfiguration(), null); }
  process.env.GATEWAY_URL = "http://127.0.0.1:8020";
  const request = (body, origin = "http://localhost:3300") => new Request("http://localhost:3300/api/workspace/conversations", { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(body) });
  let upstream = 0;
  globalThis.fetch = async (url, init) => { upstream++; assert.equal(String(url), "http://127.0.0.1:8020/v2/conversation/list"); assert.equal(init.headers.Authorization, "Bearer test-only-key"); assert.equal(init.redirect, "error"); return Response.json({ conversations: [conversation] }); };
  assert.equal((await POST(request({ action: "list" }, "https://untrusted.example"))).status, 403);
  assert.equal(upstream, 0);
  assert.equal((await POST(request({ action: "send", text: "x", unknown: true }))).status, 400);
  assert.equal((await POST(request({ action: "list" }))).status, 200);
  assert.equal(upstream, 1);
  globalThis.fetch = async (url, init) => { assert.equal(String(url), "http://127.0.0.1:8020/v2/conversation/send"); assert.deepEqual(JSON.parse(init.body), { text: "Test question", task_override: "RESEARCH_QUESTION" }); return Response.json({ conversation_id: uuid, message_id: uuid, envelope }); };
  await callConversation({ action: "send", text: "Test question" });
  globalThis.fetch = async () => Response.json({ conversations: [{ ...conversation, conversation_id: "bad" }] });
  assert.equal((await POST(request({ action: "list" }))).status, 502);
  globalThis.fetch = async () => Response.json({ status: "REFUSED", detail: "secret detail test-only-key" }, { status: 503 });
  const refusal = await POST(request({ action: "list" }));
  assert.equal(refusal.status, 502); assert.equal((await refusal.text()).includes("test-only-key"), false);
  console.log("PASS: conversation contract, ownership, local gating, CSRF, gateway path and credential-redaction checks");
} finally {
  globalThis.fetch = saved.fetch;
  for (const [key, value] of [["NODE_ENV", saved.mode], ["GATEWAY_URL", saved.origin], ["PLACEDON_GATEWAY_KEY", saved.key]]) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  hooks.deregister();
}
