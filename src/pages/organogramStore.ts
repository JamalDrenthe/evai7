import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";

export type OrgIconKey =
  | "user"
  | "crown"
  | "shield"
  | "briefcase"
  | "users"
  | "phone";

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  level: number;
  color: string;
  iconKey: OrgIconKey;
  parentId: string | null;
}

const STORAGE_KEY = "eva-organogram-v1";
const TABLE = "organogram_nodes";

type OrgRow = {
  id: string;
  name: string;
  role: string;
  level: number;
  color: string;
  icon_key: OrgIconKey;
  parent_id: string | null;
  order_index: number;
};

function rowToNode(row: OrgRow): OrgNode {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    level: row.level,
    color: row.color,
    iconKey: row.icon_key,
    parentId: row.parent_id,
  };
}

function nodeToRow(node: OrgNode, orderIndex = 0): OrgRow {
  return {
    id: node.id,
    name: node.name,
    role: node.role,
    level: node.level,
    color: node.color,
    icon_key: node.iconKey,
    parent_id: node.parentId,
    order_index: orderIndex,
  };
}

export const DEFAULT_NODES: OrgNode[] = [
  { id: "1", name: "Rico van de Wiel", role: "Founder", level: 0, color: "#141b28", iconKey: "crown", parentId: null },
  { id: "2", name: "Gianni ten Dam", role: "Algemeen Directeur", level: 1, color: "#7a56f6", iconKey: "shield", parentId: "1" },
  { id: "3", name: "Brian Hooiveld", role: "Verkoop Manager", level: 2, color: "#3b82f6", iconKey: "phone", parentId: "2" },
  { id: "4", name: "Richard Rodriguez", role: "Verkoop", level: 3, color: "#10b981", iconKey: "user", parentId: "3" },
  { id: "5", name: "Jean-Pierre Meijer", role: "Verkoop", level: 3, color: "#10b981", iconKey: "user", parentId: "3" },
  { id: "6", name: "Gera van Hees", role: "Human Resources Manager", level: 2, color: "#3b82f6", iconKey: "users", parentId: "2" },
  { id: "7", name: "Lobke Renken", role: "Stage (HR)", level: 3, color: "#f59e0b", iconKey: "user", parentId: "6" },
  { id: "8", name: "Gidi Meesters", role: "Technical Manager", level: 2, color: "#3b82f6", iconKey: "briefcase", parentId: "2" },
  { id: "9", name: "Lina Al-Ghadban", role: "UI/UX Design", level: 3, color: "#10b981", iconKey: "user", parentId: "8" },
  { id: "10", name: "Team", role: "Creative Team", level: 2, color: "#3b82f6", iconKey: "users", parentId: "2" },
  { id: "11", name: "Shania Otten", role: "Content Manager", level: 3, color: "#10b981", iconKey: "user", parentId: "10" },
  { id: "12", name: "Sharik Bourik", role: "Communicatie", level: 3, color: "#10b981", iconKey: "user", parentId: "10" },
  { id: "13", name: "Sunnie Moise", role: "Stage Communicatie", level: 3, color: "#f59e0b", iconKey: "user", parentId: "10" },
];

// ── localStorage fallback ────────────────────────────────────────
function loadLocal(): OrgNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_NODES];
    const parsed = JSON.parse(raw) as OrgNode[];
    if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_NODES];
    return parsed;
  } catch {
    return [...DEFAULT_NODES];
  }
}

function saveLocal(nodes: OrgNode[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
  } catch {
    // ignore
  }
}

// ── Supabase implementation ──────────────────────────────────────
async function loadRemote(): Promise<OrgNode[]> {
  const sb = getSupabase();
  if (!sb) return loadLocal();

  const { data, error } = await sb
    .from(TABLE)
    .select("*")
    .order("order_index", { ascending: true });

  if (error) {
    console.warn("[organogramStore] load failed, falling back to localStorage", error);
    return loadLocal();
  }

  const rows = (data ?? []) as OrgRow[];

  // First-run seed: insert defaults so the page is never empty.
  if (rows.length === 0) {
    const payload = DEFAULT_NODES.map((n, i) => nodeToRow(n, i));
    const { error: seedError } = await sb.from(TABLE).insert(payload);
    if (!seedError) return [...DEFAULT_NODES];
    console.warn("[organogramStore] seed failed, using local defaults only", seedError);
    return [...DEFAULT_NODES];
  }

  return rows.map(rowToNode);
}

async function upsertRemote(node: OrgNode, orderIndex = 0): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from(TABLE).upsert(nodeToRow(node, orderIndex), { onConflict: "id" });
  if (error) console.warn("[organogramStore] upsert failed", error);
}

async function deleteRemote(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from(TABLE).delete().eq("id", id);
  if (error) console.warn("[organogramStore] delete failed", error);
}

async function bulkUpdateParentRemote(
  oldParentId: string,
  newParentId: string | null,
  levelDelta: number,
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { data, error: selectError } = await sb
    .from(TABLE)
    .select("id, level")
    .eq("parent_id", oldParentId);
  if (selectError) {
    console.warn("[organogramStore] bulk update select failed", selectError);
    return;
  }
  const rows = (data ?? []) as Array<{ id: string; level: number }>;
  for (const row of rows) {
    const { error } = await sb
      .from(TABLE)
      .update({ parent_id: newParentId, level: Math.max(0, row.level + levelDelta) })
      .eq("id", row.id);
    if (error) console.warn("[organogramStore] bulk update failed for", row.id, error);
  }
}

// ── Public API ───────────────────────────────────────────────────
export async function loadNodes(): Promise<OrgNode[]> {
  if (isSupabaseConfigured()) return loadRemote();
  return loadLocal();
}

export async function persistNode(node: OrgNode): Promise<void> {
  if (isSupabaseConfigured()) {
    await upsertRemote(node);
    return;
  }
}

export async function deleteNode(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await deleteRemote(id);
    return;
  }
}

export async function reparentChildren(
  oldParentId: string,
  newParentId: string | null,
): Promise<void> {
  if (isSupabaseConfigured()) {
    await bulkUpdateParentRemote(oldParentId, newParentId, -1);
    return;
  }
}

/** localStorage-only: persist the full in-memory list. No-op when Supabase is configured. */
export function persistAll(nodes: OrgNode[]) {
  if (isSupabaseConfigured()) return;
  saveLocal(nodes);
}

export { isSupabaseConfigured };
