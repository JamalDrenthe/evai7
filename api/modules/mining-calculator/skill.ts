import { nanoid } from "nanoid";
import type { Skill, SkillResult } from "../../../contracts/skill";
import type { ContextEntry } from "../../../contracts/session-context";
import { MiningInputSchema, type MiningInput, type MiningOutput } from "./schema";

export function calculateMining(input: MiningInput): MiningOutput {
  const totalTracks = input.albums * input.tracksPerAlbum;
  const totalStreams = totalTracks * input.streamsPerTrack;

  const platforms = input.platforms
    .map((p) => {
      const streams = totalStreams * (p.percent / 100);
      const revenue = (streams / 1_000_000) * p.rate;
      return { id: p.id, name: p.name, streams, revenue };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const totalGross = platforms.reduce((s, p) => s + p.revenue, 0);
  const distributorFee = totalGross * (input.distributorFeePct / 100);
  const totalNet = totalGross - distributorFee;

  // Farm: each Apple Mini produces ~720 plays/day, across all platforms
  const dailyPerPlatform = input.appleMinis * 720;
  const dailyTotalStreams = dailyPerPlatform * input.platforms.length;
  const farmStreams = dailyTotalStreams * input.farmDays;
  const farmGross = input.platforms.reduce(
    (s, p) => s + ((dailyPerPlatform * input.farmDays) / 1_000_000) * p.rate,
    0,
  );
  const farmFee = farmGross * (input.distributorFeePct / 100);
  const farmNet = farmGross - farmFee;
  const daysToGoal = dailyTotalStreams > 0 ? totalStreams / dailyTotalStreams : 0;

  return {
    totalTracks,
    totalStreams,
    totalGross,
    distributorFee,
    totalNet,
    platforms,
    farm: {
      appleMinis: input.appleMinis,
      dailyTotalStreams,
      totalStreams: farmStreams,
      gross: farmGross,
      distributorFee: farmFee,
      net: farmNet,
      daysToGoal,
    },
  };
}

const formatEuro = (n: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export const skill: Skill<MiningInput, MiningOutput> = {
  manifest: {
    id: "mining-calculator",
    name: "Mining Calculator",
    type: "calculator",
    version: "1.0.0",
    description:
      "Bereken de bruto- en netto-opbrengst van een muziekcatalogus over Spotify/Apple/YouTube/Tidal/etc., inclusief een Apple Mini stream-farm.",
    tags: ["calculator", "streaming", "music", "revenue"],
    capabilities: [
      {
        name: "calculate",
        description:
          "Bereken streaming-opbrengsten gegeven catalogusgrootte, streams per track, platform-mix en distributor-fee.",
        inputSchema: {
          type: "object",
          properties: {
            albums: { type: "number", description: "Aantal albums" },
            tracksPerAlbum: { type: "number", description: "Nummers per album" },
            streamsPerTrack: { type: "number", description: "Streams per track per jaar" },
            distributorFeePct: { type: "number", description: "Distributor fee in %" },
            appleMinis: { type: "number", description: "Aantal Apple Mini devices voor stream-farm" },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            totalNet: { type: "number" },
            totalGross: { type: "number" },
            platforms: { type: "array" },
          },
        },
      },
    ],
    contextRequirements: [],
    contextOutputs: ["lastMiningNet", "lastMiningInput"],
    dependencies: [],
    ui: {
      panel: "@/modules/mining-calculator/Panel",
      icon: "Disc",
    },
    requiresAuth: true,
    permissions: [],
    runtime: "typescript",
  },
  capabilities: {
    calculate: async (rawInput, ctx): Promise<SkillResult<MiningOutput>> => {
      const startTs = Date.now();
      const trace: SkillResult["trace"] = [{ step: "validate", ts: startTs }];

      const parsed = MiningInputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "INVALID_INPUT", message: parsed.error.message },
          trace,
        };
      }

      ctx.emit({
        type: "skill.start",
        moduleId: "mining-calculator",
        capability: "calculate",
        ts: startTs,
      });

      const output = calculateMining(parsed.data);
      const endTs = Date.now();
      trace.push({ step: "compute", ts: endTs, meta: { durationMs: endTs - startTs } });

      ctx.emit({
        type: "skill.end",
        moduleId: "mining-calculator",
        capability: "calculate",
        ts: endTs,
        durationMs: endTs - startTs,
      });

      const entry: ContextEntry = {
        id: nanoid(),
        ts: endTs,
        source: "skill",
        moduleId: "mining-calculator",
        capability: "calculate",
        kind: "output",
        payload: { input: parsed.data, output },
        refs: [],
        summary: `Mining: ${formatEuro(output.totalNet)} netto · ${output.platforms[0]?.name} top platform`,
      };

      return {
        ok: true,
        data: output,
        contextDelta: {
          history: [entry],
          variables: {
            lastMiningNet: {
              name: "lastMiningNet",
              value: output.totalNet,
              sourceEntryId: entry.id,
              ts: endTs,
            },
            lastMiningInput: {
              name: "lastMiningInput",
              value: parsed.data,
              sourceEntryId: entry.id,
              ts: endTs,
            },
          },
        },
        trace,
      };
    },
  },
};
