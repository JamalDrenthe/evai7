import { Mic } from "lucide-react";
import type { ContextCardProps } from "../_types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ContextCard(_props: ContextCardProps) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Mic className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-300">Voice Verification</span>
      </div>
      <div className="text-xs text-slate-400">Placeholder - Python sidecar pending</div>
    </div>
  );
}
