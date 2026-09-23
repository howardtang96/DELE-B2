// Spaced-review scheduling. Code-owned. Pure functions only.
// Intervals are fixed by product rule: 1 / 3 / 7 / 14 / 30 days.

import type { ReviewState } from "./types";

export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export function intervalDays(intervalIndex: number): number {
  const i = Math.max(0, Math.min(REVIEW_INTERVALS_DAYS.length - 1, intervalIndex));
  return REVIEW_INTERVALS_DAYS[i];
}

/** Create the initial review state for a freshly seen item. */
export function initReviewState(itemId: string, now: Date = new Date()): ReviewState {
  return {
    itemId,
    intervalIndex: 0,
    nextReviewAt: new Date(now.getTime() + intervalDays(0) * DAY_MS).toISOString(),
    masteryCount: 0,
    mastered: false,
  };
}

/**
 * Advance scheduling after an attempt.
 * Correct → step up one interval (capped at 30d).
 * Incorrect → drop back to the first interval (1d). Ladder stage is untouched here.
 */
export function scheduleNext(
  state: ReviewState,
  correct: boolean,
  now: Date = new Date(),
): ReviewState {
  const nextIndex = correct
    ? Math.min(REVIEW_INTERVALS_DAYS.length - 1, state.intervalIndex + 1)
    : 0;
  return {
    ...state,
    intervalIndex: nextIndex,
    nextReviewAt: new Date(
      now.getTime() + intervalDays(nextIndex) * DAY_MS,
    ).toISOString(),
  };
}

/** Items whose next review is due at or before `now`. */
export function dueItems(states: ReviewState[], now: Date = new Date()): ReviewState[] {
  const t = now.getTime();
  return states
    .filter((s) => !s.mastered && new Date(s.nextReviewAt).getTime() <= t)
    .sort(
      (a, b) =>
        new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime(),
    );
}

/** Whole days until the next review (can be negative if overdue). */
export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.round((new Date(iso).getTime() - now.getTime()) / DAY_MS);
}
