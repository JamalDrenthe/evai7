import { useRef, useState, useEffect } from "react";
import { Network, Send, User, Sparkles } from "lucide-react";
import type { PanelProps } from "../_types";

type Topic = { topic: string; keywords: string[]; response: string; modules: string[] };

const TOPICS: Topic[] = [
  {
    topic: "Calculators",
    keywords: ["bereken", "calculator", "zzp", "vvc", "mining", "estate", "vastgoed", "netto", "belasting"],
    response:
      "Het ecosysteem heeft 4 calculators:\n• **ZZP Netto** — Nederlandse 2025 belastingberekening\n• **VVC** — Inkomsten Verdienende Vrienden Club\n• **Mining** — Streaming-revenue (Spotify/Apple/YouTube)\n• **Estate** — Vastgoed-vliegwiel acquisitie",
    modules: ["zzp-netto-calculator", "vvc-calculator", "mining-calculator", "estate-calculator"],
  },
  {
    topic: "Chatbots",
    keywords: ["chat", "chatbot", "vraag", "tgc", "kennis", "advies"],
    response:
      "Drie functionele chatbots:\n• **TGC** — multilingual cashflow expert\n• **VVC** — verdienmodel + cultuur KB\n• **Ecosysteem** — dat ben ik :)",
    modules: ["tgc-chatbot", "vvc-chatbot"],
  },
  {
    topic: "Productiviteit",
    keywords: ["taken", "kanban", "takenblok", "organogram", "team", "werk", "agenda"],
    response:
      "Productiviteit:\n• **Takenblok** — kanban gevoed door /werk\n• **Organogram** — bedrijfsstructuur\n• **/agenda** — maandkalender met events\n• **/werk** — taken-overzicht met KPI's",
    modules: ["takenblok", "organogram"],
  },
  {
    topic: "Verificatie",
    keywords: ["verificatie", "stem", "voice", "kyc", "identiteit"],
    response:
      "Verificatie:\n• **Verification** — KYC formulier\n• **Voice Verification** — stemverificatie met waveform",
    modules: ["verification", "voice-verification"],
  },
  {
    topic: "Visualisatie",
    keywords: ["grafiek", "chart", "visualisatie", "bar", "line"],
    response: "**Visualization** module bouwt line/bar charts uit context-variabelen.",
    modules: ["visualization"],
  },
  {
    topic: "Hoe werkt EVAI",
    keywords: ["hoe", "werkt", "ecosysteem", "evai", "platform", "wat is"],
    response:
      "EVAI is een **AI operating system voor tools**. Eén chat-gedreven workspace waar de LLM modules als typed function calls aanroept, met gedeelde sessie-context. Drie modes: Chat-with-Calculators, Chat-with-Projects, Direct Tool.",
    modules: [],
  },
];

const FALLBACK = {
  topic: "Algemeen",
  response:
    "Ik help je navigeren door het EVAI ecosysteem. Vraag bijvoorbeeld: 'Welke calculator voor mijn ZZP belasting?', 'Hoe werkt het takenblok?', of 'Wat is EVAI?'.",
  modules: [] as string[],
};

function route(query: string) {
  const lower = query.toLowerCase();
  for (const t of TOPICS) {
    if (t.keywords.some((k) => lower.includes(k))) return t;
  }
  return FALLBACK;
}

type Msg = { id: number; sender: "bot" | "user"; text: string; modules?: string[] };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Panel(_props: PanelProps) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      sender: "bot",
      text: "Hoi! Ik route je naar de juiste tool in EVAI. Vraag bijvoorbeeld _'Welke calculator gebruik ik voor mijn ZZP belasting?'_ of _'Hoe werkt het Takenblok?'_.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const suggestions = [
    "Welke calculator voor ZZP?",
    "Hoe werkt het takenblok?",
    "Wat is EVAI?",
    "Hoe verifieer ik een stem?",
  ];

  const ask = (raw?: string) => {
    const q = (raw ?? input).trim();
    if (!q) return;
    const user: Msg = { id: Date.now(), sender: "user", text: q };
    setMessages((m) => [...m, user]);
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      const result = route(q);
      const bot: Msg = {
        id: Date.now() + 1,
        sender: "bot",
        text: result.response,
        modules: result.modules,
      };
      setMessages((m) => [...m, bot]);
      setTyping(false);
    }, 450);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-160px)] space-y-3">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div className="p-2 bg-blue-500/15 rounded-lg border border-blue-500/30">
          <Network className="w-5 h-5 text-blue-300" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Ecosysteem Chatbot</h2>
          <p className="text-xs text-slate-400">Router voor het hele EVAI platform</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 ${m.sender === "user" ? "justify-end" : ""}`}>
            {m.sender === "bot" && (
              <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-line ${
              m.sender === "user"
                ? "bg-cyan-500 text-slate-950 font-medium"
                : "bg-slate-900 border border-slate-800 text-slate-200"
            }`}>
              {m.text}
              {m.modules && m.modules.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.modules.map((mod) => (
                    <span key={mod} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
                      {mod}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {m.sender === "user" && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[13px] text-slate-400">
              <span className="inline-flex gap-1">
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:border-blue-500/40 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="Stel een vraag over EVAI…"
          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[13px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <button
          onClick={() => ask()}
          disabled={!input.trim() || typing}
          className="px-3 py-2 rounded-xl bg-blue-500 text-white text-[12px] font-semibold hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
