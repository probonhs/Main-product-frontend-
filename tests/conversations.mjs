import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const root = new URL("../", import.meta.url);
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "next/link") return next("next/link.js", context);
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
  const { conversationConfiguration, conversationCommand, envelopeSchema, threadSchema, traceSchema, runStatusSchema, callConversation } = await import("../src/lib/engine/conversations.ts");
  const { followRunUpdates, runDescription, RUN_UPDATE_LIMIT, RUN_UPDATE_INTERVAL_MS, RUN_UPDATE_WINDOW_MS } = await import("../src/lib/engine/run-updates.ts");
  const { ConversationWorkspace, PendingReply, recoveryWasRead, draftAfterSubmission, refreshKeepsEvidence } = await import("../src/app/workspace/conversations/conversation-workspace.tsx");
  const { RunDetails } = await import("../src/app/workspace/conversations/run-details.tsx");
  const { POST } = await import("../src/app/api/workspace/conversations/route.ts");
  const uuid = "11111111-1111-4111-8111-111111111111";
  const chatHtml = renderToStaticMarkup(React.createElement(ConversationWorkspace, { enabled: true }));
  for (const text of ['class="ws-form ws-composer"', 'aria-label="Send question"', 'for="conversation-question"', 'aria-label="Suggested questions"', "Shift + Enter for a new line", "does not infer them from earlier messages", "Attachments unavailable"]) assert.ok(chatHtml.includes(text));
  const unconfiguredChat = renderToStaticMarkup(React.createElement(ConversationWorkspace, { enabled: false }));
  assert.ok(unconfiguredChat.includes("Saved conversations are not connected"));
  assert.equal(unconfiguredChat.includes('id="conversation-question"'), false);
  const step = { capability: "Test step", status: "DONE", model: null, provider: null, region: null, cost_inr: null, cost_note: null };
  const oldTrace = traceSchema.parse({ run_id: uuid, steps: [step] });
  assert.equal(oldTrace.critic_enabled, undefined);
  assert.equal(traceSchema.safeParse({ run_id: uuid, steps: [], critic_enabled: "false" }).success, false);
  assert.equal(traceSchema.safeParse({ run_id: uuid, steps: [{ ...step, cost_inr: -1 }] }).success, false);
  for (const critic of [undefined, null, false, true]) {
    const trace = traceSchema.parse({ run_id: uuid, steps: [step], ...(critic === undefined ? {} : { critic_enabled: critic }), critic_note: null });
    const html = renderToStaticMarkup(React.createElement(RunDetails, { trace }));
    assert.ok(html.includes(critic === true ? ">On<" : critic === false ? ">Off<" : ">Not recorded<"));
    assert.ok(html.includes("Not priced"));
    assert.ok(html.includes("Provider"));
    assert.equal(html.includes(">0<"), false);
  }
  const priced = traceSchema.parse({ run_id: uuid, critic_enabled: true, critic_note: "Recorded test note", steps: [{ ...step, provider: "Test provider", cost_inr: 0 }] });
  const pricedHtml = renderToStaticMarkup(React.createElement(RunDetails, { trace: priced }));
  assert.ok(pricedHtml.includes("Test provider")); assert.ok(pricedHtml.includes(">0<")); assert.ok(pricedHtml.includes("Recorded test note"));
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
  const otherId = "22222222-2222-4222-8222-222222222222";
  const laterId = "33333333-3333-4333-8333-333333333333";
  assert.equal(threadSchema.safeParse({ conversation, messages: [message, { ...message, ordinal: 1 }] }).success, false);
  assert.equal(threadSchema.safeParse({ conversation, messages: [{ ...message, message_id: otherId, ordinal: 1 }, message] }).success, false);
  assert.equal(threadSchema.safeParse({ conversation, messages: [{ ...message, task: "UNKNOWN" }] }).success, false);
  assert.equal(threadSchema.safeParse({ conversation, messages: [{ ...message, task: "DRAFT", envelope }] }).success, false);
  assert.equal(threadSchema.safeParse({ conversation, messages: [{ ...message, run_id: uuid, envelope: { ...envelope, run_id: otherId } }] }).success, false);
  assert.equal(threadSchema.safeParse({ conversation, messages: [{ ...message, run_id: uuid, envelope: null }] }).success, true);
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
  for (const [status, code] of [[401, "AUTHENTICATION_REQUIRED"], [403, "ACCESS_DENIED"], [404, "NOT_FOUND"], [429, "RATE_LIMITED"], [400, "INVALID_REQUEST"]]) {
    globalThis.fetch = async () => Response.json({ detail: "private upstream text test-only-key" }, { status });
    const response = await POST(request({ action: "send", text: "Test" }));
    assert.equal(response.status, status); const payload = await response.json();
    assert.equal(payload.error.code, code); assert.equal(JSON.stringify(payload).includes("test-only-key"), false);
  }
  globalThis.fetch = async () => Response.json({ status: "REFUSED", detail: "private upstream text test-only-key" });
  const unavailable = await POST(request({ action: "send", text: "Test" }));
  assert.equal(unavailable.status, 422); assert.equal((await unavailable.json()).error.code, "WORKFLOW_UNAVAILABLE");
  const citation = { id: "c1", instrument: "Non-legal test instrument", provision: "Non-legal test reference", source: "test source", fetched_at: "test retrieval", sha256: "0".repeat(64), quote: "Synthetic non-legal source passage", in_force_from: null };
  const sourceEnvelope = { ...envelope, citations: [citation], text_blocks: [{ text: "Non-legal linkage test", citation_ids: ["c1"] }] };
  const first = { ...message, message_id: otherId, ordinal: 0, envelope: sourceEnvelope };
  const later = { ...message, message_id: laterId, ordinal: 1, envelope: sourceEnvelope };
  const sourceThread = { conversation, messages: [first, later] };
  const sourceResult = { citation, message_id: otherId, reverified: true, reverified_note: "Synthetic re-check", note: "Test record" };
  let sourceOverride = sourceResult;
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith(`/v2/conversation/${uuid}`)) { assert.equal(init.method, "GET"); return Response.json(sourceThread); }
    assert.equal(String(url), "http://127.0.0.1:8020/v2/citation");
    assert.deepEqual(JSON.parse(init.body), { conversation_id: uuid, citation_id: "c1" });
    return Response.json(sourceOverride);
  };
  const sourceRequest = messageId => request({ action: "citation", conversationId: uuid, messageId, citationId: "c1" });
  assert.equal((await POST(sourceRequest(otherId))).status, 200);
  const collision = await POST(sourceRequest(laterId));
  assert.equal(collision.status, 409); const collisionBody = await collision.json();
  assert.equal(collisionBody.error.code, "SOURCE_REFERENCE_MISMATCH");
  assert.equal(JSON.stringify(collisionBody).includes(citation.quote), false);
  sourceOverride = { ...sourceResult, citation: { ...citation, quote: "A different synthetic passage" } };
  assert.equal((await POST(sourceRequest(otherId))).status, 409);
  sourceOverride = { ...sourceResult, reverified: false, reverified_note: "Source no longer matches" };
  assert.equal((await (await POST(sourceRequest(otherId))).json()).data.reverified, false);
  assert.equal((await POST(request({ action: "citation", conversationId: uuid, citationId: "c1" }))).status, 400);
  globalThis.fetch = async () => Response.json({ conversation: { ...conversation, conversation_id: otherId }, messages: [] });
  const wrongThread = await POST(request({ action: "get", conversationId: uuid }));
  assert.equal(wrongThread.status, 502); assert.equal((await wrongThread.json()).error.code, "RECORD_MISMATCH");
  globalThis.fetch = async () => Response.json({ conversation_id: otherId, message_id: laterId, envelope });
  assert.equal((await POST(request({ action: "send", conversationId: uuid, text: "Test" }))).status, 502);
  globalThis.fetch = async () => Response.json({ run_id: otherId, steps: [] });
  assert.equal((await POST(request({ action: "trace", runId: uuid }))).status, 502);
  // Synthetic PROCESS states only: no fabricated legal answers or model calls.
  const planned = { id: uuid, status: "PLANNED", refusal_code: null };
  assert.equal(RUN_UPDATE_LIMIT, 3); assert.equal(RUN_UPDATE_INTERVAL_MS, 5000); assert.equal(RUN_UPDATE_WINDOW_MS, 60000);
  assert.equal(recoveryWasRead(uuid, undefined), false);
  assert.equal(recoveryWasRead(uuid, otherId), false);
  assert.equal(recoveryWasRead(uuid, uuid), true);
  assert.equal(recoveryWasRead(undefined, undefined), true); // explicit list review only, not rejection proof
  assert.equal(draftAfterSubmission("Submitted draft", "Submitted draft"), "");
  assert.equal(draftAfterSubmission("Edited while waiting", "Submitted draft"), "Edited while waiting");
  assert.equal(refreshKeepsEvidence(uuid, uuid), true);
  assert.equal(refreshKeepsEvidence(uuid, undefined), true);
  assert.equal(refreshKeepsEvidence(uuid, otherId), false);
  const runRequest = { action: "run", conversationId: uuid, messageId: otherId, runId: uuid };
  const pendingThread = { conversation, messages: [{ ...message, message_id: otherId, run_id: uuid }] };
  for (const status of ["PLANNED", "RUNNING", "AWAITING_HUMAN", "ANSWERED", "PARTIAL", "REFUSED", "FAILED"]) {
    const run = { ...planned, status, refusal_code: status === "REFUSED" ? "NO_EVIDENCE" : null };
    assert.equal(runStatusSchema.safeParse(run).success, true);
    const projected = runStatusSchema.parse({ ...run, result: { answer: "private internal result" }, failure_reason: "private reason", propositions: [{ status: "VERIFIED" }], intent: "research_question" });
    assert.deepEqual(projected, run);
    for (const busy of [true, false]) {
      const html = renderToStaticMarkup(React.createElement(PendingReply, { run, hasRun: true, busy, onCheck() {} }));
      assert.ok(html.includes(runDescription(run).title));
      assert.ok(html.includes("Last checked run status"));
      assert.equal(html.includes('disabled=""'), busy);
      assert.equal(html.includes("private"), false); assert.equal(html.includes("progressbar"), false);
    }
    let calls = 0;
    globalThis.fetch = async (url, init) => {
      calls++; assert.equal(init.method, "GET"); assert.equal(init.cache, "no-store");
      if (calls === 1) { assert.ok(String(url).endsWith(`/conversation/${uuid}`)); return Response.json(pendingThread); }
      assert.ok(String(url).endsWith(`/runs/${uuid}`));
      return Response.json({ ...run, result: { secret: "test-only-key" }, failure_reason: "private reason", propositions: [] });
    };
    const result = await POST(request(runRequest)); assert.equal(result.status, 200);
    const payload = await result.json(); assert.deepEqual(payload.data, run); assert.equal(calls, 2);
    assert.equal(JSON.stringify(payload).includes("test-only-key"), false);
    assert.equal(JSON.stringify(payload).includes("private"), false);
  }
  assert.equal(runStatusSchema.safeParse({ ...planned, status: "MAYBE" }).success, false);
  assert.equal(runStatusSchema.safeParse({ ...planned, status: "REFUSED" }).success, false);
  assert.equal(runStatusSchema.safeParse({ ...planned, status: "FAILED", refusal_code: "CANCELLED" }).success, false);
  assert.equal(runStatusSchema.safeParse({ ...planned, status: "REFUSED", refusal_code: "MAGIC" }).success, false);
  assert.equal(runDescription({ ...planned, status: "REFUSED", refusal_code: "CANCELLED" }).title, "Run cancelled");
  for (const hasRun of [true, false]) {
    const html = renderToStaticMarkup(React.createElement(PendingReply, { hasRun, busy: false, onCheck() {} }));
    assert.ok(html.includes(hasRun ? "Reply pending" : "Reply not yet available"));
    assert.equal(html.includes("Check reply updates"), hasRun);
    assert.equal(html.includes("Processing</h2>"), false);
  }
  let runCalls = 0;
  globalThis.fetch = async () => { runCalls++; return Response.json(pendingThread); };
  assert.equal((await POST(request({ ...runRequest, messageId: laterId }))).status, 404); assert.equal(runCalls, 1);
  assert.equal((await POST(request({ ...runRequest, runId: otherId }))).status, 404);
  globalThis.fetch = async url => String(url).includes("/conversation/") ? Response.json(pendingThread) : Response.json({ ...planned, id: otherId });
  assert.equal((await POST(request(runRequest))).status, 502);
  globalThis.fetch = async url => String(url).includes("/conversation/") ? Response.json(pendingThread) : Response.json({ status: "REFUSED", code: "NOT_FOUND", detail: "private text" });
  assert.equal((await POST(request(runRequest))).status, 422);
  assert.equal((await POST(request({ action: "run", runId: uuid }))).status, 400);
  const signal = new AbortController().signal;
  let reads = 0, waits = 0, records = [];
  const options = { signal, visible: () => true, read: async () => { reads++; return planned; }, onRecord: run => records.push(run), wait: async ms => { assert.equal(ms, 5000); waits++; } };
  assert.equal(await followRunUpdates(options), "limit"); assert.equal(reads, 3); assert.equal(waits, 2); assert.equal(records.length, 3);
  for (const status of ["AWAITING_HUMAN", "ANSWERED", "PARTIAL", "REFUSED", "FAILED"]) {
    reads = 0; waits = 0;
    assert.equal(await followRunUpdates({ ...options, read: async () => { reads++; return { ...planned, status }; } }), "finished");
    assert.equal(reads, 1); assert.equal(waits, 0);
  }
  reads = 0;
  assert.equal(await followRunUpdates({ ...options, visible: () => false }), "hidden"); assert.equal(reads, 0);
  records = [];
  let visible = true;
  assert.equal(await followRunUpdates({ ...options, visible: () => visible, read: async () => { visible = false; return planned; } }), "hidden"); assert.equal(records.length, 0);
  const stopped = new AbortController(); stopped.abort(); reads = 0;
  await assert.rejects(followRunUpdates({ ...options, signal: stopped.signal })); assert.equal(reads, 0);
  const stale = new AbortController(); records = [];
  await assert.rejects(followRunUpdates({ ...options, signal: stale.signal, read: async () => { stale.abort(); return planned; } })); assert.equal(records.length, 0);
  reads = 0;
  await assert.rejects(followRunUpdates({ ...options, read: async () => { reads++; throw new Error("Offline synthetic failure"); } })); assert.equal(reads, 1);
  const sleeping = new AbortController(); records = [];
  const waiting = followRunUpdates({ ...options, signal: sleeping.signal, wait: undefined, onRecord: run => { records.push(run); queueMicrotask(() => sleeping.abort()); } });
  await assert.rejects(waiting); assert.equal(records.length, 1);
  for (const finalStatus of ["RUNNING", "ANSWERED"]) {
    let upstreamReads = 0, statusReads = 0;
    globalThis.fetch = async url => {
      upstreamReads++;
      if (String(url).includes("/conversation/")) return Response.json(pendingThread);
      statusReads++;
      return Response.json({ ...planned, status: statusReads === 3 ? finalStatus : "RUNNING" });
    };
    const outcome = await followRunUpdates({ ...options, read: activeSignal => callConversation(runRequest, activeSignal) });
    if (outcome === "finished") await callConversation({ action: "get", conversationId: uuid }, signal);
    assert.equal(statusReads, 3); assert.equal(upstreamReads, finalStatus === "RUNNING" ? 6 : 7); assert.ok(upstreamReads <= 8);
  }
  console.log("PASS: conversation contract, ownership, local gating, CSRF, gateway path and credential-redaction checks");
  console.log("PASS: seven process states, private-result projection, message/run correlation and bounded update/abort/visibility/terminal/error checks (synthetic offline only)");
} finally {
  globalThis.fetch = saved.fetch;
  for (const [key, value] of [["NODE_ENV", saved.mode], ["GATEWAY_URL", saved.origin], ["PLACEDON_GATEWAY_KEY", saved.key]]) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  hooks.deregister();
}
