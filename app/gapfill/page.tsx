"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Timer, Check, X, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";
import { PracticeLoading } from "@/components/practice/PracticeLoading";
import { CantoneseNote } from "@/components/common/CantoneseNote";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GAPFILL_ITEMS } from "@/data/seed-gapfill";
import type { GapfillPrompt, Session } from "@/lib/types";
import { useTrainerStore, newSessionId } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { fetchGapfill } from "@/lib/llm/client";
import { buildReceipt, type OutcomeLine } from "@/lib/receipt";

const ITEM = GAPFILL_ITEMS[0];
const CONTEXT = "gapfill-task";
const TITLE = "Gap-fill";
const SUBTITLE = "DELE B2 · 完形填空 (Tarea)";

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function GapfillPage() {
  const mounted = useMounted();
  const [data, setData] = React.useState<{
    prompt: GapfillPrompt;
    theme: string | null;
    source: "seed" | "llm";
  } | null>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (started.current) return;
    started.current = true;
    fetchGapfill().then((res) => {
      setData(
        res
          ? { prompt: res.prompt, theme: res.theme, source: res.source }
          : { prompt: ITEM.prompt as GapfillPrompt, theme: null, source: "seed" },
      );
    });
  }, []);

  if (!mounted || !data) {
    return <PracticeLoading title={TITLE} subtitle="生成緊填空練習…" />;
  }
  return <GapfillTask prompt={data.prompt} theme={data.theme} source={data.source} />;
}

function GapfillTask({
  prompt,
  theme,
  source,
}: {
  prompt: GapfillPrompt;
  theme: string | null;
  source: "seed" | "llm";
}) {
  const router = useRouter();
  const recordAttempt = useTrainerStore((s) => s.recordAttempt);
  const completeSession = useTrainerStore((s) => s.completeSession);

  const [answers, setAnswers] = React.useState<(number | null)[]>(
    prompt.gaps.map(() => null),
  );
  const [submitted, setSubmitted] = React.useState(false);
  const [remaining, setRemaining] = React.useState(prompt.timeLimitSec);
  const startedAt = React.useRef(new Date().toISOString());

  React.useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const total = prompt.gaps.length;
  const allAnswered = answers.every((a) => a !== null);
  const correctCount = answers.filter(
    (a, i) => a === prompt.gaps[i].correctIndex,
  ).length;

  function select(gi: number, oi: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((v, i) => (i === gi ? oi : v)));
  }

  function submit() {
    setSubmitted(true);
    const correct = correctCount === total;
    recordAttempt({
      itemId: ITEM.id,
      stage: ITEM.ladderStage,
      correct,
      errorTags: correct ? [] : ITEM.tags,
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
      <ModeHeader title={TITLE} subtitle={SUBTITLE} step={submitted ? 2 : 1} total={2} />

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="neutral">Rellenar huecos</Badge>
          {source === "llm" && theme ? (
            <Badge variant="primary">
              <Sparkles className="h-3.5 w-3.5" /> {theme}
            </Badge>
          ) : null}
        </div>
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
          <h2 className="mb-2 text-base font-semibold">{prompt.titleEs}</h2>
          <p className="text-sm leading-relaxed">{prompt.passageEs}</p>
        </CardContent>
      </Card>

      <div className="mb-3">
        <CantoneseNote label="策略提示（廣東話）" defaultOpen={!submitted}>
          {prompt.strategyZh}
        </CantoneseNote>
      </div>

      <div className="space-y-4">
        {prompt.gaps.map((g, gi) => (
          <div key={gi}>
            <p className="mb-2 text-sm font-medium">空格 ({gi + 1})</p>
            <div className="flex flex-wrap gap-2">
              {g.options.map((opt, oi) => {
                const chosen = answers[gi] === oi;
                const isCorrect = oi === g.correctIndex;
                return (
                  <button
                    key={oi}
                    onClick={() => select(gi, oi)}
                    disabled={submitted}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors",
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
            {submitted && g.explanationZh ? (
              <p className="mt-2 rounded-[var(--radius-app)] bg-surface-2 p-3 text-sm leading-relaxed text-muted-foreground">
                {g.explanationZh}
              </p>
            ) : null}
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
          <Button size="block" className="mt-4" onClick={finish}>
            See your receipt
          </Button>
        </>
      )}
    </AppShell>
  );
}
