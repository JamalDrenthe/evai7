import type { Skill, SkillResult } from "../../../contracts/skill";
import type { InvocationContext } from "../../../contracts/skill";
import type { VoiceVerificationInput, VoiceVerificationOutput } from "./schema";

// Placeholder skill - to be filled in when source code is provided
// This is a TypeScript integration stub for a Python sidecar service
export function verifyVoice(_input: VoiceVerificationInput): VoiceVerificationOutput {
  // Suppress unused warning - placeholder implementation
  void _input;
  return {
    placeholder: "Voice verification logic not yet implemented - Python sidecar source code pending from user",
  };
}

export const skill: Skill<VoiceVerificationInput, VoiceVerificationOutput> = {
  manifest: {
    id: "voice-verification",
    name: "Voice Verification",
    type: "verification",
    version: "1.0.0",
    description: "Voice verification via Python sidecar - source code pending from user",
    tags: ["verification", "voice", "audio", "python-sidecar"],
    capabilities: [
      {
        name: "verify",
        description: "Verify voice identity via Python sidecar - implementation pending",
        inputSchema: {
          type: "object",
          properties: {},
        },
        outputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
    contextRequirements: [],
    contextOutputs: [],
    dependencies: [],
    ui: {
      panel: "@/modules/voice-verification/Panel",
      icon: "Mic",
    },
    requiresAuth: true,
    permissions: [],
    runtime: "typescript",
  },
  capabilities: {
    verify: async (input: VoiceVerificationInput, ctx: InvocationContext): Promise<SkillResult<VoiceVerificationOutput>> => {
      // Suppress unused warning - placeholder implementation
      void ctx;
      try {
        const output = verifyVoice(input);
        return {
          ok: true,
          data: output,
          contextDelta: {},
          trace: [{ step: "verify", ts: Date.now() }],
        };
      } catch (err) {
        return {
          ok: false,
          error: {
            code: "VOICE_VERIFICATION_ERROR",
            message: err instanceof Error ? err.message : String(err),
          },
          contextDelta: {},
          trace: [{ step: "error", ts: Date.now() }],
        };
      }
    },
  },
};
