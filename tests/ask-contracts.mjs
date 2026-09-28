import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith(".") && context.parentURL?.endsWith(".ts")) {
      const url = new URL(specifier + ".ts", context.parentURL);
      if (existsSync(fileURLToPath(url))) return { url: url.href, shortCircuit: true };
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith("file:") && url.endsWith(".ts") && !url.includes("node_modules"))
      return { format: "module", shortCircuit: true, source: ts.transpileModule(readFileSync(new URL(url), "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText };
    return next(url, context);
  },
});
const { askRequestSchema, askResponseSchema, askLabel } = await import("../src/lib/engine/ask.ts");
const { HttpEngineProvider } = await import("../src/lib/engine/http.ts");
const { MockEngineProvider } = await import("../src/lib/engine/mock.ts");
const directory = new URL("../fixtures/engine/", import.meta.url);
const fixtures = readdirSync(directory).filter((name) => /^ask-.*\.json$/.test(name)).map((name) => JSON.parse(readFileSync(new URL(name, directory), "utf8")));
assert.ok(fixtures.length >= 5, "Captured Ask scenarios must exist");
const successful = fixtures.filter((f) => f.response_status === 200);
for (const fixture of fixtures) fixture.request = fixture.request.body ?? fixture.request;
for (const fixture of successful) {
  assert.equal(askRequestSchema.safeParse(fixture.request).success, true, JSON.stringify(askRequestSchema.safeParse(fixture.request).error));
  const parsed = askResponseSchema.safeParse(fixture.response);
  assert.equal(parsed.success, true, `${fixture.fixture_id}: ${JSON.stringify(parsed.error)}`);
  assert.deepEqual(parsed.data, fixture.response, "Preserve wire evidence and unknown fields");
  const expected = fixture.response.state === "answered" ? "Answered" : fixture.response.state === "out_of_scope" ? "Not held — law/source not held" : ["confirmed", "figures", "rows"].some((k) => fixture.response[k]?.length) ? "Abstained in part" : "Abstained";
  assert.equal(askLabel(parsed.data), expected);
}
const answered = successful.find((f) => f.response.state === "answered");
assert.ok(answered);
const request = answered.request;
const base = answered.response;
for (const mutation of [
  { ...base, state: "unknown" },
  { ...base, confidence: null },
  { ...base, extra: { coverage: 0 } },
  { ...base, rows: [], figures: [] },
  { ...base, uses_model: true },
  { ...base, law_version: undefined },
]) assert.equal(askResponseSchema.safeParse(mutation).success, false);
for (const key of ["citations", "confirmed"]) {
  const original = successful.find((f) => f.response.context.kind === "general" && f.response[key]?.length)?.response;
  assert.ok(original, `Captured ${key}`);
  assert.equal(askResponseSchema.safeParse({ ...original, [key]: original[key].map((c) => ({ ...c, effective_from: "2026-01-01" })) }).success, false);
}
const figureSource = successful.find((f) => f.response.figures?.length)?.response;
assert.ok(figureSource);
// Projection tests the validator invariant; this is not a committed legal fixture.
assert.equal(askResponseSchema.safeParse({ ...figureSource, state: "answered", rows: [], citations: [], confirmed: [], not_confirmed: undefined, law_version: undefined }).success, true);
for (const partial of [
  { ...base, state: "partial", confirmed: [], rows: [], figures: base.figures, not_confirmed: [{ kind: "cannot_verify" }] },
  { ...base, state: "partial", confirmed: [], figures: [], not_confirmed: [{ kind: "cannot_verify" }] },
]) assert.equal(askLabel(askResponseSchema.parse(partial)), "Abstained in part");
assert.equal(askRequestSchema.safeParse({ question: "\u0000" }).success, false);
assert.equal(askRequestSchema.safeParse({ question: "x", confidence: 1 }).success, false);
assert.equal(askRequestSchema.safeParse({ question: "x", context: { kind: "document" }, facts: {} }).success, false);
assert.equal(askRequestSchema.safeParse({ question: "x", context: { kind: "document", document_date: "2020-01-01" }, provisions: ["s.173"] }).success, false);

let sent;
const provider = (fetcher) => new HttpEngineProvider("http://127.0.0.1:8020", { fetcher });
const http = provider(async (url, init) => { sent = { url: String(url), init }; return Response.json(base); });
assert.deepEqual(await http.ask(request), { ok: true, data: base });
assert.equal(sent.url, "http://127.0.0.1:8020/v1/ask");
assert.equal(sent.init.method, "POST");
assert.equal(sent.init.cache, "no-store");
assert.deepEqual(JSON.parse(sent.init.body), request);
for (const [status, kind] of [[400, "bad_request"], [404, "not_found"], [500, "server_error"]]) {
  const result = await provider(async () => Response.json({ error: status === 404 ? "not_found" : "bad_request", detail: "field rejected" }, { status })).ask(request);
  assert.equal(result.ok, false);
  assert.equal(result.error.kind, kind);
  assert.equal(result.error.status, status);
  assert.equal(result.error.detail, "field rejected");
  assert.equal("data" in result, false);
}
for (const [fetcher, kind] of [
  [async () => { throw new TypeError("offline"); }, "transport_error"],
  [async () => { throw new DOMException("timeout", "TimeoutError"); }, "timeout"],
  [async () => new Response("not JSON"), "schema_mismatch"],
  [async () => Response.json({ ...base, state: "unknown" }), "schema_mismatch"],
]) assert.equal((await provider(fetcher).ask(request)).error.kind, kind);
const invalid = await provider(async () => { assert.fail("Invalid requests must not fetch"); }).ask({ question: "" });
assert.equal(invalid.error.kind, "bad_request");
assert.equal((await new MockEngineProvider().ask(request)).error.kind, "bad_request");
// Offline regression from the pinned real-handler capture, never a synthetic answer.
const captured = fixtures.find((fixture) => fixture.fixture_id === "ask-resident-evidence");
assert.ok(captured, "Resident evidence capture is required");
const evidenceRequest = captured.request;
assert.equal(captured.response_status, 200);
assert.equal(evidenceRequest.facts.financial_year, "2025-26");
assert.equal(evidenceRequest.facts.evidence.resident_director_days, 182);
assert.ok(evidenceRequest.facts.evidence.board_meetings.length);
assert.ok(evidenceRequest.facts.evidence.agm_dates.length);
assert.equal(captured.response.state, "answered");
assert.deepEqual(captured.response.facts.evidence.value, evidenceRequest.facts.evidence);
assert.deepEqual(askResponseSchema.parse(captured.response), captured.response);
const evidenceHttp = await provider(async () => Response.json(captured.response)).ask(evidenceRequest);
assert.equal(evidenceHttp.ok, true, JSON.stringify(evidenceHttp));
assert.deepEqual(evidenceHttp.data.facts.evidence.value, evidenceRequest.facts.evidence);
for (const badEvidence of [
  { resident_director_days: "182" },
  { board_meetings: ["not-a-date"] },
  { unknown_evidence: true },
]) {
  const altered = structuredClone(captured.response);
  altered.facts.evidence.value = badEvidence;
  assert.equal(askResponseSchema.safeParse(altered).success, false);
}
console.log(`Ask contracts passed (${fixtures.length} captured fixtures; validation, display and HTTP errors).`);
