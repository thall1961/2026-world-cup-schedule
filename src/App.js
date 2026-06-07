import { useEffect, useMemo, useState } from "react";
import "./App.css";
import ReminderSignup from "./ReminderSignup";
import DonateButton from "./DonateButton";
import {
  MATCHES,
  GROUPS,
  STAGES,
  STAGE_ORDER,
  TEAMS,
  formatDate,
} from "./data";

const GROUP_KEYS = Object.keys(GROUPS);
const FAV_KEY = "wc26-favorites";

// Columns of the knockout tree, widest round first.
const KO_ROUNDS = [
  { stage: "r32", title: "Round of 32" },
  { stage: "r16", title: "Round of 16" },
  { stage: "qf", title: "Quarter-finals" },
  { stage: "sf", title: "Semi-finals" },
  { stage: "final", title: "Final" },
];

const matchCode = (id) => `M${String(id).padStart(3, "0")}`;

function scrollToReminders(e) {
  e.preventDefault();
  const el = document.getElementById("reminders");
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  // Move focus to the email field once the scroll settles.
  const focusEmail = () => document.getElementById("remind-email")?.focus({ preventScroll: true });
  reduce ? focusEmail() : window.setTimeout(focusEmail, 600);
}

function Flag({ team }) {
  if (!team) {
    return (
      <span className="flag flag--tbd" aria-hidden="true">
        ?
      </span>
    );
  }
  return (
    <span className="flag" aria-hidden="true">
      {TEAMS[team]}
    </span>
  );
}

function TeamRow({ team, fav, onToggleFav, side }) {
  const isFav = team && fav.has(team);
  return (
    <div className={`team team--${side} ${isFav ? "team--fav" : ""}`}>
      <Flag team={team} />
      <button
        type="button"
        className="team__name"
        disabled={!team}
        onClick={() => team && onToggleFav(team)}
        title={team ? `Star ${team}` : "To be decided"}
      >
        {team || "To be decided"}
        {isFav && <span className="team__star" aria-hidden="true">★</span>}
      </button>
    </div>
  );
}

function MatchCard({ match, fav, onToggleFav, index }) {
  const knockout = match.stage !== "group";
  const isFinal = match.stage === "final";
  const involvesFav =
    fav.has(match.home) || fav.has(match.away);

  return (
    <article
      className={`card ${knockout ? "card--ko" : ""} ${
        isFinal ? "card--final" : ""
      } ${involvesFav ? "card--fav" : ""}`}
      style={{ "--i": index }}
    >
      <div className="card__time">
        <span className="card__time-val">{match.time}</span>
        <span className="card__tag">
          {match.group ? `Group ${match.group}` : STAGES[match.stage].label}
        </span>
      </div>

      <div className="card__teams">
        <TeamRow
          team={match.home}
          fav={fav}
          onToggleFav={onToggleFav}
          side="home"
        />
        <div className="card__vs">
          <span>VS</span>
        </div>
        <TeamRow
          team={match.away}
          fav={fav}
          onToggleFav={onToggleFav}
          side="away"
        />
      </div>

      <div className="card__meta">
        <span className="card__num">M{String(match.id).padStart(3, "0")}</span>
        {isFinal && <span className="card__trophy" aria-hidden="true">🏆</span>}
      </div>
    </article>
  );
}

function Bout({ match, feeders, isFinal, isThird }) {
  const f = formatDate(match.date);
  return (
    <div className="bout">
      <div
        className={`bout__card ${isFinal ? "bout__card--final" : ""} ${
          isThird ? "bout__card--third" : ""
        }`}
      >
        <div className="bout__top">
          <span className="bout__num">{matchCode(match.id)}</span>
          <span className="bout__when">
            {f.monthShort} {f.day}
            <i>·</i>
            {match.time}
          </span>
        </div>
        <div className="bout__slot">
          <span className="bout__pin" aria-hidden="true">?</span>
          <span className="bout__feed">{feeders[0]}</span>
        </div>
        <div className="bout__slot">
          <span className="bout__pin" aria-hidden="true">?</span>
          <span className="bout__feed">{feeders[1]}</span>
        </div>
        {isFinal && <span className="bout__crown" aria-hidden="true">🏆</span>}
      </div>
    </div>
  );
}

function Bracket() {
  const rounds = KO_ROUNDS.map((r) => ({
    ...r,
    matches: MATCHES.filter((m) => m.stage === r.stage),
  }));
  const third = MATCHES.find((m) => m.stage === "third");

  // Feeder labels reference the match that decides each slot (structural tree).
  const feedersFor = (ri, idx) => {
    if (ri === 0) return ["1st / 2nd place", "1st / 2nd place"];
    const prev = rounds[ri - 1].matches;
    return [
      `Winner ${matchCode(prev[2 * idx].id)}`,
      `Winner ${matchCode(prev[2 * idx + 1].id)}`,
    ];
  };

  return (
    <div className="bracket-scroll">
      <div className="bracket">
        {rounds.map((r, ri) => (
          <div className={`round round--${r.stage}`} key={r.stage}>
            <div className="round__title">
              <span className="round__title-txt">{r.title}</span>
              <span className="round__title-n">{r.matches.length}</span>
            </div>
            <div className="round__bouts">
              {r.matches.map((m, idx) => (
                <Bout
                  key={m.id}
                  match={m}
                  feeders={feedersFor(ri, idx)}
                  isFinal={r.stage === "final"}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="third-place">
        <div className="round__title">
          <span className="round__title-txt">Third place play-off</span>
        </div>
        <Bout
          match={third}
          feeders={["Loser " + matchCode(rounds[3].matches[0].id), "Loser " + matchCode(rounds[3].matches[1].id)]}
          isThird
        />
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("schedule");
  const [stage, setStage] = useState("all");
  const [group, setGroup] = useState("all");
  const [favOnly, setFavOnly] = useState(false);
  const [fav, setFav] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem(FAV_KEY)) || []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify([...fav]));
  }, [fav]);

  const toggleFav = (team) =>
    setFav((prev) => {
      const next = new Set(prev);
      next.has(team) ? next.delete(team) : next.add(team);
      return next;
    });

  // Group filter only applies to the group stage.
  const groupActive = stage === "all" || stage === "group";

  const filtered = useMemo(() => {
    return MATCHES.filter((m) => {
      if (stage !== "all" && m.stage !== stage) return false;
      if (groupActive && group !== "all" && m.group !== group) return false;
      if (favOnly && !(fav.has(m.home) || fav.has(m.away))) return false;
      return true;
    });
  }, [stage, group, favOnly, fav, groupActive]);

  // Group filtered matches by date.
  const days = useMemo(() => {
    const map = new Map();
    for (const m of filtered) {
      if (!map.has(m.date)) map.set(m.date, []);
      map.get(m.date).push(m);
    }
    return [...map.entries()];
  }, [filtered]);

  const matchCounter = { current: 0 };

  return (
    <div className="app">
      <div className="atmosphere" aria-hidden="true">
        <div className="glow glow--lime" />
        <div className="glow glow--magenta" />
        <div className="grain" />
      </div>

      <header className="hero">
        <div className="hero__bar">
          <span className="hero__kicker">FIFA World Cup</span>
          <span className="hero__edition">North America</span>
        </div>
        <h1 className="hero__title">
          <span className="hero__year">26</span>
          <span className="hero__word">
            THE
            <br />
            FIXTURES
          </span>
        </h1>
        <p className="hero__sub">
          Every kickoff from the opening whistle in Group A to the final in
          New&nbsp;Jersey. 104 matches. 48 nations. One trophy.
        </p>
        <div className="hero__stats">
          <Stat n="104" l="Matches" />
          <Stat n="48" l="Nations" />
          <Stat n="12" l="Groups" />
          <Stat n="39" l="Days" />
        </div>
        <a className="hero__cta" href="#reminders" onClick={scrollToReminders}>
          <span className="hero__cta-bell" aria-hidden="true">🔔</span>
          Get match reminders
          <span className="hero__cta-arrow" aria-hidden="true">↓</span>
        </a>
      </header>

      <nav className="controls">
        <div className="controls__top">
          <div className="viewswitch" role="tablist" aria-label="View">
            <button
              type="button"
              role="tab"
              aria-selected={view === "schedule"}
              className={`viewswitch__btn ${view === "schedule" ? "is-on" : ""}`}
              onClick={() => setView("schedule")}
            >
              Schedule
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "bracket"}
              className={`viewswitch__btn ${view === "bracket" ? "is-on" : ""}`}
              onClick={() => setView("bracket")}
            >
              Bracket
            </button>
            <span
              className={`viewswitch__thumb ${view === "bracket" ? "is-right" : ""}`}
              aria-hidden="true"
            />
          </div>
          {view === "bracket" && (
            <span className="controls__hint">
              Knockout tree — slots fill in as the group stage finishes
            </span>
          )}
        </div>

        {view === "schedule" && (
        <>
        <div className="controls__row">
          <span className="controls__label">Stage</span>
          <div className="pills">
            <Pill active={stage === "all"} onClick={() => setStage("all")}>
              All
            </Pill>
            {STAGE_ORDER.map((s) => (
              <Pill
                key={s}
                active={stage === s}
                ko={s !== "group"}
                onClick={() => setStage(s)}
              >
                {STAGES[s].short}
              </Pill>
            ))}
          </div>
        </div>

        <div className={`controls__row ${groupActive ? "" : "controls__row--off"}`}>
          <span className="controls__label">Group</span>
          <div className="pills">
            <Pill active={group === "all"} onClick={() => setGroup("all")}>
              All
            </Pill>
            {GROUP_KEYS.map((gk) => (
              <Pill
                key={gk}
                active={group === gk}
                onClick={() => setGroup(gk)}
              >
                {gk}
              </Pill>
            ))}
          </div>
        </div>

        <div className="controls__row">
          <span className="controls__label">Teams</span>
          <button
            type="button"
            className={`fav-toggle ${favOnly ? "fav-toggle--on" : ""}`}
            onClick={() => setFavOnly((v) => !v)}
          >
            <span className="fav-toggle__star">★</span>
            My teams
            {fav.size > 0 && <span className="fav-toggle__count">{fav.size}</span>}
          </button>
        </div>
        </>
        )}
      </nav>

      {view === "bracket" ? (
        <main className="bracketview">
          <Bracket />
        </main>
      ) : (
      <main className="schedule">
        {days.length === 0 && (
          <div className="empty">
            <span className="empty__big">No matches</span>
            <p>
              {favOnly
                ? "Star a team to see their fixtures here."
                : "Nothing matches these filters."}
            </p>
          </div>
        )}

        {days.map(([date, matches]) => {
          const f = formatDate(date);
          return (
            <section className="day" key={date}>
              <div className="day__head">
                <div className="day__date">
                  <span className="day__num">{f.day}</span>
                  <div className="day__labels">
                    <span className="day__weekday">{f.weekday}</span>
                    <span className="day__month">{f.month}</span>
                  </div>
                </div>
                <span className="day__count">
                  {matches.length} {matches.length === 1 ? "match" : "matches"}
                </span>
                <span className="day__line" />
              </div>
              <div className="day__matches">
                {matches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    fav={fav}
                    onToggleFav={toggleFav}
                    index={matchCounter.current++}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>
      )}

      <ReminderSignup />

      <footer className="foot">
        <div className="foot__dates">
          <span>Group stage · Jun 11 – 27</span>
          <span className="foot__dot">●</span>
          <span>Knockouts · Jun 28 – Jul 15</span>
          <span className="foot__dot">●</span>
          <span className="foot__final">Final · Jul 19</span>
        </div>
        <div className="foot__support">
          <span className="foot__support-label">Enjoying it?</span>
          <DonateButton />
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, l }) {
  return (
    <div className="stat">
      <span className="stat__n">{n}</span>
      <span className="stat__l">{l}</span>
    </div>
  );
}

function Pill({ active, ko, onClick, children }) {
  return (
    <button
      type="button"
      className={`pill ${active ? "pill--active" : ""} ${ko ? "pill--ko" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
