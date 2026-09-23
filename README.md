# Spanish B2 Performance App

A private, mobile-first PWA for **one** learner: a Cantonese speaker in Hong Kong
preparing for the **non-oral DELE B2 components** — reading, listening, and written
expression — in a 15-minute daily budget.

Oral performance is already strong. This app deliberately targets the weaker areas:
**grammar accuracy, reading-exam strategy, listening-exam strategy, and formal /
structured written argumentation.**

> This app does **not** promise or predict an exam pass. It tracks an internal,
> evidence-based **readiness** signal from timed tasks, skill coverage,
> recurring-error transfer, and mock results.

---

## Status

- **Phase 0 (current): navigable PWA prototype.** Mock data + local state only.
  No backend, no database, no auth, no LLM.
- Phase 1: Supabase (Postgres / Auth / Storage).
- Phase 2: controlled LLM API calls with structured JSON output.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · shadcn-style UI · Lucide icons · Zustand · PWA.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint     # ESLint
npm run typecheck # tsc --noEmit
npm run build    # production build
```

## Screens (Phase 0)

| Route | Screen | Purpose |
|---|---|---|
| `/` | Today Mission | One next-best task + reviews due |
| `/quick` | Quick 2 MC | Fast retrieval, 2 items |
| `/reading` | Reading Challenge | DELE B2-style reading + strategy |
| `/writing` | Writing Focus Editor | Formal writing, word band, ≤3 feedback points |
| `/receipt` | Learning Receipt | 6-block session summary |
| `/progress` | Weekly Progress | Coverage, mastery, readiness |

## Core principle: code owns the syllabus, the LLM only personalises

- **Code owns**: scheduling (1/3/7/14/30-day review), scoring rules, word counts,
  task coverage, the learning ladder (recognition → controlled production → free
  writing → timed B2 task), and the mastery threshold (correct in **3 different
  contexts**).
- **LLM (Phase 2) owns only**: personalised explanations, feedback wording,
  corrections, and task *variants* — always through typed, validated JSON slots.
  It never invents the syllabus and never marks mastery.

See [`docs/`](./docs) for the full specification.

## Documentation

- [Product Brief](./docs/product-brief.md)
- [Information Architecture](./docs/information-architecture.md)
- [UX Principles](./docs/ux-principles.md)
- [Learning Engine Spec](./docs/learning-engine-spec.md)
- [Data Model](./docs/data-model.md)
- [Roadmap](./docs/roadmap.md)
