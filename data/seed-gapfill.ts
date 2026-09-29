// Seed DELE-style gap-fill (Tarea 4/5). Fallback + offline content.
import type { Item } from "@/lib/types";

export const GAPFILL_ITEMS: Item[] = [
  {
    id: "gapfill-1",
    skillId: "grammar.connectors",
    type: "gapfill",
    ladderStage: 4,
    difficulty: 2,
    tags: ["gapfill", "connectors", "por-para", "subjunctive"],
    prompt: {
      titleEs: "Una carta de motivación",
      passageEs:
        "Le escribo (1) solicitar una plaza en su programa de voluntariado. " +
        "Desde pequeño me ha interesado el medio ambiente, (2) he participado en " +
        "varias campañas de limpieza. Creo que esta experiencia me ayudará a crecer, " +
        "aunque (3) que el trabajo sea exigente. Espero que ustedes (4) tener en " +
        "cuenta mi solicitud. (5), quedo a la espera de su respuesta.",
      gaps: [
        {
          options: ["para", "por", "de"],
          correctIndex: 0,
          explanationZh: "表達目的（為咗申請）用 para + 動詞原形。",
        },
        {
          options: ["pero", "por eso", "aunque"],
          correctIndex: 1,
          explanationZh: "前後係因果關係（所以），用 por eso。",
        },
        {
          options: ["sé", "sepa", "saber"],
          correctIndex: 0,
          explanationZh: "主句陳述事實用直陳式 sé（我知道）。",
        },
        {
          options: ["pueden", "puedan", "podrán"],
          correctIndex: 1,
          explanationZh: "Espero que 觸發虛擬式 → puedan。",
        },
        {
          options: ["Sin embargo", "Por lo tanto", "Finalmente"],
          correctIndex: 2,
          explanationZh: "結尾作結用 Finalmente（最後）。",
        },
      ],
      strategyZh:
        "策略：每個空睇返前後文——係目的、因果定轉折？主句定從句（決定直陳/虛擬）？逐個消去唔啱嘅選項。",
      timeLimitSec: 240,
    },
  },
];
