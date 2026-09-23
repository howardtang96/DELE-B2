// Seed progress + readiness for Phase 0. In later phases this is derived from real
// attempts, timed tasks, and mock results — never a pass prediction.
import type { Readiness } from "@/lib/types";

export interface WeeklyStats {
  daysActive: number;
  daysTarget: number;
  minutesThisWeek: number;
  itemsMastered: number;
  reviewsDue: number;
  streakDays: number;
  // skill coverage per component, 0..100 (% of curriculum touched + drilled)
  coverage: { component: string; labelZh: string; pct: number }[];
  // recurring errors still transferring across contexts
  recurringErrors: { tag: string; labelZh: string; trend: "up" | "down" | "flat" }[];
}

export const WEEKLY_STATS: WeeklyStats = {
  daysActive: 4,
  daysTarget: 6,
  minutesThisWeek: 58,
  itemsMastered: 3,
  reviewsDue: 2,
  streakDays: 4,
  coverage: [
    { component: "reading", labelZh: "閱讀", pct: 55 },
    { component: "listening", labelZh: "聆聽", pct: 20 },
    { component: "writing", labelZh: "寫作", pct: 40 },
    { component: "grammar", labelZh: "語法", pct: 62 },
  ],
  recurringErrors: [
    { tag: "subjunctive", labelZh: "虛擬式（para que / querer que）", trend: "down" },
    { tag: "ser-estar", labelZh: "Ser vs Estar", trend: "flat" },
    { tag: "accents", labelZh: "重音符號", trend: "up" },
  ],
};

// Readiness index per non-oral component (0..100) with evidence. NOT a pass claim.
export const READINESS: Readiness[] = [
  {
    component: "reading",
    index: 58,
    evidence: [
      "限時閱讀準確度：8/12（近 3 次）",
      "掃描定位技巧覆蓋 55%",
      "推斷題仍偏弱",
    ],
  },
  {
    component: "listening",
    index: 41,
    evidence: ["聆聽模組未開始（Phase 1 加入）", "覆蓋率 20%"],
  },
  {
    component: "writing",
    index: 49,
    evidence: [
      "正式電郵結構已掌握基本框架",
      "虛擬式錯誤下降緊",
      "議論層次仍需加強",
    ],
  },
];
