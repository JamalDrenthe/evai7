import { useState } from "react";
import { ShieldCheck, Check, X, Loader2 } from "lucide-react";
import type { PanelProps } from "../_types";

type Status = "approved" | "review" | "rejected";
type Check = { name: string; passed: boolean; detail?: string };
type Result = { status: Status; confidence: number; checks: Check[]; reference: string };

type DocType = "passport" | "id_card" | "drivers_license" | "residence_permit";

const DOC_LABELS: Record<DocType, string> = {
  passport: "Paspoort",
  id_card: "ID-kaart",
  drivers_license: "Rijbewijs",
  residence_permit: "Verblijfsvergunning",
};

const STATUS_STYLES: Record<Status, { label: string; ring: string; text: string; bg: string }> = {
  approved: { label: "Goedgekeurd", ring: "ring-emerald-500/40", text: "text-emerald-300", bg: "bg-emerald-500/15" },
  review: { label: "In review", ring: "ring-amber-500/40", text: "text-amber-300", bg: "bg-amber-500/15" },
  rejected: { label: "Afgewezen", ring: "ring-red-500/40", text: "text-red-300", bg: "bg-red-500/15" },
};

function runChecks(form: {
  fullName: string;
  documentType: DocType;
  documentNumber: string;
  dateOfBirth: string;
  country: string;
}): Result {
  const checks: Check[] = [];
  const formatRe = /^[A-Z0-9]{6,15}$/i;
  const formatOk = formatRe.test(form.documentNumber);
  checks.push({ name: "Documentnummer formaat", passed: formatOk, detail: formatOk ? "Geldig formaat" : "6–15 alfanumerieke tekens vereist" });

  const dob = new Date(form.dateOfBirth);
  let ageOk = false;
  if (!isNaN(dob.getTime())) {
    const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600_000);
    ageOk = age >= 18 && age < 120;
    checks.push({ name: "Leeftijd ≥ 18", passed: ageOk, detail: ageOk ? `± ${Math.floor(age)} jaar` : "Geboortedatum buiten geldig bereik" });
  } else {
    checks.push({ name: "Leeftijd ≥ 18", passed: false, detail: "Ongeldige geboortedatum" });
  }

  const nameOk = /^[\p{L}\s'-]{2,}$/u.test(form.fullName) && form.fullName.trim().split(/\s+/).length >= 2;
  checks.push({ name: "Naam plausibel", passed: nameOk, detail: nameOk ? "Voor- en achternaam" : "Vul volledige naam in" });

  const country = form.country.toUpperCase();
  const countryOk = ["NL", "BE", "DE", "FR", "ES", "IT", "PT", "PL"].includes(country);
  checks.push({ name: "Land toegestaan", passed: countryOk, detail: countryOk ? `${country} ondersteund` : `${country} niet ondersteund` });

  const passed = checks.filter((c) => c.passed).length;
  const confidence = passed / checks.length;
  const status: Status = confidence >= 0.85 ? "approved" : confidence >= 0.5 ? "review" : "rejected";

  return {
    status,
    confidence,
    checks,
    reference: `EV-${Date.now().toString(36).toUpperCase().slice(-8)}`,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Panel(_props: PanelProps) {
  const [form, setForm] = useState({
    fullName: "",
    documentType: "passport" as DocType,
    documentNumber: "",
    dateOfBirth: "",
    country: "NL",
  });
  const [result, setResult] = useState<Result | null>(null);
  const [running, setRunning] = useState(false);

  const submit = () => {
    setRunning(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(runChecks(form));
      setRunning(false);
    }, 500);
  };

  const reset = () => {
    setResult(null);
    setForm({ fullName: "", documentType: "passport", documentNumber: "", dateOfBirth: "", country: "NL" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-2 bg-emerald-500/15 rounded-lg border border-emerald-500/30">
          <ShieldCheck className="w-5 h-5 text-emerald-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Verification</h2>
          <p className="text-xs text-slate-400">KYC demo — lokale heuristieken (geen externe provider)</p>
        </div>
      </div>

      {!result ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Volledige naam">
              <input
                type="text"
                aria-label="Volledige naam"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                placeholder="Voornaam Achternaam"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-[13px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </Field>
            <Field label="Geboortedatum">
              <input
                type="date"
                aria-label="Geboortedatum"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-[13px] text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </Field>
            <Field label="Documenttype">
              <select
                aria-label="Documenttype"
                value={form.documentType}
                onChange={(e) => setForm({ ...form, documentType: e.target.value as DocType })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-[13px] text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {Object.entries(DOC_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Documentnummer">
              <input
                type="text"
                aria-label="Documentnummer"
                value={form.documentNumber}
                onChange={(e) => setForm({ ...form, documentNumber: e.target.value.toUpperCase() })}
                placeholder="ABC123456"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-[13px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono"
              />
            </Field>
            <Field label="Land (ISO-2)">
              <input
                type="text"
                aria-label="Land"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value.slice(0, 2).toUpperCase() })}
                maxLength={2}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-[13px] text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 uppercase"
              />
            </Field>
          </div>
          <button
            disabled={!form.fullName || !form.documentNumber || !form.dateOfBirth || running}
            onClick={submit}
            className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-emerald-500 text-slate-950 text-[13px] font-semibold hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {running ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
            Verifieer
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`rounded-xl p-5 ring-2 ${STATUS_STYLES[result.status].ring} ${STATUS_STYLES[result.status].bg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">Resultaat</p>
                <p className={`text-2xl font-bold ${STATUS_STYLES[result.status].text}`}>{STATUS_STYLES[result.status].label}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">Confidence</p>
                <p className={`text-2xl font-bold ${STATUS_STYLES[result.status].text}`}>{(result.confidence * 100).toFixed(0)}%</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Referentie: <span className="font-mono text-slate-300">{result.reference}</span></p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl divide-y divide-slate-800">
            {result.checks.map((c) => (
              <div key={c.name} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center ${c.passed ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                    {c.passed ? <Check size={12} /> : <X size={12} />}
                  </span>
                  <span className="text-[13px] text-slate-100">{c.name}</span>
                </div>
                <span className="text-[11px] text-slate-400">{c.detail}</span>
              </div>
            ))}
          </div>

          <button
            onClick={reset}
            className="text-[12px] text-emerald-300 hover:underline"
          >
            ← Nieuwe verificatie
          </button>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-400 mb-1.5">{label}</p>
      {children}
    </div>
  );
}
