// Aggregated seed items + lookup. Fixed curriculum content.
import type { Item } from "@/lib/types";
import { MC_ITEMS } from "./seed-mc";
import { READING_ITEMS } from "./seed-reading";
import { WRITING_ITEMS } from "./seed-writing";

export const ALL_ITEMS: Item[] = [
  ...MC_ITEMS,
  ...READING_ITEMS,
  ...WRITING_ITEMS,
];

export const ITEM_BY_ID: Record<string, Item> = Object.fromEntries(
  ALL_ITEMS.map((i) => [i.id, i]),
);

export function itemsByType(type: Item["type"]): Item[] {
  return ALL_ITEMS.filter((i) => i.type === type);
}
