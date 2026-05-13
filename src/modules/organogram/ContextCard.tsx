import { Network } from "lucide-react";
import type { ContextCardProps } from "../_types";

type Payload =
  | { input?: { roleName: string }; output?: { found: boolean; role?: string; level?: number; path: string[] } }
  | { totalNodes: number; maxDepth: number };

export default function ContextCard({ payload, ts }: ContextCardProps) {
  const p = payload as Payload;
  const queryStyle = "input" in p && p.input;

  return (
    <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <Network className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
          Organogram
        </span>
        <span className="text-[10px] text-slate-500 ml-auto">
          {new Date(ts).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      {queryStyle ? (
        <>
          <div className="text-[11px] text-slate-300 mb-1">
            Zoek: <span className="font-mono">"{(p as { input: { roleName: string } }).input.roleName}"</span>
          </div>
          {(p as { output?: { found: boolean; role?: string; level?: number; path: string[] } }).output?.found ? (
            <div className="text-[11px] text-purple-300">
              {(p as { output: { role: string; level: number } }).output.role} · niveau{" "}
              {(p as { output: { level: number } }).output.level}
            </div>
          ) : (
            <div className="text-[11px] text-rose-300">Niet gevonden</div>
          )}
        </>
      ) : (
        <div className="text-[11px] text-slate-400">
          {(p as { totalNodes: number }).totalNodes} rollen ·{" "}
          {(p as { maxDepth: number }).maxDepth} niveaus diep
        </div>
      )}
    </div>
  );
}
