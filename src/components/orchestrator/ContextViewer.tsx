import { Suspense, useMemo } from "react";
import { Activity, Variable, Clock, Wrench, History, Loader2, RefreshCw, GitBranch, Copy } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { getModuleContextCard } from "@/modules/_registry";
import type { ToolInvocation } from "@/hooks/useOrchestrator";

type Props = {
  sessionId: string | null;
  liveInvocations: ToolInvocation[];
};

type Tab = "timeline" | "variables" | "history";

import { useState } from "react";

export function ContextViewer({ sessionId, liveInvocations }: Props) {
  const [tab, setTab] = useState<Tab>("timeline");
  const sessionQuery = trpc.sessions.get.useQuery(
    { sessionId: sessionId ?? "" },
    {
      enabled: !!sessionId,
      refetchInterval: 2000,
    },
  );

  const session = sessionQuery.data;
  const variables = useMemo(
    () => Object.values(session?.variables ?? {}).slice(-10).reverse(),
    [session?.variables],
  );
  const skillOutputs = useMemo(
    () =>
      (session?.history ?? [])
        .filter((e) => e.source === "skill" && e.kind === "output")
        .slice(-10)
        .reverse(),
    [session?.history],
  );

  const handleRerun = (entry: { id: string; moduleId?: string; payload: unknown }) => {
    // Trigger re-run of the tool with the same input
    console.log("[ContextViewer] Re-run:", entry.id);
    // TODO: Implement re-run via orchestrator
  };

  const handleBranch = (entry: { id: string; moduleId?: string; payload: unknown }) => {
    // Create a new workflow branch from this point
    console.log("[ContextViewer] Branch:", entry.id);
    // TODO: Implement branching via orchestrator
  };

  const handleCopy = (entry: { id: string; payload: unknown }) => {
    // Copy the output to clipboard or to a new variable
    const payload = entry.payload as { output?: unknown };
    if (payload.output) {
      navigator.clipboard.writeText(JSON.stringify(payload.output, null, 2));
      console.log("[ContextViewer] Copied output to clipboard");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <Activity className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-white">Sessie Context</h3>
      </div>

      <div className="flex border-b border-slate-800">
        <TabButton active={tab === "timeline"} onClick={() => setTab("timeline")} icon={Clock}>
          Live
        </TabButton>
        <TabButton active={tab === "history"} onClick={() => setTab("history")} icon={History}>
          History
        </TabButton>
        <TabButton active={tab === "variables"} onClick={() => setTab("variables")} icon={Variable}>
          Vars
        </TabButton>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {tab === "timeline" && (
          <>
            {liveInvocations.length === 0 ? (
              <EmptyHint icon={Wrench} text="Geen actieve tool calls" />
            ) : (
              liveInvocations.slice().reverse().map((inv) => (
                <LiveInvocationCard key={inv.callId} inv={inv} />
              ))
            )}
          </>
        )}

        {tab === "history" && (
          <>
            {skillOutputs.length === 0 ? (
              <EmptyHint icon={History} text="Nog geen tool resultaten in deze sessie" />
            ) : (
              skillOutputs.map((entry) => (
                <DynamicContextCard
                  key={entry.id}
                  moduleId={entry.moduleId ?? ""}
                  payload={(entry.payload as { input?: unknown; output?: unknown })}
                  ts={entry.ts}
                  summary={entry.summary}
                  onRerun={() => handleRerun(entry)}
                  onBranch={() => handleBranch(entry)}
                  onCopy={() => handleCopy(entry)}
                />
              ))
            )}
          </>
        )}

        {tab === "variables" && (
          <>
            {variables.length === 0 ? (
              <EmptyHint icon={Variable} text="Geen variabelen in sessie" />
            ) : (
              variables.map((v) => (
                <div
                  key={v.name}
                  className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Variable className="w-3 h-3 text-cyan-400" />
                    <span className="text-[11px] font-mono font-bold text-cyan-300">
                      ${v.name}
                    </span>
                    <span className="text-[9px] text-slate-500 ml-auto">
                      {new Date(v.ts).toLocaleTimeString("nl-NL", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-300 truncate">
                    {formatValue(v.value)}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Clock;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${
        active
          ? "text-cyan-300 border-b-2 border-cyan-400 bg-cyan-500/5"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      <Icon className="w-3 h-3" />
      <span>{children}</span>
    </button>
  );
}

function EmptyHint({ icon: Icon, text }: { icon: typeof Clock; text: string }) {
  return (
    <div className="text-center py-6 text-slate-500">
      <Icon className="w-5 h-5 mx-auto mb-1.5 opacity-40" />
      <p className="text-[11px]">{text}</p>
    </div>
  );
}

function LiveInvocationCard({ inv }: { inv: ToolInvocation }) {
  const isRunning = inv.status === "running";
  const isError = inv.status === "error";
  return (
    <div
      className={`p-2.5 rounded-lg border ${
        isError
          ? "bg-rose-500/5 border-rose-500/30"
          : isRunning
            ? "bg-amber-500/5 border-amber-500/30"
            : "bg-emerald-500/5 border-emerald-500/30"
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {isRunning ? (
          <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
        ) : (
          <Wrench
            className={`w-3 h-3 ${isError ? "text-rose-400" : "text-emerald-400"}`}
          />
        )}
        <span className="text-[10px] font-mono font-bold text-white">
          {inv.moduleId}
        </span>
        <span className="text-[10px] text-slate-500">·</span>
        <span className="text-[10px] text-slate-400">{inv.capability}</span>
        {inv.durationMs !== undefined && (
          <span className="text-[9px] text-slate-500 ml-auto font-mono">
            {inv.durationMs}ms
          </span>
        )}
      </div>
      {inv.error && (
        <div className="text-[10px] text-rose-300 mt-1">{inv.error}</div>
      )}
    </div>
  );
}

// eslint-disable-next-line react-hooks/rules-of-hooks, react-refresh/only-export-components
function DynamicContextCard({
  moduleId,
  payload,
  ts,
  summary,
  onRerun,
  onBranch,
  onCopy,
}: {
  moduleId: string;
  payload: unknown;
  ts: number;
  summary?: string;
  onRerun?: () => void;
  onBranch?: () => void;
  onCopy?: () => void;
}) {
  const Card = getModuleContextCard(moduleId);
  return (
    <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg group hover:border-slate-700 transition">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          {!Card ? (
            <>
              <div className="text-[10px] font-mono text-slate-400">{moduleId}</div>
              {summary && <div className="text-[11px] text-slate-300 mt-1">{summary}</div>}
              <div className="text-[9px] text-slate-600 mt-1">
                {new Date(ts).toLocaleTimeString("nl-NL")}
              </div>
            </>
          ) : (
            <Suspense
              fallback={
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-lg">
                  <Loader2 className="w-3 h-3 animate-spin text-slate-500" />
                </div>
              }
            >
              <Card payload={payload} ts={ts} />
            </Suspense>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
          {onRerun && (
            <button
              onClick={onRerun}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-cyan-400 transition"
              title="Re-run"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
          {onBranch && (
            <button
              onClick={onBranch}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-emerald-400 transition"
              title="Branch"
            >
              <GitBranch className="w-3 h-3" />
            </button>
          )}
          {onCopy && (
            <button
              onClick={onCopy}
              className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-slate-300 transition"
              title="Copy"
            >
              <Copy className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function formatValue(v: unknown): string {
  if (typeof v === "number") {
    return new Intl.NumberFormat("nl-NL").format(v);
  }
  if (typeof v === "string") return v.length > 60 ? v.slice(0, 60) + "…" : v;
  try {
    const s = JSON.stringify(v);
    return s.length > 60 ? s.slice(0, 60) + "…" : s;
  } catch {
    return String(v);
  }
}
