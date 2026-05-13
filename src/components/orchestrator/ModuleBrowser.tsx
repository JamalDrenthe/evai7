import { trpc } from "@/providers/trpc";
import { listFrontendModules } from "@/modules/_registry";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InteractionMode } from "../../../contracts/module-manifest";

type ModuleType = "calculator" | "chatbot" | "tool" | "visualization" | "verification";

type Props = {
  mode: InteractionMode;
  activeModuleId?: string;
  onSelect: (moduleId: string) => void;
  /** When true, ignores mode filter and groups every registered module by type. Used by Brainstorm. */
  showAll?: boolean;
  /** Override the section title shown above the list. */
  title?: string;
};

const MODE_FILTER: Record<InteractionMode, Array<ModuleType>> = {
  "chat-calculators": ["calculator"],
  "chat-projects": ["chatbot", "tool", "visualization", "verification"],
  "direct-tool": ["calculator", "chatbot", "tool", "visualization", "verification"],
};

const TYPE_ORDER: ModuleType[] = ["calculator", "chatbot", "tool", "visualization", "verification"];
const TYPE_LABELS: Record<ModuleType, string> = {
  calculator: "Calculators",
  chatbot: "Chatbots",
  tool: "Tools",
  visualization: "Visualisaties",
  verification: "Verificatie",
};

export function ModuleBrowser({ mode, activeModuleId, onSelect, showAll, title }: Props) {
  const modulesQuery = trpc.modules.list.useQuery();
  const allowedTypes = showAll ? TYPE_ORDER : MODE_FILTER[mode];
  const frontend = listFrontendModules();

  const visibleModules = (modulesQuery.data ?? [])
    .filter((m) => allowedTypes.includes(m.type as ModuleType))
    .map((m) => {
      const fe = frontend.find((f) => f.id === m.id);
      return { backend: m, frontend: fe };
    });

  const headerTitle =
    title ??
    (showAll
      ? "Alle modules"
      : mode === "chat-calculators"
        ? "Beschikbare Calculators"
        : mode === "chat-projects"
          ? "Beschikbare Projecten"
          : "Alle Tools");

  const renderCard = (backend: typeof visibleModules[number]["backend"], fe: typeof visibleModules[number]["frontend"]) => {
    const Icon = (fe?.icon as LucideIcon) ?? (Icons as unknown as Record<string, LucideIcon>)[backend.ui.icon] ?? Icons.Box;
    const active = activeModuleId === backend.id;
    return (
      <button
        key={backend.id}
        type="button"
        onClick={() => onSelect(backend.id)}
        className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all ${
          active
            ? "bg-cyan-500/10 border-cyan-500/30 ring-1 ring-cyan-500/20"
            : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
        }`}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: `${backend.ui.color ?? "#64748b"}20`,
            borderColor: `${backend.ui.color ?? "#64748b"}40`,
            color: backend.ui.color ?? "#94a3b8",
          }}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] font-bold text-white truncate">{backend.name}</div>
          <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{backend.description}</div>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {backend.capabilities.slice(0, 2).map((c) => (
              <span
                key={c.name}
                className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded font-mono"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{headerTitle}</h3>
        <span className="text-[10px] text-slate-600 font-mono">{visibleModules.length}</span>
      </div>

      {modulesQuery.isLoading ? (
        <div className="text-[11px] text-slate-500 px-2">Laden…</div>
      ) : visibleModules.length === 0 ? (
        <div className="text-[11px] text-slate-500 px-2">Geen modules gevonden</div>
      ) : showAll ? (
        <div className="space-y-4">
          {TYPE_ORDER.map((type) => {
            const group = visibleModules.filter((m) => m.backend.type === type);
            if (!group.length) return null;
            return (
              <div key={type} className="space-y-1.5">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-600 px-1">
                  {TYPE_LABELS[type]} <span className="text-slate-700">({group.length})</span>
                </p>
                {group.map(({ backend, frontend: fe }) => renderCard(backend, fe))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {visibleModules.map(({ backend, frontend: fe }) => renderCard(backend, fe))}
        </div>
      )}
    </div>
  );
}
