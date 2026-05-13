import { z } from "zod";

export const EstateInputSchema = z.object({
  startCapital: z.number().min(0).default(25000),
  oneTimeCostPerHouse: z.number().min(0).default(2000),
  rentPaidPerMonth: z.number().min(0).default(2500),
  depositPaidMonths: z.number().min(0).default(2),
  roomsPerHouse: z.number().int().min(1).default(4),
  rentReceivedPerRoom: z.number().min(0).default(750),
  depositReceivedMonths: z.number().min(0).default(1),
  /** Safety cap for the simulation loop. */
  maxIterations: z.number().int().min(1).max(1000).default(50),
});

export type EstateInput = z.infer<typeof EstateInputSchema>;

export const EstateStepSchema = z.object({
  house: z.number(),
  prevBalance: z.number(),
  cost: z.number(),
  revenue: z.number(),
  newBalance: z.number(),
});

export const EstateOutputSchema = z.object({
  houses: z.number(),
  balance: z.number(),
  capitalGrows: z.boolean(),
  totalInitialOutflowPerHouse: z.number(),
  totalInitialInflowPerHouse: z.number(),
  monthlyMarginPerHouse: z.number(),
  totalMonthlyMargin: z.number(),
  totalDepositsOwed: z.number(),
  totalDepositsClaimed: z.number(),
  steps: z.array(EstateStepSchema),
});

export type EstateOutput = z.infer<typeof EstateOutputSchema>;
