"use client";

import Link from "next/link";
import { ArrowRight, Clock, Flame, RotateCcw, PenLine, BookOpen, Headphones, Zap, UserCircle2 } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { BottomNav } from "@/components/shell/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTrainerStore } from "@/lib/store";
import { dueItems } from "@/lib/scheduler";
import { WEEKLY_STATS } from "@/data/seed-progress";

export default function TodayMissionPage() {
  const hydrated = useTrainerStore((s) => s.hydrated);
  const reviewStates = useTrainerStore((s) => s.reviewStates);

  const dueCount = hydrated
    ? dueItems(Object.values(reviewStates)).length
    : WEEKLY_STATS.reviewsDue;
  const streak = WEEKLY_STATS.streakDays;

  return (
    <>
      <AppShell withBottomNavSpace>
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">早晨 · 準備好未</p>
            <h1 className="text-2xl font-semibold tracking-tight">Today&apos;s Mission</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning">
              <Flame className="h-3.5 w-3.5" /> {streak} 日
            </Badge>
            <Link
              href="/account"
              aria-label="Account"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <UserCircle2 className="h-5 w-5" />
            </Link>
          </div>
        </header>

        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          15 分鐘，一步一步嚟。
        </div>

        {/* One next-best task */}
        <Card className="mb-4 overflow-hidden">
          <div className="bg-primary/10 px-5 py-2 text-xs font-medium text-primary">
            NEXT BEST TASK · 今日重點
          </div>
          <CardContent className="pt-5">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="primary">Grammar</Badge>
              <Badge variant="neutral">認得 → 產出</Badge>
            </div>
            <h2 className="mb-1 text-lg font-semibold">Grammar Drill · 一組 6 題</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              溝埋到期複習 + 新題，由揀答案練到自己打西班牙文。約 5 分鐘。
            </p>
            <Link href="/grammar">
              <Button size="block">
                Start <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Reviews due */}
        <Card className="mb-4">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2">
              <RotateCcw className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {dueCount > 0 ? `${dueCount} 項到期複習` : "冇到期複習"}
              </p>
              <p className="text-xs text-muted-foreground">
                間隔複習：1 / 3 / 7 / 14 / 30 日
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Secondary modes */}
        <p className="mb-2 mt-6 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          其他模式
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/quick">
            <Card className="h-full transition-colors hover:bg-surface-2">
              <CardContent className="flex flex-col gap-2 py-4">
                <Zap className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Quick 2</span>
                <span className="text-xs text-muted-foreground">快速熱身 · 2 題</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/reading">
            <Card className="h-full transition-colors hover:bg-surface-2">
              <CardContent className="flex flex-col gap-2 py-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Reading Challenge</span>
                <span className="text-xs text-muted-foreground">每日新文章 · 新聞/知識</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/writing">
            <Card className="h-full transition-colors hover:bg-surface-2">
              <CardContent className="flex flex-col gap-2 py-4">
                <PenLine className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Writing Focus</span>
                <span className="text-xs text-muted-foreground">正式寫作 · 字數帶</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/listening" className="col-span-2">
            <Card className="h-full transition-colors hover:bg-surface-2">
              <CardContent className="flex items-center gap-3 py-4">
                <Headphones className="h-5 w-5 text-primary" />
                <div>
                  <span className="block text-sm font-medium">Listening</span>
                  <span className="text-xs text-muted-foreground">限時聆聽 · 只聽兩次</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </AppShell>
      <BottomNav />
    </>
  );
}
