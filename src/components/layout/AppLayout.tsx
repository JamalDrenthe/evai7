import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

export function AppLayout({ children, rightPanel }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[var(--eva-canvas)]">
      <Sidebar />
      <main className="flex-1 flex">
        <div className={`flex-1 p-6 overflow-auto ${rightPanel ? "" : "max-w-6xl"}`}>
          <div className="page-transition">{children}</div>
        </div>
        {rightPanel && (
          <aside className="w-[380px] min-h-screen bg-white border-l border-[var(--eva-border-subtle)] p-6 overflow-auto">
            {rightPanel}
          </aside>
        )}
      </main>
    </div>
  );
}
