// SERVER-ONLY LLM provider. Returns validated JSON of type T, or null on any problem
// (not configured, network error, bad status, unparseable, schema mismatch) so callers
// fall back to seed content. Keys are read from the server env, never sent to clients.
//
// Two backends, chosen by LLM_PROVIDER:
//   - "anthropic" (default): Anthropic Messages API with a forced tool.
//   - "openai": any OpenAI-compatible chat/completions API — covers OpenAI, DeepSeek,
//     xAI (Grok), NVIDIA NIM (Nemotron), Groq, OpenRouter, local Ollama/LM Studio.
//     JSON is requested via response_format + prompt, then zod-validated.

import type { ZodType } from "zod";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

type Provider = "anthropic" | "openai";

function provider(): Provider {
  return process.env.LLM_PROVIDER === "openai" ? "openai" : "anthropic";
}

function model(): string {
  return process.env.LLM_MODEL || "claude-sonnet-5";
}

/** True when the selected provider has the env it needs. */
export function isLlmConfigured(): boolean {
  if (provider() === "openai") {
    return Boolean(
      (process.env.LLM_API_KEY || process.env.OPENAI_API_KEY) &&
        process.env.LLM_BASE_URL,
    );
  }
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

interface StructuredCall<T> {
  system: string;
  user: string;
  toolName: string;
  toolSchema: Record<string, unknown>;
  schema: ZodType<T>;
  maxTokens?: number;
}

/** Best-effort JSON extraction: whole string, else the first {...} block. */
function parseJsonLoose(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function callAnthropic<T>(c: StructuredCall<T>): Promise<T | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: model(),
      max_tokens: c.maxTokens ?? 1024,
      system: c.system,
      tools: [
        { name: c.toolName, description: "Return the result.", input_schema: c.toolSchema },
      ],
      tool_choice: { type: "tool", name: c.toolName },
      messages: [{ role: "user", content: c.user }],
    }),
  });
  if (!res.ok) return null;
  const data: unknown = await res.json();
  const content = (data as { content?: Array<{ type: string; name?: string; input?: unknown }> })
    .content;
  const toolUse = content?.find((b) => b.type === "tool_use" && b.name === c.toolName);
  if (!toolUse?.input) return null;
  const parsed = c.schema.safeParse(toolUse.input);
  return parsed.success ? parsed.data : null;
}

async function callOpenAICompatible<T>(c: StructuredCall<T>): Promise<T | null> {
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  const base = process.env.LLM_BASE_URL;
  if (!apiKey || !base) return null;

  const url = `${base.replace(/\/$/, "")}/chat/completions`;
  const jsonInstruction =
    "\n\nReturn ONLY a valid JSON object (no markdown, no prose) matching this JSON schema:\n" +
    JSON.stringify(c.toolSchema);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model(),
      max_tokens: c.maxTokens ?? 1024,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: c.system + jsonInstruction },
        { role: "user", content: c.user },
      ],
    }),
  });
  if (!res.ok) return null;
  const data: unknown = await res.json();
  const text = (
    data as { choices?: Array<{ message?: { content?: string } }> }
  ).choices?.[0]?.message?.content;
  if (!text) return null;
  const obj = parseJsonLoose(text);
  if (obj === null) return null;
  const parsed = c.schema.safeParse(obj);
  // Dev-only: surface schema drift so seed fallbacks are not silent while iterating.
  if (!parsed.success && process.env.NODE_ENV !== "production") {
    console.error("[llm] output failed validation:", JSON.stringify(parsed.error.issues).slice(0, 300));
  }
  return parsed.success ? parsed.data : null;
}

/**
 * Calls the configured model and returns validated JSON of type T, or null on any
 * problem. Never throws.
 */
export async function callStructured<T>(call: StructuredCall<T>): Promise<T | null> {
  try {
    return provider() === "openai"
      ? await callOpenAICompatible(call)
      : await callAnthropic(call);
  } catch {
    return null;
  }
}
