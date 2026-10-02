import { z } from "zod";
import { getEngine } from "@/lib/engine/provider";
import { askRequestSchema } from "@/lib/engine/ask";
import { readAskSample, workspaceLiveEnabled } from "@/lib/engine/workspace";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const sampleRequest = z.object({ sampleId: z.string().max(60) }).strict();
function failure(message: string, status: number) {
  return Response.json({ ok: false, error: { message } }, { status, headers });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) return failure("Send a JSON request.", 415);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return failure("Submit this request from the workspace.", 403);
  // Read a bounded stream; Content-Length may be absent or inaccurate.
  const reader = request.body?.getReader();
  if (!reader) return failure("The request is empty.", 400);
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      bytes += part.value.byteLength;
      if (bytes > 24000) { await reader.cancel(); return failure("The request is too large. Shorten the question and facts.", 413); }
      chunks.push(part.value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const sample = sampleRequest.safeParse(body);
    if (sample.success) {
      const record = await readAskSample(sample.data.sampleId);
      if (!record) return failure("That sample is not available. Select a listed example.", 404);
      return Response.json({ ok: true, ...record, mode: "sample" }, { headers });
    }
    if (!workspaceLiveEnabled()) return failure("Live checks are unavailable here. Open one of the captured examples.", 403);
    if (!["localhost", "127.0.0.1", "[::1]"].includes(new URL(request.url).hostname)) return failure("Live checks are available only on the local machine.", 403);
    const parsed = askRequestSchema.safeParse(body);
    if (!parsed.success) return failure(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "), 400);
    if (parsed.data.context?.kind === "document") return failure("This workspace currently supports general questions. Document checks are not available here yet.", 400);
    const today = new Date().toISOString().slice(0, 10);
    if (parsed.data.as_of && parsed.data.as_of !== today) return failure("Earlier-date checks are not available. Use today's legal position.", 400);
    const engine = await getEngine();
    const result = await engine.ask({ ...parsed.data, as_of: today });
    if (!result.ok) return failure(result.error.kind === "bad_request" ? result.error.detail || result.error.message : "The check could not be completed. Your inputs are preserved; try again when the local engine is available.", result.error.kind === "bad_request" ? 400 : 502);
    return Response.json({ ok: true, data: result.data, mode: "local" }, { headers });
  } catch (error) {
    if (error instanceof SyntaxError) return failure("The request could not be read. Check your input and try again.", 400);
    return failure("The record could not be loaded. No legal result was returned.", 502);
  }
}
