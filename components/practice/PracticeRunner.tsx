"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";
import { McQuestion } from "@/components/mc/McQuestion";
import { ClozeQuestion } from "@/components/mc/ClozeQuestion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type {
  ClozePrompt,
  Item,
  McPrompt,
  Session,
  SessionMode,
} from "@/lib/types";
import { useTrainerStore, newSessionId } from "@/lib/store";
import { topErrorTags } from "@/lib/errors";
import { fetchVariant } from "@/lib/llm/client";
import { buildReceipt, mcAnswerText, type OutcomeLine } from "@/lib/receipt";

type Resolved = { prompt: McPrompt | ClozePrompt; source: "seed" | "llm" };

/**
 * Runs a sequence of MC/cloze items as one session, records attempts (session id =
 * mastery context), then routes to the Learning Receipt. With `useVariants`, fresh
 * AI variants of each grammar topic are prefetched in parallel on mount. The seed
 * question shows INSTANTLY (no waiting); a ready variant swaps in before the learner
 * answers, and the shown prompt is locked once they answer so it never changes under
 * them. Falls back to seed when the LLM is off or slow.
 */
export function PracticeRunner({
  items,
  mode,
  title,
  subtitle,
  useVariants = false,
}: {
  items: Item[];
  mode: SessionMode;
  title: string;
  subtitle?: string;
  useVariants?: boolean;
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

  // Variants resolved from the server, and the prompt locked in once answered.
  const [resolved, setResolved] = React.useState<Record<number, Resolved>>({});
  const [locked, setLocked] = React.useState<Record<number, Resolved>>({});
  const prefetched = React.useRef(false);

  React.useEffect(() => {
    if (!useVariants || prefetched.current || items.length === 0) return;
    prefetched.current = true;
    items.forEach((it, i) => {
      if (it.type !== "mc" && it.type !== "cloze") return;
      fetchVariant(it.id).then((res) => {
        if (res) setResolved((prev) => ({ ...prev, [i]: { prompt: res.prompt, source: res.source } }));
      });
    });
  }, [useVariants, items]);

  if (items.length === 0) {
    return (
      <AppShell>
        <ModeHeader title={title} subtitle={subtitle} />
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              而家冇到期練習,做得好!遲啲再返嚟。
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
  const seedResolved: Resolved = { prompt: item.prompt as McPrompt | ClozePrompt, source: "seed" };
  // Locked (after answering) wins; else a ready variant; else the instant seed.
  const active: Resolved =
    locked[index] ?? (useVariants ? resolved[index] ?? seedResolved : seedResolved);
  const nextLabel = isLast ? "See your receipt" : "Next";

  function record(correct: boolean, yourAnswer: string, correctAnswer: string) {
    setLocked((prev) => (prev[index] ? prev : { ...prev, [index]: active }));
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

  return (
    <AppShell>
      <ModeHeader title={title} subtitle={subtitle} step={index + 1} total={items.length} />

      {active.source === "llm" ? (
        <Badge variant="primary" className="mb-3">
          <Sparkles className="h-3.5 w-3.5" /> AI 生成新題
        </Badge>
      ) : null}

      {item.type === "mc" ? (
        <McQuestion
          key={`${item.id}-${active.source}`}
          prompt={active.prompt as McPrompt}
          itemId={useVariants ? undefined : item.id}
          errorTags={errorTags}
          onAnswered={(chosen, correct) => {
            const p = active.prompt as McPrompt;
            record(correct, mcAnswerText(p, chosen), mcAnswerText(p, p.correctIndex));
          }}
          onNext={next}
          nextLabel={nextLabel}
        />
      ) : (
        <ClozeQuestion
          key={`${item.id}-${active.source}`}
          prompt={active.prompt as ClozePrompt}
          onAnswered={(correct, answerText) => {
            const p = active.prompt as ClozePrompt;
            record(correct, answerText, p.accepted[0]);
          }}
          onNext={next}
          nextLabel={nextLabel}
        />
      )}
    </AppShell>
  );
}
