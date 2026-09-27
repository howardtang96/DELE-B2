import { NextResponse } from "next/server";
import { z } from "zod";
import { ITEM_BY_ID } from "@/data/items";
import type { McPrompt } from "@/lib/types";
import { callStructured } from "@/lib/llm/provider";
import { buildExplainPrompt } from "@/lib/llm/prompts";
import { explainResultSchema, explainToolSchema } from "@/lib/llm/schemas";

const bodySchema = z.object({
  itemId: z.string().min(1),
  chosenIndex: z.number().int().min(0).max(10),
  errorTags: z.array(z.string().max(40)).max(10).optional(),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const { itemId, chosenIndex, errorTags = [] } = parsed.data;
  const item = ITEM_BY_ID[itemId];
  if (!item || item.type !== "mc") {
    return NextResponse.json({ error: "unknown mc item" }, { status: 404 });
  }

  const prompt = item.prompt as McPrompt;
  const seed = prompt.whyZh;

  // Focus tags = the item's own tags plus the learner's recurring errors.
  const focusTags = Array.from(new Set([...item.tags, ...errorTags]));
  const { system, user } = buildExplainPrompt(prompt, chosenIndex, focusTags);
  const result = await callStructured({
    system,
    user,
    toolName: "return_explanation",
    toolSchema: explainToolSchema,
    schema: explainResultSchema,
    maxTokens: 400,
  });

  if (!result) {
    return NextResponse.json({ source: "seed", whyZh: seed });
  }
  return NextResponse.json({ source: "llm", whyZh: result.whyZh });
}
