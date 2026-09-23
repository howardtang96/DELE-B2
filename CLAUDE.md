# CLAUDE.md — working guide for this repository

This is a **private, single-user, mobile-first PWA** for DELE **B2 non-oral** prep
(reading, listening, written expression). Read this before making changes.

## Non-negotiable product rules

1. **Code owns the syllabus.** Scheduling, scoring, word counts, task coverage,
   the learning ladder, and mastery thresholds live in `lib/` and `data/` as pure,
   testable logic. Do not let content or an LLM decide these.
2. **The LLM only personalises** (Phase 2): explanations, feedback wording,
   corrections, task variants — via typed, validated JSON. It **never** invents the
   syllabus and **never** marks mastery.
3. **Mastery = correct use in 3 different contexts.** Never mark mastered from a
   single MC hit.
4. **Learning ladder**: recognition → controlled production → free writing →
   timed B2 task. MC is retrieval only, not the finish line.
5. **Spaced review**: 1 / 3 / 7 / 14 / 30 days.
6. **Never promise or predict an exam pass.** Only surface internal *readiness*
   with its evidence.
7. **At most 3 feedback points** after free writing. Enforced in code.
8. **Every finished session ends with the 6-block Learning Receipt**: what was
   learned, what was wrong, why it matters, real-life use, DELE B2 use, next review.

## UX rules

- Mobile-first (design at 375px), installable PWA, calm, card-first, adult tone.
- **One next-best task at a time.** No chat-history UI. No walls of text.
- Progressive disclosure; explanations concise and in **Cantonese (廣東話)**.
- Separate full-screen modes: Quick MC, Reading, Listening, Writing, Conversation
  Sprint, Learning Receipt, Progress. (Phase 0 builds 6; Listening + Conversation
  Sprint are reserved.)

## Architecture boundaries

- `data/` — fixed B2 curriculum + seed content (the syllabus source of truth).
- `lib/` — engine: `scheduler.ts`, `mastery.ts`, `scoring.ts`, `progression.ts`,
  pure functions with no I/O. `store.ts` = local persistence (Zustand + localStorage).
- `lib/llm/` — Phase 2 boundary: prompt builders + Zod-style schema validators.
  In Phase 0 these are stubs returning seed text. **All LLM output is validated
  before it reaches the UI.**
- `components/` — presentational; no business rules inside components.
- `app/` — one route per screen/mode.

## Phase discipline

- Phase 0: mock data + local state only. **No backend, DB, auth, or LLM API.**
- Small, testable commits. Run `npm run lint` and `npm run typecheck` after each phase.
- End each phase by reporting: changed files, test results, next smallest task.

## Conventions

- TypeScript strict. Prefer pure functions and explicit types in `lib/`.
- Keep components small; match existing naming and Tailwind token usage.
- Design tokens are CSS variables in `app/globals.css` (light + dark).
