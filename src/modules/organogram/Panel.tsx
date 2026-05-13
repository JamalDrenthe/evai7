import { useState, useMemo } from "react";
import { Network, Search, Star, Award, TrendingUp, Briefcase, Users, Target, UserPlus, User, Plus, Minus } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { PanelProps } from "../_types";

type RoleType =
  | "founder"
  | "cofounder"
  | "partner"
  | "csuite"
  | "director"
  | "manager"
  | "senior"
  | "recruitment";

type OrgNode = {
  role: string;
  type: RoleType;
  isEntry?: boolean;
  left?: Array<{ role: string; type: RoleType }>;
  right?: Array<{ role: string; type: RoleType }>;
  children?: OrgNode[];
};

const ORG: OrgNode = {
  role: "Founder",
  type: "founder",
  children: [
    {
      role: "Co-founder",
      type: "cofounder",
      left: [{ role: "Co-founder", type: "cofounder" }],
      right: [{ role: "Co-founder", type: "cofounder" }],
      children: [
        {
          role: "Partner",
          type: "partner",
          left: [{ role: "Senior Partner", type: "partner" }],
          right: [{ role: "Passive Partner", type: "partner" }],
          children: [
            {
              role: "CEO",
              type: "csuite",
              left: [{ role: "CTO", type: "csuite" }],
              right: [{ role: "COO", type: "csuite" }],
              children: [
                {
                  role: "Senior Director",
                  type: "director",
                  children: [
                    {
                      role: "Director",
                      type: "director",
                      children: [
                        {
                          role: "Senior Manager Director",
                          type: "director",
                          children: [
                            {
                              role: "Regio Manager",
                              type: "manager",
                              left: [{ role: "Team Manager", type: "manager" }],
                              right: [{ role: "Filiaal Manager", type: "manager" }],
                              children: [
                                {
                                  role: "Senior Consultant",
                                  type: "senior",
                                  left: [{ role: "Senior Closer", type: "senior" }],
                                  right: [{ role: "Consultant", type: "senior" }],
                                  children: [
                                    {
                                      role: "Head Hunter",
                                      type: "recruitment",
                                      children: [
                                        {
                                          role: "Trainee",
                                          type: "recruitment",
                                          children: [
                                            {
                                              role: "Ambassadeur",
                                              type: "recruitment",
                                              children: [
                                                {
                                                  role: "Kandidaat",
                                                  type: "recruitment",
                                                  isEntry: true,
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const TYPE_STYLES: Record<RoleType, string> = {
  founder: "bg-gradient-to-br from-yellow-500/20 to-amber-600/10 border-yellow-500/40 text-yellow-300",
  cofounder: "bg-slate-800/60 border-slate-700 text-slate-200",
  partner: "bg-amber-500/10 border-amber-500/30 text-amber-200",
  csuite: "bg-blue-500/10 border-blue-500/30 text-blue-200",
  director: "bg-indigo-500/10 border-indigo-500/30 text-indigo-200",
  manager: "bg-teal-500/10 border-teal-500/30 text-teal-200",
  senior: "bg-rose-500/10 border-rose-500/30 text-rose-200",
  recruitment: "bg-slate-900/60 border-slate-800 text-slate-400",
};

function getIcon(role: string) {
  const r = role.toLowerCase();
  if (r.includes("founder")) return <Star className="w-3.5 h-3.5" />;
  if (r.includes("ceo")) return <Award className="w-3.5 h-3.5" />;
  if (r.includes("cto") || r.includes("coo")) return <TrendingUp className="w-3.5 h-3.5" />;
  if (r.includes("partner")) return <Briefcase className="w-3.5 h-3.5" />;
  if (r.includes("manager")) return <Users className="w-3.5 h-3.5" />;
  if (r.includes("hunter") || r.includes("target")) return <Target className="w-3.5 h-3.5" />;
  if (r.includes("kandidaat")) return <UserPlus className="w-3.5 h-3.5" />;
  return <User className="w-3.5 h-3.5" />;
}

function NodeCard({
  data,
  isMain,
  isOpen,
  hasChildren,
  highlight,
  onClick,
}: {
  data: { role: string; type: RoleType };
  isMain?: boolean;
  isOpen?: boolean;
  hasChildren?: boolean;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${TYPE_STYLES[data.type]} ${isMain ? "min-w-[160px] shadow-lg" : "min-w-[130px] opacity-90"} ${highlight ? "ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950" : ""} ${isMain && hasChildren ? "cursor-pointer hover:scale-[1.02]" : ""}`}
        onClick={isMain && hasChildren ? onClick : undefined}
      >
        <div className="shrink-0">{getIcon(data.role)}</div>
        <div className="flex flex-col min-w-0">
          <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">Rol</span>
          <span className="font-bold text-[11px] leading-tight truncate">{data.role}</span>
        </div>
      </div>
      {isMain && hasChildren && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="absolute -bottom-2 z-10 bg-slate-900 border border-slate-700 rounded-full p-0.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
}

function RecursiveNode({ node, highlightRole }: { node: OrgNode; highlightRole?: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = !!node.children?.length;
  const left = node.left ?? [];
  const right = node.right ?? [];
  const hasSiblings = left.length + right.length > 0;
  const isHighlighted = highlightRole?.toLowerCase().trim() === node.role.toLowerCase();

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-start justify-center gap-4 py-1">
        {hasSiblings && (
          <div className="absolute top-5 left-6 right-6 h-px bg-slate-700/50 -z-0" />
        )}
        {left.map((s, i) => (
          <NodeCard
            key={`l-${i}`}
            data={s}
            highlight={highlightRole?.toLowerCase().trim() === s.role.toLowerCase()}
          />
        ))}
        <NodeCard
          data={node}
          isMain
          hasChildren={hasChildren}
          isOpen={isOpen}
          highlight={isHighlighted}
          onClick={() => setIsOpen((v) => !v)}
        />
        {right.map((s, i) => (
          <NodeCard
            key={`r-${i}`}
            data={s}
            highlight={highlightRole?.toLowerCase().trim() === s.role.toLowerCase()}
          />
        ))}
      </div>
      {hasChildren && isOpen && (
        <>
          <div className="h-4 w-px bg-slate-700/50" />
          <div className="flex gap-3">
            {node.children!.map((c, i) => (
              <RecursiveNode key={i} node={c} highlightRole={highlightRole} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Panel({ onResult }: PanelProps) {
  const [search, setSearch] = useState("");
  const queryRole = trpc.modules.invoke.useMutation();

  const summary = useMemo(() => {
    let total = 0;
    let depth = 0;
    const visit = (n: OrgNode, d: number) => {
      total += 1 + (n.left?.length ?? 0) + (n.right?.length ?? 0);
      depth = Math.max(depth, d);
      n.children?.forEach((c) => visit(c, d + 1));
    };
    visit(ORG, 0);
    return { total, depth };
  }, []);

  const handleSearch = () => {
    if (!search.trim()) return;
    queryRole.mutate(
      {
        moduleId: "organogram",
        capability: "query-role",
        input: { roleName: search },
      },
      {
        onSuccess: (result) => {
          if (result.ok) {
            onResult?.({ capability: "query-role", output: result.data });
          }
        },
      },
    );
  };

  const queryResult = queryRole.data?.ok ? (queryRole.data.data as { found: boolean; level?: number; path: string[] }) : undefined;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 pb-4 border-b border-purple-500/20">
        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
          <Network className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-white">Organogram</h2>
          <p className="text-xs text-slate-400">
            {summary.total} rollen · {summary.depth} niveaus
          </p>
        </div>
      </div>

      <div className="py-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Zoek rol (bijv. CEO, Partner, Manager)…"
            className="w-full pl-8 pr-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={!search.trim()}
          className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition"
        >
          Zoek
        </button>
      </div>

      {queryResult && (
        <div
          className={`mb-3 p-2.5 rounded-lg border text-[11px] ${
            queryResult.found
              ? "bg-purple-500/10 border-purple-500/30 text-purple-200"
              : "bg-rose-500/10 border-rose-500/30 text-rose-200"
          }`}
        >
          {queryResult.found ? (
            <>
              <span className="font-bold">Niveau {queryResult.level}</span> ·{" "}
              <span className="opacity-70">{queryResult.path.join(" → ")}</span>
            </>
          ) : (
            <>Rol niet gevonden in organogram</>
          )}
        </div>
      )}

      <div className="flex-1 overflow-auto min-h-0 -mx-4">
        <div className="px-4 py-2 min-w-max">
          <RecursiveNode node={ORG} highlightRole={queryResult?.found ? search : undefined} />
        </div>
      </div>
    </div>
  );
}
