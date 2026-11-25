create or replace function public.stock_in(
  p_product_id integer, p_qty integer, p_batch_no text,
  p_supplier text default null, p_unit_id integer default null, p_expiry date default null
) returns integer language plpgsql security definer set search_path = '' as $$
declare v_id integer;
begin
  if not private.is_active() then raise exception 'Not authorized'; end if;
  if p_qty < 1 or p_qty > 1000000 then raise exception 'Invalid quantity'; end if;
  if not exists(select 1 from public.products where id = p_product_id and not archived) then raise exception 'Product unavailable'; end if;
  if length(coalesce(p_batch_no, '')) > 40 or length(coalesce(p_supplier, '')) > 100 then raise exception 'Input too long'; end if;
  insert into public.batches(product_id,batch_no,supplier,unit_id,qty_received,qty_remaining,expiry)
  values(p_product_id,coalesce(nullif(trim(p_batch_no),''),extract(epoch from now())::bigint::text),
         nullif(trim(p_supplier),''),p_unit_id,p_qty,p_qty,p_expiry) returning id into v_id;
  insert into public.audit_log(user_id,action) values(auth.uid(),'stock-in batch ' || v_id || ' qty ' || p_qty);
  return v_id;
end;
$$;

create or replace function public.stock_out(p_batch_id integer, p_qty integer, p_reason text)
returns integer language plpgsql security definer set search_path = '' as $$
declare v_batch public.batches%rowtype; v_cost numeric(10,2); v_id integer;
begin
  if not private.is_active() then raise exception 'Not authorized'; end if;
  if p_qty < 1 or p_reason not in ('expired','damaged','spoiled') then raise exception 'Invalid loss'; end if;
  select * into v_batch from public.batches where id = p_batch_id for update;
  if not found or p_qty > v_batch.qty_remaining then raise exception 'Insufficient stock'; end if;
  select cost_price into v_cost from public.products where id = v_batch.product_id;
  update public.batches set qty_remaining = qty_remaining - p_qty where id = p_batch_id;
  insert into public.losses(product_id,qty,reason,amount)
  values(v_batch.product_id,p_qty,p_reason,p_qty * v_cost) returning id into v_id;
  insert into public.audit_log(user_id,action) values(auth.uid(),'stock-out batch ' || p_batch_id || ' qty ' || p_qty);
  return v_id;
end;
$$;

create or replace function public.record_sale(p_type text, p_customer text, p_items jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_sale_id integer; v_product public.products%rowtype; v_batch public.batches%rowtype;
  v_item record; v_remaining integer; v_take integer; v_price numeric(10,2); v_total numeric(12,2) := 0;
begin
  if not private.is_active() then raise exception 'Not authorized'; end if;
  if p_type not in ('retail','bulk') or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Invalid sale';
  end if;
  if length(coalesce(p_customer,'')) > 100 then raise exception 'Customer name too long'; end if;
  insert into public.sales(type,customer,total,user_id)
  values(p_type,nullif(trim(p_customer),''),0,auth.uid()) returning id into v_sale_id;
  for v_item in
    select product_id, sum(qty)::integer as qty
    from jsonb_to_recordset(p_items) as x(product_id integer, qty integer)
    group by product_id order by product_id
  loop
    if v_item.product_id is null or v_item.qty < 1 or v_item.qty > 1000000 then raise exception 'Invalid quantity'; end if;
    select * into v_product from public.products where id = v_item.product_id and not archived for update;
    if not found then raise exception 'Product unavailable'; end if;
    v_remaining := v_item.qty;
    for v_batch in
      select * from public.batches
      where product_id = v_item.product_id and qty_remaining > 0 and (expiry is null or expiry >= current_date)
      order by expiry nulls last, id for update
    loop
      exit when v_remaining = 0;
      v_take := least(v_remaining,v_batch.qty_remaining);
      update public.batches set qty_remaining = qty_remaining - v_take where id = v_batch.id;
      v_remaining := v_remaining - v_take;
    end loop;
    if v_remaining > 0 then raise exception 'Insufficient stock for %', v_product.name; end if;
    v_price := case when p_type = 'bulk' and v_product.bulk_price > 0 then v_product.bulk_price else v_product.retail_price end;
    insert into public.sale_items(sale_id,product_id,qty,unit_price,unit_cost)
    values(v_sale_id,v_item.product_id,v_item.qty,v_price,v_product.cost_price);
    v_total := v_total + v_item.qty * v_price;
  end loop;
  update public.sales set total = v_total where id = v_sale_id;
  insert into public.audit_log(user_id,action) values(auth.uid(),'sale #' || v_sale_id || ' ' || p_type);
  return v_sale_id;
end;
$$;

create or replace function public.create_bulk_order(
  p_customer_name text, p_contact_number text, p_pickup_date date,
  p_pickup_time time, p_total_amount numeric, p_notes text
) returns integer language plpgsql security definer set search_path = '' as $$
declare v_id integer;
begin
  if not private.is_active() then raise exception 'Not authorized'; end if;
  if length(trim(coalesce(p_customer_name,''))) not between 1 and 150
     or length(coalesce(p_contact_number,'')) > 30
     or p_total_amount < 0 or p_total_amount > 9999999999.99 then
    raise exception 'Invalid bulk order';
  end if;
  v_id := nextval(pg_get_serial_sequence('public.bulk_orders','order_id'));
  insert into public.bulk_orders(order_id,order_number,customer_name,contact_number,pickup_date,pickup_time,total_amount,notes)
  values(v_id,'BO-' || to_char(now() at time zone 'Asia/Manila','YYYYMMDD') || '-' || lpad(v_id::text,6,'0'),
         trim(p_customer_name),nullif(trim(p_contact_number),''),p_pickup_date,p_pickup_time,p_total_amount,nullif(trim(p_notes),''));
  insert into public.audit_log(user_id,action) values(auth.uid(),'bulk order #' || v_id);
  return v_id;
end;
$$;

create or replace function public.refresh_alerts() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_active() then raise exception 'Not authorized'; end if;
  insert into public.alerts(type,ref_id,message)
  select 'offline',u.id,'No data from ' || u.name || ' for 10+ minutes'
  from public.storage_units u left join public.temp_logs t on t.unit_id = u.id
  group by u.id,u.name having max(t.logged_at) is null or max(t.logged_at) < now() - interval '10 minutes'
  on conflict (type,ref_id) where status <> 'resolved' do nothing;
  insert into public.alerts(type,ref_id,message)
  select 'low_stock',p.id,'Low stock: ' || p.name
  from public.products p left join public.batches b on b.product_id = p.id
  where not p.archived group by p.id,p.name,p.reorder_level
  having coalesce(sum(b.qty_remaining),0) <= p.reorder_level
  on conflict (type,ref_id) where status <> 'resolved' do nothing;
  update public.alerts a set status='resolved',remarks='Stock replenished'
  where a.type='low_stock' and a.status <> 'resolved'
    and not exists (
      select 1 from public.products p left join public.batches b on b.product_id=p.id
      where p.id=a.ref_id and not p.archived group by p.id,p.reorder_level
      having coalesce(sum(b.qty_remaining),0) <= p.reorder_level
    );
  insert into public.alerts(type,ref_id,message)
  select 'expiry',b.id,p.name || ' batch ' || b.batch_no || ' expires ' || b.expiry::text
  from public.batches b join public.products p on p.id=b.product_id
  where b.qty_remaining > 0 and b.expiry <= current_date + 30
  on conflict (type,ref_id) where status <> 'resolved' do nothing;
  update public.alerts a set status='resolved',remarks='Batch used up'
  from public.batches b where a.type='expiry' and a.ref_id=b.id and b.qty_remaining=0 and a.status <> 'resolved';
end;
$$;

revoke all on function public.stock_in(integer,integer,text,text,integer,date) from public;
revoke all on function public.stock_out(integer,integer,text) from public;
revoke all on function public.record_sale(text,text,jsonb) from public;
revoke all on function public.create_bulk_order(text,text,date,time,numeric,text) from public;
revoke all on function public.refresh_alerts() from public;
grant execute on function public.stock_in(integer,integer,text,text,integer,date) to authenticated;
grant execute on function public.stock_out(integer,integer,text) to authenticated;
grant execute on function public.record_sale(text,text,jsonb) to authenticated;
grant execute on function public.create_bulk_order(text,text,date,time,numeric,text) to authenticated;
grant execute on function public.refresh_alerts() to authenticated;
