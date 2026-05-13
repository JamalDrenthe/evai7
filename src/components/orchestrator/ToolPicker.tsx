import { Search, Wrench } from "lucide-react";
/* 
 * Note: This file uses inline styles for dynamic color values that cannot 
 * be expressed in static CSS. These are necessary for the dynamic nature of the module colors.
 */
import { useState } from "react";
import { listFrontendModules } from "@/modules/_registry";

type Props = {
  mode: "chat-calculators" | "chat-projects" | "direct-tool";
  onSelect: (moduleId: string) => void;
  onClose: () => void;
};

export function ToolPicker({ mode, onSelect, onClose }: Props) {
  const [search, setSearch] = useState("");
  const modules = listFrontendModules().filter((m) => {
    const matchesMode = mode === "direct-tool" || 
      (mode === "chat-calculators" && m.type === "calculator") ||
      (mode === "chat-projects" && m.type !== "calculator");
    const matchesSearch = search === "" || 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    return matchesMode && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
              <Wrench className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Select Tool</h2>
              <p className="text-xs text-slate-400">
                {mode === "chat-calculators" ? "Calculators available" : 
                 mode === "chat-projects" ? "Chatbots and tools available" : 
                 "All tools available"}
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-2">
            {modules.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No tools found matching "{search}"
              </div>
            ) : (
              modules.map((module) => {
                const Icon = module.icon;
                return (
                  <button
                    key={module.id}
                    onClick={() => {
                      onSelect(module.id);
                      onClose();
                    }}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 rounded-lg transition text-left group"
                  >
                    <div 
                      className="p-2 rounded-lg border"
                      style={{ 
                        backgroundColor: `${module.color}20`,
                        borderColor: `${module.color}40`
                      }}
                    >
                      {typeof Icon === 'string' ? <span>{Icon}</span> : <Icon className="w-4 h-4" style={{ color: module.color }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white group-hover:text-cyan-400 transition">
                        {module.name}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {module.description}
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300 capitalize">
                      {module.type}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
