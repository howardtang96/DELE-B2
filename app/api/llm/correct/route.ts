import { NextResponse } from "next/server";
import { z } from "zod";
import { ITEM_BY_ID } from "@/data/items";
import type { WritingPrompt } from "@/lib/types";
import { callStructured } from "@/lib/llm/provider";
import { buildCorrectPrompt } from "@/lib/llm/prompts";
import { correctResultSchema, correctToolSchema } from "@/lib/llm/schemas";

const bodySchema = z.object({
  itemId: z.string().min(1),
  text: z.string().min(1).max(5000),
  errorTags: z.array(z.string().max(40)).max(10).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { itemId, text, errorTags = [] } = parsed.data;
  const item = ITEM_BY_ID[itemId];
  if (!item || item.type !== "writing") {
    return NextResponse.json({ error: "unknown writing item" }, { status: 404 });
  }

  const prompt = item.prompt as WritingPrompt;
  const focusTags = Array.from(new Set([...item.tags, ...errorTags]));
  const { system, user } = buildCorrectPrompt(prompt, text, focusTags);

  const result = await callStructured({
    system,
    user,
    toolName: "return_correction",
    toolSchema: correctToolSchema,
    schema: correctResultSchema,
    maxTokens: 1200,
  });

  if (!result) {
    // No LLM configured (or a failure): correction needs a model — say so plainly.
    return NextResponse.json({
      source: "seed",
      correctedEs: text,
      summaryZh: "設定 AI（ANTHROPIC_API_KEY）之後先會有自動改正版本。",
    });
  }
  return NextResponse.json({ source: "llm", ...result });
}
