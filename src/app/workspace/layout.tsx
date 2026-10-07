import type { Metadata } from "next";
import "./workspace.css";
import { WorkspaceShell } from "./workspace-nav";

export const metadata: Metadata = { title: "Workspace", robots: { index: false, follow: false } };
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>
    <div className="ws-content" id="workspace-content" tabIndex={-1}>
      <header className="ws-topbar"><span>Indian corporate law</span></header>
      {children}
    </div>
  </WorkspaceShell>;
}
