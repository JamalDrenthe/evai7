import { Calculator, MessageSquare, Wrench } from "lucide-react";
import type { InteractionMode } from "../../../contracts/module-manifest";

type Props = {
  mode: InteractionMode;
  onChange: (mode: InteractionMode) => void;
};

const MODES: Array<{
  value: InteractionMode;
  label: string;
  hint: string;
  icon: typeof Calculator;
  color: string;
}> = [
  {
    value: "chat-calculators",
    label: "Calculators",
    hint: "Chat met alle rekentools",
    icon: Calculator,
    color: "cyan",
  },
  {
    value: "chat-projects",
    label: "Projects",
    hint: "Chat met alle projecten",
    icon: MessageSquare,
    color: "indigo",
  },
  {
    value: "direct-tool",
    label: "Direct",
    hint: "Gebruik tools rechtstreeks",
    icon: Wrench,
    color: "purple",
  },
];

export function ModeSwitcher({ mode, onChange }: Props) {
  return (
    <div className="inline-flex p-1 bg-slate-900/60 border border-slate-800 rounded-xl">
      {MODES.map((m) => {
        const Icon = m.icon;
        const active = mode === m.value;
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all ${
              active
                ? `bg-${m.color}-500/20 text-${m.color}-300 border border-${m.color}-500/30 shadow-lg`
                : "text-slate-400 hover:text-white"
            }`}
            title={m.hint}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
