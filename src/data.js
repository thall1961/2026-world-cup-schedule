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
const g = (group, date, time, home, away, city) => ({
  stage: "group",
  group,
  date,
  time,
  home,
  away,
  city,
});

// Helper to build a knockout (TBD) match
const k = (stage, date, time, city) => ({
  stage,
  group: null,
  date,
  time,
  home: null,
  away: null,
  city,
});

// All listed kickoff times are US Central Time (CDT, UTC-5) for the
// Jun–Jul 2026 window. Change this single offset to re-anchor the schedule.
export const TZ_OFFSET = "-05:00";

// IANA zone the source times are anchored to; used as the "Central" option.
export const CT_TZ = "America/Chicago";

// Render a match's absolute kickoff instant in a given IANA time zone.
// Pass `timeZone` undefined to use the viewer's local zone. Returns the
// clock time (e.g. "2:00 PM") and the short zone label (e.g. "CDT", "EDT").
export function formatKickoff(kickoffISO, timeZone) {
  const opts = { hour: "numeric", minute: "2-digit", timeZoneName: "short" };
  if (timeZone) opts.timeZone = timeZone;
  const parts = new Intl.DateTimeFormat("en-US", opts).formatToParts(
    new Date(kickoffISO)
  );
  const part = {};
  for (const p of parts) part[p.type] = p.value;
  return {
    time: `${part.hour}:${part.minute} ${part.dayPeriod}`,
    zone: part.timeZoneName || "",
  };
}

function toKickoffISO(date, time) {
  const [clock, ampm] = time.split(" ");
  let [h, m] = clock.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00${TZ_OFFSET}`;
}

// Each of the 16 host cities has a single venue. FIFA uses generic
// "{City} Stadium" names for sponsorship reasons, except for two with
// established names (BC Place Vancouver, Estadio Monterrey).
export const STADIUMS = {
  Atlanta: "Atlanta Stadium",
  Boston: "Boston Stadium",
  Dallas: "Dallas Stadium",
  Guadalajara: "Guadalajara Stadium",
  Houston: "Houston Stadium",
  "Kansas City": "Kansas City Stadium",
  "Los Angeles": "Los Angeles Stadium",
  "Mexico City": "Mexico City Stadium",
  Miami: "Miami Stadium",
  Monterrey: "Estadio Monterrey",
  "New York / New Jersey": "New York New Jersey Stadium",
  Philadelphia: "Philadelphia Stadium",
  "San Francisco Bay Area": "San Francisco Bay Area Stadium",
  Seattle: "Seattle Stadium",
  Toronto: "Toronto Stadium",
  Vancouver: "BC Place Vancouver",
};

// Host cities per match are taken from the official FIFA World Cup 2026 match
// schedule. Match order here matches the FIFA match numbers (id = index + 1).
export const MATCHES = [
  // ── Group stage, matchday 1 ──
  g("A", "2026-06-11", "2:00 PM", "Mexico", "South Africa", "Mexico City"),
  g("A", "2026-06-11", "9:00 PM", "South Korea", "Czechia", "Guadalajara"),

  g("B", "2026-06-12", "2:00 PM", "Canada", "Bosnia and Herzegovina", "Toronto"),
  g("D", "2026-06-12", "8:00 PM", "USA", "Paraguay", "Los Angeles"),

  g("B", "2026-06-13", "2:00 PM", "Qatar", "Switzerland", "San Francisco Bay Area"),
  g("C", "2026-06-13", "5:00 PM", "Brazil", "Morocco", "New York / New Jersey"),
  g("C", "2026-06-13", "8:00 PM", "Haiti", "Scotland", "Boston"),
  g("D", "2026-06-13", "11:00 PM", "Australia", "Türkiye", "Vancouver"),

  g("E", "2026-06-14", "12:00 PM", "Germany", "Curaçao", "Houston"),
  g("F", "2026-06-14", "3:00 PM", "Netherlands", "Japan", "Dallas"),
  g("E", "2026-06-14", "6:00 PM", "Ivory Coast", "Ecuador", "Philadelphia"),
  g("F", "2026-06-14", "9:00 PM", "Sweden", "Tunisia", "Monterrey"),

  g("H", "2026-06-15", "11:00 AM", "Spain", "Cabo Verde", "Atlanta"),
  g("G", "2026-06-15", "2:00 PM", "Belgium", "Egypt", "Seattle"),
  g("H", "2026-06-15", "5:00 PM", "Saudi Arabia", "Uruguay", "Miami"),
  g("G", "2026-06-15", "8:00 PM", "Iran", "New Zealand", "Los Angeles"),

  g("I", "2026-06-16", "2:00 PM", "France", "Senegal", "New York / New Jersey"),
  g("I", "2026-06-16", "5:00 PM", "Iraq", "Norway", "Boston"),
  g("J", "2026-06-16", "8:00 PM", "Argentina", "Algeria", "Kansas City"),
  g("J", "2026-06-16", "11:00 PM", "Austria", "Jordan", "San Francisco Bay Area"),

  g("K", "2026-06-17", "12:00 PM", "Portugal", "DR Congo", "Houston"),
  g("L", "2026-06-17", "3:00 PM", "England", "Croatia", "Dallas"),
  g("L", "2026-06-17", "6:00 PM", "Ghana", "Panama", "Toronto"),
  g("K", "2026-06-17", "9:00 PM", "Uzbekistan", "Colombia", "Mexico City"),

  // ── Group stage, matchday 2 ──
  g("A", "2026-06-18", "11:00 AM", "Czechia", "South Africa", "Atlanta"),
  g("B", "2026-06-18", "2:00 PM", "Switzerland", "Bosnia and Herzegovina", "Los Angeles"),
  g("B", "2026-06-18", "5:00 PM", "Canada", "Qatar", "Vancouver"),
  g("A", "2026-06-18", "8:00 PM", "Mexico", "South Korea", "Guadalajara"),

  g("D", "2026-06-19", "2:00 PM", "USA", "Australia", "Seattle"),
  g("C", "2026-06-19", "5:00 PM", "Scotland", "Morocco", "Boston"),
  g("C", "2026-06-19", "7:30 PM", "Brazil", "Haiti", "Philadelphia"),
  g("D", "2026-06-19", "10:00 PM", "Türkiye", "Paraguay", "San Francisco Bay Area"),

  g("F", "2026-06-20", "12:00 PM", "Netherlands", "Sweden", "Houston"),
  g("E", "2026-06-20", "3:00 PM", "Germany", "Ivory Coast", "Toronto"),
  g("E", "2026-06-20", "7:00 PM", "Ecuador", "Curaçao", "Kansas City"),
  g("F", "2026-06-20", "11:00 PM", "Tunisia", "Japan", "Monterrey"),

  g("H", "2026-06-21", "11:00 AM", "Spain", "Saudi Arabia", "Atlanta"),
  g("G", "2026-06-21", "2:00 PM", "Belgium", "Iran", "Los Angeles"),
  g("H", "2026-06-21", "5:00 PM", "Uruguay", "Cabo Verde", "Miami"),
  g("G", "2026-06-21", "8:00 PM", "New Zealand", "Egypt", "Vancouver"),

  g("J", "2026-06-22", "12:00 PM", "Argentina", "Austria", "Dallas"),
  g("I", "2026-06-22", "4:00 PM", "France", "Iraq", "Philadelphia"),
  g("I", "2026-06-22", "7:00 PM", "Norway", "Senegal", "New York / New Jersey"),
  g("J", "2026-06-22", "10:00 PM", "Jordan", "Algeria", "San Francisco Bay Area"),

  g("K", "2026-06-23", "12:00 PM", "Portugal", "Uzbekistan", "Houston"),
  g("L", "2026-06-23", "3:00 PM", "England", "Ghana", "Boston"),
  g("L", "2026-06-23", "6:00 PM", "Panama", "Croatia", "Toronto"),
  g("K", "2026-06-23", "9:00 PM", "Colombia", "DR Congo", "Guadalajara"),

  // ── Group stage, matchday 3 ──
  g("B", "2026-06-24", "2:00 PM", "Switzerland", "Canada", "Vancouver"),
  g("B", "2026-06-24", "2:00 PM", "Bosnia and Herzegovina", "Qatar", "Seattle"),
  g("C", "2026-06-24", "5:00 PM", "Morocco", "Haiti", "Atlanta"),
  g("C", "2026-06-24", "5:00 PM", "Scotland", "Brazil", "Miami"),
  g("A", "2026-06-24", "8:00 PM", "South Africa", "South Korea", "Monterrey"),
  g("A", "2026-06-24", "8:00 PM", "Czechia", "Mexico", "Mexico City"),

  g("E", "2026-06-25", "3:00 PM", "Curaçao", "Ivory Coast", "Philadelphia"),
  g("E", "2026-06-25", "3:00 PM", "Ecuador", "Germany", "New York / New Jersey"),
  g("F", "2026-06-25", "6:00 PM", "Tunisia", "Netherlands", "Kansas City"),
  g("F", "2026-06-25", "6:00 PM", "Japan", "Sweden", "Dallas"),
  g("D", "2026-06-25", "9:00 PM", "Türkiye", "USA", "Los Angeles"),
  g("D", "2026-06-25", "9:00 PM", "Paraguay", "Australia", "San Francisco Bay Area"),

  g("I", "2026-06-26", "2:00 PM", "Norway", "France", "Boston"),
  g("I", "2026-06-26", "2:00 PM", "Senegal", "Iraq", "Toronto"),
  g("H", "2026-06-26", "7:00 PM", "Cabo Verde", "Saudi Arabia", "Houston"),
  g("H", "2026-06-26", "7:00 PM", "Uruguay", "Spain", "Guadalajara"),
  g("G", "2026-06-26", "10:00 PM", "New Zealand", "Belgium", "Vancouver"),
  g("G", "2026-06-26", "10:00 PM", "Egypt", "Iran", "Seattle"),

  g("L", "2026-06-27", "4:00 PM", "Panama", "England", "New York / New Jersey"),
  g("L", "2026-06-27", "4:00 PM", "Croatia", "Ghana", "Philadelphia"),
  g("K", "2026-06-27", "6:30 PM", "Colombia", "Portugal", "Miami"),
  g("K", "2026-06-27", "6:30 PM", "DR Congo", "Uzbekistan", "Atlanta"),
  g("J", "2026-06-27", "9:00 PM", "Algeria", "Austria", "Kansas City"),
  g("J", "2026-06-27", "9:00 PM", "Jordan", "Argentina", "Dallas"),

  // ── Round of 32 ──
  k("r32", "2026-06-28", "2:00 PM", "Los Angeles"),
  k("r32", "2026-06-29", "12:00 PM", "Boston"),
  k("r32", "2026-06-29", "3:30 PM", "Monterrey"),
  k("r32", "2026-06-29", "8:00 PM", "Houston"),
  k("r32", "2026-06-30", "12:00 PM", "New York / New Jersey"),
  k("r32", "2026-06-30", "4:00 PM", "Dallas"),
  k("r32", "2026-06-30", "8:00 PM", "Mexico City"),
  k("r32", "2026-07-01", "11:00 AM", "Atlanta"),
  k("r32", "2026-07-01", "3:00 PM", "San Francisco Bay Area"),
  k("r32", "2026-07-01", "7:00 PM", "Seattle"),
  k("r32", "2026-07-02", "2:00 PM", "Toronto"),
  k("r32", "2026-07-02", "6:00 PM", "Los Angeles"),
  k("r32", "2026-07-02", "10:00 PM", "Vancouver"),
  k("r32", "2026-07-03", "1:00 PM", "Miami"),
  k("r32", "2026-07-03", "5:00 PM", "Kansas City"),
  k("r32", "2026-07-03", "8:30 PM", "Dallas"),

  // ── Round of 16 ──
  k("r16", "2026-07-04", "12:00 PM", "Philadelphia"),
  k("r16", "2026-07-04", "4:00 PM", "Houston"),
  k("r16", "2026-07-05", "3:00 PM", "New York / New Jersey"),
  k("r16", "2026-07-05", "7:00 PM", "Mexico City"),
  k("r16", "2026-07-06", "2:00 PM", "Dallas"),
  k("r16", "2026-07-06", "7:00 PM", "Seattle"),
  k("r16", "2026-07-07", "11:00 AM", "Atlanta"),
  k("r16", "2026-07-07", "3:00 PM", "Vancouver"),

  // ── Quarter-finals ──
  k("qf", "2026-07-09", "3:00 PM", "Boston"),
  k("qf", "2026-07-10", "2:00 PM", "Los Angeles"),
  k("qf", "2026-07-11", "4:00 PM", "Miami"),
  k("qf", "2026-07-11", "8:00 PM", "Kansas City"),

  // ── Semi-finals ──
  k("sf", "2026-07-14", "2:00 PM", "Dallas"),
  k("sf", "2026-07-15", "2:00 PM", "Atlanta"),

  // ── Third place play-off ──
  k("third", "2026-07-18", "4:00 PM", "Miami"),

  // ── Final ──
  k("final", "2026-07-19", "2:00 PM", "New York / New Jersey"),
].map((m, i) => ({
  ...m,
  id: i + 1,
  stadium: STADIUMS[m.city],
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
