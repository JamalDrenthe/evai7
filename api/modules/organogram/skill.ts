import { nanoid } from "nanoid";
import type { Skill, SkillResult } from "../../../contracts/skill";
import type { ContextEntry } from "../../../contracts/session-context";
import { manifest } from "./manifest";
import {
  QueryRoleInputSchema,
  RenderTreeInputSchema,
  type QueryRoleInput,
  type QueryRoleOutput,
  type RenderTreeInput,
  type RenderTreeOutput,
} from "./schema";
import { organizationData, findRolePath, summarizeTree } from "./data";

type AnyInput = QueryRoleInput | RenderTreeInput;
type AnyOutput = QueryRoleOutput | RenderTreeOutput;

export const skill: Skill<AnyInput, AnyOutput> = {
  manifest,
  capabilities: {
    "render-tree": async (rawInput, ctx): Promise<SkillResult<RenderTreeOutput>> => {
      const startTs = Date.now();
      const trace: SkillResult["trace"] = [{ step: "validate", ts: startTs }];
      const parsed = RenderTreeInputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "INVALID_INPUT", message: parsed.error.message },
          trace,
        };
      }

      ctx.emit({
        type: "skill.start",
        moduleId: manifest.id,
        capability: "render-tree",
        ts: startTs,
      });

      const summary = summarizeTree(organizationData);
      const endTs = Date.now();
      ctx.emit({
        type: "skill.end",
        moduleId: manifest.id,
        capability: "render-tree",
        ts: endTs,
        durationMs: endTs - startTs,
      });
      trace.push({ step: "summarize", ts: endTs });

      const entry: ContextEntry = {
        id: nanoid(),
        ts: endTs,
        source: "skill",
        moduleId: manifest.id,
        capability: "render-tree",
        kind: "output",
        payload: summary,
        refs: [],
        summary: `Organogram: ${summary.totalNodes} rollen, ${summary.maxDepth} niveaus`,
      };

      return {
        ok: true,
        data: summary,
        contextDelta: { history: [entry] },
        trace,
      };
    },
    "query-role": async (rawInput, ctx): Promise<SkillResult<QueryRoleOutput>> => {
      const startTs = Date.now();
      const trace: SkillResult["trace"] = [{ step: "validate", ts: startTs }];
      const parsed = QueryRoleInputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "INVALID_INPUT", message: parsed.error.message },
          trace,
        };
      }
      const input = parsed.data;

      ctx.emit({
        type: "skill.start",
        moduleId: manifest.id,
        capability: "query-role",
        ts: startTs,
      });

      const result = findRolePath(organizationData, input.roleName);
      const endTs = Date.now();
      const output: QueryRoleOutput = result
        ? {
            found: true,
            role: result.node.role,
            type: result.node.type,
            path: result.path,
            level: result.level,
            hasChildren: !!result.node.children?.length,
          }
        : {
            found: false,
            path: [],
            message: `Rol "${input.roleName}" niet gevonden in organogram.`,
          };

      ctx.emit({
        type: "skill.end",
        moduleId: manifest.id,
        capability: "query-role",
        ts: endTs,
        durationMs: endTs - startTs,
      });

      const entry: ContextEntry = {
        id: nanoid(),
        ts: endTs,
        source: "skill",
        moduleId: manifest.id,
        capability: "query-role",
        kind: "output",
        payload: { input, output },
        refs: [],
        summary: output.found
          ? `Rol gevonden: ${output.role} (niveau ${output.level})`
          : `Rol niet gevonden: ${input.roleName}`,
      };

      return {
        ok: true,
        data: output,
        contextDelta: { history: [entry] },
        trace,
      };
    },
  },
};
