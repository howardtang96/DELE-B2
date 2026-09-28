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

export type FeedbackResult = z.infer<typeof feedbackResultSchema>;
export type ExplainResult = z.infer<typeof explainResultSchema>;
export type CorrectResult = z.infer<typeof correctResultSchema>;
export type VariantMc = z.infer<typeof variantMcSchema>;
export type VariantCloze = z.infer<typeof variantClozeSchema>;

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
