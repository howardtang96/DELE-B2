# Phase 2 — Controlled LLM

The LLM is **optional and additive**, exactly like Supabase. With no key set, the app
uses seed feedback/explanations (Phase 0/1 behaviour). Add `ANTHROPIC_API_KEY` and the
same UI gains personalised, validated output.

## Principle: the LLM personalises, the code decides (相應學習要求)

- Code still owns everything pedagogical: syllabus (`data/`), scoring, mastery,
  scheduling, the ladder, and the 3-point feedback cap.
- The LLM only rewrites **explanations** and **writing feedback**, personalised to the
  learner's recurring errors. It never picks the next task, scores, sets mastery, or
  schedules.
- Every model response is **forced JSON** (Anthropic tool use) and **validated with
  zod** before it reaches the app. Anything invalid → fall back to seed.

## Flow

```
UI (client)                    server route                    Anthropic
 fetchExplain/                  /api/llm/explain   ── forced tool ──▶  model
 fetchWritingFeedback  ──────▶  /api/llm/feedback  ◀── JSON ───────────┘
   │  (seed shown instantly)      │  look up item from code data
   │                              │  run objective checks (scoring.ts)
   │                              │  build controlled prompt
   ▼                              ▼  validate (zod) + cap ≤3
 swap in personalised text     seed fallback on any failure
```

- Seed feedback renders **immediately** on submit; personalised output swaps in when
  it returns (a small “AI 個人化” badge marks LLM output).
- The API key is read **server-side only** and never exposed to the browser.

## Files

- `lib/llm/schemas.ts` — zod + tool JSON schemas (single source of the ≤3 cap).
- `lib/llm/prompts.ts` — controlled prompt builders (role, JSON-only, Cantonese).
- `lib/llm/provider.ts` — server-only Anthropic call with forced tool; returns
  validated JSON or null.
- `app/api/llm/explain/route.ts`, `app/api/llm/feedback/route.ts` — validate input,
  look up the item from code data, call the model, cap, or fall back to seed.
- `lib/llm/client.ts` — client fetch helpers (used by the MC and Writing screens).

## Setup

1. Add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   LLM_MODEL=claude-sonnet-5   # optional; this is the default
   ```
2. Restart `npm run dev`. Answer a Quick 2 item or submit in Writing Focus — the
   explanation / feedback becomes personalised, marked “AI 個人化”.

## Guarantees / safety

- No key, bad key, network error, non-JSON, or schema mismatch → seed content. The UI
  never breaks and never shows raw model errors.
- Feedback is capped at 3 points in `scoring.ts` and again in each route.
- Prompts forbid the model from inventing syllabus, scoring, or deciding mastery.
- Cost control: `max_tokens` is small (400 for explain, 1024 for feedback); calls only
  fire on explicit user actions (answering / submitting).
