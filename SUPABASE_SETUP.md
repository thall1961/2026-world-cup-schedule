# Email reminders — Supabase + Resend setup

The app collects emails and sends a "kicking off soon" reminder before **every**
match. Architecture:

```
[React form] ──insert──▶ subscriptions (Postgres)
                                 ▲
   pg_cron (every minute) ──▶ send-reminders (Edge Function) ──▶ Resend ──▶ 📧
                                 │
                                 └─ checks: which matches kick off within each
                                    subscriber's lead time and haven't been sent?
```

Supabase is the database + function host + scheduler. Resend is the actual email
sender (Supabase only sends its own auth emails). Both have free tiers.

Everything that talks to the database from the server uses the **secret /
service-role key** and bypasses RLS. The browser only ever uses the browser-safe
key — the **publishable key** (`sb_publishable_...`) in the current Supabase
dashboard, or the legacy **anon** JWT (`eyJ...`) on older projects. Thanks to the
RLS policies in `migrations/0001_init.sql`, that key can *insert* a subscription
but can't read or change anyone's data. Never expose the secret/service_role key
in the browser.

---

## 1. Create the accounts

1. **Supabase** — create a project at https://supabase.com (note the project ref,
   e.g. `abcd1234`).
2. **Resend** — sign up at https://resend.com, verify a sending domain (or use
   their `onboarding@resend.dev` test sender while developing), and create an API
   key.

## 2. Install + link the CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

## 3. Create the schema + seed the fixtures

**Easiest (no psql):** in the Supabase dashboard → **SQL Editor**, paste and run
`migrations/0001_init.sql`, then paste and run `seed.sql`.

**Or via the CLI** against your linked cloud project:

```bash
supabase db push   # applies migrations/0001_init.sql to the remote project

# Seed with the project's DIRECT connection string
# (Project Settings → Database → Connection string → URI). Do NOT use
# `supabase db url` — that points at the LOCAL dev stack, not your cloud project.
psql "postgresql://postgres:[YOUR-DB-PASSWORD]@db.YOUR_PROJECT_REF.supabase.co:5432/postgres" \
  -f supabase/seed.sql
```

Re-run `node scripts/gen-seed.mjs` first if you ever edit the schedule in
`src/data.js`.

## 4. Set the function secrets

```bash
supabase secrets set \
  RESEND_API_KEY="re_xxx" \
  FROM_EMAIL="World Cup 2026 <reminders@yourdomain.com>" \
  SITE_URL="https://your-deployed-site.com" \
  CRON_SECRET="$(openssl rand -hex 24)"
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — don't
set them yourself. Save the `CRON_SECRET` value; you need it in step 6.

## 5. Deploy the Edge Functions

```bash
supabase functions deploy send-reminders
supabase functions deploy unsubscribe
```

(`verify_jwt = false` is already set for both in `supabase/config.toml` — the
sender is protected by `CRON_SECRET` instead, and the unsubscribe link must open
without a login.)

## 6. Schedule the cron sweep

Open `supabase/cron.sql`, replace `<PROJECT_REF>` and `<CRON_SECRET>`, and run it
in the SQL editor. It fires `send-reminders` once a minute. Check runs with:

```sql
select * from cron.job_run_details order by start_time desc limit 20;
```

## 7. Point the frontend at Supabase

```bash
cp .env.example .env.local
# REACT_APP_SUPABASE_URL      → Project Settings → API → Project URL
# REACT_APP_SUPABASE_ANON_KEY → the publishable key (sb_publishable_...),
#                               or the legacy anon JWT (eyJ...). NOT the secret key.
npm start   # restart so CRA picks up the env vars
```

The signup form shows "Demo mode" until these are set.

**Deploying (Vercel/Netlify):** set the same two `REACT_APP_*` vars in the host's
environment-variable settings. CRA inlines `REACT_APP_*` vars **at build time**, so
if you add them after the first deploy you must trigger a fresh build/redeploy —
otherwise the production form stays in "Demo mode". Also set the function's
`SITE_URL` secret to your deployed URL so email links resolve:

```bash
supabase secrets set SITE_URL="https://your-deployed-site.com"
supabase functions deploy send-reminders
```

---

## Testing it end to end

1. Subscribe with your email through the form.
2. Temporarily insert a match a few minutes out so a reminder is due:
   ```sql
   update public.matches set kickoff = now() + interval '4 minutes' where id = 1;
   ```
3. Manually invoke the function (or wait for cron):
   ```bash
   curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-reminders" \
     -H "x-cron-secret: YOUR_CRON_SECRET"
   ```
4. You should get an email; `sent_reminders` gets a row so it won't resend.
5. Restore the real time by re-running `seed.sql`.

## Notes & knobs

- **Timezone:** kickoff times are stored as US Central (CDT, `-05:00`). Change
  `TZ_OFFSET` in `src/data.js`, re-run `gen-seed.mjs`, and re-load `seed.sql`.
- **Lead time** is per subscriber (5/15/30/60 min from the form), capped at 240.
- **Volume:** one email per subscriber per kickoff slot (matches sharing a slot are
  grouped into a single email). That's high by design — you chose all-matches.
  To switch to a daily digest later, change the query window + cron cadence in
  `send-reminders` and you're most of the way there.
