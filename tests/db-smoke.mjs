import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'

const db = new PGlite()
const migration = async (name) => db.exec(await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'))

await db.exec(`
  create role authenticated;
  create role anon;
  create schema auth;
  create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$;
`)
await migration('20261125000000_initial.sql')
await migration('20261125000001_operations.sql')
await migration('20261126000000_audit_owner_read.sql')
await migration('20261127000000_manila_dates_audit_trigger.sql')
await migration('20261128000000_void_orders_cron.sql')
await db.exec(await readFile(new URL('../supabase/seed.sql', import.meta.url), 'utf8'))

const count = async (table) => Number((await db.query(`select count(*)::integer as n from public.${table}`)).rows[0].n)
for (const [table, minimum] of Object.entries({ categories: 7, products: 10, price_list: 250, alerts: 13, audit_log: 40 })) {
  if (await count(table) < minimum) throw new Error(`${table} data was not imported`)
}
await db.exec(`insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000001','owner@example.com');`)
const profile = (await db.query(`select active,role from public.profiles where email='owner@example.com'`)).rows[0]
if (profile.active || profile.role !== 'staff') throw new Error('new Auth users must start inactive')
await db.exec(`update public.profiles set active=true, role='owner' where email='owner@example.com';`)
await db.exec(`set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001'; set role authenticated;`)
const batch = (await db.query(`select public.stock_in(1,5,'TEST',null,null,null) as id`)).rows[0].id
const sale = (await db.query(`select public.record_sale('retail',null,'[{"product_id":1,"qty":2}]'::jsonb) as id`)).rows[0].id
await db.query(`select public.stock_out($1,1,'damaged')`, [batch])
await db.query(`select public.refresh_alerts()`)
const remaining = (await db.query(`select qty_remaining from public.batches where id=$1`, [batch])).rows[0].qty_remaining
if (remaining !== 2 || !sale) throw new Error('stock and sale operations failed')
await db.query(`update public.products set reorder_level=reorder_level where id=1`)
if (!(await db.query(`select 1 from public.audit_log where action like 'updated products %' and user_id='00000000-0000-4000-8000-000000000001'`)).rows.length) throw new Error('product changes are not audited')
const defs = (await db.query(`select string_agg(pg_get_functiondef(p.oid),'') as d from pg_proc p where proname in ('record_sale','refresh_alerts')`)).rows[0].d
if (defs.includes('current_date') || !defs.includes('private.today()')) throw new Error('expiry checks do not use Manila date')

// Void returns stock to the batches the sale drew from, once, owner only.
const fails = async (sql, params) => { try { await db.query(sql, params); return false } catch { return true } }
const qty = async id => (await db.query(`select qty_remaining from public.batches where id=$1`, [id])).rows[0].qty_remaining
const vb = (await db.query(`select public.stock_in(2,10,'VOID',null,null,null) as id`)).rows[0].id
const vs = (await db.query(`select public.record_sale('retail',null,'[{"product_id":2,"qty":4}]'::jsonb) as id`)).rows[0].id
if (await qty(vb) !== 6) throw new Error('sale did not draw from the new batch')
if (!await fails(`select public.void_sale($1,'')`, [vs])) throw new Error('void without reason allowed')
await db.query(`select public.void_sale($1,'wrong item')`, [vs])
if (await qty(vb) !== 10) throw new Error('void did not return stock')
if (!await fails(`select public.void_sale($1,'again')`, [vs])) throw new Error('double void allowed')

// Pickup orders reserve stock, block overselling, and complete at the quoted price.
const ob = (await db.query(`select public.stock_in(3,5,'ORD',null,null,null) as id`)).rows[0].id
if (!await fails(`select public.create_bulk_order('Big Farm',null,null,null,'[{"product_id":3,"qty":999}]'::jsonb,null)`)) throw new Error('order over stock allowed')
const order = (await db.query(`select public.create_bulk_order('Big Farm',null,null,null,'[{"product_id":3,"qty":3}]'::jsonb,null) as id`)).rows[0].id
const free = Number((await db.query(`select coalesce(sum(qty_remaining),0) as n from public.batches where product_id=3 and qty_remaining>0 and (expiry is null or expiry >= private.today())`)).rows[0].n) - 3
if (!await fails(`select public.record_sale('retail',null,$1::jsonb)`, [JSON.stringify([{ product_id: 3, qty: free + 1 }])])) throw new Error('reserved stock was sold to walk-in')
if (!await fails(`update public.bulk_orders set order_status='Completed' where order_id=$1`, [order])) throw new Error('itemised order completed without a sale')
await db.exec(`reset role; update public.products set bulk_price=bulk_price+50 where id=3; set role authenticated;`)
const osale = (await db.query(`select public.complete_bulk_order($1) as id`, [order])).rows[0].id
const o = (await db.query(`select o.order_status,o.sale_id,o.total_amount,s.total from public.bulk_orders o join public.sales s on s.id=o.sale_id where o.order_id=$1`, [order])).rows[0]
if (o.order_status !== 'Completed' || o.sale_id !== osale || Number(o.total) !== Number(o.total_amount)) throw new Error('completed order did not record its sale at the quoted price')
if (!await fails(`update public.bulk_orders set order_status='Pending' where order_id=$1`, [order])) throw new Error('closed order reopened')
await db.exec(`reset role; select private.refresh_alerts_job(); set role authenticated;`)
await db.exec(`reset role; insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000002','staff@example.com'); update public.profiles set active=true where email='staff@example.com'; set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002'; set role authenticated;`)
const staffProducts = await count('products')
if (staffProducts < 10) throw new Error('active staff cannot read inventory')
if (await count('audit_log') !== 0) throw new Error('staff can read owner-only audit log')
await db.query(`update public.products set retail_price=1 where id=1`)
let forged = false
try { await db.query(`insert into public.audit_log(user_id,action) values('00000000-0000-4000-8000-000000000002','fake')`); forged = true } catch {}
if (forged) throw new Error('clients can forge audit entries')
await db.exec(`reset role;`)
const price = (await db.query(`select retail_price from public.products where id=1`)).rows[0].retail_price
if (Number(price) === 1) throw new Error('staff can alter owner-only products')
await db.exec(`set role authenticated;`)
await db.exec(`reset role; set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003'; set role authenticated;`)
if (await count('products') !== 0) throw new Error('users without active profiles can read inventory')
console.log('Supabase migrations, legacy seed, RLS bootstrap, and stock/sale operations passed')
