import { useEffect, useRef, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { usePreferences } from "@/hooks/usePreferences";
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
  Check,
  Upload,
  AlertTriangle,
  Sparkles,
  Loader2,
} from "lucide-react";

const SECURITY_KEY = "evai.security";

type SecurityState = { twofa: boolean; devices: boolean; sessions: boolean };

function loadSecurity(): SecurityState {
  if (typeof window === "undefined") return { twofa: false, devices: true, sessions: true };
  try {
    const raw = window.localStorage.getItem(SECURITY_KEY);
    if (!raw) return { twofa: false, devices: true, sessions: true };
    return JSON.parse(raw) as SecurityState;
  } catch {
    return { twofa: false, devices: true, sessions: true };
  }
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`w-10 h-6 rounded-full relative transition-colors ${
        on ? "bg-[#10b981]" : "bg-[var(--eva-border-subtle)]"
      }`}
    >
      <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${on ? "left-5" : "left-1"}`} />
    </button>
  );
}

function SuccessBadge({ visible, label = "Opgeslagen" }: { visible: boolean; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium text-[#10b981] transition-opacity ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-live="polite"
    >
      <Check size={14} /> {label}
    </span>
  );
}

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
  const { theme, setTheme, language, setLanguage } = usePreferences();
  const [activeTab, setActiveTab] = useState("profiel");
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "AI Ecosysteem gebruiker",
    avatar: "" as string,
  });
  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });
  const [security, setSecurity] = useState<SecurityState>(loadSecurity);

  // Track save success per-section
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SECURITY_KEY, JSON.stringify(security));
  }, [security]);

  const flashSaved = (section: string) => {
    setSavedSection(section);
    window.setTimeout(() => setSavedSection((s) => (s === section ? null : s)), 2200);
  };

  const fakeAsync = async (label: string) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 350));
    setSaving(false);
    flashSaved(label);
  };

  const onAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile((p) => ({ ...p, avatar: typeof reader.result === "string" ? reader.result : "" }));
    reader.readAsDataURL(file);
  };

  const onChangePassword = async () => {
    setPasswordError(null);
    if (password.new.length < 8) {
      setPasswordError("Nieuw wachtwoord moet minimaal 8 tekens zijn.");
      return;
    }
    if (password.new !== password.confirm) {
      setPasswordError("De bevestiging komt niet overeen.");
      return;
    }
    await fakeAsync("wachtwoord");
    setPassword({ current: "", new: "", confirm: "" });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profiel":
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[var(--eva-border-subtle)]"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7a56f6] to-[#141b28] flex items-center justify-center text-white text-xl font-bold">
                    {profile.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--eva-primary)] text-white flex items-center justify-center border-2 border-[var(--eva-surface)] hover:bg-[var(--eva-primary-hover)] transition-colors"
                  aria-label="Avatar uploaden"
                  title="Avatar uploaden"
                >
                  <Upload size={12} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onAvatarPick}
                  className="hidden"
                  aria-label="Avatar bestand kiezen"
                />
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

            <div className="flex items-center gap-3">
              <button
                onClick={() => fakeAsync("profiel")}
                disabled={saving}
                className="px-5 py-2.5 bg-[var(--eva-primary)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--eva-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving && savedSection === null ? <Loader2 size={14} className="animate-spin" /> : null}
                Opslaan
              </button>
              <SuccessBadge visible={savedSection === "profiel"} />
            </div>
          </div>
        );

      case "wachtwoord":
        return (
          <div className="space-y-5 max-w-md">
            <div>
              <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 flex items-center gap-2">
                <Lock size={14} /> Huidig wachtwoord
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 block">Nieuw wachtwoord</label>
              <input
                type="password"
                autoComplete="new-password"
                value={password.new}
                onChange={(e) => setPassword({ ...password, new: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
              />
              <p className="text-[11px] text-[var(--eva-text-muted)] mt-1.5">Minimaal 8 tekens.</p>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 block">Bevestig wachtwoord</label>
              <input
                type="password"
                autoComplete="new-password"
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                className="w-full px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
              />
            </div>
            {passwordError && (
              <div className="flex items-center gap-2 text-[12px] text-red-600">
                <AlertTriangle size={14} /> {passwordError}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={onChangePassword}
                disabled={saving || !password.current || !password.new || !password.confirm}
                className="px-5 py-2.5 bg-[var(--eva-primary)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--eva-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Wachtwoord wijzigen
              </button>
              <SuccessBadge visible={savedSection === "wachtwoord"} label="Wachtwoord aangepast" />
            </div>
          </div>
        );

      case "beveiliging": {
        const securityRows: { key: keyof SecurityState; label: string; desc: string; icon: React.ReactNode }[] = [
          { key: "twofa", label: "Tweestapsverificatie", desc: "Beveilig je account met een extra verificatiestap", icon: <Shield size={16} /> },
          { key: "devices", label: "Apparaatbeheer", desc: "Bekijk en beheer je ingelogde apparaten", icon: <Smartphone size={16} /> },
          { key: "sessions", label: "Inlogsessies", desc: "Bekijk je recente inlogactiviteit", icon: <Lock size={16} /> },
        ];
        return (
          <div className="space-y-4">
            {securityRows.map((item) => (
              <div key={item.key} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[var(--eva-border-subtle)]">
                <div className="w-10 h-10 rounded-lg bg-[var(--eva-canvas)] flex items-center justify-center text-[var(--eva-text-muted)]">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium text-[var(--eva-text-primary)]">{item.label}</p>
                  <p className="text-[11px] text-[var(--eva-text-muted)]">{item.desc}</p>
                </div>
                <Toggle
                  on={security[item.key]}
                  onChange={() => setSecurity((s) => ({ ...s, [item.key]: !s[item.key] }))}
                  label={item.label}
                />
              </div>
            ))}
            <p className="text-[11px] text-[var(--eva-text-muted)] pt-2">
              Voorkeuren worden lokaal opgeslagen. Wijzigingen zijn direct actief.
            </p>
          </div>
        );
      }

      case "abonnement":
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-[#7a56f6] to-[#141b28] rounded-2xl p-6 text-white relative overflow-hidden">
              <Sparkles className="absolute -right-2 -top-2 w-24 h-24 text-white/5" />
              <p className="text-[11px] text-white/60 font-semibold uppercase tracking-wider mb-1">Huidig plan</p>
              <h3 className="text-xl font-bold mb-1">Pro</h3>
              <p className="text-[13px] text-white/80">€29/maand — volledige toegang tot alle tools</p>
              <p className="text-[11px] text-white/50 mt-1">Volgende factuur: 13 juni 2026</p>
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-white/20 rounded-lg text-[12px] font-medium hover:bg-white/30 transition-colors">Upgraden naar Business</button>
                <button className="px-4 py-2 bg-white/10 rounded-lg text-[12px] font-medium hover:bg-white/20 transition-colors">Facturen</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tools actief", value: "14/14", color: "text-[var(--eva-accent)]" },
                { label: "Opslag", value: "Onbeperkt", color: "text-[var(--eva-primary)]" },
                { label: "AI Credits / maand", value: "10.000", color: "text-[#3b82f6]" },
                { label: "Team leden", value: "5", color: "text-[#10b981]" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-[var(--eva-border-subtle)] p-4 text-center">
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-[11px] text-[var(--eva-text-muted)] mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-[var(--eva-border-subtle)] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--eva-text-muted)] mb-3">Inbegrepen</p>
              <ul className="space-y-2 text-[12px] text-[var(--eva-text-secondary)]">
                {[
                  "Alle 14 modules (calculators, chatbots, tools, verificatie)",
                  "Streaming LLM chat met OpenAI-compatibele providers",
                  "Persistente sessie-context en historie",
                  "Documenten + Organogram met realtime sync",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <Check size={14} className="text-[#10b981] mt-0.5 shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
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
                <Toggle
                  on={notifications[item.key]}
                  onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                  label={item.label}
                />
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => fakeAsync("meldingen")}
                disabled={saving}
                className="px-5 py-2.5 bg-[var(--eva-primary)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--eva-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Voorkeuren opslaan
              </button>
              <SuccessBadge visible={savedSection === "meldingen"} />
            </div>
          </div>
        );

      case "systeem":
        return (
          <div className="space-y-5 max-w-md">
            <div>
              <label htmlFor="language-select" className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 flex items-center gap-2">
                <Globe size={14} /> Taal
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as "nl" | "en")}
                className="w-full px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px]"
              >
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
              </select>
              <p className="text-[11px] text-[var(--eva-text-muted)] mt-1.5">
                Voorkeur wordt lokaal opgeslagen. Volledige vertaling rolt module voor module uit.
              </p>
            </div>
            <div>
              <span className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-1.5 flex items-center gap-2">
                <Moon size={14} /> Thema
              </span>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium border transition-colors ${
                    theme === "light"
                      ? "border-[var(--eva-accent)] bg-[var(--eva-canvas)] ring-2 ring-[var(--eva-accent)]/20"
                      : "border-[var(--eva-border-subtle)] bg-white hover:bg-[var(--eva-canvas)]"
                  }`}
                >
                  <Sun size={16} /> Licht
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium border transition-colors ${
                    theme === "dark"
                      ? "border-[var(--eva-accent)] bg-[var(--eva-canvas)] ring-2 ring-[var(--eva-accent)]/20"
                      : "border-[var(--eva-border-subtle)] bg-white hover:bg-[var(--eva-canvas)]"
                  }`}
                >
                  <Moon size={16} /> Donker
                </button>
              </div>
              <p className="text-[11px] text-[var(--eva-text-muted)] mt-2">Toegepast op de hele app, ook na herladen.</p>
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
