// Lightweight, dependency-free assertions for the code-owned engine rules.
// Run with: npm run test:engine  (Node 22 strips types and runs this directly)
// A full test runner is added in a later phase as logic grows.

import { REVIEW_INTERVALS_DAYS, initReviewState, scheduleNext, dueItems } from "./scheduler";
import { evaluateMastery } from "./mastery";
import { scoreMc, scoreControlled, countWords, wordBandStatus, capFeedback } from "./scoring";
import { nextAllowedStage, highestPassedStage } from "./progression";
import type { Attempt, Item, LadderStage, McPrompt, WritingPrompt } from "./types";

let passed = 0;
let failed = 0;
function assert(name: string, cond: boolean) {
  if (cond) {
    passed++;
  } else {
    failed++;
    console.error("  ✗ FAIL:", name);
  }
}

function attempt(stage: LadderStage, correct: boolean, context: string): Attempt {
  return {
    id: Math.random().toString(36),
    itemId: "x",
    stage,
    correct,
    errorTags: [],
    context,
    createdAt: new Date().toISOString(),
  };
}

// --- scheduler: 1/3/7/14/30 intervals ---
assert("intervals are 1/3/7/14/30", JSON.stringify([...REVIEW_INTERVALS_DAYS]) === JSON.stringify([1, 3, 7, 14, 30]));
{
  const s0 = initReviewState("x", new Date("2026-01-01T00:00:00Z"));
  assert("init interval index 0", s0.intervalIndex === 0);
  const s1 = scheduleNext(s0, true, new Date("2026-01-02T00:00:00Z"));
  assert("correct steps up interval", s1.intervalIndex === 1);
  const s2 = scheduleNext(s1, false, new Date("2026-01-03T00:00:00Z"));
  assert("incorrect resets to interval 0", s2.intervalIndex === 0);
  let sN = initReviewState("x");
  for (let i = 0; i < 10; i++) sN = scheduleNext(sN, true);
  assert("interval index caps at 4 (30d)", sN.intervalIndex === 4);
}
{
  const due = dueItems([
    { itemId: "a", intervalIndex: 0, nextReviewAt: new Date(Date.now() - 1000).toISOString(), masteryCount: 0, mastered: false },
    { itemId: "b", intervalIndex: 0, nextReviewAt: new Date(Date.now() + 1e9).toISOString(), masteryCount: 0, mastered: false },
  ]);
  assert("dueItems returns only overdue", due.length === 1 && due[0].itemId === "a");
}

// --- mastery: 3 distinct correct contexts (sessions) ---
assert(
  "not mastered with 2 contexts",
  evaluateMastery([attempt(1, true, "c1"), attempt(2, true, "c2")]).mastered === false,
);
assert(
  "not mastered when 3 correct but same context repeated",
  evaluateMastery([attempt(1, true, "c1"), attempt(1, true, "c1"), attempt(1, true, "c1")]).mastered === false,
);
assert(
  "mastered with 3 distinct contexts",
  evaluateMastery([attempt(1, true, "c1"), attempt(1, true, "c2"), attempt(1, true, "c3")]).mastered === true,
);
assert(
  "wrong attempts do not count toward mastery",
  evaluateMastery([attempt(1, true, "c1"), attempt(1, false, "c2"), attempt(1, false, "c3")]).mastered === false,
);
assert(
  "mastery count capped at 3",
  evaluateMastery([attempt(1, true, "c1"), attempt(2, true, "c2"), attempt(3, true, "c3"), attempt(4, true, "c4")]).count === 3,
);

// --- scoring ---
const mc: McPrompt = { stemEs: "", options: ["a", "b"], correctIndex: 1, whyZh: "" };
assert("scoreMc correct", scoreMc(mc, 1) === true);
assert("scoreMc incorrect", scoreMc(mc, 0) === false);
assert("controlled exact", scoreControlled("Hablo", ["hablo"]).correct === true);
assert("controlled accent-only miss detected", scoreControlled("esta", ["está"]).accentOnlyMiss === true);
assert("countWords", countWords("  hola   qué tal ") === 3);
const wp: WritingPrompt = { taskEn: "", taskZh: "", scenarioEs: "", minWords: 120, maxWords: 150, requiredElements: [] };
assert("word band under", wordBandStatus(100, wp) === "under");
assert("word band ok", wordBandStatus(130, wp) === "ok");
assert("word band over", wordBandStatus(200, wp) === "over");
assert("feedback capped at 3", capFeedback([1, 2, 3, 4, 5]).length === 3);

// --- progression: no stage skipping ---
const item: Item = { id: "x", skillId: "s", type: "mc", ladderStage: 1, difficulty: 1, tags: [], prompt: mc };
assert("first attempt starts at entry stage", nextAllowedStage(item, []) === 1);
assert("advances one stage after passing stage 1", nextAllowedStage(item, [attempt(1, true, "c1")]) === 2);
assert("highestPassedStage ignores wrong answers", highestPassedStage([attempt(1, false, "c1")]) === 0);

console.log(`\nEngine checks: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
