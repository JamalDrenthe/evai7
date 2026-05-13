import { Calculator } from "lucide-react";
import type { ContextCardProps } from "../_types";

type Output = {
  monthlyBaseSalary: number;
  monthlyBonus: number;
  yearEndMonthlyIncome: number;
  totalYearEarnings: number;
  totalVrienden: number;
};

export default function ContextCard({ payload }: ContextCardProps) {
  const output = payload as Output;
  return (
    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="w-4 h-4 text-yellow-400" />
        <span className="text-xs font-bold text-yellow-400">VVC Calculator</span>
      </div>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Maand 12 inkomen:</span>
          <span className="text-white font-medium">€{output.yearEndMonthlyIncome.toLocaleString("nl-NL", { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Jaartotaal:</span>
          <span className="text-white font-medium">€{output.totalYearEarnings.toLocaleString("nl-NL", { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Totaal vrienden:</span>
          <span className="text-white font-medium">{output.totalVrienden}</span>
        </div>
      </div>
    </div>
  );
}
