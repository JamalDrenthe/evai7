import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Sparkles,
  Wrench,
  Network,
  Users,
  CalendarDays,
  Settings,
  Shield,
  ChevronDown,
  ChevronRight,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { label: string; path: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/" },
  {
    label: "AI Workspace",
    icon: <Sparkles size={18} />,
    children: [
      { label: "Chat", path: "/workspace" },
      { label: "Documenten", path: "/workspace/docs" },
      { label: "Brainstorm", path: "/workspace/brainstorm" },
    ],
  },
  {
    label: "Gereedschap",
    icon: <Wrench size={18} />,
    children: [
      { label: "Alle Tools", path: "/tools" },
      { label: "Snelkoppelingen", path: "/tools/shortcuts" },
    ],
  },
  { label: "Organigram", icon: <Network size={18} />, path: "/organigram" },
  {
    label: "Samenwerken",
    icon: <Users size={18} />,
    children: [
      { label: "Mijn Werk", path: "/werk" },
      { label: "Team", path: "/werk/team" },
    ],
  },
  { label: "Agenda", icon: <CalendarDays size={18} />, path: "/agenda" },
  {
    label: "Account",
    icon: <Settings size={18} />,
    children: [
      { label: "Profiel", path: "/account" },
      { label: "Wachtwoord", path: "/account/password" },
      { label: "Meldingen", path: "/account/notifications" },
    ],
  },
  { label: "Veiligheid", icon: <Shield size={18} />, path: "/veiligheid" },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    "AI Workspace": true,
    Gereedschap: true,
    Samenwerken: false,
    Account: false,
  });

  const toggleExpand = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-[260px] min-h-screen bg-white border-r border-[var(--eva-border-subtle)] flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7a56f6] to-[#141b28] flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--eva-text-primary)] leading-tight">Eva</h1>
          <p className="text-[11px] text-[var(--eva-text-muted)]">AI Ecosysteem</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleExpand(item.label)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--eva-text-secondary)] hover:bg-[var(--eva-canvas)] transition-colors"
                >
                  <span className="text-[var(--eva-text-muted)]">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {expanded[item.label] ? (
                    <ChevronDown size={14} className="text-[var(--eva-text-muted)]" />
                  ) : (
                    <ChevronRight size={14} className="text-[var(--eva-text-muted)]" />
                  )}
                </button>
                {expanded[item.label] && (
                  <div className="ml-7 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-3 py-1.5 rounded-lg text-[12px] transition-colors ${
                          isActive(child.path)
                            ? "bg-[var(--eva-canvas)] text-[var(--eva-primary)] font-semibold"
                            : "text-[var(--eva-text-muted)] hover:text-[var(--eva-text-secondary)] hover:bg-[var(--eva-canvas)]/50"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.path!}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive(item.path!)
                    ? "bg-[var(--eva-primary)] text-white"
                    : "text-[var(--eva-text-secondary)] hover:bg-[var(--eva-canvas)]"
                }`}
              >
                <span className={isActive(item.path!) ? "text-white" : "text-[var(--eva-text-muted)]"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-[var(--eva-border-subtle)]">
        {user ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--eva-canvas)] transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7a56f6] to-[#141b28] flex items-center justify-center text-white text-xs font-semibold">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-[var(--eva-text-primary)] truncate">{user.name || "Gebruiker"}</p>
              <p className="text-[11px] text-[var(--eva-text-muted)] truncate">{user.email || "Ingelogd"}</p>
            </div>
            <button onClick={logout} className="text-[var(--eva-text-muted)] hover:text-red-500 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-[var(--eva-text-secondary)] hover:bg-[var(--eva-canvas)] transition-colors"
          >
            <LogOut size={18} />
            Inloggen
          </Link>
        )}
      </div>
    </aside>
  );
}
