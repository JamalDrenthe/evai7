import { z } from "zod";

export const VisualizationInputSchema = z.object({
  kind: z.enum(["line", "bar", "area"]).default("line"),
  title: z.string().min(1).default("Chart"),
  data: z
    .array(z.record(z.string(), z.union([z.string(), z.number()])))
    .min(1)
    .describe("Rijen met datapunten. Elke rij moet één label-veld en één of meer numerieke series-velden hebben."),
  xKey: z.string().min(1).describe("Veldnaam voor de x-as (label)."),
  yKeys: z.array(z.string().min(1)).min(1).describe("Veldnamen voor numerieke series."),
});

export type VisualizationInput = z.infer<typeof VisualizationInputSchema>;

export const VisualizationOutputSchema = z.object({
  kind: z.enum(["line", "bar", "area"]),
  title: z.string(),
  data: z.array(z.record(z.string(), z.union([z.string(), z.number()]))),
  xKey: z.string(),
  yKeys: z.array(z.string()),
  pointCount: z.number(),
  seriesCount: z.number(),
});

export type VisualizationOutput = z.infer<typeof VisualizationOutputSchema>;
