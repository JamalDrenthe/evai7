import type { Skill, SkillResult } from "../../../contracts/skill";
import type { InvocationContext } from "../../../contracts/skill";
import type { VvcInput, VvcOutput } from "./schema";

const HOURLY_RATE = 30; // €/uur tijdens bellen
const PLACEMENT_BONUS = 300; // € per plaatsing
const PASSIVE_INCOME_PER_USER = 25; // € per maand passief per geplaatste vriend

export function projectVvcEarnings(input: VvcInput): VvcOutput {
  const monthlyBaseSalary = input.hoursPerWeek * 4 * HOURLY_RATE;
  const monthlyBonus = input.placementsPerMonth * PLACEMENT_BONUS;

  const monthByMonth = [];
  let accumulatedPlacements = 0;

  for (let month = 1; month <= 12; month++) {
    accumulatedPlacements += input.placementsPerMonth;
    const passiveIncome = accumulatedPlacements * PASSIVE_INCOME_PER_USER;
    const total = monthlyBaseSalary + monthlyBonus + passiveIncome;
    monthByMonth.push({
      name: `Mnd ${month}`,
      Uurloon: monthlyBaseSalary,
      Bonussen: monthlyBonus,
      Passief: passiveIncome,
      Totaal: total,
      Accumulated: accumulatedPlacements,
    });
  }

  const yearEndMonthlyIncome = monthByMonth[11].Totaal;
  const totalYearEarnings = monthByMonth.reduce((acc, m) => acc + m.Totaal, 0);
  const totalVrienden = input.placementsPerMonth * 12;

  return {
    monthlyBaseSalary,
    monthlyBonus,
    yearEndMonthlyIncome,
    totalYearEarnings,
    totalVrienden,
    monthByMonth,
  };
}

export const skill: Skill<VvcInput, VvcOutput> = {
  manifest: {
    id: "vvc-calculator",
    name: "VVC Calculator",
    type: "calculator",
    version: "1.0.0",
    description: "Bereken inkomsten voor de Verdienende Vrienden Club",
    tags: ["calculator", "vvc", "inkomen"],
    capabilities: [
      {
        name: "project-earnings",
        description: "Bereken projectinkomsten op basis van uren per week en plaatsingen per maand",
        inputSchema: {
          type: "object",
          properties: {
            hoursPerWeek: { type: "number", minimum: 0, maximum: 40 },
            placementsPerMonth: { type: "number", minimum: 0, maximum: 100 },
          },
          required: ["hoursPerWeek", "placementsPerMonth"],
        },
        outputSchema: {
          type: "object",
          properties: {
            monthlyBaseSalary: { type: "number" },
            monthlyBonus: { type: "number" },
            yearEndMonthlyIncome: { type: "number" },
            totalYearEarnings: { type: "number" },
            totalVrienden: { type: "number" },
            monthByMonth: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  Uurloon: { type: "number" },
                  Bonussen: { type: "number" },
                  Passief: { type: "number" },
                  Totaal: { type: "number" },
                  Accumulated: { type: "number" },
                },
              },
            },
          },
        },
      },
    ],
    contextRequirements: [],
    contextOutputs: ["lastVvcEarnings"],
    dependencies: [],
    ui: {
      panel: "@/modules/vvc-calculator/Panel",
      icon: "Calculator",
    },
    requiresAuth: true,
    permissions: [],
    runtime: "typescript",
  },
  capabilities: {
    "project-earnings": async (input: VvcInput, ctx: InvocationContext): Promise<SkillResult<VvcOutput>> => {
      try {
        const output = projectVvcEarnings(input);
        
        return {
          ok: true,
          data: output,
          contextDelta: {
            variables: {
              lastVvcEarnings: {
                name: "lastVvcEarnings",
                value: output,
                ts: Date.now(),
              },
            },
            history: [
              {
                id: ctx.sessionId + "_vvc_" + Date.now(),
                ts: Date.now(),
                source: "skill",
                moduleId: "vvc-calculator",
                capability: "project-earnings",
                kind: "output",
                payload: output,
                refs: [],
                summary: `VVC: €${output.yearEndMonthlyIncome.toFixed(0)}/maand jaar 12`,
              },
            ],
          },
          trace: [{ step: "calculate", ts: Date.now() }],
        };
      } catch (err) {
        return {
          ok: false,
          error: {
            code: "CALCULATION_ERROR",
            message: err instanceof Error ? err.message : String(err),
          },
          contextDelta: {},
          trace: [{ step: "error", ts: Date.now(), meta: { error: String(err) } }],
        };
      }
    },
  },
};
