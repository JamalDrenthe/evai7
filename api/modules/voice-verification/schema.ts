import { z } from "zod";

export const VoiceVerificationInputSchema = z.object({
  speakerId: z.string().min(1).describe("Identifier van de spreker die geverifieerd moet worden."),
  /** Duration of the audio sample in seconds. */
  sampleSeconds: z.number().min(0.5).max(60).default(5),
  /** Optional base64-encoded audio. Reserved for the Python sidecar; ignored in the TS stub. */
  audioBase64: z.string().optional(),
});

export type VoiceVerificationInput = z.infer<typeof VoiceVerificationInputSchema>;

export const VoiceVerificationOutputSchema = z.object({
  match: z.boolean(),
  confidence: z.number().min(0).max(1),
  speakerId: z.string(),
  sampleSeconds: z.number(),
  pythonSidecarAvailable: z.boolean(),
  note: z.string(),
});

export type VoiceVerificationOutput = z.infer<typeof VoiceVerificationOutputSchema>;
