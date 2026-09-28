"use client";

import * as React from "react";
import { PracticeRunner } from "@/components/practice/PracticeRunner";
import { PracticeLoading } from "@/components/practice/PracticeLoading";
import { grammarItems } from "@/data/items";
import { buildSession } from "@/lib/session-builder";
import { useTrainerStore } from "@/lib/store";
import { useMounted } from "@/lib/use-mounted";

const POOL = grammarItems({ cloze: true }); // recognition + controlled production
const COUNT = 6;
const TITLE = "Grammar Drill";
const SUBTITLE = "認得 → 自己產出 · 一組 6 題";

export default function GrammarPage() {
  const mounted = useMounted();
  // Frozen at mount: due reviews first, then new items up the ladder.
  const [items] = React.useState(() =>
    buildSession({
      pool: POOL,
      reviewStates: useTrainerStore.getState().reviewStates,
      count: COUNT,
      interleaveStages: true, // mix recognition (MC) + production (cloze) each session
    }),
  );

  if (!mounted) return <PracticeLoading title={TITLE} subtitle={SUBTITLE} />;
  return <PracticeRunner items={items} mode="quick" title={TITLE} subtitle={SUBTITLE} />;
}
