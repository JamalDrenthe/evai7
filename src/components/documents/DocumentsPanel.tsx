import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  FileText,
  Code2,
  Info,
  BookOpen,
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  Pencil,
  X,
  Save,
} from "lucide-react";
import {
  COMPANIES,
  SECTIONS,
  SECTION_LABELS,
  type Company,
  type Section,
  type DocumentEntry,
  type DocumentKind,
  type DocumentLanguage,
} from "./documentsData";
import { SEED_DOCUMENTS } from "./seed";
import {
  loadDocuments,
  persistDocument,
  deleteDocument,
  persistAll,
  isSupabaseConfigured,
} from "./documentsStore";

const sectionIcon: Record<Section, React.ReactNode> = {
  codes: <Code2 size={14} />,
  informatie: <Info size={14} />,
  content: <BookOpen size={14} />,
};

export function DocumentsPanel() {
  const [documents, setDocuments] = useState<DocumentEntry[]>(() => [...SEED_DOCUMENTS]);
  const [company, setCompany] = useState<Company>("VVC");
  const [section, setSection] = useState<Section>("codes");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<DocumentEntry | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Initial load: Supabase if configured, else localStorage with seed fallback.
  useEffect(() => {
    let cancelled = false;
    loadDocuments().then((docs) => {
      if (!cancelled) {
        setDocuments(docs);
        setHydrated(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist localStorage snapshot (no-op when Supabase is the source of truth).
  useEffect(() => {
    if (!hydrated) return;
    persistAll(documents);
  }, [documents, hydrated]);

  // Counts per company+section
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of documents) {
      const key = `${d.company}-${d.section}`;
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [documents]);

  const companyDocs = useMemo(
    () => documents.filter((d) => d.company === company && d.section === section),
    [documents, company, section],
  );

  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return companyDocs;
    return companyDocs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        (d.language ?? "").toLowerCase().includes(q),
    );
  }, [companyDocs, query]);

  // Auto-select first doc when switching company/section
  useEffect(() => {
    if (selectedId && companyDocs.some((d) => d.id === selectedId)) return;
    setSelectedId(companyDocs[0]?.id ?? null);
  }, [company, section, companyDocs, selectedId]);

  const selected = documents.find((d) => d.id === selectedId) ?? null;

  const handleCopy = async () => {
    if (!selected) return;
    try {
      await navigator.clipboard.writeText(selected.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard may be blocked; ignore
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Document verwijderen?")) return;
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedId === id) setSelectedId(null);
    void deleteDocument(id);
  };

  const handleSave = (doc: DocumentEntry) => {
    const updated: DocumentEntry = { ...doc, updatedAt: Date.now() };
    setDocuments((prev) => {
      const exists = prev.some((d) => d.id === updated.id);
      if (exists) {
        return prev.map((d) => (d.id === updated.id ? updated : d));
      }
      return [...prev, updated];
    });
    setEditing(null);
    setShowNew(false);
    setSelectedId(updated.id);
    void persistDocument(updated);
  };

  const handleNew = () => {
    const draft: DocumentEntry = {
      id: `${company.toLowerCase()}-${section}-${Date.now()}`,
      company,
      section,
      title: "Nieuw document",
      kind: section === "codes" ? "code" : "text",
      language: section === "codes" ? "tsx" : "text",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setEditing(draft);
    setShowNew(true);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 text-slate-200">
      {/* Top bar: companies */}
      <div className="shrink-0 border-b border-slate-800 bg-slate-950/60 backdrop-blur">
        <div className="px-6 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mr-2 flex items-center gap-1.5 shrink-0">
            <Building2 size={12} />
            Bedrijven
            <span
              className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-mono ${
                isSupabaseConfigured()
                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                  : "bg-slate-800 text-slate-500 border border-slate-700"
              }`}
              title={isSupabaseConfigured() ? "Verbonden met Supabase" : "Lokale opslag (offline)"}
            >
              {isSupabaseConfigured() ? "● online" : "○ lokaal"}
            </span>
          </span>
          {COMPANIES.map((c) => {
            const total = SECTIONS.reduce((s, sec) => s + (counts[`${c}-${sec}`] ?? 0), 0);
            const active = c === company;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCompany(c)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex items-center gap-2 ${
                  active
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-inner"
                    : "bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {c}
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    active
                      ? "bg-cyan-500/20 text-cyan-300"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Section tabs */}
        <div className="px-6 pb-3 flex items-center gap-1">
          {SECTIONS.map((s) => {
            const active = s === section;
            const count = counts[`${company}-${s}`] ?? 0;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSection(s)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  active
                    ? "bg-white text-slate-900"
                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {sectionIcon[s]}
                {SECTION_LABELS[s]}
                <span
                  className={`text-[9px] font-mono px-1 py-0.5 rounded ${
                    active ? "bg-slate-900/10 text-slate-700" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          <div className="flex-1" />

          <button
            type="button"
            onClick={handleNew}
            className="px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/25 flex items-center gap-1.5 transition-all"
          >
            <Plus size={12} />
            Nieuw
          </button>
        </div>
      </div>

      {/* Main split: doc list + viewer */}
      <div className="flex-1 flex min-h-0">
        {/* Document list */}
        <div className="w-72 shrink-0 border-r border-slate-800 flex flex-col min-h-0">
          <div className="p-3 border-b border-slate-800 shrink-0">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                aria-label="Zoek documenten"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Zoek document…"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-md text-[12px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredDocs.length === 0 ? (
              <div className="text-center py-10 px-4">
                <FileText className="w-8 h-8 mx-auto text-slate-700 mb-2" />
                <p className="text-[12px] text-slate-500 font-medium">
                  Geen documenten in {company} / {SECTION_LABELS[section]}
                </p>
                <button
                  type="button"
                  onClick={handleNew}
                  className="mt-3 text-[11px] font-bold text-cyan-400 hover:text-cyan-300"
                >
                  Voeg eerste document toe
                </button>
              </div>
            ) : (
              filteredDocs.map((d) => {
                const active = d.id === selectedId;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedId(d.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all group ${
                      active
                        ? "bg-cyan-500/10 border-cyan-500/40 text-white"
                        : "bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div
                        className={`mt-0.5 w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          active
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {sectionIcon[d.section]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-bold truncate">{d.title}</div>
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {d.language ?? d.kind}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Viewer */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center max-w-sm px-6">
                <FileText className="w-12 h-12 mx-auto text-slate-700 mb-3" />
                <h3 className="text-slate-300 font-bold">Geen document geselecteerd</h3>
                <p className="text-[12px] text-slate-500 mt-1">
                  Kies een document links of maak er een nieuw aan.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="shrink-0 border-b border-slate-800 px-6 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-white truncate">{selected.title}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selected.company} • {SECTION_LABELS[selected.section]} •{" "}
                    {selected.language ?? selected.kind}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-all"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Gekopieerd" : "Kopieer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(selected)}
                    className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Pencil size={12} />
                    Bewerk
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(selected.id)}
                    className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 size={12} />
                    Verwijder
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto min-h-0 bg-slate-900">
                {selected.kind === "code" ? (
                  <pre className="p-6 text-[12px] text-slate-200 font-mono leading-relaxed whitespace-pre">
                    <code>{selected.content}</code>
                  </pre>
                ) : (
                  <div className="p-6 text-[13px] text-slate-200 leading-relaxed whitespace-pre-wrap max-w-3xl">
                    {selected.content || (
                      <span className="text-slate-500 italic">Nog geen inhoud.</span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit / New modal */}
      {editing && (
        <DocumentEditor
          initial={editing}
          isNew={showNew}
          onSave={handleSave}
          onCancel={() => {
            setEditing(null);
            setShowNew(false);
          }}
        />
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

type EditorProps = {
  initial: DocumentEntry;
  isNew: boolean;
  onSave: (doc: DocumentEntry) => void;
  onCancel: () => void;
};

const LANGUAGES: DocumentLanguage[] = [
  "tsx",
  "jsx",
  "typescript",
  "javascript",
  "html",
  "css",
  "json",
  "markdown",
  "text",
];
const KINDS: DocumentKind[] = ["code", "markdown", "text"];

function DocumentEditor({ initial, isNew, onSave, onCancel }: EditorProps) {
  const [title, setTitle] = useState(initial.title);
  const [company, setCompany] = useState<Company>(initial.company);
  const [section, setSection] = useState<Section>(initial.section);
  const [kind, setKind] = useState<DocumentKind>(initial.kind);
  const [language, setLanguage] = useState<DocumentLanguage>(initial.language ?? "tsx");
  const [content, setContent] = useState(initial.content);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      ...initial,
      title: title.trim(),
      company,
      section,
      kind,
      language: kind === "code" ? language : undefined,
      content,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="shrink-0 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              {isNew ? "Nieuw document" : "Document bewerken"}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {company} • {SECTION_LABELS[section]}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Sluit"
            className="p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Bedrijf
              </label>
              <select
                aria-label="Bedrijf"
                value={company}
                onChange={(e) => setCompany(e.target.value as Company)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-[12px] text-slate-200"
              >
                {COMPANIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Sectie
              </label>
              <select
                aria-label="Sectie"
                value={section}
                onChange={(e) => setSection(e.target.value as Section)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-[12px] text-slate-200"
              >
                {SECTIONS.map((s) => (
                  <option key={s} value={s}>
                    {SECTION_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Titel
            </label>
            <input
              type="text"
              aria-label="Document titel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bv. Inlog, Onboarding flow…"
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-[13px] text-slate-200 placeholder:text-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Type
              </label>
              <select
                aria-label="Type"
                value={kind}
                onChange={(e) => setKind(e.target.value as DocumentKind)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-[12px] text-slate-200"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            {kind === "code" && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Taal
                </label>
                <select
                  aria-label="Taal"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as DocumentLanguage)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1.5 text-[12px] text-slate-200"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Inhoud
            </label>
            <textarea
              aria-label="Document inhoud"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              className={`w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-[12px] text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 ${
                kind === "code" ? "font-mono" : ""
              }`}
              placeholder={
                kind === "code" ? "// Plak hier je code…" : "Schrijf hier je inhoud…"
              }
            />
          </div>
        </div>

        <div className="shrink-0 px-5 py-4 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 text-[12px] font-bold"
          >
            Annuleer
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-3 py-1.5 rounded-md bg-cyan-500 text-slate-900 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[12px] font-bold flex items-center gap-1.5"
          >
            <Save size={12} />
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
