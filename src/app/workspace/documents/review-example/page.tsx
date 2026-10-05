import { documentReviewSchema } from "@/lib/engine/document-review";
import minutes from "../../../../../fixtures/document-review/minutes-book-needed.json";
import notice from "../../../../../fixtures/document-review/notice.json";
import unclassified from "../../../../../fixtures/document-review/unclassified.json";
import { DocumentReviewResult } from "./review-result";
import deviation from "../../../../../fixtures/contract-review/N02.json";
import judgment from "../../../../../fixtures/contract-review/N06.json";
import missing from "../../../../../fixtures/contract-review/N09.json";
import { contractReviewSchema } from "@/lib/engine/contract-review";
import { ContractReviewResult } from "./contract-result";

const samples = { minutes, notice, unclassified };
export default async function ReviewExamplePage({ searchParams }: { searchParams: Promise<{ sample?: string | string[] }> }) {
  const { sample } = await searchParams;
  if (sample === "contract-deviation" || sample === "contract-judgment" || sample === "contract-missing") {
    const captured = sample === "contract-deviation" ? deviation : sample === "contract-judgment" ? judgment : missing;
    const result = contractReviewSchema.safeParse(captured.response);
    if (!result.success) return <section className="ws-primary ws-error" role="alert"><h1>Contract record unavailable</h1><p>The record could not be validated. No finding is displayed.</p><a href="/workspace/documents">Return to Documents</a></section>;
    return <ContractReviewResult review={result.data} documentText={captured.request.text} capturedAt={captured.captured_at} backendCommit={captured.backend_commit} />;
  }
  if (sample !== undefined && sample !== "minutes" && sample !== "notice" && sample !== "unclassified") return <section className="ws-primary ws-empty"><h1>Sample not available</h1><a href="/workspace/documents">Return to Documents</a></section>;
  const captured = sample === "notice" ? samples.notice : sample === "unclassified" ? samples.unclassified : samples.minutes;
  const result = documentReviewSchema.safeParse(captured.response);
  if (!result.success) return <section className="ws-primary ws-error" role="alert"><h1>Review record unavailable</h1><p>The record could not be validated. No finding is displayed.</p><a href="/workspace/documents">Return to Documents</a></section>;
  return <DocumentReviewResult review={result.data} documentText={captured.request.text} capturedAt={captured.captured_at} backendCommit={captured.backend_commit} />;
}
