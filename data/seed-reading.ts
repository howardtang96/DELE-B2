// Seed reading item (timed task stage). Fixed curriculum content.
import type { Item } from "@/lib/types";

export const READING_ITEMS: Item[] = [
  {
    id: "read-1",
    skillId: "reading.scan",
    type: "reading",
    ladderStage: 4,
    difficulty: 2,
    tags: ["scan", "inference"],
    prompt: {
      titleEs: "Trabajar desde casa",
      passageEs:
        "Desde la pandemia, muchas empresas españolas han mantenido el teletrabajo, " +
        "al menos algunos días a la semana. Según un estudio reciente, los empleados " +
        "valoran sobre todo la flexibilidad horaria y el ahorro de tiempo en " +
        "desplazamientos. Sin embargo, no todo son ventajas: algunos trabajadores " +
        "afirman que les cuesta desconectar del trabajo y que echan de menos el " +
        "contacto diario con sus compañeros.",
      glosses: [
        { phrase: "teletrabajo", zh: "遙距／在家工作" },
        { phrase: "desplazamientos", zh: "通勤、來回路程" },
        { phrase: "desconectar", zh: "抽離、停止諗返工嘅嘢" },
        { phrase: "echan de menos", zh: "掛住、懷念" },
      ],
      questions: [
        {
          q: "¿Qué valoran más los empleados del teletrabajo?",
          options: [
            "El sueldo más alto",
            "La flexibilidad y el ahorro de tiempo",
            "Menos reuniones",
          ],
          correctIndex: 1,
          explanationZh:
            "文中明講「valoran sobre todo la flexibilidad horaria y el ahorro de tiempo」，所以係彈性同慳時間；文中冇提加人工。",
        },
        {
          q: "Según el texto, ¿cuál es una desventaja?",
          options: [
            "Cuesta desconectar del trabajo",
            "Se gana menos dinero",
            "Hay que viajar más",
          ],
          correctIndex: 0,
          explanationZh:
            "文尾講「les cuesta desconectar del trabajo」＝好難抽離工作，就係缺點；賺少啲同要通勤文中都冇講。",
        },
      ],
      strategyZh:
        "策略：先睇問題同選項嘅關鍵詞，再返去段落掃描（scan）搵對應嘅句子，唔使逐個字讀。",
      timeLimitSec: 180,
    },
  },
];
