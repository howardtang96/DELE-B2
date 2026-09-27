import { NextResponse } from "next/server";
import { z } from "zod";
import { ITEM_BY_ID } from "@/data/items";
import { WRITING_SEED_FEEDBACK } from "@/data/seed-writing";
import type { WritingPrompt } from "@/lib/types";
import { capFeedback, checkWritingObjectives } from "@/lib/scoring";
import { callStructured } from "@/lib/llm/provider";
import { buildFeedbackPrompt } from "@/lib/llm/prompts";
import { feedbackResultSchema, feedbackToolSchema } from "@/lib/llm/schemas";

const bodySchema = z.object({
  itemId: z.string().min(1),
  text: z.string().max(5000),
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
  const check = checkWritingObjectives(text, prompt);
  const seed = capFeedback(WRITING_SEED_FEEDBACK[itemId] ?? []);

  // Personalise via the LLM; null on any failure → seed. Cap enforced regardless.
  const focusTags = Array.from(new Set([...item.tags, ...errorTags]));
  const { system, user } = buildFeedbackPrompt(prompt, text, check, focusTags);
  const result = await callStructured({
    system,
    user,
    toolName: "return_feedback",
    toolSchema: feedbackToolSchema,
    schema: feedbackResultSchema,
  });

  if (!result) {
    return NextResponse.json({ source: "seed", points: seed });
  }
  return NextResponse.json({ source: "llm", points: capFeedback(result.points) });
}
