import { getSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import type {
  Company,
  DocumentEntry,
  DocumentKind,
  DocumentLanguage,
  Section,
} from "./documentsData";
import { SEED_DOCUMENTS } from "./seed";

const STORAGE_KEY = "eva-documents-v1";
const TABLE = "workspace_documents";

type DocumentRow = {
  id: string;
  company: Company;
  section: Section;
  title: string;
  kind: DocumentKind;
  language: DocumentLanguage | null;
  content: string;
  created_at: string;
  updated_at: string;
};

function rowToEntry(row: DocumentRow): DocumentEntry {
  return {
    id: row.id,
    company: row.company,
    section: row.section,
    title: row.title,
    kind: row.kind,
    language: row.language ?? undefined,
    content: row.content,
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
  };
}

function entryToRow(entry: DocumentEntry): Omit<DocumentRow, "created_at" | "updated_at"> {
  return {
    id: entry.id,
    company: entry.company,
    section: entry.section,
    title: entry.title,
    kind: entry.kind,
    language: entry.language ?? null,
    content: entry.content,
  };
}

// ── localStorage fallback ────────────────────────────────────────
function loadLocal(): DocumentEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...SEED_DOCUMENTS];
    const parsed = JSON.parse(raw) as DocumentEntry[];
    if (!Array.isArray(parsed)) return [...SEED_DOCUMENTS];
    return parsed;
  } catch {
    return [...SEED_DOCUMENTS];
  }
}

function saveLocal(docs: DocumentEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  } catch {
    // ignore quota / private mode
  }
}

// ── Supabase implementation ──────────────────────────────────────
async function loadRemote(): Promise<DocumentEntry[]> {
  const sb = getSupabase();
  if (!sb) return loadLocal();

  const { data, error } = await sb.from(TABLE).select("*").order("created_at", { ascending: true });
  if (error) {
    console.warn("[documentsStore] load failed, falling back to localStorage", error);
    return loadLocal();
  }

  const rows = (data ?? []) as DocumentRow[];

  // First-run: seed remote table from SEED_DOCUMENTS so VVC > Codes works out of the box.
  if (rows.length === 0) {
    const payload = SEED_DOCUMENTS.map((d) => entryToRow(d));
    const { error: seedError } = await sb.from(TABLE).insert(payload);
    if (!seedError) return [...SEED_DOCUMENTS];
    console.warn("[documentsStore] seed failed, using local seed only", seedError);
    return [...SEED_DOCUMENTS];
  }

  return rows.map(rowToEntry);
}

async function upsertRemote(entry: DocumentEntry): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from(TABLE).upsert(entryToRow(entry), { onConflict: "id" });
  if (error) console.warn("[documentsStore] upsert failed", error);
}

async function deleteRemote(id: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  const { error } = await sb.from(TABLE).delete().eq("id", id);
  if (error) console.warn("[documentsStore] delete failed", error);
}

// ── Public API ───────────────────────────────────────────────────
export async function loadDocuments(): Promise<DocumentEntry[]> {
  if (isSupabaseConfigured()) return loadRemote();
  return loadLocal();
}

export async function persistDocument(entry: DocumentEntry): Promise<void> {
  if (isSupabaseConfigured()) {
    await upsertRemote(entry);
    return;
  }
  // localStorage path: caller passes full updated list separately via persistAll
}

export async function deleteDocument(id: string): Promise<void> {
  if (isSupabaseConfigured()) {
    await deleteRemote(id);
    return;
  }
  // localStorage path: caller persists full list via persistAll
}

/** localStorage-only: persist the full in-memory list. No-op when Supabase is configured. */
export function persistAll(docs: DocumentEntry[]) {
  if (isSupabaseConfigured()) return;
  saveLocal(docs);
}

export { isSupabaseConfigured };
