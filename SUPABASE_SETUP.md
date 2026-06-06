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

Everything that talks to the database from the server uses the **service-role
key** and bypasses RLS. The browser only ever uses the **anon key**, which—thanks
to the RLS policies in `migrations/0001_init.sql`—can *insert* a subscription but
can't read or change anyone's data.

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

Either with the CLI:

```bash
supabase db push                       # applies migrations/0001_init.sql
psql "$(supabase db url)" -f supabase/seed.sql   # loads the 104 matches
```

…or by pasting `migrations/0001_init.sql` then `seed.sql` into the Supabase SQL
editor. Re-run `node scripts/gen-seed.mjs` first if you ever edit the schedule in
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
# fill in REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
npm start   # restart so CRA picks up the env vars
```

The signup form shows "Demo mode" until these are set.

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
