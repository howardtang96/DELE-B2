"use client";

// Local state for Phase 0 (no backend). Zustand + localStorage persistence.
// Records attempts, review scheduling, sessions, and the latest receipt.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Attempt,
  LadderStage,
  Receipt,
  ReviewState,
  Session,
} from "./types";
import { evaluateMastery } from "./mastery";
import { initReviewState, scheduleNext } from "./scheduler";

let idCounter = 0;
function newId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

interface TrainerState {
  hydrated: boolean;
  attempts: Attempt[];
  reviewStates: Record<string, ReviewState>;
  sessions: Session[];
  lastReceipt: Receipt | null;

  recordAttempt: (input: {
    itemId: string;
    stage: LadderStage;
    correct: boolean;
    errorTags?: string[];
    latencyMs?: number;
    context: string;
  }) => void;

  completeSession: (session: Session, receipt: Receipt) => void;
  reset: () => void;
  attemptsFor: (itemId: string) => Attempt[];
}

export const useTrainerStore = create<TrainerState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      attempts: [],
      reviewStates: {},
      sessions: [],
      lastReceipt: null,

      attemptsFor: (itemId) =>
        get().attempts.filter((a) => a.itemId === itemId),

      recordAttempt: ({ itemId, stage, correct, errorTags = [], latencyMs, context }) =>
        set((state) => {
          const attempt: Attempt = {
            id: newId("att"),
            itemId,
            stage,
            correct,
            errorTags,
            latencyMs,
            context,
            createdAt: new Date().toISOString(),
          };
          const attempts = [...state.attempts, attempt];

          const prev =
            state.reviewStates[itemId] ?? initReviewState(itemId);
          const scheduled = scheduleNext(prev, correct);
          const mastery = evaluateMastery(
            attempts.filter((a) => a.itemId === itemId),
          );

          const reviewStates: Record<string, ReviewState> = {
            ...state.reviewStates,
            [itemId]: {
              ...scheduled,
              masteryCount: mastery.count,
              mastered: mastery.mastered,
            },
          };

          return { attempts, reviewStates };
        }),

      completeSession: (session, receipt) =>
        set((state) => ({
          sessions: [...state.sessions, session],
          lastReceipt: receipt,
        })),

      reset: () =>
        set({
          attempts: [],
          reviewStates: {},
          sessions: [],
          lastReceipt: null,
        }),
    }),
    {
      name: "spanish-b2-trainer",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export function newSessionId() {
  return newId("sess");
}
