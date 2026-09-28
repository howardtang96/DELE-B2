import { NextResponse } from "next/server";
import { z } from "zod";
import { READING_ITEMS } from "@/data/seed-reading";
import type { ReadingPrompt } from "@/lib/types";
import { callStructured } from "@/lib/llm/provider";
import { buildReadingPrompt, READING_THEMES } from "@/lib/llm/prompts";
import { readingResultSchema, readingToolSchema } from "@/lib/llm/schemas";

const bodySchema = z.object({ theme: z.string().max(60).optional() });

// Code owns the time limit, not the model.
const TIME_LIMIT_SEC = 180;

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json ?? {});
  const theme =
    parsed.success && parsed.data.theme
      ? parsed.data.theme
      : READING_THEMES[Math.floor(Math.random() * READING_THEMES.length)];

  const seed = READING_ITEMS[0].prompt as ReadingPrompt;

  const { system, user } = buildReadingPrompt(theme);
  const result = await callStructured({
    system,
    user,
    toolName: "return_reading",
    toolSchema: readingToolSchema,
    schema: readingResultSchema,
    maxTokens: 2000,
  });

  if (!result) {
    return NextResponse.json({ source: "seed", theme: null, prompt: seed });
  }

  const prompt: ReadingPrompt = { ...result, timeLimitSec: TIME_LIMIT_SEC };
  return NextResponse.json({ source: "llm", theme, prompt });
}
