import { nanoid } from "nanoid";
import type { Skill, SkillResult } from "../../../contracts/skill";
import type { ContextEntry } from "../../../contracts/session-context";
import { EstateInputSchema, type EstateInput, type EstateOutput } from "./schema";

export function calculateEstate(input: EstateInput): EstateOutput {
  const depositPaidAmount = input.rentPaidPerMonth * input.depositPaidMonths;
  const totalInitialOutflowPerHouse =
    input.oneTimeCostPerHouse + input.rentPaidPerMonth + depositPaidAmount;
  const totalRentReceivedPerMonth = input.roomsPerHouse * input.rentReceivedPerRoom;
  const depositReceivedAmount = totalRentReceivedPerMonth * input.depositReceivedMonths;
  const totalInitialInflowPerHouse = totalRentReceivedPerMonth + depositReceivedAmount;
  const monthlyMarginPerHouse = totalRentReceivedPerMonth - input.rentPaidPerMonth;

  let balance = input.startCapital;
  const cost = totalInitialOutflowPerHouse;
  const revenue = totalInitialInflowPerHouse;
  const capitalGrows = revenue >= cost;

  let houses = 0;
  const steps: EstateOutput["steps"] = [];
  if (cost > 0 && balance >= cost) {
    while (balance >= cost) {
      houses++;
      const prevBalance = balance;
      balance = balance - cost + revenue;
      steps.push({ house: houses, prevBalance, cost, revenue, newBalance: balance });
      if (capitalGrows && houses >= input.maxIterations) break;
    }
  }

  return {
    houses,
    balance,
    capitalGrows,
    totalInitialOutflowPerHouse,
    totalInitialInflowPerHouse,
    monthlyMarginPerHouse,
    totalMonthlyMargin: houses * monthlyMarginPerHouse,
    totalDepositsOwed: houses * depositReceivedAmount,
    totalDepositsClaimed: houses * depositPaidAmount,
    steps,
  };
}

const formatEuro = (n: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export const skill: Skill<EstateInput, EstateOutput> = {
  manifest: {
    id: "estate-calculator",
    name: "Estate Calculator",
    type: "calculator",
    version: "1.0.0",
    description:
      "Simuleert het vastgoed-vliegwiel: hoeveel huizen kun je acquireren met startkapitaal, gegeven inkomende en uitgaande huur/borg?",
    tags: ["calculator", "real-estate", "vastgoed", "flywheel"],
    capabilities: [
      {
        name: "calculate",
        description:
          "Bereken aantal woningen, maandelijkse marge en eindbalans gegeven startkapitaal en cashflow-parameters.",
        inputSchema: {
          type: "object",
          properties: {
            startCapital: { type: "number", description: "Startkapitaal in EUR" },
            oneTimeCostPerHouse: { type: "number", description: "Eenmalige kosten per woning" },
            rentPaidPerMonth: { type: "number", description: "Huur die je per maand betaalt" },
            depositPaidMonths: { type: "number", description: "Aantal maanden borg dat je betaalt" },
            roomsPerHouse: { type: "number", description: "Kamers per huis (onderverhuur)" },
            rentReceivedPerRoom: { type: "number", description: "Huur per kamer per maand" },
            depositReceivedMonths: { type: "number", description: "Maanden borg die je ontvangt" },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            houses: { type: "number" },
            balance: { type: "number" },
            totalMonthlyMargin: { type: "number" },
          },
        },
      },
    ],
    contextRequirements: [],
    contextOutputs: ["lastEstateHouses", "lastEstateInput"],
    dependencies: [],
    ui: {
      panel: "@/modules/estate-calculator/Panel",
      icon: "Home",
    },
    requiresAuth: true,
    permissions: [],
    runtime: "typescript",
  },
  capabilities: {
    calculate: async (rawInput, ctx): Promise<SkillResult<EstateOutput>> => {
      const startTs = Date.now();
      const trace: SkillResult["trace"] = [{ step: "validate", ts: startTs }];

      const parsed = EstateInputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "INVALID_INPUT", message: parsed.error.message },
          trace,
        };
      }

      ctx.emit({
        type: "skill.start",
        moduleId: "estate-calculator",
        capability: "calculate",
        ts: startTs,
      });

      const output = calculateEstate(parsed.data);
      const endTs = Date.now();
      trace.push({ step: "compute", ts: endTs, meta: { durationMs: endTs - startTs } });

      ctx.emit({
        type: "skill.end",
        moduleId: "estate-calculator",
        capability: "calculate",
        ts: endTs,
        durationMs: endTs - startTs,
      });

      const entry: ContextEntry = {
        id: nanoid(),
        ts: endTs,
        source: "skill",
        moduleId: "estate-calculator",
        capability: "calculate",
        kind: "output",
        payload: { input: parsed.data, output },
        refs: [],
        summary: `Estate: ${output.houses} woningen · ${formatEuro(output.totalMonthlyMargin)}/maand marge · ${formatEuro(output.balance)} balans`,
      };

      return {
        ok: true,
        data: output,
        contextDelta: {
          history: [entry],
          variables: {
            lastEstateHouses: {
              name: "lastEstateHouses",
              value: output.houses,
              sourceEntryId: entry.id,
              ts: endTs,
            },
            lastEstateInput: {
              name: "lastEstateInput",
              value: parsed.data,
              sourceEntryId: entry.id,
              ts: endTs,
            },
          },
        },
        trace,
      };
    },
  },
};
