"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { McPrompt } from "@/lib/types";
import { Button } from "@/components/ui/button";

/** One MC item: tap an option → instant correctness + concise why. */
export function McQuestion({
  prompt,
  onAnswered,
  onNext,
  nextLabel = "Next",
}: {
  prompt: McPrompt;
  onAnswered: (chosenIndex: number, correct: boolean) => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  const [chosen, setChosen] = React.useState<number | null>(null);
  const answered = chosen !== null;
  const correct = answered && chosen === prompt.correctIndex;

  function choose(i: number) {
    if (answered) return;
    setChosen(i);
    onAnswered(i, i === prompt.correctIndex);
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
          <p className="mb-1 font-semibold">{correct ? "✓ Correcto" : "✗ Casi"}</p>
          <p>{prompt.whyZh}</p>
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
