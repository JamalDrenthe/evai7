import { z } from "zod";

export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export const TaskStatusSchema = z.enum(["todo", "in_progress", "review", "done"]);

export const TakenblokInputSchema = z.object({
  title: z.string().min(1).describe("Korte titel van de taak."),
  description: z.string().optional().describe("Optionele uitwerking van de taak."),
  priority: TaskPrioritySchema.default("medium"),
  status: TaskStatusSchema.default("todo"),
  assignee: z.string().optional().describe("Naam van de persoon aan wie de taak is toegewezen."),
  dueDate: z.string().optional().describe("ISO datum waarop de taak af moet zijn."),
});

export type TakenblokInput = z.infer<typeof TakenblokInputSchema>;

export const TakenblokOutputSchema = z.object({
  task: z.object({
    title: z.string(),
    description: z.string().optional(),
    priority: TaskPrioritySchema,
    status: TaskStatusSchema,
    assignee: z.string().optional(),
    dueDate: z.string().optional(),
  }),
  summary: z.string(),
  /** Friendly preview the user can confirm before persisting. */
  preview: z.string(),
});

export type TakenblokOutput = z.infer<typeof TakenblokOutputSchema>;
