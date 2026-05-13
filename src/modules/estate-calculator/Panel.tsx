import { useMemo, useState } from "react";
import {
  Calculator,
  TrendingUp,
  Home,
  Wallet,
  ArrowRight,
  AlertTriangle,
  Building,
  Users,
} from "lucide-react";
import type { PanelProps } from "../_types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Panel(_props: PanelProps) {
  // Kapitaal
  const [startCapital, setStartCapital] = useState(25000);
  // Kosten (uitgaand)
  const [oneTimeCostPerHouse, setOneTimeCostPerHouse] = useState(2000);
  const [rentPaidPerMonth, setRentPaidPerMonth] = useState(2500);
  const [depositPaidMonths, setDepositPaidMonths] = useState(2);
  // Omzet (inkomend)
  const [roomsPerHouse, setRoomsPerHouse] = useState(4);
  const [rentReceivedPerRoom, setRentReceivedPerRoom] = useState(750);
  const [depositReceivedMonths, setDepositReceivedMonths] = useState(1);

  const simulation = useMemo(() => {
    const depositPaidAmount = rentPaidPerMonth * depositPaidMonths;
    const totalInitialOutflowPerHouse =
      Number(oneTimeCostPerHouse) + Number(rentPaidPerMonth) + depositPaidAmount;
    const totalRentReceivedPerMonth = roomsPerHouse * rentReceivedPerRoom;
    const depositReceivedAmount = totalRentReceivedPerMonth * depositReceivedMonths;
    const totalInitialInflowPerHouse = totalRentReceivedPerMonth + depositReceivedAmount;
    const monthlyMarginPerHouse = totalRentReceivedPerMonth - rentPaidPerMonth;

    let balance = Number(startCapital);
    const cost = totalInitialOutflowPerHouse;
    const revenue = totalInitialInflowPerHouse;

    let houses = 0;
    const steps: Array<{
      house: number;
      prevBalance: number;
      cost: number;
      revenue: number;
      newBalance: number;
    }> = [];
    const capitalGrows = revenue >= cost;
    const MAX = 50;

    if (cost > 0 && balance >= cost) {
      while (balance >= cost) {
        houses++;
        const prevBalance = balance;
        balance -= cost;
        balance += revenue;
        steps.push({ house: houses, prevBalance, cost, revenue, newBalance: balance });
        if (capitalGrows && houses >= MAX) break;
      }
    }

    const totalMonthlyMargin = houses * monthlyMarginPerHouse;
    const totalDepositsOwed = houses * depositReceivedAmount;
    const totalDepositsClaimed = houses * depositPaidAmount;

    return {
      houses,
      balance,
      steps,
      capitalGrows,
      totalInitialOutflowPerHouse,
      totalInitialInflowPerHouse,
      monthlyMarginPerHouse,
      depositPaidAmount,
      depositReceivedAmount,
      totalRentReceivedPerMonth,
      totalMonthlyMargin,
      totalDepositsOwed,
      totalDepositsClaimed,
    };
  }, [
    startCapital,
    oneTimeCostPerHouse,
    rentPaidPerMonth,
    depositPaidMonths,
    roomsPerHouse,
    rentReceivedPerRoom,
    depositReceivedMonths,
  ]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("nl-NL", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(n);

  const numericInputClass =
    "w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-800 text-sm";

  return (
    <div className="-m-6 p-6 bg-slate-100 text-slate-800 font-sans min-h-full">
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md">
              <TrendingUp size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Vastgoed Vliegwiel Calculator</h1>
              <p className="text-[12px] text-slate-500">
                Bereken acquisitiekracht inclusief inkomende én uitgaande huur/borg.
              </p>
            </div>
          </div>
          <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 flex items-center gap-3">
            <Wallet className="text-blue-600" size={18} />
            <div>
              <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                Startkapitaal
              </p>
              <input
                type="number"
                aria-label="Startkapitaal"
                value={startCapital}
                onChange={(e) => setStartCapital(Number(e.target.value))}
                className="w-28 bg-transparent text-base font-bold text-blue-900 outline-none border-b-2 border-blue-200 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Inputs */}
          <div className="lg:col-span-5 space-y-5">
            {/* Kosten */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <Building className="text-red-500" size={18} />
                Kosten per Woning (Uitgaand)
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Huur (die jij betaalt p/m)
                  </label>
                  <input
                    type="number"
                    aria-label="Huur die jij betaalt per maand"
                    value={rentPaidPerMonth}
                    onChange={(e) => setRentPaidPerMonth(Number(e.target.value))}
                    className={numericInputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Borg (mnd huur)
                    </label>
                    <input
                      type="number"
                      aria-label="Borg betaald in maanden huur"
                      step="0.5"
                      value={depositPaidMonths}
                      onChange={(e) => setDepositPaidMonths(Number(e.target.value))}
                      className={numericInputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Eenmalig (€)
                    </label>
                    <input
                      type="number"
                      aria-label="Eenmalige kosten per woning"
                      value={oneTimeCostPerHouse}
                      onChange={(e) => setOneTimeCostPerHouse(Number(e.target.value))}
                      className={numericInputClass}
                    />
                  </div>
                </div>
                <div className="mt-3 bg-red-50/50 p-3 rounded-xl border border-red-100">
                  <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1">
                    <span>Initiële Investering (Eruit)</span>
                    <span className="text-red-600 font-bold">
                      {fmt(simulation.totalInitialOutflowPerHouse)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    1e mnd huur + Borg ({fmt(simulation.depositPaidAmount)}) + Eenmalig
                  </p>
                </div>
              </div>
            </div>

            {/* Omzet */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 border-l-4 border-l-emerald-500">
              <h2 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <Users className="text-emerald-500" size={18} />
                Omzet per Woning (Binnenkomend)
              </h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Kamers
                    </label>
                    <input
                      type="number"
                      aria-label="Aantal kamers per woning"
                      value={roomsPerHouse}
                      onChange={(e) => setRoomsPerHouse(Number(e.target.value))}
                      className={numericInputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Huur p.k. (ontvangen)
                    </label>
                    <input
                      type="number"
                      aria-label="Huur per kamer ontvangen"
                      value={rentReceivedPerRoom}
                      onChange={(e) => setRentReceivedPerRoom(Number(e.target.value))}
                      className={numericInputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Borg (maanden huur)
                  </label>
                  <input
                    type="number"
                    aria-label="Borg ontvangen in maanden huur"
                    step="0.5"
                    value={depositReceivedMonths}
                    onChange={(e) => setDepositReceivedMonths(Number(e.target.value))}
                    className={numericInputClass}
                  />
                </div>
                <div className="mt-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  <div className="flex justify-between items-center text-xs font-medium text-slate-600 mb-1">
                    <span>Directe Liquiditeit (Erin)</span>
                    <span className="text-emerald-600 font-bold">
                      {fmt(simulation.totalInitialInflowPerHouse)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    1e mnd huur totaal + Borg ({fmt(simulation.depositReceivedAmount)})
                  </p>
                </div>
              </div>
            </div>

            {/* Unit Economics */}
            <div className="bg-slate-800 text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calculator size={64} />
              </div>
              <h3 className="text-[11px] font-semibold text-slate-300 mb-3 uppercase tracking-wider">
                Unit Economics (Per Huis)
              </h3>
              <div className="space-y-3 relative z-10">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-xs">Netto Beslag Werkkapitaal:</span>
                  <span
                    className={`text-base font-bold ${
                      simulation.totalInitialOutflowPerHouse -
                        simulation.totalInitialInflowPerHouse >
                      0
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {fmt(
                      Math.max(
                        0,
                        simulation.totalInitialOutflowPerHouse -
                          simulation.totalInitialInflowPerHouse,
                      ),
                    )}
                  </span>
                </div>
                <div className="h-px bg-slate-700" />
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-xs">Maandelijkse Marge:</span>
                  <span
                    className={`text-lg font-bold ${
                      simulation.monthlyMarginPerHouse >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {fmt(simulation.monthlyMarginPerHouse)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-snug">
                  Huur ontvangen ({fmt(simulation.totalRentReceivedPerMonth)}) − Huur betaald (
                  {fmt(rentPaidPerMonth)}).
                </p>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-7 space-y-5">
            {/* KPI */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <Home size={16} />
                  <span className="text-xs font-medium">Behaalbare Woningen</span>
                </div>
                <div className="text-3xl font-extrabold text-blue-600">
                  {simulation.capitalGrows ? "Onbeperkt" : simulation.houses}
                </div>
                <p
                  className={`text-[11px] mt-1 font-medium ${
                    simulation.capitalGrows ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {simulation.capitalGrows
                    ? "Liquiditeit groeit per pand."
                    : "Maximum op basis van werkkapitaal."}
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 text-slate-500 mb-2">
                  <TrendingUp size={16} />
                  <span className="text-xs font-medium">Cashflow p/m</span>
                </div>
                <div className="text-3xl font-extrabold text-emerald-600">
                  {simulation.capitalGrows
                    ? "Groeit per pand"
                    : fmt(simulation.totalMonthlyMargin)}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {simulation.capitalGrows
                    ? "Onbeperkt schaalbaar."
                    : `Bij ${simulation.houses} woningen.`}
                </p>
              </div>
            </div>

            {/* Balans */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={14} />
                Borg Balans (Vreemd Vermogen)
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <span className="block text-slate-600 mb-0.5">Jij moet terugbetalen:</span>
                  <span className="font-bold text-red-700">
                    {fmt(simulation.totalDepositsOwed)}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    Aan {simulation.houses * roomsPerHouse} huurders
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <span className="block text-slate-600 mb-0.5">Jij hebt tegoed:</span>
                  <span className="font-bold text-emerald-700">
                    {fmt(simulation.totalDepositsClaimed)}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    Van {simulation.houses} eigenaren
                  </span>
                </div>
              </div>
            </div>

            {/* Tabel */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[320px]">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                <h2 className="text-xs font-semibold text-slate-800">Tijdlijn Acquisitie</h2>
                <div className="text-[11px] font-medium bg-slate-200 px-2 py-0.5 rounded-full text-slate-700">
                  Kas: {fmt(simulation.balance)}
                </div>
              </div>
              <div className="overflow-x-auto overflow-y-auto grow">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr>
                      <th className="p-2 text-[10px] font-semibold text-slate-500 uppercase border-b">
                        Huis
                      </th>
                      <th className="p-2 text-[10px] font-semibold text-slate-500 uppercase border-b">
                        Start
                      </th>
                      <th className="p-2 text-[10px] font-semibold text-red-500 uppercase border-b">
                        Investering
                      </th>
                      <th className="p-2 text-[10px] font-semibold text-emerald-500 uppercase border-b">
                        Liquiditeit
                      </th>
                      <th className="p-2 text-[10px] font-semibold text-blue-600 uppercase border-b">
                        Nieuw Saldo
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulation.steps.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-xs text-slate-500">
                          Startkapitaal ({fmt(startCapital)}) is onvoldoende voor initiële
                          investering ({fmt(simulation.totalInitialOutflowPerHouse)}) van huis 1.
                        </td>
                      </tr>
                    ) : (
                      simulation.steps.map((step, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50 border-b border-slate-100 last:border-none text-xs"
                        >
                          <td className="p-2 font-medium text-slate-800 text-center w-10">
                            #{step.house}
                          </td>
                          <td className="p-2 text-slate-600">{fmt(step.prevBalance)}</td>
                          <td className="p-2 text-red-500 font-medium">-{fmt(step.cost)}</td>
                          <td className="p-2 text-emerald-600 font-medium">
                            +{fmt(step.revenue)}
                          </td>
                          <td className="p-2 font-bold text-blue-700 flex items-center gap-1">
                            <ArrowRight size={10} className="text-blue-300" />
                            {fmt(step.newBalance)}
                          </td>
                        </tr>
                      ))
                    )}
                    {simulation.steps.length > 0 && (
                      <tr className="bg-slate-50 sticky bottom-0 border-t border-slate-200">
                        <td
                          colSpan={5}
                          className="p-2 text-center text-[10px] font-medium text-slate-600"
                        >
                          {simulation.capitalGrows
                            ? `Tabel gestopt bij 50 panden. Kapitaal groeit, dus onbeperkt mogelijk.`
                            : `Gestopt: Saldo (${fmt(
                                simulation.balance,
                              )}) is onvoldoende voor volgende investering (${fmt(
                                simulation.totalInitialOutflowPerHouse,
                              )}).`}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
