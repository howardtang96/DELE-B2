// Picks the single next-best task for Today, from real state. Priority:
//   1) due grammar reviews, 2) a backlog of due vocab, 3) the weakest component
//   (to build breadth across all four), 4) Grammar Drill for a brand-new learner.

import { dueItems } from "./scheduler";
import { computeProgress } from "./progress";
import type { Attempt, ReviewState, Session } from "./types";

export interface NextTask {
  tagZh: string;
  title: string;
  desc: string;
  href: string;
}

const COMPONENT_TASK: Record<string, NextTask> = {
  grammar: {
    tagZh: "文法",
    title: "Grammar Drill · 一組 6 題",
    desc: "認得 → 自己打西班牙文,AI 無限生成新題。約 5 分鐘。",
    href: "/grammar",
  },
  reading: {
    tagZh: "閱讀",
    title: "Reading Challenge",
    desc: "每日新原創 B2 短文 + 生字 + 點解。",
    href: "/reading",
  },
  listening: {
    tagZh: "聆聽",
    title: "Listening",
    desc: "AI 新聆聽內容,限時,只聽兩次。",
    href: "/listening",
  },
  writing: {
    tagZh: "寫作",
    title: "Writing Focus",
    desc: "正式書信 / 議論文 + AI 批改 + 全文改正。",
    href: "/writing",
  },
};

export function pickNextTask(
  attempts: Attempt[],
  reviewStates: Record<string, ReviewState>,
  sessions: Session[],
  vocabReview: Record<string, ReviewState>,
  now: Date = new Date(),
): NextTask {
  const due = dueItems(Object.values(reviewStates), now).length;
  if (due > 0) {
    return {
      tagZh: "複習",
      title: `文法複習 · ${due} 項到期`,
      desc: "趁記憶未散,先鞏固到期嘅題(間隔複習)。",
      href: "/grammar",
    };
  }

  const vocabDue = dueItems(Object.values(vocabReview), now).length;
  if (vocabDue >= 5) {
    return {
      tagZh: "生字",
      title: `Vocab 複習 · ${vocabDue} 個`,
      desc: "閱讀生字到期,閃卡快速過一遍。",
      href: "/vocab",
    };
  }

  const stats = computeProgress(attempts, reviewStates, sessions, vocabReview, now);
  if (!stats.hasData) return COMPONENT_TASK.grammar;

  // Weakest coverage first; tie-break toward the components usually left behind.
  const order = ["listening", "writing", "reading", "grammar"];
  let best = order[0];
  let bestPct = Infinity;
  for (const c of order) {
    const pct = stats.coverage.find((x) => x.component === c)?.pct ?? 0;
    if (pct < bestPct) {
      bestPct = pct;
      best = c;
    }
  }
  return COMPONENT_TASK[best] ?? COMPONENT_TASK.grammar;
}
