import { DocumentWorkspace } from "./document-workspace";

export default function DocumentsPage() {
  return <><DocumentWorkspace /><div className="ws-primary ws-review-examples"><details className="ws-details"><summary>See sample review findings</summary><p className="ws-muted">Captured checks of synthetic documents, not your working copy. Open separately to keep your draft on this page.</p><div className="ws-actions">{[["minutes", "Minutes: book inspection needed"], ["notice", "Notice: issues and non-applicable checks"], ["unclassified", "Unidentified document"]].map(([sample, label]) => <a className="ws-secondary" target="_blank" rel="noopener noreferrer" key={sample} href={`/workspace/documents/review-example?sample=${sample}`}>{label} (new tab)</a>)}</div></details></div></>;
}
