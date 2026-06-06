// Supabase Edge Function — invoked every minute by pg_cron.
// Finds matches kicking off within each subscriber's lead time and emails them
// via Resend, deduping through the sent_reminders table.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") ?? "World Cup 2026 <reminders@example.com>";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://example.com";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

const STAGE_LABELS: Record<string, string> = {
  group: "Group stage",
  r32: "Round of 32",
  r16: "Round of 16",
  qf: "Quarter-final",
  sf: "Semi-final",
  third: "Third place play-off",
  final: "Final",
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

function matchTitle(m: any): string {
  if (m.home && m.away) return `${m.home} vs ${m.away}`;
  return m.group_name ? `Group ${m.group_name} match` : STAGE_LABELS[m.stage] ?? "Match";
}

function matchTag(m: any): string {
  return m.group_name ? `Group ${m.group_name}` : STAGE_LABELS[m.stage] ?? m.stage;
}

function kickoffLabel(iso: string): string {
  // Render in US Central, matching the published schedule.
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

function buildEmail(sub: any, matches: any[]): { subject: string; html: string; text: string } {
  const lead = sub.minutes_before;
  const subject =
    matches.length === 1
      ? `⚽ ${matchTitle(matches[0])} kicks off in ${lead} min`
      : `⚽ ${matches.length} World Cup matches starting soon`;

  const rows = matches
    .map(
      (m) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #1d2336;">
          <div style="font:700 17px/1.2 Arial,sans-serif;color:#f3f4ef;">${matchTitle(m)}</div>
          <div style="font:400 13px/1.4 Arial,sans-serif;color:#9aa0b4;margin-top:4px;">
            ${matchTag(m)} &middot; ${kickoffLabel(m.kickoff)}
          </div>
        </td>
      </tr>`
    )
    .join("");

  const unsub = `${SUPABASE_URL}/functions/v1/unsubscribe?token=${sub.unsubscribe_token}`;

  const html = `
  <div style="background:#06070d;padding:32px 0;">
    <div style="max-width:520px;margin:0 auto;background:#111524;border:1px solid #1d2336;border-radius:16px;overflow:hidden;">
      <div style="padding:24px 28px 8px;">
        <div style="font:700 12px/1 'Space Mono',monospace;letter-spacing:3px;color:#c6ff3a;text-transform:uppercase;">Kickoff alert</div>
        <h1 style="font:400 30px/0.95 Arial,sans-serif;color:#f3f4ef;text-transform:uppercase;margin:10px 0 0;">
          Starting in ~${lead} min
        </h1>
      </div>
      <div style="padding:8px 28px 4px;">
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
      </div>
      <div style="padding:18px 28px 26px;">
        <a href="${SITE_URL}" style="display:inline-block;background:#c6ff3a;color:#07090f;font:800 15px/1 Arial,sans-serif;text-decoration:none;padding:13px 22px;border-radius:10px;">
          View the full schedule →
        </a>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #1d2336;font:400 12px/1.5 Arial,sans-serif;color:#5a6076;">
        You’re getting this because you signed up for World Cup 2026 reminders.
        <a href="${unsub}" style="color:#9aa0b4;">Unsubscribe</a>.
      </div>
    </div>
  </div>`;

  const text = `${subject}\n\n${matches
    .map((m) => `• ${matchTitle(m)} — ${matchTag(m)} — ${kickoffLabel(m.kickoff)}`)
    .join("\n")}\n\nFull schedule: ${SITE_URL}\nUnsubscribe: ${unsub}`;

  return { subject, html, text };
}

async function sendEmail(to: string, payload: { subject: string; html: string; text: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

Deno.serve(async (req) => {
  // Only the cron job (which knows the shared secret) may trigger sends.
  if (CRON_SECRET && req.headers.get("x-cron-secret") !== CRON_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = Date.now();
  const horizonISO = new Date(now + 60 * 60 * 1000).toISOString(); // look 60 min ahead

  const { data: matches, error: mErr } = await admin
    .from("matches")
    .select("*")
    .gte("kickoff", new Date(now).toISOString())
    .lte("kickoff", horizonISO)
    .order("kickoff");
  if (mErr) return json({ error: mErr.message }, 500);
  if (!matches?.length) return json({ ok: true, sent: 0, note: "no upcoming matches" });

  const { data: subs, error: sErr } = await admin
    .from("subscriptions")
    .select("*")
    .eq("active", true);
  if (sErr) return json({ error: sErr.message }, 500);
  if (!subs?.length) return json({ ok: true, sent: 0, note: "no active subscribers" });

  const matchIds = matches.map((m) => m.id);
  const { data: already } = await admin
    .from("sent_reminders")
    .select("subscription_id, match_id")
    .in("match_id", matchIds);
  const sentSet = new Set((already ?? []).map((r) => `${r.subscription_id}:${r.match_id}`));

  let emailsSent = 0;
  const errors: string[] = [];

  for (const sub of subs) {
    const windowMs = (sub.minutes_before ?? 15) * 60_000;
    const due = matches.filter((m) => {
      const k = new Date(m.kickoff).getTime();
      return k > now && k - now <= windowMs && !sentSet.has(`${sub.id}:${m.id}`);
    });
    if (!due.length) continue;

    try {
      await sendEmail(sub.email, buildEmail(sub, due));
      await admin
        .from("sent_reminders")
        .insert(due.map((m) => ({ subscription_id: sub.id, match_id: m.id })));
      emailsSent++;
    } catch (e) {
      errors.push(`${sub.email}: ${(e as Error).message}`);
    }
  }

  return json({ ok: true, sent: emailsSent, errors });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
