import type { Metadata } from "next";
import "./workspace.css";
import { WorkspaceNav } from "./workspace-nav";
import { WORKSPACE_SAMPLES } from "@/lib/workspace-samples";
import { conversationConfiguration } from "@/lib/engine/conversations";

export const metadata: Metadata = { title: "Workspace", robots: { index: false, follow: false } };
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <div className="workspace">
    <aside className="ws-sidebar" aria-label="Workspace navigation">
      <a className="ws-brand" href="/workspace" aria-label="Placedon workspace home"><span className="brand-mark" aria-hidden="true" />Placedon</a>
      <WorkspaceNav />
      <details className="ws-sidebar-examples"><summary>Examples</summary><p className="ws-muted">Captured checks, not saved chats.</p>{WORKSPACE_SAMPLES.map((sample) => <a href={`/workspace/ask?example=${sample.id}`} key={sample.id}>{sample.title}</a>)}</details>
      <div className="ws-sidebar-note"><span className="ws-kicker">Product preview</span><p>{conversationConfiguration() ? "Conversations use the configured local gateway." : "Captured examples and independent checks. Saved conversations require a gateway connection."}</p></div>
    </aside>
    <div className="ws-content">
      <header className="ws-topbar"><span>Indian corporate law</span><span className="ws-muted">Preview workspace</span></header>
      {children}
      <footer className="ws-meta">For professional review, not legal advice. <a href="/workspace/limitations">Scope & limitations</a></footer>
    </div>
  </div>;
}
