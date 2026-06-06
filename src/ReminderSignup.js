import { useState } from "react";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const LEAD_OPTIONS = [5, 15, 30, 60];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ReminderSignup() {
  const [email, setEmail] = useState("");
  const [minutes, setMinutes] = useState(15);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [message, setMessage] = useState("");

  async function subscribe(e) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      setMessage("That email doesn’t look right.");
      return;
    }
    if (!CONFIGURED) {
      setStatus("error");
      setMessage("Reminders aren’t connected yet — see SUPABASE_SETUP.md.");
      return;
    }

    setStatus("sending");
    setMessage("");
    try {
      // The new publishable key (sb_publishable_...) is NOT a JWT, so it must
      // only go in the `apikey` header — sending it as a Bearer token makes the
      // gateway try to parse it as a JWT and 401. The legacy anon key (eyJ...)
      // is a JWT and works in both headers.
      const headers = {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Prefer: "return=minimal,resolution=ignore-duplicates",
      };
      if (SUPABASE_ANON_KEY.startsWith("eyJ")) {
        headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
      }
      const res = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          minutes_before: minutes,
        }),
      });
      if (!res.ok && res.status !== 409) {
        throw new Error(await res.text());
      }
      setStatus("done");
      setMessage("You’re in. We’ll email you before every kickoff. ⚽");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage("Something went wrong — try again in a moment.");
    }
  }

  return (
    <section className="remind" id="reminders">
      <div className="remind__glow" aria-hidden="true" />
      <div className="remind__inner">
        <div className="remind__copy">
          <span className="remind__kicker">Never miss a kickoff</span>
          <h2 className="remind__title">
            Get the <em>whistle</em> in your inbox
          </h2>
          <p className="remind__sub">
            Drop your email and we’ll send a heads-up before every match —
            all 104 of them, group stage through the final.
          </p>
        </div>

        {status === "done" ? (
          <div className="remind__success" role="status">
            <span className="remind__check" aria-hidden="true">✓</span>
            <p>{message}</p>
          </div>
        ) : (
          <form className="remind__form" onSubmit={subscribe}>
            <div className="remind__field">
              <label htmlFor="remind-email">Email</label>
              <input
                id="remind-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="remind__field remind__field--lead">
              <label htmlFor="remind-lead">Heads-up</label>
              <select
                id="remind-lead"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              >
                {LEAD_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} min before
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="remind__btn"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Signing up…" : "Notify me"}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="remind__msg remind__msg--err" role="alert">
            {message}
          </p>
        )}
        {!CONFIGURED && status !== "error" && (
          <p className="remind__msg">
            Demo mode — connect Supabase to start sending emails.
          </p>
        )}
      </div>
    </section>
  );
}
