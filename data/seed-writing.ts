// Seed writing item (free writing stage) + seed feedback used until the LLM is
// plugged in (Phase 2). Fixed curriculum content.
import type { FeedbackPoint, Item } from "@/lib/types";

export const WRITING_ITEMS: Item[] = [
  {
    id: "write-1",
    skillId: "writing.formal-email",
    type: "writing",
    ladderStage: 3,
    difficulty: 2,
    tags: ["formal-email", "register", "connectors"],
    prompt: {
      taskEn: "Formal email — complaint & request",
      taskZh: "正式電郵：投訴 + 提出要求",
      scenarioEs:
        "Compraste un curso de español en línea, pero llevas dos semanas sin poder " +
        "acceder a las clases. Escribe un correo formal a la academia: explica el " +
        "problema, expresa tu malestar y pide una solución.",
      minWords: 120,
      maxWords: 150,
      requiredElements: [
        { key: "estimad", labelZh: "正式稱呼（Estimados/Estimada…）" },
        { key: "atentamente", labelZh: "正式結尾（Atentamente / Un saludo）" },
      ],
    },
  },
  {
    id: "write-2",
    skillId: "writing.argument",
    type: "writing",
    ladderStage: 3,
    difficulty: 3,
    tags: ["argument", "opinion", "connectors"],
    prompt: {
      taskEn: "Opinion essay — argue a position",
      taskZh: "議論／意見文:表明立場 + 論證",
      scenarioEs:
        "Una revista digital pregunta a sus lectores: «¿Deberían las ciudades " +
        "limitar el uso del coche en el centro?» Escribe un texto de opinión " +
        "(150–180 palabras): presenta tu postura, da al menos dos argumentos con " +
        "ejemplos y termina con una conclusión.",
      minWords: 150,
      maxWords: 180,
      // Soft structure (guided by the scaffold note, not hard-blocked).
      requiredElements: [],
    },
  },
];

/** Seed feedback for write-1 (source: "seed"). Max 3, matching product rule. */
export const WRITING_SEED_FEEDBACK: Record<string, FeedbackPoint[]> = {
  "write-1": [
    {
      kind: "register",
      quoteEs: "Hola, tengo un problema…",
      noteZh:
        "正式電郵唔用「Hola」開頭，改用「Estimados señores:」會更加得體。",
      fixEs: "Estimados señores:",
    },
    {
      kind: "grammar",
      quoteEs: "Quiero que me devuelven el dinero.",
      noteZh: "「Querer que + 別人做」要用虛擬式：devuelvan，唔係 devuelven。",
      fixEs: "Quiero que me devuelvan el dinero.",
    },
    {
      kind: "structure",
      noteZh:
        "議論／投訴可以用連接詞分層：先 En primer lugar…，再 Por este motivo…，令論點更清楚。",
    },
  ],
  "write-2": [
    {
      kind: "structure",
      noteZh:
        "議論文清楚分四部分:① 立場(En mi opinión…)② 論點1 + 例子 ③ 論點2 ④ 結論(En conclusión…)。",
    },
    {
      kind: "structure",
      quoteEs: "Por un lado... Por otro lado...",
      noteZh: "用 Por un lado / Por otro lado 平衡兩個論點,最後 En conclusión 收結。",
    },
    {
      kind: "register",
      noteZh: "意見文用 Considero que / Es evidente que 等,避免太口語(例如 o sea)。",
    },
  ],
};
