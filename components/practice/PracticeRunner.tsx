"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";
import { McQuestion } from "@/components/mc/McQuestion";
import { ClozeQuestion } from "@/components/mc/ClozeQuestion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type {
  ClozePrompt,
  Item,
  McPrompt,
  Session,
  SessionMode,
} from "@/lib/types";
import { useTrainerStore, newSessionId } from "@/lib/store";
import { topErrorTags } from "@/lib/errors";
import { buildReceipt, mcAnswerText, type OutcomeLine } from "@/lib/receipt";

/**
 * Runs a sequence of MC/cloze items as one session, records attempts (using the
 * session id as the mastery context), then routes to the Learning Receipt.
 */
export function PracticeRunner({
  items,
  mode,
  title,
  subtitle,
}: {
  items: Item[];
  mode: SessionMode;
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const recordAttempt = useTrainerStore((s) => s.recordAttempt);
  const completeSession = useTrainerStore((s) => s.completeSession);
  const attempts = useTrainerStore((s) => s.attempts);
  const errorTags = React.useMemo(() => topErrorTags(attempts), [attempts]);

  const sessionIdRef = React.useRef<string>(undefined);
  if (sessionIdRef.current === undefined) sessionIdRef.current = newSessionId();
  const startedAtRef = React.useRef(new Date().toISOString());

  const [index, setIndex] = React.useState(0);
  const outcomes = React.useRef<OutcomeLine[]>([]);

  if (items.length === 0) {
    return (
      <AppShell>
        <ModeHeader title={title} subtitle={subtitle} />
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              而家冇到期練習，做得好！遲啲再返嚟。
            </p>
            <Link href="/">
              <Button>
                <Home className="h-4 w-4" /> 返 Today
              </Button>
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const item = items[index];
  const isLast = index === items.length - 1;

  function record(correct: boolean, yourAnswer: string, correctAnswer: string) {
    recordAttempt({
      itemId: item.id,
      stage: item.ladderStage,
      correct,
      errorTags: correct ? [] : item.tags,
      context: sessionIdRef.current as string,
    });
    outcomes.current.push({ item, correct, yourAnswer, correctAnswer });
  }

  function next() {
    if (!isLast) {
      setIndex((i) => i + 1);
      return;
    }
    const sessionId = sessionIdRef.current as string;
    const correctCount = outcomes.current.filter((o) => o.correct).length;
    const reviewStates = useTrainerStore.getState().reviewStates;
    const session: Session = {
      id: sessionId,
      mode,
      startedAt: startedAtRef.current,
      finishedAt: new Date().toISOString(),
      itemIds: items.map((i) => i.id),
      score: { correct: correctCount, total: items.length },
    };
    completeSession(session, buildReceipt(sessionId, mode, outcomes.current, reviewStates));
    router.push("/receipt");
  }

  const nextLabel = isLast ? "See your receipt" : "Next";

  return (
    <AppShell>
      <ModeHeader
        title={title}
        subtitle={subtitle}
        step={index + 1}
        total={items.length}
      />
      {item.type === "mc" ? (
        <McQuestion
          key={item.id}
          prompt={item.prompt as McPrompt}
          itemId={item.id}
          errorTags={errorTags}
          onAnswered={(chosen, correct) => {
            const p = item.prompt as McPrompt;
            record(correct, mcAnswerText(p, chosen), mcAnswerText(p, p.correctIndex));
          }}
          onNext={next}
          nextLabel={nextLabel}
        />
      ) : (
        <ClozeQuestion
          key={item.id}
          prompt={item.prompt as ClozePrompt}
          onAnswered={(correct, answerText) => {
            const p = item.prompt as ClozePrompt;
            record(correct, answerText, p.accepted[0]);
          }}
          onNext={next}
          nextLabel={nextLabel}
        />
      )}
    </AppShell>
  );
}
