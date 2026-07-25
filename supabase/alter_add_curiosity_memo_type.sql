do $$
begin
  alter type public.memo_type add value if not exists 'curiosity';
exception
  when duplicate_object then null;
end;
$$;
