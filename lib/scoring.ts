// Scoring rules. Code-owned, pure. The LLM never overrides a score.

import type { McPrompt, WritingPrompt } from "./types";

/** Multiple-choice: exact index match. */
export function scoreMc(prompt: McPrompt, chosenIndex: number): boolean {
  return chosenIndex === prompt.correctIndex;
}

/** Normalize a Spanish answer for controlled-production comparison. */
export function normalizeEs(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/\s+/g, " ");
}

export interface ControlledResult {
  correct: boolean;
  accentOnlyMiss: boolean; // right letters, wrong/absent accents
}

/** Controlled production: accent-aware near-miss detection. */
export function scoreControlled(
  answer: string,
  accepted: string[],
): ControlledResult {
  const exact = accepted.some((a) => a.trim().toLowerCase() === answer.trim().toLowerCase());
  if (exact) return { correct: true, accentOnlyMiss: false };

  const normAnswer = normalizeEs(answer);
  const accentOnlyMiss = accepted.some((a) => normalizeEs(a) === normAnswer);
  return { correct: false, accentOnlyMiss };
}

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export type WordBandStatus = "under" | "ok" | "over";

export function wordBandStatus(count: number, prompt: WritingPrompt): WordBandStatus {
  if (count < prompt.minWords) return "under";
  if (count > prompt.maxWords) return "over";
  return "ok";
}

export interface WritingObjectiveCheck {
  wordCount: number;
  band: WordBandStatus;
  missingElements: { key: string; labelZh: string }[];
  meetsObjectives: boolean;
}

/**
 * Objective (non-qualitative) checks on free writing — code's job only.
 * Qualitative feedback (≤3 points) is seed now, LLM later.
 */
export function checkWritingObjectives(
  text: string,
  prompt: WritingPrompt,
): WritingObjectiveCheck {
  const wordCount = countWords(text);
  const band = wordBandStatus(wordCount, prompt);
  const lower = text.toLowerCase();
  const missingElements = prompt.requiredElements.filter(
    (el) => !lower.includes(el.key.toLowerCase()),
  );
  return {
    wordCount,
    band,
    missingElements,
    meetsObjectives: band === "ok" && missingElements.length === 0,
  };
}

export const MAX_WRITING_FEEDBACK_POINTS = 3;

/** Hard cap enforced regardless of source (seed or future LLM). */
export function capFeedback<T>(points: T[]): T[] {
  return points.slice(0, MAX_WRITING_FEEDBACK_POINTS);
}
