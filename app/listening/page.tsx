"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, X, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";
import { PracticeLoading } from "@/components/practice/PracticeLoading";
import { CantoneseNote } from "@/components/common/CantoneseNote";
import { AudioPlayer } from "@/components/listening/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LISTENING_ITEMS } from "@/data/seed-listening";
import type { ListeningPrompt, Session } from "@/lib/types";
import { useTrainerStore, newSessionId } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { fetchListening } from "@/lib/llm/client";
import { buildReceipt, type OutcomeLine } from "@/lib/receipt";

const ITEM = LISTENING_ITEMS[0]; // tracking/scheduling unit for listening practice
const CONTEXT = "listening-task";
const TITLE = "Listening";
const SUBTITLE = "DELE B2 · 限時聆聽";

export default function ListeningPage() {
  const mounted = useMounted();
  const [data, setData] = React.useState<{ prompt: ListeningPrompt; source: "seed" | "llm" } | null>(
    null,
  );
  const started = React.useRef(false);

  React.useEffect(() => {
    if (started.current) return;
    started.current = true;
    fetchListening().then((res) => {
      setData(
        res
          ? { prompt: res.prompt, source: res.source }
          : { prompt: ITEM.prompt as ListeningPrompt, source: "seed" },
      );
    });
  }, []);

  if (!mounted || !data) return <PracticeLoading title={TITLE} subtitle="生成緊聆聽練習…" />;
  return <ListeningTask prompt={data.prompt} source={data.source} />;
}

function ListeningTask({ prompt, source }: { prompt: ListeningPrompt; source: "seed" | "llm" }) {
  const router = useRouter();
  const recordAttempt = useTrainerStore((s) => s.recordAttempt);
  const completeSession = useTrainerStore((s) => s.completeSession);
  const addVocab = useTrainerStore((s) => s.addVocab);

  const [answers, setAnswers] = React.useState<(number | null)[]>(prompt.questions.map(() => null));
  const [submitted, setSubmitted] = React.useState(false);
  const [startedPlaying, setStartedPlaying] = React.useState(false);
  const startedAt = React.useRef(new Date().toISOString());

  const total = prompt.questions.length;
  const allAnswered = answers.every((a) => a !== null);
  const correctCount = answers.filter((a, i) => a === prompt.questions[i].correctIndex).length;

  function select(qi: number, oi: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((v, i) => (i === qi ? oi : v)));
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
    addVocab(prompt.glosses);
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
      <ModeHeader title={TITLE} subtitle={SUBTITLE} step={submitted ? 2 : 1} total={2} />

      <div className="mb-3 flex items-center justify-between">
        <Badge variant="neutral">Gist &amp; detail</Badge>
        {source === "llm" ? (
          <Badge variant="primary">
            <Sparkles className="h-3.5 w-3.5" /> AI 新內容
          </Badge>
        ) : null}
      </div>

      <p className="mb-3 text-sm text-muted-foreground">{prompt.instructionZh}</p>

      <div className="mb-4">
        <AudioPlayer
          scriptEs={prompt.scriptEs}
          audioUrl={prompt.audioUrl}
          maxPlays={prompt.maxPlays}
          onFirstPlay={() => setStartedPlaying(true)}
        />
      </div>

      <div className="mb-4">
        <CantoneseNote label="策略提示（廣東話）" defaultOpen={!startedPlaying}>
          {prompt.strategyZh}
        </CantoneseNote>
      </div>

      <div className="space-y-4">
        {prompt.questions.map((q, qi) => (
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
            {submitted && q.explanationZh ? (
              <p className="mt-2 rounded-[var(--radius-app)] bg-surface-2 p-3 text-sm leading-relaxed text-muted-foreground">
                {q.explanationZh}
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
          {prompt.glosses.length > 0 ? (
            <div className="mt-4">
              <CantoneseNote label="生字提示 (加入 Vocab)">
                <ul className="space-y-1">
                  {prompt.glosses.map((g) => (
                    <li key={g.phrase}>
                      <span className="font-medium text-foreground">{g.phrase}</span> — {g.zh}
                    </li>
                  ))}
                </ul>
              </CantoneseNote>
            </div>
          ) : null}
          <div className="mt-4">
            <CantoneseNote label="文字稿 (transcript)">
              <p className="leading-relaxed">{prompt.scriptEs}</p>
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
