import { BarChart } from "lucide-react";
import type { PanelProps } from "../_types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Panel(_props: PanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
          <BarChart className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Visualization</h2>
          <p className="text-xs text-slate-400">Placeholder - source code pending from user</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
        <p className="text-slate-400 text-sm">
          Visualization UI will be implemented when source code is provided.
        </p>
      </div>
    </div>
  );
}
