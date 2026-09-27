"use client";

import { getBrowserSupabase } from "@/lib/supabase/client";
import { SupabaseRepo } from "./supabase";
import type { Repo } from "./types";

export type { Repo, PersistedState } from "./types";

/**
 * Returns a Supabase-backed Repo when Supabase is configured AND a user is signed
 * in; otherwise null, meaning the store stays on localStorage (Phase 0 behaviour).
 */
export async function getRepo(): Promise<Repo | null> {
  const sb = getBrowserSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.auth.getUser();
    if (!data.user) return null;
    return new SupabaseRepo(sb);
  } catch {
    return null;
  }
}
