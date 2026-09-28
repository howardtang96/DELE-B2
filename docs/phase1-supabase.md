# Phase 1 — Supabase setup

The Supabase layer is **optional and additive**. With no env vars the app is a
local-only PWA (localStorage). Add the two public env vars and it gains cloud sync
+ auth, with the exact same UI.

---

## ⚡ Quick start (~5 minutes)

1. **Create a project** at [supabase.com](https://supabase.com) → New project.
   Pick the nearest region (e.g. Southeast Asia · Singapore) and set a DB password
   (you won't need it for this app). Wait ~1 min for it to provision.
2. **Run the SQL (one paste):** left sidebar → **SQL Editor** → New query →
   paste the entire contents of [`supabase/setup.sql`](../supabase/setup.sql) → **Run**.
   You should see "Success". (It creates tables + RLS + seed; safe to re-run.)
3. **Allow the login redirect:** **Authentication → URL Configuration** →
   add `http://localhost:3000/account` under *Redirect URLs* → Save.
4. **Copy your keys:** **Project Settings → Data API** (or *API*) → copy
   **Project URL** and the **anon public** key.
5. **Paste into `.env.local`** (already created for you in the project root):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
6. **Restart** `npm run dev`, open the app → tap the account icon (top-right) →
   `/account` → enter your email → click the magic link in your inbox. Done — your
   progress now syncs to Supabase.

> Free-tier note: an unused project pauses after ~7 days idle (data is kept; one
> click to resume). Daily study never triggers it.

---

## What Phase 1 adds

- `skills` + `items` tables (curriculum, read-only to clients).
- `attempts`, `review_state`, `sessions`, `receipts` (per-user, RLS-protected).
- A private `listening-audio` storage bucket (for the upcoming Listening mode).
- Passwordless (magic-link) auth on `/account`.
- Offline-first sync: localStorage is always the cache; the server is the source of
  truth once signed in. Writes are fire-and-forget; the UI never blocks.

**The engine does not change.** Scheduling, scoring, mastery, and the ladder stay in
`lib/`. The database stores *state*, never *rules*.

## Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run, in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/seed.sql`
3. Copy `.env.example` → `.env.local` and set:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   ```
4. In Supabase Auth settings, add `http://localhost:3000/account` (and your prod
   URL) as a redirect URL.
5. `npm run dev`, open `/account`, sign in with the magic link.

## How it wires together

- `lib/supabase/config.ts` — `isSupabaseConfigured()` gate.
- `lib/supabase/client.ts` / `server.ts` — browser + server clients (null when
  unconfigured).
- `middleware.ts` — refreshes the auth session per request (no-op when
  unconfigured).
- `lib/repo/*` — a `Repo` interface with a Supabase implementation; `getRepo()`
  returns it only when configured **and** a user is signed in.
- `lib/store.ts` — records to localStorage immediately, then `syncSave()` mirrors
  the write to the repo; `hydrateFromServer()` pulls server state on load.

## Security notes

- The anon key is meant to be public; RLS is what protects data. Every progress
  table is owner-scoped to `auth.uid()`.
- Never expose a service-role key to the client. It is not used by this app.
- Regenerate `lib/supabase/database.types.ts` with the Supabase CLI once the project
  exists (`supabase gen types typescript`), then keep it in sync.
