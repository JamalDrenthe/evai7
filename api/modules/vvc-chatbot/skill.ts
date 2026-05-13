import { nanoid } from "nanoid";
import type { Skill, SkillResult } from "../../../contracts/skill";
import type { ContextEntry } from "../../../contracts/session-context";
import { VvcChatbotInputSchema, type VvcChatbotInput, type VvcChatbotOutput } from "./schema";

type KbEntry = { topic: string; keywords: string[]; response: string };

const KB: KbEntry[] = [
  {
    topic: "Verdienmodel",
    keywords: ["verdien", "geld", "salaris", "inkomen", "betaald", "30", "300", "finance"],
    response:
      "Het VVC Verdienmodel — Blueprint voor Groei.\n1. Actief (Basis): €30/uur gegarandeerd tijdens acquisitie.\n2. Direct (Jacht): €300 bonus per succesvolle plaatsing.\n3. Passief (Vermogen): €25/maand per actieve kandidaat — het 'Sneeuwbaleffect'.\nVoorbeeld: 10 plaatsingen/maand = €3.000 passief inkomen na 12 maanden.",
  },
  {
    topic: "Cultuur",
    keywords: ["cultuur", "waarden", "sfeer", "normen", "dna"],
    response:
      "Het VVC DNA: drie pijlers.\n1. Loyaliteit: partners, geen collega's. Geen politiek.\n2. Executie: resultaat is de enige waarheid.\n3. Eigenaarschap: CEO van eigen route, met rugdekking van de club.",
  },
  {
    topic: "Over VVC",
    keywords: ["wat is vvc", "over ons", "wie zijn jullie", "bedrijf", "club"],
    response:
      "De Verdienende Vrienden Club opereert op het snijvlak van vriendschap en zakelijke groei. We elimineren ruis voor bedrijven door processen te optimaliseren, en bieden toptalent een podium zonder plafond.",
  },
  {
    topic: "Diensten",
    keywords: ["diensten", "wat doen jullie", "klanten", "aanbod", "product"],
    response:
      "360° Kwaliteitsaanpak voor partners:\n• Kwaliteitscontrole — grondige analyse van reviews & specificaties.\n• Workflow Optimalisatie — inefficiëntie elimineren uit systemen.\n• Mystery Shopping — ongefilterde realiteit van de klantbeleving.",
  },
  {
    topic: "Double Team",
    keywords: ["double", "team", "pilot", "duo", "samenwerken"],
    response:
      "Project Double Team — symbiose van specialismen.\n1. De Netwerker opent deuren.\n2. De Killer Closer sluit de deal.\nGemiddelde output: €4.000 p.p./maand.",
  },
  {
    topic: "Sneeuwbaleffect",
    keywords: ["passief", "sneeuwbal", "toekomst", "pensioen"],
    response:
      "Het Sneeuwbaleffect: €25/maand per plaatsing zolang de kandidaat blijft. Stapelt cumulatief.\n• Maand 1: €250 (10 plaatsingen)\n• Jaar 1: €3.000/maand passief.\nGeld werkt voor jou.",
  },
];

const FALLBACK = {
  topic: "Algemeen",
  response:
    "Dat ligt buiten mijn focusgebied. Mijn expertise: het Verdienmodel & Passief Inkomen, de Double Team-strategie, en onze cultuur van executie.",
};

export function lookupVvc(query: string): VvcChatbotOutput {
  const lower = query.toLowerCase();
  for (const entry of KB) {
    if (entry.keywords.some((k) => lower.includes(k))) {
      return { topic: entry.topic, response: entry.response, matched: true };
    }
  }
  return { topic: FALLBACK.topic, response: FALLBACK.response, matched: false };
}

export const skill: Skill<VvcChatbotInput, VvcChatbotOutput> = {
  manifest: {
    id: "vvc-chatbot",
    name: "VVC Chatbot",
    type: "chatbot",
    version: "1.0.0",
    description:
      "Knowledge-base lookup voor de Verdienende Vrienden Club: verdienmodel, cultuur, Double Team, sneeuwbaleffect.",
    tags: ["chatbot", "vvc", "knowledge-base", "sales"],
    capabilities: [
      {
        name: "chat",
        description:
          "Beantwoordt vragen over VVC (verdienmodel, cultuur, diensten, Double Team, passief inkomen).",
        inputSchema: {
          type: "object",
          required: ["query"],
          properties: {
            query: { type: "string", description: "De vraag van de gebruiker over VVC." },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            topic: { type: "string" },
            response: { type: "string" },
            matched: { type: "boolean" },
          },
        },
      },
    ],
    contextRequirements: [],
    contextOutputs: ["lastVvcTopic"],
    dependencies: [],
    ui: {
      panel: "@/modules/vvc-chatbot/Panel",
      icon: "MessageSquare",
    },
    requiresAuth: true,
    permissions: [],
    runtime: "typescript",
  },
  capabilities: {
    chat: async (rawInput, ctx): Promise<SkillResult<VvcChatbotOutput>> => {
      const ts = Date.now();
      const parsed = VvcChatbotInputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "INVALID_INPUT", message: parsed.error.message },
          trace: [{ step: "validate", ts }],
        };
      }
      ctx.emit({ type: "skill.start", moduleId: "vvc-chatbot", capability: "chat", ts });
      const output = lookupVvc(parsed.data.query);
      const endTs = Date.now();
      ctx.emit({
        type: "skill.end",
        moduleId: "vvc-chatbot",
        capability: "chat",
        ts: endTs,
        durationMs: endTs - ts,
      });

      const entry: ContextEntry = {
        id: nanoid(),
        ts: endTs,
        source: "skill",
        moduleId: "vvc-chatbot",
        capability: "chat",
        kind: "output",
        payload: { input: parsed.data, output },
        refs: [],
        summary: `VVC ${output.matched ? output.topic : "fallback"}: ${parsed.data.query.slice(0, 60)}`,
      };

      return {
        ok: true,
        data: output,
        contextDelta: {
          history: [entry],
          variables: {
            lastVvcTopic: {
              name: "lastVvcTopic",
              value: output.topic,
              sourceEntryId: entry.id,
              ts: endTs,
            },
          },
        },
        trace: [
          { step: "validate", ts },
          { step: "lookup", ts: endTs },
        ],
      };
    },
  },
};
