import { z } from "zod";

export const EcosysteemInputSchema = z.object({
  query: z.string().min(1).describe("Vraag van de gebruiker over het EVAI ecosysteem."),
});

export type EcosysteemInput = z.infer<typeof EcosysteemInputSchema>;

export const EcosysteemOutputSchema = z.object({
  topic: z.string(),
  response: z.string(),
  relatedModules: z.array(z.string()),
});

export type EcosysteemOutput = z.infer<typeof EcosysteemOutputSchema>;
