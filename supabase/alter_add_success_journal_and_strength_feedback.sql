alter table public.memos
  add column if not exists success_journal text not null default '',
  add column if not exists strength_feedback text not null default '',
  add column if not exists strength_feedback_person_id uuid;

alter table public.people
  add column if not exists strength_feedback text not null default '';

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

create index if not exists memos_strength_feedback_person_idx
  on public.memos (strength_feedback_person_id)
  where strength_feedback_person_id is not null;

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
