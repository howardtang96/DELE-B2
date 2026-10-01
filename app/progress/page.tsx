"use client";

import * as React from "react";
import { TrendingUp, Info, Sparkles } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { BottomNav } from "@/components/shell/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { COMPONENT_LABELS } from "@/data/curriculum";
import { useTrainerStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";
import { computeProgress } from "@/lib/progress";

const DAYS_TARGET = 6;

function readinessTone(v: number): "success" | "warning" | "accent" {
  if (v >= 65) return "success";
  if (v >= 45) return "accent";
  return "warning";
}

export default function ProgressPage() {
  const mounted = useMounted();
  const attempts = useTrainerStore((s) => s.attempts);
  const reviewStates = useTrainerStore((s) => s.reviewStates);
  const sessions = useTrainerStore((s) => s.sessions);
  const vocabReview = useTrainerStore((s) => s.vocabReview);

  const stats = React.useMemo(
    () => computeProgress(attempts, reviewStates, sessions, vocabReview),
    [attempts, reviewStates, sessions, vocabReview],
  );

  // Before mount, render a neutral shell (store not yet hydrated) to avoid mismatch.
  const show = mounted;

  return (
    <>
      <AppShell withBottomNavSpace>
        <header className="mb-5 mt-1">
          <p className="text-sm text-muted-foreground">呢個星期</p>
          <h1 className="text-2xl font-semibold tracking-tight">This Week</h1>
        </header>

        {show && !stats.hasData ? (
          <Card className="mb-4">
            <CardContent className="py-8 text-center">
              <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary" />
              <p className="mb-1 text-sm font-medium">仲未有數據</p>
              <p className="text-xs text-muted-foreground">
                做咗練習之後,呢度會顯示你真實嘅進度同準備度(唔再係範例數)。
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Stat tiles — real numbers */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-semibold">
                {show ? stats.daysActive : 0}
                <span className="text-base text-muted-foreground">/{DAYS_TARGET}</span>
              </p>
              <p className="text-xs text-muted-foreground">活躍日數</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-semibold">{show ? stats.minutesThisWeek : 0}</p>
              <p className="text-xs text-muted-foreground">分鐘</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-semibold">{show ? stats.itemsMastered : 0}</p>
              <p className="text-xs text-muted-foreground">已掌握（3 情境）</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-semibold">{show ? stats.reviewsDue : 0}</p>
              <p className="text-xs text-muted-foreground">待複習</p>
            </CardContent>
          </Card>
        </div>

        {/* Readiness — computed */}
        <h2 className="mb-2 mt-6 text-sm font-semibold">
          Internal readiness · 內部準備度
        </h2>
        <div className="space-y-3">
          {stats.readiness.map((r) => (
            <Card key={r.component}>
              <CardContent className="py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {COMPONENT_LABELS[r.component]?.zh} · {COMPONENT_LABELS[r.component]?.en}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {show ? r.index : 0}
                  </span>
                </div>
                <Progress value={show ? r.index : 0} tone={readinessTone(r.index)} />
                <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {r.evidence.map((e) => (
                    <li key={e}>· {e}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-app)] bg-surface-2 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>唔會保證合格,只係根據你真實嘅限時任務、技能覆蓋同重複錯誤,追蹤準備進度。</p>
        </div>

        {/* Skill coverage — computed */}
        <h2 className="mb-2 mt-6 text-sm font-semibold">Skill coverage · 技能覆蓋</h2>
        <Card>
          <CardContent className="space-y-3 py-4">
            {stats.coverage.map((c) => (
              <div key={c.component}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{c.labelZh}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {show ? c.pct : 0}%
                  </span>
                </div>
                <Progress value={show ? c.pct : 0} tone="primary" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recurring errors — computed */}
        <h2 className="mb-2 mt-6 text-sm font-semibold">Recurring errors · 重複錯誤</h2>
        {show && stats.recurringErrors.length === 0 ? (
          <Card>
            <CardContent className="py-4 text-center text-sm text-muted-foreground">
              暫時冇重複錯誤 👏
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {stats.recurringErrors.map((e) => (
              <Card key={e.tag}>
                <CardContent className="flex items-center justify-between gap-2 py-3">
                  <span className="text-sm">{e.tag}</span>
                  <Badge variant="warning">
                    <TrendingUp className="h-3.5 w-3.5" /> 出現 {e.count} 次
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </AppShell>
      <BottomNav />
    </>
  );
}
