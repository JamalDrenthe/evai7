import { nanoid } from "nanoid";
import type { Skill, SkillResult } from "../../../contracts/skill";
import type { ContextEntry } from "../../../contracts/session-context";
import { EcosysteemInputSchema, type EcosysteemInput, type EcosysteemOutput } from "./schema";

type Topic = { topic: string; keywords: string[]; response: string; modules: string[] };

const TOPICS: Topic[] = [
  {
    topic: "Calculators",
    keywords: ["bereken", "calculator", "zzp", "vvc", "mining", "estate", "vastgoed", "netto", "belasting"],
    response:
      "Het ecosysteem heeft 4 calculators:\n• **ZZP Netto** — Nederlandse 2025 belastingberekening voor ZZP'ers\n• **VVC** — Inkomsten voor de Verdienende Vrienden Club\n• **Mining** — Streaming-revenue (Spotify/Apple/YouTube)\n• **Estate** — Vastgoed-vliegwiel acquisitie\n\nIn Chat-with-Calculators mode roept de LLM ze automatisch aan.",
    modules: ["zzp-netto-calculator", "vvc-calculator", "mining-calculator", "estate-calculator"],
  },
  {
    topic: "Chatbots",
    keywords: ["chat", "chatbot", "vraag", "tgc", "kennis", "advies"],
    response:
      "Drie functionele chatbots:\n• **TGC** — multilingual cashflow expert\n• **VVC** — verdienmodel + cultuur knowledge base\n• **Ecosysteem** (ik) — routes je naar de juiste module\n\nGebruik Chat-with-Projects mode om ze in dezelfde sessie te combineren.",
    modules: ["tgc-chatbot", "vvc-chatbot", "ecosysteem-chatbot"],
  },
  {
    topic: "Productiviteit",
    keywords: ["taken", "kanban", "takenblok", "organogram", "team", "werk", "agenda", "planning"],
    response:
      "Productiviteits-modules:\n• **Takenblok** — kanban gevoed door /werk\n• **Organogram** — bedrijfsstructuur, doorzoekbaar\n• **Documenten** — workspace docs\n• **/agenda** — events met maandkalender\n• **/werk** — taken-overzicht met KPI's",
    modules: ["takenblok", "organogram"],
  },
  {
    topic: "Verificatie",
    keywords: ["verificatie", "stem", "voice", "kyc", "identiteit", "id"],
    response:
      "Verificatie modules:\n• **Verification** — KYC formulier voor identiteitscontrole\n• **Voice Verification** — stemverificatie met live waveform (Python sidecar volgt)",
    modules: ["verification", "voice-verification"],
  },
  {
    topic: "Visualisatie",
    keywords: ["grafiek", "chart", "visualisatie", "visualization", "bar", "line"],
    response:
      "**Visualization** module: bouw line/bar charts uit context variabelen (Recharts onder de motorkap).",
    modules: ["visualization"],
  },
  {
    topic: "Hoe werkt EVAI",
    keywords: ["hoe", "werkt", "ecosysteem", "evai", "wat is", "platform"],
    response:
      "EVAI is een **AI operating system voor tools**. Een chat-gedreven workspace waar de LLM elk module als typed function call kan aanroepen, met gedeelde sessie-context die persisteert tussen tool-calls. Drie modes: Chat-with-Calculators, Chat-with-Projects, Direct Tool.",
    modules: [],
  },
];

const FALLBACK: EcosysteemOutput = {
  topic: "Algemeen",
  response:
    "Ik help je navigeren door het EVAI ecosysteem: calculators, chatbots, productiviteit, verificatie, visualisatie. Vraag bijvoorbeeld 'Welke calculator gebruik ik voor mijn ZZP belasting?' of 'Hoe werkt het takenblok?'.",
  relatedModules: [],
};

export function routeEcosysteem(query: string): EcosysteemOutput {
  const lower = query.toLowerCase();
  for (const t of TOPICS) {
    if (t.keywords.some((k) => lower.includes(k))) {
      return { topic: t.topic, response: t.response, relatedModules: t.modules };
    }
  }
  return FALLBACK;
}

export const skill: Skill<EcosysteemInput, EcosysteemOutput> = {
  manifest: {
    id: "ecosysteem-chatbot",
    name: "Ecosysteem Chatbot",
    type: "chatbot",
    version: "1.0.0",
    description:
      "Meta-chatbot voor het EVAI ecosysteem: routeert vragen naar de juiste calculator/chatbot/tool.",
    tags: ["chatbot", "meta", "router", "discovery"],
    capabilities: [
      {
        name: "chat",
        description:
          "Beantwoordt vragen over welke EVAI modules bestaan en wijst de juiste tool aan voor de vraag van de gebruiker.",
        inputSchema: {
          type: "object",
          required: ["query"],
          properties: {
            query: { type: "string", description: "De vraag over het ecosysteem." },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            topic: { type: "string" },
            response: { type: "string" },
            relatedModules: { type: "array", items: { type: "string" } },
          },
        },
      },
    ],
    contextRequirements: [],
    contextOutputs: ["lastEcosysteemTopic"],
    dependencies: [],
    ui: {
      panel: "@/modules/ecosysteem-chatbot/Panel",
      icon: "Network",
    },
    requiresAuth: true,
    permissions: [],
    runtime: "typescript",
  },
  capabilities: {
    chat: async (rawInput, ctx): Promise<SkillResult<EcosysteemOutput>> => {
      const ts = Date.now();
      const parsed = EcosysteemInputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "INVALID_INPUT", message: parsed.error.message },
          trace: [{ step: "validate", ts }],
        };
      }
      const output = routeEcosysteem(parsed.data.query);
      const endTs = Date.now();
      ctx.emit({
        type: "skill.end",
        moduleId: "ecosysteem-chatbot",
        capability: "chat",
        ts: endTs,
        durationMs: endTs - ts,
      });

      const entry: ContextEntry = {
        id: nanoid(),
        ts: endTs,
        source: "skill",
        moduleId: "ecosysteem-chatbot",
        capability: "chat",
        kind: "output",
        payload: { input: parsed.data, output },
        refs: [],
        summary: `Ecosysteem → ${output.topic} (${output.relatedModules.length} modules)`,
      };

      return {
        ok: true,
        data: output,
        contextDelta: {
          history: [entry],
          variables: {
            lastEcosysteemTopic: {
              name: "lastEcosysteemTopic",
              value: output.topic,
              sourceEntryId: entry.id,
              ts: endTs,
            },
          },
        },
        trace: [
          { step: "validate", ts },
          { step: "route", ts: endTs },
        ],
      };
    },
  },
};
