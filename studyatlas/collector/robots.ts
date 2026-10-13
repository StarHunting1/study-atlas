/*
 * Minimal robots.txt check (RFC 9309 subset): the group for our user agent (or "*"), longest matching
 * Allow/Disallow rule wins, "*" and "$" wildcards supported. A missing robots.txt (4xx) allows everything;
 * an unreachable one (5xx / network error) disallows, as the RFC recommends.
 */
export type RobotsVerdict = { allowed: boolean; reason: string };

export function parseRobots(txt: string, agent: string): { allow: string[]; disallow: string[] } {
  const groups: { agents: string[]; allow: string[]; disallow: string[] }[] = []; let cur: (typeof groups)[number] | undefined; let lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim(); if (!line) continue;
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line); if (!m) continue;
    const key = m[1].toLowerCase(); const val = m[2].trim();
    if (key === "user-agent") { if (!cur || !lastWasAgent) { cur = { agents: [], allow: [], disallow: [] }; groups.push(cur); } cur.agents.push(val.toLowerCase()); lastWasAgent = true; continue; }
    lastWasAgent = false; if (!cur) continue;
    if (key === "allow" && val) cur.allow.push(val); else if (key === "disallow" && val) cur.disallow.push(val);
  }
  const a = agent.toLowerCase();
  const mine = groups.filter((g) => g.agents.some((x) => x !== "*" && a.includes(x)));
  const pick = mine.length ? mine : groups.filter((g) => g.agents.includes("*"));
  return { allow: pick.flatMap((g) => g.allow), disallow: pick.flatMap((g) => g.disallow) };
}

const toRe = (rule: string) => new RegExp("^" + rule.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$|\$$/, "$"));
export function robotsAllows(txt: string, agent: string, pathAndQuery: string): RobotsVerdict {
  const { allow, disallow } = parseRobots(txt, agent);
  const best = (rules: string[]) => rules.filter((r) => toRe(r).test(pathAndQuery)).reduce((n, r) => Math.max(n, r.length), -1);
  const a = best(allow), d = best(disallow);
  if (d < 0) return { allowed: true, reason: "no matching Disallow rule" };
  return a >= d ? { allowed: true, reason: "Allow rule takes precedence" } : { allowed: false, reason: "disallowed by robots.txt" };
}
