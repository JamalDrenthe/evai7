import { z } from "zod";

export const TgcAskInputSchema = z.object({
  question: z.string().min(1).describe("De vraag over Time Gap Cash Flow"),
  language: z.enum(["NL", "EN", "DE", "FR", "ES"]).default("NL"),
  detailLevel: z.enum(["short", "normal", "extensive"]).default("normal"),
});
export type TgcAskInput = z.infer<typeof TgcAskInputSchema>;

export const TgcAskOutputSchema = z.object({
  answer: z.string(),
  language: z.string(),
  detailLevel: z.string(),
});
export type TgcAskOutput = z.infer<typeof TgcAskOutputSchema>;
