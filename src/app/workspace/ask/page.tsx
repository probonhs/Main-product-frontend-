import { readAskSample, workspaceLiveEnabled } from "@/lib/engine/workspace";
import { WORKSPACE_SAMPLES } from "@/lib/workspace-samples";
import { AskWorkspace } from "./ask-workspace";
import { conversationConfiguration } from "@/lib/engine/conversations";
import { ConversationWorkspace } from "../conversations/conversation-workspace";

export const dynamic = "force-dynamic";
export default async function AskPage({ searchParams }: { searchParams: Promise<{ example?: string; details?: string }> }) {
  const { example, details } = await searchParams;
  const selected = WORKSPACE_SAMPLES.some((item) => item.id === example) ? example : undefined;
  const sample = selected ? await readAskSample(selected) : null;
  if (!selected && details !== "1" && conversationConfiguration()) return <ConversationWorkspace enabled />;
  return <AskWorkspace key={`${selected || "new"}-${details === "1"}`} includeFacts={details === "1"} liveEnabled={workspaceLiveEnabled()} initialRecord={sample ? { ...sample, mode: "sample" } : null} />;
}
