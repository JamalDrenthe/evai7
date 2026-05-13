import { useState, useEffect, useRef, Fragment } from "react";
import {
  Send,
  User,
  Sparkles,
  DollarSign,
  Users,
  ShieldCheck,
  ArrowRight,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { PanelProps } from "../_types";

type Msg = { id: number; sender: "bot" | "user"; text: string };

type Suggestion = { label: string; icon: React.ReactNode };

const KB: Array<{ keywords: string[]; response: string }> = [
  {
    keywords: ["verdien", "geld", "salaris", "inkomen", "betaald", "30", "300", "finance"],
    response:
      "Het VVC Verdienmodel: Een Blueprint voor Groei.\n\n1. **Actief (Basis):** €30,- per uur gegarandeerd tijdens acquisitie.\n2. **Direct (Jacht):** €300,- bonus per succesvolle plaatsing. Direct uitbetaald.\n3. **Passief (Vermogen):** €25,- per maand per actieve kandidaat. Dit is het 'Sneeuwbaleffect'.\n\nRekenvoorbeeld: 10 plaatsingen/maand = €3.000,- passief inkomen na 12 maanden.",
  },
  {
    keywords: ["cultuur", "waarden", "sfeer", "normen", "dna"],
    response:
      "Het VVC DNA bestaat uit drie ononderhandelbare pijlers:\n\n1. **Loyaliteit:** Wij zijn partners, geen collega's. Geen politiek.\n2. **Executie:** Resultaat is de enige waarheid. Wij praten niet, wij leveren.\n3. **Eigenaarschap:** U bent de CEO van uw eigen route. Vrijheid met rugdekking van de club.",
  },
  {
    keywords: ["wat is vvc", "over ons", "wie zijn jullie", "bedrijf", "club"],
    response:
      "De Verdienende Vrienden Club opereert op het snijvlak van vriendschap en ongekende zakelijke groei. Wij elimineren ruis voor bedrijven door processen te optimaliseren, en bieden toptalent een podium zonder plafond.",
  },
  {
    keywords: ["diensten", "wat doen jullie", "klanten", "aanbod", "product"],
    response:
      "Onze 360° Kwaliteitsaanpak voor partners:\n\n• **Kwaliteitscontrole:** Grondige analyse van reviews & specificaties.\n• **Workflow Optimalisatie:** Het elimineren van inefficiëntie in systemen.\n• **Mystery Shopping:** De ongefilterde realiteit van de klantbeleving in kaart brengen.",
  },
  {
    keywords: ["double", "team", "pilot", "duo", "samenwerken"],
    response:
      "**Project: Double Team**\n\nDe perfecte symbiose van specialisme:\n\n1. **De Netwerker:** Opent deuren en bouwt relaties.\n2. **De Killer Closer:** Sluit de deal en verzilvert het contract.\n\nResultaat: 1 Team, 1 Taak. Gemiddelde output: €4.000,- p.p./maand.",
  },
  {
    keywords: ["passief", "sneeuwbal", "toekomst", "pensioen"],
    response:
      "**Het Sneeuwbaleffect**\n\nUw financiële motor. Elke plaatsing levert €25,-/maand op zolang de kandidaat blijft. Dit stapelt cumulatief op.\n\n• Maand 1: €250 (bij 10 plaatsingen)\n• Jaar 1: €3.000 /maand passief.\n\nDit is hoe u stopt met werken voor geld, en geld laat werken voor u.",
  },
];

const DEFAULT_FALLBACK =
  "Dat ligt buiten mijn huidige focusgebied.\n\nMijn expertise ligt bij:\n• Het Verdienmodel & Passief Inkomen\n• De 'Double Team' Strategie\n• Onze Cultuur van Executie";

function processInput(text: string): string {
  const lower = text.toLowerCase();
  for (const entry of KB) {
    if (entry.keywords.some((k) => lower.includes(k))) return entry.response;
  }
  return DEFAULT_FALLBACK;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Panel(_props: PanelProps) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      sender: "bot",
      text: "Welkom bij de Verdienende Vrienden Club.\n\nIk ben uw strategische partner voor vragen over ons verdienmodel, de cultuur van executie en onze kwaliteitsnormen.\n\nU bent aan zet. Waar starten we de route?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const suggestions: Suggestion[] = [
    { label: "Het Verdienmodel", icon: <DollarSign size={14} /> },
    { label: "Double Team Pilot", icon: <Users size={14} /> },
    { label: "Sneeuwbaleffect", icon: <Zap size={14} /> },
    { label: "Onze Cultuur", icon: <ShieldCheck size={14} /> },
  ];

  const handleSend = (override?: string) => {
    const q = (override ?? input).trim();
    if (!q) return;
    const userMsg: Msg = { id: Date.now(), sender: "user", text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const botMsg: Msg = {
        id: Date.now() + 1,
        sender: "bot",
        text: processInput(q),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 700);
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  const resetSession = () => {
    setMessages((prev) => [prev[0]]);
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F4F6] -m-6 rounded-none overflow-hidden">
      {/* Header */}
      <header className="bg-[#F3F4F6]/80 backdrop-blur-md px-6 py-4 border-b border-gray-200/60 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shadow-lg">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 leading-tight">VVC Live Support</h2>
            <p className="text-[11px] text-gray-500">Stel uw vragen over groei en processen.</p>
          </div>
        </div>
        <button
          onClick={resetSession}
          type="button"
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-black hover:text-black hover:bg-gray-50 transition-all shadow-sm"
        >
          Nieuwe Sessie
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-[92%] md:max-w-[80%] ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              } items-end gap-2.5`}
            >
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.sender === "user"
                    ? "bg-black text-white"
                    : "bg-white border border-gray-200 text-black"
                }`}
              >
                {msg.sender === "user" ? (
                  <User size={14} />
                ) : (
                  <Sparkles size={16} className="text-yellow-600" />
                )}
              </div>
              <div
                className={`relative p-4 text-[13px] leading-relaxed shadow-sm font-medium ${
                  msg.sender === "user"
                    ? "bg-black text-white rounded-2xl rounded-tr-sm"
                    : "bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-tl-sm"
                }`}
              >
                {msg.text.split("\n").map((line, i) => {
                  const isList =
                    line.startsWith("•") ||
                    /^\d+\./.test(line.trim());
                  return (
                    <Fragment key={i}>
                      <span className={isList ? "block mb-1 font-bold" : "block mb-1.5"}>
                        {line}
                      </span>
                    </Fragment>
                  );
                })}
                <div
                  className={`text-[10px] mt-1.5 text-gray-500 flex items-center gap-1 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <span className="font-bold uppercase tracking-wider text-black">VVC</span>
                  )}
                  <span>• Nu</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start w-full">
            <div className="flex items-end gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <Sparkles size={16} className="text-yellow-600" />
              </div>
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input area */}
      <div className="px-4 md:px-6 pt-2 pb-4 bg-gradient-to-t from-[#F3F4F6] via-[#F3F4F6] to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-end px-1 mb-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest text-gray-500 transition-opacity ${
                showSuggestions ? "opacity-100" : "opacity-0"
              }`}
            >
              Suggesties
            </span>
            <button
              onClick={() => setShowSuggestions((s) => !s)}
              type="button"
              className="text-gray-500 hover:text-black transition-colors p-1 rounded-lg hover:bg-white/60 flex items-center gap-1"
            >
              {showSuggestions ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden ${
              showSuggestions
                ? "max-h-24 opacity-100 translate-y-0 mb-2"
                : "max-h-0 opacity-0 translate-y-2 mb-0"
            }`}
          >
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.label)}
                  type="button"
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-full text-[11px] font-bold text-gray-700 shadow-sm hover:border-black hover:text-white hover:bg-black hover:shadow-md transition-all whitespace-nowrap"
                >
                  <span className="opacity-70 group-hover:opacity-100">{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center p-1.5 focus-within:ring-2 focus-within:ring-black/5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Typ uw bericht..."
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 border-none px-3 py-2.5 focus:ring-0 text-[13px] font-medium outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                type="button"
                className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                  input.trim()
                    ? "bg-black text-white shadow-lg hover:bg-gray-800 hover:scale-105 active:scale-95"
                    : "bg-gray-100 text-gray-300 cursor-default"
                }`}
              >
                {input.trim() ? <Send size={16} /> : <ArrowRight size={16} />}
              </button>
            </div>
          </div>

          <div className="text-center mt-2.5">
            <p className="text-[10px] text-gray-500 font-bold">
              Powered by <span className="text-black font-extrabold">VVC</span> • Executie is de sleutel
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
