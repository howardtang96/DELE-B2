// Learning-ladder progression. Code-owned.
// recognition(1) → controlled(2) → free writing(3) → timed B2 task(4).
// An item cannot skip stages; it advances only after a correct attempt at its
// current stage.

import type { Attempt, Item, LadderStage } from "./types";

const MAX_STAGE: LadderStage = 4;

/** Highest stage the learner has passed (a correct attempt) for an item. */
export function highestPassedStage(attempts: Attempt[]): LadderStage | 0 {
  const passed = attempts.filter((a) => a.correct).map((a) => a.stage);
  return passed.length ? (Math.max(...passed) as LadderStage) : 0;
}

/** The next stage the learner is allowed to work on for an item. */
export function nextAllowedStage(item: Item, attempts: Attempt[]): LadderStage {
  const passed = highestPassedStage(attempts);
  if (passed === 0) return item.ladderStage; // start at the item's entry stage
  return Math.min(MAX_STAGE, passed + 1) as LadderStage;
}

export function isLadderComplete(attempts: Attempt[]): boolean {
  return highestPassedStage(attempts) >= MAX_STAGE;
}
