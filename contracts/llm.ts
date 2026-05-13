export type ChatRole = "system" | "user" | "assistant" | "tool";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type ToolDefinition = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type ChatRequest = {
  messages: ChatMessage[];
  model?: string;
  tools?: ToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  abortSignal?: AbortSignal;
};

export type FinishReason = "stop" | "tool_calls" | "length" | "error";

export type ChatChunk =
  | { type: "token"; text: string }
  | { type: "tool_call"; toolCall: ToolCall }
  | { type: "finish"; reason: FinishReason; error?: string };

export type ChatCompletion = {
  content: string;
  toolCalls: ToolCall[];
  finishReason: FinishReason;
};

export interface LLMClient {
  stream(req: ChatRequest): AsyncIterable<ChatChunk>;
  complete(req: ChatRequest): Promise<ChatCompletion>;
}
