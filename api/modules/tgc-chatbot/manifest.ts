import { z } from "zod";
import type { ModuleManifest } from "../../../contracts/module-manifest";
import { TgcAskInputSchema, TgcAskOutputSchema } from "./schema";

export const manifest: ModuleManifest = {
  id: "tgc-chatbot",
  name: "TGC Chatbot",
  type: "chatbot",
  version: "1.0.0",
  description:
    "Time Gap Cash Flow expert chatbot. Beantwoordt vragen over TGC: een liquiditeitsstrategie gebaseerd op tijd in plaats van bezit. Meertalig (NL/EN/DE/FR/ES).",
  tags: ["tgc", "finance", "liquidity", "chatbot"],
  capabilities: [
    {
      name: "ask",
      description:
        "Stel een vraag over Time Gap Cash Flow. De chatbot antwoordt op basis van de TGC whitepaper. Specificeer taal en detailniveau.",
      inputSchema: z.toJSONSchema(TgcAskInputSchema),
      outputSchema: z.toJSONSchema(TgcAskOutputSchema),
    },
  ],
  contextOutputs: ["lastTgcAnswer"],
  dependencies: [],
  ui: {
    icon: "Clock",
    color: "#6366f1",
  },
  requiresAuth: true,
  permissions: [],
  runtime: "typescript",
};
