# Roadmap

## Phase 0 — Navigable PWA prototype (current)
**Goal**: prove the experience end-to-end with mock data and local state.

- ✅ Next.js + TS + Tailwind + shadcn-style UI + Lucide + PWA scaffold.
- ✅ Docs: product brief, IA, UX, learning-engine, data model, roadmap.
- Screens: Today Mission, Quick 2 MC, Reading Challenge, Writing Focus, Learning
  Receipt, Weekly Progress.
- Engine as pure functions: `scheduler`, `mastery`, `scoring`, `progression`.
- Local state persisted to `localStorage`.
- **No backend, DB, auth, or LLM.**
- Exit criteria: see acceptance criteria in the Phase 0 section below; lint +
  typecheck clean; installable PWA.

## Phase 1 — Supabase (Postgres / Auth / Storage) ✅ code delivered
- ✅ `skills` / `items` tables (read-only) + `attempts` / `review_state` /
  `sessions` / `receipts` with RLS scoped to the user. See
  [phase1-supabase.md](./phase1-supabase.md).
- ✅ Magic-link auth (`/account`) + private `listening-audio` storage bucket.
- ✅ Offline-first sync layer (`lib/repo`), engine logic unchanged.
- ✅ Graceful fallback: no env → local-only PWA.
- ✅ Timed **Listening** mode (`/listening`): exam-style limited replays, TTS audio
  now (swaps to stored audio via `audioUrl` when Phase 1 audio lands), hidden
  transcript revealed after answering.
- ⏳ Remaining: upload real audio to the `listening-audio` bucket and set `audioUrl`;
  regenerate DB types via Supabase CLI once the project exists.

## Phase 2 — Controlled LLM (structured JSON) ✅ code delivered
- ✅ `lib/llm/` with zod output schemas + validation, forced Anthropic tool use.
- ✅ Roles live: `explain`, `feedback` (≤3). Fallback to seed on any invalid output.
  See [phase2-llm.md](./phase2-llm.md).
- ✅ Personalises under the engine's learning requirements (相應學習要求); never
  chooses syllabus, scores, sets mastery, or schedules.
- ✅ Server-only key, small `max_tokens`, calls only on user actions.
- ✅ Recurring-error tags derived from real attempt history (`lib/errors.ts`) and fed
  to the LLM routes so feedback/explanations/corrections target the learner's mistakes.
- ✅ `correct` role: on-demand corrected version of the learner's writing
  (`/api/llm/correct`), minimal faithful rewrite + Cantonese change summary.
- ✅ `variant` role (`/api/llm/variant`): fresh MC/cloze instances of an existing
  grammar topic — powers unlimited practice in the Grammar Drill (prefetched, seed
  fallback). 17 grammar topics ship as templates.
- ✅ Reading generator (`/api/llm/reading`): original B2 passages on rotating
  news/knowledge themes (no scraping, no copied text) + glosses + questions; the
  Reading screen serves a fresh one each visit with seed fallback.
- ⏳ Remaining: cache generated content; mine reading glosses into spaced-review vocab.

## Phase 3 — Reminders & polish (in-PWA)
- In-app scheduled reminders / notifications (no Telegram, no native app).
- Conversation Sprint mode (self-recorded speaking against prompts).
- Richer progress analytics and mock-exam mode per component.

## Explicitly out of scope (early releases)
Telegram integration · chatbot UI · native mobile app · RAG / vector DB ·
fine-tuning · multi-agent framework · web scraping.

---

## Phase 0 acceptance criteria
1. `npm run dev` serves; all 6 routes navigate with no runtime errors.
2. Installable PWA (valid manifest + icons + service worker).
3. Clean at 375px; no horizontal scroll; one primary action per screen.
4. Quick 2 flows through 2 MC items → Learning Receipt with all 6 blocks populated.
5. Writing editor enforces the word-count band and shows **≤3** feedback points.
6. `scheduler` + `mastery` implement 1/3/7/14/30 and the 3-context rule as pure,
   asserted functions. No exam-pass promise anywhere in copy.
7. State persists across reload via `localStorage`; no network calls.
8. `npm run lint` and `npm run typecheck` pass clean.
9. All docs + README + CLAUDE.md present and consistent with the build.

## Definition of "next smallest task" reporting
At the end of every phase, report: **changed files**, **test/lint/typecheck
results**, and the **next smallest task**.
