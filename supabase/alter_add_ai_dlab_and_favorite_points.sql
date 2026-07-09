alter table public.memos
  add column if not exists ai_todo text not null default '',
  add column if not exists dlab_reading text not null default '',
  add column if not exists dlab_video text not null default '';

alter table public.people
  add column if not exists favorite_points text not null default '';
