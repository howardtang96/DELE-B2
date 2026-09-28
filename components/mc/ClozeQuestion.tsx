"use client";

import * as React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClozePrompt } from "@/lib/types";
import { scoreControlled } from "@/lib/scoring";
import { Button } from "@/components/ui/button";
import { CantoneseNote } from "@/components/common/CantoneseNote";

/** Controlled production: learner types the answer; accent-aware scoring. */
export function ClozeQuestion({
  prompt,
  onAnswered,
  onNext,
  nextLabel = "Next",
}: {
  prompt: ClozePrompt;
  onAnswered: (correct: boolean, answerText: string) => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  const [value, setValue] = React.useState("");
  const [result, setResult] = React.useState<{
    correct: boolean;
    accentOnlyMiss: boolean;
  } | null>(null);

  const answered = result !== null;

  function submit() {
    if (answered || !value.trim()) return;
    const r = scoreControlled(value, prompt.accepted);
    setResult(r);
    onAnswered(r.correct, value.trim());
  }

  const parts = prompt.stemEs.split("___");

  return (
    <div>
      <p className="mb-4 text-lg font-medium leading-relaxed">
        {parts[0]}
        <span className="mx-1 rounded bg-surface-2 px-2 py-0.5 text-primary">
          {answered ? value : "____"}
        </span>
        {parts[1] ?? ""}
      </p>

      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        自己打答案 · type the answer
      </p>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        disabled={answered}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="escribe aquí…"
        className={cn(
          "w-full rounded-[var(--radius-app)] border px-4 py-3.5 text-base outline-none focus:ring-2 focus:ring-[var(--color-ring)]",
          !answered && "border-border bg-surface",
          answered && result?.correct && "border-success bg-success-soft text-success",
          answered && !result?.correct && "border-danger bg-danger-soft text-danger",
        )}
      />

      {!answered && prompt.hintZh ? (
        <div className="mt-3">
          <CantoneseNote label="提示 (hint)">{prompt.hintZh}</CantoneseNote>
        </div>
      ) : null}

      {answered ? (
        <div
          className={cn(
            "mt-5 rounded-[var(--radius-app)] p-4 text-sm leading-relaxed",
            result?.correct ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
          )}
        >
          <p className="mb-1 flex items-center gap-1.5 font-semibold">
            {result?.correct ? (
              <>
                <Check className="h-4 w-4" /> Correcto
              </>
            ) : (
              <>
                <X className="h-4 w-4" /> {result?.accentOnlyMiss ? "差少少 · 重音" : "Casi"}
              </>
            )}
          </p>
          {!result?.correct ? (
            <p className="mb-1">
              正確：<span className="font-medium">{prompt.accepted[0]}</span>
              {result?.accentOnlyMiss ? "（你串啱字母，但重音符號差咗）" : ""}
            </p>
          ) : null}
          <p>{prompt.whyZh}</p>
        </div>
      ) : null}

      {answered ? (
        <Button className="mt-5" size="block" onClick={onNext}>
          {nextLabel}
        </Button>
      ) : (
        <Button className="mt-5" size="block" onClick={submit} disabled={!value.trim()}>
          Check
        </Button>
      )}
    </div>
  );
}
