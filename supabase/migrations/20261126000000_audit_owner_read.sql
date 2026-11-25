-- Staff cannot read the owner-only audit view through the REST API.
drop policy if exists read_active on public.audit_log;
create policy audit_owner_read on public.audit_log for select to authenticated
  using (private.is_owner());
