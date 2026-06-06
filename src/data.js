// FIFA World Cup 2026 — schedule data
// Flags use Unicode regional-indicator emoji (subdivision tags for England/Scotland).

export const TEAMS = {
  Mexico: "🇲🇽",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  Czechia: "🇨🇿",
  Canada: "🇨🇦",
  "Bosnia and Herzegovina": "🇧🇦",
  USA: "🇺🇸",
  Paraguay: "🇵🇾",
  Qatar: "🇶🇦",
  Switzerland: "🇨🇭",
  Brazil: "🇧🇷",
  Morocco: "🇲🇦",
  Haiti: "🇭🇹",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Australia: "🇦🇺",
  Türkiye: "🇹🇷",
  Germany: "🇩🇪",
  Curaçao: "🇨🇼",
  Netherlands: "🇳🇱",
  Japan: "🇯🇵",
  "Ivory Coast": "🇨🇮",
  Ecuador: "🇪🇨",
  Sweden: "🇸🇪",
  Tunisia: "🇹🇳",
  Spain: "🇪🇸",
  "Cabo Verde": "🇨🇻",
  Belgium: "🇧🇪",
  Egypt: "🇪🇬",
  "Saudi Arabia": "🇸🇦",
  Uruguay: "🇺🇾",
  Iran: "🇮🇷",
  "New Zealand": "🇳🇿",
  France: "🇫🇷",
  Senegal: "🇸🇳",
  Iraq: "🇮🇶",
  Norway: "🇳🇴",
  Argentina: "🇦🇷",
  Algeria: "🇩🇿",
  Austria: "🇦🇹",
  Jordan: "🇯🇴",
  Portugal: "🇵🇹",
  "DR Congo": "🇨🇩",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Croatia: "🇭🇷",
  Ghana: "🇬🇭",
  Panama: "🇵🇦",
  Uzbekistan: "🇺🇿",
  Colombia: "🇨🇴",
};

export const GROUPS = {
  A: ["Mexico", "South Africa", "South Korea", "Czechia"],
  B: ["Canada", "Bosnia and Herzegovina", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["USA", "Paraguay", "Australia", "Türkiye"],
  E: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cabo Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};

export const STAGES = {
  group: { label: "Group Stage", short: "Groups" },
  r32: { label: "Round of 32", short: "R32" },
  r16: { label: "Round of 16", short: "R16" },
  qf: { label: "Quarter-finals", short: "QF" },
  sf: { label: "Semi-finals", short: "SF" },
  third: { label: "Third place play-off", short: "3rd" },
  final: { label: "Final", short: "Final" },
};

export const STAGE_ORDER = ["group", "r32", "r16", "qf", "sf", "third", "final"];

// Helper to build a group-stage match
const g = (group, date, time, home, away) => ({
  stage: "group",
  group,
  date,
  time,
  home,
  away,
});

// Helper to build a knockout (TBD) match
const k = (stage, date, time) => ({
  stage,
  group: null,
  date,
  time,
  home: null,
  away: null,
});

// All listed kickoff times are US Central Time (CDT, UTC-5) for the
// Jun–Jul 2026 window. Change this single offset to re-anchor the schedule.
export const TZ_OFFSET = "-05:00";

function toKickoffISO(date, time) {
  const [clock, ampm] = time.split(" ");
  let [h, m] = clock.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00${TZ_OFFSET}`;
}

export const MATCHES = [
  // ── Group stage, matchday 1 ──
  g("A", "2026-06-11", "2:00 PM", "Mexico", "South Africa"),
  g("A", "2026-06-11", "9:00 PM", "South Korea", "Czechia"),

  g("B", "2026-06-12", "2:00 PM", "Canada", "Bosnia and Herzegovina"),
  g("D", "2026-06-12", "8:00 PM", "USA", "Paraguay"),

  g("B", "2026-06-13", "2:00 PM", "Qatar", "Switzerland"),
  g("C", "2026-06-13", "5:00 PM", "Brazil", "Morocco"),
  g("C", "2026-06-13", "8:00 PM", "Haiti", "Scotland"),
  g("D", "2026-06-13", "11:00 PM", "Australia", "Türkiye"),

  g("E", "2026-06-14", "12:00 PM", "Germany", "Curaçao"),
  g("F", "2026-06-14", "3:00 PM", "Netherlands", "Japan"),
  g("E", "2026-06-14", "6:00 PM", "Ivory Coast", "Ecuador"),
  g("F", "2026-06-14", "9:00 PM", "Sweden", "Tunisia"),

  g("H", "2026-06-15", "11:00 AM", "Spain", "Cabo Verde"),
  g("G", "2026-06-15", "2:00 PM", "Belgium", "Egypt"),
  g("H", "2026-06-15", "5:00 PM", "Saudi Arabia", "Uruguay"),
  g("G", "2026-06-15", "8:00 PM", "Iran", "New Zealand"),

  g("I", "2026-06-16", "2:00 PM", "France", "Senegal"),
  g("I", "2026-06-16", "5:00 PM", "Iraq", "Norway"),
  g("J", "2026-06-16", "8:00 PM", "Argentina", "Algeria"),
  g("J", "2026-06-16", "11:00 PM", "Austria", "Jordan"),

  g("K", "2026-06-17", "12:00 PM", "Portugal", "DR Congo"),
  g("L", "2026-06-17", "3:00 PM", "England", "Croatia"),
  g("L", "2026-06-17", "6:00 PM", "Ghana", "Panama"),
  g("K", "2026-06-17", "9:00 PM", "Uzbekistan", "Colombia"),

  // ── Group stage, matchday 2 ──
  g("A", "2026-06-18", "11:00 AM", "Czechia", "South Africa"),
  g("B", "2026-06-18", "2:00 PM", "Switzerland", "Bosnia and Herzegovina"),
  g("B", "2026-06-18", "5:00 PM", "Canada", "Qatar"),
  g("A", "2026-06-18", "8:00 PM", "Mexico", "South Korea"),

  g("D", "2026-06-19", "2:00 PM", "USA", "Australia"),
  g("C", "2026-06-19", "5:00 PM", "Scotland", "Morocco"),
  g("C", "2026-06-19", "7:30 PM", "Brazil", "Haiti"),
  g("D", "2026-06-19", "10:00 PM", "Türkiye", "Paraguay"),

  g("F", "2026-06-20", "12:00 PM", "Netherlands", "Sweden"),
  g("E", "2026-06-20", "3:00 PM", "Germany", "Ivory Coast"),
  g("E", "2026-06-20", "7:00 PM", "Ecuador", "Curaçao"),
  g("F", "2026-06-20", "11:00 PM", "Tunisia", "Japan"),

  g("H", "2026-06-21", "11:00 AM", "Spain", "Saudi Arabia"),
  g("G", "2026-06-21", "2:00 PM", "Belgium", "Iran"),
  g("H", "2026-06-21", "5:00 PM", "Uruguay", "Cabo Verde"),
  g("G", "2026-06-21", "8:00 PM", "New Zealand", "Egypt"),

  g("J", "2026-06-22", "12:00 PM", "Argentina", "Austria"),
  g("I", "2026-06-22", "4:00 PM", "France", "Iraq"),
  g("I", "2026-06-22", "7:00 PM", "Norway", "Senegal"),
  g("J", "2026-06-22", "10:00 PM", "Jordan", "Algeria"),

  g("K", "2026-06-23", "12:00 PM", "Portugal", "Uzbekistan"),
  g("L", "2026-06-23", "3:00 PM", "England", "Ghana"),
  g("L", "2026-06-23", "6:00 PM", "Panama", "Croatia"),
  g("K", "2026-06-23", "9:00 PM", "Colombia", "DR Congo"),

  // ── Group stage, matchday 3 ──
  g("B", "2026-06-24", "2:00 PM", "Switzerland", "Canada"),
  g("B", "2026-06-24", "2:00 PM", "Bosnia and Herzegovina", "Qatar"),
  g("C", "2026-06-24", "5:00 PM", "Morocco", "Haiti"),
  g("C", "2026-06-24", "5:00 PM", "Scotland", "Brazil"),
  g("A", "2026-06-24", "8:00 PM", "South Africa", "South Korea"),
  g("A", "2026-06-24", "8:00 PM", "Czechia", "Mexico"),

  g("E", "2026-06-25", "3:00 PM", "Curaçao", "Ivory Coast"),
  g("E", "2026-06-25", "3:00 PM", "Ecuador", "Germany"),
  g("F", "2026-06-25", "6:00 PM", "Tunisia", "Netherlands"),
  g("F", "2026-06-25", "6:00 PM", "Japan", "Sweden"),
  g("D", "2026-06-25", "9:00 PM", "Türkiye", "USA"),
  g("D", "2026-06-25", "9:00 PM", "Paraguay", "Australia"),

  g("I", "2026-06-26", "2:00 PM", "Norway", "France"),
  g("I", "2026-06-26", "2:00 PM", "Senegal", "Iraq"),
  g("H", "2026-06-26", "7:00 PM", "Cabo Verde", "Saudi Arabia"),
  g("H", "2026-06-26", "7:00 PM", "Uruguay", "Spain"),
  g("G", "2026-06-26", "10:00 PM", "New Zealand", "Belgium"),
  g("G", "2026-06-26", "10:00 PM", "Egypt", "Iran"),

  g("L", "2026-06-27", "4:00 PM", "Panama", "England"),
  g("L", "2026-06-27", "4:00 PM", "Croatia", "Ghana"),
  g("K", "2026-06-27", "6:30 PM", "Colombia", "Portugal"),
  g("K", "2026-06-27", "6:30 PM", "DR Congo", "Uzbekistan"),
  g("J", "2026-06-27", "9:00 PM", "Algeria", "Austria"),
  g("J", "2026-06-27", "9:00 PM", "Jordan", "Argentina"),

  // ── Round of 32 ──
  k("r32", "2026-06-28", "2:00 PM"),
  k("r32", "2026-06-29", "12:00 PM"),
  k("r32", "2026-06-29", "3:30 PM"),
  k("r32", "2026-06-29", "8:00 PM"),
  k("r32", "2026-06-30", "12:00 PM"),
  k("r32", "2026-06-30", "4:00 PM"),
  k("r32", "2026-06-30", "8:00 PM"),
  k("r32", "2026-07-01", "11:00 AM"),
  k("r32", "2026-07-01", "3:00 PM"),
  k("r32", "2026-07-01", "7:00 PM"),
  k("r32", "2026-07-02", "2:00 PM"),
  k("r32", "2026-07-02", "6:00 PM"),
  k("r32", "2026-07-02", "10:00 PM"),
  k("r32", "2026-07-03", "1:00 PM"),
  k("r32", "2026-07-03", "5:00 PM"),
  k("r32", "2026-07-03", "8:30 PM"),

  // ── Round of 16 ──
  k("r16", "2026-07-04", "12:00 PM"),
  k("r16", "2026-07-04", "4:00 PM"),
  k("r16", "2026-07-05", "3:00 PM"),
  k("r16", "2026-07-05", "7:00 PM"),
  k("r16", "2026-07-06", "2:00 PM"),
  k("r16", "2026-07-06", "7:00 PM"),
  k("r16", "2026-07-07", "11:00 AM"),
  k("r16", "2026-07-07", "3:00 PM"),

  // ── Quarter-finals ──
  k("qf", "2026-07-09", "3:00 PM"),
  k("qf", "2026-07-10", "2:00 PM"),
  k("qf", "2026-07-11", "4:00 PM"),
  k("qf", "2026-07-11", "8:00 PM"),

  // ── Semi-finals ──
  k("sf", "2026-07-14", "2:00 PM"),
  k("sf", "2026-07-15", "2:00 PM"),

  // ── Third place play-off ──
  k("third", "2026-07-18", "4:00 PM"),

  // ── Final ──
  k("final", "2026-07-19", "2:00 PM"),
].map((m, i) => ({
  ...m,
  id: i + 1,
  kickoffISO: toKickoffISO(m.date, m.time),
}));

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return {
    weekday: WEEKDAYS[dt.getDay()],
    weekdayShort: WEEKDAYS[dt.getDay()].slice(0, 3),
    month: MONTHS[m - 1],
    monthShort: MONTHS[m - 1].slice(0, 3),
    day: d,
  };
}
