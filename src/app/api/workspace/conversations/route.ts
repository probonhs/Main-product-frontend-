import { callConversation, conversationCommand, conversationConfiguration, ConversationServiceError } from "@/lib/engine/conversations";

export const runtime = "nodejs";
const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
export async function POST(request: Request) {
  const url = new URL(request.url);
  const fail = (message: string, status: number, code = "REQUEST_NOT_COMPLETED") => Response.json({ ok: false, error: { message, code } }, { status, headers });
  if (!conversationConfiguration() || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return fail("Saved conversations are unavailable in this deployment.", 403);
  if (request.headers.get("origin") !== url.origin || request.headers.get("sec-fetch-site") === "cross-site") return fail("Open this request from the local workspace.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return fail("Send a JSON request.", 415);
  const reader = request.body?.getReader();
  if (!reader) return fail("The request is empty.", 400);
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 24000) { await reader.cancel(); return fail("The request is too large.", 413); } chunks.push(part.value); }
    const parsed = conversationCommand.safeParse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
    if (!parsed.success) return fail("Check the question and conversation reference.", 400);
    const data = await callConversation(parsed.data, request.signal);
    return Response.json({ ok: true, data }, { headers });
  } catch (error) {
    if (error instanceof SyntaxError) return fail("The request could not be read.", 400);
    if (error instanceof ConversationServiceError) return fail(error.message, error.httpStatus, error.code);
    return fail("The conversation could not be loaded. Refresh saved work before sending again.", 502);
  }
}
