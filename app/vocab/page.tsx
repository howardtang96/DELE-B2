"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Eye, Check, X, BookMarked } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";
import { PracticeLoading } from "@/components/practice/PracticeLoading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrainerStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { dueItems } from "@/lib/scheduler";

const TITLE = "Vocab Review";
const SUBTITLE = "閱讀生字 · 間隔複習";

export default function VocabPage() {
  const mounted = useMounted();
  const vocab = useTrainerStore((s) => s.vocab);
  const reviewVocab = useTrainerStore((s) => s.reviewVocab);

  // Snapshot the due queue once at mount so it doesn't reshuffle as we grade.
  const [queue] = React.useState<string[]>(() => {
    const due = dueItems(Object.values(useTrainerStore.getState().vocabReview));
    return due.map((r) => r.itemId).filter((p) => useTrainerStore.getState().vocab[p]);
  });

  const [index, setIndex] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);

  if (!mounted) return <PracticeLoading title={TITLE} subtitle={SUBTITLE} />;

  const totalVocab = Object.keys(vocab).length;

  if (queue.length === 0) {
    return (
      <AppShell>
        <ModeHeader title={TITLE} subtitle={SUBTITLE} />
        <Card>
          <CardContent className="py-8 text-center">
            <BookMarked className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="mb-1 text-sm">
              {totalVocab === 0 ? "仲未有生字。" : "冇到期生字，做得好！"}
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              生字會喺你完成 Reading 之後自動加入(而家共 {totalVocab} 個)。
            </p>
            <div className="flex justify-center gap-2">
              <Link href="/reading">
                <Button variant="outline">去 Reading</Button>
              </Link>
              <Link href="/">
                <Button>
                  <Home className="h-4 w-4" /> 返 Today
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (index >= queue.length) {
    return (
      <AppShell>
        <ModeHeader title={TITLE} subtitle={SUBTITLE} />
        <Card>
          <CardContent className="py-8 text-center">
            <Check className="mx-auto mb-3 h-8 w-8 text-success" />
            <p className="mb-4 text-sm">複習完 {queue.length} 個生字 👏</p>
            <Link href="/">
              <Button size="block">
                <Home className="h-4 w-4" /> 返 Today
              </Button>
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const phrase = queue[index];
  const entry = vocab[phrase];

  function grade(correct: boolean) {
    reviewVocab(phrase, correct);
    setRevealed(false);
    setIndex((i) => i + 1);
  }

  return (
    <AppShell>
      <ModeHeader title={TITLE} subtitle={SUBTITLE} step={index + 1} total={queue.length} />

      <Card className="mb-5">
        <CardContent className="flex min-h-[180px] flex-col items-center justify-center gap-3 py-10 text-center">
          <Badge variant="neutral">生字</Badge>
          <p className="text-2xl font-semibold">{entry.phrase}</p>
          {revealed ? (
            <p className="text-base text-muted-foreground">{entry.zh}</p>
          ) : null}
        </CardContent>
      </Card>

      {!revealed ? (
        <Button size="block" onClick={() => setRevealed(true)}>
          <Eye className="h-4 w-4" /> 睇答案
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => grade(false)}>
            <X className="h-4 w-4" /> 唔記得
          </Button>
          <Button onClick={() => grade(true)}>
            <Check className="h-4 w-4" /> 識
          </Button>
        </div>
      )}
    </AppShell>
  );
}
