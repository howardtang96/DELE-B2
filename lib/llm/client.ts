"use client";

// Thin client helpers that call the server LLM routes. The routes themselves fall
// back to seed content, so a successful response is always usable. A network failure
// returns null and the caller keeps its own local seed.

import type { ClozePrompt, FeedbackPoint, McPrompt, ReadingPrompt } from "@/lib/types";

export interface FeedbackResponse {
  source: "seed" | "llm";
  points: FeedbackPoint[];
}

export interface ExplainResponse {
  source: "seed" | "llm";
  whyZh: string;
}

export interface CorrectResponse {
  source: "seed" | "llm";
  correctedEs: string;
  summaryZh: string;
}

export async function fetchWritingFeedback(
  itemId: string,
  text: string,
  errorTags: string[] = [],
): Promise<FeedbackResponse | null> {
  try {
    const res = await fetch("/api/llm/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId, text, errorTags }),
    });
    if (!res.ok) return null;
    return (await res.json()) as FeedbackResponse;
  } catch {
    return null;
  }
}

export type VariantResponse =
  | { source: "seed" | "llm"; type: "mc"; prompt: McPrompt }
  | { source: "seed" | "llm"; type: "cloze"; prompt: ClozePrompt };

/** Fetch a fresh AI variant of a grammar item (same topic, new sentence). */
export async function fetchVariant(itemId: string): Promise<VariantResponse | null> {
  try {
    const res = await fetch("/api/llm/variant", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (!res.ok) return null;
    return (await res.json()) as VariantResponse;
  } catch {
    return null;
  }
}

export interface ReadingResponse {
  source: "seed" | "llm";
  theme: string | null;
  prompt: ReadingPrompt;
}

/** Fetch a fresh AI-generated reading passage (theme optional). Seed fallback. */
export async function fetchReadingPassage(theme?: string): Promise<ReadingResponse | null> {
  try {
    const res = await fetch("/api/llm/reading", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(theme ? { theme } : {}),
    });
    if (!res.ok) return null;
    return (await res.json()) as ReadingResponse;
  } catch {
    return null;
  }
}

export async function fetchCorrection(
  itemId: string,
  text: string,
  errorTags: string[] = [],
): Promise<CorrectResponse | null> {
  try {
    const res = await fetch("/api/llm/correct", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId, text, errorTags }),
    });
    if (!res.ok) return null;
    return (await res.json()) as CorrectResponse;
  } catch {
    return null;
  }
}

export async function fetchExplain(
  itemId: string,
  chosenIndex: number,
  errorTags: string[] = [],
): Promise<ExplainResponse | null> {
  try {
    const res = await fetch("/api/llm/explain", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ itemId, chosenIndex, errorTags }),
    });
    if (!res.ok) return null;
    return (await res.json()) as ExplainResponse;
  } catch {
    return null;
  }
}
