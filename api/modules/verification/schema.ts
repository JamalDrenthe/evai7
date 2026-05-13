import { z } from "zod";

// Placeholder schema - to be filled in when source code is provided
export const VerificationInputSchema = z.object({
  placeholder: z.string().optional(),
});

export type VerificationInput = z.infer<typeof VerificationInputSchema>;

export const VerificationOutputSchema = z.object({
  placeholder: z.string(),
});

export type VerificationOutput = z.infer<typeof VerificationOutputSchema>;
