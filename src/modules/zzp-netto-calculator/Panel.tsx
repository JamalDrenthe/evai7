import { useState, useEffect } from "react";
import { Calculator, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { PanelProps } from "../_types";

type Output = {
  profit: number;
  netAnnual: number;
  netMonthly: number;
  netHourly: number;
  finalIncomeTax: number;
  zvw: number;
  netVatPayable: number;
  reservationTotal: number;
  taxPressureProfit: number;
  taxPressureRevenue: number;
};

const DEFAULT_INPUT = {
  revenue: 100000,
  costs: 15000,
  revenueVatRate: 21 as 0 | 9 | 21,
  costsVatRate: 21 as 0 | 9 | 21,
  revenueType: "ex" as "ex" | "incl",
  costsType: "ex" as "ex" | "incl",
  isStarter: false,
  meetsHourCriterion: true,
  mode: "year" as "year" | "month",
};

export default function Panel({ initialInput, onResult }: PanelProps) {
  const [input, setInput] = useState(() => ({
    ...DEFAULT_INPUT,
    ...((initialInput as Partial<typeof DEFAULT_INPUT>) ?? {}),
  }));

  const invoke = trpc.modules.invoke.useMutation();

  useEffect(() => {
    invoke.mutate(
      {
        moduleId: "zzp-netto-calculator",
        capability: "calculate-netto",
        input,
      },
      {
        onSuccess: (result) => {
          if (result.ok && onResult) {
            onResult({ capability: "calculate-netto", output: result.data });
          }
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.revenue, input.costs, input.revenueVatRate, input.costsVatRate, input.revenueType, input.costsType, input.isStarter, input.meetsHourCriterion, input.mode]);

  const result = invoke.data;
  const output: Output | undefined = result?.ok ? (result.data as Output) : undefined;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-cyan-500/20">
        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
          <Calculator className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">ZZP Netto Calculator</h2>
          <p className="text-xs text-slate-400">Bereken je netto inkomen (NL, 2025)</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ToggleGroup
          label="Periode"
          value={input.mode}
          options={[
            { value: "year", label: "Jaar" },
            { value: "month", label: "Maand" },
          ]}
          onChange={(v) => setInput({ ...input, mode: v as "year" | "month" })}
        />
        <ToggleGroup
          label="Status"
          value={input.isStarter ? "starter" : "regular"}
          options={[
            { value: "regular", label: "Regulier" },
            { value: "starter", label: "Starter" },
          ]}
          onChange={(v) => setInput({ ...input, isStarter: v === "starter" })}
        />
      </div>

      <NumberField
        label={`Omzet (${input.mode === "year" ? "per jaar" : "per maand"})`}
        value={input.revenue}
        onChange={(v) => setInput({ ...input, revenue: v })}
      />
      <NumberField
        label={`Kosten (${input.mode === "year" ? "per jaar" : "per maand"})`}
        value={input.costs}
        onChange={(v) => setInput({ ...input, costs: v })}
      />

      <div className="grid grid-cols-2 gap-3">
        <ToggleGroup
          label="Omzet BTW"
          value={`${input.revenueVatRate}-${input.revenueType}`}
          options={[
            { value: "21-ex", label: "21% ex" },
            { value: "21-incl", label: "21% in" },
            { value: "9-ex", label: "9% ex" },
            { value: "0-ex", label: "0%" },
          ]}
          onChange={(v) => {
            const [rate, type] = v.split("-");
            setInput({
              ...input,
              revenueVatRate: Number(rate) as 0 | 9 | 21,
              revenueType: type as "ex" | "incl",
            });
          }}
        />
        <ToggleGroup
          label="Kosten BTW"
          value={`${input.costsVatRate}-${input.costsType}`}
          options={[
            { value: "21-ex", label: "21% ex" },
            { value: "21-incl", label: "21% in" },
            { value: "9-ex", label: "9% ex" },
            { value: "0-ex", label: "0%" },
          ]}
          onChange={(v) => {
            const [rate, type] = v.split("-");
            setInput({
              ...input,
              costsVatRate: Number(rate) as 0 | 9 | 21,
              costsType: type as "ex" | "incl",
            });
          }}
        />
      </div>

      <div className="pt-4 border-t border-cyan-500/20 space-y-3">
        {invoke.isPending && !output ? (
          <div className="flex items-center justify-center py-8 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : output ? (
          <>
            <ResultCard
              big
              label="Netto per jaar"
              value={output.netAnnual}
              accent="cyan"
            />
            <div className="grid grid-cols-3 gap-2">
              <ResultCard label="Per maand" value={output.netMonthly} />
              <ResultCard label="Per uur" value={output.netHourly} compact />
              <ResultCard label="Reserveer" value={output.reservationTotal} accent="amber" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-lg flex justify-between">
                <span>Belasting</span>
                <span className="font-mono text-rose-400">
                  {formatEuro(output.finalIncomeTax + output.zvw)}
                </span>
              </div>
              <div className="px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-lg flex justify-between">
                <span>BTW saldo</span>
                <span className="font-mono text-amber-400">
                  {formatEuro(output.netVatPayable)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-cyan-500/5 border border-cyan-500/20 rounded-lg text-[11px] text-cyan-300">
              <span>Belastingdruk:</span>
              <span className="font-bold">{output.taxPressureProfit.toFixed(1)}%</span>
              <span className="text-slate-500">van winst</span>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-500 text-sm py-8">
            Vul je gegevens in om te berekenen
          </div>
        )}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
        {label}
      </span>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
          €
        </span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full pl-8 pr-3 py-2.5 bg-slate-900/60 border border-slate-800 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
        />
      </div>
    </label>
  );
}

function ToggleGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
        {label}
      </span>
      <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-800 rounded-lg">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-2 py-1.5 text-[11px] font-medium rounded-md transition ${
              value === opt.value
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultCard({
  label,
  value,
  big,
  compact,
  accent = "default",
}: {
  label: string;
  value: number;
  big?: boolean;
  compact?: boolean;
  accent?: "default" | "cyan" | "amber";
}) {
  const accentColor =
    accent === "cyan"
      ? "text-cyan-400 border-cyan-500/30 bg-cyan-500/5"
      : accent === "amber"
        ? "text-amber-400 border-amber-500/30 bg-amber-500/5"
        : "text-white border-slate-800 bg-slate-900/50";
  return (
    <div
      className={`p-3 rounded-lg border ${accentColor} ${big ? "text-center py-5" : ""}`}
    >
      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </div>
      <div
        className={`font-mono font-bold ${big ? "text-3xl" : compact ? "text-sm" : "text-base"}`}
      >
        {formatEuro(value)}
      </div>
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
