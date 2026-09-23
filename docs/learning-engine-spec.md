# Learning Engine Spec

The engine is **code**. It is deterministic, testable, and the single source of
truth for *what to study, when, how it's scored, and when it's mastered*. The LLM
(Phase 2) is a **content personaliser** that operates strictly inside these rules.

---

## 1. Curriculum (fixed, code-owned)

- The B2 syllabus is a fixed set of **skills** and **items**, defined in
  `data/curriculum.ts`. Each item belongs to a skill (e.g. `grammar.subjunctive`,
  `reading.scan`, `writing.formal-email`, `connectors.contrast`).
- The LLM may **not** add, remove, or reorder curriculum items. It may only produce
  *variants* of an existing item's task.

### Item shape (summary — see data-model.md)
`id · skill · type · ladderStage · prompt · answer/rubric · tags · difficulty`

---

## 2. The learning ladder (mandatory progression)

Every item advances through four stages. Retrieval alone is never enough.

```
1. recognition          → Quick MC (pick the correct form)
2. controlled production → fill-in / transform (produce the form with support)
3. free writing          → use the item in自由 writing
4. timed B2 task         → apply under exam-like time pressure
```

- An item cannot jump stages. `progression.ts` computes the next allowed stage from
  the item's attempt history.
- The **next-best task** picker prefers: due reviews → lowest-stage active items →
  new items, within the daily budget.

---

## 3. Scoring (code-owned)

Defined in `scoring.ts`. Pure functions, no I/O.

- **MC / recognition**: exact match → correct/incorrect. Records latency.
- **Controlled production**: normalized string match (trim, case, accents-aware)
  against accepted answers; near-miss detection for accent-only errors.
- **Reading/Listening tasks**: per-question correctness + total under a time limit.
- **Free writing**: code checks **objective** constraints only —
  word-count band, required structural elements (e.g. greeting/closing for a formal
  email), and task completion. **Qualitative feedback is the LLM's job** (Phase 2),
  capped at 3 points; in Phase 0 it comes from seed data.

Scoring never depends on the LLM. The LLM never overrides a score.

---

## 4. Mastery rule (code-owned)

- An item is **mastered only after correct use in three different contexts** —
  and those contexts must span at least two different ladder stages (so a mastered
  item has been *produced*, not only *recognised*).
- `mastery.ts` exposes `isMastered(attempts)` and `masteryProgress(attempts)`
  (0–3). The LLM cannot set mastery.

---

## 5. Spaced review (code-owned)

- Intervals: **1, 3, 7, 14, 30 days**, in `scheduler.ts`.
- On a correct attempt, an item advances to the next interval; on an incorrect
  attempt, it drops back (to interval 1 for the item, keeping ladder stage).
- `dueItems(now)` returns everything whose `nextReviewAt <= now`.
- **Recurring-error transfer**: when the same error tag recurs, the engine raises
  that tag's priority and re-injects a targeted task earlier.

---

## 6. Readiness (internal, evidence-based — never a pass prediction)

`readiness.ts` (Phase 0: derived from seed) combines, per component
(reading / listening / writing):

- timed-task accuracy and speed,
- skill coverage (% of curriculum touched + drilled),
- recurring-error transfer (are known errors decaying?),
- mock results.

Output is a 0–100 **readiness index per component** with a short evidence list.
The UI must present it as readiness, never as "you will pass".

---

## 7. LLM boundary (Phase 2) — "相應學習要求"

The LLM plugs in **under** the engine. Contract:

- **Inputs**: the current item, the learner's attempt + recurring-error profile,
  the target ladder stage, and the required output schema.
- **Outputs**: strict JSON only, validated before use. Roles:
  - `explain` — why an answer is wrong, personalised (concise Cantonese).
  - `correct` — corrected version + model answer at level.
  - `feedback` — up to **3** writing feedback points (code enforces the cap).
  - `variant` — a new *instance* of an existing curriculum item's task.
- **Never**: choose the syllabus, score, set mastery, or schedule review.
- **Validation**: any malformed/over-long/unsafe output is rejected and the app
  falls back to seed/template content. See `lib/llm/` (stubs in Phase 0).

This is what lets the AI make progress **targeted** (針對性) without ever taking over
the pedagogy.

---

## 8. Testability

All of `scheduler.ts`, `mastery.ts`, `scoring.ts`, `progression.ts` are pure and
unit-testable. Phase 0 verifies them via `npm run typecheck` and lightweight
in-code assertions; a test runner is added when logic grows.
