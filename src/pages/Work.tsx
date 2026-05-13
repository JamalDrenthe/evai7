import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { trpc } from "@/providers/trpc";
import {
  CheckSquare,
  Plus,
  Bell,
  Target,
} from "lucide-react";

const tabs = [
  { label: "Actueel", value: "actueel" },
  { label: "Mijn team", value: "team" },
  { label: "Doelen", value: "doelen" },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  todo: { label: "Te doen", color: "text-gray-600", bg: "bg-gray-100" },
  in_progress: { label: "Bezig", color: "text-blue-700", bg: "bg-blue-100" },
  review: { label: "Review", color: "text-yellow-700", bg: "bg-yellow-100" },
  done: { label: "Klaar", color: "text-green-700", bg: "bg-green-100" },
};

const priorityConfig: Record<string, { color: string }> = {
  low: { color: "text-gray-400" },
  medium: { color: "text-yellow-500" },
  high: { color: "text-red-500" },
};

function RightPanel() {
  const notifications = [
    { id: 1, type: "update" as const, title: "Eva update 2026", message: "Nieuw AI Ecosysteem gelanceerd", time: "2u geleden" },
    { id: 2, type: "info" as const, title: "Teamoverleg", message: "Volgende week dinsdag 14:00", time: "1d geleden" },
    { id: 3, type: "warning" as const, title: "Deadline nadert", message: "Eva Platform lancering", time: "2d geleden" },
  ];

  const typeColors = {
    update: "bg-[#7a56f6]",
    info: "bg-blue-500",
    warning: "bg-yellow-500",
    success: "bg-green-500",
  };

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#10b981]/10 to-[#10b981]/5 rounded-2xl p-5 border border-[#10b981]/20">
        <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-2 flex items-center gap-2">
          <Target size={16} className="text-[#10b981]" /> Voortgang
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[var(--eva-text-muted)]">Eva Platform</span>
              <span className="text-[#10b981] font-medium">75%</span>
            </div>
            <div className="h-1.5 bg-[var(--eva-canvas)] rounded-full overflow-hidden">
              <div className="h-full bg-[#10b981] rounded-full" style={{ width: "75%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[var(--eva-text-muted)]">AI Workspace</span>
              <span className="text-[#3b82f6] font-medium">60%</span>
            </div>
            <div className="h-1.5 bg-[var(--eva-canvas)] rounded-full overflow-hidden">
              <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: "60%" }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[var(--eva-text-muted)]">Tools Integratie</span>
              <span className="text-[#7a56f6] font-medium">90%</span>
            </div>
            <div className="h-1.5 bg-[var(--eva-canvas)] rounded-full overflow-hidden">
              <div className="h-full bg-[#7a56f6] rounded-full" style={{ width: "90%" }} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold text-[var(--eva-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-2">
          <Bell size={14} /> Meldingen
        </h3>
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--eva-canvas)] transition-colors">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${typeColors[n.type]}`} />
              <div>
                <p className="text-[12px] font-medium text-[var(--eva-text-primary)]">{n.title}</p>
                <p className="text-[11px] text-[var(--eva-text-secondary)]">{n.message}</p>
                <p className="text-[10px] text-[var(--eva-text-muted)] mt-0.5">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Work() {
  const [activeTab, setActiveTab] = useState("actueel");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", priority: "medium" as const });

  const workItemsQuery = trpc.work.list.useQuery();
  const createWorkItem = trpc.work.create.useMutation({
    onSuccess: () => {
      workItemsQuery.refetch();
      setShowAddTask(false);
      setNewTask({ title: "", priority: "medium" });
    },
  });

  const items = workItemsQuery.data ?? [];

  return (
    <AppLayout rightPanel={<RightPanel />}>
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[12px] text-[var(--eva-text-muted)]">
          <span className="text-[var(--eva-text-secondary)]">Samenwerken</span>
          <span className="mx-2">/</span>
          <span>Mijn werk</span>
        </nav>
        <button
          onClick={() => setShowAddTask(true)}
          className="px-4 py-2 bg-[var(--eva-primary)] text-white text-[12px] font-medium rounded-xl hover:bg-[var(--eva-primary-hover)] transition-colors flex items-center gap-2"
        >
          <Plus size={14} /> Nieuw
        </button>
      </div>

      <h1 className="text-xl font-semibold text-[var(--eva-text-primary)] mb-6">Mijn werk</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-[12px] font-medium transition-colors ${
              activeTab === tab.value
                ? "bg-[var(--eva-primary)] text-white"
                : "bg-white border border-[var(--eva-border-subtle)] text-[var(--eva-text-secondary)] hover:bg-[var(--eva-canvas)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5 mb-6">
          <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-3">Nieuwe taak</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Taak beschrijving..."
              className="flex-1 px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
            />
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              className="px-3 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px]"
            >
              <option value="low">Laag</option>
              <option value="medium">Medium</option>
              <option value="high">Hoog</option>
            </select>
            <button
              onClick={() => newTask.title && createWorkItem.mutate(newTask)}
              className="px-4 py-2.5 bg-[var(--eva-primary)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--eva-primary-hover)] transition-colors"
            >
              Toevoegen
            </button>
          </div>
        </div>
      )}

      {/* Work Items List */}
      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] overflow-hidden">
        <div className="grid grid-cols-[1fr,120px,100px,120px] gap-4 px-5 py-3 border-b border-[var(--eva-border-subtle)] text-[11px] font-semibold text-[var(--eva-text-muted)] uppercase tracking-wider">
          <span>Taak</span>
          <span>Toegekend aan</span>
          <span>Status</span>
          <span>Prioriteit</span>
        </div>

        {items.length > 0 ? (
          items.map((item) => {
            const status = statusConfig[item.status] || statusConfig.todo;
            const priority = priorityConfig[item.priority] || priorityConfig.medium;
            return (
              <div
                key={item.id}
                className="grid grid-cols-[1fr,120px,100px,120px] gap-4 px-5 py-3.5 border-b border-[var(--eva-border-subtle)] last:border-0 hover:bg-[var(--eva-canvas)] transition-colors items-center"
              >
                <div className="flex items-center gap-3">
                  <CheckSquare size={16} className="text-[var(--eva-text-muted)]" />
                  <span className="text-[13px] text-[var(--eva-text-primary)]">{item.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--eva-canvas)] flex items-center justify-center text-[10px] font-bold text-[var(--eva-text-secondary)]">
                    {item.assignee?.charAt(0) || "J"}
                  </div>
                  <span className="text-[12px] text-[var(--eva-text-secondary)]">{item.assignee || "Jij"}</span>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
                <span className={`text-[12px] font-medium ${priority.color}`}>
                  {item.priority === "low" ? "Laag" : item.priority === "medium" ? "Medium" : "Hoog"}
                </span>
              </div>
            );
          })
        ) : (
          <div className="px-5 py-8 text-center">
            <CheckSquare size={32} className="mx-auto text-[var(--eva-text-muted)] mb-2" />
            <p className="text-sm text-[var(--eva-text-muted)]">Geen taken gevonden</p>
            <p className="text-[11px] text-[var(--eva-text-secondary)] mt-1">Maak je eerste taak aan</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
