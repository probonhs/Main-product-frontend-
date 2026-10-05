import pending from "../../../../../fixtures/review-table/pending-status.json";
import mixed from "../../../../../fixtures/review-table/mixed-status.json";
import finished from "../../../../../fixtures/review-table/finished-status.json";
import cancelled from "../../../../../fixtures/review-table/cancelled-status.json";
import pendingExport from "../../../../../fixtures/review-table/pending-export.json";
import mixedExport from "../../../../../fixtures/review-table/mixed-export.json";
import finishedExport from "../../../../../fixtures/review-table/finished-export.json";
import cancelledExport from "../../../../../fixtures/review-table/cancelled-export.json";
import { reviewTableRecordSchema } from "@/lib/engine/review-table";
import { ReviewTableResult } from "./table-result";

const samples = { pending: [pending, pendingExport], mixed: [mixed, mixedExport], finished: [finished, finishedExport], cancelled: [cancelled, cancelledExport] } as const;
export default async function TableExamplePage({ searchParams }: { searchParams: Promise<{ sample?: string | string[] }> }) {
  const { sample = "mixed" } = await searchParams;
  if (typeof sample !== "string" || !Object.hasOwn(samples, sample)) return <section className="ws-primary ws-empty"><h1>Sample not available</h1><a href="/workspace/documents">Return to Documents</a></section>;
  const [captured, exported] = samples[sample as keyof typeof samples];
  const parsed = reviewTableRecordSchema.safeParse({ status: captured.response, context: { documents: captured.setup.documents, columns: captured.setup.create_request.columns }, exported: exported.response });
  if (!parsed.success) return <section className="ws-primary ws-error" role="alert"><h1>Table record unavailable</h1><p>The record could not be validated. No findings or spending total are displayed.</p><a href="/workspace/documents">Return to Documents</a></section>;
  return <ReviewTableResult record={parsed.data} capturedAt={captured.captured_at} backendCommit={captured.backend_commit} syntheticDebit={captured.setup.synthetic_debit_only} />;
}
