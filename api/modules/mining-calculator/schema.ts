import { z } from "zod";

// Placeholder schema - to be filled in when source code is provided
export const MiningInputSchema = z.object({
  placeholder: z.string().optional(),
});

export type MiningInput = z.infer<typeof MiningInputSchema>;

export const MiningOutputSchema = z.object({
  placeholder: z.string(),
});

export type MiningOutput = z.infer<typeof MiningOutputSchema>;
