import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Globe,
  Moon,
  Sun,
  Key,
  Lock,
  Smartphone,
  Mail,
} from "lucide-react";

const sidebarTabs = [
  { id: "profiel", label: "Profiel", icon: <User size={16} /> },
  { id: "wachtwoord", label: "Wachtwoord", icon: <Key size={16} /> },
  { id: "beveiliging", label: "Beveiliging", icon: <Shield size={16} /> },
  { id: "abonnement", label: "Abonnement", icon: <CreditCard size={16} /> },
  { id: "meldingen", label: "Meldingen", icon: <Bell size={16} /> },
  { id: "systeem", label: "Systeem", icon: <Globe size={16} /> },
];

export function Account() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profiel");
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "AI Ecosysteem gebruiker",
  });
  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });
  const [system, setSystem] = useState({
    language: "nl",
    theme: "light",
  });

  const renderContent = () => {
    switch (activeTab) {
      case "profiel":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7a56f6] to-[#141b28] flex items-center justify-center text-white text-xl font-bold">
                {profile.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--eva-text-primary)]">{profile.name || "Gebruiker"}</h3>
                <p className="text-[12px] text-[var(--eva-text-muted)]">{user?.role || "Gebruiker"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 block">Naam</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 block">E-mail</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 block">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30 resize-none"
                />
              </div>
            </div>

            <button className="px-5 py-2.5 bg-[var(--eva-primary)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--eva-primary-hover)] transition-colors">
              Opslaan
            </button>
          </div>
        );

      case "wachtwoord":
        return (
          <div className="space-y-5 max-w-md">
            <div>
              <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 block flex items-center gap-2">
                <Lock size={14} /> Huidig wachtwoord
              </label>
              <input
                type="password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 block">Nieuw wachtwoord</label>
              <input
                type="password"
                value={password.new}
                onChange={(e) => setPassword({ ...password, new: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 block">Bevestig wachtwoord</label>
              <input
                type="password"
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
              />
            </div>
            <button className="px-5 py-2.5 bg-[var(--eva-primary)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--eva-primary-hover)] transition-colors">
              Wachtwoord wijzigen
            </button>
          </div>
        );

      case "beveiliging":
        return (
          <div className="space-y-4">
            {[
              { label: "Tweestapsverificatie", desc: "Beveilig je account met een extra verificatiestap", icon: <Shield size={16} />, active: false },
              { label: "Apparaatbeheer", desc: "Bekijk en beheer je ingelogde apparaten", icon: <Smartphone size={16} />, active: true },
              { label: "Inlogsessies", desc: "Bekijk je recente inlogactiviteit", icon: <Lock size={16} />, active: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[var(--eva-border-subtle)]">
                <div className="w-10 h-10 rounded-lg bg-[var(--eva-canvas)] flex items-center justify-center text-[var(--eva-text-muted)]">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[var(--eva-text-primary)]">{item.label}</p>
                  <p className="text-[11px] text-[var(--eva-text-muted)]">{item.desc}</p>
                </div>
                <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${item.active ? "bg-[#10b981]" : "bg-[var(--eva-border-subtle)]"}`}>
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${item.active ? "left-5" : "left-1"}`} />
                </div>
              </div>
            ))}
          </div>
        );

      case "abonnement":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#7a56f6] to-[#141b28] rounded-2xl p-6 text-white">
              <p className="text-[11px] text-white/60 font-semibold uppercase tracking-wider mb-1">Huidig plan</p>
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <p className="text-[13px] text-white/80">€29/maand - volledige toegang tot alle tools</p>
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-white/20 rounded-lg text-[12px] font-medium hover:bg-white/30 transition-colors">Upgraden</button>
                <button className="px-4 py-2 bg-white/10 rounded-lg text-[12px] font-medium hover:bg-white/20 transition-colors">Facturen</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tools", value: "12/12" },
                { label: "Opslag", value: "Onbeperkt" },
                { label: "AI Credits", value: "10.000/maand" },
                { label: "Team", value: "5 leden" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-[var(--eva-border-subtle)] p-4 text-center">
                  <p className="text-lg font-bold text-[var(--eva-primary)]">{stat.value}</p>
                  <p className="text-[11px] text-[var(--eva-text-muted)]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case "meldingen":
        return (
          <div className="space-y-4">
            {[
              { label: "E-mail meldingen", desc: "Ontvang updates via e-mail", key: "email" as const, icon: <Mail size={16} /> },
              { label: "Push notificaties", desc: "Ontvang notificaties in de browser", key: "push" as const, icon: <Bell size={16} /> },
              { label: "Product updates", desc: "Ontvang nieuws over Eva updates", key: "updates" as const, icon: <Globe size={16} /> },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[var(--eva-border-subtle)]">
                <div className="w-10 h-10 rounded-lg bg-[var(--eva-canvas)] flex items-center justify-center text-[var(--eva-text-muted)]">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[var(--eva-text-primary)]">{item.label}</p>
                  <p className="text-[11px] text-[var(--eva-text-muted)]">{item.desc}</p>
                </div>
                <button
                  onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                  className={`w-10 h-6 rounded-full relative transition-colors ${notifications[item.key] ? "bg-[#10b981]" : "bg-[var(--eva-border-subtle)]"}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifications[item.key] ? "left-5" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        );

      case "systeem":
        return (
          <div className="space-y-5 max-w-md">
            <div>
              <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 block flex items-center gap-2">
                <Globe size={14} /> Taal
              </label>
              <select
                value={system.language}
                onChange={(e) => setSystem({ ...system, language: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px]"
              >
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 block flex items-center gap-2">
                <Moon size={14} /> Thema
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSystem({ ...system, theme: "light" })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium border transition-colors ${
                    system.theme === "light" ? "border-[var(--eva-primary)] bg-[var(--eva-canvas)]" : "border-[var(--eva-border-subtle)] bg-white"
                  }`}
                >
                  <Sun size={16} /> Licht
                </button>
                <button
                  onClick={() => setSystem({ ...system, theme: "dark" })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium border transition-colors ${
                    system.theme === "dark" ? "border-[var(--eva-primary)] bg-[var(--eva-canvas)]" : "border-[var(--eva-border-subtle)] bg-white"
                  }`}
                >
                  <Moon size={16} /> Donker
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[12px] text-[var(--eva-text-muted)]">
          <span className="text-[var(--eva-text-secondary)]">Account</span>
          <span className="mx-2">/</span>
          <span>{sidebarTabs.find((t) => t.id === activeTab)?.label}</span>
        </nav>
      </div>

      <h1 className="text-xl font-semibold text-[var(--eva-text-primary)] mb-6">Account</h1>

      <div className="flex gap-6">
        {/* Settings Tabs */}
        <div className="w-48 shrink-0 space-y-0.5">
          {sidebarTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[var(--eva-primary)] text-white"
                  : "text-[var(--eva-text-secondary)] hover:bg-[var(--eva-canvas)]"
              }`}
            >
              <span className={activeTab === tab.id ? "text-white" : "text-[var(--eva-text-muted)]"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-6">
          <h2 className="text-base font-semibold text-[var(--eva-text-primary)] mb-4">
            {sidebarTabs.find((t) => t.id === activeTab)?.label}
          </h2>
          {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
}
