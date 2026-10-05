import { DocumentWorkspace } from "./document-workspace";

export default function DocumentsPage() {
  return <><DocumentWorkspace /><div className="ws-primary ws-review-examples"><details className="ws-details"><summary>See sample review findings</summary><p className="ws-muted">Captured checks of synthetic documents, not your working copy. Open separately to keep your draft on this page.</p><h2>Corporate documents</h2><SampleLinks links={[["minutes", "Minutes: book inspection needed"], ["notice", "Notice: issues and non-applicable checks"], ["unclassified", "Unidentified document"]]} /><h2>Contract against a draft playbook</h2><SampleLinks links={[["contract-deviation", "Term differs from the standard"], ["contract-judgment", "Professional judgment needed"], ["contract-missing", "Clauses not extracted"]]} /><h2>Compare multiple documents</h2><a className="ws-secondary" target="_blank" rel="noopener noreferrer" href="/workspace/documents/table-example">Review table: answers, evidence and spending (new tab)</a></details></div></>;
}

function SampleLinks({ links }: { links: string[][] }) {
  return <div className="ws-actions">{links.map(([sample, label]) => <a className="ws-secondary" target="_blank" rel="noopener noreferrer" key={sample} href={`/workspace/documents/review-example?sample=${sample}`}>{label} (new tab)</a>)}</div>;
}
