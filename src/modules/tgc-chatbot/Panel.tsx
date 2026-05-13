import { useState, useRef, useEffect } from "react";
import { Clock, Send, Loader2, Globe, Bot, User } from "lucide-react";
import { trpc } from "@/providers/trpc";
import type { PanelProps } from "../_types";

type Msg = { role: "user" | "assistant"; content: string; ts: number };

const LANG_LABELS: Record<string, string> = {
  NL: "Welkom bij de Time Gap Cashflow Chatbot. Hoe kan ik je helpen?",
  EN: "Welcome to the Time Gap Cashflow Chatbot. How can I assist you?",
  DE: "Willkommen beim Time Gap Cashflow Chatbot.",
  FR: "Bienvenue sur le Time Gap Cashflow Chatbot.",
  ES: "Bienvenido al Time Gap Cashflow Chatbot.",
};

export default function Panel({ onResult }: PanelProps) {
  const [language, setLanguage] = useState<"NL" | "EN" | "DE" | "FR" | "ES">("NL");
  const [detailLevel, setDetailLevel] = useState<"short" | "normal" | "extensive">("normal");
  const [messages, setMessages] = useState<Msg[]>(() => [
    { role: "assistant", content: LANG_LABELS.NL, ts: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const invoke = trpc.modules.invoke.useMutation();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const q = input.trim();
    if (!q || invoke.isPending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: q, ts: Date.now() }]);

    invoke.mutate(
      {
        moduleId: "tgc-chatbot",
        capability: "ask",
        input: { question: q, language, detailLevel },
      },
      {
        onSuccess: (result) => {
          if (result.ok) {
            const data = result.data as { answer: string };
            setMessages((m) => [
              ...m,
              { role: "assistant", content: data.answer, ts: Date.now() },
            ]);
            onResult?.({ capability: "ask", output: data });
          } else {
            setMessages((m) => [
              ...m,
              {
                role: "assistant",
                content: `⚠️ ${result.error ?? "Onbekende fout"}`,
                ts: Date.now(),
              },
            ]);
          }
        },
        onError: (err) => {
          setMessages((m) => [
            ...m,
            { role: "assistant", content: `⚠️ ${err.message}`, ts: Date.now() },
          ]);
        },
      },
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
            <Clock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">TGC Chatbot</h2>
            <p className="text-xs text-slate-400">Time Gap Cash Flow expert</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-900/60 border border-slate-800 rounded-lg">
            <Globe className="w-3 h-3 text-slate-500" />
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as "NL" | "EN" | "DE" | "FR" | "ES")
              }
              title="Select language"
              className="bg-transparent text-[11px] font-bold text-slate-300 outline-none cursor-pointer"
            >
              {Object.keys(LANG_LABELS).map((l) => (
                <option key={l} value={l} className="bg-slate-900">
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 border border-slate-700 text-indigo-400"
              }`}
            >
              {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div
              className={`max-w-[80%] px-3 py-2 rounded-xl text-[12px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-slate-900/60 border border-slate-800 text-slate-300 rounded-tl-none"
              }`}
            >
              {msg.content.split("\n").map((line, idx) => (
                <p key={idx} className="mb-1 last:mb-0">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
        {invoke.isPending && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-xl rounded-tl-none">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="pt-3 border-t border-indigo-500/20 space-y-3">
        <div className="flex gap-1 p-1 bg-slate-900/60 border border-slate-800 rounded-lg">
          {(["short", "normal", "extensive"] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setDetailLevel(lvl)}
              className={`flex-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition ${
                detailLevel === lvl
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {lvl === "short" ? "Kort" : lvl === "normal" ? "Balans" : "Uitgebreid"}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Stel een vraag over TGC…"
            disabled={invoke.isPending}
            className="flex-1 px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || invoke.isPending}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center"
          >
            {invoke.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
