// Seed MC items (recognition stage). Fixed curriculum content.
import type { Item } from "@/lib/types";

export const MC_ITEMS: Item[] = [
  {
    id: "mc-subj-1",
    skillId: "grammar.subjunctive",
    type: "mc",
    ladderStage: 1,
    difficulty: 2,
    tags: ["subjunctive", "para-que"],
    prompt: {
      stemEs: "Te lo explico otra vez para que lo ___ mejor.",
      options: ["entiendes", "entiendas", "entenderás"],
      correctIndex: 1,
      whyZh:
        "「para que」係目的連接詞，後面一定要用虛擬式，所以要 entiendas，唔係 entiendes。",
    },
  },
  {
    id: "mc-serestar-1",
    skillId: "grammar.ser-estar",
    type: "mc",
    ladderStage: 1,
    difficulty: 1,
    tags: ["ser-estar"],
    prompt: {
      stemEs: "La reunión ___ en la sala 3, empieza a las nueve.",
      options: ["es", "está", "hay"],
      correctIndex: 0,
      whyZh:
        "講「事件喺邊度舉行」要用 ser（La reunión es en…）；estar 係講物件位置。",
    },
  },
  {
    id: "mc-past-1",
    skillId: "grammar.past-tenses",
    type: "mc",
    ladderStage: 1,
    difficulty: 2,
    tags: ["indefinido", "imperfecto"],
    prompt: {
      stemEs: "Cuando ___ pequeño, íbamos a la playa cada verano.",
      options: ["fui", "era", "he sido"],
      correctIndex: 1,
      whyZh:
        "描述過去嘅背景／習慣用未完成過去式 imperfecto（era），indefinido（fui）係講一次過完成嘅事。",
    },
  },
  {
    id: "mc-conn-1",
    skillId: "grammar.connectors",
    type: "mc",
    ladderStage: 1,
    difficulty: 2,
    tags: ["connectors", "contrast"],
    prompt: {
      stemEs: "El plan es bueno; ___, necesitamos más tiempo para aplicarlo.",
      options: ["por lo tanto", "sin embargo", "además"],
      correctIndex: 1,
      whyZh:
        "前後係轉折關係，要用 sin embargo（然而）；por lo tanto 係因果，además 係補充。",
    },
  },
];
