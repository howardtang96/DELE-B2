// Seed listening item (timed task stage). Fixed curriculum content.
// Phase 0/1: no stored audio, so the script is spoken by the browser's Spanish TTS.
// When Phase 1 audio lands, set audioUrl and the player uses it instead.
import type { Item } from "@/lib/types";

export const LISTENING_ITEMS: Item[] = [
  {
    id: "listen-1",
    skillId: "listening.gist",
    type: "listening",
    ladderStage: 4,
    difficulty: 2,
    tags: ["gist", "detail"],
    prompt: {
      titleEs: "Un mensaje de voz",
      instructionZh: "聽一段語音留言，然後答問題。只可以聽兩次。",
      scriptEs:
        "Hola, soy Marta. Te llamo porque la reunión del viernes se ha cambiado. " +
        "Ahora será el lunes a las diez de la mañana, en la sala grande del segundo piso. " +
        "Por favor, trae el informe de ventas y avisa a Carlos. Si no puedes venir, llámame antes del jueves. Gracias.",
      maxPlays: 2,
      glosses: [
        { phrase: "se ha cambiado", zh: "改咗（時間／安排）" },
        { phrase: "el informe de ventas", zh: "銷售報告" },
        { phrase: "avisa a Carlos", zh: "通知 Carlos" },
      ],
      questions: [
        {
          q: "¿Cuándo será ahora la reunión?",
          options: ["El viernes a las diez", "El lunes a las diez", "El jueves por la tarde"],
          correctIndex: 1,
          explanationZh:
            "留言講「ahora será el lunes a las diez」＝改咗做星期一十點；星期五係舊時間，星期四係截止聯絡日。",
        },
        {
          q: "¿Qué debe traer la persona?",
          options: ["El informe de ventas", "El ordenador", "El contrato"],
          correctIndex: 0,
          explanationZh:
            "「trae el informe de ventas」＝帶銷售報告；電腦同合約留言都冇提。",
        },
        {
          q: "¿Qué hay que hacer si no se puede ir?",
          options: [
            "Escribir un correo a Carlos",
            "Llamar a Marta antes del jueves",
            "No hacer nada",
          ],
          correctIndex: 1,
          explanationZh:
            "「Si no puedes venir, llámame antes del jueves」＝唔嚟就要星期四前打畀 Marta；通知 Carlos 係另一件事。",
        },
      ],
      strategyZh:
        "策略：第一次聽捉大意（gist）——邊個、幾時、做咩；第二次先專注細節同數字。聽之前快速掃一次問題。",
      timeLimitSec: 150,
    },
  },
];
