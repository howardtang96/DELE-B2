"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type {
  Attempt,
  LadderStage,
  Receipt,
  ReviewState,
  Session,
  SessionMode,
} from "@/lib/types";
import type { PersistedState, Repo } from "./types";

type DB = SupabaseClient<Database>;

// ---- row <-> domain mapping ----
type AttemptRow = Database["public"]["Tables"]["attempts"]["Row"];
type ReviewRow = Database["public"]["Tables"]["review_state"]["Row"];
type SessionRow = Database["public"]["Tables"]["sessions"]["Row"];

function toAttempt(r: AttemptRow): Attempt {
  return {
    id: r.id,
    itemId: r.item_id,
    stage: r.stage as LadderStage,
    correct: r.correct,
    errorTags: r.error_tags,
    latencyMs: r.latency_ms ?? undefined,
    context: r.context,
    createdAt: r.created_at,
  };
}

function toReviewState(r: ReviewRow): ReviewState {
  return {
    itemId: r.item_id,
    intervalIndex: r.interval_index,
    nextReviewAt: r.next_review_at,
    masteryCount: r.mastery_count,
    mastered: r.mastered,
  };
}

function toSession(r: SessionRow): Session {
  return {
    id: r.id,
    mode: r.mode as SessionMode,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
    itemIds: r.item_ids,
    score: { correct: r.score_correct, total: r.score_total },
  };
}

/** Repo backed by Supabase. RLS scopes every query to the signed-in user. */
export class SupabaseRepo implements Repo {
  constructor(private readonly sb: DB) {}

  async load(): Promise<PersistedState> {
    const [attempts, reviews, sessions, receipt] = await Promise.all([
      this.sb.from("attempts").select("*").order("created_at", { ascending: true }),
      this.sb.from("review_state").select("*"),
      this.sb.from("sessions").select("*").order("finished_at", { ascending: false }),
      this.sb
        .from("receipts")
        .select("data")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const reviewStates: Record<string, ReviewState> = {};
    for (const r of reviews.data ?? []) reviewStates[r.item_id] = toReviewState(r);

    return {
      attempts: (attempts.data ?? []).map(toAttempt),
      reviewStates,
      sessions: (sessions.data ?? []).map(toSession),
      lastReceipt: (receipt.data?.data as Receipt) ?? null,
    };
  }

  async saveAttempt(attempt: Attempt, reviewState: ReviewState): Promise<void> {
    await this.sb.from("attempts").insert({
      id: attempt.id,
      item_id: attempt.itemId,
      stage: attempt.stage,
      correct: attempt.correct,
      error_tags: attempt.errorTags,
      latency_ms: attempt.latencyMs ?? null,
      context: attempt.context,
      created_at: attempt.createdAt,
    });

    await this.sb.from("review_state").upsert(
      {
        item_id: reviewState.itemId,
        interval_index: reviewState.intervalIndex,
        next_review_at: reviewState.nextReviewAt,
        mastery_count: reviewState.masteryCount,
        mastered: reviewState.mastered,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,item_id" },
    );
  }

  async saveSession(session: Session, receipt: Receipt): Promise<void> {
    await this.sb.from("sessions").insert({
      id: session.id,
      mode: session.mode,
      started_at: session.startedAt,
      finished_at: session.finishedAt,
      item_ids: session.itemIds,
      score_correct: session.score.correct,
      score_total: session.score.total,
    });
    await this.sb
      .from("receipts")
      .insert({ session_id: session.id, data: receipt });
  }

  async reset(): Promise<void> {
    // Owner-scoped by RLS; a broad filter matches only this user's rows.
    await this.sb.from("receipts").delete().neq("session_id", "");
    await this.sb.from("sessions").delete().neq("id", "");
    await this.sb.from("attempts").delete().neq("id", "");
    await this.sb.from("review_state").delete().neq("item_id", "");
  }
}
