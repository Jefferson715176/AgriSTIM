# AgriSTIM

AgriSTIM is a Vite/React app for **Vercel** with **Supabase PostgreSQL and Auth**. The browser uses Supabase Row Level Security for store data. Vercel Functions hold the service key for sensor ingestion and owner account management. No Docker service is needed for this version.

The database is live in [Jefferson715176's Supabase project](https://supabase.com/dashboard/project/hjcjwkmehxvyrvsypznl). The migrations and converted inventory seed have been applied. The initial owner account is `admin@gmail.com`; its password was supplied separately. The production app is [agristim.vercel.app](https://agristim.vercel.app) in Ken's Vercel workspace.

## Client setup

1. The Supabase setup is complete for the linked project. For a fresh project only, run [the schema migration](supabase/migrations/20261125000000_initial.sql), then [the operation functions](supabase/migrations/20261125000001_operations.sql), then [the audit access migration](supabase/migrations/20261126000000_audit_owner_read.sql), then [the converted inventory data](supabase/seed.sql). Run them in that order. The seed carries products, categories, storage units, batches, losses, the reference price list, alerts, and historical audit entries. Do not rerun the seed against the live project.
2. The initial owner was created in Supabase **Authentication → Users** and activated. For a fresh project only, create an owner account there, then run this SQL with its email:

   ```sql
   update public.profiles
   set role = 'owner', active = true
   where email = 'OWNER_EMAIL_HERE'
   returning id, email, role, active;
   ```

   Confirm one row changed. Staff and additional owners can then be created from the app's Users page.
3. The current Vercel project deploys from [Ken-n7/agristim](https://github.com/Ken-n7/agristim), a separate clone of this repository. Changes to this repository must be copied to that clone to reach production. `vercel.json` selects Vite and `dist`. The project has these environment variables in **Vercel → Project Settings → Environment Variables**:

   | Name | Value | Exposure |
   | --- | --- | --- |
   | `VITE_SUPABASE_URL` | Supabase project URL | Browser |
   | `VITE_SUPABASE_ANON_KEY` | Supabase publishable/anon key | Browser |
   | `SUPABASE_URL` | Same Supabase project URL | Server |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret/service-role key | **Server only** |
   | `SENSOR_KEY` | A new random secret shared with each sensor | **Server only** |

   Deploy or redeploy after adding the variables. Do not put the service-role key or sensor key in a `VITE_` variable.
4. Sign in at the Vercel URL with the owner's **email** and password. Configure any ESP32 sender to POST JSON to `https://YOUR_VERCEL_DOMAIN/api/sensor` with `key`, `device_id`, `temp`, and optional `humidity`. `device_id` must match a storage unit in the app. The sensor key must match Vercel's `SENSOR_KEY`.

New Supabase signups are inactive by default, so an uninvited Auth account cannot read store data. The owner manages active accounts from the app. Consider disabling public signups in Supabase Auth settings if the client wants invitation-only accounts.

## Local development and checks

```sh
npm install
cp .env.example .env
# Fill .env with values from the linked Supabase project.
npm run dev
npm run check
npm run build
```

`npm run dev` serves the browser app. The `/api/sensor` and `/api/users` functions run on Vercel; once a client project is linked, use `vercel dev` to exercise those locally. `npm run check` validates the PostgreSQL migrations, imported data, role rules, transactions, and API input checks with an embedded PostgreSQL engine. Reports in the browser show the latest 1,000 records per data source; larger exports should use Supabase SQL.

## Legacy files

The old PHP app, MySQL dump, and Docker configuration remain in this workspace as a recovery reference. They are ignored by Git and excluded from Vercel uploads; the new app does not use them. The old local containers have been stopped; their data volumes were retained as a backup.
