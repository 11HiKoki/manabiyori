alter table public.memos
  add column if not exists supportive_note text not null default '';
