import { z } from "zod";

export const OrgRoleType = z.enum([
  "founder",
  "cofounder",
  "partner",
  "csuite",
  "director",
  "manager",
  "senior",
  "recruitment",
]);
export type OrgRoleType = z.infer<typeof OrgRoleType>;

export const OrgNodeSchema: z.ZodType<{
  role: string;
  type: OrgRoleType;
  isEntry?: boolean;
  left?: Array<{ role: string; type: OrgRoleType }>;
  right?: Array<{ role: string; type: OrgRoleType }>;
  children?: unknown[];
}> = z.lazy(() =>
  z.object({
    role: z.string(),
    type: OrgRoleType,
    isEntry: z.boolean().optional(),
    left: z
      .array(z.object({ role: z.string(), type: OrgRoleType }))
      .optional(),
    right: z
      .array(z.object({ role: z.string(), type: OrgRoleType }))
      .optional(),
    children: z.array(OrgNodeSchema).optional(),
  }),
);

export const QueryRoleInputSchema = z.object({
  roleName: z.string().min(1).describe("Naam van de rol om te zoeken"),
});
export type QueryRoleInput = z.infer<typeof QueryRoleInputSchema>;

export const QueryRoleOutputSchema = z.object({
  found: z.boolean(),
  role: z.string().optional(),
  type: z.string().optional(),
  path: z.array(z.string()).describe("Pad van root naar deze rol"),
  level: z.number().optional(),
  hasChildren: z.boolean().optional(),
  message: z.string().optional(),
});
export type QueryRoleOutput = z.infer<typeof QueryRoleOutputSchema>;

export const RenderTreeInputSchema = z.object({});
export type RenderTreeInput = z.infer<typeof RenderTreeInputSchema>;

export const RenderTreeOutputSchema = z.object({
  totalNodes: z.number(),
  maxDepth: z.number(),
  rolesByType: z.record(z.string(), z.array(z.string())),
});
export type RenderTreeOutput = z.infer<typeof RenderTreeOutputSchema>;
