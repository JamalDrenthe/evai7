import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Network,
  ChevronDown,
  ChevronRight,
  User,
  Crown,
  Shield,
  Briefcase,
  Users,
  Phone,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";
import {
  DEFAULT_NODES,
  loadNodes,
  persistNode,
  deleteNode,
  reparentChildren,
  persistAll,
  isSupabaseConfigured,
  type OrgIconKey,
  type OrgNode,
} from "./organogramStore";

const ICON_OPTIONS: { key: OrgIconKey; label: string; node: React.ReactNode }[] = [
  { key: "user", label: "Medewerker", node: <User size={14} /> },
  { key: "crown", label: "Founder", node: <Crown size={14} /> },
  { key: "shield", label: "Directeur", node: <Shield size={14} /> },
  { key: "briefcase", label: "Manager", node: <Briefcase size={14} /> },
  { key: "users", label: "Team", node: <Users size={14} /> },
  { key: "phone", label: "Verkoop", node: <Phone size={14} /> },
];

const COLOR_OPTIONS: { value: string; label: string }[] = [
  { value: "#141b28", label: "Founder" },
  { value: "#7a56f6", label: "Directeur" },
  { value: "#3b82f6", label: "Manager" },
  { value: "#10b981", label: "Actief" },
  { value: "#f59e0b", label: "Stage" },
  { value: "#ef4444", label: "Urgent" },
];

function iconFor(key: OrgIconKey, size = 16): React.ReactNode {
  switch (key) {
    case "crown":
      return <Crown size={size} />;
    case "shield":
      return <Shield size={size} />;
    case "briefcase":
      return <Briefcase size={size} />;
    case "users":
      return <Users size={size} />;
    case "phone":
      return <Phone size={size} />;
    default:
      return <User size={size} />;
  }
}

type Tree = {
  node: OrgNode;
  children: Tree[];
};

function buildTree(nodes: OrgNode[]): Tree[] {
  const byId = new Map<string, Tree>();
  for (const n of nodes) byId.set(n.id, { node: n, children: [] });
  const roots: Tree[] = [];
  for (const n of nodes) {
    const self = byId.get(n.id)!;
    if (n.parentId && byId.has(n.parentId)) {
      byId.get(n.parentId)!.children.push(self);
    } else {
      roots.push(self);
    }
  }
  return roots;
}

type NodeAction = "add" | "edit" | "delete";

function OrgNodeComponent({
  tree,
  depth,
  onAction,
}: {
  tree: Tree;
  depth: number;
  onAction: (action: NodeAction, node: OrgNode) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = tree.children.length > 0;
  const { node } = tree;

  return (
    <div className={depth > 0 ? "ml-6 border-l-2 border-[var(--eva-border-subtle)]" : ""}>
      <div
        className={`group flex items-center gap-3 py-2.5 px-3 rounded-xl transition-colors hover:bg-[var(--eva-canvas)] ${
          depth > 0 ? "ml-4" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => hasChildren && setExpanded(!expanded)}
          className={`w-5 h-5 flex items-center justify-center text-[var(--eva-text-muted)] shrink-0 ${
            hasChildren ? "cursor-pointer" : "opacity-0"
          }`}
          aria-label={expanded ? "Inklappen" : "Uitklappen"}
        >
          {hasChildren && (expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </button>

        {/* eslint-disable-next-line react/forbid-component-props */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: node.color }}
        >
          {iconFor(node.iconKey, 16)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[var(--eva-text-primary)] truncate">
            {node.name}
          </p>
          <p className="text-[11px] text-[var(--eva-text-muted)] truncate">{node.role}</p>
        </div>

        <span
          className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
            node.role.toLowerCase().includes("stage")
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {node.role.toLowerCase().includes("stage") ? "Stage" : "Actief"}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onAction("add", node)}
            className="p-1.5 rounded-md bg-[var(--eva-canvas)] hover:bg-[var(--eva-primary)]/10 text-[var(--eva-text-muted)] hover:text-[var(--eva-primary)]"
            aria-label="Voeg subpersoon toe"
            title="Voeg toe onder"
          >
            <Plus size={13} />
          </button>
          <button
            type="button"
            onClick={() => onAction("edit", node)}
            className="p-1.5 rounded-md bg-[var(--eva-canvas)] hover:bg-[var(--eva-primary)]/10 text-[var(--eva-text-muted)] hover:text-[var(--eva-primary)]"
            aria-label="Bewerk"
            title="Bewerk"
          >
            <Pencil size={13} />
          </button>
          <button
            type="button"
            onClick={() => onAction("delete", node)}
            className="p-1.5 rounded-md bg-[var(--eva-canvas)] hover:bg-red-500/10 text-[var(--eva-text-muted)] hover:text-red-500"
            aria-label="Verwijder"
            title="Verwijder"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="mt-1">
          {tree.children.map((child) => (
            <OrgNodeComponent
              key={child.node.id}
              tree={child}
              depth={depth + 1}
              onAction={onAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RightPanel({ nodes, onAdd }: { nodes: OrgNode[]; onAdd: () => void }) {
  const total = nodes.length;
  const layers = new Set(nodes.map((n) => n.level)).size;
  const active = nodes.filter((n) => !n.role.toLowerCase().includes("stage")).length;
  const stage = nodes.filter((n) => n.role.toLowerCase().includes("stage")).length;
  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onAdd}
        className="w-full bg-[var(--eva-primary)] hover:bg-[var(--eva-primary)]/90 text-white rounded-2xl p-4 flex items-center justify-center gap-2 font-semibold text-sm transition-all shadow-sm hover:shadow-md"
      >
        <Plus size={16} />
        Nieuwe persoon
      </button>

      <div className="bg-gradient-to-br from-[#7a56f6]/10 to-[#7a56f6]/5 rounded-2xl p-5 border border-[#7a56f6]/20">
        <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-2">Organisatie</h3>
        <p className="text-[12px] text-[var(--eva-text-secondary)] mb-3">
          Volledige structuur van het bedrijf
        </p>
        <div className="space-y-1.5">
          {COLOR_OPTIONS.map((c) => (
            <div key={c.value} className="flex items-center gap-2 text-[12px]">
              {/* eslint-disable-next-line react/forbid-component-props */}
              <div className="w-3 h-3 rounded" style={{ backgroundColor: c.value }} />
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
        <h3 className="text-[11px] font-semibold text-[var(--eva-text-muted)] uppercase tracking-wider mb-3">
          Statistieken
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-[var(--eva-canvas)] rounded-xl">
            <p className="text-xl font-bold text-[var(--eva-primary)]">{total}</p>
            <p className="text-[10px] text-[var(--eva-text-muted)]">Totaal</p>
          </div>
          <div className="text-center p-3 bg-[var(--eva-canvas)] rounded-xl">
            <p className="text-xl font-bold text-[#7a56f6]">{layers}</p>
            <p className="text-[10px] text-[var(--eva-text-muted)]">Lagen</p>
          </div>
          <div className="text-center p-3 bg-[var(--eva-canvas)] rounded-xl">
            <p className="text-xl font-bold text-[#10b981]">{active}</p>
            <p className="text-[10px] text-[var(--eva-text-muted)]">Actief</p>
          </div>
          <div className="text-center p-3 bg-[var(--eva-canvas)] rounded-xl">
            <p className="text-xl font-bold text-[#f59e0b]">{stage}</p>
            <p className="text-[10px] text-[var(--eva-text-muted)]">Stage</p>
          </div>
        </div>
      </div>
    </div>
  );
}

type EditorMode = { kind: "closed" } | { kind: "add"; parentId: string | null } | { kind: "edit"; node: OrgNode };

function NodeEditor({
  mode,
  allNodes,
  onSave,
  onCancel,
}: {
  mode: EditorMode;
  allNodes: OrgNode[];
  onSave: (node: OrgNode) => void;
  onCancel: () => void;
}) {
  const existing = mode.kind === "edit" ? mode.node : null;
  const parentId = mode.kind === "add" ? mode.parentId : existing?.parentId ?? null;

  const parent = parentId ? allNodes.find((n) => n.id === parentId) ?? null : null;
  const defaultLevel = existing ? existing.level : parent ? parent.level + 1 : 0;

  const [name, setName] = useState(existing?.name ?? "");
  const [role, setRole] = useState(existing?.role ?? "");
  const [color, setColor] = useState(existing?.color ?? COLOR_OPTIONS[3].value);
  const [iconKey, setIconKey] = useState<OrgIconKey>(existing?.iconKey ?? "user");
  const [selectedParentId, setSelectedParentId] = useState<string | "">(parentId ?? "");

  // Prevent picking self/descendants as parent when editing
  const invalidParents = useMemo(() => {
    if (!existing) return new Set<string>();
    const forbidden = new Set<string>([existing.id]);
    const dfs = (id: string) => {
      for (const n of allNodes) {
        if (n.parentId === id && !forbidden.has(n.id)) {
          forbidden.add(n.id);
          dfs(n.id);
        }
      }
    };
    dfs(existing.id);
    return forbidden;
  }, [existing, allNodes]);

  const handleSave = () => {
    if (!name.trim() || !role.trim()) return;
    const nextParentId: string | null = selectedParentId === "" ? null : selectedParentId;
    const nextParent = nextParentId ? allNodes.find((n) => n.id === nextParentId) : null;
    const level = nextParent ? nextParent.level + 1 : 0;
    onSave({
      id: existing?.id ?? `n-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      level: existing && existing.parentId === nextParentId ? existing.level : level || defaultLevel,
      color,
      iconKey,
      parentId: nextParentId,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-[var(--eva-border-subtle)]">
        <div className="px-5 py-4 border-b border-[var(--eva-border-subtle)] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--eva-text-primary)]">
            {existing ? "Persoon bewerken" : "Nieuwe persoon"}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Sluit"
            className="p-1.5 rounded-md text-[var(--eva-text-muted)] hover:text-[var(--eva-text-primary)] hover:bg-[var(--eva-canvas)]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--eva-text-muted)] mb-1">
              Naam
            </label>
            <input
              type="text"
              aria-label="Naam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Voor- en achternaam"
              className="w-full px-3 py-2 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-lg text-[13px] text-[var(--eva-text-primary)]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--eva-text-muted)] mb-1">
              Functie / Rol
            </label>
            <input
              type="text"
              aria-label="Functie"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Bv. Verkoop Manager"
              className="w-full px-3 py-2 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-lg text-[13px] text-[var(--eva-text-primary)]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--eva-text-muted)] mb-1">
              Rapporteert aan
            </label>
            <select
              aria-label="Rapporteert aan"
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-lg text-[13px] text-[var(--eva-text-primary)]"
            >
              <option value="">— Geen (top-niveau) —</option>
              {allNodes
                .filter((n) => !invalidParents.has(n.id))
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {"— ".repeat(n.level)}
                    {n.name} ({n.role})
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--eva-text-muted)] mb-1">
                Kleur
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all ${
                      color === c.value
                        ? "border-[var(--eva-text-primary)] scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.value }}
                    aria-label={c.label}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--eva-text-muted)] mb-1">
                Icoon
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ICON_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setIconKey(opt.key)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      iconKey === opt.key
                        ? "bg-[var(--eva-primary)] text-white"
                        : "bg-[var(--eva-canvas)] text-[var(--eva-text-muted)] hover:text-[var(--eva-text-primary)]"
                    }`}
                    aria-label={opt.label}
                    title={opt.label}
                  >
                    {opt.node}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[var(--eva-border-subtle)] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-[var(--eva-canvas)] text-[var(--eva-text-secondary)] hover:bg-[var(--eva-border-subtle)] text-[12px] font-semibold"
          >
            Annuleer
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim() || !role.trim()}
            className="px-3 py-1.5 rounded-lg bg-[var(--eva-primary)] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[12px] font-semibold flex items-center gap-1.5"
          >
            <Save size={12} />
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

export function Organigram() {
  const [nodes, setNodes] = useState<OrgNode[]>(() => [...DEFAULT_NODES]);
  const [editor, setEditor] = useState<EditorMode>({ kind: "closed" });
  const [hydrated, setHydrated] = useState(false);

  // Initial load: Supabase if configured, else localStorage with DEFAULT_NODES.
  useEffect(() => {
    let cancelled = false;
    loadNodes().then((loaded) => {
      if (!cancelled) {
        setNodes(loaded);
        setHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // localStorage snapshot only (no-op when Supabase is the source of truth).
  useEffect(() => {
    if (!hydrated) return;
    persistAll(nodes);
  }, [nodes, hydrated]);

  const trees = useMemo(() => buildTree(nodes), [nodes]);

  const handleAction = (action: NodeAction, node: OrgNode) => {
    if (action === "add") {
      setEditor({ kind: "add", parentId: node.id });
      return;
    }
    if (action === "edit") {
      setEditor({ kind: "edit", node });
      return;
    }
    if (action === "delete") {
      if (!confirm(`"${node.name}" verwijderen? Subpersonen schuiven omhoog.`)) return;
      setNodes((prev) => {
        const removed = prev.filter((n) => n.id !== node.id);
        // Reassign children's parentId to the deleted node's parent
        return removed.map((n) =>
          n.parentId === node.id ? { ...n, parentId: node.parentId, level: Math.max(0, n.level - 1) } : n,
        );
      });
      void reparentChildren(node.id, node.parentId);
      void deleteNode(node.id);
    }
  };

  const handleSave = (saved: OrgNode) => {
    setNodes((prev) => {
      const exists = prev.some((n) => n.id === saved.id);
      if (exists) {
        // Re-level descendants if parent changed
        const previous = prev.find((n) => n.id === saved.id)!;
        const parentChanged = previous.parentId !== saved.parentId;
        const next = prev.map((n) => (n.id === saved.id ? saved : n));
        if (!parentChanged) return next;
        return recomputeLevels(next);
      }
      return [...prev, saved];
    });
    setEditor({ kind: "closed" });
    void persistNode(saved);
  };

  return (
    <AppLayout rightPanel={<RightPanel nodes={nodes} onAdd={() => setEditor({ kind: "add", parentId: null })} />}>
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[12px] text-[var(--eva-text-muted)]">
          <span className="text-[var(--eva-text-secondary)]">Organigram</span>
          <span className="mx-2">/</span>
          <span>Structuur</span>
        </nav>
        <button
          type="button"
          onClick={() => setEditor({ kind: "add", parentId: null })}
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--eva-primary)] text-white text-[12px] font-semibold hover:opacity-90"
        >
          <Plus size={14} />
          Nieuwe persoon
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <Network size={24} className="text-[#7a56f6]" />
        <div>
          <h1 className="text-xl font-semibold text-[var(--eva-text-primary)] flex items-center gap-2">
            Organisatiestructuur
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${
                isSupabaseConfigured()
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-500 border border-slate-200"
              }`}
              title={isSupabaseConfigured() ? "Verbonden met Supabase" : "Lokale opslag (offline)"}
            >
              {isSupabaseConfigured() ? "● online" : "○ lokaal"}
            </span>
          </h1>
          <p className="text-[12px] text-[var(--eva-text-secondary)]">
            Hover over een rij voor acties · klik op de chevron om in- en uit te klappen
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
        {trees.length === 0 ? (
          <div className="text-center py-12">
            <Network className="w-10 h-10 mx-auto text-[var(--eva-text-muted)] mb-2" />
            <p className="text-sm text-[var(--eva-text-secondary)]">Geen personen toegevoegd.</p>
            <button
              type="button"
              onClick={() => setEditor({ kind: "add", parentId: null })}
              className="mt-3 text-[12px] font-semibold text-[var(--eva-primary)] hover:underline"
            >
              Voeg eerste persoon toe
            </button>
          </div>
        ) : (
          trees.map((tree) => (
            <OrgNodeComponent
              key={tree.node.id}
              tree={tree}
              depth={0}
              onAction={handleAction}
            />
          ))
        )}
      </div>

      {editor.kind !== "closed" && (
        <NodeEditor
          mode={editor}
          allNodes={nodes}
          onSave={handleSave}
          onCancel={() => setEditor({ kind: "closed" })}
        />
      )}
    </AppLayout>
  );
}

function recomputeLevels(nodes: OrgNode[]): OrgNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const cache = new Map<string, number>();
  const getLevel = (id: string): number => {
    if (cache.has(id)) return cache.get(id)!;
    const n = byId.get(id);
    if (!n || !n.parentId) {
      cache.set(id, 0);
      return 0;
    }
    const lvl = getLevel(n.parentId) + 1;
    cache.set(id, lvl);
    return lvl;
  };
  return nodes.map((n) => ({ ...n, level: getLevel(n.id) }));
}
