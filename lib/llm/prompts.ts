// Controlled prompt builders. The system prompt binds the model to the engine's
// learning requirements: personalise only, never invent syllabus / score / mastery,
// JSON via tool only, concise Cantonese. Inputs come from code-owned data.

import type { ClozePrompt, Difficulty, McPrompt, WritingPrompt } from "@/lib/types";
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

export function buildVariantMcPrompt(
  skillLabelEn: string,
  example: McPrompt,
  difficulty: Difficulty,
) {
  const user = `Grammar topic: ${skillLabelEn}. Difficulty: ${difficulty}/3.
Here is an EXAMPLE item of this topic:
${JSON.stringify({ stemEs: example.stemEs, options: example.options, correctIndex: example.correctIndex })}

Create ONE NEW multiple-choice item testing the SAME grammar topic at the same level,
but with a DIFFERENT sentence and vocabulary (a fresh B2 context). Rules:
- exactly 3 options, exactly one correct;
- the stem is a natural B2 Spanish sentence with a gap or choice point;
- whyZh = 1 short Cantonese sentence explaining why the answer is right.`;
  return { system: ROLE_SYSTEM, user };
}

export function buildVariantClozePrompt(
  skillLabelEn: string,
  example: ClozePrompt,
  difficulty: Difficulty,
) {
  const user = `Grammar topic: ${skillLabelEn}. Difficulty: ${difficulty}/3.
Here is an EXAMPLE fill-in item of this topic:
${JSON.stringify({ stemEs: example.stemEs, accepted: example.accepted })}

Create ONE NEW fill-in item testing the SAME grammar topic at the same level, with a
DIFFERENT sentence. Rules:
- stemEs MUST contain "___" exactly where the learner types the answer;
- accepted = all correct forms (include accents; add common variants if any);
- hintZh = short Cantonese hint; whyZh = short Cantonese explanation.`;
  return { system: ROLE_SYSTEM, user };
}

export const READING_THEMES = [
  "tecnología",
  "medio ambiente",
  "salud y bienestar",
  "economía y trabajo",
  "cultura y sociedad",
  "educación",
  "ciencia",
  "viajes y ciudades",
] as const;

export function buildReadingPrompt(theme: string) {
  const user = `Write an ORIGINAL short B2 Spanish reading passage on the theme "${theme}",
in the style of a general-knowledge / news feature (NOT copied from any real article,
no real names, quotes or brands). Rules:
- 90-130 words, clear B2 level, neutral informative tone;
- 3-4 glosses: pick B2 words/phrases from the passage and give a concise Cantonese meaning;
- 2-3 comprehension questions (one gist, one detail, optionally one inference), each with
  exactly 3 options and one correct answer;
- for EACH question, explanationZh = 1 short Cantonese sentence saying why the correct
  option is right (refer to the passage);
- strategyZh: 1 short Cantonese reading-strategy tip for this passage.
Return via the tool.`;
  return { system: ROLE_SYSTEM, user };
}

export function buildGapfillPrompt(theme: string) {
  const user = `Create an ORIGINAL DELE B2 "rellenar huecos" (gap-fill) task on the theme
"${theme}" (a short letter, email or informative text, ~100-150 words). Rules:
- put 5-6 numbered blanks in the passage as literal markers (1) (2) (3) … in reading order;
- gaps must test B2 grammar/lexis IN CONTEXT (e.g. por/para, subjunctive triggers,
  connectors, ser/estar, prepositions, verb tense);
- for each gap: exactly 3 options, one correct, and explanationZh = 1 short Cantonese
  reason why it is right;
- the gaps array MUST be in the same order as the (n) markers;
- strategyZh: 1 short Cantonese tip. Return via the tool.`;
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
