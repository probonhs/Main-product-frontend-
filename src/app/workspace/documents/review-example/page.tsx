import { documentReviewSchema } from "@/lib/engine/document-review";
import minutes from "../../../../../fixtures/document-review/minutes-book-needed.json";
import notice from "../../../../../fixtures/document-review/notice.json";
import unclassified from "../../../../../fixtures/document-review/unclassified.json";
import { DocumentReviewResult } from "./review-result";

const samples = { minutes, notice, unclassified };
export default async function ReviewExamplePage({ searchParams }: { searchParams: Promise<{ sample?: string | string[] }> }) {
  const { sample } = await searchParams;
  const captured = sample === "notice" ? samples.notice : sample === "unclassified" ? samples.unclassified : samples.minutes;
  const result = documentReviewSchema.safeParse(captured.response);
  if (!result.success) return <section className="ws-primary ws-error" role="alert"><h1>Review record unavailable</h1><p>The record could not be validated. No finding is displayed.</p><a href="/workspace/documents">Return to Documents</a></section>;
  return <DocumentReviewResult review={result.data} documentText={captured.request.text} capturedAt={captured.captured_at} backendCommit={captured.backend_commit} />;
}
