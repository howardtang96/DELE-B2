// Real progress + readiness, computed from the learner's actual store data.
// Replaces the Phase-0 seed stats. Honest and evidence-based: no activity → zeros.

import { ITEM_BY_ID } from "@/data/items";
import { SKILLS, SKILL_BY_ID, COMPONENT_LABELS } from "@/data/curriculum";
import { dueItems } from "./scheduler";
import { errorTagCounts } from "./errors";
import type { Attempt, ReviewState, Session } from "./types";

const DAY = 86_400_000;
const dayKey = (iso: string) => iso.slice(0, 10);

export interface ComputedStats {
  daysActive: number;
  minutesThisWeek: number;
  itemsMastered: number;
  reviewsDue: number;
  streakDays: number;
  coverage: { component: string; labelZh: string; pct: number }[];
  recurringErrors: { tag: string; count: number }[];
  readiness: {
    component: "reading" | "listening" | "writing";
    index: number;
    evidence: string[];
  }[];
  hasData: boolean;
}

function componentOfItem(itemId: string): string | null {
  const it = ITEM_BY_ID[itemId];
  return it ? SKILL_BY_ID[it.skillId]?.component ?? null : null;
}

export function computeProgress(
  attempts: Attempt[],
  reviewStates: Record<string, ReviewState>,
  sessions: Session[],
  vocabReview: Record<string, ReviewState>,
  now: Date = new Date(),
): ComputedStats {
  const weekAgo = now.getTime() - 7 * DAY;

  // All activity dates (for streak) + this-week dates (for daysActive).
  const dates = new Set<string>();
  const weekDates = new Set<string>();
  for (const a of attempts) {
    const k = dayKey(a.createdAt);
    dates.add(k);
    if (new Date(a.createdAt).getTime() >= weekAgo) weekDates.add(k);
  }
  for (const s of sessions) {
    const k = dayKey(s.finishedAt);
    dates.add(k);
    if (new Date(s.finishedAt).getTime() >= weekAgo) weekDates.add(k);
  }

  // Minutes this week from session durations (ignore absurd gaps > 1h).
  let ms = 0;
  for (const s of sessions) {
    if (new Date(s.finishedAt).getTime() < weekAgo) continue;
    const d = new Date(s.finishedAt).getTime() - new Date(s.startedAt).getTime();
    if (d > 0 && d < 60 * 60_000) ms += d;
  }

  const itemsMastered =
    Object.values(reviewStates).filter((r) => r.mastered).length +
    Object.values(vocabReview).filter((r) => r.mastered).length;
  const reviewsDue =
    dueItems(Object.values(reviewStates), now).length +
    dueItems(Object.values(vocabReview), now).length;

  // Streak: consecutive active days ending today (or yesterday if today idle).
  let streakDays = 0;
  let cursor = new Date(now);
  if (!dates.has(dayKey(cursor.toISOString()))) cursor = new Date(now.getTime() - DAY);
  while (dates.has(dayKey(cursor.toISOString()))) {
    streakDays++;
    cursor = new Date(cursor.getTime() - DAY);
  }

  // Coverage: distinct skills with ≥1 attempt / total skills, per component.
  const skillsByComponent = new Map<string, Set<string>>();
  for (const s of SKILLS) {
    if (!skillsByComponent.has(s.component)) skillsByComponent.set(s.component, new Set());
    skillsByComponent.get(s.component)!.add(s.id);
  }
  const attemptedSkills = new Set<string>();
  for (const a of attempts) {
    const it = ITEM_BY_ID[a.itemId];
    if (it) attemptedSkills.add(it.skillId);
  }
  const coverage = ["reading", "listening", "writing", "grammar"].map((c) => {
    const skills = skillsByComponent.get(c) ?? new Set<string>();
    const touched = [...skills].filter((id) => attemptedSkills.has(id)).length;
    const pct = skills.size ? Math.round((100 * touched) / skills.size) : 0;
    return { component: c, labelZh: COMPONENT_LABELS[c]?.zh ?? c, pct };
  });

  const recurringErrors = errorTagCounts(attempts).slice(0, 5);

  const readiness = (["reading", "listening", "writing"] as const).map((comp) => {
    const compAttempts = attempts.filter((a) => componentOfItem(a.itemId) === comp);
    const total = compAttempts.length;
    const correct = compAttempts.filter((a) => a.correct).length;
    const acc = total ? correct / total : 0;
    const cov = (coverage.find((c) => c.component === comp)?.pct ?? 0) / 100;
    const index = total === 0 && cov === 0 ? 0 : Math.round(100 * (0.6 * acc + 0.4 * cov));
    const evidence = [
      total ? `準確度：${correct}/${total}` : "仲未開始練習",
      `技能覆蓋 ${Math.round(cov * 100)}%`,
    ];
    return { component: comp, index, evidence };
  });

  return {
    daysActive: weekDates.size,
    minutesThisWeek: Math.round(ms / 60_000),
    itemsMastered,
    reviewsDue,
    streakDays,
    coverage,
    recurringErrors,
    readiness,
    hasData: attempts.length > 0 || sessions.length > 0,
  };
}
