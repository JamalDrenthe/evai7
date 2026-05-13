import { z } from "zod";

export const VvcInputSchema = z.object({
  hoursPerWeek: z.number().min(0).max(40),
  placementsPerMonth: z.number().min(0).max(100),
});

export type VvcInput = z.infer<typeof VvcInputSchema>;

export const ChartPointSchema = z.object({
  name: z.string(),
  Uurloon: z.number(),
  Bonussen: z.number(),
  Passief: z.number(),
  Totaal: z.number(),
  Accumulated: z.number(),
});

export type ChartPoint = z.infer<typeof ChartPointSchema>;

export const VvcOutputSchema = z.object({
  monthlyBaseSalary: z.number(),
  monthlyBonus: z.number(),
  yearEndMonthlyIncome: z.number(),
  totalYearEarnings: z.number(),
  totalVrienden: z.number(),
  monthByMonth: z.array(ChartPointSchema),
});

export type VvcOutput = z.infer<typeof VvcOutputSchema>;
