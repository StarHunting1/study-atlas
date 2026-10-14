/*
 * Minimal robots.txt check (RFC 9309 subset): the group for our user agent (or "*"), longest matching
 * Allow/Disallow rule wins, "*" and "$" wildcards supported. A missing robots.txt (4xx) allows everything;
 * an unreachable one (5xx / network error) disallows, as the RFC recommends.
 */
export type RobotsVerdict = { allowed: boolean; reason: string; /** seconds between requests asked for by a Crawl-delay line (0 = none stated) */ crawlDelay?: number };

export function parseRobots(txt: string, agent: string): { allow: string[]; disallow: string[]; crawlDelay: number } {
  const groups: { agents: string[]; allow: string[]; disallow: string[]; delay: number }[] = []; let cur: (typeof groups)[number] | undefined; let lastWasAgent = false;
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim(); if (!line) continue;
    const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(line); if (!m) continue;
    const key = m[1].toLowerCase(); const val = m[2].trim();
    if (key === "user-agent") { if (!cur || !lastWasAgent) { cur = { agents: [], allow: [], disallow: [], delay: 0 }; groups.push(cur); } cur.agents.push(val.toLowerCase()); lastWasAgent = true; continue; }
    lastWasAgent = false; if (!cur) continue;
    if (key === "allow" && val) cur.allow.push(val); else if (key === "disallow" && val) cur.disallow.push(val); else if (key === "crawl-delay" && Number.isFinite(Number(val))) cur.delay = Math.max(cur.delay, Number(val));
  }
  const a = agent.toLowerCase();
  const mine = groups.filter((g) => g.agents.some((x) => x !== "*" && a.includes(x)));
  const pick = mine.length ? mine : groups.filter((g) => g.agents.includes("*"));
  return { allow: pick.flatMap((g) => g.allow), disallow: pick.flatMap((g) => g.disallow), crawlDelay: Math.max(0, ...pick.map((g) => g.delay)) };
}

const toRe = (rule: string) => new RegExp("^" + rule.replace(/[.+?^{}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$|\$$/, "$"));
export function robotsAllows(txt: string, agent: string, pathAndQuery: string): RobotsVerdict {
  const { allow, disallow, crawlDelay } = parseRobots(txt, agent);
  const best = (rules: string[]) => rules.filter((r) => toRe(r).test(pathAndQuery)).reduce((n, r) => Math.max(n, r.length), -1);
  const a = best(allow), d = best(disallow);
  if (d < 0) return { allowed: true, reason: "no matching Disallow rule", crawlDelay };
  return a >= d ? { allowed: true, reason: "Allow rule takes precedence", crawlDelay } : { allowed: false, reason: "disallowed by robots.txt", crawlDelay };
}

/** Per-origin cached robots.txt check using the given fetcher (live or fixture). */
export function makeRobots(fetchText: (url: string) => Promise<{ status: number; body: string }>, agent: string) {
  const cache = new Map<string, Promise<{ txt: string | null; why: string }>>();
  return async (url: string): Promise<RobotsVerdict> => {
    const u = new URL(url);
    if (!cache.has(u.origin)) cache.set(u.origin, fetchText(`${u.origin}/robots.txt`).then(
      (r) => ({ txt: r.status >= 500 ? null : r.status >= 400 ? "" : r.body, why: `HTTP ${r.status}` }),
      (e: Error) => ({ txt: null, why: e.message + ((e as { cause?: Error }).cause ? ` (${(e as { cause?: Error }).cause!.message})` : "") })));
    const { txt, why } = await cache.get(u.origin)!;
    if (txt === null) return { allowed: false, reason: `robots.txt unreachable: ${why} (treated as disallow)` };
    if (txt === "") return { allowed: true, reason: "no robots.txt" };
    return robotsAllows(txt, agent, u.pathname + u.search);
  };
}
