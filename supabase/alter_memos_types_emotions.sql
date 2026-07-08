-- Migration for an existing Supabase database.
-- Converts memos.type -> memos.types and memos.emotion -> memos.emotions
-- while preserving current test data.

alter table public.memos
  add column if not exists types public.memo_type[];

alter table public.memos
  add column if not exists emotions text[];

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'memos'
      and column_name = 'type'
  ) then
    execute 'update public.memos
      set types = array["type"]::public.memo_type[]
      where types is null or coalesce(array_length(types, 1), 0) = 0';
  else
    update public.memos
    set types = array['insight'::public.memo_type]
    where types is null or coalesce(array_length(types, 1), 0) = 0;
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'memos'
      and column_name = 'emotion'
  ) then
    execute 'update public.memos
      set emotions =
        case
          when emotion is null or length(btrim(emotion)) = 0 then ''{}''::text[]
          else array[emotion]
        end
      where emotions is null';
  else
    update public.memos
    set emotions = '{}'::text[]
    where emotions is null;
  end if;
end;
$$;

alter table public.memos
  alter column types set not null,
  alter column types drop default,
  alter column emotions set default '{}'::text[],
  alter column emotions set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'memos_types_not_empty'
      and conrelid = 'public.memos'::regclass
  ) then
    alter table public.memos
      add constraint memos_types_not_empty
      check (coalesce(array_length(types, 1), 0) > 0);
  end if;
end;
$$;

drop index if exists public.memos_user_type_idx;

create index if not exists memos_types_gin_idx
  on public.memos using gin (types);

alter table public.memos
  drop column if exists type,
  drop column if exists emotion;
