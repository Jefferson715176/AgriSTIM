-- 1. Expiry checks use the store's day (Asia/Manila), not the server's UTC day.
create or replace function private.today() returns date language sql stable
  as $$ select (now() at time zone 'Asia/Manila')::date $$;

do $$ declare f text; begin
  foreach f in array array['public.record_sale(text,text,jsonb)','public.refresh_alerts()'] loop
    execute replace(pg_get_functiondef(f::regprocedure), 'current_date', 'private.today()');
  end loop;
end $$;

-- 2. Only the database writes the audit log; clients can no longer insert arbitrary entries.
drop policy if exists audit_insert on public.audit_log;
revoke insert on public.audit_log from authenticated;

create or replace function private.audit_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log(user_id,action) values(auth.uid(), left(
    case tg_op when 'INSERT' then 'added' when 'UPDATE' then 'updated' else 'deleted' end
    || ' ' || replace(tg_table_name,'_',' ') || ' '
    || case tg_op when 'DELETE' then old.name else new.name end, 255));
  return null;
end;
$$;

create trigger audit_products after insert or update or delete on public.products
  for each row execute function private.audit_change();
create trigger audit_categories after insert or update or delete on public.categories
  for each row execute function private.audit_change();
create trigger audit_storage_units after insert or update or delete on public.storage_units
  for each row execute function private.audit_change();
