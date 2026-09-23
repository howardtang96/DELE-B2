# Data Model

Phase 0 uses TypeScript types + mock data in `data/` and local state in
`lib/store.ts` (Zustand + `localStorage`). The same types map cleanly to Supabase
tables in Phase 1.

## Entities

### Skill
A curriculum area. Fixed, code-owned.
```
Skill {
  id: string            // "grammar.subjunctive"
  component: "reading" | "listening" | "writing" | "grammar"
  labelEn: string
  labelZh: string       // Cantonese label
}
```

### Item
The atomic learning unit. Fixed, code-owned.
```
Item {
  id: string
  skillId: string
  type: "mc" | "cloze" | "transform" | "reading" | "listening" | "writing"
  ladderStage: 1 | 2 | 3 | 4         // recognition→controlled→free→timed
  difficulty: 1 | 2 | 3
  tags: string[]                      // error tags, e.g. ["ser-estar","accents"]
  prompt: ItemPrompt                  // shape depends on type
}
```

### Attempt
One recorded interaction with an item. Append-only.
```
Attempt {
  id: string
  itemId: string
  stage: 1 | 2 | 3 | 4                // ladder stage at attempt time
  correct: boolean
  errorTags: string[]                 // tags of what went wrong
  latencyMs?: number
  context: string                     // distinct-context key for mastery
  createdAt: string                   // ISO
}
```

### ReviewState (per item)
Derived + persisted scheduling state.
```
ReviewState {
  itemId: string
  intervalIndex: 0..4                 // → [1,3,7,14,30] days
  nextReviewAt: string               // ISO
  masteryCount: 0..3                 // distinct correct contexts
  mastered: boolean
}
```

### Session
A completed study block that produces a Receipt.
```
Session {
  id: string
  mode: "quick" | "reading" | "writing" | "listening" | "sprint"
  startedAt: string
  finishedAt: string
  itemIds: string[]
  score: { correct: number; total: number }
}
```

### Receipt (the 6 blocks)
```
Receipt {
  sessionId: string
  learned: string[]        // 1. what you learned
  wrong: WrongPoint[]      // 2. what was wrong (item + your answer + correct)
  whyItMatters: string     // 3. why it matters
  realLifeUse: string      // 4. real-life use
  deleUse: string          // 5. DELE B2 use
  nextReview: { itemId: string; dueAt: string; intervalDays: number }[] // 6.
}
```

### WritingFeedback (bounded)
```
WritingFeedback {
  points: FeedbackPoint[]   // length <= 3 (enforced in code)
}
FeedbackPoint {
  kind: "grammar" | "structure" | "register" | "vocab"
  quoteEs?: string          // the learner's phrase
  noteZh: string            // concise Cantonese explanation
  fixEs?: string            // suggested correction
}
```

### Readiness
```
Readiness {
  component: "reading" | "listening" | "writing"
  index: 0..100
  evidence: string[]        // human-readable evidence lines
}
```

## Provenance flag (for Phase 2)
Any text that could later be LLM-generated carries a source marker so the UI/tests
can tell seed/template from model output:
```
source: "seed" | "template" | "llm"
```
LLM-sourced text is always schema-validated before storage/use.

## Supabase mapping (Phase 1 preview)
`skills`, `items` (seeded/read-only), `attempts` (append-only, RLS to the one user),
`review_state`, `sessions`, `receipts`. Storage buckets for listening audio.
