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
  console.log(`PASS: ${assertions} captured corporate-review provenance/schema/render assertions; no network or approval`);
} finally { globalThis.fetch = oldFetch; hooks.deregister(); }
