import { useState, useEffect, Suspense, useCallback } from "react";
import { useLocation } from "react-router";
import { Sparkles, Loader2, FileText, Lightbulb, Bot } from "lucide-react";
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
  const initialMode: InteractionMode = isBrainstorm ? "chat-projects" : "chat-calculators";
  const [mode, setMode] = useState<InteractionMode>(initialMode);
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
        { mode: initialMode },
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
                showAll={isBrainstorm}
              />
            </aside>
          )}

          {/* Center: Brainstorm cards (always visible) on /brainstorm, otherwise chat / panel */}
          {isBrainstorm ? (
            <section className="w-[420px] shrink-0 border-r border-slate-800 overflow-y-auto bg-slate-950/40">
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-cyan-500/30 flex items-center justify-center">
                    <Lightbulb size={26} className="text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Brainstorm</h2>
                  <p className="text-[12px] text-slate-400 leading-relaxed">
                    Begeleide ideatie met al je modules. Kies een startprompt of typ rechts je eigen vraag — Eva
                    combineert tools, context en eerdere sessies.
                  </p>
                </div>

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Startprompts
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      title: "Genereer 5 productideeën",
                      body: "Brainstorm vijf nieuwe productideeën voor de Verdienende Vrienden Club, gebaseerd op huidige cashflow.",
                      accent: "from-cyan-500/15 to-cyan-500/5 border-cyan-500/30",
                    },
                    {
                      title: "Plan een marketingcampagne",
                      body: "Bedenk een campagne van 4 weken om nieuwe ZZP'ers naar het platform te trekken. Inclusief kanalen + KPI's.",
                      accent: "from-indigo-500/15 to-indigo-500/5 border-indigo-500/30",
                    },
                    {
                      title: "Mindmap rond een thema",
                      body: "Maak een mindmap van 3 niveaus diep over \u201cVoice Verificatie als anti-fraude tool\u201d.",
                      accent: "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30",
                    },
                    {
                      title: "Combineer twee modules",
                      body: "Hoe kan de ZZP Netto Calculator samenwerken met de Estate Calculator om vermogensgroei te modelleren?",
                      accent: "from-amber-500/15 to-amber-500/5 border-amber-500/30",
                    },
                  ].map((card) => (
                    <button
                      key={card.title}
                      onClick={() => {
                        if (mode !== "chat-projects") handleModeChange("chat-projects");
                        orchestrator.send(card.body);
                      }}
                      disabled={orchestrator.isStreaming}
                      className={`text-left p-4 rounded-2xl border bg-gradient-to-br ${card.accent} hover:border-cyan-400/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <p className="text-[13px] font-semibold text-white mb-1">{card.title}</p>
                      <p className="text-[12px] text-slate-300 leading-relaxed">{card.body}</p>
                    </button>
                  ))}
                </div>

                <p className="mt-5 text-[11px] text-slate-500 leading-relaxed">
                  Klik op een prompt om hem direct te sturen. Tools links zijn beschikbaar voor de orchestrator;
                  Eva schakelt automatisch tussen calculators, chatbots en visualisaties.
                </p>
              </div>
            </section>
          ) : null}

          <section className={`flex-1 flex flex-col min-w-0 ${isBrainstorm ? "bg-slate-950/60" : "bg-slate-950/50"}`}>
            {isDocs ? (
              <DocumentsPanel />
            ) : isBrainstorm ? (
              <div className="flex flex-col h-full min-h-0">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 shrink-0">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-[13px] font-semibold text-white">Chat</h3>
                  {orchestrator.toolInvocations.length > 0 && (
                    <span className="text-[10px] text-slate-500 font-mono ml-auto">
                      {orchestrator.toolInvocations.length} tool call{orchestrator.toolInvocations.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-h-0">
                  <ChatStream
                    messages={orchestrator.messages}
                    isStreaming={orchestrator.isStreaming}
                    error={orchestrator.error}
                    onSend={(text) => {
                      if (mode !== "chat-projects") handleModeChange("chat-projects");
                      orchestrator.send(text);
                    }}
                    onStop={orchestrator.stop}
                    placeholder={orchestrator.messages.length ? "Verder brainstormen…" : "Start een brainstorm…"}
                    emptyHint="Klaar om te brainstormen"
                    emptySubtext="Klik links op een startprompt of typ je eigen vraag — Eva combineert je tools."
                  />
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

          {/* Right: Context viewer (hidden on docs and brainstorm — brainstorm shows the chat here instead) */}
          {!isDocs && !isBrainstorm && (
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
