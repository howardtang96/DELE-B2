import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";
import type { Database } from "./database.types";

/**
 * Server Supabase client (App Router). Returns null when not configured.
 * Reads/writes auth cookies so RLS applies to the signed-in user.
 */
export async function getServerSupabase() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = await cookies();

  return createServerClient<Database>(
    SUPABASE_URL as string,
    SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // set from a Server Component — safe to ignore when middleware refreshes.
          }
        },
      },
    },
  );
}
