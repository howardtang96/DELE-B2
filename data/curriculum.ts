// Fixed B2 curriculum — the syllabus source of truth. Code-owned.
// The LLM may NOT add, remove, or reorder these. See docs/learning-engine-spec.md.

import type { Skill } from "@/lib/types";

export const SKILLS: Skill[] = [
  // Grammar accuracy (top weakness)
  {
    id: "grammar.subjunctive",
    component: "grammar",
    labelEn: "Subjunctive triggers",
    labelZh: "虛擬式觸發詞",
  },
  {
    id: "grammar.ser-estar",
    component: "grammar",
    labelEn: "Ser vs Estar",
    labelZh: "Ser 同 Estar",
  },
  {
    id: "grammar.past-tenses",
    component: "grammar",
    labelEn: "Indefinido vs Imperfecto",
    labelZh: "過去式對比",
  },
  {
    id: "grammar.connectors",
    component: "grammar",
    labelEn: "Discourse connectors",
    labelZh: "連接詞 / 論述銜接",
  },
  // Reading strategy
  {
    id: "reading.scan",
    component: "reading",
    labelEn: "Scan & locate",
    labelZh: "掃描定位",
  },
  {
    id: "reading.inference",
    component: "reading",
    labelEn: "Inference",
    labelZh: "推斷題",
  },
  // Listening strategy (reserved mode, curriculum ready)
  {
    id: "listening.gist",
    component: "listening",
    labelEn: "Gist & detail",
    labelZh: "大意同細節",
  },
  // Writing
  {
    id: "writing.formal-email",
    component: "writing",
    labelEn: "Formal email",
    labelZh: "正式電郵",
  },
  {
    id: "writing.argument",
    component: "writing",
    labelEn: "Structured argument",
    labelZh: "議論結構",
  },
];

export const SKILL_BY_ID: Record<string, Skill> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
);

export const COMPONENT_LABELS: Record<
  string,
  { en: string; zh: string }
> = {
  reading: { en: "Reading", zh: "閱讀" },
  listening: { en: "Listening", zh: "聆聽" },
  writing: { en: "Writing", zh: "寫作" },
  grammar: { en: "Grammar", zh: "語法" },
};
