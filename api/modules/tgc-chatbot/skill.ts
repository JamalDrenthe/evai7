import { nanoid } from "nanoid";
import type { Skill, SkillResult } from "../../../contracts/skill";
import type { ContextEntry } from "../../../contracts/session-context";
import { manifest } from "./manifest";
import { TgcAskInputSchema, type TgcAskInput, type TgcAskOutput } from "./schema";
import { buildTgcSystemPrompt } from "./knowledge";
import { getLLMClient } from "../../orchestrator/llm-client";

export const skill: Skill<TgcAskInput, TgcAskOutput> = {
  manifest,
  capabilities: {
    ask: async (rawInput, ctx): Promise<SkillResult<TgcAskOutput>> => {
      const startTs = Date.now();
      const trace: SkillResult["trace"] = [{ step: "validate", ts: startTs }];

      const parsed = TgcAskInputSchema.safeParse(rawInput);
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
        capability: "ask",
        ts: startTs,
      });

      const llm = ctx.llm ?? getLLMClient();
      const systemPrompt = buildTgcSystemPrompt(input.language, input.detailLevel);

      try {
        const completion = await llm.complete({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.question },
          ],
          temperature: 0.4,
          abortSignal: ctx.abortSignal,
        });

        const endTs = Date.now();
        trace.push({ step: "llm", ts: endTs, meta: { durationMs: endTs - startTs } });

        ctx.emit({
          type: "skill.end",
          moduleId: manifest.id,
          capability: "ask",
          ts: endTs,
          durationMs: endTs - startTs,
        });

        const output: TgcAskOutput = {
          answer: completion.content || "(Geen antwoord)",
          language: input.language,
          detailLevel: input.detailLevel,
        };

        const entry: ContextEntry = {
          id: nanoid(),
          ts: endTs,
          source: "skill",
          moduleId: manifest.id,
          capability: "ask",
          kind: "output",
          payload: { input, output },
          refs: [],
          summary: `TGC: ${input.question.slice(0, 60)}${input.question.length > 60 ? "…" : ""}`,
        };

        return {
          ok: true,
          data: output,
          contextDelta: {
            history: [entry],
            variables: {
              lastTgcAnswer: {
                name: "lastTgcAnswer",
                value: output.answer,
                sourceEntryId: entry.id,
                ts: endTs,
              },
            },
          },
          trace,
        };
      } catch (err) {
        const endTs = Date.now();
        const message = err instanceof Error ? err.message : String(err);
        trace.push({ step: "error", ts: endTs, meta: { error: message } });
        return {
          ok: false,
          error: { code: "LLM_ERROR", message },
          trace,
        };
      }
    },
  },
};
