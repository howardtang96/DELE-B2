"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";
import { CantoneseNote } from "@/components/common/CantoneseNote";
import { AudioPlayer } from "@/components/listening/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LISTENING_ITEMS } from "@/data/seed-listening";
import type { ListeningPrompt, Session } from "@/lib/types";
import { useTrainerStore, newSessionId } from "@/lib/store";
import { buildReceipt, type OutcomeLine } from "@/lib/receipt";

const ITEM = LISTENING_ITEMS[0];
const PROMPT = ITEM.prompt as ListeningPrompt;
const CONTEXT = "listening-task";

export default function ListeningPage() {
  const router = useRouter();
  const recordAttempt = useTrainerStore((s) => s.recordAttempt);
  const completeSession = useTrainerStore((s) => s.completeSession);

  const [answers, setAnswers] = React.useState<(number | null)[]>(
    PROMPT.questions.map(() => null),
  );
  const [submitted, setSubmitted] = React.useState(false);
  const [started, setStarted] = React.useState(false);
  const startedAt = React.useRef(new Date().toISOString());

  const allAnswered = answers.every((a) => a !== null);
  const correctCount = answers.filter(
    (a, i) => a === PROMPT.questions[i].correctIndex,
  ).length;
  const total = PROMPT.questions.length;

  function select(qi: number, oi: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((v, i) => (i === qi ? oi : v)));
  }

  function submit() {
    setSubmitted(true);
    recordAttempt({
      itemId: ITEM.id,
      stage: ITEM.ladderStage,
      correct: correctCount === total,
      errorTags: correctCount === total ? [] : ITEM.tags,
      context: CONTEXT,
    });
  }

  function finish() {
    const sessionId = newSessionId();
    const outcome: OutcomeLine = {
      item: ITEM,
      correct: correctCount === total,
      yourAnswer: `${correctCount}/${total} 啱`,
      correctAnswer: `${total}/${total}`,
    };
    const reviewStates = useTrainerStore.getState().reviewStates;
    const session: Session = {
      id: sessionId,
      mode: "listening",
      startedAt: startedAt.current,
      finishedAt: new Date().toISOString(),
      itemIds: [ITEM.id],
      score: { correct: correctCount, total },
    };
    completeSession(session, buildReceipt(sessionId, "listening", [outcome], reviewStates));
    router.push("/receipt");
  }

  return (
    <AppShell>
      <ModeHeader
        title="Listening"
        subtitle="DELE B2 · 限時聆聽"
        step={submitted ? 2 : 1}
        total={2}
      />

      <div className="mb-3 flex items-center justify-between">
        <Badge variant="neutral">Tarea · Gist &amp; detail</Badge>
        <span className="text-sm font-medium">{PROMPT.titleEs}</span>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{PROMPT.instructionZh}</p>

      <div className="mb-4">
        <AudioPlayer
          scriptEs={PROMPT.scriptEs}
          audioUrl={PROMPT.audioUrl}
          maxPlays={PROMPT.maxPlays}
          onFirstPlay={() => setStarted(true)}
        />
      </div>

      <div className="mb-4">
        <CantoneseNote label="策略提示（廣東話）" defaultOpen={!started}>
          {PROMPT.strategyZh}
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
            你答啱 <span className="font-semibold">{correctCount}</span> / {total}
          </div>
          <div className="mt-4">
            <CantoneseNote label="文字稿 (transcript)">
              <p className="leading-relaxed">{PROMPT.scriptEs}</p>
            </CantoneseNote>
          </div>
          <Button size="block" className="mt-4" onClick={finish}>
            See your receipt
          </Button>
        </>
      )}
    </AppShell>
  );
}
