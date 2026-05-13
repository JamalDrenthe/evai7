import type {
  ChatChunk,
  ChatRequest,
  ChatMessage,
  LLMClient,
  ToolCall,
} from "../../contracts/llm";
import { env } from "../lib/env";

type LLMProvider = "openai" | "ollama" | "mock";

function getProvider(): LLMProvider {
  const p = (process.env.LLM_PROVIDER || "mock").toLowerCase();
  if (p === "openai" || p === "ollama") return p;
  return "mock";
}

function getBaseUrl(provider: LLMProvider): string {
  if (provider === "ollama") {
    return process.env.OLLAMA_HOST || "http://localhost:11434/v1";
  }
  return process.env.LLM_BASE_URL || "https://api.openai.com/v1";
}

function getModel(provider: LLMProvider): string {
  if (provider === "ollama") {
    return process.env.LLM_MODEL || "llama3.2";
  }
  return process.env.LLM_MODEL || "gpt-4o-mini";
}

function getApiKey(): string {
  return process.env.LLM_API_KEY || "ollama";
}

class OpenAICompatibleClient implements LLMClient {
  private provider: LLMProvider;
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.provider = getProvider();
    this.baseUrl = getBaseUrl(this.provider);
    this.apiKey = getApiKey();
    this.model = getModel(this.provider);
  }

  async *stream(req: ChatRequest): AsyncIterable<ChatChunk> {
    const body = this.buildBody(req, true);
    const resp = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: req.abortSignal,
    });

    if (!resp.ok || !resp.body) {
      const text = await resp.text().catch(() => "");
      yield { type: "finish", reason: "error", error: `LLM error ${resp.status}: ${text.slice(0, 200)}` };
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const partialToolCalls = new Map<number, { id?: string; name?: string; args: string }>();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta;
            if (!delta) continue;

            if (typeof delta.content === "string" && delta.content.length > 0) {
              yield { type: "token", text: delta.content };
            }

            if (Array.isArray(delta.tool_calls)) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;
                const existing = partialToolCalls.get(idx) ?? { args: "" };
                if (tc.id) existing.id = tc.id;
                if (tc.function?.name) existing.name = tc.function.name;
                if (tc.function?.arguments) existing.args += tc.function.arguments;
                partialToolCalls.set(idx, existing);
              }
            }

            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason) {
              for (const partial of partialToolCalls.values()) {
                if (partial.id && partial.name) {
                  yield {
                    type: "tool_call",
                    toolCall: {
                      id: partial.id,
                      type: "function",
                      function: { name: partial.name, arguments: partial.args },
                    },
                  };
                }
              }
              yield { type: "finish", reason: finishReason };
            }
          } catch {
            // ignore malformed chunk
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async complete(req: ChatRequest): Promise<{
    content: string;
    toolCalls: ToolCall[];
    finishReason: "stop" | "tool_calls" | "length" | "error";
  }> {
    let content = "";
    const toolCalls: ToolCall[] = [];
    let finishReason: "stop" | "tool_calls" | "length" | "error" = "stop";
    for await (const chunk of this.stream(req)) {
      if (chunk.type === "token") content += chunk.text;
      else if (chunk.type === "tool_call") toolCalls.push(chunk.toolCall);
      else if (chunk.type === "finish") finishReason = chunk.reason;
    }
    return { content, toolCalls, finishReason };
  }

  private buildBody(req: ChatRequest, stream: boolean) {
    const body: Record<string, unknown> = {
      model: req.model || this.model,
      messages: req.messages.map(this.serializeMessage),
      stream,
      temperature: req.temperature ?? 0.3,
    };
    if (req.maxTokens) body.max_tokens = req.maxTokens;
    if (req.tools && req.tools.length > 0) {
      body.tools = req.tools;
      body.tool_choice = "auto";
    }
    return body;
  }

  private serializeMessage(msg: ChatMessage) {
    const out: Record<string, unknown> = { role: msg.role, content: msg.content };
    if (msg.name) out.name = msg.name;
    if (msg.tool_call_id) out.tool_call_id = msg.tool_call_id;
    if (msg.tool_calls) out.tool_calls = msg.tool_calls;
    return out;
  }
}

class MockLLMClient implements LLMClient {
  async *stream(req: ChatRequest): AsyncIterable<ChatChunk> {
    const lastUser = [...req.messages].reverse().find((m) => m.role === "user");
    const text = lastUser?.content ?? "";

    if (req.tools && req.tools.length > 0) {
      const calc = req.tools.find((t) =>
        t.function.name.toLowerCase().includes("zzp") ||
        t.function.name.toLowerCase().includes("netto") ||
        text.toLowerCase().includes("zzp") ||
        text.toLowerCase().includes("netto") ||
        text.toLowerCase().includes("bereken"),
      );
      if (calc) {
        yield {
          type: "tool_call",
          toolCall: {
            id: `call_${Date.now()}`,
            type: "function",
            function: {
              name: calc.function.name,
              arguments: JSON.stringify({
                revenue: 100000,
                costs: 15000,
                revenueVatRate: 21,
                costsVatRate: 21,
                revenueType: "ex",
                costsType: "ex",
                isStarter: false,
                meetsHourCriterion: true,
                mode: "year",
              }),
            },
          },
        };
        yield { type: "finish", reason: "tool_calls" };
        return;
      }
    }

    const reply = `[Mock LLM — geen LLM_API_KEY ingesteld]\n\nIk heb je vraag ontvangen: "${text}".\n\nStel \`LLM_PROVIDER\` en \`LLM_API_KEY\` in via .env om met een echt model te werken (OpenAI, Groq, Together, OpenRouter of Ollama).`;
    for (const word of reply.split(/(\s+)/)) {
      yield { type: "token", text: word };
      await new Promise((r) => setTimeout(r, 8));
    }
    yield { type: "finish", reason: "stop" };
  }

  async complete(req: ChatRequest) {
    let content = "";
    const toolCalls: ToolCall[] = [];
    let finishReason: "stop" | "tool_calls" | "length" | "error" = "stop";
    for await (const chunk of this.stream(req)) {
      if (chunk.type === "token") content += chunk.text;
      else if (chunk.type === "tool_call") toolCalls.push(chunk.toolCall);
      else if (chunk.type === "finish") finishReason = chunk.reason;
    }
    return { content, toolCalls, finishReason };
  }
}

let _client: LLMClient | null = null;

export function getLLMClient(): LLMClient {
  if (!_client) {
    const provider = getProvider();
    if (provider === "mock") {
      console.warn("[llm] Using mock LLM. Set LLM_PROVIDER and LLM_API_KEY for real model.");
      _client = new MockLLMClient();
    } else {
      _client = new OpenAICompatibleClient();
    }
  }
  return _client;
}

void env; // ensure env loaded
