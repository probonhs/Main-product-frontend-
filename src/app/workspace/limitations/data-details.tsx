export function WorkspaceDataDetails() {
  return <>
    <details className="ws-details" id="workspace-questions"><summary>Questions and conversations</summary>
      <p>Independent Ask checks send the question and any included facts for processing, without conversation memory. When connected, Conversations stores questions and replies on the server. Processing may involve a model; include relevant facts explicitly in each question.</p>
      <p>A failed response does not prove that your message was not stored or processed. Closing the page, starting a new question or stopping updates does not delete saved messages or cancel server work.</p>
      <a className="ws-link" href="/workspace/ask?details=1">Open a detailed fact check</a>
    </details>
    <details className="ws-details" id="workspace-data"><summary>Processing, retention and deletion</summary>
      <p>No product-wide retention, training-use or data-residency promise is made here. These arrangements and a deletion-request process still need approval.</p>
      <p>Do not submit confidential client material until your permitted processing and access arrangements are confirmed.</p>
      <p id="help-deletion-gate">Saved-data deletion is unavailable here. Clearing local text cannot confirm removal from a server, backups or a provider.</p>
      <button className="ws-secondary" type="button" disabled aria-describedby="help-deletion-gate">Delete saved data</button>
    </details>
    <details className="ws-details"><summary>Report an issue</summary>
      <p>Describe the screen, your action and what you expected. Leave out client names, company facts, document text, credentials and screenshots containing matter information.</p>
      <label className="ws-label" htmlFor="workspace-feedback-note">Your note — not sent</label>
      <textarea className="ws-textarea" id="workspace-feedback-note" rows={5} maxLength={2000} spellCheck={false} autoComplete="off" aria-describedby="help-feedback-gate help-feedback-storage" placeholder="Screen or feature:&#10;What I did:&#10;What happened:&#10;What I expected:" />
      <p id="help-feedback-storage" className="ws-muted">This screen has no feedback submission or storage service. You may select and copy the note yourself; your browser may retain or restore page content.</p>
      <p id="help-feedback-gate">Feedback has not been sent. A support destination, consent and retention process must be approved before sending is available.</p>
      <button className="ws-secondary" type="button" disabled aria-describedby="help-feedback-gate">Send feedback</button>
    </details>
  </>;
}
