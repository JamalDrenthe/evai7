/* 
 * Note: This file uses inline styles for dynamic color values that cannot 
 * be expressed in static CSS. These are necessary for the dynamic nature of the tools.
 */
import { useState } from "react";
import { Link } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { trpc } from "@/providers/trpc";
import {
  Search,
  Calculator,
  TrendingUp,
  Wallet,
  Users,
  CheckSquare,
  Network,
  MessageSquare,
  Bot,
  Truck,
  Search as SearchIcon,
  MessageCircle,
  Mic,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const categoryTabs = [
  { label: "Alle", value: "all" },
  { label: "Calculators", value: "calculator" },
  { label: "Chatbots", value: "chatbot" },
  { label: "Productiviteit", value: "productivity" },
  { label: "Veiligheid", value: "security" },
];

const iconMap: Record<string, React.ReactNode> = {
  Calculator: <Calculator size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  Wallet: <Wallet size={20} />,
  Users: <Users size={20} />,
  CheckSquare: <CheckSquare size={20} />,
  Network: <Network size={20} />,
  MessageSquare: <MessageSquare size={20} />,
  Bot: <Bot size={20} />,
  Truck: <Truck size={20} />,
  Search: <SearchIcon size={20} />,
  MessageCircle: <MessageCircle size={20} />,
  Mic: <Mic size={20} />,
};

const categoryColors: Record<string, string> = {
  calculator: "#3b82f6",
  chatbot: "#7a56f6",
  productivity: "#10b981",
  security: "#ef4444",
  ai: "#f59e0b",
};

function RightPanel() {
  const toolsQuery = trpc.tools.list.useQuery();
  const activeTools = toolsQuery.data?.filter((t) => t.status === "active") || [];

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-[#3b82f6]/10 to-[#3b82f6]/5 rounded-2xl p-5 border border-[#3b82f6]/20">
        <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-2">Gereedschap Hub</h3>
        <p className="text-[12px] text-[var(--eva-text-secondary)] mb-3">
          Alle je tools op één plek. Kies een tool om te starten.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#3b82f6]">{activeTools.length}</span>
          <span className="text-[11px] text-[var(--eva-text-muted)]">actieve tools</span>
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-semibold text-[var(--eva-text-muted)] uppercase tracking-wider mb-2">
          Snelle links
        </h3>
        <div className="space-y-1 max-h-[400px] overflow-y-auto">
          {activeTools.map((tool) => {
            const color = categoryColors[tool.category] || "#7a56f6";
            return (
              <Link
                key={tool.id}
                to={`/tools/${tool.slug}`}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] text-[var(--eva-text-secondary)] hover:bg-[var(--eva-canvas)] transition-colors group"
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="flex-1 truncate">{tool.name}</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--eva-text-muted)] shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Tools() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const toolsQuery = trpc.tools.list.useQuery();
  const tools = toolsQuery.data ?? [];

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <AppLayout rightPanel={<RightPanel />}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[12px] text-[var(--eva-text-muted)]">
          <span className="text-[var(--eva-text-secondary)]">Gereedschap</span>
          <span className="mx-2">/</span>
          <span>Alle tools</span>
        </nav>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--eva-text-primary)]">Alle tools</h1>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--eva-text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Zoeken in tools..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-[var(--eva-border-subtle)] rounded-xl text-sm text-[var(--eva-text-primary)] placeholder:text-[var(--eva-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30 focus:border-[var(--eva-accent)] transition-all"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-auto pb-1">
        {categoryTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveCategory(tab.value)}
            className={`px-4 py-2 rounded-xl text-[12px] font-medium transition-colors whitespace-nowrap ${
              activeCategory === tab.value
                ? "bg-[var(--eva-primary)] text-white"
                : "bg-white border border-[var(--eva-border-subtle)] text-[var(--eva-text-secondary)] hover:bg-[var(--eva-canvas)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tool Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTools.map((tool) => {
          const color = categoryColors[tool.category] || "#7a56f6";
          return (
            <Link
              key={tool.id}
              to={`/tools/${tool.slug}`}
              className="eva-card bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5 hover:border-[var(--eva-accent)]/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {iconMap[tool.icon || ""] || <Sparkles size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[14px] font-semibold text-[var(--eva-text-primary)]">{tool.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        tool.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {tool.status === "active" ? "Actief" : "Beta"}
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--eva-text-secondary)] line-clamp-2 mb-3">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-opacity-10"
                      style={{
                        backgroundColor: `${color}20`,
                        color,
                      }}
                    >
                      {tool.category}
                    </span>
                  </div>
                </div>
                <ArrowRight
                  size={18}
                  className="text-[var(--eva-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                />
              </div>
            </Link>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <Search size={32} className="mx-auto text-[var(--eva-text-muted)] mb-3" />
          <p className="text-sm text-[var(--eva-text-secondary)]">Geen tools gevonden</p>
        </div>
      )}
    </AppLayout>
  );
}
