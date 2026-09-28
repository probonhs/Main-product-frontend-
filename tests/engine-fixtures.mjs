import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const directory = new URL("../fixtures/engine/", import.meta.url);
const commit = "948660041b73e610e017b2036ab97848efe7a26e";
const stamp = "2026-09-27T00:00:00Z";
const day = stamp.slice(0, 10);
let assertions = 0;
function check(condition, message) {
  assert.ok(condition, message);
  assertions += 1;
}
function equal(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  assertions += 1;
}
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const nonempty = (value) => typeof value === "string" && value.length > 0;
const sha = (value) => typeof value === "string" && /^[0-9a-f]{64}$/.test(value);

// Matches json.dumps(sort_keys=True, ensure_ascii=True, separators=(",", ":")).
// These fixture payloads contain only safe integer numbers. Reject other numbers
// rather than silently hash a JS rounding or Python float-serialization difference.
function canonical(value) {
  if (value === null || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "string") {
    return JSON.stringify(value).replace(/[\u007f-\uffff]/g, (char) =>
      `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`);
  }
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || Object.is(value, -0)) throw new TypeError("canonical number must be a safe integer");
    return String(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (!object(value)) throw new TypeError("canonical value must be JSON");
  const compare = (a, b) => {
    const x = Array.from(a, (char) => char.codePointAt(0));
    const y = Array.from(b, (char) => char.codePointAt(0));
    for (let i = 0; i < Math.min(x.length, y.length); i += 1) {
      if (x[i] !== y[i]) return x[i] - y[i];
    }
    return x.length - y.length;
  };
  return `{${Object.keys(value).sort(compare).map((key) => `${canonical(key)}:${canonical(value[key])}`).join(",")}}`;
}
const hash = (value) => createHash("sha256").update(canonical(value), "ascii").digest("hex");
equal(canonical({ z: "₹😀\u007f", a: [null, true, "\n"] }),
  '{"a":[null,true,"\\n"],"z":"\\u20b9\\ud83d\\ude00\\u007f"}', "ASCII canonical escape vector");
equal(canonical({ "😀": 1, "\ue000": 2 }), '{"\\ue000":2,"\\ud83d\\ude00":1}', "Python code-point key ordering");
equal(hash({}), "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a", "SHA256 known vector");

const scenarios = {
  "ask-answered": ["POST /v1/ask", 200, "answered"],
  "ask-resident-evidence": ["POST /v1/ask", 200, "answered"],
  "ask-partial": ["POST /v1/ask", 200, "partial"],
  "ask-abstained": ["POST /v1/ask", 200, "partial"],
  "ask-not-held": ["POST /v1/ask", 200, "out_of_scope"],
  "ask-document": ["POST /v1/ask", 200, "partial"],
  "ask-invalid": ["POST /v1/ask", 400],
  "compliance-pack": ["POST /v1/compliance-pack", 200],
  "document-check": ["POST /v1/document-check", 200],
  events: ["GET /v1/company/U74999KA2021PTC145321/events", 200],
  "instrument-impact": ["GET /v1/instruments/880/affected", 200],
  health: ["GET /v1/health", 200],
  "mca-strip": ["POST /v1/mca-strip", 200],
};
const envelopeKeys = ["schema_version", "fixture_id", "captured_at", "backend_commit", "route", "request",
  "response_status", "response", "request_sha256", "response_sha256", "contains_personal_data",
  "sanitisation", "capture_command", "verified_by"].sort();
const files = readdirSync(directory).filter((name) => name.endsWith(".json")).sort();
equal(files, Object.keys(scenarios).map((name) => `${name}.json`).sort(), "exact fixture inventory");
const fixtures = {};
function forbid(value) {
  if (Array.isArray(value)) return value.forEach(forbid);
  if (!object(value)) return;
  for (const [key, item] of Object.entries(value)) {
    check(key !== "confidence" && key !== "coverage", `Ask forbids ${key}`);
    forbid(item);
  }
}
for (const filename of files) {
  const name = filename.slice(0, -5);
  const fixture = JSON.parse(readFileSync(new URL(filename, directory), "utf8"));
  fixtures[name] = fixture;
  const [route, status, state] = scenarios[name];
  check(object(fixture), `${name}: envelope object`);
  equal(Object.keys(fixture).sort(), envelopeKeys, `${name}: envelope fields`);
  equal(fixture.schema_version, 1, `${name}: version`);
  equal(fixture.fixture_id, name, `${name}: identity`);
  equal(fixture.captured_at, stamp, `${name}: deterministic timestamp`);
  equal(fixture.backend_commit, commit, `${name}: full pinned commit`);
  equal(fixture.route, route, `${name}: known route`);
  equal(fixture.response_status, status, `${name}: HTTP status`);
  equal(fixture.contains_personal_data, false, `${name}: synthetic declaration`);
  equal(fixture.sanitisation, [], `${name}: no altered fields`);
  check(nonempty(fixture.capture_command) && fixture.capture_command.includes("scripts/capture-engine-fixtures.py --backend "), `${name}: capture command`);
  check(nonempty(fixture.verified_by), `${name}: verification record`);
  check(object(fixture.request), `${name}: request object`);
  equal(Object.keys(fixture.request).sort(), ["body", "method", "path"], `${name}: request fields`);
  equal(`${fixture.request.method} ${fixture.request.path.split("?")[0]}`, route, `${name}: request matches route`);
  check(fixture.request.method === "GET" ? fixture.request.body === null : object(fixture.request.body), `${name}: request body`);
  check(object(fixture.response), `${name}: response object`);
  check(sha(fixture.request_sha256) && sha(fixture.response_sha256), `${name}: hash syntax`);
  equal(hash(fixture.request), fixture.request_sha256, `${name}: request hash`);
  equal(hash(fixture.response), fixture.response_sha256, `${name}: response hash`);
  const response = fixture.response;
  if (status !== 200) {
    equal(response.error, "bad_request", `${name}: validation error`);
    check(nonempty(response.detail), `${name}: error detail`);
    check(!("state" in response), `${name}: error is not a legal state`);
    continue;
  }
  if (name !== "health" && name !== "instrument-impact") equal(response.as_of, day, `${name}: read date`);
  if (name !== "health") equal(response.generated_at, stamp, `${name}: generated date`);
  if (!state) continue;
  equal(response.schema, "placedon.ask/0", `${name}: Ask schema`);
  equal(response.state, state, `${name}: wire state`);
  equal(response.uses_model, false, `${name}: deterministic`);
  equal(response.question, fixture.request.body.question, `${name}: verbatim question`);
  check(/^t_[0-9a-f]{12}$/.test(response.turn_id), `${name}: turn ID`);
  check(["general", "document"].includes(response.context.kind), `${name}: context`);
  check(object(response.scope) && Array.isArray(response.scope.held) && nonempty(response.scope.sentence), `${name}: scope`);
  forbid(response);
  if (state === "answered") check((response.rows?.length || response.figures?.length) > 0, `${name}: deterministic result`);
  if (state === "partial") check(response.not_confirmed?.length > 0, `${name}: unresolved result`);
  if (state === "out_of_scope") {
    check(nonempty(response.reason) && response.body.scope_status !== "IN_CORPUS", `${name}: register refusal`);
    continue;
  }
  if (response.rows?.length || response.confirmed?.length || response.citations?.length || response.superseded?.length) {
    equal(response.law_version.point_in_time_verified, false, `${name}: no historical text claim`);
    check(nonempty(response.law_version.statement), `${name}: text basis statement`);
  }
  for (const citation of [...(response.citations ?? []), ...(response.confirmed ?? []).filter((item) => item.ref)]) {
    check(!("effective_from" in citation), `${name}: section text has no operative date`);
    check([...response.evidence_pack.usable_keys, ...response.evidence_pack.unusable_keys].includes(citation.ref), `${name}: citation belongs to pack`);
    check(Array.isArray(citation.retrieved_on) && Array.isArray(citation.defects), `${name}: source metadata`);
    if (state === "answered") equal(citation.usable_for_answering, true, `${name}: usable citation`);
  }
  for (const figure of response.figures ?? []) {
    check(nonempty(figure.amount) && nonempty(figure.instrument) && /^\d{4}-\d{2}-\d{2}$/.test(figure.effective_from), `${name}: figure basis`);
    check(Number.isSafeInteger(figure.rupees) && figure.rupees >= 0, `${name}: rupees`);
    check(figure.effective_from <= response.as_of && (figure.effective_to === null || response.as_of < figure.effective_to), `${name}: figure interval`);
  }
}
equal(fixtures["ask-abstained"].response.confirmed, [], "Abstained is empty-confirmed partial, not a fourth wire state");
check(fixtures["ask-partial"].response.confirmed.length > 0, "Abstained in part has confirmed evidence");
equal(fixtures["ask-document"].response.context.kind, "document", "document Ask path");
check(object(fixtures["ask-document"].response.scope_frame), "document Ask carries scope_frame");
const pack = fixtures["compliance-pack"].response;
const rowStates = ["APPLIES_SATISFIED", "APPLIES_NOT_SATISFIED", "APPLIES_UNDETERMINED", "DOES_NOT_APPLY", "CANNOT_DETERMINE"];
const summaryKeys = ["satisfied", "not_satisfied", "undetermined", "not_applicable", "cannot_determine"];
for (const row of pack.rows) {
  check(rowStates.includes(row.state), "known obligation state");
  check(nonempty(row.basis) && Array.isArray(row.missing_facts) && Array.isArray(row.cited_spans), "obligation basis and gaps");
}
rowStates.forEach((state, index) => equal(pack.summary[summaryKeys[index]], pack.rows.filter((row) => row.state === state).length, "summary matches actual rows"));
check(pack.rows.some((row) => row.state === "CANNOT_DETERMINE" && row.blocked_by), "pack has real unresolved dependency");
const document = fixtures["document-check"].response;
for (const key of ["superseded", "cannot_verify", "verified"]) equal(document.summary[key], document[key].length, `document ${key} count`);
check(object(document.coverage), "document scope is preserved");
check(document.superseded.length > 0 && document.cannot_verify.length > 0 && document.verified.length > 0, "document fixture covers moved, unknown and current buckets");
equal(fixtures.events.response.no_model, true, "law events deterministic");
check(nonempty(fixtures.events.response.scope), "law event scope boundary");
check(Array.isArray(fixtures["instrument-impact"].response.obligations), "instrument impact list");
equal(fixtures.health.response.status, "ok", "health status");
equal(fixtures.health.response.checker_commit, commit, "health actual provenance");
check(Array.isArray(fixtures["mca-strip"].response.does_not_establish), "MCA limitations preserved");
console.log(`PASS: ${assertions} assertions across ${files.length} offline engine fixtures (${fileURLToPath(directory)})`);
