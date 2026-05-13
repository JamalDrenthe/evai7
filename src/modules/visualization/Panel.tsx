import { useMemo, useState } from "react";
import { BarChart3, LineChart as LineIcon, AreaChart as AreaIcon } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { PanelProps } from "../_types";

type ChartKind = "line" | "bar" | "area";

const SAMPLE: Record<string, Array<Record<string, string | number>>> = {
  "Maandelijkse omzet": [
    { month: "Jan", omzet: 12500, kosten: 6800 },
    { month: "Feb", omzet: 14200, kosten: 7100 },
    { month: "Mrt", omzet: 17900, kosten: 8200 },
    { month: "Apr", omzet: 16100, kosten: 7400 },
    { month: "Mei", omzet: 19800, kosten: 8900 },
    { month: "Jun", omzet: 22500, kosten: 9700 },
  ],
  "Streams per platform": [
    { platform: "Spotify", streams: 5_200_000 },
    { platform: "Apple", streams: 1_800_000 },
    { platform: "YouTube", streams: 2_400_000 },
    { platform: "Tidal", streams: 320_000 },
    { platform: "Amazon", streams: 410_000 },
  ],
  "Vastgoed groei": [
    { jaar: "Y1", woningen: 1, marge: 500 },
    { jaar: "Y2", woningen: 3, marge: 1500 },
    { jaar: "Y3", woningen: 7, marge: 3500 },
    { jaar: "Y4", woningen: 14, marge: 7000 },
    { jaar: "Y5", woningen: 25, marge: 12500 },
  ],
};

const COLORS = ["#7a56f6", "#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Panel(_props: PanelProps) {
  const [datasetName, setDatasetName] = useState<keyof typeof SAMPLE>("Maandelijkse omzet");
  const [kind, setKind] = useState<ChartKind>("line");

  const data = SAMPLE[datasetName];
  const xKey = useMemo(() => Object.keys(data[0] ?? {})[0] ?? "", [data]);
  const yKeys = useMemo(
    () => Object.keys(data[0] ?? {}).filter((k) => k !== xKey),
    [data, xKey],
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/15 rounded-lg border border-purple-500/30">
            <BarChart3 className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Visualization</h2>
            <p className="text-xs text-slate-400">Chart builder met Recharts</p>
          </div>
        </div>
        <div className="flex gap-1 p-1 rounded-lg bg-slate-900 border border-slate-800">
          {([
            { id: "line" as const, Icon: LineIcon },
            { id: "bar" as const, Icon: BarChart3 },
            { id: "area" as const, Icon: AreaIcon },
          ]).map(({ id, Icon }) => (
            <button
              key={id}
              onClick={() => setKind(id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                kind === id ? "bg-purple-500/20 text-purple-200" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon size={12} />
              {id}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <label htmlFor="viz-dataset" className="sr-only">Dataset</label>
        <select
          id="viz-dataset"
          value={datasetName}
          onChange={(e) => setDatasetName(e.target.value as keyof typeof SAMPLE)}
          className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[12px] text-slate-200"
        >
          {Object.keys(SAMPLE).map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
        <span className="text-[11px] text-slate-500 self-center">
          {data.length} datapunten · {yKeys.length} {yKeys.length === 1 ? "serie" : "series"}
        </span>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
        <p className="text-[12px] font-semibold text-slate-300 mb-3">{datasetName}</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            {kind === "line" ? (
              <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey={xKey} stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {yKeys.map((k, i) => (
                  <Line key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
                ))}
              </LineChart>
            ) : kind === "bar" ? (
              <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey={xKey} stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {yKeys.map((k, i) => (
                  <Bar key={k} dataKey={k} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            ) : (
              <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey={xKey} stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {yKeys.map((k, i) => (
                  <Area key={k} type="monotone" dataKey={k} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.18} />
                ))}
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <p className="text-[11px] text-slate-500">
        De LLM kan de <code className="text-purple-300">visualization.generate</code> capability aanroepen met een eigen dataset om hier een live chart te renderen.
      </p>
    </div>
  );
}
