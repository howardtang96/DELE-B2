"use client";

import * as React from "react";
import { PracticeRunner } from "@/components/practice/PracticeRunner";
import { grammarItems } from "@/data/items";
import { buildSession } from "@/lib/session-builder";
import { useTrainerStore } from "@/lib/store";

const POOL = grammarItems({ cloze: true }); // recognition + controlled production
const COUNT = 6;

export default function GrammarPage() {
  // Frozen at mount: due reviews first, then new items up the ladder.
  const [items] = React.useState(() =>
    buildSession({
      pool: POOL,
      reviewStates: useTrainerStore.getState().reviewStates,
      count: COUNT,
    }),
  );

  return (
    <PracticeRunner
      items={items}
      mode="quick"
      title="Grammar Drill"
      subtitle="認得 → 自己產出 · 一組 6 題"
    />
  );
}
