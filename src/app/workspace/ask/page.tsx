import { readAskSample, workspaceLiveEnabled } from "@/lib/engine/workspace";
import { WORKSPACE_SAMPLES } from "@/lib/workspace-samples";
import { AskWorkspace } from "./ask-workspace";
import { conversationConfiguration } from "@/lib/engine/conversations";
import { ConversationWorkspace } from "../conversations/conversation-workspace";

export const dynamic = "force-dynamic";
export default async function AskPage({ searchParams }: { searchParams: Promise<{ example?: string }> }) {
  const { example } = await searchParams;
  const selected = WORKSPACE_SAMPLES.some((item) => item.id === example) ? example : undefined;
  const sample = selected ? await readAskSample(selected) : null;
  if (!selected && conversationConfiguration()) return <ConversationWorkspace enabled />;
  return <AskWorkspace key={selected || "new"} liveEnabled={workspaceLiveEnabled()} initialRecord={sample ? { ...sample, mode: "sample" } : null} />;
}
