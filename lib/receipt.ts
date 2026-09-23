// Builds the 6-block Learning Receipt. Code-owned structure; the copy is seed now
// and becomes LLM-personalised (validated) in Phase 2. The 6 blocks + order are
// fixed by product rule.

import { SKILL_BY_ID } from "@/data/curriculum";
import type {
  Item,
  McPrompt,
  Receipt,
  ReviewState,
  SessionMode,
  WrongPoint,
} from "./types";
import { daysUntil } from "./scheduler";

export interface OutcomeLine {
  item: Item;
  correct: boolean;
  yourAnswer: string;
  correctAnswer: string;
}

const MODE_COPY: Record<SessionMode, { why: string; realLife: string; dele: string }> = {
  quick: {
    why: "語法準確度係 B2 寫作同閱讀嘅底層能力，錯一個觸發詞成句意思就會變。",
    realLife: "日常傾偈、寫訊息，用啱虛擬式／時態會令你聽落更自然、更有禮貌。",
    dele: "DELE B2 閱讀 Tarea 會考語法完形；寫作亦會睇準確度同連貫性。",
  },
  reading: {
    why: "限時之下用掃描同推斷策略，可以喺唔識晒生字嘅情況下都答啱題。",
    realLife: "睇新聞、合約、電郵時，快速定位重點係好實用嘅技能。",
    dele: "DELE B2 Comprensión de lectura 有時間壓力，策略比逐字讀更重要。",
  },
  writing: {
    why: "正式寫作要求語域（register）、結構同連接詞，唔可以口語化。",
    realLife: "投訴、申請、正式電郵，喺香港職場用西班牙語都用得著。",
    dele: "DELE B2 Expresión escrita Tarea 1 就係正式書信，字數同格式都計分。",
  },
  listening: {
    why: "聆聽策略幫你捉住大意同關鍵細節。",
    realLife: "聽廣播、對話、指示都用得著。",
    dele: "DELE B2 Comprensión auditiva 需要邊聽邊定位答案。",
  },
  sprint: {
    why: "口語流利同準確度需要持續練習。",
    realLife: "日常對話、講故仔。",
    dele: "口試部分（此 app 主力非口語，口語作輔助）。",
  },
};

export function buildReceipt(
  sessionId: string,
  mode: SessionMode,
  outcomes: OutcomeLine[],
  reviewStates: Record<string, ReviewState>,
): Receipt {
  const learned = Array.from(
    new Set(
      outcomes.map((o) => {
        const skill = SKILL_BY_ID[o.item.skillId];
        return skill ? `${skill.labelZh} (${skill.labelEn})` : o.item.skillId;
      }),
    ),
  );

  const wrong: WrongPoint[] = outcomes
    .filter((o) => !o.correct)
    .map((o) => ({
      itemId: o.item.id,
      labelZh: SKILL_BY_ID[o.item.skillId]?.labelZh ?? o.item.skillId,
      yourAnswer: o.yourAnswer,
      correctAnswer: o.correctAnswer,
    }));

  const nextReview = outcomes
    .map((o) => reviewStates[o.item.id])
    .filter((rs): rs is ReviewState => Boolean(rs))
    .map((rs) => ({
      itemId: rs.itemId,
      dueAt: rs.nextReviewAt,
      intervalDays: Math.max(1, daysUntil(rs.nextReviewAt)),
    }));

  const copy = MODE_COPY[mode];

  return {
    sessionId,
    learned,
    wrong,
    whyItMatters: copy.why,
    realLifeUse: copy.realLife,
    deleUse: copy.dele,
    nextReview,
    source: "seed",
  };
}

/** Convenience: readable answer text for an MC option index. */
export function mcAnswerText(prompt: McPrompt, index: number): string {
  return prompt.options[index] ?? "—";
}
