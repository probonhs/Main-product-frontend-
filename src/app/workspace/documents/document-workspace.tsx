"use client";

import { useEffect, useReducer, useRef, useState, type Dispatch } from "react";
import { FileText, X } from "lucide-react";
import { initialPreparation, preparationReducer, readLocalText, localTextLimitError, type PreparationEvent, type PreparationState, type ReviewKind } from "@/lib/engine/document-preparation";

const reviewLabels: Record<ReviewKind, string> = { corporate_document: "Corporate document", contract: "Contract against a playbook" };

export function DocumentWorkspace() {
  const [state, dispatch] = useReducer(preparationReducer, initialPreparation);
  const [pasting, setPasting] = useState(false);
  const sequence = useRef(0);
  const active = useRef(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const reading = state.requestId !== null;
  const hasText = !!state.draft.text.trim();
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => { if (state.prepared) document.getElementById("document-prepared-heading")?.focus(); }, [state.prepared]);
  useEffect(() => { if (pasting) document.getElementById("document-text")?.focus(); }, [pasting]);
  async function read(file: File) {
    const requestId = ++sequence.current;
    dispatch({ type: "read", requestId });
    const result = await readLocalText(file);
    if (!active.current) return;
    dispatch(result.ok ? { type: "read_done", requestId, name: file.name, text: result.text } : { type: "read_failed", requestId, error: result.error });
  }
  function clear() {
    if ((state.draft.text || state.prepared) && !window.confirm("Clear the local draft and prepared text? Nothing has been submitted or saved by Placedon.")) return;
    dispatch({ type: "clear" });
    setPasting(false);
    if (fileInput.current) fileInput.current.value = "";
    document.getElementById("document-add-file")?.focus();
  }
  return <div className="ws-primary ws-documents">
    <div className="ws-welcome"><p className="ws-kicker">Documents</p><h1 className="ws-heading">Add a document</h1><p className="ws-intro">Start with your document. Then choose how you’d like it reviewed.</p></div>
    <form className="ws-form" onSubmit={event => { event.preventDefault(); dispatch({ type: "prepare" }); }}>
      <div className="ws-document-intake">
        <FileText size={28} aria-hidden="true" />
        <strong>{hasText ? state.draft.name || "Untitled document" : "Choose your document"}</strong>
        <p className="ws-muted" id="document-file-note">Text files (.txt) · Up to 256 KiB</p>
        <button id="document-add-file" className={hasText ? "ws-secondary" : "ws-button"} type="button" aria-invalid={state.errorField === "file" || undefined} aria-describedby={`document-file-note document-intake-note${state.errorField === "file" ? " document-error" : ""}`} onClick={() => fileInput.current?.click()}>{hasText ? "Replace file" : "Choose file"}</button>
        <input hidden ref={fileInput} id="document-file" type="file" accept=".txt,text/plain" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; if (state.draft.text && !window.confirm("Replace the current draft with this file's text? The prepared copy remains until you prepare the new text.")) return; void read(file); }} />
        {!pasting && <button className="ws-link" type="button" onClick={() => setPasting(true)}>{hasText ? "Inspect or edit text" : "Or paste document text"}</button>}
        <p className="ws-muted" id="document-intake-note">{hasText ? "Text added to this page · Not uploaded" : "Nothing is uploaded. Review submission is currently unavailable."}</p>
      </div>
      {pasting && <div className="ws-field"><label htmlFor="document-text">Document text or excerpt</label><textarea className="ws-textarea ws-document-input" id="document-text" value={state.draft.text} rows={7} spellCheck={false} autoComplete="off" aria-invalid={state.errorField === "text" || undefined} aria-describedby={`document-text-note${state.errorField === "text" ? " document-error" : ""}`} onChange={event => dispatch({ type: "edit", patch: { text: event.target.value } })} onPaste={event => { const target = event.currentTarget; const paste = event.clipboardData.getData("text/plain"); const candidate = target.value.slice(0, target.selectionStart) + paste + target.value.slice(target.selectionEnd); const error = localTextLimitError(candidate); if (error) { event.preventDefault(); dispatch({ type: "reject_input", field: "text", error }); } }} placeholder="Paste your document text here…" /><p className="ws-muted" id="document-text-note">Keep the wording and numbering intact. An excerpt prepares only that excerpt. Limit: 256 KiB and 200,000 characters.</p></div>}
      {hasText && <DocumentReviewSetup state={state} dispatch={dispatch} />}
      {(hasText || pasting || state.prepared) && <div className="ws-actions"><button className="ws-link" type="button" onClick={clear}><X size={15} aria-hidden="true" />Clear working copy</button><button className="ws-button" disabled={reading || !hasText}>Prepare for review</button></div>}
      {reading && <><p role="status" className="ws-muted">Reading the selected text file on this page…</p><button className="ws-secondary" type="button" onClick={() => dispatch({ type: "stop" })}>Stop waiting for this file</button></>}
      {state.error && <p className="ws-field-error" id="document-error" role="alert">{state.error}</p>}
    </form>
    {state.prepared && <PreparedDocument state={state} />}
    <details className="ws-details"><summary>Supported files &amp; storage</summary><p>You can add a UTF-8 text file or paste document text. PDF, Word and scanned-document extraction are not available yet.</p><p>The working copy stays in this page’s memory; it is not saved to your account or sent to a server or model. Use Clear working copy when finished. Review submission is currently unavailable.</p><a className="ws-link" href="/workspace/limitations">Scope &amp; limitations</a></details>
  </div>;
}

export function DocumentReviewSetup({ state, dispatch }: { state: PreparationState; dispatch: Dispatch<PreparationEvent> }) {
  return <div className="ws-document-setup">
    <div className="ws-field"><label htmlFor="document-name">Document name <span className="ws-muted">(optional)</span></label><input id="document-name" className="ws-input" value={state.draft.name} autoComplete="off" aria-invalid={state.errorField === "name" || undefined} aria-describedby={state.errorField === "name" ? "document-error" : undefined} onChange={event => dispatch({ type: "edit", patch: { name: event.target.value } })} placeholder="e.g. Board meeting notice" /></div>
    <fieldset className="ws-document-choice"><legend>Choose a review</legend><p className="ws-muted">Choose an intended review. Review submission is currently unavailable.</p>
      <label><input type="radio" name="review-kind" checked={state.draft.review === "corporate_document"} onChange={() => dispatch({ type: "edit", patch: { review: "corporate_document" } })} /><span><strong>Corporate document</strong><small className="ws-muted">Check meeting notices or minutes against supported document requirements.</small></span></label>
      <label><input type="radio" name="review-kind" checked={state.draft.review === "contract"} onChange={() => dispatch({ type: "edit", patch: { review: "contract" } })} /><span><strong>Contract against a playbook</strong><small className="ws-muted">Compare clauses with an approved standard. A potential issue is not a statement of law.</small></span></label>
    </fieldset>
  </div>;
}

export function PreparedDocument({ state }: { state: PreparationState }) {
  const prepared = state.prepared;
  if (!prepared) return null;
  return <section className="ws-document-prepared" aria-labelledby="document-prepared-heading">
    {state.changed && <p className="ws-record-notice">Previous preparation. The draft or review choice has changed; prepare it again to replace the copy below.</p>}
    <div className="ws-example-heading"><h2 id="document-prepared-heading" tabIndex={-1}>Prepared text — not reviewed</h2><span className="ws-kicker">Not uploaded</span></div>
    <dl className="ws-record"><div><dt>Working copy</dt><dd>{prepared.name || "Untitled document"}</dd></div><div><dt>Review requested</dt><dd>{reviewLabels[prepared.review]}</dd></div><div><dt>Text supplied</dt><dd>{prepared.source === "text_file" ? "Read from a local text file" : "Entered on this page"}</dd></div></dl>
    <div className="ws-document-text" role="region" aria-label="Prepared document text" tabIndex={0}><pre>{prepared.text}</pre></div>
    <p className="ws-muted" id="document-review-gate">Review submission is currently unavailable. This text has not been uploaded or reviewed.</p>
    <button className="ws-secondary" disabled aria-describedby="document-review-gate">Start review</button>
  </section>;
}
