-- Spanish B2 Trainer — Phase 1 schema.
-- Code owns the syllabus: `skills` and `items` are seeded and read-only to clients.
-- Per-user progress tables are protected by Row-Level Security scoped to auth.uid().

-- ---------- Curriculum (read-only to clients) ----------
create table if not exists public.skills (
  id         text primary key,
  component  text not null check (component in ('reading','listening','writing','grammar')),
  label_en   text not null,
  label_zh   text not null
);

create table if not exists public.items (
  id           text primary key,
  skill_id     text not null references public.skills(id),
  type         text not null check (type in ('mc','cloze','transform','reading','listening','writing')),
  ladder_stage smallint not null check (ladder_stage between 1 and 4),
  difficulty   smallint not null check (difficulty between 1 and 3),
  tags         text[] not null default '{}',
  prompt       jsonb not null
);

-- ---------- Per-user progress ----------
create table if not exists public.attempts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_id    text not null, -- code owns the curriculum; no FK to items (see 0002)
  stage      smallint not null check (stage between 1 and 4),
  correct    boolean not null,
  error_tags text[] not null default '{}',
  latency_ms integer,
  context    text not null,
  created_at timestamptz not null default now()
);
create index if not exists attempts_user_item_idx on public.attempts (user_id, item_id);

create table if not exists public.review_state (
  user_id        uuid not null default auth.uid() references auth.users(id) on delete cascade,
  item_id        text not null, -- code owns the curriculum; no FK to items (see 0002)
  interval_index smallint not null default 0 check (interval_index between 0 and 4),
  next_review_at timestamptz not null,
  mastery_count  smallint not null default 0 check (mastery_count between 0 and 3),
  mastered       boolean not null default false,
  updated_at     timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index if not exists review_state_due_idx on public.review_state (user_id, next_review_at);

create table if not exists public.sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  mode          text not null check (mode in ('quick','reading','writing','listening','sprint')),
  started_at    timestamptz not null,
  finished_at   timestamptz not null,
  item_ids      text[] not null default '{}',
  score_correct smallint not null,
  score_total   smallint not null
);
create index if not exists sessions_user_idx on public.sessions (user_id, finished_at desc);

create table if not exists public.receipts (
  session_id uuid primary key references public.sessions(id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  data       jsonb not null,
  created_at timestamptz not null default now()
);

-- ---------- RLS ----------
alter table public.skills       enable row level security;
alter table public.items        enable row level security;
alter table public.attempts     enable row level security;
alter table public.review_state enable row level security;
alter table public.sessions     enable row level security;
alter table public.receipts     enable row level security;

-- Curriculum: any authenticated user can read; nobody writes via the API.
drop policy if exists "skills readable" on public.skills;
create policy "skills readable" on public.skills for select to authenticated using (true);
drop policy if exists "items readable" on public.items;
create policy "items readable" on public.items for select to authenticated using (true);

-- Progress tables: owner-only for all operations.
drop policy if exists "attempts owner" on public.attempts;
create policy "attempts owner" on public.attempts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "review_state owner" on public.review_state;
create policy "review_state owner" on public.review_state
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "sessions owner" on public.sessions;
create policy "sessions owner" on public.sessions
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "receipts owner" on public.receipts;
create policy "receipts owner" on public.receipts
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- Storage: listening audio ----------
insert into storage.buckets (id, name, public)
values ('listening-audio', 'listening-audio', false)
on conflict (id) do nothing;

drop policy if exists "listening audio readable by authenticated" on storage.objects;
create policy "listening audio readable by authenticated" on storage.objects
  for select to authenticated using (bucket_id = 'listening-audio');
