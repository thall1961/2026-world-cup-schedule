// Generates supabase/seed.sql from the single source of truth (src/data.js).
// Run: node scripts/gen-seed.mjs
import { writeFileSync, copyFileSync, rmSync } from "node:fs";

// src/data.js is ESM but lives under a CommonJS package, so copy it to a
// .mjs sibling we can import directly.
const tmp = new URL("./_data.mjs", import.meta.url);
copyFileSync(new URL("../src/data.js", import.meta.url), tmp);
const { MATCHES } = await import(tmp.href);
rmSync(tmp);

const q = (v) =>
  v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`;

const rows = MATCHES.map(
  (m) =>
    `  (${m.id}, ${q(m.stage)}, ${q(m.group)}, ${q(m.home)}, ${q(m.away)}, ${q(m.kickoffISO)})`
).join(",\n");

const sql = `-- Auto-generated from src/data.js by scripts/gen-seed.mjs. Do not edit by hand.
-- Re-run \`node scripts/gen-seed.mjs\` after changing the schedule.
insert into public.matches (id, stage, group_name, home, away, kickoff) values
${rows}
on conflict (id) do update set
  stage      = excluded.stage,
  group_name = excluded.group_name,
  home       = excluded.home,
  away       = excluded.away,
  kickoff    = excluded.kickoff;
`;

writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`Wrote supabase/seed.sql (${MATCHES.length} matches).`);
