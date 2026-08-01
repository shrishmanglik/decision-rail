import Link from "next/link";
import { GitBranch } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="DecisionRail home">
          <span className="brand-mark"><GitBranch aria-hidden="true" size={18} /></span>
          DecisionRail
        </Link>
        <nav className="nav" aria-label="Primary navigation">
          <Link href="/workspace">Workspace</Link>
          <Link href="/records">Records</Link>
          <Link href="/proof">Proof</Link>
          <Link href="/connections">Connections</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
