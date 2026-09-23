// Mastery rule. Code-owned. The LLM can never set mastery.
//
// Rule: an item is mastered only after CORRECT use in THREE DIFFERENT CONTEXTS,
// and those correct contexts must span at least TWO different ladder stages
// (so a mastered item has been produced, not only recognised).

import type { Attempt } from "./types";

export const MASTERY_CONTEXTS_REQUIRED = 3;
export const MASTERY_MIN_STAGES = 2;

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
  const stagesCovered = distinctStages.size;

  const mastered =
    count >= MASTERY_CONTEXTS_REQUIRED && stagesCovered >= MASTERY_MIN_STAGES;

  return {
    count: Math.min(count, MASTERY_CONTEXTS_REQUIRED),
    stagesCovered,
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
