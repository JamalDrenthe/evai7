import { useState } from "react";
import { Link } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles,
  Wrench,
  Users,
  Search,
  ArrowRight,
  Clock,
  TrendingUp,
  MessageSquare,
  Calculator,
  Network,
  CheckSquare,
  Mic,
  Bot,
  Wallet,
  Truck,
} from "lucide-react";
import { trpc } from "@/providers/trpc";

const modules = [
  {
    title: "AI Workspace",
    subtitle: "Brainstorm, schrijf en organiseer",
    icon: <Sparkles size={24} />,
    image: "/images/workspace-hero.jpg",
    path: "/workspace",
    color: "#7a56f6",
  },
  {
    title: "Gereedschap",
    subtitle: "Alle tools op één plek",
    icon: <Wrench size={24} />,
    image: "/images/tools-hero.jpg",
    path: "/tools",
    color: "#3b82f6",
  },
  {
    title: "Samenwerken",
    subtitle: "Werk samen en blijf leren",
    icon: <Users size={24} />,
    image: "/images/collaborate-hero.jpg",
    path: "/werk",
    color: "#10b981",
  },
];

const recentTools = [
  { name: "Mining Calculator", icon: <Calculator size={16} />, slug: "mining-calculator" },
  { name: "VVC Calculator", icon: <TrendingUp size={16} />, slug: "vvc-calculator" },
  { name: "Takenblok", icon: <CheckSquare size={16} />, slug: "takenblok" },
  { name: "Organigram", icon: <Network size={16} />, slug: "organigram" },
];

const news = [
  { title: "Eva update 2026 - Nieuw AI Ecosysteem gelanceerd", date: "2026-02-12", new: true },
  { title: "Alle tools nu geïntegreerd in één platform", date: "2026-02-11", new: true },
  { title: "Voice Verificatie toegevoegd aan veiligheid", date: "2026-02-10", new: false },
];

function RightPanel() {
  return (
    <div className="space-y-6">
      {/* Eva Status */}
      <div className="bg-gradient-to-br from-[#7a56f6]/10 to-[#7a56f6]/5 rounded-2xl p-5 border border-[#7a56f6]/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[#7a56f6] eva-pulse flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--eva-text-primary)]">Eva</h3>
            <p className="text-xs text-[#7a56f6] font-medium">Staat klaar om te helpen</p>
          </div>
        </div>
        <p className="text-xs text-[var(--eva-text-secondary)] leading-relaxed">
          Ik ben je persoonlijke AI-assistent. Vraag me om berekeningen te maken, teksten te schrijven, of je te helpen met je werk.
        </p>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-3">Aanbevolen voor jou</h3>
        <div className="space-y-2">
          {[
            { title: "Start met AI Workspace", desc: "Brainstorm en schrijf met AI-hulp", icon: <Sparkles size={16} className="text-[#7a56f6]" />, path: "/workspace" },
            { title: "Ontdek alle tools", desc: "12 geïntegreerde tools beschikbaar", icon: <Wrench size={16} className="text-[#3b82f6]" />, path: "/tools" },
            { title: "Bekijk je agenda", desc: "Plan meetings en deadlines", icon: <Clock size={16} className="text-[#10b981]" />, path: "/agenda" },
            { title: "Check meldingen", desc: "2 nieuwe meldingen", icon: <MessageSquare size={16} className="text-[#f59e0b]" />, path: "/werk" },
          ].map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--eva-canvas)] transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-white border border-[var(--eva-border-subtle)] flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--eva-text-primary)]">{item.title}</p>
                <p className="text-[11px] text-[var(--eva-text-muted)]">{item.desc}</p>
              </div>
              <ArrowRight size={14} className="text-[var(--eva-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
        <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-3">Platform Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-[var(--eva-canvas)] rounded-xl">
            <p className="text-xl font-bold text-[#7a56f6]">12</p>
            <p className="text-[11px] text-[var(--eva-text-muted)]">Tools</p>
          </div>
          <div className="text-center p-3 bg-[var(--eva-canvas)] rounded-xl">
            <p className="text-xl font-bold text-[#3b82f6]">5</p>
            <p className="text-[11px] text-[var(--eva-text-muted)]">Chatbots</p>
          </div>
          <div className="text-center p-3 bg-[var(--eva-canvas)] rounded-xl">
            <p className="text-xl font-bold text-[#10b981]">4</p>
            <p className="text-[11px] text-[var(--eva-text-muted)]">Calculators</p>
          </div>
          <div className="text-center p-3 bg-[var(--eva-canvas)] rounded-xl">
            <p className="text-xl font-bold text-[#f59e0b]">1</p>
            <p className="text-[11px] text-[var(--eva-text-muted)]">Workspace</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const toolsQuery = trpc.tools.list.useQuery();
  const tools = toolsQuery.data ?? [];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/workspace?prompt=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <AppLayout rightPanel={<RightPanel />}>
      {/* Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[12px] text-[var(--eva-text-muted)]">
          <span className="text-[var(--eva-text-secondary)]">Dashboard</span>
          <span className="mx-2">/</span>
          <span>Snelle Start</span>
        </nav>
        <Link
          to="/workspace"
          className="px-4 py-2 bg-[var(--eva-primary)] text-white text-[13px] font-medium rounded-xl hover:bg-[var(--eva-primary-hover)] transition-colors flex items-center gap-2"
        >
          <Sparkles size={16} />
          Nieuw
        </Link>
      </div>

      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--eva-text-primary)] mb-1">
          Welkom terug, {user?.name?.split(" ")[0] || "daar"}
        </h1>
        <p className="text-sm text-[var(--eva-text-secondary)]">
          Dit is je centrale commandocentrum. Wat wil je vandaag doen?
        </p>
      </div>

      {/* Quick Search */}
      <div className="mb-8">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--eva-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Wat wil je vandaag doen?"
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-[var(--eva-border-subtle)] rounded-2xl text-sm text-[var(--eva-text-primary)] placeholder:text-[var(--eva-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30 focus:border-[var(--eva-accent)] transition-all"
          />
          {searchQuery && (
            <button
              onClick={handleSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[var(--eva-accent)] text-white text-[12px] font-medium rounded-lg hover:bg-[var(--eva-accent)]/90 transition-colors"
            >
              Start
            </button>
          )}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {modules.map((module) => (
          <Link
            key={module.title}
            to={module.path}
            className="eva-card bg-white rounded-2xl border border-[var(--eva-border-subtle)] overflow-hidden group"
          >
            <div className="h-32 overflow-hidden relative">
              <img
                src={module.image}
                alt={module.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              <div
                className="absolute bottom-3 left-3 w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: module.color }}
              >
                {module.icon}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-[15px] font-semibold text-[var(--eva-text-primary)] mb-0.5">{module.title}</h3>
              <p className="text-[12px] text-[var(--eva-text-secondary)]">{module.subtitle}</p>
              <div className="mt-3 flex items-center gap-1 text-[12px] font-medium" style={{ color: module.color }}>
                Open <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Tools & News */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Recent Tools */}
        <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5">
          <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-4">Onlangs geopend</h3>
          <div className="space-y-2">
            {recentTools.map((tool) => (
              <Link
                key={tool.slug}
                to={`/tools/${tool.slug}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--eva-canvas)] transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--eva-canvas)] flex items-center justify-center text-[var(--eva-text-muted)] group-hover:text-[var(--eva-accent)] transition-colors">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[var(--eva-text-primary)]">{tool.name}</p>
                </div>
                <ArrowRight size={14} className="text-[var(--eva-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        {/* News */}
        <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5">
          <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-4">Eva nieuws</h3>
          <div className="space-y-3">
            {news.map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.new ? "bg-[#7a56f6]" : "bg-[var(--eva-text-muted)]"}`} />
                <div>
                  <p className="text-[13px] font-medium text-[var(--eva-text-primary)]">{item.title}</p>
                  <p className="text-[11px] text-[var(--eva-text-muted)]">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* All Tools Preview */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--eva-text-primary)] mb-4">Alle tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {toolsQuery.isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[var(--eva-border-subtle)] p-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-[var(--eva-canvas)] mb-3" />
                <div className="h-4 bg-[var(--eva-canvas)] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[var(--eva-canvas)] rounded w-full" />
              </div>
            ))
          ) : tools.length === 0 ? (
            <div className="col-span-2 md:col-span-4 text-center py-8">
              <Search size={32} className="mx-auto text-[var(--eva-text-muted)] mb-3" />
              <p className="text-sm text-[var(--eva-text-secondary)]">Geen tools gevonden</p>
            </div>
          ) : (
            tools.map((tool) => (
              <Link
                key={tool.id}
                to={`/tools/${tool.slug}`}
                className="eva-card bg-white rounded-xl border border-[var(--eva-border-subtle)] p-4 hover:border-[var(--eva-accent)]/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--eva-canvas)] flex items-center justify-center text-[var(--eva-accent)] mb-3">
                  {tool.icon === "Calculator" && <Calculator size={20} />}
                  {tool.icon === "TrendingUp" && <TrendingUp size={20} />}
                  {tool.icon === "Wallet" && <Wallet size={20} />}
                  {tool.icon === "Users" && <Users size={20} />}
                  {tool.icon === "CheckSquare" && <CheckSquare size={20} />}
                  {tool.icon === "Network" && <Network size={20} />}
                  {tool.icon === "MessageSquare" && <MessageSquare size={20} />}
                  {tool.icon === "Bot" && <Bot size={20} />}
                  {tool.icon === "Truck" && <Truck size={20} />}
                  {tool.icon === "Search" && <Search size={20} />}
                  {tool.icon === "MessageCircle" && <MessageSquare size={20} />}
                  {tool.icon === "Mic" && <Mic size={20} />}
                </div>
                <h4 className="text-[13px] font-medium text-[var(--eva-text-primary)]">{tool.name}</h4>
                <p className="text-[11px] text-[var(--eva-text-muted)] mt-1 line-clamp-2">{tool.description}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  tool.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                }`}>
                  {tool.status === "active" ? "Actief" : "Beta"}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
