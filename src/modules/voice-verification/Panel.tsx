import { Mic } from "lucide-react";
import type { PanelProps } from "../_types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Panel(_props: PanelProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
          <Mic className="w-5 h-5 text-slate-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Voice Verification</h2>
          <p className="text-xs text-slate-400">Placeholder - Python sidecar source code pending from user</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
        <p className="text-slate-400 text-sm">
          Voice verification UI will be implemented when Python sidecar source code is provided.
        </p>
      </div>
    </div>
  );
}
