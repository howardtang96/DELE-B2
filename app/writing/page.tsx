"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { ModeHeader } from "@/components/shell/ModeHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { WRITING_ITEMS, WRITING_SEED_FEEDBACK } from "@/data/seed-writing";
import type { FeedbackPoint, Session, WritingPrompt } from "@/lib/types";
import {
  capFeedback,
  checkWritingObjectives,
  countWords,
  wordBandStatus,
} from "@/lib/scoring";
import { fetchWritingFeedback, fetchCorrection } from "@/lib/llm/client";
import { topErrorTags } from "@/lib/errors";
import { useTrainerStore, newSessionId } from "@/lib/store";
import { buildReceipt, type OutcomeLine } from "@/lib/receipt";

const ITEM = WRITING_ITEMS[0];
const PROMPT = ITEM.prompt as WritingPrompt;
const CONTEXT = "writing-free";

const kindLabel: Record<string, string> = {
  grammar: "語法",
  structure: "結構",
  register: "語域",
  vocab: "詞彙",
};

export default function WritingPage() {
  const router = useRouter();
  const recordAttempt = useTrainerStore((s) => s.recordAttempt);
  const completeSession = useTrainerStore((s) => s.completeSession);

  const [text, setText] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const startedAt = React.useRef(new Date().toISOString());

  // Feedback state: seed shows instantly; personalised LLM output swaps in if the
  // server has an API key configured. Always capped at 3 points.
  const [points, setPoints] = React.useState<FeedbackPoint[]>([]);
  const [source, setSource] = React.useState<"seed" | "llm">("seed");
  const [feedbackLoading, setFeedbackLoading] = React.useState(false);

  // Correct mode: a full corrected version, fetched on demand.
  const [corrected, setCorrected] = React.useState<{
    correctedEs: string;
    summaryZh: string;
    source: "seed" | "llm";
  } | null>(null);
  const [correcting, setCorrecting] = React.useState(false);

  const words = countWords(text);
  const band = wordBandStatus(words, PROMPT);
  const check = checkWritingObjectives(text, PROMPT);

  function submit() {
    setSubmitted(true);
    recordAttempt({
      itemId: ITEM.id,
      stage: ITEM.ladderStage,
      correct: check.meetsObjectives,
      errorTags: check.meetsObjectives ? [] : ITEM.tags,
      context: CONTEXT,
    });

    // Instant seed feedback, then try to personalise.
    setPoints(capFeedback(WRITING_SEED_FEEDBACK[ITEM.id] ?? []));
    setSource("seed");
    setFeedbackLoading(true);
    const learnerTags = topErrorTags(useTrainerStore.getState().attempts);
    fetchWritingFeedback(ITEM.id, text, learnerTags)
      .then((res) => {
        if (res && res.points.length > 0) {
          setPoints(capFeedback(res.points));
          setSource(res.source);
        }
      })
      .finally(() => setFeedbackLoading(false));
  }

  function runCorrection() {
    if (correcting) return;
    setCorrecting(true);
    const learnerTags = topErrorTags(useTrainerStore.getState().attempts);
    fetchCorrection(ITEM.id, text, learnerTags)
      .then((res) => {
        if (res) {
          setCorrected({
            correctedEs: res.correctedEs,
            summaryZh: res.summaryZh,
            source: res.source,
          });
        }
      })
      .finally(() => setCorrecting(false));
  }

  function finish() {
    const sessionId = newSessionId();
    const outcome: OutcomeLine = {
      item: ITEM,
      correct: check.meetsObjectives,
      yourAnswer: `${words} 字`,
      correctAnswer: `${PROMPT.minWords}–${PROMPT.maxWords} 字 + 格式齊`,
    };
    const reviewStates = useTrainerStore.getState().reviewStates;
    const session: Session = {
      id: sessionId,
      mode: "writing",
      startedAt: startedAt.current,
      finishedAt: new Date().toISOString(),
      itemIds: [ITEM.id],
      score: { correct: check.meetsObjectives ? 1 : 0, total: 1 },
    };
    completeSession(session, buildReceipt(sessionId, "writing", [outcome], reviewStates));
    router.push("/receipt");
  }

  const bandColor =
    band === "ok" ? "text-success" : band === "over" ? "text-danger" : "text-muted-foreground";

  return (
    <AppShell>
      <ModeHeader
        title="Writing Focus"
        subtitle={PROMPT.taskZh}
        step={submitted ? 2 : 1}
        total={2}
      />

      <Card className="mb-4">
        <CardContent className="pt-5">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="primary">{PROMPT.taskEn}</Badge>
            <Badge variant="neutral">
              {PROMPT.minWords}–{PROMPT.maxWords} words
            </Badge>
          </div>
          <p className="text-sm leading-relaxed">{PROMPT.scenarioEs}</p>
        </CardContent>
      </Card>

      {/* Required elements checklist */}
      <div className="mb-3 space-y-1.5">
        {PROMPT.requiredElements.map((el) => {
          const done = !check.missingElements.some((m) => m.key === el.key);
          return (
            <div key={el.key} className="flex items-center gap-2 text-sm">
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={done ? "text-foreground" : "text-muted-foreground"}>
                {el.labelZh}
              </span>
            </div>
          );
        })}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={submitted}
        rows={9}
        placeholder="喺度用西班牙文寫你嘅正式電郵…"
        className="w-full resize-none rounded-[var(--radius-app)] border border-border bg-surface p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
      />

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className={cn("font-medium tabular-nums", bandColor)}>
          {words} / {PROMPT.maxWords} 字
        </span>
        <span className="text-xs text-muted-foreground">
          {band === "under" && "仲未夠字數"}
          {band === "ok" && "字數啱晒 ✓"}
          {band === "over" && "超出字數"}
        </span>
      </div>

      {!submitted ? (
        <Button
          size="block"
          className="mt-5"
          disabled={words < 20}
          onClick={submit}
        >
          Get feedback
        </Button>
      ) : (
        <>
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">
                重點 (最多三個) · Focus points
              </p>
              {source === "llm" ? (
                <Badge variant="primary">
                  <Sparkles className="h-3.5 w-3.5" /> AI 個人化
                </Badge>
              ) : feedbackLoading ? (
                <span className="text-xs text-muted-foreground">個人化中…</span>
              ) : null}
            </div>
            <div className="space-y-3">
              {points.map((p, i) => (
                <div
                  key={i}
                  className="rounded-[var(--radius-app)] border border-border bg-surface p-4"
                >
                  <Badge variant="warning" className="mb-2">
                    {kindLabel[p.kind] ?? p.kind}
                  </Badge>
                  {p.quoteEs ? (
                    <p className="mb-1 text-sm italic text-muted-foreground">
                      “{p.quoteEs}”
                    </p>
                  ) : null}
                  <p className="text-sm">{p.noteZh}</p>
                  {p.fixEs ? (
                    <p className="mt-1 text-sm text-success">→ {p.fixEs}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Correct mode — full corrected version, on demand */}
          <div className="mt-6">
            {!corrected ? (
              <Button
                variant="outline"
                size="block"
                onClick={runCorrection}
                disabled={correcting}
              >
                <Wand2 className="h-4 w-4" />
                {correcting ? "改正緊…" : "生成改正版本 · Correct mode"}
              </Button>
            ) : (
              <div className="rounded-[var(--radius-app)] border border-border bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">改正版本 · Corrected</p>
                  {corrected.source === "llm" ? (
                    <Badge variant="primary">
                      <Sparkles className="h-3.5 w-3.5" /> AI
                    </Badge>
                  ) : null}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {corrected.correctedEs}
                </p>
                <p className="mt-3 border-t border-border pt-3 text-sm text-muted-foreground">
                  {corrected.summaryZh}
                </p>
              </div>
            )}
          </div>

          <Button size="block" className="mt-5" onClick={finish}>
            See your receipt
          </Button>
        </>
      )}
    </AppShell>
  );
}
