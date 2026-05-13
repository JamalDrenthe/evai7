import { z } from "zod";

export const DocumentTypeSchema = z.enum(["passport", "id_card", "drivers_license", "residence_permit"]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

export const VerificationInputSchema = z.object({
  fullName: z.string().min(2),
  documentType: DocumentTypeSchema,
  documentNumber: z.string().min(3),
  dateOfBirth: z.string().describe("YYYY-MM-DD"),
  country: z.string().length(2).default("NL"),
});

export type VerificationInput = z.infer<typeof VerificationInputSchema>;

export const VerificationCheckSchema = z.object({
  name: z.string(),
  passed: z.boolean(),
  detail: z.string().optional(),
});

export const VerificationOutputSchema = z.object({
  status: z.enum(["approved", "review", "rejected"]),
  confidence: z.number().min(0).max(1),
  checks: z.array(VerificationCheckSchema),
  reference: z.string(),
});

export type VerificationOutput = z.infer<typeof VerificationOutputSchema>;
