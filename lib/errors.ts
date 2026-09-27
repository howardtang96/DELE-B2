// Recurring-error analysis. Code-owned. Turns the learner's attempt history into a
// ranked list of error tags, used to (a) prioritise review and (b) tell the LLM what
// to target — the "針對性" personalisation, still bounded by code.

import type { Attempt } from "./types";

/** Count error tags from incorrect attempts, most frequent first. */
export function errorTagCounts(attempts: Attempt[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const a of attempts) {
    if (a.correct) continue;
    for (const tag of a.errorTags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/** Top N recurring error tags (for prompting the LLM). */
export function topErrorTags(attempts: Attempt[], n = 5): string[] {
  return errorTagCounts(attempts)
    .slice(0, n)
    .map((e) => e.tag);
}
