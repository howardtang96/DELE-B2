// LLM boundary — Phase 2 plug-in point. "相應學習要求" contract.
//
// In Phase 0 these are STUBS that return seed/template content. When a real AI API
// is added (Phase 2), only the bodies here change: the app calls these functions,
// and every returned value is validated against a schema before use. The LLM must
// NEVER choose the syllabus, score, set mastery, or schedule review — those stay in
// scheduler.ts / mastery.ts / scoring.ts / progression.ts.

import { capFeedback, MAX_WRITING_FEEDBACK_POINTS } from "@/lib/scoring";
import type {
  FeedbackPoint,
  Item,
  McPrompt,
  WritingFeedback,
  WritingPrompt,
} from "@/lib/types";

/** What the model is told about the learner, so it can personalise. */
export interface LearnerContext {
  recurringErrorTags: string[];
  targetStageZh: string;
}

/** Role: explain WHY an answer was wrong (concise Cantonese). */
export function explainWrong(
  item: Item,
  chosenIndex: number,
  _ctx: LearnerContext,
): string {
  // Phase 0: return the seed explanation carried on the item.
  if (item.type === "mc") return (item.prompt as McPrompt).whyZh;
  return "呢題嘅重點係語法準確度，之後會有針對練習。";
}

/**
 * Role: qualitative writing feedback. ALWAYS capped at 3 points by code,
 * regardless of what a future model returns.
 */
export function writingFeedback(
  _text: string,
  _prompt: WritingPrompt,
  seedPoints: FeedbackPoint[],
): WritingFeedback {
  return {
    points: capFeedback(seedPoints).slice(0, MAX_WRITING_FEEDBACK_POINTS),
    source: "seed",
  };
}

// Phase 2 will add: validateStructuredOutput(), correct(), variant(), plus a
// client that enforces JSON schema + safe fallback to seed content on any failure.
