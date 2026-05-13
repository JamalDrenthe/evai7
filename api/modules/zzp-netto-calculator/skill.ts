import type { Skill, SkillResult } from "../../../contracts/skill";
import type { ContextEntry } from "../../../contracts/session-context";
import { nanoid } from "nanoid";
import { manifest } from "./manifest";
import { ZzpInputSchema, type ZzpInput, type ZzpOutput } from "./schema";

const ZELFSTANDIGENAFTREK = 2470;
const STARTERSAFTREK = 2123;
const MKB_WINSTVRIJSTELLING = 0.127;
const ZVW_PERCENTAGE = 0.0545;
const ZVW_MAX_INKOMEN = 71624;
const SCHIJF_1_GRENS = 76817;
const TARIEF_1 = 0.3697;
const TARIEF_2 = 0.495;

export function calculateZzpNetto(input: ZzpInput): ZzpOutput {
  const rawRevenue = input.mode === "year" ? input.revenue : input.revenue * 12;
  const rawCosts = input.mode === "year" ? input.costs : input.costs * 12;

  const annualRevenueEx =
    input.revenueType === "incl"
      ? rawRevenue / (1 + input.revenueVatRate / 100)
      : rawRevenue;
  const annualRevenueVat =
    input.revenueType === "incl"
      ? rawRevenue - annualRevenueEx
      : rawRevenue * (input.revenueVatRate / 100);

  const annualCostsEx =
    input.costsType === "incl"
      ? rawCosts / (1 + input.costsVatRate / 100)
      : rawCosts;
  const annualCostsVat =
    input.costsType === "incl"
      ? rawCosts - annualCostsEx
      : rawCosts * (input.costsVatRate / 100);

  const netVatPayable = annualRevenueVat - annualCostsVat;
  const profit = Math.max(0, annualRevenueEx - annualCostsEx);

  let deductions = 0;
  if (input.meetsHourCriterion) {
    deductions += ZELFSTANDIGENAFTREK;
    if (input.isStarter) deductions += STARTERSAFTREK;
  }

  const profitAfterDeductions = Math.max(0, profit - deductions);
  const mkbAmount = profitAfterDeductions * MKB_WINSTVRIJSTELLING;
  const taxableIncome = profitAfterDeductions - mkbAmount;

  const rawTax =
    taxableIncome <= SCHIJF_1_GRENS
      ? taxableIncome * TARIEF_1
      : SCHIJF_1_GRENS * TARIEF_1 + (taxableIncome - SCHIJF_1_GRENS) * TARIEF_2;

  let aHK = 0;
  if (taxableIncome < 24812) aHK = 3362;
  else if (taxableIncome < 76817) aHK = 3362 - 0.0668 * (taxableIncome - 24812);

  let arbeidskorting = 0;
  if (taxableIncome < 11000) arbeidskorting = taxableIncome * 0.08;
  else if (taxableIncome < 23000)
    arbeidskorting = 880 + (taxableIncome - 11000) * 0.29;
  else if (taxableIncome < 39000)
    arbeidskorting = 4400 + (taxableIncome - 23000) * 0.03;
  else if (taxableIncome < 120000)
    arbeidskorting = 5532 - 0.0651 * (taxableIncome - 39000);

  const totalKorting = Math.max(0, aHK + arbeidskorting);
  const finalIncomeTax = Math.max(0, rawTax - totalKorting);
  const zvw = Math.min(profitAfterDeductions, ZVW_MAX_INKOMEN) * ZVW_PERCENTAGE;
  const totalIncomeTaxAndZvw = finalIncomeTax + zvw;
  const netAnnual = profit - totalIncomeTaxAndZvw;
  const annualRevenueTotal = annualRevenueEx + annualRevenueVat;
  const reservationTotal = totalIncomeTaxAndZvw + Math.max(0, netVatPayable);

  return {
    annualRevenueEx,
    annualRevenueVat,
    annualCostsEx,
    annualCostsVat,
    netVatPayable,
    profit,
    deductions,
    mkbAmount,
    taxableIncome,
    finalIncomeTax,
    zvw,
    totalIncomeTaxAndZvw,
    netAnnual,
    netMonthly: netAnnual / 12,
    netWeekly: netAnnual / 52,
    netHourly: netAnnual / (40 * 52),
    reservationTotal,
    taxPressureProfit: profit > 0 ? (totalIncomeTaxAndZvw / profit) * 100 : 0,
    taxPressureRevenue:
      annualRevenueTotal > 0 ? (reservationTotal / annualRevenueTotal) * 100 : 0,
  };
}

export const skill: Skill<ZzpInput, ZzpOutput> = {
  manifest,
  capabilities: {
    "calculate-netto": async (rawInput, ctx): Promise<SkillResult<ZzpOutput>> => {
      const startTs = Date.now();
      const trace: SkillResult["trace"] = [{ step: "validate", ts: startTs }];

      const parsed = ZzpInputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "INVALID_INPUT", message: parsed.error.message },
          trace,
        };
      }
      const input = parsed.data;

      ctx.emit({
        type: "skill.start",
        moduleId: manifest.id,
        capability: "calculate-netto",
        ts: startTs,
      });

      const output = calculateZzpNetto(input);
      const endTs = Date.now();
      trace.push({ step: "compute", ts: endTs, meta: { durationMs: endTs - startTs } });

      ctx.emit({
        type: "skill.end",
        moduleId: manifest.id,
        capability: "calculate-netto",
        ts: endTs,
        durationMs: endTs - startTs,
      });

      const entry: ContextEntry = {
        id: nanoid(),
        ts: endTs,
        source: "skill",
        moduleId: manifest.id,
        capability: "calculate-netto",
        kind: "output",
        payload: { input, output },
        refs: [],
        summary: `ZZP Netto: ${formatEuro(output.netAnnual)}/jr · ${formatEuro(output.netMonthly)}/mnd`,
      };

      return {
        ok: true,
        data: output,
        contextDelta: {
          history: [entry],
          variables: {
            lastZzpNetto: {
              name: "lastZzpNetto",
              value: output.netAnnual,
              sourceEntryId: entry.id,
              ts: endTs,
            },
            lastZzpInput: {
              name: "lastZzpInput",
              value: input,
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

function formatEuro(n: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}
