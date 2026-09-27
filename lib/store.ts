"use client";

// Client state + persistence. localStorage is always the offline cache; when
// Supabase is configured and a user is signed in, writes also sync to the server
// and initial state is hydrated from it. See lib/repo and docs/phase1-supabase.md.

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
import { getRepo } from "./repo";

let idCounter = 0;
function newId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

/** Fire-and-forget server write; failures never block the UI (offline-first). */
function syncSave(fn: (repo: NonNullable<Awaited<ReturnType<typeof getRepo>>>) => Promise<void>) {
  getRepo()
    .then((repo) => (repo ? fn(repo) : undefined))
    .catch(() => {
      /* stays cached in localStorage; will not be lost */
    });
}

interface TrainerState {
  hydrated: boolean;
  serverSynced: boolean;
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
  /** Pull server state into the store (no-op without Supabase + a session). */
  hydrateFromServer: () => Promise<void>;
}

export const useTrainerStore = create<TrainerState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      serverSynced: false,
      attempts: [],
      reviewStates: {},
      sessions: [],
      lastReceipt: null,

      attemptsFor: (itemId) =>
        get().attempts.filter((a) => a.itemId === itemId),

      recordAttempt: ({ itemId, stage, correct, errorTags = [], latencyMs, context }) => {
        const state = get();
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

        const prev = state.reviewStates[itemId] ?? initReviewState(itemId);
        const scheduled = scheduleNext(prev, correct);
        const mastery = evaluateMastery(attempts.filter((a) => a.itemId === itemId));
        const reviewState: ReviewState = {
          ...scheduled,
          masteryCount: mastery.count,
          mastered: mastery.mastered,
        };

        set({
          attempts,
          reviewStates: { ...state.reviewStates, [itemId]: reviewState },
        });
        syncSave((repo) => repo.saveAttempt(attempt, reviewState));
      },

      completeSession: (session, receipt) => {
        set((state) => ({
          sessions: [...state.sessions, session],
          lastReceipt: receipt,
        }));
        syncSave((repo) => repo.saveSession(session, receipt));
      },

      reset: () => {
        set({ attempts: [], reviewStates: {}, sessions: [], lastReceipt: null });
        syncSave((repo) => repo.reset());
      },

      hydrateFromServer: async () => {
        const repo = await getRepo();
        if (!repo) return;
        const remote = await repo.load();
        set({
          attempts: remote.attempts,
          reviewStates: remote.reviewStates,
          sessions: remote.sessions,
          lastReceipt: remote.lastReceipt,
          serverSynced: true,
        });
      },
    }),
    {
      name: "spanish-b2-trainer",
      partialize: (s) => ({
        attempts: s.attempts,
        reviewStates: s.reviewStates,
        sessions: s.sessions,
        lastReceipt: s.lastReceipt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export function newSessionId() {
  return newId("sess");
}
