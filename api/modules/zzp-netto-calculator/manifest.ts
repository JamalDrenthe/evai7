import { z } from "zod";
import type { ModuleManifest } from "../../../contracts/module-manifest";
import { ZzpInputSchema, ZzpOutputSchema } from "./schema";

export const manifest: ModuleManifest = {
  id: "zzp-netto-calculator",
  name: "ZZP Netto Calculator",
  type: "calculator",
  version: "1.0.0",
  description:
    "Berekent het netto inkomen van een ZZP'er in Nederland op basis van omzet, kosten, BTW, zelfstandigenaftrek, MKB-winstvrijstelling en inkomstenbelasting (2025).",
  tags: ["zzp", "belasting", "netto", "calculator", "nl"],
  capabilities: [
    {
      name: "calculate-netto",
      description:
        "Bereken netto jaarinkomen, maandinkomen, belastingdruk en BTW reservering voor een ZZP'er. Geef omzet en kosten op (jaar of maand bedrag).",
      inputSchema: z.toJSONSchema(ZzpInputSchema),
      outputSchema: z.toJSONSchema(ZzpOutputSchema),
    },
  ],
  contextOutputs: ["lastZzpNetto", "lastZzpInput"],
  dependencies: [],
  ui: {
    icon: "Calculator",
    color: "#6366f1",
  },
  requiresAuth: true,
  permissions: [],
  runtime: "typescript",
};
