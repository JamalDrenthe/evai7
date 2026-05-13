/* 
 * Note: This file uses inline styles for dynamic values (colors, heights) that cannot 
 * be expressed in static CSS. These are necessary for the dynamic nature of the components.
 */
import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { trpc } from "@/providers/trpc";
import {
  ArrowLeft,
  Play,
  Calculator,
  TrendingUp,
  Wallet,
  Users,
  CheckSquare,
  Network,
  MessageSquare,
  Bot,
  Truck,
  Search,
  MessageCircle,
  Mic,
  Sparkles,
  Phone,
  Home,
  Receipt,
  BarChart3,
  Sliders,
  Send,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const iconMap: Record<string, React.ReactNode> = {
  Calculator: <Calculator size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  Wallet: <Wallet size={20} />,
  Users: <Users size={20} />,
  CheckSquare: <CheckSquare size={20} />,
  Network: <Network size={20} />,
  MessageSquare: <MessageSquare size={20} />,
  Bot: <Bot size={20} />,
  Truck: <Truck size={20} />,
  Search: <Search size={20} />,
  MessageCircle: <MessageCircle size={20} />,
  Mic: <Mic size={20} />,
};

const categoryColors: Record<string, string> = {
  calculator: "#3b82f6",
  chatbot: "#7a56f6",
  productivity: "#10b981",
  security: "#ef4444",
  ai: "#f59e0b",
};

/* ═══════════════════════════════════════════
   CALCULATOR COMPONENTS
   ═══════════════════════════════════════════ */

// ─── Mining Calculator ───
function MiningCalculator() {
  const [streamsPerDay, setStreamsPerDay] = useState(1000);
  const [streamPrice, setStreamPrice] = useState(0.003);
  const daysPerMonth = 30;
  const [selectedPlatform, setSelectedPlatform] = useState("multi");

  const platformMultipliers: Record<string, number> = {
    multi: 1,
    spotify: 0.4,
    apple: 0.25,
    youtube: 0.2,
    tidal: 0.05,
    amazon: 0.1,
  };

  const monthlyIncome = streamsPerDay * daysPerMonth * streamPrice * (platformMultipliers[selectedPlatform] || 1);
  const yearlyIncome = monthlyIncome * 12;
  const weeklyIncome = monthlyIncome / 4;

  const chartData = useMemo(() => {
    const data = [];
    for (let m = 1; m <= 12; m++) {
      data.push({
        maand: `M${m}`,
        inkomen: Math.round(streamsPerDay * daysPerMonth * streamPrice * (platformMultipliers[selectedPlatform] || 1) * (1 + (m - 1) * 0.02)),
      });
    }
    return data;
  }, [streamsPerDay, streamPrice, daysPerMonth, selectedPlatform]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-6 space-y-6">
          <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] flex items-center gap-2">
            <Sliders size={16} /> Parameters
          </h3>

          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-[12px] font-medium text-[var(--eva-text-secondary)] mb-2">
                <BarChart3 size={14} /> Streams per dag: <span className="text-[var(--eva-primary)] font-bold">{streamsPerDay.toLocaleString()}</span>
              </label>
              <input type="range" min="100" max="100000" step="100" value={streamsPerDay}
                onChange={(e) => setStreamsPerDay(Number(e.target.value))}
                className="w-full accent-[#3b82f6]"
                aria-label="Streams per dag"
                title="Streams per dag" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-[12px] font-medium text-[var(--eva-text-secondary)] mb-2">
                <Receipt size={14} /> Prijs per stream: €{streamPrice.toFixed(4)}
              </label>
              <input type="range" min="0.001" max="0.01" step="0.001" value={streamPrice}
                onChange={(e) => setStreamPrice(Number(e.target.value))}
                className="w-full accent-[#3b82f6]"
                aria-label="Prijs per stream"
                title="Prijs per stream" />
            </div>

            <div>
              <label className="text-[12px] font-medium text-[var(--eva-text-secondary)] mb-2 block">Platform</label>
              <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px]"
                aria-label="Platform"
                title="Platform">
                <option value="multi">Alle platformen</option>
                <option value="spotify">Spotify (40%)</option>
                <option value="apple">Apple Music (25%)</option>
                <option value="youtube">YouTube Music (20%)</option>
                <option value="tidal">Tidal (5%)</option>
                <option value="amazon">Amazon Music (10%)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
              <p className="text-[11px] text-[var(--eva-text-muted)] uppercase tracking-wider font-semibold mb-1">Per week</p>
              <p className="text-2xl font-bold text-[#3b82f6]">€{weeklyIncome.toFixed(0)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
              <p className="text-[11px] text-[var(--eva-text-muted)] uppercase tracking-wider font-semibold mb-1">Per maand</p>
              <p className="text-2xl font-bold text-[#7a56f6]">€{monthlyIncome.toFixed(0)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
              <p className="text-[11px] text-[var(--eva-text-muted)] uppercase tracking-wider font-semibold mb-1">Per jaar</p>
              <p className="text-2xl font-bold text-[#10b981]">€{yearlyIncome.toFixed(0)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
              <p className="text-[11px] text-[var(--eva-text-muted)] uppercase tracking-wider font-semibold mb-1">Streams/maand</p>
              <p className="text-2xl font-bold text-[#f59e0b]">{(streamsPerDay * daysPerMonth).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="maand" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `€${v}`} />
                <Tooltip formatter={(v) => [`€${v}`, "Inkomsten"]} />
                <Area type="monotone" dataKey="inkomen" stroke="#3b82f6" fill="#3b82f620" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── VVC Calculator ───
function VVCCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [placementsPerMonth, setPlacementsPerMonth] = useState(10);

  const HOURLY_RATE = 30;
  const PLACEMENT_BONUS = 300;
  const PASSIVE_INCOME_PER_USER = 25;

  const monthlyBaseSalary = hoursPerWeek * 4 * HOURLY_RATE;
  const monthlyBonus = placementsPerMonth * PLACEMENT_BONUS;

  const chartData = useMemo(() => {
    const data = [];
    let accumulatedPlacements = 0;
    for (let month = 1; month <= 12; month++) {
      accumulatedPlacements += placementsPerMonth;
      const passiveIncome = accumulatedPlacements * PASSIVE_INCOME_PER_USER;
      data.push({
        name: `Mnd ${month}`,
        Uurloon: monthlyBaseSalary,
        Bonussen: monthlyBonus,
        Passief: passiveIncome,
        Totaal: monthlyBaseSalary + monthlyBonus + passiveIncome,
      });
    }
    return data;
  }, [hoursPerWeek, placementsPerMonth, monthlyBaseSalary, monthlyBonus]);

  const yearEndMonthlyIncome = chartData[11].Totaal;
  const totalYearEarnings = chartData.reduce((acc, curr) => acc + curr.Totaal, 0);
  const totalVrienden = placementsPerMonth * 12;
  const formatEuro = (amount: number) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-6 space-y-6">
          <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] flex items-center gap-2">
            <Calculator size={16} /> Parameters
          </h3>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="flex items-center gap-2 text-[12px] font-medium text-[var(--eva-text-secondary)]">
                  <Phone size={14} /> Beluren per week
                </label>
                <span className="text-lg font-bold text-[var(--eva-primary)]">{hoursPerWeek}u</span>
              </div>
              <input type="range" min="0" max="40" step="1" value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full accent-[#7a56f6]"
                aria-label="Beluren per week"
                title="Beluren per week" />
              <div className="flex justify-between text-[10px] text-[var(--eva-text-muted)] mt-1"><span>0u</span><span>40u</span></div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="flex items-center gap-2 text-[12px] font-medium text-[var(--eva-text-secondary)]">
                  <Users size={14} /> Plaatsingen per maand
                </label>
                <span className="text-lg font-bold text-[var(--eva-primary)]">{placementsPerMonth}</span>
              </div>
              <input type="range" min="0" max="100" step="1" value={placementsPerMonth}
                onChange={(e) => setPlacementsPerMonth(Number(e.target.value))}
                className="w-full accent-[#7a56f6]"
                aria-label="Plaatsingen per maand"
                title="Plaatsingen per maand" />
              <div className="flex justify-between text-[10px] text-[var(--eva-text-muted)] mt-1"><span>0</span><span>100</span></div>
            </div>
          </div>

          <div className="bg-[var(--eva-canvas)] p-4 rounded-xl">
            <h4 className="text-[11px] font-semibold text-[var(--eva-text-secondary)] uppercase tracking-wider mb-3 text-center">Maandelijkse Cashflow (Maand 1)</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-[13px]"><span className="text-[var(--eva-text-muted)]">Uurloon basis:</span><span className="font-semibold">{formatEuro(monthlyBaseSalary)}</span></div>
              <div className="flex justify-between text-[13px]"><span className="text-[var(--eva-text-muted)]">Bonussen:</span><span className="font-semibold">{formatEuro(monthlyBonus)}</span></div>
              <div className="h-px bg-[var(--eva-border-subtle)] my-2" />
              <div className="flex justify-between text-[15px] font-bold text-[#7a56f6]"><span>TOTAAL:</span><span>{formatEuro(monthlyBaseSalary + monthlyBonus)}</span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#7a56f6] p-5 rounded-2xl text-white">
              <p className="text-[11px] text-white/60 font-semibold uppercase tracking-wider mb-1">Inkomen in Maand 12</p>
              <p className="text-3xl font-black">{formatEuro(yearEndMonthlyIncome)}</p>
              <div className="mt-3 flex items-center text-[12px] font-bold bg-white/20 px-3 py-1 rounded-full w-fit">
                <TrendingUp size={14} className="mr-2" />
                {formatEuro(chartData[11].Passief)} passief/maand
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5">
              <p className="text-[11px] text-[var(--eva-text-muted)] font-semibold uppercase tracking-wider mb-1">Jaartotaal (Jaar 1)</p>
              <p className="text-3xl font-black text-[var(--eva-primary)]">{formatEuro(totalYearEarnings)}</p>
              <p className="mt-3 text-[12px] font-bold text-[#7a56f6] flex items-center gap-1">
                <Users size={14} /> Netwerk van {totalVrienden} vrienden
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `€${v/1000}k`} />
                <Tooltip formatter={(v) => [formatEuro(Number(v)), ""]} />
                <Area type="monotone" dataKey="Uurloon" stackId="1" stroke="none" fill="#e5e7eb" name="Uurloon" />
                <Area type="monotone" dataKey="Bonussen" stackId="1" stroke="none" fill="#0891b2" name="Bonussen" />
                <Area type="monotone" dataKey="Passief" stackId="1" stroke="#7a56f6" strokeWidth={2} fill="#7a56f630" name="Passief" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Estate Calculator ───
function EstateCalculator() {
  const [startCapital, setStartCapital] = useState(50000);
  const [monthlyRent, setMonthlyRent] = useState(1200);
  const [rooms, setRooms] = useState(3);
  const [roomPrice, setRoomPrice] = useState(450);
  const [mortgageRate, setMortgageRate] = useState(3.5);

  const monthlyRoomIncome = rooms * roomPrice;
  const monthlyNetIncome = monthlyRent + monthlyRoomIncome;
  const yearlyNetIncome = monthlyNetIncome * 12;
  const maxMortgage = (yearlyNetIncome * 5) / (mortgageRate / 100);

  const projections = useMemo(() => {
    const data = [];
    let capital = startCapital;
    for (let y = 1; y <= 10; y++) {
      capital += yearlyNetIncome;
      data.push({
        jaar: `J${y}`,
        kapitaal: Math.round(capital),
        inkomen: Math.round(yearlyNetIncome),
        woningen: Math.floor(capital / 200000),
      });
    }
    return data;
  }, [startCapital, monthlyRent, rooms, roomPrice]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-6 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] flex items-center gap-2">
            <Home size={16} /> Parameters
          </h3>
          {[
            { label: "Startkapitaal", value: startCapital, set: setStartCapital, min: 0, max: 500000, step: 5000, prefix: "€" },
            { label: "Maandelijkse huur", value: monthlyRent, set: setMonthlyRent, min: 0, max: 5000, step: 50, prefix: "€" },
            { label: "Aantal kamers", value: rooms, set: setRooms, min: 1, max: 10, step: 1, prefix: "" },
            { label: "Huurprijs per kamer", value: roomPrice, set: setRoomPrice, min: 200, max: 1000, step: 25, prefix: "€" },
            { label: "Hypotheekrente", value: mortgageRate, set: setMortgageRate, min: 1, max: 10, step: 0.1, prefix: "%" },
          ].map((param) => (
            <div key={param.label}>
              <div className="flex justify-between items-end mb-1.5">
                <label className="text-[12px] font-medium text-[var(--eva-text-secondary)]">{param.label}</label>
                <span className="text-sm font-bold text-[var(--eva-primary)]">{param.prefix}{param.value.toLocaleString()}</span>
              </div>
              <input type="range" min={param.min} max={param.max} step={param.step} value={param.value}
                onChange={(e) => param.set(Number(e.target.value))}
                className="w-full accent-[#10b981]"
                aria-label={param.label}
                title={param.label} />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Netto/maand", value: `€${monthlyNetIncome.toLocaleString()}`, color: "#10b981" },
              { label: "Netto/jaar", value: `€${yearlyNetIncome.toLocaleString()}`, color: "#3b82f6" },
              { label: "Max hypotheek", value: `€${Math.round(maxMortgage).toLocaleString()}`, color: "#7a56f6" },
              { label: "Kamerinkomen", value: `€${monthlyRoomIncome.toLocaleString()}/m`, color: "#f59e0b" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
                <p className="text-[11px] text-[var(--eva-text-muted)] font-semibold uppercase tracking-wider mb-1">{stat.label}</p>
                <p className="text-xl font-bold" style={{ color: stat.color }} suppressHydrationWarning>{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="jaar" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `€${v/1000}k`} />
                <Tooltip formatter={(v) => [`€${Number(v).toLocaleString()}`, ""]} />
                <Area type="monotone" dataKey="kapitaal" stroke="#10b981" fill="#10b98120" name="Kapitaal" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ZZP Calculator ───
function ZZPCalculator() {
  const [revenue, setRevenue] = useState(80000);
  const [expenses, setExpenses] = useState(15000);

  const profit = revenue - expenses;
  const vat = revenue * 0.21;
  const incomeTax = Math.max(0, profit * 0.3697 - 3362);
  const selfEmployedDeduction = 3362;
  const starterDeduction = 2123;
  const mkbExemption = Math.max(0, profit * 0.1483);
  const netIncome = profit - incomeTax + selfEmployedDeduction + starterDeduction + mkbExemption;

  const pieData = [
    { name: "Netto", value: Math.max(0, netIncome), color: "#10b981" },
    { name: "Belasting", value: Math.max(0, incomeTax), color: "#ef4444" },
    { name: "Uitgaven", value: expenses, color: "#f59e0b" },
    { name: "Overig", value: Math.max(0, profit - netIncome - incomeTax), color: "#e5e7eb" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-6 space-y-5">
          <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] flex items-center gap-2">
            <Receipt size={16} /> Parameters
          </h3>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-[12px] font-medium text-[var(--eva-text-secondary)]">Jaaromzet (excl. BTW)</label>
              <span className="text-sm font-bold text-[var(--eva-primary)]">€{revenue.toLocaleString()}</span>
            </div>
            <input type="range" min="10000" max="500000" step="1000" value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              className="w-full accent-[#f59e0b]"
              aria-label="Jaaromzet (excl. BTW)"
              title="Jaaromzet (excl. BTW)" />
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-[12px] font-medium text-[var(--eva-text-secondary)]">Zakelijke kosten</label>
              <span className="text-sm font-bold text-[var(--eva-primary)]">€{expenses.toLocaleString()}</span>
            </div>
            <input type="range" min="0" max="100000" step="500" value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
              className="w-full accent-[#f59e0b]"
              aria-label="Zakelijke kosten"
              title="Zakelijke kosten" />
          </div>

          <div className="bg-[var(--eva-canvas)] p-4 rounded-xl space-y-2">
            <h4 className="text-[11px] font-semibold text-[var(--eva-text-secondary)] uppercase tracking-wider mb-2">Aftrekposten</h4>
            <div className="flex justify-between text-[13px]"><span className="text-[var(--eva-text-muted)]">Zelfstandigenaftrek:</span><span className="font-semibold text-[#10b981]">€{selfEmployedDeduction.toLocaleString()}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-[var(--eva-text-muted)]">Startersaftrek:</span><span className="font-semibold text-[#10b981]">€{starterDeduction.toLocaleString()}</span></div>
            <div className="flex justify-between text-[13px]"><span className="text-[var(--eva-text-muted)]">MKB-winstvrijstelling:</span><span className="font-semibold text-[#10b981]">€{Math.round(mkbExemption).toLocaleString()}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#10b981] p-4 rounded-2xl text-white">
              <p className="text-[11px] text-white/60 font-semibold uppercase tracking-wider mb-1">Netto inkomen</p>
              <p className="text-2xl font-black">€{Math.round(netIncome).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
              <p className="text-[11px] text-[var(--eva-text-muted)] font-semibold uppercase tracking-wider mb-1">Bruto winst</p>
              <p className="text-2xl font-black text-[var(--eva-primary)]">€{profit.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
              <p className="text-[11px] text-[var(--eva-text-muted)] font-semibold uppercase tracking-wider mb-1">BTW (21%)</p>
              <p className="text-xl font-bold text-[#7a56f6]">€{Math.round(vat).toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-4">
              <p className="text-[11px] text-[var(--eva-text-muted)] font-semibold uppercase tracking-wider mb-1">Inkomstenbelasting</p>
              <p className="text-xl font-bold text-[#ef4444]">€{Math.round(incomeTax).toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-5 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`€${Number(v).toLocaleString()}`, ""]} />
                <Legend fontSize={11} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Takenblok ───
function Takenblok() {
  type Task = { id: number; title: string; priority: "low" | "medium" | "high"; status: "todo" | "in_progress" | "review" | "done"; due: string };
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Eva Platform bouwen", priority: "high", status: "in_progress", due: "2026-02-15" },
    { id: 2, title: "Database schema ontwerpen", priority: "high", status: "done", due: "2026-02-10" },
    { id: 3, title: "API endpoints testen", priority: "medium", status: "todo", due: "2026-02-20" },
    { id: 4, title: "UI componenten bouwen", priority: "medium", status: "in_progress", due: "2026-02-18" },
  ]);
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([...tasks, {
      id: Date.now(), title: newTask, priority: "medium", status: "todo", due: new Date().toISOString().split("T")[0],
    }]);
    setNewTask("");
  };

  const toggleStatus = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" as const } : t));
  };

  const statusColors: Record<string, string> = { todo: "bg-gray-100 text-gray-600", in_progress: "bg-blue-100 text-blue-700", review: "bg-yellow-100 text-yellow-700", done: "bg-green-100 text-green-700" };
  const priorityColors = { low: "bg-gray-100 text-gray-500", medium: "bg-yellow-100 text-yellow-700", high: "bg-red-100 text-red-700" };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-6">
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Nieuwe taak toevoegen..."
            className="flex-1 px-4 py-2.5 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
          />
          <button onClick={addTask} className="px-4 py-2.5 bg-[var(--eva-primary)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--eva-primary-hover)] transition-colors">
            Toevoegen
          </button>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--eva-canvas)] transition-colors group">
              <button onClick={() => toggleStatus(task.id)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${task.status === "done" ? "bg-green-500 border-green-500" : "border-[var(--eva-border-subtle)]"}`}>
                {task.status === "done" && <CheckSquare size={12} className="text-white" />}
              </button>
              <span className={`flex-1 text-[13px] ${task.status === "done" ? "line-through text-[var(--eva-text-muted)]" : "text-[var(--eva-text-primary)]"}`}>{task.title}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[task.status]}`}>{task.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Organigram ───
function OrganigramTool() {
  const orgData = {
    name: "Founder",
    role: "Eigenaar",
    children: [
      {
        name: "General Manager",
        role: "Algemeen directeur",
        children: [
          {
            name: "Sales Manager",
            role: "Verkoop",
            children: [
              { name: "Sales Team Lead", role: "Teamleider", children: [
                { name: "Sales Rep 1", role: "Verkoop" },
                { name: "Sales Rep 2", role: "Verkoop" },
              ]},
            ],
          },
          {
            name: "HR Manager",
            role: "Personeel",
            children: [
              { name: "Recruiter", role: "Werving" },
              { name: "HR Assistant", role: "Ondersteuning" },
            ],
          },
          {
            name: "Finance Manager",
            role: "Financiën",
            children: [
              { name: "Accountant", role: "Boekhouder" },
              { name: "Analyst", role: "Analist" },
            ],
          },
          {
            name: "Operations Manager",
            role: "Operatie",
            children: [
              { name: "Team Lead", role: "Teamleider", children: [
                { name: "Operator 1", role: "Medewerker" },
                { name: "Operator 2", role: "Medewerker" },
              ]},
            ],
          },
        ],
      },
    ],
  };

  const [expanded, setExpanded] = useState<Record<string, boolean>>({ Founder: true, "General Manager": true });

  const toggleNode = (name: string) => {
    setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const renderNode = (node: any, level = 0) => (
    <div key={node.name} className={level > 0 ? "ml-6 border-l-2 border-[var(--eva-border-subtle)] pl-4" : ""}>
      <div
        className="flex items-center gap-2 py-2 cursor-pointer hover:bg-[var(--eva-canvas)] rounded-lg px-2 transition-colors"
        onClick={() => node.children && toggleNode(node.name)}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${level === 0 ? "bg-[#141b28]" : level === 1 ? "bg-[#7a56f6]" : level === 2 ? "bg-[#3b82f6]" : "bg-[#10b981]"}`}>
          {node.name.charAt(0)}
        </div>
        <div>
          <p className="text-[13px] font-medium text-[var(--eva-text-primary)]">{node.name}</p>
          <p className="text-[11px] text-[var(--eva-text-muted)]">{node.role}</p>
        </div>
        {node.children && (
          <span className="ml-auto text-[var(--eva-text-muted)]">{expanded[node.name] ? "−" : "+"}</span>
        )}
      </div>
      {node.children && expanded[node.name] && node.children.map((child: any) => renderNode(child, level + 1))}
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-6">
      <div className="flex items-center gap-3 mb-4">
        <Network size={20} className="text-[#7a56f6]" />
        <div>
          <h3 className="text-sm font-semibold text-[var(--eva-text-primary)]">Organisatiestructuur</h3>
          <p className="text-[11px] text-[var(--eva-text-muted)]">Klik om in- en uit te klappen</p>
        </div>
      </div>
      {renderNode(orgData)}
    </div>
  );
}

// ─── Chatbot Interface ───
function ChatbotInterface({ name, color }: { name: string; color: string }) {
  type ChatMsg = { role: "assistant" | "user"; content: string };
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: `Hallo! Ik ben ${name}. Waarmee kan ik je helpen?` },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setTimeout(() => {
      const responses: Record<string, string> = {
        "TGC Chatbot": "TGC (Time Gap Cash Flow) is een unieke liquiditeitsstrategie gebaseerd op tijd in plaats van bezit. Wil je meer weten over hoe het werkt?",
        "Ecosysteem Chatbot": "Ik ben de centrale hub van je ecosysteem. Ik kan je helpen navigeren tussen tools, berekeningen maken, en je werk organiseren.",
        "VVC Chatbot": "Welkom bij de Verdienende Vrienden Club! Ik kan je helpen met vragen over het programma, je inkomen berekenen, en meer.",
      };
      setMessages((prev) => [...prev, { role: "assistant", content: responses[name] || "Ik begrijp je vraag. Laat me kijken hoe ik je kan helpen." }]);
    }, 500);
    setInput("");
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] flex flex-col h-[500px]">
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <>
                {/* eslint-disable-next-line react/forbid-component-props */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: color }} suppressHydrationWarning>
                  <Bot size={14} />
                </div>
              </>
            )}
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-[12px] ${msg.role === "user" ? "bg-[var(--eva-primary)] text-white" : "bg-[var(--eva-canvas)] text-[var(--eva-text-primary)]"}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-[var(--eva-border-subtle)] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Typ een bericht..."
          className="flex-1 px-3 py-2 bg-[var(--eva-canvas)] border border-[var(--eva-border-subtle)] rounded-lg text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--eva-accent)]/30"
        />
        {/* eslint-disable-next-line react/forbid-component-props */}
        <button onClick={handleSend} className="px-3 py-2 text-white rounded-lg text-[12px]" style={{ backgroundColor: color }} aria-label="Verstuur bericht" title="Verstuur bericht" suppressHydrationWarning>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Voice Verificatie ───
function VoiceVerificatie() {
  const [isRecording, setIsRecording] = useState(false);
  const [waveform, setWaveform] = useState<number[]>(Array.from({ length: 40 }, () => 10));

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setWaveform(Array.from({ length: 40 }, () => Math.random() * 40 + 5));
    }, 100);
    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-8 text-center">
      <div className="w-20 h-20 mx-auto rounded-full bg-[var(--eva-canvas)] flex items-center justify-center mb-4">
        <Mic size={32} className={isRecording ? "text-[#ef4444]" : "text-[var(--eva-text-muted)]"} />
      </div>
      <h3 className="text-sm font-semibold text-[var(--eva-text-primary)] mb-2">Voice Verificatie</h3>
      <p className="text-[12px] text-[var(--eva-text-secondary)] mb-6">
        {isRecording ? "Luisteren... Spreek nu" : "Klik om te beginnen met stemverificatie"}
      </p>

      <div className="flex items-end justify-center gap-1 h-16 mb-6">
        {waveform.map((height, i) => (
          <div
            key={i}
            className="w-1 rounded-full transition-all duration-100"
            style={{
              height: `${height}px`,
              backgroundColor: isRecording ? "#ef4444" : "#d1d5db",
            }}
            suppressHydrationWarning
          />
        ))}
      </div>

      <button
        onClick={() => setIsRecording(!isRecording)}
        className={`px-6 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
          isRecording ? "bg-[#ef4444] text-white" : "bg-[var(--eva-primary)] text-white hover:bg-[var(--eva-primary-hover)]"
        }`}
      >
        {isRecording ? "Stop opname" : "Start opname"}
      </button>
    </div>
  );
}

// ─── Fallback for unimplemented tools ───
function FallbackTool({ name, description }: { name: string; description?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-8 text-center">
      <Sparkles size={40} className="mx-auto text-[var(--eva-accent)] mb-4" />
      <h3 className="text-lg font-semibold text-[var(--eva-text-primary)] mb-2">{name}</h3>
      <p className="text-[13px] text-[var(--eva-text-secondary)] mb-4">{description || "Deze tool is actief en klaar voor gebruik."}</p>
      <button className="px-5 py-2.5 bg-[var(--eva-primary)] text-white rounded-xl text-[13px] font-medium hover:bg-[var(--eva-primary-hover)] transition-colors flex items-center gap-2 mx-auto">
        <Play size={16} /> Start tool
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN TOOL DETAIL PAGE
   ═══════════════════════════════════════════ */

const calculatorComponents: Record<string, React.ComponentType> = {
  "mining-calculator": MiningCalculator,
  "vvc-calculator": VVCCalculator,
  "estate-calculator": EstateCalculator,
  "zzp-calculator": ZZPCalculator,
  takenblok: Takenblok,
  organigram: OrganigramTool,
};

const chatbotNames: Record<string, { name: string; color: string }> = {
  "tgc-chatbot": { name: "TGC Chatbot", color: "#7a56f6" },
  "ecosysteem-chatbot": { name: "Ecosysteem Chatbot", color: "#3b82f6" },
  "vvc-chatbot": { name: "VVC Chatbot", color: "#ef4444" },
};

export function ToolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const toolQuery = trpc.tools.getBySlug.useQuery({ slug: slug || "" });
  const executeTool = trpc.tools.execute.useMutation();

  const tool = toolQuery.data;

  if (toolQuery.isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--eva-accent)]" />
        </div>
      </AppLayout>
    );
  }

  if (!tool) {
    // Fallback: render calculator component based on slug if tool not in database
    const CalculatorComponent = slug ? calculatorComponents[slug] : undefined;
    const chatbotConfig = slug ? chatbotNames[slug] : undefined;

    if (CalculatorComponent) {
      return (
        <AppLayout>
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/tools"
              className="w-9 h-9 rounded-xl bg-white border border-[var(--eva-border-subtle)] flex items-center justify-center text-[var(--eva-text-muted)] hover:text-[var(--eva-text-primary)] transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <nav className="text-[12px] text-[var(--eva-text-muted)]">
              <Link to="/tools" className="text-[var(--eva-text-secondary)] hover:underline">Gereedschap</Link>
              <span className="mx-2">/</span>
              <span>{slug}</span>
            </nav>
          </div>
          <CalculatorComponent />
        </AppLayout>
      );
    }

    if (chatbotConfig) {
      return (
        <AppLayout>
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/tools"
              className="w-9 h-9 rounded-xl bg-white border border-[var(--eva-border-subtle)] flex items-center justify-center text-[var(--eva-text-muted)] hover:text-[var(--eva-text-primary)] transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <nav className="text-[12px] text-[var(--eva-text-muted)]">
              <Link to="/tools" className="text-[var(--eva-text-secondary)] hover:underline">Gereedschap</Link>
              <span className="mx-2">/</span>
              <span>{chatbotConfig.name}</span>
            </nav>
          </div>
          <ChatbotInterface name={chatbotConfig.name} color={chatbotConfig.color} />
        </AppLayout>
      );
    }

    return (
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-lg text-[var(--eva-text-muted)]">Tool niet gevonden</p>
          <Link to="/tools" className="text-[var(--eva-accent)] hover:underline text-sm mt-2 inline-block">
            Terug naar tools
          </Link>
        </div>
      </AppLayout>
    );
  }

  const color = categoryColors[tool.category] || "#7a56f6";

  // Render appropriate calculator
  const CalculatorComponent = slug ? calculatorComponents[slug] : undefined;

  // Render chatbot interface
  const chatbotConfig = slug ? chatbotNames[slug] : undefined;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/tools"
          className="w-9 h-9 rounded-xl bg-white border border-[var(--eva-border-subtle)] flex items-center justify-center text-[var(--eva-text-muted)] hover:text-[var(--eva-text-primary)] transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <nav className="text-[12px] text-[var(--eva-text-muted)]">
          <Link to="/tools" className="text-[var(--eva-text-secondary)] hover:underline">Gereedschap</Link>
          <span className="mx-2">/</span>
          <span>{tool.name}</span>
        </nav>
      </div>

      {/* Tool Header */}
      <div className="bg-white rounded-2xl border border-[var(--eva-border-subtle)] p-6 mb-6">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: color }}
            suppressHydrationWarning
          >
            {iconMap[tool.icon || ""] || <Sparkles size={24} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold text-[var(--eva-text-primary)]">{tool.name}</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                tool.status === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {tool.status === "active" ? "Actief" : "Beta"}
              </span>
            </div>
            <p className="text-[13px] text-[var(--eva-text-secondary)]">{tool.description}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium" style={{ backgroundColor: `${color}20`, color }} suppressHydrationWarning>
                {tool.category}
              </span>
              <button
                onClick={() => tool.id && executeTool.mutate({ toolId: tool.id, input: "started" })}
                className="px-4 py-1.5 bg-[var(--eva-primary)] text-white rounded-lg text-[11px] font-medium hover:bg-[var(--eva-primary-hover)] transition-colors flex items-center gap-1"
              >
                <Play size={12} /> Start
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tool Content */}
      {CalculatorComponent ? (
        <CalculatorComponent />
      ) : chatbotConfig ? (
        <ChatbotInterface name={chatbotConfig.name} color={chatbotConfig.color} />
      ) : slug === "voice-verificatie" ? (
        <VoiceVerificatie />
      ) : (
        <FallbackTool name={tool.name} description={tool.description || undefined} />
      )}
    </AppLayout>
  );
}
