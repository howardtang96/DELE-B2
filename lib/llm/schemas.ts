// Structured-output schemas for the LLM boundary (Phase 2). Every model response is
// validated against these BEFORE it reaches the app. Anything invalid is rejected
// and the caller falls back to seed/template content.

import { z } from "zod";
import { MAX_WRITING_FEEDBACK_POINTS } from "@/lib/scoring";

export const feedbackPointSchema = z.object({
  kind: z.enum(["grammar", "structure", "register", "vocab"]),
  quoteEs: z.string().max(200).optional(),
  noteZh: z.string().min(1).max(300),
  fixEs: z.string().max(300).optional(),
});

export const feedbackResultSchema = z.object({
  // Cap enforced again in code even if the model returns more.
  points: z.array(feedbackPointSchema).max(MAX_WRITING_FEEDBACK_POINTS),
});

export const explainResultSchema = z.object({
  whyZh: z.string().min(1).max(400),
});

export const correctResultSchema = z.object({
  // A minimally-rewritten, corrected B2-level version of the learner's text.
  correctedEs: z.string().min(1).max(2000),
  // 1-2 sentence Cantonese summary of the main changes.
  summaryZh: z.string().min(1).max(400),
});

// Variant: a fresh instance of an existing grammar item (same topic, new sentence).
export const variantMcSchema = z.object({
  stemEs: z.string().min(1).max(300),
  options: z.array(z.string().min(1).max(120)).length(3),
  correctIndex: z.number().int().min(0).max(2),
  whyZh: z.string().min(1).max(300),
});

export const variantClozeSchema = z.object({
  stemEs: z.string().min(1).max(300).refine((s) => s.includes("___"), {
    message: "stem must contain ___",
  }),
  accepted: z.array(z.string().min(1).max(80)).min(1).max(4),
  hintZh: z.string().max(200).optional(),
  whyZh: z.string().min(1).max(300),
});

// Reading: an original B2 passage on a theme, with glosses + comprehension questions.
const readingObjectSchema = z.object({
  titleEs: z.string().min(1).max(160),
  passageEs: z.string().min(1).max(2500),
  glosses: z
    .array(z.object({ phrase: z.string().min(1).max(80), zh: z.string().min(1).max(160) }))
    .max(10)
    .default([]),
  questions: z
    .array(
      z.object({
        q: z.string().min(1).max(240),
        options: z.array(z.string().min(1).max(200)).min(2).max(5),
        correctIndex: z.number().int().min(0).max(4),
        explanationZh: z.string().max(300).optional(),
      }),
    )
    .min(1)
    .max(6),
  strategyZh: z.string().min(1).max(400),
});

// Tolerate common model naming drift (e.g. `title` → `titleEs`, `passage` → `passageEs`).
export const readingResultSchema = z.preprocess((val) => {
  if (val && typeof val === "object") {
    const o = val as Record<string, unknown>;
    if (o.titleEs === undefined && typeof o.title === "string") o.titleEs = o.title;
    if (o.passageEs === undefined && typeof o.passage === "string") o.passageEs = o.passage;
  }
  return val;
}, readingObjectSchema);

// Gap-fill (DELE Tarea 4/5): a text with (1)…(n) markers and one choice per gap.
const gapfillObjectSchema = z.object({
  titleEs: z.string().min(1).max(160),
  passageEs: z.string().min(1).max(2500),
  gaps: z
    .array(
      z.object({
        options: z.array(z.string().min(1).max(120)).min(2).max(4),
        correctIndex: z.number().int().min(0).max(3),
        explanationZh: z.string().max(300).optional(),
      }),
    )
    .min(3)
    .max(10),
  strategyZh: z.string().min(1).max(400),
});

export const gapfillResultSchema = z.preprocess((val) => {
  if (val && typeof val === "object") {
    const o = val as Record<string, unknown>;
    if (o.titleEs === undefined && typeof o.title === "string") o.titleEs = o.title;
    if (o.passageEs === undefined && typeof o.passage === "string") o.passageEs = o.passage;
  }
  return val;
}, gapfillObjectSchema);

export type FeedbackResult = z.infer<typeof feedbackResultSchema>;
export type ExplainResult = z.infer<typeof explainResultSchema>;
export type CorrectResult = z.infer<typeof correctResultSchema>;
export type VariantMc = z.infer<typeof variantMcSchema>;
export type VariantCloze = z.infer<typeof variantClozeSchema>;
export type ReadingResult = z.infer<typeof readingResultSchema>;
export type GapfillResult = z.infer<typeof gapfillResultSchema>;

// JSON Schemas passed to the model as tool input_schema (kept aligned with the zod
// schemas above).
export const feedbackToolSchema = {
  type: "object",
  properties: {
    points: {
      type: "array",
      maxItems: MAX_WRITING_FEEDBACK_POINTS,
      items: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["grammar", "structure", "register", "vocab"] },
          quoteEs: { type: "string" },
          noteZh: { type: "string" },
          fixEs: { type: "string" },
        },
        required: ["kind", "noteZh"],
        additionalProperties: false,
      },
    },
  },
  required: ["points"],
  additionalProperties: false,
} as const;

export const explainToolSchema = {
  type: "object",
  properties: {
    whyZh: { type: "string" },
  },
  required: ["whyZh"],
  additionalProperties: false,
} as const;

export const correctToolSchema = {
  type: "object",
  properties: {
    correctedEs: { type: "string" },
    summaryZh: { type: "string" },
  },
  required: ["correctedEs", "summaryZh"],
  additionalProperties: false,
} as const;

export const variantMcToolSchema = {
  type: "object",
  properties: {
    stemEs: { type: "string" },
    options: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
    correctIndex: { type: "integer", minimum: 0, maximum: 2 },
    whyZh: { type: "string" },
  },
  required: ["stemEs", "options", "correctIndex", "whyZh"],
  additionalProperties: false,
} as const;

export const variantClozeToolSchema = {
  type: "object",
  properties: {
    stemEs: { type: "string", description: "must contain ___ where the answer goes" },
    accepted: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
    hintZh: { type: "string" },
    whyZh: { type: "string" },
  },
  required: ["stemEs", "accepted", "whyZh"],
  additionalProperties: false,
} as const;

export const readingToolSchema = {
  type: "object",
  properties: {
    titleEs: { type: "string" },
    passageEs: { type: "string" },
    glosses: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        properties: { phrase: { type: "string" }, zh: { type: "string" } },
        required: ["phrase", "zh"],
        additionalProperties: false,
      },
    },
    questions: {
      type: "array",
      minItems: 2,
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          q: { type: "string" },
          options: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
          correctIndex: { type: "integer", minimum: 0, maximum: 2 },
          explanationZh: {
            type: "string",
            description: "concise Cantonese: why the correct option is right",
          },
        },
        required: ["q", "options", "correctIndex", "explanationZh"],
        additionalProperties: false,
      },
    },
    strategyZh: { type: "string" },
  },
  required: ["titleEs", "passageEs", "glosses", "questions", "strategyZh"],
  additionalProperties: false,
} as const;

export const gapfillToolSchema = {
  type: "object",
  properties: {
    titleEs: { type: "string" },
    passageEs: {
      type: "string",
      description: "the text, with (1) (2) (3)… markers where each blank goes",
    },
    gaps: {
      type: "array",
      minItems: 3,
      maxItems: 10,
      items: {
        type: "object",
        properties: {
          options: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
          correctIndex: { type: "integer", minimum: 0, maximum: 2 },
          explanationZh: { type: "string" },
        },
        required: ["options", "correctIndex", "explanationZh"],
        additionalProperties: false,
      },
    },
    strategyZh: { type: "string" },
  },
  required: ["titleEs", "passageEs", "gaps", "strategyZh"],
  additionalProperties: false,
} as const;
