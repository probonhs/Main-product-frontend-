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
    const base = specifier.startsWith("@/")
      ? new URL(`src/${specifier.slice(2)}`, root)
      : specifier.startsWith(".") && /\.tsx?$/.test(context.parentURL ?? "")
        ? new URL(specifier, context.parentURL) : null;
    if (base) {
      for (const extension of [".ts", ".tsx"]) {
        const candidate = new URL(base.href + extension);
        if (existsSync(fileURLToPath(candidate))) return { url: candidate.href, shortCircuit: true };
      }
    }
    return next(specifier, context);
  },
  load(url, context, next) {
    if (url.startsWith(root.href) && /\.tsx?$/.test(url) && !url.includes("node_modules")) {
      return {
        format: "module", shortCircuit: true,
        source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
          compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
        }).outputText,
      };
    }
    return next(url, context);
  },
});

let assertions = 0;
function includes(html, value, label) {
  assert.ok(html.includes(value), label);
  assertions++;
}
function excludes(html, value, label) {
  assert.ok(!html.includes(value), label);
  assertions++;
}
const fixture = (id) => JSON.parse(readFileSync(new URL(`fixtures/engine/${id}.json`, root), "utf8"));
const { AskWorkspace, ResultRecord } = await import("../src/app/workspace/ask/ask-workspace.tsx");
const { askRecordReducer, initialAskRecordState, retainedAskNotice } = await import("../src/lib/engine/ask-record-state.ts");
const render = (source, liveEnabled = false) => renderToStaticMarkup(React.createElement(AskWorkspace, {
  liveEnabled,
  initialRecord: { data: source.response, mode: "sample", sample: { id: source.fixture_id, capturedAt: source.captured_at, backendCommit: source.backend_commit } },
}));
const blank = (liveEnabled) => renderToStaticMarkup(React.createElement(AskWorkspace, { liveEnabled }));
function closedDetails(html, classOrId, label) {
  const tag = html.match(new RegExp(`<details\\b[^>]*${classOrId}[^>]*>`));
  assert.ok(tag, `${label}: native details exists`);
  assert.ok(!/\sopen(?:\s|=|>)/.test(tag[0]), `${label}: closed by default`);
  assertions += 2;
}

try {
  const expectations = new Map([
    ["ask-answered", "Answered"],
    ["ask-partial", "Abstained in part"],
    ["ask-abstained", "Abstained"],
    ["ask-not-held", "Not held — law/source not held"],
    ["ask-resident-evidence", "Answered"],
  ]);
  const rendered = new Map();
  for (const [id, state] of expectations) {
    const source = fixture(id);
    const html = render(source);
    rendered.set(id, html);
    includes(html, "Captured example", `${id}: sample clearly labelled`);
    includes(html, `<h2 class="ws-result-heading" id="ws-result-heading" tabindex="-1">${state}</h2>`, `${id}: rendered state`);
    includes(html, source.response.as_of, `${id}: answer date`);
    includes(html, source.captured_at, `${id}: capture date`);
    includes(html, source.backend_commit, `${id}: backend provenance`);
    includes(html, 'id="ws-source-heading"', `${id}: Sources region`);
    closedDetails(html, 'class="ws-source-drawer"', `${id}: source drawer`);
    includes(html, "Inspect sources", `${id}: source access from answer`);
    includes(html, "Back to result", `${id}: return path from sources`);
    assert.ok(html.indexOf('class="ws-chat-answer"') < html.indexOf('class="ws-mode-note"'), `${id}: answer precedes composer area`);
    assertions++;
    excludes(html, "confidence", `${id}: no confidence claim`);
    excludes(html.toLowerCase(), "conversation history", `${id}: no conversation-history claim`);
    excludes(html.toLowerCase(), "remember your", `${id}: no memory claim`);
  }

  const answered = fixture("ask-answered");
  const answeredHtml = rendered.get("ask-answered");
  for (const figure of answered.response.figures) {
    includes(answeredHtml, figure.amount, "Answered: exact captured amount");
    includes(answeredHtml, figure.instrument, "Answered: exact governing instrument");
    includes(answeredHtml, `<time class="ws-mono">${figure.effective_from}</time>`, "Answered: in-force date");
  }
  includes(answeredHtml, 'class="section-reference"', "Answered: statutory reference gets legal markup");
  includes(answeredHtml, "Section 2", "Answered: reader-facing section notation");

  const partial = fixture("ask-partial");
  const partialHtml = rendered.get("ask-partial");
  includes(partialHtml, "Source text held", "Partial: held source text identified without operative-law claim");
  excludes(partialHtml, "Source text established", "Partial: no overstated source heading");
  includes(partialHtml, "not a statement that the provision is suspended in law", "Partial: suspended source distinguished from statutory suspension");
  closedDetails(partialHtml, 'class="ws-details"(?=><summary>Source-record detail)', "Partial: exact internal source state progressively disclosed");
  const sourceRegion = partialHtml.slice(partialHtml.indexOf('class="ws-source-drawer"'));
  includes(sourceRegion, "does not verify commencement or amendment dates", "Partial: operative-law qualification is next to source evidence");
  includes(sourceRegion, 'Evidence: corroborated</p><p class="ws-muted">Held text only.', "Partial: qualification immediately follows source evidence status");
  const verifiedPointInTime = structuredClone(partial);
  verifiedPointInTime.response.law_version.point_in_time_verified = true;
  excludes(render(verifiedPointInTime), "Held text only.", "Source qualification depends on backend law-version flag");
  includes(partialHtml, "Read verbatim text", "Partial: held source disclosure");
  includes(partialHtml, partial.response.not_confirmed[0].detail, "Partial: exact missing-source detail");
  includes(partialHtml, 'class="section-reference"', "Partial: section legal markup");

  const abstained = fixture("ask-abstained");
  const abstainedHtml = rendered.get("ask-abstained");
  for (const item of abstained.response.not_confirmed) includes(abstainedHtml, item.detail, "Abstained: exact unresolved detail");
  includes(abstainedHtml, "No usable source was returned", "Abstained: source gap stated");

  const notHeld = fixture("ask-not-held");
  const notHeldHtml = rendered.get("ask-not-held");
  includes(notHeldHtml, notHeld.response.reason, "Not held: scope-register reason");
  includes(notHeldHtml, "Review held scope", "Not held: limitations route");

  const residentHtml = rendered.get("ask-resident-evidence");
  includes(residentHtml, "Facts used for this result", "Resident: facts disclosure");
  includes(residentHtml, "Resident director days: 182", "Resident: nested day count");
  includes(residentHtml, "board meetings: 2025-01-10, 2025-04-10", "Resident: nested board-meeting dates");
  includes(residentHtml, "agm dates: 2025-09-15", "Resident: nested AGM date");
  includes(residentHtml, 'class="section-reference"', "Resident: section legal markup");

  excludes(answeredHtml, "<form", "Sample-only mode excludes live form");
  excludes(answeredHtml, 'name="resident_director_days"', "Sample-only mode excludes live evidence controls");
  includes(answeredHtml, "Sample mode.", "Sample-only mode explains limitation");
  const liveHtml = render(answered, true);
  includes(liveHtml, "<form", "Live mode includes form");
  includes(liveHtml, 'name="resident_director_days"', "Live mode includes resident-days control");
  includes(liveHtml, 'name="agm_dates"', "Live mode includes AGM date control");
  includes(liveHtml, 'name="board_meetings"', "Live mode includes board-meeting control");
  includes(liveHtml, 'name="calendar_year"', "Live mode includes calendar-year control");
  excludes(liveHtml, 'name="useFacts"', "Live form has no useFacts checkbox");
  includes(liveHtml, "Local checks configured", "Live mode labels configuration, not established availability");
  includes(liveHtml, "Sending a new question", "Live submission distinguished from shown result");
  includes(liveHtml, "captured example, not a new local check", "Sample answer remains labelled with live composer");
  includes(liveHtml, "not a saved chat", "Live mode disclaims persistence");
  closedDetails(liveHtml, 'id="ws-company-facts"', "Live context disclosure");
  includes(liveHtml, "Add provisions &amp; company facts", "Live context groups provisions and facts");
  includes(liveHtml, 'name="provisions"', "Live context includes provision control");
  includes(liveHtml, '<label for="ws-question">Your question</label>', "Live composer keeps a familiar stable label after result");
  includes(liveHtml, 'id="ws-question" name="question"', "Live composer textarea linked to label");
  const blankLive = blank(true);
  const blankSample = blank(false);
  for (const [mode, html] of [["live", blankLive], ["sample", blankSample]]) {
    excludes(html, "A result with its basis", `${mode}: no empty result placeholder`);
    excludes(html, 'id="ws-source-heading"', `${mode}: no empty Sources region`);
    excludes(html, 'class="ws-chat-answer"', `${mode}: no empty answer bubble`);
    excludes(html.toLowerCase(), "conversation history", `${mode}: no history claim`);
    excludes(html.toLowerCase(), "remember your", `${mode}: no memory claim`);
  }
  includes(blankLive, '<label for="ws-question">Your question</label>', "Blank composer question labelled");
  includes(blankLive, 'id="ws-question" name="question"', "Blank composer textarea linked to label");
  closedDetails(blankLive, 'id="ws-company-facts"', "Blank context disclosure");
  excludes(blankSample, "<form", "Blank sample mode has no live composer");

  function same(actual, expected, label) { assert.equal(actual, expected, label); assertions++; }
  for (const id of expectations.keys()) {
    const source = fixture(id);
    const original = JSON.stringify(source.response);
    const record = { data: source.response, mode: "sample" };
    let state = initialAskRecordState(record);
    same(retainedAskNotice(state), null, `${id}: initial record is not mislabelled as edited`);
    state = askRecordReducer(state, { type: "edit" });
    same(state.record, record, `${id}: draft edit retains complete evidence bundle`);
    same(state.pendingId, null, `${id}: edit never starts a request`);
    same(retainedAskNotice(state).title, "Draft changes not checked", `${id}: edit notice`);
    includes(retainedAskNotice(state).detail, "captured example, not your draft", `${id}: sample boundary`);
    const oldHtml = renderToStaticMarkup(React.createElement(ResultRecord, { record, previous: true, revise() {} }));
    includes(oldHtml, "Sources for the retained record only", `${id}: drawer independently disclaims draft coverage`);
    includes(oldHtml, source.response.as_of, `${id}: retained record keeps original legal date`);
    state = askRecordReducer(state, { type: "start", id: 1 });
    same(state.record, record, `${id}: pending request retains evidence`);
    same(retainedAskNotice(state).title, "New check pending", `${id}: pending is not a new answer`);
    state = askRecordReducer(state, { type: "failed", id: 1, message: "Synthetic technical failure" });
    same(state.record, record, `${id}: failure retains prior record, not fabricated abstention`);
    same(retainedAskNotice(state).title, "No new result", `${id}: failure does not announce record ready`);
    state = askRecordReducer(state, { type: "invalid", message: "Synthetic validation rejection" });
    same(state.pendingId, null, `${id}: validation starts no request`);
    same(state.record, record, `${id}: validation retains evidence`);
    state = askRecordReducer(state, { type: "start", id: 2 });
    state = askRecordReducer(state, { type: "edit" });
    same(askRecordReducer(state, { type: "received", id: 2, record: { data: answered.response, mode: "local" } }), state, `${id}: canceled completion ignored`);
    same(askRecordReducer(state, { type: "failed", id: 2, message: "Late error" }), state, `${id}: canceled rejection ignored`);
    state = askRecordReducer(state, { type: "start", id: 3 });
    same(askRecordReducer(state, { type: "received", id: 2, record }), state, `${id}: older response cannot win new request`);
    const replacement = { data: answered.response, mode: "local" };
    state = askRecordReducer(state, { type: "received", id: 3, record: replacement });
    same(state.record, replacement, `${id}: accepted completion swaps whole bundle`);
    same(state.draftChanged, false, `${id}: accepted local result matches submitted draft`);
    same(retainedAskNotice(state), null, `${id}: successful local completion clears warning`);
    state = askRecordReducer(state, { type: "edit" });
    includes(retainedAskNotice(state).detail, "previous check and its original facts", `${id}: local evidence bound to original inputs`);
    state = askRecordReducer(state, { type: "start", id: 4 });
    state = askRecordReducer(state, { type: "received", id: 4, record });
    same(state.draftChanged, true, `${id}: opening example never marks existing draft checked`);
    same(JSON.stringify(source.response), original, `${id}: legal response was not mutated`);
  }
  const emptyEdited = askRecordReducer(initialAskRecordState(null), { type: "edit" });
  same(emptyEdited.record, null, "Blank draft has no fabricated previous result");
  same(retainedAskNotice(emptyEdited), null, "Blank draft has no fabricated evidence notice");
  const askSource = readFileSync(new URL("src/app/workspace/ask/ask-workspace.tsx", root), "utf8");
  excludes(askSource, "setRecord(null)", "Draft/request path never discards returned record");
  includes(askSource, "if (!request.signal.aborted) dispatch", "Canceled transport completion is guarded before reducer");
  excludes(askSource.slice(askSource.indexOf("function editDraft()"), askSource.indexOf("function clearContext()")), "submit(", "Editing does not automatically resend");

  // Structural regressions only: these checks do not replace browser focus/reflow acceptance.
  const layout = readFileSync(new URL("src/app/workspace/layout.tsx", root), "utf8");
  includes(layout, 'href="#workspace-content"', "Shell: local skip link bypasses workspace navigation");
  includes(layout, 'id="workspace-content" tabIndex={-1}', "Shell: skip target accepts focus");
  assert.ok(layout.indexOf('href="#workspace-content"') < layout.indexOf("<aside"));
  assert.ok(layout.indexOf('id="workspace-content"') > layout.indexOf("</aside>"));
  assertions += 2;
  const css = readFileSync(new URL("src/app/workspace/workspace.css", root), "utf8");
  includes(css, ".workspace .ws-skip-link:focus", "Shell: local skip control becomes visible on focus");
  includes(css, "@media (min-width: 1800px)", "Sources: side panel requires space beyond reading column");
  includes(css, "grid-template-columns: var(--ws-reading-width) var(--ws-source-width)", "Sources: preserves fixed reading width");
  excludes(css, ".ws-primary.ws-chat:has(.ws-source-drawer[open])", "Sources: opening no longer expands or recenters composer");

  console.log(`PASS: ${assertions} offline static-render assertions across five captured Ask records`);
} finally {
  hooks.deregister();
}
