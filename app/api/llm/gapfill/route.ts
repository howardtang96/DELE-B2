import { NextResponse } from "next/server";
import { z } from "zod";
import { GAPFILL_ITEMS } from "@/data/seed-gapfill";
import type { GapfillPrompt } from "@/lib/types";
import { callStructured } from "@/lib/llm/provider";
import { buildGapfillPrompt, READING_THEMES } from "@/lib/llm/prompts";
import { gapfillResultSchema, gapfillToolSchema } from "@/lib/llm/schemas";

const bodySchema = z.object({ theme: z.string().max(60).optional() });
const TIME_LIMIT_SEC = 240;

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json ?? {});
  const theme =
    parsed.success && parsed.data.theme
      ? parsed.data.theme
      : READING_THEMES[Math.floor(Math.random() * READING_THEMES.length)];

  const seed = GAPFILL_ITEMS[0].prompt as GapfillPrompt;

  const { system, user } = buildGapfillPrompt(theme);
  const result = await callStructured({
    system,
    user,
    toolName: "return_gapfill",
    toolSchema: gapfillToolSchema,
    schema: gapfillResultSchema,
    maxTokens: 2000,
  });

  if (!result) {
    return NextResponse.json({ source: "seed", theme: null, prompt: seed });
  }
  const prompt: GapfillPrompt = { ...result, timeLimitSec: TIME_LIMIT_SEC };
  return NextResponse.json({ source: "llm", theme, prompt });
}
