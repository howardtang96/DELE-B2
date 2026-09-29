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
  VocabEntry,
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

  // Vocab mined from reading glosses, reviewed on the spaced schedule (local-only).
  vocab: Record<string, VocabEntry>;
  vocabReview: Record<string, ReviewState>;

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

  /** Add reading glosses as vocab cards (dedupe by phrase). */
  addVocab: (glosses: { phrase: string; zh: string }[]) => void;
  /** Self-graded vocab review; advances the spaced schedule. */
  reviewVocab: (phrase: string, correct: boolean) => void;
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
      vocab: {},
      vocabReview: {},

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

      addVocab: (glosses) => {
        const state = get();
        const vocab = { ...state.vocab };
        const vocabReview = { ...state.vocabReview };
        let changed = false;
        for (const g of glosses) {
          const key = g.phrase.trim();
          if (!key || vocab[key]) continue;
          vocab[key] = { phrase: key, zh: g.zh, addedAt: new Date().toISOString() };
          vocabReview[key] = initReviewState(key);
          changed = true;
        }
        if (changed) set({ vocab, vocabReview });
      },

      reviewVocab: (phrase, correct) => {
        const state = get();
        const prev = state.vocabReview[phrase] ?? initReviewState(phrase);
        const scheduled = scheduleNext(prev, correct);
        const masteryCount = correct
          ? Math.min(3, prev.masteryCount + 1)
          : prev.masteryCount;
        set({
          vocabReview: {
            ...state.vocabReview,
            [phrase]: { ...scheduled, masteryCount, mastered: masteryCount >= 3 },
          },
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
        vocab: s.vocab,
        vocabReview: s.vocabReview,
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
