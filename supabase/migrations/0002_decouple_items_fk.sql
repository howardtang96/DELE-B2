-- Code owns the curriculum (data/*.ts); the DB `items` table is not the content
-- source, and it only ever held the original small seed. Drop the item_id foreign
-- keys so progress for code-defined items (grammar topics, cloze, gap-fill, …) can
-- sync to Supabase without violating referential integrity.
alter table public.attempts drop constraint if exists attempts_item_id_fkey;
alter table public.review_state drop constraint if exists review_state_item_id_fkey;
