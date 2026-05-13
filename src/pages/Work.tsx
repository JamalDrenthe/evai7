import { useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  CheckSquare,
  Plus,
  Bell,
  Target,
  CircleDashed,
  Loader2,
  ClipboardList,
  Users,
  X,
  Trash2,
} from "lucide-react";

const tabs = [
  { label: "Actueel", value: "actueel" },
  { label: "Mijn team", value: "team" },
  { label: "Doelen", value: "doelen" },
] as const;

type TabValue = (typeof tabs)[number]["value"];

const statusConfig: Record<string, { label: string; color: string; bg: string; next: string }> = {
  todo: { label: "Te doen", color: "text-gray-600", bg: "bg-gray-100", next: "in_progress" },
  in_progress: { label: "Bezig", color: "text-blue-700", bg: "bg-blue-100", next: "review" },
  review: { label: "Review", color: "text-yellow-700", bg: "bg-yellow-100", next: "done" },
  done: { label: "Klaar", color: "text-green-700", bg: "bg-green-100", next: "todo" },
};

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: "text-gray-400", label: "Laag" },
  medium: { color: "text-yellow-500", label: "Medium" },
  high: { color: "text-red-500", label: "Hoog" },
};

const typeColors = {
  update: "bg-[#7a56f6]",
  info: "bg-blue-500",
  warning: "bg-yellow-500",
  success: "bg-green-500",
} as const;

const fallbackNotifications = [
  { id: -1, type: "update" as const, title: "Eva update 2026", body: "Nieuw AI Ecosysteem gelanceerd", createdAt: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { id: -2, type: "info" as const, title: "Teamoverleg", body: "Volgende week dinsdag 14:00", createdAt: new Date(Date.now() - 24 * 3600_000).toISOString() },
  { id: -3, type: "warning" as const, title: "Deadline nadert", body: "Eva Platform lancering", createdAt: new Date(Date.now() - 2 * 24 * 3600_000).toISOString() },
];

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.round(diffMs / 3600_000);
  if (h < 1) return "net";
  if (h < 24) return `${h}u geleden`;
  const d = Math.round(h / 24);
  return `${d}d geleden`;
}

function RightPanel({ totals }: { totals: { done: number; total: number } }) {
  const notifQuery = trpc.notifications.list.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const items =
    notifQuery.data && notifQuery.data.length > 0
      ? notifQuery.data.slice(0, 5).map((n) => ({
          id: n.id,
          type: (n.type as keyof typeof typeColors) ?? "info",
          title: n.title,
          body: n.body ?? "",
          createdAt: typeof n.createdAt === "string" ? n.createdAt : new Date(n.createdAt as unknown as Date).toISOString(),
        }))
      : fallbackNotifications;

  const completionPct = totals.total === 0 ? 0 : Math.round((totals.done / totals.total) * 100);
  const platformPct = Math.min(100, 25 + completionPct);
  const workspacePct = Math.min(100, 20 + completionPct);
  const toolsPct = 90;

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5 rounded-2xl p-5 border border-[#10b981]/20">
        <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-2 flex items-center gap-2">
          <Target size={16} className="text-[#10b981]" /> Voortgang
        </h3>
        <div className="space-y-3">
          {[
            { label: "Eva Platform", pct: platformPct, color: "#10b981" },
            { label: "AI Workspace", pct: workspacePct, color: "#3b82f6" },
            { label: "Tools Integratie", pct: toolsPct, color: "#7a56f6" },
          ].map((row) => (
            <div key={row.label}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[var(--eva-text-muted)]">{row.label}</span>
                <span className="font-medium" style={{ color: row.color }}>{row.pct}%</span>
              </div>
              <div className="h-1.5 bg-[var(--eva-canvas)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${row.pct}%`, backgroundColor: row.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold text-[var(--eva-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bell size={14} /> Meldingen
        </h3>
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--eva-canvas)] transition-colors">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeColors[n.type]}`} />
              <div>
                <p className="text-[12px] font-medium text-[var(--eva-text-primary)]">{n.title}</p>
                <p className="text-[11px] text-[var(--eva-text-secondary)]">{n.body}</p>
                <p className="text-[10px] text-[var(--eva-text-muted)] mt-0.5">{relativeTime(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Work() {
  const { user } = useAuth();
  const meName = user?.name ?? "Jij";
  const [activeTab, setActiveTab] = useState<TabValue>("actueel");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  });

  const workItemsQuery = trpc.work.list.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const createWorkItem = trpc.work.create.useMutation({
    onSuccess: () => {
      utils.work.list.invalidate();
      setShowAddTask(false);
      setNewTask({ title: "", description: "", priority: "medium", dueDate: "" });
    },
  });
  const updateWorkItem = trpc.work.update.useMutation({
    onSuccess: () => utils.work.list.invalidate(),
  });
  const deleteWorkItem = trpc.work.delete.useMutation({
    onSuccess: () => utils.work.list.invalidate(),
  });

  const items = workItemsQuery.data ?? [];

  const filteredItems = useMemo(() => {
    if (activeTab === "team") return items.filter((i) => i.assignee && i.assignee !== meName);
    if (activeTab === "doelen") return items.filter((i) => i.priority === "high");
    return items.filter((i) => i.status !== "done");
  }, [items, activeTab, meName]);

  const stats = useMemo(() => {
    const done = items.filter((i) => i.status === "done").length;
    const inProgress = items.filter((i) => i.status === "in_progress").length;
    const blocked = items.filter((i) => i.priority === "high" && i.status !== "done").length;
    return { total: items.length, done, inProgress, blocked };
  }, [items]);

  const tabCount = (tab: TabValue) => {
    if (tab === "team") return items.filter((i) => i.assignee && i.assignee !== meName).length;
    if (tab === "doelen") return items.filter((i) => i.priority === "high").length;
    return items.filter((i) => i.status !== "done").length;
  };

  const emptyConfig: Record<TabValue, { icon: typeof CheckSquare; title: string; subtitle: string; cta: string }> = {
    actueel: {
      icon: ClipboardList,
      title: "Geen open taken",
      subtitle: "Begin met je eerste taak en houd je dag overzichtelijk.",
      cta: "Nieuwe taak",
    },
    team: {
      icon: Users,
      title: "Niets toegewezen aan je team",
      subtitle: "Wijs taken toe via het veld \u201ctoegewezen aan\u201d.",
      cta: "Taak toewijzen",
    },
    doelen: {
      icon: Target,
      title: "Nog geen doelen vastgelegd",
      subtitle: "High-priority taken verschijnen hier als doelen.",
      cta: "Doel aanmaken",
    },
  };

  const onCycleStatus = (id: number, status: string) => {
    const next = statusConfig[status]?.next ?? "todo";
    updateWorkItem.mutate({ id, status: next as "todo" | "in_progress" | "review" | "done" });
  };

  return (
    <AppLayout rightPanel={<RightPanel totals={{ done: stats.done, total: stats.total }} />}>
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[12px] text-[var(--eva-text-muted)]">
          <span className="text-[var(--eva-text-secondary)]">Samenwerken</span>
          <span className="mx-2">/</span>
          <span>Mijn werk</span>
        </nav>
        <button
          onClick={() => setShowAddTask((v) => !v)}
          className="px-4 py-2 bg-[var(--eva-primary)] text-white text-[12px] font-medium rounded-xl hover:bg-[var(--eva-primary-hover)] transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> Nieuw
        </button>
      </div>

      <h1 className="text-xl font-semibold text-[var(--eva-text-primary)] mb-1">Mijn werk</h1>
      <p className="text-[12px] text-[var(--eva-text-muted)] mb-5">
        Overzicht van wat er op je bord ligt vandaag.
      </p>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Totaal", value: stats.total, accent: "bg-[var(--eva-canvas)]", text: "text-[var(--eva-text-primary)]" },
          { label: "Bezig", value: stats.inProgress, accent: "bg-blue-100", text: "text-blue-700" },
          { label: "Klaar", value: stats.done, accent: "bg-green-100", text: "text-green-700" },
          { label: "Hoge prio open", value: stats.blocked, accent: "bg-red-100", text: "text-red-700" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--eva-text-muted)]">{kpi.label}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${kpi.accent} ${kpi.text}`}>{kpi.value}</span>
            </div>
            <div className="mt-2 text-xl font-semibold text-[var(--eva-text-primary)]">{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const count = tabCount(tab.value);
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-2 rounded-xl text-[12px] font-medium transition-colors flex items-center gap-2 ${
                active
                  ? "bg-[var(--eva-primary)] text-white"
                  : "bg-white border border-[var(--eva-border-subtle)] text-[var(--eva-text-secondary)] hover:bg-[var(--eva-canvas)]"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${active ? "bg-white/15" : "bg-[var(--eva-canvas)] text-[var(--eva-text-muted)]"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[var(--eva-text-primary)]">Nieuwe taak</h3>
            <button
              onClick={() => setShowAddTask(false)}
              className="text-[var(--eva-text-muted)] hover:text-[var(--eva-text-primary)]"
              aria-label="Sluiten"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr,140px,160px,120px] gap-3">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Taak beschrijving…"
              autoFocus
              className="px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
            />
            <select
              aria-label="Prioriteit"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "low" | "medium" | "high" })}
              className="px-3 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px]"
            >
              <option value="low">Laag</option>
              <option value="medium">Medium</option>
              <option value="high">Hoog</option>
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="px-3 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px]"
            />
            <button
              disabled={!newTask.title || createWorkItem.isPending}
              onClick={() =>
                newTask.title &&
                createWorkItem.mutate({
                  title: newTask.title,
                  description: newTask.description || undefined,
                  priority: newTask.priority,
                  dueDate: newTask.dueDate || undefined,
                })
              }
              className="px-4 py-2.5 bg-[var(--eva-primary)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--eva-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {createWorkItem.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Toevoegen
            </button>
          </div>
          {createWorkItem.error && (
            <p className="mt-3 text-[11px] text-red-600">
              Kon taak niet opslaan: {createWorkItem.error.message}
            </p>
          )}
        </div>
      )}

      {/* Work Items List */}
      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] overflow-hidden">
        <div className="grid grid-cols-[1fr,140px,120px,120px,40px] gap-4 px-5 py-3 border-b border-[var(--eva-border-subtle)] text-[11px] font-semibold text-[var(--eva-text-muted)] uppercase tracking-wider">
          <span>Taak</span>
          <span>Toegekend aan</span>
          <span>Status</span>
          <span>Prioriteit</span>
          <span />
        </div>

        {workItemsQuery.isLoading ? (
          <div className="px-5 py-10 text-center text-[12px] text-[var(--eva-text-muted)] flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Taken laden…
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const status = statusConfig[item.status] || statusConfig.todo;
            const priority = priorityConfig[item.priority] || priorityConfig.medium;
            return (
              <div
                key={item.id}
                className="grid grid-cols-[1fr,140px,120px,120px,40px] gap-4 px-5 py-3.5 border-b border-[var(--eva-border-subtle)] last:border-0 hover:bg-[var(--eva-canvas)] transition-colors items-center group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => onCycleStatus(item.id, item.status)}
                    title="Volgende status"
                    className="text-[var(--eva-text-muted)] hover:text-[var(--eva-accent)] transition-colors"
                  >
                    {item.status === "done" ? <CheckSquare size={16} className="text-green-600" /> : <CircleDashed size={16} />}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-[13px] truncate ${item.status === "done" ? "line-through text-[var(--eva-text-muted)]" : "text-[var(--eva-text-primary)]"}`}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-[var(--eva-text-muted)] truncate">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[var(--eva-canvas)] flex items-center justify-center text-[10px] font-bold text-[var(--eva-text-secondary)]">
                    {(item.assignee ?? meName).charAt(0).toUpperCase()}
                  </div>
                  <span className="text-[12px] text-[var(--eva-text-secondary)] truncate">{item.assignee || meName}</span>
                </div>
                <button
                  onClick={() => onCycleStatus(item.id, item.status)}
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${status.bg} ${status.color} hover:opacity-80 transition-opacity`}
                >
                  {status.label}
                </button>
                <span className={`text-[12px] font-medium ${priority.color}`}>{priority.label}</span>
                <button
                  onClick={() => deleteWorkItem.mutate({ id: item.id })}
                  className="opacity-0 group-hover:opacity-100 text-[var(--eva-text-muted)] hover:text-red-500 transition-all"
                  aria-label="Verwijderen"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        ) : (
          (() => {
            const cfg = emptyConfig[activeTab];
            const Icon = cfg.icon;
            return (
              <div className="px-5 py-12 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[var(--eva-canvas)] flex items-center justify-center">
                  <Icon size={24} className="text-[var(--eva-text-muted)]" />
                </div>
                <p className="text-sm font-medium text-[var(--eva-text-primary)]">{cfg.title}</p>
                <p className="text-[11px] text-[var(--eva-text-secondary)] mt-1 max-w-sm mx-auto">{cfg.subtitle}</p>
                <button
                  onClick={() => setShowAddTask(true)}
                  className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--eva-primary)] text-white text-[12px] font-medium hover:bg-[var(--eva-primary-hover)] transition-colors"
                >
                  <Plus size={12} /> {cfg.cta}
                </button>
              </div>
            );
          })()
        )}
      </div>
    </AppLayout>
  );
}
