import { nanoid } from "nanoid";
import type { Skill, SkillResult } from "../../../contracts/skill";
import type { ContextEntry } from "../../../contracts/session-context";
import { VisualizationInputSchema, type VisualizationInput, type VisualizationOutput } from "./schema";

export function normalizeChart(input: VisualizationInput): VisualizationOutput {
  return {
    kind: input.kind,
    title: input.title,
    data: input.data,
    xKey: input.xKey,
    yKeys: input.yKeys,
    pointCount: input.data.length,
    seriesCount: input.yKeys.length,
  };
}

export const skill: Skill<VisualizationInput, VisualizationOutput> = {
  manifest: {
    id: "visualization",
    name: "Visualization",
    type: "visualization",
    version: "1.0.0",
    description:
      "Bouw line/bar/area charts uit gestructureerde data. Output wordt door het Visualization-paneel gerenderd met Recharts.",
    tags: ["visualization", "chart", "graph", "recharts"],
    capabilities: [
      {
        name: "generate",
        description:
          "Genereer een chart-spec. Specificeer kind (line/bar/area), titel, datapunten als records, en welke velden de x-as en numerieke series zijn.",
        inputSchema: {
          type: "object",
          required: ["data", "xKey", "yKeys"],
          properties: {
            kind: { type: "string", enum: ["line", "bar", "area"] },
            title: { type: "string" },
            data: {
              type: "array",
              items: { type: "object" },
              description: "Rijen met datapunten",
            },
            xKey: { type: "string" },
            yKeys: { type: "array", items: { type: "string" } },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            kind: { type: "string" },
            data: { type: "array" },
            pointCount: { type: "number" },
          },
        },
      },
    ],
    contextRequirements: [],
    contextOutputs: ["lastChart"],
    dependencies: [],
    ui: {
      panel: "@/modules/visualization/Panel",
      icon: "BarChart",
    },
    requiresAuth: true,
    permissions: [],
    runtime: "typescript",
  },
  capabilities: {
    generate: async (rawInput, ctx): Promise<SkillResult<VisualizationOutput>> => {
      const ts = Date.now();
      const parsed = VisualizationInputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "INVALID_INPUT", message: parsed.error.message },
          trace: [{ step: "validate", ts }],
        };
      }
      const output = normalizeChart(parsed.data);
      const endTs = Date.now();
      ctx.emit({
        type: "skill.end",
        moduleId: "visualization",
        capability: "generate",
        ts: endTs,
        durationMs: endTs - ts,
      });

      const entry: ContextEntry = {
        id: nanoid(),
        ts: endTs,
        source: "skill",
        moduleId: "visualization",
        capability: "generate",
        kind: "output",
        payload: { input: parsed.data, output },
        refs: [],
        summary: `${output.kind} chart "${output.title}" · ${output.pointCount} punten × ${output.seriesCount} series`,
      };

      return {
        ok: true,
        data: output,
        contextDelta: {
          history: [entry],
          variables: {
            lastChart: {
              name: "lastChart",
              value: output,
              sourceEntryId: entry.id,
              ts: endTs,
            },
          },
        },
        trace: [
          { step: "validate", ts },
          { step: "normalize", ts: endTs },
        ],
      };
    },
  },
};
