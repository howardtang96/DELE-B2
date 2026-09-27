"use client";

import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { BottomNav } from "@/components/shell/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { WEEKLY_STATS, READINESS } from "@/data/seed-progress";
import { COMPONENT_LABELS } from "@/data/curriculum";

const trendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
} as const;

function readinessTone(v: number): "success" | "warning" | "accent" {
  if (v >= 65) return "success";
  if (v >= 45) return "accent";
  return "warning";
}

export default function ProgressPage() {
  const s = WEEKLY_STATS;

  return (
    <>
      <AppShell withBottomNavSpace>
        <header className="mb-5 mt-1">
          <p className="text-sm text-muted-foreground">呢個星期</p>
          <h1 className="text-2xl font-semibold tracking-tight">This Week</h1>
        </header>

        {/* Stat tiles */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-semibold">
                {s.daysActive}
                <span className="text-base text-muted-foreground">/{s.daysTarget}</span>
              </p>
              <p className="text-xs text-muted-foreground">活躍日數</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-semibold">{s.minutesThisWeek}</p>
              <p className="text-xs text-muted-foreground">分鐘</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-semibold">{s.itemsMastered}</p>
              <p className="text-xs text-muted-foreground">已掌握（3 情境）</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-2xl font-semibold">{s.reviewsDue}</p>
              <p className="text-xs text-muted-foreground">待複習</p>
            </CardContent>
          </Card>
        </div>

        {/* Readiness — evidence-based, NOT a pass prediction */}
        <h2 className="mb-2 mt-6 text-sm font-semibold">
          Internal readiness · 內部準備度
        </h2>
        <div className="space-y-3">
          {READINESS.map((r) => (
            <Card key={r.component}>
              <CardContent className="py-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {COMPONENT_LABELS[r.component]?.zh} ·{" "}
                    {COMPONENT_LABELS[r.component]?.en}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {r.index}
                  </span>
                </div>
                <Progress value={r.index} tone={readinessTone(r.index)} />
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
          <p>唔會保證合格，只係根據限時任務、技能覆蓋、錯誤轉移同模擬結果，追蹤你嘅準備進度。</p>
        </div>

        {/* Skill coverage */}
        <h2 className="mb-2 mt-6 text-sm font-semibold">Skill coverage · 技能覆蓋</h2>
        <Card>
          <CardContent className="space-y-3 py-4">
            {s.coverage.map((c) => (
              <div key={c.component}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{c.labelZh}</span>
                  <span className="tabular-nums text-muted-foreground">{c.pct}%</span>
                </div>
                <Progress value={c.pct} tone="primary" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recurring errors */}
        <h2 className="mb-2 mt-6 text-sm font-semibold">
          Recurring errors · 重複錯誤
        </h2>
        <div className="space-y-2">
          {s.recurringErrors.map((e) => {
            const Icon = trendIcon[e.trend];
            const tone =
              e.trend === "down" ? "success" : e.trend === "up" ? "danger" : "neutral";
            return (
              <Card key={e.tag}>
                <CardContent className="flex items-center justify-between gap-2 py-3">
                  <span className="text-sm">{e.labelZh}</span>
                  <Badge variant={tone as "success" | "danger" | "neutral"}>
                    <Icon className="h-3.5 w-3.5" />
                    {e.trend === "down" ? "改善中" : e.trend === "up" ? "增加" : "持平"}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </AppShell>
      <BottomNav />
    </>
  );
}
