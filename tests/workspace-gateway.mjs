import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = new URL("../", import.meta.url);
const hooks = registerHooks({
  resolve(specifier, context, next) {
    const candidate = specifier.startsWith("@/")
      ? new URL(`src/${specifier.slice(2)}.ts`, root)
      : specifier.startsWith(".") && context.parentURL?.endsWith(".ts")
        ? new URL(`${specifier}.ts`, context.parentURL) : null;
    if (candidate && existsSync(fileURLToPath(candidate))) return { url: candidate.href, shortCircuit: true };
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith(root.href) && url.endsWith(".ts") && !url.includes("node_modules")) {
      return {
        format: "module", shortCircuit: true,
        source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
          compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
        }).outputText,
      };
    }
    return next(url, context);
  },
});

let assertions = 0;
let cases = 0;
function equal(actual, expected, label) {
  assert.deepEqual(actual, expected, label);
  assertions += 1;
}
function check(value, label) {
  assert.ok(value, label);
  assertions += 1;
}
const fixture = (id) => JSON.parse(readFileSync(new URL(`fixtures/engine/${id}.json`, root), "utf8"));
const examples = ["ask-answered", "ask-partial", "ask-abstained", "ask-not-held"];
const answered = fixture("ask-answered");
const saved = {
  cwd: process.cwd(), fetch: globalThis.fetch, Date: globalThis.Date,
  env: Object.fromEntries(["NODE_ENV", "PLACEDON_API_ORIGIN", "PLACEDON_API_TOKEN"].map((key) => [key, process.env[key]])),
};
const stamp = "2026-09-27T00:00:00Z";
const today = stamp.slice(0, 10);
const local = "http://localhost:3300/api/workspace/ask";
const encoder = new TextEncoder();
let calls = [];
let upstream = async () => { throw new Error("Unexpected backend fetch: this suite must stay offline"); };

function environment(mode = "development", origin = "http://127.0.0.1:8020") {
  process.env.NODE_ENV = mode;
  if (origin === undefined) delete process.env.PLACEDON_API_ORIGIN;
  else process.env.PLACEDON_API_ORIGIN = origin;
  delete process.env.PLACEDON_API_TOKEN;
  calls = [];
  upstream = async () => { throw new Error("Unexpected backend fetch"); };
}
function request(body, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  return new Request(options.url ?? local, {
    method: "POST", headers,
    ...(options.empty ? {} : { body: options.raw ?? JSON.stringify(body) }),
  });
}

try {
  process.chdir(fileURLToPath(root));
  // Pin the clock, not legal output: mocked legal bodies are real captured records.
  const NativeDate = saved.Date;
  globalThis.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [stamp])); }
    static now() { return NativeDate.parse(stamp); }
  };
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return upstream(url, init);
  };
  const { POST } = await import("../src/app/api/workspace/ask/route.ts");

  async function exchange(label, input, status) {
    cases += 1;
    const response = await POST(input);
    equal(response.status, status, `${label}: HTTP status`);
    equal(response.headers.get("cache-control"), "no-store", `${label}: response no-store`);
    equal(response.headers.get("x-content-type-options"), "nosniff", `${label}: nosniff`);
    check(response.headers.get("content-type")?.startsWith("application/json"), `${label}: JSON response`);
    const body = await response.json();
    equal(body.ok, status === 200, `${label}: success discriminant`);
    if (status !== 200) {
      check(typeof body.error?.message === "string" && body.error.message.length > 0, `${label}: error message`);
      equal("data" in body, false, `${label}: failure contains no legal result`);
      equal("state" in body || "state" in body.error, false, `${label}: failure contains no legal state`);
    }
    return body;
  }
  async function denied(label, input, status, message) {
    const body = await exchange(label, input, status);
    equal(calls.length, 0, `${label}: no backend request`);
    if (message) check(body.error.message.includes(message), `${label}: reason`);
    return body;
  }

  environment("production");
  for (const id of examples) {
    const body = await exchange(`production sample ${id}`, request({ sampleId: id }), 200);
    const source = fixture(id);
    equal(body.mode, "sample", `${id}: sample mode`);
    equal(body.data, source.response, `${id}: exact captured response`);
    equal(body.sample, { id, capturedAt: source.captured_at, backendCommit: source.backend_commit }, `${id}: provenance`);
    equal(calls.length, 0, `${id}: sample does not fetch`);
  }
  await denied("invalid sample", request({ sampleId: "unknown" }), 404, "not available");
  await denied("sample traversal", request({ sampleId: "../../package" }), 404);
  await denied("unlisted document sample", request({ sampleId: "ask-document" }), 404);
  await denied("production live disabled", request(answered.request.body), 403, "Live checks are unavailable");
  await denied("plain text", request({}, { headers: { "Content-Type": "text/plain" } }), 415);
  await denied("missing content type", new Request(local, { method: "POST", body: encoder.encode("{}") }), 415);
  await denied("cross origin", request({ sampleId: examples[0] }, { headers: { Origin: "https://other.example" } }), 403);
  await denied("opaque origin", request({ sampleId: examples[0] }, { headers: { Origin: "null" } }), 403);
  await denied("empty body", request(undefined, { empty: true }), 400);
  await denied("malformed JSON", request(null, { raw: "{" }), 400, "could not be read");

  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(" ".repeat(12000)));
      controller.enqueue(encoder.encode(" ".repeat(12001)));
    },
    cancel() { cancelled = true; },
  });
  await denied("oversize chunked body with false length", new Request(local, {
    method: "POST", headers: { "Content-Type": "application/json", "Content-Length": "1" },
    body: stream, duplex: "half",
  }), 413);
  equal(cancelled, true, "oversize body stream cancelled");
  await denied("oversize Unicode bytes", request({ question: "₹".repeat(8001) }), 413);
  // Exactly 24,000 bytes is accepted; the parser ignores the whitespace padding.
  const sampleJSON = JSON.stringify({ sampleId: examples[0] });
  const padded = sampleJSON + " ".repeat(24000 - encoder.encode(sampleJSON).length);
  const bounded = await exchange("exact byte limit and same origin", request(null, {
    raw: padded, headers: { "Content-Type": "application/json; charset=utf-8", Origin: "http://localhost:3300" },
  }), 200);
  equal(bounded.data, answered.response, "byte-limit sample preserved");
  equal(calls.length, 0, "byte-limit sample has no backend fetch");

  const liveRequest = { ...answered.request.body, as_of: today };
  for (const origin of ["https://engine.example", "http://192.168.1.20:8020", "not-a-url", "", "https://user:secret@localhost:8020"]) {
    environment("development", origin);
    await denied(`nonlocal/invalid engine ${origin}`, request(liveRequest), 403, "Live checks are unavailable");
  }
  environment("development");
  delete process.env.PLACEDON_API_ORIGIN;
  await denied("missing engine origin", request(liveRequest), 403);
  environment("test");
  await denied("test environment live disabled", request(liveRequest), 403);
  for (const url of ["http://192.168.1.20:3300/api/workspace/ask", "https://workspace.example/api/workspace/ask", "http://localhost.example:3300/api/workspace/ask"]) {
    environment();
    await denied(`nonloopback gateway ${url}`, request(liveRequest, { url }), 403, "local machine");
  }
  environment();
  for (const date of ["2026-09-26", "2026-09-28"]) {
    await denied(`non-today ${date}`, request({ ...liveRequest, as_of: date, facts: { ...liveRequest.facts, as_of: date } }), 400, "Earlier-date checks");
  }
  await denied("contradictory turn and fact dates", request({
    ...liveRequest, facts: { ...liveRequest.facts, as_of: "2026-09-26" },
  }), 400, "Contradicts turn as_of");
  await denied("document context", request(fixture("ask-document").request.body), 400, "general questions");
  await denied("empty question", request({ question: "" }), 400);
  await denied("unknown request field", request({ question: "Question", confidence: 1 }), 400);
  await denied("sample request with extra fields", request({ sampleId: examples[0], question: "Question" }), 400);

  // Test every wire state using captured bodies, never invented legal outcomes.
  for (const id of examples) {
    environment();
    const source = fixture(id);
    upstream = async () => Response.json(source.response);
    const input = { ...source.request.body, as_of: today };
    const body = await exchange(`live captured ${id}`, request(input), 200);
    equal(body.mode, "local", `${id}: local mode`);
    equal(body.data, source.response, `${id}: legal response preserved`);
    equal("sample" in body, false, `${id}: live does not invent sample provenance`);
    equal(calls.length, 1, `${id}: single backend call`);
    equal(calls[0].url, "http://127.0.0.1:8020/v1/ask", `${id}: actual backend route`);
    equal(calls[0].init.method, "POST", `${id}: POST`);
    equal(calls[0].init.cache, "no-store", `${id}: upstream no-store`);
    equal(calls[0].init.redirect, "error", `${id}: no redirect of facts`);
    equal(JSON.parse(calls[0].init.body), input, `${id}: request semantics preserved`);
  }
  for (const [origin, url] of [
    ["http://localhost:8020", "http://localhost:3300/api/workspace/ask"],
    ["http://127.0.0.1:8020", "http://127.0.0.1:3300/api/workspace/ask"],
    ["http://[::1]:8020", "http://[::1]:3300/api/workspace/ask"],
  ]) {
    environment("development", origin);
    upstream = async () => Response.json(answered.response);
    const { as_of: omitted, ...input } = liveRequest;
    void omitted;
    await exchange(`loopback ${origin}, default today`, request(input, { url }), 200);
    equal(calls.length, 1, `${origin}: accepted loopback`);
    equal(JSON.parse(calls[0].init.body), { ...input, as_of: today }, `${origin}: server applies today`);
  }

  for (const [label, fetcher, status] of [
    ["transport failure", async () => { throw new TypeError("offline"); }, 502],
    ["timeout", async () => { throw new DOMException("timeout", "TimeoutError"); }, 502],
    ["backend validation", async () => Response.json(fixture("ask-invalid").response, { status: 400 }), 400],
    ["backend 500", async () => Response.json({ error: "contract_violation", detail: "withheld" }, { status: 500 }), 502],
    ["non-JSON backend", async () => new Response("not JSON"), 502],
    ["unknown legal enum", async () => Response.json({ ...answered.response, state: "unknown" }), 502],
  ]) {
    environment();
    upstream = fetcher;
    const body = await exchange(label, request(liveRequest), status);
    equal(calls.length, 1, `${label}: one attempted backend call`);
    if (status === 400) equal(body.error.message, fixture("ask-invalid").response.detail, "backend validation detail preserved");
  }
  console.log(`PASS: ${assertions} assertions across ${cases} offline workspace gateway cases`);
} finally {
  globalThis.fetch = saved.fetch;
  globalThis.Date = saved.Date;
  for (const [key, value] of Object.entries(saved.env)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  process.chdir(saved.cwd);
  hooks.deregister();
}
