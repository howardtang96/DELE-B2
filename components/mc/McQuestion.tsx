"use client";

import * as React from "react";
import { Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { McPrompt } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { fetchExplain } from "@/lib/llm/client";

/** One MC item: tap an option → instant correctness + concise why. */
export function McQuestion({
  prompt,
  itemId,
  errorTags = [],
  onAnswered,
  onNext,
  nextLabel = "Next",
}: {
  prompt: McPrompt;
  /** When set, an LLM-personalised explanation is fetched (falls back to seed). */
  itemId?: string;
  /** Learner's recurring error tags, so the explanation can target them. */
  errorTags?: string[];
  onAnswered: (chosenIndex: number, correct: boolean) => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  const [chosen, setChosen] = React.useState<number | null>(null);
  const [whyZh, setWhyZh] = React.useState(prompt.whyZh);
  const [whySource, setWhySource] = React.useState<"seed" | "llm">("seed");
  const answered = chosen !== null;
  const correct = answered && chosen === prompt.correctIndex;

  function choose(i: number) {
    if (answered) return;
    setChosen(i);
    onAnswered(i, i === prompt.correctIndex);
    if (itemId) {
      fetchExplain(itemId, i, errorTags).then((res) => {
        if (res && res.source === "llm" && res.whyZh) {
          setWhyZh(res.whyZh);
          setWhySource("llm");
        }
      });
    }
  }

  return (
    <div>
      <p className="mb-5 text-lg font-medium leading-relaxed">{prompt.stemEs}</p>

      <div className="flex flex-col gap-3">
        {prompt.options.map((opt, i) => {
          const isCorrect = i === prompt.correctIndex;
          const isChosen = i === chosen;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={answered}
              className={cn(
                "flex items-center justify-between gap-3 rounded-[var(--radius-app)] border px-4 py-3.5 text-left text-base transition-colors",
                !answered && "border-border bg-surface hover:bg-surface-2",
                answered && isCorrect && "border-success bg-success-soft text-success",
                answered && isChosen && !isCorrect && "border-danger bg-danger-soft text-danger",
                answered && !isCorrect && !isChosen && "border-border bg-surface opacity-60",
              )}
            >
              <span>{opt}</span>
              {answered && isCorrect ? <Check className="h-5 w-5 shrink-0" /> : null}
              {answered && isChosen && !isCorrect ? (
                <X className="h-5 w-5 shrink-0" />
              ) : null}
            </button>
          );
        })}
      </div>

      {answered ? (
        <div
          className={cn(
            "mt-5 rounded-[var(--radius-app)] p-4 text-sm leading-relaxed",
            correct ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
          )}
        >
          <div className="mb-1 flex items-center justify-between">
            <p className="font-semibold">{correct ? "✓ Correcto" : "✗ Casi"}</p>
            {whySource === "llm" ? (
              <span className="inline-flex items-center gap-1 text-xs opacity-80">
                <Sparkles className="h-3 w-3" /> AI 個人化
              </span>
            ) : null}
          </div>
          <p>{whyZh}</p>
        </div>
      ) : null}

      {answered ? (
        <Button className="mt-5" size="block" onClick={onNext}>
          {nextLabel}
        </Button>
      ) : null}
    </div>
  );
}
