import { AppLayout } from "@/components/layout/AppLayout";
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Smartphone,
  Fingerprint,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react";

const securityFeatures = [
  {
    id: "2fa",
    title: "Tweestapsverificatie",
    description: "Voeg een extra beveiligingslaag toe door een tweede verificatiemethode vereist te maken bij het inloggen.",
    icon: <Smartphone size={20} />,
    status: "disabled" as const,
    action: "Inschakelen",
  },
  {
    id: "biometric",
    title: "Biometrische authenticatie",
    description: "Gebruik je vingerafdruk of gezichtsherkenning om snel en veilig toegang te krijgen.",
    icon: <Fingerprint size={20} />,
    status: "active" as const,
    action: "Beheren",
  },
  {
    id: "sessions",
    title: "Actieve sessies",
    description: "Bekijk en beheer alle apparaten die momenteel zijn ingelogd op je account.",
    icon: <Activity size={20} />,
    status: "active" as const,
    action: "Bekijken",
  },
  {
    id: "password",
    title: "Wachtwoordbeleid",
    description: "Je wachtwoord voldoet aan alle beveiligingseisen. Laatst gewijzigd 30 dagen geleden.",
    icon: <Key size={20} />,
    status: "active" as const,
    action: "Wijzigen",
  },
];

const securityScore = 78;

const recentActivity = [
  { action: "Ingelogd", device: "Chrome - Windows", time: "2 minuten geleden", status: "success" as const },
  { action: "Ingelogd", device: "Safari - macOS", time: "3 uur geleden", status: "success" as const },
  { action: "Wachtwoord gewijzigd", device: "Chrome - Windows", time: "2 dagen geleden", status: "info" as const },
  { action: "Nieuw apparaat", device: "Firefox - Linux", time: "5 dagen geleden", status: "warning" as const },
];

export function Security() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <nav className="text-[12px] text-[var(--eva-text-muted)]">
          <span className="text-[var(--eva-text-secondary)]">Veiligheid</span>
          <span className="mx-2">/</span>
          <span>Overzicht</span>
        </nav>
      </div>

      <h1 className="text-xl font-semibold text-[var(--eva-text-primary)] mb-6">Veiligheid</h1>

      {/* Security Score */}
      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f0" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke={securityScore >= 80 ? "#10b981" : securityScore >= 60 ? "#f59e0b" : "#ef4444"}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(securityScore / 100) * 264} 264`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-[var(--eva-primary)]">{securityScore}</span>
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--eva-text-primary)] mb-1">
              Beveiligingsscore: {securityScore >= 80 ? "Goed" : securityScore >= 60 ? "Matig" : "Aandacht vereist"}
            </h3>
            <p className="text-[12px] text-[var(--eva-text-secondary)] mb-3">
              Schakel tweestapsverificatie in om je score te verhogen naar 95+.
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 flex items-center gap-1">
                <CheckCircle size={10} /> 3 actief
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700 flex items-center gap-1">
                <AlertTriangle size={10} /> 1 aandacht
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {securityFeatures.map((feature) => (
          <div
            key={feature.id}
            className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5 hover:border-[var(--eva-accent)]/30 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                feature.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
              }`}>
                {feature.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[14px] font-semibold text-[var(--eva-text-primary)]">{feature.title}</h3>
                  {feature.status === "active" ? (
                    <ShieldCheck size={14} className="text-green-500" />
                  ) : (
                    <ShieldAlert size={14} className="text-yellow-500" />
                  )}
                </div>
                <p className="text-[11px] text-[var(--eva-text-secondary)] mb-3">{feature.description}</p>
                <button className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                  feature.status === "active"
                    ? "bg-[var(--eva-canvas)] text-[var(--eva-text-secondary)] hover:bg-[var(--eva-border-subtle)]"
                    : "bg-[var(--eva-primary)] text-white hover:bg-[var(--eva-primary-hover)]"
                }`}>
                  {feature.action}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-6">
        <h3 className="text-base font-semibold text-[var(--eva-text-primary)] mb-4">Recente activiteit</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--eva-canvas)] transition-colors">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                activity.status === "success" ? "bg-green-100 text-green-600"
                : activity.status === "warning" ? "bg-yellow-100 text-yellow-600"
                : "bg-blue-100 text-blue-600"
              }`}>
                {activity.status === "success" ? <CheckCircle size={14} />
                : activity.status === "warning" ? <AlertTriangle size={14} />
                : <Activity size={14} />}
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium text-[var(--eva-text-primary)]">{activity.action}</p>
                <p className="text-[11px] text-[var(--eva-text-muted)]">{activity.device}</p>
              </div>
              <span className="text-[11px] text-[var(--eva-text-muted)]">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
