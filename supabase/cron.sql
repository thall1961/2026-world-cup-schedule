-- Schedule the reminder sweep to run every minute.
-- Run this in the Supabase SQL editor AFTER deploying the send-reminders function.
-- Replace <PROJECT_REF> and <CRON_SECRET> with your real values.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove any previous schedule with the same name (safe to re-run).
select cron.unschedule('wc26-reminders')
where exists (select 1 from cron.job where jobname = 'wc26-reminders');

select cron.schedule(
  'wc26-reminders',
  '* * * * *',  -- every minute
  $$
  select net.http_post(
    url     := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body    := '{}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);

-- Inspect runs:  select * from cron.job_run_details order by start_time desc limit 20;
-- Unschedule:    select cron.unschedule('wc26-reminders');
