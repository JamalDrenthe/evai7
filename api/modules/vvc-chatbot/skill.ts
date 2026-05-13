import type { Skill, SkillResult } from "../../../contracts/skill";
import type { InvocationContext } from "../../../contracts/skill";
import type { VvcChatbotInput, VvcChatbotOutput } from "./schema";

// Placeholder skill - to be filled in when source code is provided
export function chatVvc(_input: VvcChatbotInput): VvcChatbotOutput {
  // Suppress unused warning - placeholder implementation
  void _input;
  return {
    placeholder: "VVC Chatbot logic not yet implemented - source code pending from user",
  };
}

export const skill: Skill<VvcChatbotInput, VvcChatbotOutput> = {
  manifest: {
    id: "vvc-chatbot",
    name: "VVC Chatbot",
    type: "chatbot",
    version: "1.0.0",
    description: "VVC chatbot - source code pending from user",
    tags: ["chatbot", "vvc"],
    capabilities: [
      {
        name: "chat",
        description: "Chat with VVC chatbot - implementation pending",
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
      panel: "@/modules/vvc-chatbot/Panel",
      icon: "MessageSquare",
    },
    requiresAuth: true,
    permissions: [],
    runtime: "typescript",
  },
  capabilities: {
    chat: async (input: VvcChatbotInput, ctx: InvocationContext): Promise<SkillResult<VvcChatbotOutput>> => {
      // Suppress unused warning - placeholder implementation
      void ctx;
      try {
        const output = chatVvc(input);
        return {
          ok: true,
          data: output,
          contextDelta: {},
          trace: [{ step: "chat", ts: Date.now() }],
        };
      } catch (err) {
        return {
          ok: false,
          error: {
            code: "CHAT_ERROR",
            message: err instanceof Error ? err.message : String(err),
          },
          contextDelta: {},
          trace: [{ step: "error", ts: Date.now() }],
        };
      }
    },
  },
};
