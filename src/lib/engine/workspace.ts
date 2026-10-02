import "./server-guard";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { askResponseSchema } from "./ask";
import { engineOrigin } from "./http";
import { WORKSPACE_SAMPLES, type WorkspaceSampleId } from "../workspace-samples";

/** Live requests stay local during development until production identity is implemented. */
export function workspaceLiveEnabled(): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  const origin = engineOrigin(process.env.PLACEDON_API_ORIGIN);
  return !!origin && ["127.0.0.1", "localhost", "[::1]"].includes(new URL(origin).hostname);
}

export async function readAskSample(id: string) {
  if (!WORKSPACE_SAMPLES.some((sample) => sample.id === id)) return null;
  const envelope = JSON.parse(await readFile(path.join(process.cwd(), "fixtures", "engine", `${id}.json`), "utf8"));
  if (envelope.response_status !== 200 || envelope.contains_personal_data !== false) throw new Error("Invalid sample envelope");
  return {
    data: askResponseSchema.parse(envelope.response),
    sample: { id: id as WorkspaceSampleId, capturedAt: String(envelope.captured_at), backendCommit: String(envelope.backend_commit) },
  };
}
