import { Clock } from "lucide-react";
import type { ContextCardProps } from "../_types";

type Payload = {
  input?: { question: string; language: string };
  output?: { answer: string };
};

export default function ContextCard({ payload, ts }: ContextCardProps) {
  const p = payload as Payload;
  const q = p.input?.question ?? "";
  const a = p.output?.answer ?? "";
  return (
    <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
          TGC
        </span>
        {p.input?.language && (
          <span className="text-[9px] text-slate-500 px-1.5 py-0.5 bg-slate-900 rounded">
            {p.input.language}
          </span>
        )}
        <span className="text-[10px] text-slate-500 ml-auto">
          {new Date(ts).toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div className="text-[11px] text-slate-300 mb-1.5 italic line-clamp-2">
        "{q}"
      </div>
      <div className="text-[11px] text-slate-400 line-clamp-3">{a}</div>
    </div>
  );
}
