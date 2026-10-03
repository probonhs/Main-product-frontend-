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
const eq = (a, b) => { assert.deepEqual(a, b); assertions++; };
const ok = value => { assert.ok(value); assertions++; };
const previousFetch = globalThis.fetch;
globalThis.fetch = () => { throw new Error("No network is permitted in local preparation tests"); };
try {
  const { MAX_LOCAL_TEXT_BYTES, MAX_LOCAL_TEXT_CHARACTERS, initialPreparation, preparationReducer: reduce, preparationError, readLocalText, localTextLimitError } = await import("../src/lib/engine/document-preparation.ts");
  const { DocumentWorkspace, PreparedDocument } = await import("../src/app/workspace/documents/document-workspace.tsx");
  eq(MAX_LOCAL_TEXT_BYTES, 262144); eq(MAX_LOCAL_TEXT_CHARACTERS, 200000);
  eq(reduce(initialPreparation, { type: "prepare" }).prepared, null);
  ok(reduce(initialPreparation, { type: "prepare" }).error);
  const samples = ["Synthetic notice text\n\n1. Test paragraph.", "नमूना पाठ\nSynthetic text 😀", "<script>private synthetic marker</script>\n  spacing preserved  "];
  for (const text of samples) {
    let state = reduce(initialPreparation, { type: "edit", patch: { text, name: "Synthetic working copy" } });
    eq(preparationError(state.draft), "");
    state = reduce(state, { type: "prepare" });
    const original = state.prepared;
    eq(original.text, text); eq(state.changed, false);
    for (const patch of [{ text: "New synthetic draft" }, { name: "Different name" }, { review: "contract" }]) {
      const edited = reduce(state, { type: "edit", patch });
      eq(edited.prepared, original); eq(edited.changed, true); eq(edited.requestId, null);
      const html = renderToStaticMarkup(React.createElement(PreparedDocument, { state: edited }));
      ok(html.includes("Previous preparation")); ok(html.includes("Prepared text — not reviewed"));
      ok(html.includes("Not uploaded")); ok(html.includes("Review not connected"));
      eq(html.includes("<script>"), false); ok(html.includes('tabindex="0"'));
      const replaced = reduce(edited, { type: "prepare" }); eq(replaced.prepared, edited.draft); eq(replaced.changed, false);
    }
    let reading = reduce(state, { type: "read", requestId: 1 });
    eq(reduce(reading, { type: "prepare" }), reading);
    const stopped = reduce(reading, { type: "stop" });
    eq(reduce(stopped, { type: "read_done", requestId: 1, name: "late.txt", text: "Late response" }), stopped);
    eq(reduce(stopped, { type: "read_failed", requestId: 1, error: "late failure" }), stopped);
    const editedDuringRead = reduce(reading, { type: "edit", patch: { text: "Typed while waiting" } });
    eq(reduce(editedDuringRead, { type: "read_done", requestId: 1, name: "late.txt", text: "Late response" }), editedDuringRead);
    const second = reduce(reading, { type: "read", requestId: 2 });
    eq(reduce(second, { type: "read_done", requestId: 1, name: "old.txt", text: "Old read" }), second);
    const completed = reduce(second, { type: "read_done", requestId: 2, name: "new.txt", text: "Current read" });
    eq(completed.draft.text, "Current read"); eq(completed.prepared, original); eq(completed.changed, true); eq(completed.draft.source, "text_file");
    const failed = reduce(reading, { type: "read_failed", requestId: 1, error: "Cannot read selected file" });
    eq(failed.prepared, original); eq(failed.draft, state.draft); eq(failed.requestId, null);
    const cleared = reduce(reading, { type: "clear" }); eq(cleared, initialPreparation);
    eq(reduce(cleared, { type: "read_done", requestId: 1, name: "late.txt", text: "Late response" }), cleared);
    const blank = reduce(state, { type: "edit", patch: { text: " \n " } });
    eq(reduce(blank, { type: "prepare" }).prepared, original); ok(reduce(blank, { type: "prepare" }).error);
    const file = new File([text], "synthetic.TXT", { type: "text/plain" });
    eq(await readLocalText(file), { ok: true, text });
  }
  const draft = { ...initialPreparation.draft, text: "Synthetic text" };
  for (const text of ["", " \t\n", "\x00binary", "%PDF-1.4", "{\\rtf1 synthetic}", "A".repeat(200001), "😀".repeat(70000)]) ok(preparationError({ ...draft, text }));
  ok(preparationError({ ...draft, name: "A".repeat(161) }));
  eq(preparationError({ ...draft, text: "A".repeat(200000) }), "");
  const prior = reduce(reduce(initialPreparation, { type: "edit", patch: { text: "Existing full draft" } }), { type: "prepare" });
  for (const text of ["A".repeat(200001), "😀".repeat(70000)]) {
    const rejected = reduce(prior, { type: "edit", patch: { text } });
    eq(rejected.draft, prior.draft); eq(rejected.prepared, prior.prepared); eq(rejected.errorField, "text"); ok(rejected.error);
    const pasted = reduce(prior, { type: "reject_input", field: "text", error: localTextLimitError(text) });
    eq(pasted.draft, prior.draft); eq(pasted.prepared, prior.prepared); eq(pasted.errorField, "text"); ok(pasted.error);
  }
  const invalidName = reduce(prior, { type: "edit", patch: { name: "N".repeat(161) } });
  eq(invalidName.draft, prior.draft); eq(invalidName.errorField, "name");
  for (const name of ["document.pdf", "document.docx", "document.txt.exe", "document.md"]) {
    let read = false;
    const result = await readLocalText({ name, size: 10, arrayBuffer: async () => { read = true; return new ArrayBuffer(10); } });
    eq(result.ok, false); eq(read, false);
  }
  for (const size of [0, MAX_LOCAL_TEXT_BYTES + 1]) {
    let read = false;
    eq((await readLocalText({ name: "test.txt", size, arrayBuffer: async () => { read = true; return new ArrayBuffer(1); } })).ok, false); eq(read, false);
  }
  eq((await readLocalText(new File([new Uint8Array([0xff])], "invalid.txt"))).ok, false);
  eq((await readLocalText(new File(["\x00Binary"], "binary.txt"))).ok, false);
  eq((await readLocalText(new File(["   "], "blank.txt"))).ok, false);
  eq((await readLocalText(new File(["%PDF-1.4"], "renamed.txt"))).ok, false);
  eq((await readLocalText({ name: "truncated.txt", size: 5, arrayBuffer: async () => new ArrayBuffer(2) })).ok, false);
  const failure = await readLocalText({ name: "failure.txt", size: 10, arrayBuffer: async () => { throw new Error("private test error detail"); } });
  eq(failure.ok, false); eq(JSON.stringify(failure).includes("private test error detail"), false);
  const html = renderToStaticMarkup(React.createElement(DocumentWorkspace));
  for (const text of ["Local preparation only", "not connected yet", "Document text or excerpt", "Read a text file locally", "What do you want checked?", "Contract against a playbook", "Corporate document"]) ok(html.includes(text));
  eq(html.includes("Prepared text — not reviewed"), false); eq(html.includes("method="), false);
  eq(html.includes("maxLength="), false); eq(html.includes("maxlength="), false);
  const component = readFileSync(new URL("src/app/workspace/documents/document-workspace.tsx", root), "utf8");
  ok(component.includes("event.preventDefault(); dispatch({ type: \"reject_input\""));
  ok(component.includes('id="document-error"')); ok(component.includes('aria-invalid={state.errorField === "text"'));
  ok(component.includes('aria-invalid={state.errorField === "file"')); ok(component.includes('aria-invalid={state.errorField === "name"'));
  eq(renderToStaticMarkup(React.createElement(PreparedDocument, { state: initialPreparation })), "");
  for (const path of ["src/lib/engine/document-preparation.ts", "src/app/workspace/documents/document-workspace.tsx"]) {
    const source = readFileSync(new URL(path, root), "utf8");
    eq(/\b(fetch|localStorage|sessionStorage|indexedDB|sendBeacon|dangerouslySetInnerHTML|console\.(log|error))\s*(?:\(|\.)/.test(source), false);
  }
  const nav = readFileSync(new URL("src/app/workspace/workspace-nav.tsx", root), "utf8");
  ok(nav.includes('href="/workspace/documents"')); ok(nav.includes('pathname === "/workspace/documents"'));
  console.log(`PASS: ${assertions} local document validation/read/reducer/static-render assertions; no network or legal outcomes`);
} finally {
  globalThis.fetch = previousFetch;
  hooks.deregister();
}
