// Supabase configuration gate. The whole Supabase layer is optional: without env
// vars the app runs on local state (Phase 0 behaviour). See docs/phase1-supabase.md.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True only when both public Supabase env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
