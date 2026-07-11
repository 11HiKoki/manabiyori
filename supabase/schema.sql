-- Supabase schema for the Kizuki Memo app.
-- This file only prepares the database layer. React Native connection code is not included yet.

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.memo_field as enum ('work', 'private');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.memo_type as enum ('insight', 'learning', 'failure', 'lesson');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.memo_visibility as enum ('private', 'friends', 'public');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.reflection_period_type as enum ('week', 'month', 'year');
exception
  when duplicate_object then null;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.memos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  field public.memo_field not null,
  types public.memo_type[] not null,
  title text not null,
  event text not null default '',
  insight text not null default '',
  lesson text not null default '',
  supportive_note text not null default '',
  success_journal text not null default '',
  strength_feedback text not null default '',
  strength_feedback_person_id uuid,
  next_action text not null default '',
  next_action_done boolean not null default false,
  hesitation text not null default '',
  compared_options text not null default '',
  rejected_reason text not null default '',
  decision_criteria text not null default '',
  ai_todo text not null default '',
  dlab_reading text not null default '',
  dlab_video text not null default '',
  value_item text not null default '',
  value_reflection text not null default '',
  emotions text[] not null default '{}'::text[],
  occurred_at date not null default current_date,
  visibility public.memo_visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memos_title_not_blank check (length(btrim(title)) > 0),
  constraint memos_types_not_empty check (coalesce(array_length(types, 1), 0) > 0)
);

create index if not exists memos_user_occurred_at_idx
  on public.memos (user_id, occurred_at desc);

create index if not exists memos_types_gin_idx
  on public.memos using gin (types);

create index if not exists memos_user_visibility_idx
  on public.memos (user_id, visibility);

create index if not exists memos_strength_feedback_person_idx
  on public.memos (strength_feedback_person_id)
  where strength_feedback_person_id is not null;

drop trigger if exists set_memos_updated_at on public.memos;
create trigger set_memos_updated_at
before update on public.memos
for each row
execute function public.set_updated_at();

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint tags_name_not_blank check (length(btrim(name)) > 0)
);

create unique index if not exists tags_user_name_unique_idx
  on public.tags (user_id, lower(name));

create index if not exists tags_user_created_at_idx
  on public.tags (user_id, created_at desc);

create table if not exists public.memo_tags (
  memo_id uuid not null references public.memos(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (memo_id, tag_id)
);

create index if not exists memo_tags_tag_id_idx
  on public.memo_tags (tag_id);

create table if not exists public.reflection_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  period_type public.reflection_period_type not null,
  period_start date not null,
  period_end date not null,
  summary text not null default '',
  next_theme text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reflection_notes_period_order check (period_start <= period_end)
);

create unique index if not exists reflection_notes_user_period_unique_idx
  on public.reflection_notes (user_id, period_type, period_start, period_end);

create index if not exists reflection_notes_user_period_start_idx
  on public.reflection_notes (user_id, period_start desc);

drop trigger if exists set_reflection_notes_updated_at on public.reflection_notes;
create trigger set_reflection_notes_updated_at
before update on public.reflection_notes
for each row
execute function public.set_updated_at();

create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  nickname text not null default '',
  relationship text not null default '',
  met_at date,
  met_place text not null default '',
  hobbies text not null default '',
  likes text not null default '',
  favorite_points text not null default '',
  strength_feedback text not null default '',
  dislikes text not null default '',
  values_note text not null default '',
  next_topic text not null default '',
  memo text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint people_name_not_blank check (length(btrim(name)) > 0)
);

create index if not exists people_user_name_idx
  on public.people (user_id, name);

create index if not exists people_user_created_at_idx
  on public.people (user_id, created_at desc);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'memos_strength_feedback_person_id_fkey'
      and conrelid = 'public.memos'::regclass
  ) then
    alter table public.memos
      add constraint memos_strength_feedback_person_id_fkey
      foreign key (strength_feedback_person_id)
      references public.people(id)
      on delete set null;
  end if;
end;
$$;

drop trigger if exists set_people_updated_at on public.people;
create trigger set_people_updated_at
before update on public.people
for each row
execute function public.set_updated_at();

create table if not exists public.conversation_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  talked_at date not null default current_date,
  place text not null default '',
  topics text not null default '',
  impression text not null default '',
  next_question text not null default '',
  promise_note text not null default '',
  follow_up text not null default '',
  follow_up_done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversation_notes_user_talked_at_idx
  on public.conversation_notes (user_id, talked_at desc);

create index if not exists conversation_notes_person_talked_at_idx
  on public.conversation_notes (person_id, talked_at desc);

drop trigger if exists set_conversation_notes_updated_at on public.conversation_notes;
create trigger set_conversation_notes_updated_at
before update on public.conversation_notes
for each row
execute function public.set_updated_at();

alter table public.memos enable row level security;
alter table public.tags enable row level security;
alter table public.memo_tags enable row level security;
alter table public.reflection_notes enable row level security;
alter table public.people enable row level security;
alter table public.conversation_notes enable row level security;

drop policy if exists "Users can select own memos" on public.memos;
create policy "Users can select own memos"
on public.memos
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own memos" on public.memos;
create policy "Users can insert own memos"
on public.memos
for insert
to authenticated
with check (
  auth.uid() = user_id
  and (
    strength_feedback_person_id is null
    or exists (
      select 1
      from public.people
      where people.id = memos.strength_feedback_person_id
        and people.user_id = auth.uid()
    )
  )
);

drop policy if exists "Users can update own memos" on public.memos;
create policy "Users can update own memos"
on public.memos
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and (
    strength_feedback_person_id is null
    or exists (
      select 1
      from public.people
      where people.id = memos.strength_feedback_person_id
        and people.user_id = auth.uid()
    )
  )
);

drop policy if exists "Users can delete own memos" on public.memos;
create policy "Users can delete own memos"
on public.memos
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can select own tags" on public.tags;
create policy "Users can select own tags"
on public.tags
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own tags" on public.tags;
create policy "Users can insert own tags"
on public.tags
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own tags" on public.tags;
create policy "Users can update own tags"
on public.tags
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own tags" on public.tags;
create policy "Users can delete own tags"
on public.tags
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can select own memo tags" on public.memo_tags;
create policy "Users can select own memo tags"
on public.memo_tags
for select
to authenticated
using (
  exists (
    select 1
    from public.memos
    where memos.id = memo_tags.memo_id
      and memos.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.tags
    where tags.id = memo_tags.tag_id
      and tags.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert own memo tags" on public.memo_tags;
create policy "Users can insert own memo tags"
on public.memo_tags
for insert
to authenticated
with check (
  exists (
    select 1
    from public.memos
    where memos.id = memo_tags.memo_id
      and memos.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.tags
    where tags.id = memo_tags.tag_id
      and tags.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own memo tags" on public.memo_tags;
create policy "Users can update own memo tags"
on public.memo_tags
for update
to authenticated
using (
  exists (
    select 1
    from public.memos
    where memos.id = memo_tags.memo_id
      and memos.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.tags
    where tags.id = memo_tags.tag_id
      and tags.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.memos
    where memos.id = memo_tags.memo_id
      and memos.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.tags
    where tags.id = memo_tags.tag_id
      and tags.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete own memo tags" on public.memo_tags;
create policy "Users can delete own memo tags"
on public.memo_tags
for delete
to authenticated
using (
  exists (
    select 1
    from public.memos
    where memos.id = memo_tags.memo_id
      and memos.user_id = auth.uid()
  )
  and exists (
    select 1
    from public.tags
    where tags.id = memo_tags.tag_id
      and tags.user_id = auth.uid()
  )
);

drop policy if exists "Users can select own reflection notes" on public.reflection_notes;
create policy "Users can select own reflection notes"
on public.reflection_notes
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own reflection notes" on public.reflection_notes;
create policy "Users can insert own reflection notes"
on public.reflection_notes
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own reflection notes" on public.reflection_notes;
create policy "Users can update own reflection notes"
on public.reflection_notes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own reflection notes" on public.reflection_notes;
create policy "Users can delete own reflection notes"
on public.reflection_notes
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can select own people" on public.people;
create policy "Users can select own people"
on public.people
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own people" on public.people;
create policy "Users can insert own people"
on public.people
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own people" on public.people;
create policy "Users can update own people"
on public.people
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own people" on public.people;
create policy "Users can delete own people"
on public.people
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can select own conversation notes" on public.conversation_notes;
create policy "Users can select own conversation notes"
on public.conversation_notes
for select
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.people
    where people.id = conversation_notes.person_id
      and people.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert own conversation notes" on public.conversation_notes;
create policy "Users can insert own conversation notes"
on public.conversation_notes
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.people
    where people.id = conversation_notes.person_id
      and people.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own conversation notes" on public.conversation_notes;
create policy "Users can update own conversation notes"
on public.conversation_notes
for update
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.people
    where people.id = conversation_notes.person_id
      and people.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.people
    where people.id = conversation_notes.person_id
      and people.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete own conversation notes" on public.conversation_notes;
create policy "Users can delete own conversation notes"
on public.conversation_notes
for delete
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.people
    where people.id = conversation_notes.person_id
      and people.user_id = auth.uid()
  )
);

grant usage on schema public to authenticated;
grant usage on type public.memo_field to authenticated;
grant usage on type public.memo_type to authenticated;
grant usage on type public.memo_visibility to authenticated;
grant usage on type public.reflection_period_type to authenticated;
grant select, insert, update, delete on public.memos to authenticated;
grant select, insert, update, delete on public.tags to authenticated;
grant select, insert, update, delete on public.memo_tags to authenticated;
grant select, insert, update, delete on public.reflection_notes to authenticated;
grant select, insert, update, delete on public.people to authenticated;
grant select, insert, update, delete on public.conversation_notes to authenticated;
