import { useState, useEffect, Suspense, useCallback } from "react";
import { useLocation } from "react-router";
import { Sparkles, Loader2, FileText, Lightbulb } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatStream } from "@/components/orchestrator/ChatStream";
import { ModeSwitcher } from "@/components/orchestrator/ModeSwitcher";
import { ModuleBrowser } from "@/components/orchestrator/ModuleBrowser";
import { ContextViewer } from "@/components/orchestrator/ContextViewer";
import { DocumentsPanel } from "@/components/documents/DocumentsPanel";
import { useOrchestrator } from "@/hooks/useOrchestrator";
import { getModulePanel } from "@/modules/_registry";
import type { InteractionMode } from "../../contracts/module-manifest";

export function Workspace() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isDocs = currentPath === "/workspace/docs";
  const isBrainstorm = currentPath === "/workspace/brainstorm";
  const [mode, setMode] = useState<InteractionMode>("chat-calculators");
  const [activeModuleId, setActiveModuleId] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | null>(null);

  const createSession = trpc.sessions.create.useMutation();
  const setSessionMode = trpc.sessions.setMode.useMutation();
  const setSessionModule = trpc.sessions.setActiveModule.useMutation();

  const orchestrator = useOrchestrator(sessionId);

  // Auto-create session on mount
  useEffect(() => {
    if (!sessionId && !createSession.isPending && !createSession.error) {
      createSession.mutate(
        { mode: "chat-calculators" },
        {
          onSuccess: (s) => setSessionId(s.sessionId),
          onError: (err) => {
            console.error("Failed to create session:", err);
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModeChange = useCallback(
    (newMode: InteractionMode) => {
      setMode(newMode);
      setActiveModuleId(undefined);
      orchestrator.reset();
      if (sessionId) {
        setSessionMode.mutate({ sessionId, mode: newMode });
      }
    },
    [sessionId, setSessionMode, orchestrator],
  );

  const handleModuleSelect = useCallback(
    (moduleId: string) => {
      setActiveModuleId((prev) => (prev === moduleId ? undefined : moduleId));
      if (sessionId) {
        setSessionModule.mutate({
          sessionId,
          moduleId: activeModuleId === moduleId ? undefined : moduleId,
        });
      }
    },
    [sessionId, setSessionModule, activeModuleId],
  );

  const ActivePanel = activeModuleId ? getModulePanel(activeModuleId) : null;

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-cyan-500/30 flex items-center justify-center">
              {isDocs ? (
                <FileText className="w-4 h-4 text-cyan-400" />
              ) : isBrainstorm ? (
                <Lightbulb className="w-4 h-4 text-cyan-400" />
              ) : (
                <Sparkles className="w-4 h-4 text-cyan-400" />
              )}
            </div>
            <div>
              <h1 className="text-base font-bold">
                {isDocs ? "Documenten" : isBrainstorm ? "Brainstorm" : "EVAI Workspace"}
              </h1>
              <p className="text-[11px] text-slate-500">
                {sessionId ? `Sessie ${sessionId.slice(0, 8)}` : "Geen actieve sessie"}
              </p>
            </div>
          </div>
          <ModeSwitcher mode={mode} onChange={handleModeChange} />
        </header>

        {/* Main layout: docs uses full width, otherwise 3 columns */}
        <div className="flex-1 flex min-h-0">
          {/* Left: Module browser (hidden on docs) */}
          {!isDocs && (
            <aside className="w-64 border-r border-slate-800 p-4 overflow-y-auto shrink-0">
              <ModuleBrowser
                mode={mode}
                activeModuleId={activeModuleId}
                onSelect={handleModuleSelect}
              />
            </aside>
          )}

          {/* Center: Chat or active module panel */}
          <section className="flex-1 flex flex-col min-w-0 bg-slate-950/50">
            {isDocs ? (
              <DocumentsPanel />
            ) : isBrainstorm ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <Lightbulb size={48} className="mx-auto text-cyan-400 mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-2">Brainstorm</h2>
                  <p className="text-sm text-slate-400">Brainstorm module is nog niet geïmplementeerd.</p>
                </div>
              </div>
            ) : !sessionId ? (
              <div className="flex-1 flex items-center justify-center">
                {createSession.error ? (
                  <div className="text-center p-6">
                    <p className="text-red-400 mb-2">Failed to create session</p>
                    <p className="text-sm text-slate-500">{createSession.error.message}</p>
                    <p className="text-xs text-slate-600 mt-2">Make sure you are logged in</p>
                  </div>
                ) : (
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
                )}
              </div>
            ) : mode === "direct-tool" && activeModuleId && ActivePanel ? (
              <div className="flex-1 overflow-y-auto p-6 min-h-0">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                    </div>
                  }
                >
                  <ActivePanel />
                </Suspense>
              </div>
            ) : (
              <ChatStream
                messages={orchestrator.messages}
                isStreaming={orchestrator.isStreaming}
                error={orchestrator.error}
                onSend={orchestrator.send}
                onStop={orchestrator.stop}
                placeholder={
                  mode === "chat-calculators"
                    ? "Vraag iets aan een calculator…"
                    : mode === "chat-projects"
                      ? "Vraag iets aan je projecten…"
                      : "Vraag iets…"
                }
                emptyHint={
                  mode === "chat-calculators"
                    ? "Chat met je calculators"
                    : mode === "chat-projects"
                      ? "Chat met je projecten"
                      : "Selecteer een tool of stel een vraag"
                }
              />
            )}
          </section>

          {/* Right: Context viewer (hidden on docs) */}
          {!isDocs && (
            <aside className="w-80 border-l border-slate-800 shrink-0">
              <ContextViewer
                sessionId={sessionId}
                liveInvocations={orchestrator.toolInvocations}
              />
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
