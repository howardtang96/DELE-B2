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
};
