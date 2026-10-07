import { WORKSPACE_SAMPLES } from "@/lib/workspace-samples";
import { WorkspaceDataDetails } from "./data-details";

export default function Limitations() {
  return <article className="ws-primary ws-limitations">
    <h1 className="ws-heading">Known limitations</h1>
    <p className="ws-intro">What Placedon can check, how your work is handled, and what still needs professional review.</p>
    <details className="ws-details"><summary>What an answer can establish</summary>
      <p>Each answer is limited to the law, sources and facts checked. A retrieved provision alone does not establish compliance. Read the answer’s legal basis and unresolved items before acting.</p>
      <p>Missing facts can be supplied for another check. Missing legal sources require verification by Placedon. A service error does not establish whether server work completed; it is never a legal finding.</p>
      <p>For professional review, not legal advice. No result certifies compliance or replaces your professional judgment.</p>
    </details>
    <details className="ws-details"><summary>Dates and sources</summary>
      <p>New checks use today by default; captured samples retain their recorded dates. Read the date on each result. Held section text may be a current consolidation, not a reconstruction of historical law.</p>
      <p>Dated figures carry their governing instrument and effective date. Earlier-date checks are unavailable until the relevant coverage and point-in-time text are established.</p>
    </details>
    <details className="ws-details"><summary>Documents and working copies</summary>
      <p>Adding text prepares a working copy; it does not submit a document for review. Documents does not upload or review that copy. Captured checks do not review your own document.</p>
      <p>A reported match or completed check is not a legal clearance. Unreadable text and failed checks cannot establish that a clause is absent.</p>
      <p>Use <strong>Clear working copy</strong> to remove the draft from Documents. This is not deletion of a file on your computer or a server record. Your browser may retain or restore page content.</p>
    </details>
    <WorkspaceDataDetails />
    <details className="ws-details"><summary>Actions not available here</summary>
      <p>Live document review and uploads, drafting, case-law research, sanctions checks, filing, alerts, billing and company-register connections are not enabled. The workspace does not cover every Act or question.</p>
      <p>Changes in law are not company-specific monitoring. A completed process is not a finding about compliance.</p>
    </details>
    <details className="ws-details" id="workspace-examples"><summary>Captured example checks</summary>
      <p>These are recorded results with sample facts, not your saved conversations or a new check of your company.</p>
      <div className="ws-samples">{WORKSPACE_SAMPLES.map(sample => <a className="ws-secondary" key={sample.id} href={`/workspace/ask?example=${sample.id}`}>{sample.title}</a>)}</div>
    </details>
    <div className="ws-actions"><a className="ws-secondary" href="/workspace">Return to Ask</a></div>
  </article>;
}
