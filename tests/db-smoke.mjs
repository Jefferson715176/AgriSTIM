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
await db.exec(`reset role; insert into auth.users(id,email) values('00000000-0000-4000-8000-000000000002','staff@example.com'); update public.profiles set active=true where email='staff@example.com'; set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002'; set role authenticated;`)
const staffProducts = await count('products')
if (staffProducts < 10) throw new Error('active staff cannot read inventory')
if (await count('audit_log') !== 0) throw new Error('staff can read owner-only audit log')
await db.query(`update public.products set retail_price=1 where id=1`)
await db.exec(`reset role;`)
const price = (await db.query(`select retail_price from public.products where id=1`)).rows[0].retail_price
if (Number(price) === 1) throw new Error('staff can alter owner-only products')
await db.exec(`set role authenticated;`)
await db.exec(`reset role; set request.jwt.claim.sub = '00000000-0000-4000-8000-000000000003'; set role authenticated;`)
if (await count('products') !== 0) throw new Error('users without active profiles can read inventory')
console.log('Supabase migrations, legacy seed, RLS bootstrap, and stock/sale operations passed')
