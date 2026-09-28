// Picks the items for a practice session. Code-owned ordering:
//   1) due reviews first (soonest due),
//   2) then new items (never attempted), lowest ladder stage first,
//   3) then, if still short, seen-but-not-due items by soonest next review.
// Keeps the learner moving up the ladder while honouring spaced review.

import type { Item, ReviewState } from "./types";
import { dueItems } from "./scheduler";

export function buildSession(params: {
  pool: Item[];
  reviewStates: Record<string, ReviewState>;
  count: number;
  now?: Date;
  /** Interleave ladder stages in the fresh set so a session mixes recognition +
   *  production, instead of all stage-1 first. */
  interleaveStages?: boolean;
}): Item[] {
  const { pool, reviewStates, count, now = new Date(), interleaveStages = false } = params;
  const byId = new Map(pool.map((i) => [i.id, i]));

  const dueIds = dueItems(Object.values(reviewStates), now)
    .map((r) => r.itemId)
    .filter((id) => byId.has(id));

  const seen = new Set(Object.keys(reviewStates));

  const freshItems = pool
    .filter((i) => !seen.has(i.id))
    .sort((a, b) => a.ladderStage - b.ladderStage || a.difficulty - b.difficulty);

  let fresh: string[];
  if (interleaveStages) {
    // Round-robin across ladder stages: stage1, stage2, stage1, stage2, …
    const byStage = new Map<number, Item[]>();
    for (const i of freshItems) {
      const arr = byStage.get(i.ladderStage) ?? [];
      arr.push(i);
      byStage.set(i.ladderStage, arr);
    }
    const stages = [...byStage.keys()].sort((a, b) => a - b);
    const interleaved: string[] = [];
    let added = true;
    while (added) {
      added = false;
      for (const s of stages) {
        const arr = byStage.get(s)!;
        const next = arr.shift();
        if (next) {
          interleaved.push(next.id);
          added = true;
        }
      }
    }
    fresh = interleaved;
  } else {
    fresh = freshItems.map((i) => i.id);
  }

  const seenNotDue = pool
    .filter((i) => seen.has(i.id) && !dueIds.includes(i.id))
    .sort((a, b) => {
      const ta = new Date(reviewStates[a.id]?.nextReviewAt ?? 0).getTime();
      const tb = new Date(reviewStates[b.id]?.nextReviewAt ?? 0).getTime();
      return ta - tb;
    })
    .map((i) => i.id);

  const ordered: string[] = [];
  for (const id of [...dueIds, ...fresh, ...seenNotDue]) {
    if (ordered.length >= count) break;
    if (!ordered.includes(id)) ordered.push(id);
  }

  return ordered.map((id) => byId.get(id)!).filter(Boolean);
}
