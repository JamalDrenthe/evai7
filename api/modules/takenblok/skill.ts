import { nanoid } from "nanoid";
import type { Skill, SkillResult } from "../../../contracts/skill";
import type { ContextEntry } from "../../../contracts/session-context";
import { TakenblokInputSchema, type TakenblokInput, type TakenblokOutput } from "./schema";

const PRIO_LABEL: Record<string, string> = { low: "laag", medium: "medium", high: "hoog" };
const STATUS_LABEL: Record<string, string> = {
  todo: "Te doen",
  in_progress: "Bezig",
  review: "Review",
  done: "Klaar",
};

export function buildTaskPreview(input: TakenblokInput): TakenblokOutput {
  const parts: string[] = [`📝 **${input.title}** (${PRIO_LABEL[input.priority]} prio, kolom: ${STATUS_LABEL[input.status]})`];
  if (input.description) parts.push(input.description);
  if (input.assignee) parts.push(`→ ${input.assignee}`);
  if (input.dueDate) {
    const d = new Date(input.dueDate);
    if (!isNaN(d.getTime())) parts.push(`Deadline ${d.toLocaleDateString("nl-NL", { day: "numeric", month: "long" })}`);
  }

  return {
    task: {
      title: input.title,
      description: input.description,
      priority: input.priority,
      status: input.status,
      assignee: input.assignee,
      dueDate: input.dueDate,
    },
    summary: `${input.title} (${PRIO_LABEL[input.priority]}, ${STATUS_LABEL[input.status]})`,
    preview: parts.join("\n"),
  };
}

export const skill: Skill<TakenblokInput, TakenblokOutput> = {
  manifest: {
    id: "takenblok",
    name: "Takenblok",
    type: "tool",
    version: "1.0.0",
    description:
      "Kanban-tool: voorstellen voor nieuwe taken structureren. Persistence loopt via /werk en de work-router.",
    tags: ["tool", "kanban", "tasks", "productivity"],
    capabilities: [
      {
        name: "add_task",
        description:
          "Stel een nieuwe taak voor met titel, beschrijving, prioriteit, status, eventuele toegewezene en deadline. De gebruiker bevestigt vervolgens in het Takenblok-paneel.",
        inputSchema: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high"] },
            status: { type: "string", enum: ["todo", "in_progress", "review", "done"] },
            assignee: { type: "string" },
            dueDate: { type: "string", description: "ISO datum YYYY-MM-DD" },
          },
        },
        outputSchema: {
          type: "object",
          properties: { task: { type: "object" }, summary: { type: "string" } },
        },
      },
    ],
    contextRequirements: [],
    contextOutputs: ["lastSuggestedTask"],
    dependencies: [],
    ui: {
      panel: "@/modules/takenblok/Panel",
      icon: "ListTodo",
    },
    requiresAuth: true,
    permissions: [],
    runtime: "typescript",
  },
  capabilities: {
    add_task: async (rawInput, ctx): Promise<SkillResult<TakenblokOutput>> => {
      const ts = Date.now();
      const parsed = TakenblokInputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "INVALID_INPUT", message: parsed.error.message },
          trace: [{ step: "validate", ts }],
        };
      }
      const output = buildTaskPreview(parsed.data);
      const endTs = Date.now();
      ctx.emit({
        type: "skill.end",
        moduleId: "takenblok",
        capability: "add_task",
        ts: endTs,
        durationMs: endTs - ts,
      });

      const entry: ContextEntry = {
        id: nanoid(),
        ts: endTs,
        source: "skill",
        moduleId: "takenblok",
        capability: "add_task",
        kind: "output",
        payload: { input: parsed.data, output },
        refs: [],
        summary: `Takenblok suggestie: ${output.summary}`,
      };

      return {
        ok: true,
        data: output,
        contextDelta: {
          history: [entry],
          variables: {
            lastSuggestedTask: {
              name: "lastSuggestedTask",
              value: output.task,
              sourceEntryId: entry.id,
              ts: endTs,
            },
          },
        },
        trace: [
          { step: "validate", ts },
          { step: "build", ts: endTs },
        ],
      };
    },
  },
};
