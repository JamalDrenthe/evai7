import { z } from "zod";

// Placeholder schema - to be filled in when source code is provided
export const VoiceVerificationInputSchema = z.object({
  placeholder: z.string().optional(),
});

export type VoiceVerificationInput = z.infer<typeof VoiceVerificationInputSchema>;

export const VoiceVerificationOutputSchema = z.object({
  placeholder: z.string(),
});

export type VoiceVerificationOutput = z.infer<typeof VoiceVerificationOutputSchema>;
