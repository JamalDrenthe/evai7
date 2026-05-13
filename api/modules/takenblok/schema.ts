import { z } from "zod";

// Placeholder schema - to be filled in when source code is provided
export const TakenblokInputSchema = z.object({
  placeholder: z.string().optional(),
});

export type TakenblokInput = z.infer<typeof TakenblokInputSchema>;

export const TakenblokOutputSchema = z.object({
  placeholder: z.string(),
});

export type TakenblokOutput = z.infer<typeof TakenblokOutputSchema>;
