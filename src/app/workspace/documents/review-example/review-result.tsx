import { LegalText } from "@/components/brand";
import { REVIEW_FINDING_LABELS, type DocumentReview } from "@/lib/engine/document-review";

export function DocumentReviewResult({ review, documentText, capturedAt, backendCommit }: {
  review: DocumentReview; documentText: string; capturedAt: string; backendCommit: string;
}) {
  return <div className="ws-primary ws-document-review">
    <div className="ws-welcome"><p className="ws-kicker">Captured sample · Corporate document</p><h1 className="ws-heading">{review.status === "UNCLASSIFIED" ? "Document type not established" : "Review findings"}</h1><p className="ws-intro">This is a captured check of synthetic text, not a review of your working copy. A completed check does not certify compliance.</p></div>
    <dl className="ws-record"><div><dt>Document type</dt><dd>{review.doc_type === "unknown" ? "Not established" : review.doc_type}</dd></div><div><dt>Issues identified</dt><dd>{review.defect_count}</dd></div><div><dt>Book checks needed</dt><dd>{review.needs_human_count}</dd></div><div><dt>Legal as-of date</dt><dd>Not returned by this handler</dd></div></dl>
    <p className="ws-muted">These are limited pattern checks, not a complete legal review. {review.status === "UNCLASSIFIED" ? "No checks ran on this unidentified document." : "For example, finding the word “quorum” does not establish that a quorum was present. No issue found means only that the detector did not flag the criterion."}</p>
    <section className="ws-section" aria-labelledby="review-next-action"><h2 id="review-next-action">Next action</h2><p>{review.status === "UNCLASSIFIED" ? "Confirm that the document is meeting minutes, a notice or an outcome filing before seeking another check. No findings were returned." : review.needs_human_count > 0 ? "Inspect the physical minutes book for the unresolved checks. A book check is neither a defect nor a pass." : review.defect_count > 0 ? "Read each identified issue against the document and its stated basis before deciding what to amend." : "Inspect the checks and their limits before relying on the result. No issue found by a check is not an approval of the document."}</p></section>
    <details className="ws-details"><summary>Read the sample document</summary><pre className="ws-verbatim">{documentText}</pre></details>
    {review.checks_run > 0 && <section aria-labelledby="review-checks"><h2 id="review-checks">Checks returned ({review.checks_run})</h2><p className="ws-muted">Evidence below is the engine’s reported text. It may describe wording not found, rather than quote an actual passage. The stated basis and precedent have not been independently retrieved here.</p>
      {review.findings.map(item => <details className="ws-details" key={item.rule_id} open={item.status === "DEFECT" || item.needs_human}>
        <summary>Check <span className="ws-mono">{item.rule_id}</span> · {REVIEW_FINDING_LABELS[item.status]}</summary>
        {item.advisory_only && <p className="ws-status">Advisory only — not a legal finding</p>}
        <p>{item.status === "PASS" ? "The detector did not flag this criterion; this does not establish completeness or compliance." : item.status === "NEEDS_BOOK" ? "This criterion is not established from the supplied text. Inspect the physical book." : item.status === "N/A" ? "This criterion was not applied to this document type." : "The detector flagged this criterion. Confirm it against the document and the stated basis."}</p>
        <p className="ws-label">Defect criterion — not a finding by itself</p><p>{item.defect}</p>
        <h3>Reported document evidence</h3><div className="ws-reported-evidence"><p>{item.quoted_span}</p></div>
        <h3>Stated check basis</h3><p><LegalText>{item.source}</LegalText></p>
        {item.precedent && <><p className="ws-label">Precedent named by the engine</p><p>{item.precedent}</p></>}
      </details>)}
    </section>}
    <section className="ws-section" aria-labelledby="review-decision"><h2 id="review-decision">Professional decision</h2><p id="review-decision-gate">Decisions are unavailable for this captured sample. No stored run or authenticated reviewer is attached. A real decision must identify one finding, retain its evidence and written reason, and be recorded by the server. Approval also requires viewing the evidence.</p><div className="ws-actions"><button className="ws-secondary" disabled aria-describedby="review-decision-gate">Approve finding</button><button className="ws-secondary" disabled aria-describedby="review-decision-gate">Reject finding</button></div></section>
    <details className="ws-details"><summary>Record details &amp; limits</summary><dl className="ws-fact-list"><div><dt>Captured</dt><dd className="ws-mono">{capturedAt}</dd></div><div><dt>Backend revision</dt><dd className="ws-mono">{backendCommit}</dd></div><div><dt>Recorded run</dt><dd>{review.run_id || "None — captured without a store"}</dd></div><div><dt>Meeting kind supplied</dt><dd>{review.meeting_kind}</dd></div></dl><p>These checks do not currently branch on the meeting kind. A corporate-document check is not a contract review against a playbook. No model was called for this captured deterministic check.</p><h3>Backend note — not independently verified</h3><p>{review.note}</p><p>The backend’s claim about real adjudication orders is not established by this screen. Some returned precedent fields expressly say that no penalty order was found.</p></details>
    <a className="ws-secondary" href="/workspace/documents">Return to Documents</a>
  </div>;
}
