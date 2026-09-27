// Persistence abstraction. The store uses a Repo when Supabase is configured and a
// user is signed in; otherwise it stays on localStorage (Phase 0 behaviour).

import type { Attempt, Receipt, ReviewState, Session } from "@/lib/types";

export interface PersistedState {
  attempts: Attempt[];
  reviewStates: Record<string, ReviewState>;
  sessions: Session[];
  lastReceipt: Receipt | null;
}

export interface Repo {
  /** Load all progress for the signed-in user. */
  load(): Promise<PersistedState>;
  /** Persist one attempt and its resulting review state atomically-ish. */
  saveAttempt(attempt: Attempt, reviewState: ReviewState): Promise<void>;
  /** Persist a finished session and its receipt. */
  saveSession(session: Session, receipt: Receipt): Promise<void>;
  /** Delete all progress for the signed-in user. */
  reset(): Promise<void>;
}
