"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";
import { McQuestion } from "@/components/mc/McQuestion";
import { MC_ITEMS } from "@/data/seed-mc";
import type { McPrompt, Session } from "@/lib/types";
import { useTrainerStore, newSessionId } from "@/lib/store";
import { topErrorTags } from "@/lib/errors";
import { buildReceipt, mcAnswerText, type OutcomeLine } from "@/lib/receipt";

const QUICK_ITEMS = MC_ITEMS.slice(0, 2); // "Quick 2"
const CONTEXT = "quick-mc";

export default function QuickPage() {
  const router = useRouter();
  const recordAttempt = useTrainerStore((s) => s.recordAttempt);
  const completeSession = useTrainerStore((s) => s.completeSession);
  const attempts = useTrainerStore((s) => s.attempts);
  const errorTags = React.useMemo(() => topErrorTags(attempts), [attempts]);

  const [index, setIndex] = React.useState(0);
  const outcomes = React.useRef<OutcomeLine[]>([]);
  const startedAt = React.useRef(new Date().toISOString());

  const item = QUICK_ITEMS[index];
  const prompt = item.prompt as McPrompt;
  const isLast = index === QUICK_ITEMS.length - 1;

  function handleAnswered(chosenIndex: number, correct: boolean) {
    recordAttempt({
      itemId: item.id,
      stage: item.ladderStage,
      correct,
      errorTags: correct ? [] : item.tags,
      context: CONTEXT,
    });
    outcomes.current.push({
      item,
      correct,
      yourAnswer: mcAnswerText(prompt, chosenIndex),
      correctAnswer: mcAnswerText(prompt, prompt.correctIndex),
    });
  }

  function handleNext() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    // Finish → build receipt from the freshest review states, then route.
    const sessionId = newSessionId();
    const reviewStates = useTrainerStore.getState().reviewStates;
    const correctCount = outcomes.current.filter((o) => o.correct).length;

    const session: Session = {
      id: sessionId,
      mode: "quick",
      startedAt: startedAt.current,
      finishedAt: new Date().toISOString(),
      itemIds: QUICK_ITEMS.map((i) => i.id),
      score: { correct: correctCount, total: QUICK_ITEMS.length },
    };
    const receipt = buildReceipt(sessionId, "quick", outcomes.current, reviewStates);
    completeSession(session, receipt);
    router.push("/receipt");
  }

  return (
    <AppShell>
      <ModeHeader
        title="Quick 2"
        subtitle="快速檢索 · 語法直覺"
        step={index + 1}
        total={QUICK_ITEMS.length}
      />
      <McQuestion
        key={item.id}
        prompt={prompt}
        itemId={item.id}
        errorTags={errorTags}
        onAnswered={handleAnswered}
        onNext={handleNext}
        nextLabel={isLast ? "See your receipt" : "Next"}
      />
    </AppShell>
  );
}
