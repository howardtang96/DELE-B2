// Aggregated seed items + lookup. Fixed curriculum content.
import type { Item } from "@/lib/types";
import { SKILL_BY_ID } from "./curriculum";
import { MC_ITEMS } from "./seed-mc";
import { CLOZE_ITEMS } from "./seed-cloze";
import { READING_ITEMS } from "./seed-reading";
import { WRITING_ITEMS } from "./seed-writing";
import { LISTENING_ITEMS } from "./seed-listening";
import { GAPFILL_ITEMS } from "./seed-gapfill";

export const ALL_ITEMS: Item[] = [
  ...MC_ITEMS,
  ...CLOZE_ITEMS,
  ...READING_ITEMS,
  ...WRITING_ITEMS,
  ...LISTENING_ITEMS,
  ...GAPFILL_ITEMS,
];

export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(
  ALL_ITEMS.map((i) => [i.id, i]),
);

export function itemsByType(type: Item["type"]): Item[] {
  return ALL_ITEMS.filter((i) => i.type === type);
}

/** Grammar practice pool. `cloze: false` keeps it recognition-only (for Quick). */
export function grammarItems(opts?: { cloze?: boolean }): Item[] {
  const includeCloze = opts?.cloze ?? true;
  return ALL_ITEMS.filter((i) => {
    const skill = SKILL_BY_ID[i.skillId];
    if (!skill || skill.component !== "grammar") return false;
    return i.type === "mc" || (includeCloze && i.type === "cloze");
  });
}
