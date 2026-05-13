import { z } from "zod";

// Placeholder schema - to be filled in when source code is provided
export const VvcChatbotInputSchema = z.object({
  placeholder: z.string().optional(),
});

export type VvcChatbotInput = z.infer<typeof VvcChatbotInputSchema>;

export const VvcChatbotOutputSchema = z.object({
  placeholder: z.string(),
});

export type VvcChatbotOutput = z.infer<typeof VvcChatbotOutputSchema>;
