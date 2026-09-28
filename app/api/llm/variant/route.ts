import { NextResponse } from "next/server";
import { z } from "zod";
import { ITEM_BY_ID } from "@/data/items";
import { SKILL_BY_ID } from "@/data/curriculum";
import type { ClozePrompt, Difficulty, McPrompt } from "@/lib/types";
import { callStructured } from "@/lib/llm/provider";
import { buildVariantClozePrompt, buildVariantMcPrompt } from "@/lib/llm/prompts";
import {
  variantClozeSchema,
  variantClozeToolSchema,
  variantMcSchema,
  variantMcToolSchema,
} from "@/lib/llm/schemas";

const bodySchema = z.object({ itemId: z.string().min(1) });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const item = ITEM_BY_ID[parsed.data.itemId];
  if (!item || (item.type !== "mc" && item.type !== "cloze")) {
    return NextResponse.json({ error: "unknown grammar item" }, { status: 404 });
  }

  const skillLabel = SKILL_BY_ID[item.skillId]?.labelEn ?? item.skillId;
  const difficulty = item.difficulty as Difficulty;

  if (item.type === "mc") {
    const example = item.prompt as McPrompt;
    const { system, user } = buildVariantMcPrompt(skillLabel, example, difficulty);
    const result = await callStructured({
      system,
      user,
      toolName: "return_mc_item",
      toolSchema: variantMcToolSchema,
      schema: variantMcSchema,
      maxTokens: 500,
    });
    if (!result) return NextResponse.json({ source: "seed", type: "mc", prompt: example });
    return NextResponse.json({ source: "llm", type: "mc", prompt: result });
  }

  const example = item.prompt as ClozePrompt;
  const { system, user } = buildVariantClozePrompt(skillLabel, example, difficulty);
  const result = await callStructured({
    system,
    user,
    toolName: "return_cloze_item",
    toolSchema: variantClozeToolSchema,
    schema: variantClozeSchema,
    maxTokens: 500,
  });
  if (!result) return NextResponse.json({ source: "seed", type: "cloze", prompt: example });
  return NextResponse.json({ source: "llm", type: "cloze", prompt: result });
}
