import { z } from "zod";

// Placeholder schema - to be filled in when source code is provided
export const EstateInputSchema = z.object({
  placeholder: z.string().optional(),
});

export type EstateInput = z.infer<typeof EstateInputSchema>;

export const EstateOutputSchema = z.object({
  placeholder: z.string(),
});

export type EstateOutput = z.infer<typeof EstateOutputSchema>;
