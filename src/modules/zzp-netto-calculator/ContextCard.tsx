import { Calculator } from "lucide-react";
import type { ContextCardProps } from "../_types";

type Payload = {
  input?: { revenue: number; mode: string };
  output?: { netAnnual: number; netMonthly: number };
};

export default function ContextCard({ payload, ts }: ContextCardProps) {
  const p = payload as Payload;
  const revenue = p.input?.revenue ?? 0;
  const netAnnual = p.output?.netAnnual ?? 0;
  const netMonthly = p.output?.netMonthly ?? 0;
  return (
    <div className="p-3 bg-cyan-500/5 border border-cyan-500/20 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
          ZZP Calc
        </span>
        <span className="text-[10px] text-slate-500 ml-auto">
          {new Date(ts).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <div className="text-[11px] text-slate-400 mb-1">
        Omzet {formatEuro(revenue)} {p.input?.mode === "month" ? "/mnd" : "/jr"}
      </div>
      <div className="font-mono font-bold text-cyan-400 text-base">{formatEuro(netAnnual)}</div>
      <div className="text-[10px] text-slate-500">{formatEuro(netMonthly)}/mnd netto</div>
    </div>
  );
}

function formatEuro(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
