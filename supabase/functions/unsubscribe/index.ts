// Supabase Edge Function — one-click unsubscribe via the token embedded in
// each reminder email. Deploy with --no-verify-jwt so the link works directly.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

function page(title: string, body: string, status = 200) {
  const html = `<!doctype html><html><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title></head>
    <body style="margin:0;background:#06070d;color:#f3f4ef;font:400 16px/1.5 Arial,sans-serif;display:grid;place-items:center;min-height:100vh;">
      <div style="text-align:center;padding:2rem;">
        <div style="font-size:2rem;margin-bottom:0.5rem;">⚽</div>
        <h1 style="font-size:1.5rem;margin:0 0 0.5rem;">${title}</h1>
        <p style="color:#9aa0b4;margin:0;">${body}</p>
      </div>
    </body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html" } });
}

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return page("Invalid link", "This unsubscribe link is missing its token.", 400);

  const { data, error } = await admin
    .from("subscriptions")
    .update({ active: false })
    .eq("unsubscribe_token", token)
    .select("email");

  if (error || !data?.length) {
    return page("Couldn’t unsubscribe", "That link may have already been used.", 404);
  }
  return page("You’re unsubscribed", "You won’t get any more match reminders. Enjoy the football!");
});
