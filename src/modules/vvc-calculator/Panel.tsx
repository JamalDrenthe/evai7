import { useState, useEffect } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { PanelProps } from "../_types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type ChartPoint = {
  name: string;
  Uurloon: number;
  Bonussen: number;
  Passief: number;
  Totaal: number;
  Accumulated: number;
};

type Output = {
  monthlyBaseSalary: number;
  monthlyBonus: number;
  yearEndMonthlyIncome: number;
  totalYearEarnings: number;
  totalVrienden: number;
  monthByMonth: ChartPoint[];
};

const DEFAULT_INPUT = {
  hoursPerWeek: 20,
  placementsPerMonth: 10,
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
        moduleId: "vvc-calculator",
        capability: "project-earnings",
        input,
      },
      {
        onSuccess: (result) => {
          if (result.ok && onResult) {
            onResult({ capability: "project-earnings", output: result.data });
          }
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input.hoursPerWeek, input.placementsPerMonth]);

  const result = invoke.data;
  const output: Output | undefined = result?.ok ? (result.data as Output) : undefined;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-yellow-500/20">
        <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <Calculator className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">VVC Calculator</h2>
          <p className="text-xs text-slate-400">Verdienende Vrienden Club inkomsten</p>
        </div>
      </div>

      {/* Input sliders */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Uren per week: {input.hoursPerWeek}
          </label>
          <input
            type="range"
            min="0"
            max="40"
            value={input.hoursPerWeek}
            onChange={(e) => setInput((prev) => ({ ...prev, hoursPerWeek: Number(e.target.value) }))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            aria-label="Uren per week"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Plaatsingen per maand: {input.placementsPerMonth}
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={input.placementsPerMonth}
            onChange={(e) => setInput((prev) => ({ ...prev, placementsPerMonth: Number(e.target.value) }))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            aria-label="Plaatsingen per maand"
          />
        </div>
      </div>

      {/* Result cards */}
      {output && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Inkomen Maand 12</div>
              <div className="text-2xl font-bold text-yellow-400">
                €{output.yearEndMonthlyIncome.toLocaleString("nl-NL", { maximumFractionDigits: 0 })}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">Jaartotaal</div>
              <div className="text-2xl font-bold text-white">
                €{output.totalYearEarnings.toLocaleString("nl-NL", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Maandelijkse ontwikkeling</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={output.monthByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "#334155", borderRadius: "8px" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Uurloon"
                  stackId="1"
                  stroke="#64748b"
                  fill="#64748b"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="Bonussen"
                  stackId="1"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="Passief"
                  stackId="1"
                  stroke="#eab308"
                  fill="url(#yellowGradient)"
                  fillOpacity={0.8}
                />
                <defs>
                  <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Info card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div className="text-xs text-slate-400 space-y-1">
                <div><strong className="text-slate-300">Model:</strong> Uurloon (€30/uur) + Bonussen (€300/plaatsing) + Passief inkomen (€25/vriend/maand)</div>
                <div><strong className="text-slate-300">Vrienden:</strong> {output.totalVrienden} totaal over 12 maanden</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
