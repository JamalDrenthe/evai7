import { z } from "zod";

export const VvcChatbotInputSchema = z.object({
  query: z.string().min(1).describe("De vraag van de gebruiker over VVC."),
});

export type VvcChatbotInput = z.infer<typeof VvcChatbotInputSchema>;

export const VvcChatbotOutputSchema = z.object({
  topic: z.string(),
  response: z.string(),
  matched: z.boolean(),
});

export type VvcChatbotOutput = z.infer<typeof VvcChatbotOutputSchema>;
