"use client";

import Link from "next/link";
import {
  GraduationCap,
  AlertCircle,
  Lightbulb,
  Coffee,
  ClipboardCheck,
  CalendarClock,
  Home,
} from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";
import { ReceiptSection } from "@/components/receipt/ReceiptSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTrainerStore } from "@/lib/store";

export default function ReceiptPage() {
  const hydrated = useTrainerStore((s) => s.hydrated);
  const receipt = useTrainerStore((s) => s.lastReceipt);

  if (hydrated && !receipt) {
    return (
      <AppShell>
        <ModeHeader title="Learning Receipt" />
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              仲未有已完成嘅練習。完成一節之後就會見到你嘅學習收據。
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

  if (!receipt) {
    return (
      <AppShell>
        <ModeHeader title="Learning Receipt" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ModeHeader title="Learning Receipt" subtitle="呢節你學到啲咩" />

      <div className="mt-2">
        <ReceiptSection n={1} title="What you learned · 學到咩" icon={GraduationCap}>
          <ul className="list-disc space-y-1 pl-4">
            {receipt.learned.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </ReceiptSection>

        <ReceiptSection n={2} title="What was wrong · 錯咗咩" icon={AlertCircle}>
          {receipt.wrong.length === 0 ? (
            <p>全對，冇錯 👏</p>
          ) : (
            <ul className="space-y-2">
              {receipt.wrong.map((w) => (
                <li key={w.itemId} className="rounded-lg bg-surface-2 p-3">
                  <p className="font-medium text-foreground">{w.labelZh}</p>
                  <p>
                    你揀：<span className="text-danger">{w.yourAnswer}</span>
                  </p>
                  <p>
                    正確：<span className="text-success">{w.correctAnswer}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </ReceiptSection>

        <ReceiptSection n={3} title="Why it matters · 點解重要" icon={Lightbulb}>
          {receipt.whyItMatters}
        </ReceiptSection>

        <ReceiptSection n={4} title="Real-life use · 生活應用" icon={Coffee}>
          {receipt.realLifeUse}
        </ReceiptSection>

        <ReceiptSection n={5} title="DELE B2 use · 考試應用" icon={ClipboardCheck}>
          {receipt.deleUse}
        </ReceiptSection>

        <ReceiptSection n={6} title="Next review · 下次複習" icon={CalendarClock}>
          <ul className="space-y-1">
            {receipt.nextReview.map((r) => (
              <li key={r.itemId} className="flex items-center justify-between gap-2">
                <span className="truncate">{r.itemId}</span>
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {r.intervalDays} 日後
                </span>
              </li>
            ))}
          </ul>
        </ReceiptSection>
      </div>

      <Link href="/">
        <Button size="block" className="mt-2">
          <Home className="h-4 w-4" /> 完成 · 返 Today
        </Button>
      </Link>
    </AppShell>
  );
}
