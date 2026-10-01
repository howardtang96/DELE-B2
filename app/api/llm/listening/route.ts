import { NextResponse } from "next/server";
import { z } from "zod";
import { LISTENING_ITEMS } from "@/data/seed-listening";
import type { ListeningPrompt } from "@/lib/types";
import { callStructured } from "@/lib/llm/provider";
import { buildListeningPrompt, LISTENING_CONTEXTS } from "@/lib/llm/prompts";
import { listeningResultSchema, listeningToolSchema } from "@/lib/llm/schemas";

const bodySchema = z.object({ context: z.string().max(80).optional() });
const MAX_PLAYS = 2;
const TIME_LIMIT_SEC = 150;

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json ?? {});
  const context =
    parsed.success && parsed.data.context
      ? parsed.data.context
      : LISTENING_CONTEXTS[Math.floor(Math.random() * LISTENING_CONTEXTS.length)];

  const seed = LISTENING_ITEMS[0].prompt as ListeningPrompt;

  const { system, user } = buildListeningPrompt(context);
  const result = await callStructured({
    system,
    user,
    toolName: "return_listening",
    toolSchema: listeningToolSchema,
    schema: listeningResultSchema,
    maxTokens: 2000,
  });

  if (!result) {
    return NextResponse.json({ source: "seed", prompt: seed });
  }

  const prompt: ListeningPrompt = {
    titleEs: result.titleEs,
    instructionZh: "聽一段語音,然後答問題。只可以聽兩次。",
    scriptEs: result.scriptEs,
    maxPlays: MAX_PLAYS,
    glosses: result.glosses,
    questions: result.questions,
    strategyZh: result.strategyZh,
    timeLimitSec: TIME_LIMIT_SEC,
  };
  return NextResponse.json({ source: "llm", prompt });
}
