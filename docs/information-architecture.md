# Information Architecture

## Navigation model

A shallow hub-and-mode structure. The **Today Mission** hub is home. Each learning
activity is a **full-screen focus mode** entered from the hub and exited back to it.
No deep nesting, no chat history, no side menus.

```
Today Mission (/)  ── hub
├─ Quick 2 MC        (/quick)     full-screen mode
├─ Reading Challenge (/reading)   full-screen mode
├─ Writing Focus     (/writing)   full-screen mode
├─ Listening         (/listening) [reserved]
├─ Conversation Sprint (/sprint)  [reserved]
├─ Learning Receipt  (/receipt)   session end
└─ Weekly Progress   (/progress)  hub-level review
```

## Routes (Phase 0)

| Route | Screen | Mode type | Built in Phase 0 |
|---|---|---|---|
| `/` | Today Mission | Hub | ✅ |
| `/quick` | Quick 2 MC | Full-screen | ✅ |
| `/reading` | Reading Challenge | Full-screen | ✅ |
| `/writing` | Writing Focus Editor | Full-screen | ✅ |
| `/receipt` | Learning Receipt | Session end | ✅ |
| `/progress` | Weekly Progress | Hub | ✅ |
| `/listening` | Listening | Full-screen | ⛔ reserved |
| `/sprint` | Conversation Sprint | Full-screen | ⛔ reserved |

## Screen-to-mode contract

- **Full-screen modes** use `ModeHeader` (close **X**, title, step dots). They hide
  the bottom navigation to protect focus.
- **Hub screens** (`/`, `/progress`) show bottom navigation.
- Every full-screen mode that completes a session routes to **`/receipt`**.

## Primary flows

1. **Daily flow**: `/` → tap next-best task → mode → `/receipt` → back to `/`.
2. **Review flow**: `/` shows items due (1/3/7/14/30) → same as daily.
3. **Reflection flow**: `/progress` for coverage, mastery, readiness, streak.

## Data surfaces per screen

- `/` — today's plan (1 next-best task), reviews due count, streak.
- `/quick` — 2 MC items, immediate correctness + short why.
- `/reading` — 1 passage + questions, timer, strategy note.
- `/writing` — 1 prompt, word band, editor, ≤3 feedback points.
- `/receipt` — the 6 blocks for the just-finished session.
- `/progress` — weekly tiles, skill coverage, readiness with evidence.

## Global layout

- Single centered mobile column (max ~430px), safe-area padding.
- Bottom nav (hub only): **Today · Progress** (+ reserved slots shown disabled).
