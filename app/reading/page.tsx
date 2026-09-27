"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Timer, Check, X } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";
import { CantoneseNote } from "@/components/common/CantoneseNote";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { READING_ITEMS } from "@/data/seed-reading";
import type { ReadingPrompt, Session } from "@/lib/types";
import { useTrainerStore, newSessionId } from "@/lib/store";
import { buildReceipt, type OutcomeLine } from "@/lib/receipt";

const ITEM = READING_ITEMS[0];
const PROMPT = ITEM.prompt as ReadingPrompt;
const CONTEXT = "reading-task";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function ReadingPage() {
  const router = useRouter();
  const recordAttempt = useTrainerStore((s) => s.recordAttempt);
  const completeSession = useTrainerStore((s) => s.completeSession);

  const [answers, setAnswers] = React.useState<(number | null)[]>(
    PROMPT.questions.map(() => null),
  );
  const [submitted, setSubmitted] = React.useState(false);
  const [remaining, setRemaining] = React.useState(PROMPT.timeLimitSec);
  const startedAt = React.useRef(new Date().toISOString());
  const startMs = React.useRef<number>(0);

  React.useEffect(() => {
    startMs.current = Date.now();
  }, []);

  React.useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const allAnswered = answers.every((a) => a !== null);
  const correctCount = answers.filter(
    (a, i) => a === PROMPT.questions[i].correctIndex,
  ).length;

  function select(qi: number, oi: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((v, i) => (i === qi ? oi : v)));
  }

  function submit() {
    setSubmitted(true);
    const total = PROMPT.questions.length;
    const correct = correctCount === total;
    recordAttempt({
      itemId: ITEM.id,
      stage: ITEM.ladderStage,
      correct,
      errorTags: correct ? [] : ITEM.tags,
      latencyMs: Date.now() - startMs.current,
      context: CONTEXT,
    });
  }

  function finish() {
    const sessionId = newSessionId();
    const total = PROMPT.questions.length;
    const outcome: OutcomeLine = {
      item: ITEM,
      correct: correctCount === total,
      yourAnswer: `${correctCount}/${total} 啱`,
      correctAnswer: `${total}/${total}`,
    };
    const reviewStates = useTrainerStore.getState().reviewStates;
    const session: Session = {
      id: sessionId,
      mode: "reading",
      startedAt: startedAt.current,
      finishedAt: new Date().toISOString(),
      itemIds: [ITEM.id],
      score: { correct: correctCount, total },
    };
    completeSession(session, buildReceipt(sessionId, "reading", [outcome], reviewStates));
    router.push("/receipt");
  }

  return (
    <AppShell>
      <ModeHeader
        title="Reading"
        subtitle="DELE B2 · 限時閱讀"
        step={submitted ? 2 : 1}
        total={2}
      />

      <div className="mb-3 flex items-center justify-between">
        <Badge variant="neutral">Tarea · Scan &amp; locate</Badge>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium tabular-nums",
            remaining === 0 ? "text-danger" : "text-muted-foreground",
          )}
        >
          <Timer className="h-4 w-4" />
          {remaining === 0 ? "時間到" : fmt(remaining)}
        </span>
      </div>

      <Card className="mb-4">
        <CardContent className="pt-5">
          <h2 className="mb-2 text-base font-semibold">{PROMPT.titleEs}</h2>
          <p className="text-sm leading-relaxed">{PROMPT.passageEs}</p>
        </CardContent>
      </Card>

      <div className="mb-3">
        <CantoneseNote label="策略提示（廣東話）" defaultOpen={!submitted}>
          {PROMPT.strategyZh}
        </CantoneseNote>
      </div>

      <div className="mb-4">
        <CantoneseNote label="生字提示 (tap to reveal)">
          <ul className="space-y-1">
            {PROMPT.glosses.map((g) => (
              <li key={g.phrase}>
                <span className="font-medium text-foreground">{g.phrase}</span> —{" "}
                {g.zh}
              </li>
            ))}
          </ul>
        </CantoneseNote>
      </div>

      <div className="space-y-4">
        {PROMPT.questions.map((q, qi) => (
          <div key={qi}>
            <p className="mb-2 text-sm font-medium">{q.q}</p>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, oi) => {
                const chosen = answers[qi] === oi;
                const isCorrect = oi === q.correctIndex;
                return (
                  <button
                    key={oi}
                    onClick={() => select(qi, oi)}
                    disabled={submitted}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-[var(--radius-app)] border px-4 py-3 text-left text-sm transition-colors",
                      !submitted && chosen && "border-primary bg-primary/10",
                      !submitted && !chosen && "border-border bg-surface hover:bg-surface-2",
                      submitted && isCorrect && "border-success bg-success-soft text-success",
                      submitted && chosen && !isCorrect && "border-danger bg-danger-soft text-danger",
                      submitted && !isCorrect && !chosen && "border-border opacity-60",
                    )}
                  >
                    <span>{opt}</span>
                    {submitted && isCorrect ? <Check className="h-4 w-4" /> : null}
                    {submitted && chosen && !isCorrect ? <X className="h-4 w-4" /> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <Button size="block" className="mt-6" disabled={!allAnswered} onClick={submit}>
          Submit answers
        </Button>
      ) : (
        <>
          <div className="mt-6 rounded-[var(--radius-app)] bg-surface-2 p-4 text-center text-sm">
            你答啱 <span className="font-semibold">{correctCount}</span> /{" "}
            {PROMPT.questions.length}
          </div>
          <Button size="block" className="mt-4" onClick={finish}>
            See your receipt
          </Button>
        </>
      )}
    </AppShell>
  );
}
