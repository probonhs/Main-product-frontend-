import { conversationConfiguration } from "@/lib/engine/conversations";
import { ConversationWorkspace } from "./conversation-workspace";

export const dynamic = "force-dynamic";
export default async function ConversationPage({ searchParams }: { searchParams: Promise<{ conversation?: string }> }) {
  const { conversation } = await searchParams;
  const id = conversation && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(conversation) ? conversation : undefined;
  return <ConversationWorkspace enabled={!!conversationConfiguration()} initialId={id} />;
}
