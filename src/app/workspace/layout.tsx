import type { Metadata } from "next";
import "./workspace.css";
import { WorkspaceNav } from "./workspace-nav";

export const metadata: Metadata = { title: "Workspace", robots: { index: false, follow: false } };
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <div className="workspace">
    <a className="ws-skip-link" href="#workspace-content">Skip workspace navigation</a>
    <aside className="ws-sidebar" aria-label="Workspace navigation">
      <a className="ws-brand" href="/workspace" aria-label="Placedon workspace home"><span className="brand-mark" aria-hidden="true" />Placedon</a>
      <WorkspaceNav />
    </aside>
    <div className="ws-content" id="workspace-content" tabIndex={-1}>
      <header className="ws-topbar"><span>Indian corporate law</span></header>
      {children}
      <footer className="ws-meta">For professional review, not legal advice. <a href="/workspace/limitations">Scope & limitations</a></footer>
    </div>
  </div>;
}
