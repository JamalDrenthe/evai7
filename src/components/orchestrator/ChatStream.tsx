import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Square, Wrench, CheckCircle2, AlertCircle } from "lucide-react";
import type { ChatMessage, ToolInvocation } from "@/hooks/useOrchestrator";

type Props = {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  onSend: (text: string) => void;
  onStop: () => void;
  placeholder?: string;
  emptyHint?: string;
  /** Subtext shown under the empty hint. Set to null to hide. */
  emptySubtext?: string | null;
};

export function ChatStream({
  messages,
  isStreaming,
  error,
  onSend,
  onStop,
  placeholder = "Stel een vraag…",
  emptyHint = "Begin een gesprek met EVAI",
  emptySubtext = "Probeer: \"Bereken mijn ZZP netto bij €100k omzet\" of \"Wat is Time Gap Cash Flow?\"",
}: Props) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    onSend(text);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-600/20 border border-cyan-500/30 flex items-center justify-center mb-4">
              <Bot className="w-7 h-7 text-cyan-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">{emptyHint}</h3>
            {emptySubtext ? (
              <p className="text-xs text-slate-500 max-w-xs">{emptySubtext}</p>
            ) : null}
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
        )}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-[12px] text-rose-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={placeholder}
            disabled={isStreaming}
            className="flex-1 px-4 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition flex items-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
          isUser
            ? "bg-cyan-600 text-white"
            : "bg-slate-800 border border-slate-700 text-cyan-400"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="space-y-1.5">
            {msg.toolCalls.map((t) => (
              <ToolBadge key={t.callId} invocation={t} />
            ))}
          </div>
        )}
        {msg.text && (
          <div
            className={`px-3 py-2 rounded-xl text-[12px] leading-relaxed whitespace-pre-wrap ${
              isUser
                ? "bg-cyan-600 text-white rounded-tr-none"
                : "bg-slate-900/60 border border-slate-800 text-slate-200 rounded-tl-none"
            }`}
          >
            {msg.text}
            {!isUser && msg.text === "" && (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolBadge({ invocation }: { invocation: ToolInvocation }) {
  const isRunning = invocation.status === "running";
  const isError = invocation.status === "error";
  const Icon = isError ? AlertCircle : isRunning ? Loader2 : CheckCircle2;
  const colors = isError
    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
    : isRunning
      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";

  return (
    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-medium ${colors}`}>
      <Icon className={`w-3 h-3 ${isRunning ? "animate-spin" : ""}`} />
      <Wrench className="w-3 h-3 opacity-60" />
      <span className="font-mono">{invocation.moduleId}</span>
      <span className="opacity-60">·</span>
      <span>{invocation.capability}</span>
      {invocation.durationMs !== undefined && (
        <span className="opacity-60 text-[10px]">{invocation.durationMs}ms</span>
      )}
    </div>
  );
}
