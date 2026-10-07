"use client";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { MessageSquare, SquarePen, CircleHelp, History, FileText, Moon, Sun } from "lucide-react";

const THEME_KEY = "placedon-workspace-theme";
function appearanceSnapshot() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved === "dark";
  } catch { /* A blocked preference store does not prevent appearance changes. */ }
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function subscribeAppearance(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const storage = (event: StorageEvent) => { if (event.key === THEME_KEY || event.key === null) callback(); };
  media.addEventListener("change", callback);
  window.addEventListener("storage", storage);
  return () => { media.removeEventListener("change", callback); window.removeEventListener("storage", storage); };
}
export function WorkspaceShell({ children }: { children: ReactNode }) {
  const preference = useSyncExternalStore(subscribeAppearance, appearanceSnapshot, () => false);
  const [choice, setChoice] = useState<boolean | null>(null);
  const dark = choice ?? preference;
  function changeAppearance() {
    setChoice(!dark);
    try { localStorage.setItem(THEME_KEY, dark ? "light" : "dark"); } catch { /* Applies for this visit. */ }
  }
  return <div className="workspace" data-theme={dark ? "dark" : "light"}>
    <a className="ws-skip-link" href="#workspace-content">Skip workspace navigation</a>
    <aside className="ws-sidebar" aria-label="Workspace navigation">
      <a className="ws-brand" href="/workspace" aria-label="Placedon workspace home"><span className="brand-mark" aria-hidden="true" />Placedon</a>
      <WorkspaceNav />
      <button type="button" className="ws-appearance" aria-label={dark ? "Use light mode" : "Use dark mode"} aria-pressed={dark} onClick={changeAppearance}>{dark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}<span>{dark ? "Light mode" : "Dark mode"}</span></button>
    </aside>
    {children}
  </div>;
}

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
