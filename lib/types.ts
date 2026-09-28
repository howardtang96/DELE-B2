// Core domain types. These map 1:1 to the Supabase schema planned for Phase 1.
// See docs/data-model.md and docs/learning-engine-spec.md.

export type Component = "reading" | "listening" | "writing" | "grammar";

export type LadderStage = 1 | 2 | 3 | 4; // recognition→controlled→free→timed
export const LADDER_LABELS: Record<LadderStage, { en: string; zh: string }> = {
  1: { en: "Recognition", zh: "認得" },
  2: { en: "Controlled", zh: "有提示產出" },
  3: { en: "Free writing", zh: "自由寫作" },
  4: { en: "Timed task", zh: "限時應試" },
};

export type ItemType =
  | "mc"
  | "cloze"
  | "transform"
  | "reading"
  | "listening"
  | "writing";

export type Difficulty = 1 | 2 | 3;

/** Provenance so UI/tests can distinguish seed/template from future LLM output. */
export type TextSource = "seed" | "template" | "llm";

export interface Skill {
  id: string;
  component: Component;
  labelEn: string;
  labelZh: string;
}

export interface McPrompt {
  stemEs: string;
  options: string[];
  correctIndex: number;
  whyZh: string; // concise Cantonese explanation
}

/** Controlled-production item: the learner types the answer (ladder stage 2). */
export interface ClozePrompt {
  stemEs: string; // contains "___" where the answer goes
  accepted: string[]; // acceptable answers (accent-aware scoring)
  hintZh?: string; // optional Cantonese hint shown before answering
  whyZh: string; // explanation shown after answering
}

export interface ReadingQuestion {
  q: string;
  options: string[];
  correctIndex: number;
  /** Concise Cantonese explanation of why the correct answer is right. */
  explanationZh?: string;
}

export interface ReadingPrompt {
  titleEs: string;
  passageEs: string;
  glosses: { phrase: string; zh: string }[]; // progressive-disclosure hints
  questions: ReadingQuestion[];
  strategyZh: string;
  timeLimitSec: number;
}

export interface WritingPrompt {
  taskEn: string;
  taskZh: string;
  scenarioEs: string;
  minWords: number;
  maxWords: number;
  requiredElements: { key: string; labelZh: string }[]; // e.g. greeting/closing
}

export interface ListeningPrompt {
  titleEs: string;
  instructionZh: string;
  /** Spoken via browser TTS when no audioUrl is set (real audio arrives in Phase 1+). */
  scriptEs: string;
  audioUrl?: string;
  maxPlays: number;
  glosses: { phrase: string; zh: string }[];
  questions: ReadingQuestion[];
  strategyZh: string;
  timeLimitSec: number;
}

export type ItemPrompt =
  | McPrompt
  | ClozePrompt
  | ReadingPrompt
  | WritingPrompt
  | ListeningPrompt;

export interface Item {
  id: string;
  skillId: string;
  type: ItemType;
  ladderStage: LadderStage;
  difficulty: Difficulty;
  tags: string[];
  prompt: ItemPrompt;
}

export interface Attempt {
  id: string;
  itemId: string;
  stage: LadderStage;
  correct: boolean;
  errorTags: string[];
  latencyMs?: number;
  context: string; // distinct-context key for the mastery rule
  createdAt: string; // ISO
}

export interface ReviewState {
  itemId: string;
  intervalIndex: number; // 0..4 → REVIEW_INTERVALS_DAYS
  nextReviewAt: string; // ISO
  masteryCount: number; // 0..3 distinct correct contexts
  mastered: boolean;
}

export type SessionMode =
  | "quick"
  | "reading"
  | "writing"
  | "listening"
  | "sprint";

export interface Session {
  id: string;
  mode: SessionMode;
  startedAt: string;
  finishedAt: string;
  itemIds: string[];
  score: { correct: number; total: number };
}

export interface WrongPoint {
  itemId: string;
  labelZh: string;
  yourAnswer: string;
  correctAnswer: string;
}

export interface ReceiptReviewLine {
  itemId: string;
  dueAt: string;
  intervalDays: number;
}

/** The 6-block Learning Receipt. Order is fixed by product rule. */
export interface Receipt {
  sessionId: string;
  learned: string[]; // 1
  wrong: WrongPoint[]; // 2
  whyItMatters: string; // 3
  realLifeUse: string; // 4
  deleUse: string; // 5
  nextReview: ReceiptReviewLine[]; // 6
  source: TextSource;
}

export type FeedbackKind = "grammar" | "structure" | "register" | "vocab";

export interface FeedbackPoint {
  kind: FeedbackKind;
  quoteEs?: string;
  noteZh: string;
  fixEs?: string;
}

export interface WritingFeedback {
  points: FeedbackPoint[]; // length <= 3, enforced in code
  source: TextSource;
}

export interface Readiness {
  component: Exclude<Component, "grammar">;
  index: number; // 0..100
  evidence: string[];
}
