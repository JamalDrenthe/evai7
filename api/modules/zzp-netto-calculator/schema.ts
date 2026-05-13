import { z } from "zod";

export const ZzpInputSchema = z.object({
  revenue: z.number().min(0).describe("Omzet bedrag"),
  costs: z.number().min(0).default(0).describe("Zakelijke kosten"),
  revenueVatRate: z.union([z.literal(0), z.literal(9), z.literal(21)]).default(21),
  costsVatRate: z.union([z.literal(0), z.literal(9), z.literal(21)]).default(21),
  revenueType: z.enum(["ex", "incl"]).default("ex").describe("Of de omzet excl of incl BTW is"),
  costsType: z.enum(["ex", "incl"]).default("ex"),
  isStarter: z.boolean().default(false).describe("Recht op startersaftrek"),
  meetsHourCriterion: z.boolean().default(true).describe("Voldoet aan urencriterium (1225u/jaar)"),
  mode: z.enum(["year", "month"]).default("year").describe("Of revenue/costs jaar- of maandbedragen zijn"),
});
export type ZzpInput = z.infer<typeof ZzpInputSchema>;

export const ZzpOutputSchema = z.object({
  annualRevenueEx: z.number(),
  annualRevenueVat: z.number(),
  annualCostsEx: z.number(),
  annualCostsVat: z.number(),
  netVatPayable: z.number(),
  profit: z.number(),
  deductions: z.number(),
  mkbAmount: z.number(),
  taxableIncome: z.number(),
  finalIncomeTax: z.number(),
  zvw: z.number(),
  totalIncomeTaxAndZvw: z.number(),
  netAnnual: z.number(),
  netMonthly: z.number(),
  netWeekly: z.number(),
  netHourly: z.number(),
  reservationTotal: z.number(),
  taxPressureProfit: z.number(),
  taxPressureRevenue: z.number(),
});
export type ZzpOutput = z.infer<typeof ZzpOutputSchema>;
