import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { PanelProps } from "../_types";

type Phase = "idle" | "recording" | "verifying" | "done";
type Result = { match: boolean; confidence: number; note: string };

function mockVerify(speakerId: string, sampleSeconds: number): Result {
  let h = 0;
  for (let i = 0; i < speakerId.length; i++) h = (h * 31 + speakerId.charCodeAt(i)) >>> 0;
  const base = (h % 100) / 100;
  const lenBoost = Math.min(0.25, sampleSeconds / 20);
  const confidence = Math.min(0.99, base * 0.6 + lenBoost + 0.2);
  return {
    match: confidence >= 0.6,
    confidence,
    note: "Deterministische demo-mock (Python sidecar niet beschikbaar).",
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Panel(_props: PanelProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [speakerId, setSpeakerId] = useState("user-demo");
  const [waveform, setWaveform] = useState<number[]>(Array.from({ length: 48 }, () => 6));
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const startTsRef = useRef<number>(0);

  useEffect(() => {
    if (phase !== "recording") return;
    startTsRef.current = Date.now();
    const interval = window.setInterval(() => {
      setWaveform(Array.from({ length: 48 }, () => Math.random() * 38 + 6));
      setSeconds((Date.now() - startTsRef.current) / 1000);
    }, 90);
    return () => window.clearInterval(interval);
  }, [phase]);

  const start = () => {
    setResult(null);
    setSeconds(0);
    setPhase("recording");
  };

  const stop = () => {
    const elapsed = Math.max(0.5, (Date.now() - startTsRef.current) / 1000);
    setPhase("verifying");
    window.setTimeout(() => {
      setResult(mockVerify(speakerId, elapsed));
      setPhase("done");
      setWaveform(Array.from({ length: 48 }, () => 6));
    }, 700);
  };

  const reset = () => {
    setResult(null);
    setSeconds(0);
    setPhase("idle");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-2 bg-pink-500/15 rounded-lg border border-pink-500/30">
          <Mic className="w-5 h-5 text-pink-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Voice Verification</h2>
          <p className="text-xs text-slate-400">
            Demo-mock — echte verificatie loopt via Python sidecar (zet <code className="text-pink-300">PYTHON_BRIDGE_URL</code> in .env)
          </p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <label htmlFor="speaker-id" className="text-[12px] text-slate-400 shrink-0">Speaker ID</label>
          <input
            id="speaker-id"
            type="text"
            value={speakerId}
            onChange={(e) => setSpeakerId(e.target.value)}
            disabled={phase === "recording" || phase === "verifying"}
            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-[13px] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-500/40 disabled:opacity-50 font-mono"
          />
        </div>

        <div className="flex items-end justify-center gap-1 h-20 mb-4">
          {waveform.map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full transition-all duration-100"
              style={{
                height: `${h}px`,
                backgroundColor: phase === "recording" ? "#ec4899" : "#1e293b",
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-3">
          {phase === "idle" && (
            <button
              onClick={start}
              disabled={!speakerId.trim()}
              className="px-5 py-2.5 rounded-lg bg-pink-500 text-white text-[13px] font-semibold hover:bg-pink-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Mic size={14} /> Start opname
            </button>
          )}
          {phase === "recording" && (
            <>
              <span className="text-[12px] text-pink-300 font-mono tabular-nums">{seconds.toFixed(1)}s</span>
              <button
                onClick={stop}
                className="px-5 py-2.5 rounded-lg bg-pink-500 text-white text-[13px] font-semibold hover:bg-pink-400 transition-colors flex items-center gap-2"
              >
                <Square size={14} /> Stop
              </button>
            </>
          )}
          {phase === "verifying" && (
            <span className="px-5 py-2.5 rounded-lg bg-slate-800 text-slate-200 text-[13px] font-semibold flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Verifiëren…
            </span>
          )}
          {phase === "done" && (
            <button
              onClick={reset}
              className="px-5 py-2.5 rounded-lg bg-slate-800 text-slate-200 text-[13px] font-semibold hover:bg-slate-700 transition-colors"
            >
              Nieuwe opname
            </button>
          )}
        </div>
      </div>

      {result && (
        <div
          className={`rounded-xl p-5 ring-2 ${
            result.match ? "ring-emerald-500/40 bg-emerald-500/10" : "ring-red-500/40 bg-red-500/10"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {result.match ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-300" />
              ) : (
                <XCircle className="w-7 h-7 text-red-300" />
              )}
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Resultaat</p>
                <p className={`text-xl font-bold ${result.match ? "text-emerald-200" : "text-red-200"}`}>
                  {result.match ? "Match" : "Mismatch"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-slate-400">Confidence</p>
              <p className="text-xl font-bold text-slate-100 tabular-nums">{(result.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">{result.note}</p>
        </div>
      )}
    </div>
  );
}
