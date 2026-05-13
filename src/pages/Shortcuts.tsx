/* 
 * Note: This file uses inline styles for dynamic color values that cannot 
 * be expressed in static CSS. These are necessary for the dynamic nature of the shortcuts.
 */
import { Link } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Calculator,
  TrendingUp,
  Wallet,
  Users,
  CheckSquare,
  Network,
  MessageSquare,
  Bot,
  Truck,
  Search,
  MessageCircle,
  Mic,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";

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
  Search: <Search size={20} />,
  MessageCircle: <MessageCircle size={20} />,
  Mic: <Mic size={20} />,
};

// Popular/frequently used shortcuts
const shortcuts = [
  {
    id: 1,
    name: "Mining Calculator",
    slug: "mining-calculator",
    description: "Bereken streaming inkomsten",
    category: "calculator",
    icon: "Calculator",
    color: "#3b82f6",
    isFavorite: true,
  },
  {
    id: 2,
    name: "VVC Calculator",
    slug: "vvc-calculator",
    description: "Bereken VVC inkomen",
    category: "calculator",
    icon: "Users",
    color: "#7a56f6",
    isFavorite: true,
  },
  {
    id: 3,
    name: "Takenblok",
    slug: "takenblok",
    description: "Beheer je taken",
    category: "productivity",
    icon: "CheckSquare",
    color: "#10b981",
    isFavorite: true,
  },
  {
    id: 4,
    name: "ZZP Netto Calculator",
    slug: "zzp-calculator",
    description: "Bereken ZZP inkomen",
    category: "calculator",
    icon: "Wallet",
    color: "#f59e0b",
    isFavorite: false,
  },
  {
    id: 5,
    name: "Ecosysteem Chatbot",
    slug: "ecosysteem-chatbot",
    description: "Centrale AI assistent",
    category: "chatbot",
    icon: "Bot",
    color: "#7a56f6",
    isFavorite: false,
  },
  {
    id: 6,
    name: "Organigram",
    slug: "organigram",
    description: "Organisatiestructuur",
    category: "productivity",
    icon: "Network",
    color: "#10b981",
    isFavorite: false,
  },
];

export function Shortcuts() {
  const favorites = shortcuts.filter((s) => s.isFavorite);
  const others = shortcuts.filter((s) => !s.isFavorite);

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[12px] text-[var(--eva-text-muted)]">
          <span className="text-[var(--eva-text-secondary)]">Gereedschap</span>
          <span className="mx-2">/</span>
          <span>Snelkoppelingen</span>
        </nav>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--eva-text-primary)]">Snelkoppelingen</h1>
          <p className="text-[12px] text-[var(--eva-text-muted)] mt-1">Jouw favoriete tools en sneltoegang</p>
        </div>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-[#f59e0b] fill-[#f59e0b]" />
            <h2 className="text-sm font-semibold text-[var(--eva-text-primary)]">Favorieten</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((shortcut) => (
              <Link
                key={shortcut.id}
                to={`/tools/${shortcut.slug}`}
                className="eva-card bg-gradient-to-br from-white to-[var(--eva-canvas)] rounded-2xl border border-[var(--eva-border-subtle)] p-5 hover:border-[var(--eva-accent)]/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-3 right-3">
                  <Star size={14} className="text-[#f59e0b] fill-[#f59e0b]" />
                </div>
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: shortcut.color }}
                  >
                    {iconMap[shortcut.icon] || <Sparkles size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-[var(--eva-text-primary)] mb-1">
                      {shortcut.name}
                    </h3>
                    <p className="text-[12px] text-[var(--eva-text-secondary)] line-clamp-1">
                      {shortcut.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Other Shortcuts */}
      {others.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-[var(--eva-text-muted)]" />
            <h2 className="text-sm font-semibold text-[var(--eva-text-primary)]">Overige tools</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {others.map((shortcut) => (
              <Link
                key={shortcut.id}
                to={`/tools/${shortcut.slug}`}
                className="eva-card bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5 hover:border-[var(--eva-accent)]/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: shortcut.color }}
                  >
                    {iconMap[shortcut.icon] || <Sparkles size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-semibold text-[var(--eva-text-primary)] mb-1">
                      {shortcut.name}
                    </h3>
                    <p className="text-[12px] text-[var(--eva-text-secondary)] line-clamp-1">
                      {shortcut.description}
                    </p>
                  </div>
                  <ArrowRight
                    size={18}
                    className="text-[var(--eva-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Tools Link */}
      <div className="mt-8 pt-6 border-t border-[var(--eva-border-subtle)]">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-[12px] text-[var(--eva-text-secondary)] hover:text-[var(--eva-primary)] transition-colors"
        >
          Bekijk alle tools
          <ArrowRight size={14} />
        </Link>
      </div>
    </AppLayout>
  );
}
