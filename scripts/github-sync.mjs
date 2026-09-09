#!/usr/bin/env node
/**
 * Refreshes lib/github/snapshot.json from GitHub.
 *
 *   npm run github:sync
 *
 * Uses the `gh` CLI you are already logged in to, so there is no token to
 * manage. Nothing on the site fetches GitHub at runtime or at build time: the
 * snapshot is a committed file, and this is the only thing that writes it.
 *
 * What it records: for every repository linked from lib/content.ts, the
 * stars, forks, language, description and last push; and the last year of
 * the contribution calendar, as 53 weeks of 7 counts.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "lib", "github", "snapshot.json");
const LOGIN = "shlok1806";

const gh = (...args) => JSON.parse(execFileSync("gh", args, { encoding: "utf8" }));

// The repositories the site links to, read from the content file itself
const content = readFileSync(join(root, "lib", "content.ts"), "utf8");
const repos = [...new Set([...content.matchAll(/github\.com\/([\w.-]+)\/([\w.-]+)/g)].map((m) => `${m[1]}/${m[2]}`))];

const repoData = {};
for (const full of repos) {
  const r = gh("api", `repos/${full}`);
  repoData[full] = {
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    description: r.description,
    pushedAt: r.pushed_at,
  };
  process.stderr.write(`${full}: ${r.language ?? "?"}, ${r.stargazers_count} stars, pushed ${r.pushed_at}\n`);
}

const calendar = gh(
  "api",
  "graphql",
  "-f",
  `query={ user(login:"${LOGIN}") { contributionsCollection { contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } } } } }`,
).data.user.contributionsCollection.contributionCalendar;

const weeks = calendar.weeks.map((w) => w.contributionDays.map((d) => d.contributionCount));
const days = calendar.weeks.flatMap((w) => w.contributionDays);

const snapshot = {
  syncedAt: new Date().toISOString(),
  login: LOGIN,
  repos: repoData,
  contributions: {
    total: calendar.totalContributions,
    from: days[0]?.date ?? null,
    to: days[days.length - 1]?.date ?? null,
    weeks,
  },
};

writeFileSync(OUT, `${JSON.stringify(snapshot, null, 2)}\n`);
process.stderr.write(`wrote ${OUT}: ${repos.length} repos, ${calendar.totalContributions} contributions\n`);
