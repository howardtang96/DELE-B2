"use client";

import * as React from "react";
import { PracticeRunner } from "@/components/practice/PracticeRunner";
import { PracticeLoading } from "@/components/practice/PracticeLoading";
import { grammarItems } from "@/data/items";
import { buildSession } from "@/lib/session-builder";
import { useTrainerStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";

const POOL = grammarItems({ cloze: false }); // recognition warmup
const COUNT = 2;
const TITLE = "Quick 2";
const SUBTITLE = "快速檢索 · 語法直覺";

export default function QuickPage() {
  const mounted = useMounted();
  // Snapshot the session once at mount so it doesn't reshuffle as answers land.
  const [items] = React.useState(() =>
    buildSession({
      pool: POOL,
      reviewStates: useTrainerStore.getState().reviewStates,
      count: COUNT,
    }),
  );

  if (!mounted) return <PracticeLoading title={TITLE} subtitle={SUBTITLE} />;
  return <PracticeRunner items={items} mode="quick" title={TITLE} subtitle={SUBTITLE} />;
}
