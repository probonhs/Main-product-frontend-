"use client";
import { usePathname } from "next/navigation";
import { MessageSquare, SquarePen, CircleHelp, History, FileText } from "lucide-react";

export function WorkspaceNav() {
  const pathname = usePathname();
  return <nav className="ws-nav" aria-label="Workspace">
    <a className="ws-new-question" href="/workspace"><SquarePen size={18} aria-hidden="true" />New question</a>
    <a href="/workspace/ask" aria-current={pathname === "/workspace" || pathname === "/workspace/ask" ? "page" : undefined}><MessageSquare size={18} aria-hidden="true" />Ask Placedon</a>
    <a href="/workspace/conversations" aria-current={pathname === "/workspace/conversations" ? "page" : undefined}><History size={18} aria-hidden="true" />Conversations</a>
    <a href="/workspace/documents" aria-current={pathname === "/workspace/documents" ? "page" : undefined}><FileText size={18} aria-hidden="true" />Documents</a>
    <a href="/workspace/limitations" aria-current={pathname === "/workspace/limitations" ? "page" : undefined}><CircleHelp size={18} aria-hidden="true" />Known limitations</a>
  </nav>;
}
