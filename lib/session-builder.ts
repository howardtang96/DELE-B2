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
}): Item[] {
  const { pool, reviewStates, count, now = new Date() } = params;
  const byId = new Map(pool.map((i) => [i.id, i]));

  const dueIds = dueItems(Object.values(reviewStates), now)
    .map((r) => r.itemId)
    .filter((id) => byId.has(id));

  const seen = new Set(Object.keys(reviewStates));

  const fresh = pool
    .filter((i) => !seen.has(i.id))
    .sort((a, b) => a.ladderStage - b.ladderStage || a.difficulty - b.difficulty)
    .map((i) => i.id);

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
