"use client";

import { useEffect, useReducer, useRef } from "react";
import { FileText, X } from "lucide-react";
import { initialPreparation, preparationReducer, readLocalText, localTextLimitError, type PreparationState, type ReviewKind } from "@/lib/engine/document-preparation";

const reviewLabels: Record<ReviewKind, string> = { corporate_document: "Corporate document", contract: "Contract against a playbook" };

export function DocumentWorkspace() {
  const [state, dispatch] = useReducer(preparationReducer, initialPreparation);
  const sequence = useRef(0);
  const active = useRef(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const reading = state.requestId !== null;
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => { if (state.prepared) document.getElementById("document-prepared-heading")?.focus(); }, [state.prepared]);
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
    if (fileInput.current) fileInput.current.value = "";
    document.getElementById("document-text")?.focus();
  }
  return <div className="ws-primary ws-documents">
    <div className="ws-welcome"><p className="ws-kicker">Documents</p><h1 className="ws-heading">Prepare a document for review</h1><p className="ws-intro">Add the text, choose the review you need, and inspect the prepared copy. Uploads and reviews are not connected yet.</p></div>
    <p className="ws-banner">Local preparation only. This screen does not send text to a server or model, or save it to your account. The working copy stays in this page’s memory. Use Clear local preparation when finished.</p>
    <form className="ws-form" onSubmit={event => { event.preventDefault(); dispatch({ type: "prepare" }); }}>
      <fieldset className="ws-document-choice"><legend>What do you want checked?</legend>
        <label><input type="radio" name="review-kind" checked={state.draft.review === "corporate_document"} onChange={() => dispatch({ type: "edit", patch: { review: "corporate_document" } })} /><span><strong>Corporate document</strong><small className="ws-muted">Meeting notices or minutes, against the supported corporate-document checks.</small></span></label>
        <label><input type="radio" name="review-kind" checked={state.draft.review === "contract"} onChange={() => dispatch({ type: "edit", patch: { review: "contract" } })} /><span><strong>Contract against a playbook</strong><small className="ws-muted">Compare clauses with an approved standard. A potential issue is not a statement of law.</small></span></label>
      </fieldset>
      <div className="ws-field"><label htmlFor="document-name">Document name <span className="ws-muted">(optional)</span></label><input id="document-name" className="ws-input" value={state.draft.name} autoComplete="off" aria-invalid={state.errorField === "name" || undefined} aria-describedby={state.errorField === "name" ? "document-error" : undefined} onChange={event => dispatch({ type: "edit", patch: { name: event.target.value } })} placeholder="Name this working copy" /></div>
      <div className="ws-field"><label htmlFor="document-file"><FileText size={16} aria-hidden="true" />Read a text file locally</label><input ref={fileInput} className="ws-input" id="document-file" type="file" accept=".txt,text/plain" aria-invalid={state.errorField === "file" || undefined} aria-describedby={`document-file-note${state.errorField === "file" ? " document-error" : ""}`} onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; if (state.draft.text && !window.confirm("Replace the current draft with this file's text? The prepared copy remains until you prepare the new text.")) return; void read(file); }} /><p className="ws-muted" id="document-file-note">UTF-8 .txt, up to 256 KiB. PDF, Word and scan extraction are not available here yet. You can paste text from a document below.</p></div>
      <div className="ws-field"><label htmlFor="document-text">Document text or excerpt</label><textarea className="ws-textarea ws-document-input" id="document-text" value={state.draft.text} rows={9} spellCheck={false} autoComplete="off" aria-invalid={state.errorField === "text" || undefined} aria-describedby={`document-text-note${state.errorField === "text" ? " document-error" : ""}`} onChange={event => dispatch({ type: "edit", patch: { text: event.target.value } })} onPaste={event => { const target = event.currentTarget; const paste = event.clipboardData.getData("text/plain"); const candidate = target.value.slice(0, target.selectionStart) + paste + target.value.slice(target.selectionEnd); const error = localTextLimitError(candidate); if (error) { event.preventDefault(); dispatch({ type: "reject_input", field: "text", error }); } }} placeholder="Paste the text you want reviewed…" /><p className="ws-muted" id="document-text-note">Keep the wording and numbering intact. Pasting an excerpt prepares only that excerpt, not the whole document. Local limit: 256 KiB and 200,000 characters.</p></div>
      <div className="ws-actions"><button className="ws-link" type="button" onClick={clear}><X size={15} aria-hidden="true" />Clear local preparation</button><button className="ws-button" disabled={reading || !state.draft.text.trim()}>Prepare text</button></div>
      {reading && <><p role="status" className="ws-muted">Reading the selected text file on this page…</p><button className="ws-secondary" type="button" onClick={() => dispatch({ type: "stop" })}>Stop waiting for this file</button></>}
      {state.error && <p className="ws-field-error" id="document-error" role="alert">{state.error}</p>}
    </form>
    {state.prepared && <PreparedDocument state={state} />}
    <details className="ws-details"><summary>What happens when reviews are connected?</summary><p>You will inspect the readable text before submission. A corporate-document review checks only the supported document requirements. A contract review compares clauses with the selected playbook; it does not establish legal compliance.</p><p>Upload, storage, processing permission and account access still need connected verification. This preparation is not a review, attachment, saved document or professional approval.</p><a className="ws-link" href="/workspace/limitations">Read the current limitations</a></details>
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
    <p className="ws-muted" id="document-review-gate">No findings have been produced. Review submission is unavailable until the approved backend and processing path are connected.</p>
    <button className="ws-secondary" disabled aria-describedby="document-review-gate">Review not connected</button>
  </section>;
}
