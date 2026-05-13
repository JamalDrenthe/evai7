import { nanoid } from "nanoid";
import type { Skill, SkillResult } from "../../../contracts/skill";
import type { ContextEntry } from "../../../contracts/session-context";
import { VoiceVerificationInputSchema, type VoiceVerificationInput, type VoiceVerificationOutput } from "./schema";

const PYTHON_BRIDGE_URL = process.env.PYTHON_BRIDGE_URL?.trim() ?? "";

async function callSidecar(input: VoiceVerificationInput): Promise<VoiceVerificationOutput | null> {
  if (!PYTHON_BRIDGE_URL) return null;
  try {
    const res = await fetch(`${PYTHON_BRIDGE_URL.replace(/\/$/, "")}/voice-verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Partial<VoiceVerificationOutput>;
    return {
      match: !!json.match,
      confidence: typeof json.confidence === "number" ? Math.max(0, Math.min(1, json.confidence)) : 0,
      speakerId: input.speakerId,
      sampleSeconds: input.sampleSeconds,
      pythonSidecarAvailable: true,
      note: json.note ?? "Result from python sidecar",
    };
  } catch {
    return null;
  }
}

function deterministicMock(input: VoiceVerificationInput): VoiceVerificationOutput {
  // Deterministic pseudo-confidence based on sample length + speakerId hash
  let h = 0;
  for (let i = 0; i < input.speakerId.length; i++) {
    h = (h * 31 + input.speakerId.charCodeAt(i)) >>> 0;
  }
  const base = (h % 100) / 100; // 0–0.99
  const lenBoost = Math.min(0.25, input.sampleSeconds / 20);
  const confidence = Math.min(0.99, base * 0.6 + lenBoost + 0.2);
  return {
    match: confidence >= 0.6,
    confidence,
    speakerId: input.speakerId,
    sampleSeconds: input.sampleSeconds,
    pythonSidecarAvailable: false,
    note: PYTHON_BRIDGE_URL
      ? "Python sidecar onbereikbaar — deterministische demo-mock gebruikt."
      : "PYTHON_BRIDGE_URL niet geconfigureerd — deterministische demo-mock.",
  };
}

export const skill: Skill<VoiceVerificationInput, VoiceVerificationOutput> = {
  manifest: {
    id: "voice-verification",
    name: "Voice Verification",
    type: "verification",
    version: "1.0.0",
    description:
      "Stemverificatie via een Python sidecar (wanneer PYTHON_BRIDGE_URL is geconfigureerd). Zonder sidecar valt het terug op een deterministische demo-mock.",
    tags: ["verification", "voice", "audio", "python-sidecar"],
    capabilities: [
      {
        name: "verify",
        description:
          "Verifieer een stemsample tegen een speakerId. Geeft match (boolean) + confidence (0–1). Met PYTHON_BRIDGE_URL gaat het via de sidecar; anders mock.",
        inputSchema: {
          type: "object",
          required: ["speakerId"],
          properties: {
            speakerId: { type: "string" },
            sampleSeconds: { type: "number" },
            audioBase64: { type: "string" },
          },
        },
        outputSchema: {
          type: "object",
          properties: {
            match: { type: "boolean" },
            confidence: { type: "number" },
            pythonSidecarAvailable: { type: "boolean" },
          },
        },
      },
    ],
    contextRequirements: [],
    contextOutputs: ["lastVoiceVerification"],
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
    verify: async (rawInput, ctx): Promise<SkillResult<VoiceVerificationOutput>> => {
      const ts = Date.now();
      const parsed = VoiceVerificationInputSchema.safeParse(rawInput);
      if (!parsed.success) {
        return {
          ok: false,
          error: { code: "INVALID_INPUT", message: parsed.error.message },
          trace: [{ step: "validate", ts }],
        };
      }
      const fromSidecar = await callSidecar(parsed.data);
      const output = fromSidecar ?? deterministicMock(parsed.data);
      const endTs = Date.now();
      ctx.emit({
        type: "skill.end",
        moduleId: "voice-verification",
        capability: "verify",
        ts: endTs,
        durationMs: endTs - ts,
      });

      const entry: ContextEntry = {
        id: nanoid(),
        ts: endTs,
        source: "skill",
        moduleId: "voice-verification",
        capability: "verify",
        kind: "output",
        payload: { input: parsed.data, output },
        refs: [],
        summary: `Voice ${output.match ? "match" : "mismatch"} · ${(output.confidence * 100).toFixed(0)}% (${output.pythonSidecarAvailable ? "sidecar" : "mock"})`,
      };

      return {
        ok: true,
        data: output,
        contextDelta: {
          history: [entry],
          variables: {
            lastVoiceVerification: {
              name: "lastVoiceVerification",
              value: { match: output.match, confidence: output.confidence },
              sourceEntryId: entry.id,
              ts: endTs,
            },
          },
        },
        trace: [
          { step: "validate", ts },
          { step: output.pythonSidecarAvailable ? "sidecar" : "mock", ts: endTs },
        ],
      };
    },
  },
};
