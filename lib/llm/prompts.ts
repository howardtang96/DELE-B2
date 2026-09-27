// Controlled prompt builders. The system prompt binds the model to the engine's
// learning requirements: personalise only, never invent syllabus / score / mastery,
// JSON via tool only, concise Cantonese. Inputs come from code-owned data.

import type { McPrompt, WritingPrompt } from "@/lib/types";
import type { WritingObjectiveCheck } from "@/lib/scoring";
import { MAX_WRITING_FEEDBACK_POINTS } from "@/lib/scoring";

const ROLE_SYSTEM = `You are a DELE B2 Spanish tutor for a Cantonese-speaking learner in Hong Kong.
Hard rules (do not break):
- You ONLY personalise explanations and feedback. You do NOT choose what to study,
  score answers, decide mastery, or invent curriculum.
- Write explanations in concise Cantonese (廣東話口語), not Mandarin, not English prose.
  Keep Spanish terms in Spanish.
- Be specific and encouraging; no filler. Return ONLY via the provided tool (JSON).`;

export function buildExplainPrompt(
  prompt: McPrompt,
  chosenIndex: number,
  recurringErrorTags: string[],
) {
  const chosen = prompt.options[chosenIndex] ?? "(no answer)";
  const correct = prompt.options[prompt.correctIndex];
  const user = `Question: ${prompt.stemEs}
Learner chose: ${chosen}
Correct answer: ${correct}
Learner's recurring error tags: ${recurringErrorTags.join(", ") || "none"}

Explain in 1-2 sentences of Cantonese WHY the correct answer is right and, if the
learner was wrong, why their choice fails. Tie it to the grammar point. Field: whyZh.`;
  return { system: ROLE_SYSTEM, user };
}

export function buildCorrectPrompt(
  prompt: WritingPrompt,
  text: string,
  recurringErrorTags: string[],
) {
  const user = `Task (${prompt.taskEn}): ${prompt.scenarioEs}
Required word band: ${prompt.minWords}-${prompt.maxWords}.
Learner's recurring error tags: ${recurringErrorTags.join(", ") || "none"}

Learner's text:
"""
${text}
"""

Return a corrected version (field correctedEs) that keeps the learner's own ideas and
structure but fixes grammar, register, and connectors to clean B2 level. Do NOT expand
into a different essay; minimal faithful correction only, within the word band.
Also give summaryZh: 1-2 sentences of Cantonese naming the main types of change.`;
  return { system: ROLE_SYSTEM, user };
}

export function buildFeedbackPrompt(
  prompt: WritingPrompt,
  text: string,
  check: WritingObjectiveCheck,
  recurringErrorTags: string[],
) {
  const missing = check.missingElements.map((m) => m.labelZh).join("; ") || "none";
  const user = `Task (${prompt.taskEn}): ${prompt.scenarioEs}
Required word band: ${prompt.minWords}-${prompt.maxWords}. Learner wrote ${check.wordCount} words (band: ${check.band}).
Missing required elements (already detected by code): ${missing}
Learner's recurring error tags: ${recurringErrorTags.join(", ") || "none"}

Learner's text:
"""
${text}
"""

Give AT MOST ${MAX_WRITING_FEEDBACK_POINTS} feedback points — the highest-value ones only.
Each point: kind (grammar|structure|register|vocab), optional quoteEs (the learner's exact phrase),
noteZh (concise Cantonese explanation), optional fixEs (the corrected Spanish).
Prioritise errors that match the learner's recurring tags and B2 written-expression criteria.
Do not restate the word-count issue unless it is the single most important point.`;
  return { system: ROLE_SYSTEM, user };
}
