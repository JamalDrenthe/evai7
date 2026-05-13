import { useMemo, useState } from "react";
import {
  Calculator,
  Disc,
  DollarSign,
  PieChart,
  AlertCircle,
  Receipt,
  Settings2,
  Smartphone,
  Cpu,
  Clock,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";
import type { PanelProps } from "../_types";

type Platform = {
  id: string;
  name: string;
  rate: number;
  percent: number;
};

const INITIAL_PLATFORMS: Platform[] = [
  { id: "spotify", name: "Spotify", rate: 3720, percent: 50 },
  { id: "apple", name: "Apple Music", rate: 4650, percent: 15 },
  { id: "youtube", name: "YouTube", rate: 1627.5, percent: 15 },
  { id: "tidal", name: "Tidal", rate: 11160, percent: 5 },
  { id: "amazon", name: "Amazon Music", rate: 4650, percent: 5 },
  { id: "deezer", name: "Deezer", rate: 4371, percent: 5 },
  { id: "pandora", name: "Pandora", rate: 1302, percent: 3 },
  { id: "soundcloud", name: "SoundCloud", rate: 1209, percent: 2 },
];

type SliderProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ariaLabel: string;
};

function Slider({ value, min = 0, max = 100, step = 1, onChange, ariaLabel }: SliderProps) {
  return (
    <div
      className="mining-slider-form"
      style={
        {
          ["--val" as string]: value,
          ["--min" as string]: min,
          ["--max" as string]: max,
        } as React.CSSProperties
      }
      suppressHydrationWarning
    >
      <input
        type="range"
        aria-label={ariaLabel}
        className="mining-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Panel(_props: PanelProps) {
  // Catalogus
  const [albums, setAlbums] = useState(2);
  const [tracksPerAlbum, setTracksPerAlbum] = useState(10);
  const [streamsPerTrack, setStreamsPerTrack] = useState(1_000_000);
  const [platforms, setPlatforms] = useState<Platform[]>(INITIAL_PLATFORMS);
  const [distributorFee, setDistributorFee] = useState(15);

  // Farm
  const [appleMinis, setAppleMinis] = useState(10);
  const farmDays = 365;

  // Sync
  const [isSynced, setIsSynced] = useState(false);

  const handleCatalogChange = (field: "albums" | "tracks" | "streams", value: number) => {
    const newAlbums = field === "albums" ? value : albums;
    const newTracks = field === "tracks" ? value : tracksPerAlbum;
    const newStreams = field === "streams" ? value : streamsPerTrack;
    if (field === "albums") setAlbums(newAlbums);
    if (field === "tracks") setTracksPerAlbum(newTracks);
    if (field === "streams") setStreamsPerTrack(newStreams);
    if (isSynced) {
      const target = newAlbums * newTracks * newStreams;
      const daily = 720 * platforms.length;
      const needed = Math.ceil(target / (daily * farmDays));
      setAppleMinis(needed > 0 ? needed : 1);
    }
  };

  const handleFarmChange = (value: number) => {
    setAppleMinis(value);
    if (isSynced) {
      const farmStreams = value * 720 * platforms.length * farmDays;
      const totalT = albums * tracksPerAlbum;
      setStreamsPerTrack(Math.round(farmStreams / totalT));
    }
  };

  const toggleSync = () => {
    const next = !isSynced;
    setIsSynced(next);
    if (next) {
      const target = albums * tracksPerAlbum * streamsPerTrack;
      const daily = 720 * platforms.length;
      const needed = Math.ceil(target / (daily * farmDays));
      const minis = needed > 0 ? needed : 1;
      setAppleMinis(minis);
      const syncedStreams = minis * daily * farmDays;
      setStreamsPerTrack(Math.round(syncedStreams / (albums * tracksPerAlbum)));
    }
  };

  const totalTracks = albums * tracksPerAlbum;
  const totalStreams = totalTracks * streamsPerTrack;
  const totalPercent = platforms.reduce((s, p) => s + (Number(p.percent) || 0), 0);

  const platformResults = useMemo(() => {
    return platforms
      .map((p) => {
        const streams = totalStreams * ((Number(p.percent) || 0) / 100);
        const revenue = (streams / 1_000_000) * (Number(p.rate) || 0);
        return { ...p, streams, revenue };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [platforms, totalStreams]);

  const totalGross = platformResults.reduce((s, p) => s + p.revenue, 0);
  const feeTarget = totalGross * ((Number(distributorFee) || 0) / 100);
  const totalNet = totalGross - feeTarget;

  // Farm
  const dailyPerPlatform = appleMinis * 720;
  const farmDailyTotal = dailyPerPlatform * platforms.length;
  const farmTotalStreams = farmDailyTotal * farmDays;
  const farmGross = platforms.reduce((s, p) => {
    const streams = dailyPerPlatform * farmDays;
    return s + (streams / 1_000_000) * p.rate;
  }, 0);
  const feeFarm = farmGross * ((Number(distributorFee) || 0) / 100);
  const farmNet = farmGross - feeFarm;
  const daysToGoal = farmDailyTotal > 0 ? totalStreams / farmDailyTotal : 0;

  const handlePlatformChange = (id: string, field: "percent" | "rate", value: number) => {
    setPlatforms((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const distributeEvenly = () => {
    const even = parseFloat((100 / platforms.length).toFixed(2));
    setPlatforms((prev) =>
      prev.map((p, i) => ({
        ...p,
        percent: i === prev.length - 1 ? Number((100 - even * (prev.length - 1)).toFixed(2)) : even,
      })),
    );
  };

  const money = (v: number) =>
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(v || 0);
  const micro = (v: number) =>
    new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 4,
      maximumFractionDigits: 5,
    }).format(v || 0);
  const num = (v: number) => new Intl.NumberFormat("nl-NL").format(v || 0);

  return (
    <div className="-m-6 p-6 min-h-full bg-[linear-gradient(#f8f8f8,#d9d9d9)] text-slate-800">
      <style>{`
        .mining-slider-form {
          --k: calc((var(--val) - var(--min)) / (var(--max) - var(--min)));
          --thumb-d: 1.75em;
          --thumb-r: 0.875em;
          --pos: calc(var(--thumb-r) + var(--k) * (100% - var(--thumb-d)));
          display: grid;
          width: 100%;
          font-size: 13px;
        }
        .mining-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 1.75em;
          border-radius: 1.75em;
          box-shadow: 0 -1px #eaeaea, 0 1px #fff;
          background: linear-gradient(#c3c3c3, #f1f1f1);
          cursor: pointer;
          width: 100%;
          outline: none;
          margin: 0;
        }
        .mining-slider::-webkit-slider-runnable-track {
          margin: 0;
          height: 100%;
          border-radius: 1.75em;
          box-sizing: border-box;
          border: solid 0.25em transparent;
          box-shadow: inset 0 1px 4px #8c8c8c;
          background: linear-gradient(#f8dd36, #d68706) 0/ var(--pos) no-repeat padding-box,
            linear-gradient(#efefef, #c9c9c9) padding-box;
        }
        .mining-slider::-moz-range-track {
          margin: 0;
          height: 100%;
          border-radius: 1.75em;
          box-sizing: border-box;
          box-shadow: inset 0 1px 4px #8c8c8c;
          background: linear-gradient(#f8dd36, #d68706) 0/ var(--pos) no-repeat,
            linear-gradient(#efefef, #c9c9c9);
        }
        .mining-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          box-sizing: border-box;
          border: solid 0.3em transparent;
          width: 1.75em;
          height: 1.75em;
          border-radius: 50%;
          box-shadow: 0 2px 5px #7d7d7d;
          background: linear-gradient(#c5c5c5, whitesmoke) padding-box,
            linear-gradient(#fbfbfb, #c2c2c2) border-box;
          cursor: ew-resize;
          margin-top: 0;
        }
        .mining-slider::-moz-range-thumb {
          box-sizing: border-box;
          border: solid 0.3em transparent;
          width: 1.75em;
          height: 1.75em;
          border-radius: 50%;
          box-shadow: 0 2px 5px #7d7d7d;
          background: linear-gradient(#c5c5c5, whitesmoke) padding-box,
            linear-gradient(#fbfbfb, #c2c2c2) border-box;
          cursor: ew-resize;
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-[#f8dd36] to-[#d68706] rounded-2xl shadow-md text-white">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Mining Calculator
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              Bereken je doelen én hardware opbrengsten
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Links */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Target */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-white">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-slate-700">
                <div className="p-1.5 bg-slate-100 rounded-lg text-[#d68706]">
                  <Disc size={16} />
                </div>
                Doelstelling Catalogus
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Aantal Albums
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Slider
                        ariaLabel="Aantal Albums"
                        value={albums}
                        min={1}
                        max={50}
                        onChange={(e) => handleCatalogChange("albums", Number(e.target.value))}
                      />
                    </div>
                    <input
                      type="number"
                      aria-label="Aantal albums"
                      min={1}
                      value={albums}
                      onChange={(e) => handleCatalogChange("albums", Number(e.target.value))}
                      className="w-16 bg-slate-50 rounded-lg p-1.5 border border-slate-200 text-center font-bold text-slate-700 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Nummers per Album
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Slider
                        ariaLabel="Nummers per album"
                        value={tracksPerAlbum}
                        min={1}
                        max={30}
                        onChange={(e) => handleCatalogChange("tracks", Number(e.target.value))}
                      />
                    </div>
                    <input
                      type="number"
                      aria-label="Nummers per album"
                      min={1}
                      value={tracksPerAlbum}
                      onChange={(e) => handleCatalogChange("tracks", Number(e.target.value))}
                      className="w-16 bg-slate-50 rounded-lg p-1.5 border border-slate-200 text-center font-bold text-slate-700 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Doel Streams per Nummer
                  </label>
                  <div
                    className={`rounded-xl p-2 border shadow-inner flex items-center transition-colors ${
                      isSynced
                        ? "bg-[#ffec8b]/20 border-[#f8dd36]"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <Settings2
                      size={18}
                      className={isSynced ? "text-[#d68706] ml-1" : "text-slate-400 ml-1"}
                    />
                    <input
                      type="number"
                      aria-label="Doel streams per nummer"
                      min={0}
                      step={10000}
                      value={streamsPerTrack}
                      onChange={(e) => handleCatalogChange("streams", Number(e.target.value))}
                      className="w-full px-3 py-1 text-base font-bold text-slate-700 bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-inner flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Doel Totaal Streams
                  </p>
                  <p className="text-lg font-extrabold text-slate-700">{num(totalStreams)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Totaal Tracks
                  </p>
                  <p className="text-lg font-extrabold text-slate-700">{totalTracks}</p>
                </div>
              </div>
            </section>

            {/* Sync */}
            <button
              onClick={toggleSync}
              type="button"
              className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-extrabold uppercase tracking-wide text-sm transition-all transform hover:scale-[1.02] ${
                isSynced
                  ? "bg-gradient-to-r from-[#f8dd36] to-[#d68706] text-white shadow-lg border-2 border-white"
                  : "bg-white text-slate-500 hover:text-slate-700 shadow-sm border-2 border-slate-100"
              }`}
            >
              {isSynced ? <LinkIcon size={18} /> : <Unlink size={18} />}
              {isSynced ? "Gekoppeld" : "Koppel Doel & Farm"}
            </button>

            {/* Farm */}
            <section
              className={`p-5 rounded-2xl shadow-sm border relative overflow-hidden transition-colors ${
                isSynced
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-slate-100/50"
              }`}
            >
              <h2
                className={`relative z-10 text-sm font-bold flex items-center gap-2 mb-4 ${
                  isSynced ? "text-white" : "text-slate-800"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isSynced ? "bg-white text-slate-800" : "bg-slate-800 text-white"
                  }`}
                >
                  <Smartphone size={16} />
                </div>
                Stream Farm Setup
              </h2>

              <div className="relative z-10">
                <label
                  className={`block text-[10px] font-semibold uppercase tracking-wider mb-2 ${
                    isSynced ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Aantal Apple Mini&apos;s
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Slider
                      ariaLabel="Aantal Apple minis"
                      value={appleMinis}
                      min={1}
                      max={500}
                      onChange={(e) => handleFarmChange(Number(e.target.value))}
                    />
                  </div>
                  <input
                    type="number"
                    aria-label="Aantal Apple minis"
                    min={1}
                    value={appleMinis}
                    onChange={(e) => handleFarmChange(Number(e.target.value))}
                    className={`w-16 rounded-lg p-1.5 border text-center font-bold text-sm ${
                      isSynced
                        ? "bg-slate-900 border-slate-700 text-white"
                        : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                  />
                </div>
              </div>

              <div
                className={`mt-5 p-4 rounded-xl shadow-inner flex justify-between items-center relative z-10 ${
                  isSynced ? "bg-slate-900" : "bg-slate-800"
                }`}
              >
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    /Platform / Dag
                  </p>
                  <p className="text-base font-extrabold text-white">
                    {num(dailyPerPlatform)}{" "}
                    <span className="text-[10px] text-slate-400 font-medium tracking-normal">
                      streams
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    {farmDays} dagen
                  </p>
                  <p className="text-base font-extrabold text-[#f8dd36]">{num(farmTotalStreams)}</p>
                </div>
              </div>
            </section>

            {/* Fee */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-white">
              <h2 className="text-sm font-bold flex items-center gap-2 mb-4 text-slate-700">
                <div className="p-1.5 bg-slate-100 rounded-lg text-[#d68706]">
                  <Receipt size={16} />
                </div>
                Distributie Fee
              </h2>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Afdracht Label (%)
                </label>
                <span className="font-extrabold text-[#d68706] text-base">{distributorFee}%</span>
              </div>
              <Slider
                ariaLabel="Distributie fee percentage"
                value={distributorFee}
                min={0}
                max={100}
                step={1}
                onChange={(e) => setDistributorFee(Number(e.target.value))}
              />
            </section>
          </div>

          {/* Rechts */}
          <div className="lg:col-span-7 space-y-6">
            {/* Totaal */}
            <div className="bg-gradient-to-br from-[#f8dd36] to-[#d68706] p-6 rounded-2xl shadow-lg text-white relative overflow-hidden border-2 border-[#ffec8b]/30">
              <div className="relative z-10">
                <p className="text-[#ffeaaa] font-bold uppercase tracking-widest text-[10px] mb-1 flex items-center gap-2">
                  <DollarSign size={14} strokeWidth={3} />
                  Netto Doelstelling (Organisch)
                </p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
                  {money(totalNet)}
                </h2>
                <div className="mt-5 pt-5 border-t border-[#ffeaaa]/30 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[#ffeaaa] text-[9px] font-bold uppercase tracking-wider">
                      Bruto
                    </p>
                    <p className="font-bold text-sm">{money(totalGross)}</p>
                  </div>
                  <div>
                    <p className="text-[#ffeaaa] text-[9px] font-bold uppercase tracking-wider">
                      Fee ({distributorFee}%)
                    </p>
                    <p className="font-bold text-sm opacity-90">-{money(feeTarget)}</p>
                  </div>
                  <div>
                    <p className="text-[#ffeaaa] text-[9px] font-bold uppercase tracking-wider">
                      Streams
                    </p>
                    <p className="font-bold text-sm">{num(totalStreams)}</p>
                  </div>
                  <div>
                    <p className="text-[#ffeaaa] text-[9px] font-bold uppercase tracking-wider">
                      Per stream
                    </p>
                    <p className="font-bold text-sm">
                      {totalStreams > 0 ? micro(totalNet / totalStreams) : "€ 0,00"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Farm */}
            <div className="bg-slate-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden border border-slate-700">
              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-1 flex items-center gap-2">
                    <Cpu size={14} />
                    Farm Netto ({farmDays} dgn)
                  </p>
                  <h2 className="text-3xl font-black tracking-tighter text-white">
                    {money(farmNet)}
                  </h2>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50 flex-shrink-0">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1">
                    {isSynced ? (
                      <LinkIcon size={12} className="text-[#f8dd36]" />
                    ) : (
                      <Clock size={12} />
                    )}
                    {isSynced ? "Status" : "Tijd tot Doel"}
                  </p>
                  <p className="font-bold text-base text-[#f8dd36]">
                    {isSynced
                      ? "Synchroon"
                      : daysToGoal > 0
                        ? `${num(Math.ceil(daysToGoal))} Dagen`
                        : "-"}
                  </p>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-slate-700 grid grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                <div>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                    Bruto Farm
                  </p>
                  <p className="font-bold text-sm text-slate-200">{money(farmGross)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                    Fee ({distributorFee}%)
                  </p>
                  <p className="font-bold text-sm text-slate-400">-{money(feeFarm)}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                    Apparaten
                  </p>
                  <p className="font-bold text-sm text-slate-200">
                    {appleMinis}{" "}
                    <span className="text-[10px] text-slate-500 font-medium">Apple Mini&apos;s</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Platforms */}
            <section className="bg-white p-5 rounded-2xl shadow-sm border border-white">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-3">
                <h2 className="text-sm font-bold flex items-center gap-2 text-slate-700">
                  <div className="p-1.5 bg-slate-100 rounded-lg text-[#d68706]">
                    <PieChart size={16} />
                  </div>
                  Platform Verdeling
                </h2>
                <button
                  onClick={distributeEvenly}
                  type="button"
                  className="text-[10px] bg-slate-100 hover:bg-[#ffeaaa] text-slate-600 hover:text-[#d68706] font-bold py-1.5 px-3 rounded-lg transition-all"
                >
                  Gelijk verdelen
                </button>
              </div>

              {totalPercent !== 100 && (
                <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <p>
                    Totaal: <strong>{totalPercent.toFixed(1)}%</strong>. Zorg voor 100%.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {platforms.map((platform) => {
                  const r = platformResults.find((x) => x.id === platform.id);
                  return (
                    <div
                      key={platform.id}
                      className="p-3 bg-slate-50/50 rounded-xl border border-slate-100"
                    >
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <h3 className="font-bold text-slate-700 text-sm">{platform.name}</h3>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {money(platform.rate)} / 1M
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold text-slate-800 text-sm">
                            {money(r?.revenue ?? 0)}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400">
                            {num(r?.streams ?? 0)} streams
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Slider
                            ariaLabel={`${platform.name} percentage`}
                            value={platform.percent}
                            min={0}
                            max={100}
                            step={0.1}
                            onChange={(e) =>
                              handlePlatformChange(platform.id, "percent", Number(e.target.value))
                            }
                          />
                        </div>
                        <div className="relative w-16">
                          <input
                            type="number"
                            aria-label={`${platform.name} percentage`}
                            value={platform.percent}
                            onChange={(e) =>
                              handlePlatformChange(platform.id, "percent", Number(e.target.value))
                            }
                            className="w-full bg-white p-1.5 pr-5 text-xs font-bold text-right border border-slate-200 rounded-lg outline-none"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
