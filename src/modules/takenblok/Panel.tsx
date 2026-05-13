import { useMemo, useState } from "react";
import { ListTodo, Plus, Loader2, Trash2, ArrowRight, X } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { PanelProps } from "../_types";

type Status = "todo" | "in_progress" | "review" | "done";
type Priority = "low" | "medium" | "high";

const COLUMNS: { id: Status; label: string; accent: string }[] = [
  { id: "todo", label: "Te doen", accent: "border-slate-600" },
  { id: "in_progress", label: "Bezig", accent: "border-blue-500" },
  { id: "review", label: "Review", accent: "border-yellow-500" },
  { id: "done", label: "Klaar", accent: "border-emerald-500" },
];

const PRIO_BADGE: Record<Priority, string> = {
  low: "bg-slate-700 text-slate-300",
  medium: "bg-amber-500/15 text-amber-300",
  high: "bg-red-500/15 text-red-300",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Panel(_props: PanelProps) {
  const itemsQuery = trpc.work.list.useQuery(undefined, { retry: false });
  const utils = trpc.useUtils();
  const createTask = trpc.work.create.useMutation({ onSuccess: () => utils.work.list.invalidate() });
  const updateTask = trpc.work.update.useMutation({ onSuccess: () => utils.work.list.invalidate() });
  const deleteTask = trpc.work.delete.useMutation({ onSuccess: () => utils.work.list.invalidate() });

  const [draft, setDraft] = useState<{ title: string; priority: Priority }>({ title: "", priority: "medium" });
  const [showDraft, setShowDraft] = useState(false);

  const items = itemsQuery.data ?? [];
  const grouped = useMemo(() => {
    const map: Record<Status, typeof items> = { todo: [], in_progress: [], review: [], done: [] };
    for (const it of items) {
      const s = (it.status as Status) ?? "todo";
      if (map[s]) map[s].push(it);
    }
    return map;
  }, [items]);

  const move = (id: number, current: Status) => {
    const order: Status[] = ["todo", "in_progress", "review", "done"];
    const next = order[(order.indexOf(current) + 1) % order.length];
    updateTask.mutate({ id, status: next });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
            <ListTodo className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Takenblok</h2>
            <p className="text-xs text-slate-400">Kanban board — gevoed door dezelfde data als /werk</p>
          </div>
        </div>
        <button
          onClick={() => setShowDraft((v) => !v)}
          className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-[12px] font-semibold hover:bg-cyan-400 transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} /> Nieuwe taak
        </button>
      </div>

      {showDraft && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-semibold text-slate-200">Snel toevoegen</p>
            <button onClick={() => setShowDraft(false)} className="text-slate-500 hover:text-slate-300" aria-label="Sluiten">
              <X size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Wat moet er gebeuren?"
              onKeyDown={(e) => {
                if (e.key === "Enter" && draft.title.trim()) {
                  createTask.mutate({ title: draft.title.trim(), priority: draft.priority, status: "todo" });
                  setDraft({ title: "", priority: "medium" });
                }
              }}
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-[13px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
            <select
              aria-label="Prioriteit"
              value={draft.priority}
              onChange={(e) => setDraft({ ...draft, priority: e.target.value as Priority })}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-[13px] text-slate-100"
            >
              <option value="low">Laag</option>
              <option value="medium">Medium</option>
              <option value="high">Hoog</option>
            </select>
            <button
              disabled={!draft.title.trim() || createTask.isPending}
              onClick={() => {
                createTask.mutate({ title: draft.title.trim(), priority: draft.priority, status: "todo" });
                setDraft({ title: "", priority: "medium" });
              }}
              className="px-3 py-2 rounded-lg bg-cyan-500 text-slate-950 text-[12px] font-semibold hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {createTask.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Toevoegen
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {COLUMNS.map((col) => {
          const list = grouped[col.id];
          return (
            <div key={col.id} className={`rounded-xl bg-slate-900/40 border-t-2 ${col.accent} border-slate-800`}>
              <div className="px-3 py-2 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{col.label}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{list.length}</span>
              </div>
              <div className="p-2 space-y-2 min-h-[120px]">
                {itemsQuery.isLoading && col.id === "todo" ? (
                  <div className="py-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" /> Laden…
                  </div>
                ) : list.length === 0 ? (
                  <p className="text-center text-[11px] text-slate-600 py-6">—</p>
                ) : (
                  list.map((it) => (
                    <div key={it.id} className="group bg-slate-900 border border-slate-800 rounded-lg p-3 hover:border-cyan-500/40 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-[13px] font-medium leading-snug ${it.status === "done" ? "line-through text-slate-500" : "text-slate-100"}`}>
                          {it.title}
                        </p>
                        <button
                          onClick={() => deleteTask.mutate({ id: it.id })}
                          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                          aria-label="Verwijderen"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      {it.description && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{it.description}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${PRIO_BADGE[(it.priority as Priority) ?? "medium"]}`}>
                          {it.priority}
                        </span>
                        <button
                          onClick={() => move(it.id, (it.status as Status) ?? "todo")}
                          className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-0.5"
                          title="Volgende kolom"
                        >
                          <ArrowRight size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {itemsQuery.error && (
        <p className="text-[11px] text-red-400">
          Kon kanban niet laden: {itemsQuery.error.message}
        </p>
      )}
    </div>
  );
}
