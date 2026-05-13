import { z } from "zod";

// Placeholder schema - to be filled in when source code is provided
export const VisualizationInputSchema = z.object({
  placeholder: z.string().optional(),
});

export type VisualizationInput = z.infer<typeof VisualizationInputSchema>;

export const VisualizationOutputSchema = z.object({
  placeholder: z.string(),
});

export type VisualizationOutput = z.infer<typeof VisualizationOutputSchema>;
