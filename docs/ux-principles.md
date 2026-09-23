# UX Principles

## 1. One next-best task at a time
The hub surfaces exactly one recommended task. Everything else is secondary and
tucked away. Decisions are the app's job, not the learner's.

## 2. Calm, visual, card-first, adult
Generous spacing, soft surfaces, restrained color. No gamified noise, no childish
mascots. Color carries meaning (correct / attention / neutral), not decoration.

## 3. Phone-first, 15 minutes
Design at 375px width first. A full session fits comfortably in ~15 minutes and one
thumb. No horizontal scrolling. Large tap targets (min 44px).

## 4. No walls of text — progressive disclosure
Show the minimum. Details (grammar notes, strategy, glosses) live behind a tap.
Explanations are **concise and in Cantonese (廣東話)**; the Spanish content stays
in Spanish.

## 5. No chat interface
This is a trainer, not a conversation. No message history, no scrolling transcript
as the primary surface.

## 6. Feedback is bounded
After free writing, show **at most three** feedback points — the highest-value ones.
More than that overwhelms and doesn't transfer.

## 7. Every session ends with a Learning Receipt
Six blocks, always in this order:
1. **What you learned**
2. **What was wrong**
3. **Why it matters**
4. **Real-life use**
5. **DELE B2 use**
6. **Next review** (the scheduled date/interval)

## 8. Honesty about readiness
Never say "you'll pass". Show internal **readiness** and the evidence behind it
(timed tasks, coverage, error transfer, mocks). Copy example:
> 唔會保證合格，只係追蹤你嘅準備進度。

## 9. Motion & feedback
Subtle, fast transitions (≤200ms). Immediate response to every tap. Correct/incorrect
states are instant and unambiguous, then explained on demand.

## 10. Accessibility & theming
Support light and dark via CSS variables. Sufficient contrast. Respect
`prefers-reduced-motion`. Text scalable; no meaning conveyed by color alone
(pair with icon/label).

## Voice & copy

- UI chrome: short English labels (Today, Reading, Start, Submit).
- Explanations, hints, encouragement: **Cantonese**, warm but concise.
- Spanish is the target language content — never translated away unnecessarily.
