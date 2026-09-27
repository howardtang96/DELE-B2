// SERVER-ONLY LLM provider. Calls the Anthropic Messages API with a forced tool so
// the model must return JSON matching our schema. Guarded by ANTHROPIC_API_KEY:
// unconfigured or any failure → returns null, and callers fall back to seed content.
//
// The key is read from the server environment and never sent to the client.

import type { ZodType } from "zod";

const API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export function isLlmConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function model(): string {
  return process.env.LLM_MODEL || "claude-sonnet-5";
}

interface StructuredCall<T> {
  system: string;
  user: string;
  toolName: string;
  toolSchema: Record<string, unknown>;
  schema: ZodType<T>;
  maxTokens?: number;
}

/**
 * Calls the model and returns validated JSON of type T, or null on any problem
 * (not configured, network error, bad status, no tool_use, schema mismatch).
 */
export async function callStructured<T>({
  system,
  user,
  toolName,
  toolSchema,
  schema,
  maxTokens = 1024,
}: StructuredCall<T>): Promise<T | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: model(),
        max_tokens: maxTokens,
        system,
        tools: [
          { name: toolName, description: "Return the result.", input_schema: toolSchema },
        ],
        tool_choice: { type: "tool", name: toolName },
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!res.ok) return null;
    const data: unknown = await res.json();

    const content = (data as { content?: Array<{ type: string; name?: string; input?: unknown }> })
      .content;
    const toolUse = content?.find((b) => b.type === "tool_use" && b.name === toolName);
    if (!toolUse?.input) return null;

    const parsed = schema.safeParse(toolUse.input);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
