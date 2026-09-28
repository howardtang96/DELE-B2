// Mastery rule. Code-owned. The LLM can never set mastery.
//
// Rule: an item is mastered only after CORRECT use in THREE DIFFERENT CONTEXTS.
// A "context" is a distinct study session (see lib/store — every attempt in a
// session carries that session's id as its context). Because spaced review pushes
// an item's next appearance 1/3/7/… days out, three distinct correct contexts means
// the learner got it right on three separate, spaced occasions — real retention,
// not the same sitting three times.
//
// Production (not just recognition) is guaranteed at the CURRICULUM level: every
// grammar point ships both a recognition (mc, stage 1) item and a controlled-
// production (cloze, stage 2) item, and the session builder surfaces both.

import type { Attempt } from "./types";

export const MASTERY_CONTEXTS_REQUIRED = 3;

interface MasteryEval {
  count: number; // distinct correct contexts (0..3, capped for display)
  stagesCovered: number;
  mastered: boolean;
}

export function evaluateMastery(attempts: Attempt[]): MasteryEval {
  const correct = attempts.filter((a) => a.correct);

  const distinctContexts = new Set(correct.map((a) => a.context));
  const distinctStages = new Set(correct.map((a) => a.stage));

  const count = distinctContexts.size;
  const mastered = count >= MASTERY_CONTEXTS_REQUIRED;

  return {
    count: Math.min(count, MASTERY_CONTEXTS_REQUIRED),
    stagesCovered: distinctStages.size,
    mastered,
  };
}

export function isMastered(attempts: Attempt[]): boolean {
  return evaluateMastery(attempts).mastered;
}

/** 0..3 progress toward the 3-context threshold, for UI. */
export function masteryProgress(attempts: Attempt[]): number {
  return evaluateMastery(attempts).count;
}
