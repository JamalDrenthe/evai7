import { z } from "zod";
import type { ModuleManifest } from "../../../contracts/module-manifest";
import {
  QueryRoleInputSchema,
  QueryRoleOutputSchema,
  RenderTreeInputSchema,
  RenderTreeOutputSchema,
} from "./schema";

export const manifest: ModuleManifest = {
  id: "organogram",
  name: "Organogram",
  type: "visualization",
  version: "1.0.0",
  description:
    "Visualiseert en doorzoekt de bedrijfsstructuur. Toont rollen, hiërarchie en relaties tussen Founder, partners, C-level, directie, management en recruitment.",
  tags: ["organogram", "structure", "hierarchy", "roles"],
  capabilities: [
    {
      name: "render-tree",
      description:
        "Toon een samenvatting van de hele organisatiestructuur: aantal rollen, diepte en groepering per type.",
      inputSchema: z.toJSONSchema(RenderTreeInputSchema),
      outputSchema: z.toJSONSchema(RenderTreeOutputSchema),
    },
    {
      name: "query-role",
      description:
        "Zoek een specifieke rol in het organogram. Geeft het pad van root naar deze rol en het niveau.",
      inputSchema: z.toJSONSchema(QueryRoleInputSchema),
      outputSchema: z.toJSONSchema(QueryRoleOutputSchema),
    },
  ],
  dependencies: [],
  ui: {
    icon: "Network",
    color: "#a855f7",
  },
  requiresAuth: true,
  permissions: [],
  runtime: "typescript",
};
