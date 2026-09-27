"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";
import type { Database } from "./database.types";

/** Browser Supabase client, or null when Supabase is not configured. */
export function getBrowserSupabase() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient<Database>(SUPABASE_URL as string, SUPABASE_ANON_KEY as string);
}
