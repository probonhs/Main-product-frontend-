import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
let assertions = 0;
const ok = value => { assert.ok(value); assertions++; };
const eq = (left, right) => { assert.deepEqual(left, right); assertions++; };
const canonical = value => JSON.stringify(Array.isArray(value) ? value.map(normalize) : normalize(value));
function normalize(value) { return value !== null && typeof value === "object" ? Array.isArray(value) ? value.map(normalize) : Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])])) : value; }
const hash = value => createHash("sha256").update(canonical(value)).digest("hex");
const oldFetch = globalThis.fetch;
globalThis.fetch = () => { throw new Error("No network allowed in captured review tests"); };
try {
  const { documentReviewSchema, REVIEW_FINDING_LABELS } = await import("../src/lib/engine/document-review.ts");
  const { DocumentReviewResult } = await import("../src/app/workspace/documents/review-example/review-result.tsx");
  const fixtures = ["minutes-book-needed", "notice", "unclassified", "negative-quorum"].map(id => JSON.parse(readFileSync(new URL(`fixtures/document-review/${id}.json`, root), "utf8")));
  for (const fixture of fixtures) {
    eq(fixture.schema_version, 1); eq(fixture.contains_personal_data, false); eq(fixture.sanitisation, []);
    eq(fixture.backend_commit, "889ba548083ea67c8bd72b552a2bcf6d68cdf70b"); eq(fixture.route, "POST /v2/review-document");
    eq(fixture.response_status, 200); ok(Number.isFinite(Date.parse(fixture.captured_at)));
    ok(fixture.capture_command.includes("scripts/capture-document-review.py")); eq(fixture.verified_by, "tests/document-review.mjs");
    eq(hash(fixture.request), fixture.request_sha256); eq(hash(fixture.response), fixture.response_sha256);
    const review = documentReviewSchema.parse(fixture.response);
    eq(review.run_id, null); eq(review.requires_review, true);
    const html = renderToStaticMarkup(React.createElement(DocumentReviewResult, { review, documentText: fixture.request.text, capturedAt: fixture.captured_at, backendCommit: fixture.backend_commit }));
    for (const phrase of ["Captured sample", "not a review of your working copy", "does not certify compliance", "Not returned by this handler", "No stored run or authenticated reviewer", "written reason", "Approval also requires viewing the evidence"]) ok(html.includes(phrase));
    eq((html.match(/disabled="" aria-describedby="review-decision-gate"/g) || []).length, 2);
    eq(html.includes("<form"), false); eq(html.includes("<script"), false);
    eq(html.includes("<blockquote"), false); ok(html.includes("limited pattern checks")); ok(html.includes("Backend note — not independently verified"));
    ok(html.includes("claim about real adjudication orders is not established"));
    if (!review.findings.length) { ok(html.includes("Document type not established")); ok(html.includes("No findings were returned")); eq(html.includes("No issue found"), false); }
    else { ok(html.includes("may describe wording not found")); ok(html.includes("have not been independently retrieved here")); }
    for (const finding of review.findings) { ok(html.includes(REVIEW_FINDING_LABELS[finding.status])); ok(html.includes(finding.rule_id)); }
    for (const patch of [{ status: "PASSED" }, { doc_type: "contract" }, { checks_run: 500 }, { defect_count: 99 }, { needs_human_count: 99 }, { requires_review: false }, { run_id: "invented" }, { unexpected: true }]) eq(documentReviewSchema.safeParse({ ...review, ...patch }).success, false);
    if (review.findings.length) for (const patch of [{ status: "NEW_STATE" }, { needs_human: !review.findings[0].needs_human }, { applies: !review.findings[0].applies }, { quoted_span: "" }, { source: "" }]) eq(documentReviewSchema.safeParse({ ...review, findings: [{ ...review.findings[0], ...patch }, ...review.findings.slice(1)] }).success, false);
    if (review.findings.length) {
      eq(documentReviewSchema.safeParse({ ...review, findings: [], checks_run: 0, defect_count: 0, needs_human_count: 0, requires_review: false }).success, false);
      eq(documentReviewSchema.safeParse({ ...review, findings: review.findings.map((item, index) => index === 1 ? { ...item, rule_id: review.findings[0].rule_id } : item) }).success, false);
      ok(html.includes("Defect criterion — not a finding by itself"));
    }
    if (fixture.fixture_id === "negative-quorum") { ok(fixture.request.text.includes("quorum being absent")); eq(review.findings.find(item => item.rule_id === "C.quorum").status, "PASS"); ok(html.includes("does not establish that a quorum was present")); }
  }
  const captured = fixtures[0];
  const html = renderToStaticMarkup(React.createElement(DocumentReviewResult, { review: documentReviewSchema.parse(captured.response), documentText: "<script>synthetic attack</script>", capturedAt: captured.captured_at, backendCommit: captured.backend_commit }));
  ok(html.includes("&lt;script&gt;")); eq(html.includes("<script>"), false);
  const page = readFileSync(new URL("src/app/workspace/documents/page.tsx", root), "utf8");
  ok(page.includes('target="_blank" rel="noopener noreferrer"')); ok(page.includes("keep your draft on this page"));
  for (const name of ["page", "review-result"]) { const source = readFileSync(new URL(`src/app/workspace/documents/review-example/${name}.tsx`, root), "utf8"); for (const forbidden of ['"use client"', "dangerouslySetInnerHTML", "fetch(", "localStorage", "sessionStorage"]) eq(source.includes(forbidden), false); }
  const corporateAssertions = assertions;
  const { contractReviewSchema } = await import("../src/lib/engine/contract-review.ts");
  const { ContractReviewResult } = await import("../src/app/workspace/documents/review-example/contract-result.tsx");
  for (const id of ["N02", "N06", "N09"]) {
    const fixture = JSON.parse(readFileSync(new URL(`fixtures/contract-review/${id}.json`, root), "utf8"));
    eq(fixture.fixture_id, id); eq(fixture.schema_version, 1); eq(fixture.contains_personal_data, false); eq(fixture.sanitisation, []);
    eq(fixture.backend_commit, "889ba548083ea67c8bd72b552a2bcf6d68cdf70b"); eq(fixture.route, "POST /v2/review-contract");
    eq(fixture.response_status, 200); eq(fixture.request.test_data, true); eq(fixture.request.playbook, "playbooks/nda_v1.json");
    ok(Number.isFinite(Date.parse(fixture.captured_at))); ok(/^[a-f0-9]{64}$/.test(fixture.playbook_sha256));
    eq(fixture.execution, "Injected deterministic fixture extraction; no provider model called");
    eq(fixture.verified_by, "tests/document-review.mjs"); ok(fixture.capture_command.endsWith("contracts"));
    eq(hash(fixture.request), fixture.request_sha256); eq(hash(fixture.response), fixture.response_sha256);
    const review = contractReviewSchema.parse(fixture.response);
    eq(review.playbook_status, "DRAFT"); eq(review.requires_review, true); eq(review.run_id, null);
    const html = renderToStaticMarkup(React.createElement(ContractReviewResult, { review, documentText: fixture.request.text, capturedAt: fixture.captured_at, backendCommit: fixture.backend_commit }));
    for (const text of ["Captured sample", "fixed fixture extraction", "Draft playbook — not approved", "not been adopted by your company", "not a legal defect", "Exact clause quotation not returned", "not prove that the clause is absent", "Decisions are unavailable", "no provider model called", "not the model used for this capture", "not a real model’s ability"]) ok(html.includes(text));
    eq((html.match(/disabled="" aria-describedby="contract-decision-gate"/g) || []).length, 2);
    eq(html.includes("<form"), false); eq(html.includes("<blockquote"), false);
    for (const finding of review.findings) { ok(html.includes(finding.rule_id)); ok(html.includes(renderToStaticMarkup(React.createElement(React.Fragment, null, finding.standard_text)))); ok(html.includes(renderToStaticMarkup(React.createElement(React.Fragment, null, finding.rationale)))); }
    for (const item of review.law_not_held) ok(html.includes(item.body));
    ok(html.includes("absence not confirmed")); ok(html.includes("Company operations in that city were not checked"));
    if (review.findings.some(item => item.detail.includes("approved"))) ok(html.includes("draft configured values"));
    for (const patch of [{ playbook_status: "UNKNOWN" }, { requires_review: false }, { run_id: "fake" }, { law_not_held: [] }, { findings: [] }, { added: true }]) eq(contractReviewSchema.safeParse({ ...review, ...patch }).success, false);
    for (const patch of [{ status: "VERIFIED" }, { kind: "LEGAL_DEFECT" }, { standard_text: "" }, { rationale: "" }]) eq(contractReviewSchema.safeParse({ ...review, findings: [{ ...review.findings[0], ...patch }, ...review.findings.slice(1)] }).success, false);
    eq(contractReviewSchema.safeParse({ ...review, findings: review.findings.map((item, index) => index === 1 ? { ...item, rule_id: review.findings[0].rule_id } : item) }).success, false);
    const attack = renderToStaticMarkup(React.createElement(ContractReviewResult, { review: { ...review, findings: review.findings.map(item => ({ ...item, detail: "<script>synthetic attack</script>" })) }, documentText: "<img onerror=alert(1)>", capturedAt: fixture.captured_at, backendCommit: fixture.backend_commit }));
    ok(attack.includes("&lt;script&gt;")); eq(attack.includes("<script>"), false); eq(attack.includes("<img"), false);
  }
  const component = readFileSync(new URL("src/app/workspace/documents/review-example/contract-result.tsx", root), "utf8");
  for (const forbidden of ['"use client"', "dangerouslySetInnerHTML", "fetch(", "localStorage", "sessionStorage"]) eq(component.includes(forbidden), false);
  const contractAssertions = assertions - corporateAssertions;
  const { reviewTableRecordSchema, reviewTableStatusSchema, csvRows, csvHasUnsafeCell } = await import("../src/lib/engine/review-table.ts");
  const { ReviewTableResult } = await import("../src/app/workspace/documents/table-example/table-result.tsx");
  const tableFixtures = {};
  for (const sample of ["pending", "mixed", "finished", "cancelled", "csv-adversary"]) {
    for (const action of ["status", "export"]) {
      const fixture = JSON.parse(readFileSync(new URL(`fixtures/review-table/${sample}-${action}.json`, root), "utf8"));
      tableFixtures[`${sample}-${action}`] = fixture;
      eq(fixture.schema_version, 1); eq(fixture.contains_personal_data, false); eq(fixture.sanitisation, []);
      eq(fixture.backend_commit, "889ba548083ea67c8bd72b552a2bcf6d68cdf70b"); eq(fixture.route, `POST /v2/review-table/${action}`);
      eq(fixture.response_status, 200); ok(Number.isFinite(Date.parse(fixture.captured_at))); ok(fixture.capture_command.endsWith("tables"));
      eq(fixture.verified_by, "tests/document-review.mjs"); eq(fixture.execution, "Isolated memory store; deterministic answerer; no provider model or billed call");
      eq(hash(fixture.request), fixture.request_sha256); eq(hash(fixture.response), fixture.response_sha256); eq(hash(fixture.setup), fixture.setup_sha256);
      eq(fixture.setup.synthetic_text_seeded, true); eq(fixture.setup.synthetic_debit_only, sample === "mixed");
    }
    const captured = tableFixtures[`${sample}-status`], exported = tableFixtures[`${sample}-export`];
    eq(captured.setup, exported.setup);
    const raw = { status: captured.response, exported: exported.response, context: { documents: captured.setup.documents, columns: captured.setup.create_request.columns } };
    if (sample === "csv-adversary") {
      eq(reviewTableStatusSchema.safeParse(raw.status).success, true);
      eq(reviewTableRecordSchema.safeParse(raw).success, false);
      ok(csvHasUnsafeCell(csvRows(raw.exported.csv))); eq(csvRows(raw.exported.csv).length, 2);
      continue;
    }
    const record = reviewTableRecordSchema.parse(raw);
    eq(csvRows(record.exported.csv).length, record.status.documents + 1); eq(csvHasUnsafeCell(csvRows(record.exported.csv)), false);
    const html = renderToStaticMarkup(React.createElement(ReviewTableResult, { record, capturedAt: captured.captured_at, backendCommit: captured.backend_commit, syntheticDebit: captured.setup.synthetic_debit_only }));
    for (const phrase of ["Captured sample", "One question per column", "not a review of your working copy", "No cell certifies legality", "not returned", "not an evidence-complete review report", "not upload, persistence, authentication or worker acceptance", "never starts paid work"]) ok(html.includes(phrase));
    eq((html.match(/disabled="" class="ws-secondary" aria-describedby="table-actions-gate"/g) || []).length, 3); eq(html.includes("<form"), false); eq(html.includes(" download="), false);
    ok(html.includes('role="region" aria-label="Document comparison table" tabindex="0"')); ok(html.includes('scope="row"')); ok(html.includes('scope="col"'));
    for (const item of record.status.cells_detail) {
      const escaped = value => renderToStaticMarkup(React.createElement(React.Fragment, null, value));
      ok(html.includes(escaped(item.state === "FOUND" ? item.value : item.reason)));
      if (item.state === "FOUND") ok(html.includes(escaped(item.quote)));
    }
    if (sample === "pending") { eq(record.status.findings, 0); eq(record.status.spend.total_inr, null); ok(html.includes("Unknown cost is not ₹0")); }
    else {
      ok(html.includes("Unreadable document — not checked")); ok(html.includes("Technical failure, not a finding")); ok(html.includes("No accepted quotation was returned"));
      if (sample === "mixed") { ok(html.includes("Synthetic test debit only")); ok(html.includes("Reported priced subtotal ₹0.0412")); ok(html.includes("not a guaranteed minimum")); eq(html.includes("At least ₹"), false); }
      if (sample === "finished") { eq(record.status.complete, true); eq(record.status.by_state.FAILED, 1); ok(html.includes("All cells attempted — not a clearance")); }
      if (sample === "cancelled") { eq(record.status.cancelled, true); eq(record.status.by_state.PENDING, 1); ok(html.includes("not establish a refund")); ok(html.includes("live worker cancellation is not verified")); }
    }
    for (const patch of [{ cells: 0 }, { findings: 99 }, { documents: 99 }, { columns: 0 }, { complete: !record.status.complete }, { new_field: true }, { by_state: { ...record.status.by_state, FOUND: 99 } }, { cells_detail: [] }, { spend: { ...record.status.spend, total_inr: -1 } }, { spend: { ...record.status.spend, is_lower_bound: !record.status.spend.is_lower_bound } }]) eq(reviewTableRecordSchema.safeParse({ ...record, status: { ...record.status, ...patch } }).success, false);
    for (const patch of [{ state: "PASSED" }, { document_id: "another document" }, { column: "another column" }, { quote: "invented quotation", state: "FOUND", value: "fabricated" }]) eq(reviewTableRecordSchema.safeParse({ ...record, status: { ...record.status, cells_detail: record.status.cells_detail.map((item, index) => index === 0 ? { ...item, ...patch } : item) } }).success, false);
    eq(reviewTableRecordSchema.safeParse({ ...record, exported: { ...record.exported, csv: "document,Wrong\nSynthetic,invented\n" } }).success, false);
    eq(reviewTableRecordSchema.safeParse({ ...record, exported: { ...record.exported, grid_id: "different grid" } }).success, false);
    eq(reviewTableRecordSchema.safeParse({ ...record, context: { ...record.context, documents: [] } }).success, false);
    eq(reviewTableRecordSchema.safeParse({ ...record, status: { ...record.status, cells_detail: record.status.cells_detail.map((item, index) => index === 1 ? record.status.cells_detail[0] : item) } }).success, false);
    if (sample !== "pending") {
      for (const kind of ["date", "amount", "yes_no"]) eq(reviewTableRecordSchema.safeParse({ ...record, context: { ...record.context, columns: record.context.columns.map((col, index) => index === 0 ? { ...col, kind } : col) } }).success, false);
      eq(reviewTableRecordSchema.safeParse({ ...record, context: { ...record.context, documents: record.context.documents.map((doc, index) => index === 0 ? { ...doc, cannot_read: "Synthetic unreadable specimen" } : doc) } }).success, false);
    }
    const attack = renderToStaticMarkup(React.createElement(ReviewTableResult, { record: { ...record, context: { ...record.context, documents: record.context.documents.map(doc => ({ ...doc, name: "<script>synthetic attack</script>" })) } }, capturedAt: captured.captured_at, backendCommit: captured.backend_commit, syntheticDebit: captured.setup.synthetic_debit_only }));
    ok(attack.includes("&lt;script&gt;")); eq(attack.includes("<script>"), false);
  }
  eq(csvRows('a,"b,c"\n"x\"\"y","line\nnext"\n'), [["a", "b,c"], ['x"y', "line\nnext"]]);
  for (const invalid of ['"unclosed', 'a"b,c', '"a"junk,b', "a".repeat(200_001)]) eq(csvRows(invalid), null);
  for (const danger of ["=1+1", "+1", "-1", "@SUM(A1)", " =1+1", "\n=1+1", "\r=1+1", "\t=1+1", "\uFEFF=1+1"]) eq(csvHasUnsafeCell([[danger]]), true);
  for (const safe of ["India", "2029-03-31", "'=1+1", "NOT FOUND", "PENDING", "NEEDS LAWYER", "COULD NOT RUN"]) eq(csvHasUnsafeCell([[safe]]), false);
  for (const name of ["page", "table-result"]) { const source = readFileSync(new URL(`src/app/workspace/documents/table-example/${name}.tsx`, root), "utf8"); for (const forbidden of ['"use client"', "dangerouslySetInnerHTML", "fetch(", "localStorage", "sessionStorage"]) eq(source.includes(forbidden), false); }
  console.log(`PASS: ${corporateAssertions} corporate + ${contractAssertions} contract + ${assertions - corporateAssertions - contractAssertions} table captured-review provenance/schema/render assertions; no network or approval`);
} finally { globalThis.fetch = oldFetch; hooks.deregister(); }
