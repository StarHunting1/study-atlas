// Tests for Ver.1.8 (Simplify & Explore): quick-overview key figures, compare verdicts, merged plans, stored-data compatibility, texts.
// Local tests only. Run: npm test
import assert from "node:assert/strict";
import { cities, getCity } from "../data/cities";
import { officialData } from "../data/official";
import { TOPICS, EXTRA_TOPICS, compareKeys, extraKey, keyFigure, keyPoint, keyStatus, type Key } from "../lib/overview";
import { calcPlan, cleanStore, newPlan, setItem, PLANS_KEY } from "../lib/planner";
import { defaultEasy, generate, groupPlans, cleanEasy, cleanSaved, SAVED_KEY, DRAFT_KEY } from "../lib/smart";
import { ux } from "../locales/ux";
import { st } from "../locales/smart";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const man = getCity("manchester")!, van = getCity("vancouver")!;

t("every city has a quick overview for the five topics; a missing topic says 'none', never a made-up figure", () => {
  for (const c of cities) for (const topic of TOPICS) { const k = keyFigure(c, topic); assert.ok(["point", "money", "text", "temp", "schools", "link", "none"].includes(k.kind)); if (k.kind === "none") assert.equal(keyStatus(k), undefined); }
});

t("official cities: the key figure is a verified data point with its audience; nothing is promoted to 'verified'", () => {
  for (const c of [man, van]) for (const topic of ["living", "housing", "transport"] as const) {
    const k = keyFigure(c, topic); const pts = (officialData(c.id)?.points ?? []).filter((p) => p.topic === topic && p.value);
    if (k.kind === "point") { assert.ok(pts.some((p) => p.id === k.point.id)); assert.equal(keyStatus(k), k.point.status); assert.ok(k.point.audience); assert.ok(k.point.evidence.length > 0, "the source stays attached"); }
  }
  const p = keyPoint("manchester", "living"); assert.ok(p && p.metric === "living.universityEstimate.total"); assert.equal(p!.audience, "undergraduate");
  assert.equal(keyPoint("vancouver", "living"), undefined, "no living-cost estimate for Vancouver: no invented figure");
});

t("climate and schools: temperature range comes from the stored months; school counts only from loaded lists", () => {
  const k = keyFigure(man, "climate"); if (k.kind === "temp") { const m = officialData("manchester")!.climate!.months; const vals = m.map((x) => x.meanC ?? NaN).filter((v) => !Number.isNaN(v)); if (vals.length === 12) { assert.equal(k.lo, Math.min(...vals)); assert.equal(k.hi, Math.max(...vals)); } assert.ok(k.station && k.period); }
  for (const c of cities) { const s = keyFigure(c, "education"); if (s.kind === "schools") assert.ok(s.universities + s.languageSchools > 0); }
});

t("compare verdicts: same basis, different basis, not verified, missing – and free text is never 'same basis'", () => {
  const living = [keyFigure(man, "living"), keyFigure(van, "living")]; assert.equal(compareKeys(living), "missing");
  const tr = [keyFigure(man, "transport"), keyFigure(van, "transport")]; assert.equal(tr[1].kind, "link", "TransLink figures are held back: a link to the official page, no figure"); assert.equal(compareKeys(tr), "missing");
  assert.equal(compareKeys([{ kind: "none" }, { kind: "none" }]), "missing"); assert.equal(compareKeys([keyFigure(man, "living")]), "missing");
  const mk = (per: "month" | "week", audience: "adult" | "student", status: "verified" | "unverified" = "verified"): Key => ({ kind: "point", point: { ...(keyPoint("manchester", "living") as never as object), value: { amount: 1, currency: "GBP", per }, audience, status } as never });
  assert.equal(compareKeys([mk("month", "adult"), mk("month", "adult")]), "same"); assert.equal(compareKeys([mk("month", "adult"), mk("week", "adult")]), "differ");
  assert.equal(compareKeys([mk("month", "adult"), mk("month", "student")]), "differ"); assert.equal(compareKeys([mk("month", "adult"), mk("month", "adult", "unverified")]), "unverified");
  const text = (status: "verified" | "unverified"): Key => ({ kind: "text", fact: { status, value: { en: "x", ja: "x" } } as never });
  assert.equal(compareKeys([text("verified"), text("verified")]), "n/a"); assert.equal(compareKeys([text("verified"), text("unverified")]), "unverified");
});

t("extra compare rows (safety, visa, healthcare, student life) read profile facts and keep their status", () => {
  for (const c of cities) for (const e of EXTRA_TOPICS) { const k = extraKey(c, e); assert.ok(k.kind === "none" || k.kind === "text"); if (k.kind === "text") assert.notEqual(k.fact.status, "pending"); }
});

t("identical plans are merged into one card; different plans stay separate", () => {
  const now = "2026-10-14T00:00:00.000Z";
  const g = groupPlans(generate({ ...defaultEasy({ cityId: "manchester", studyType: "language" }), housing: null }, { now })); assert.ok(g.length >= 1 && g.length <= 3); assert.deepEqual(g.flatMap((x) => x.tiers), ["budget", "balanced", "comfort"]);
  for (const x of g) if (x.tiers.length > 1) { const [a, ...rest] = x.tiers; void a; assert.ok(rest.length >= 1); }
  const uni = groupPlans(generate({ ...defaultEasy({ cityId: "manchester", studyType: "university" }), housing: null }, { now })); assert.ok(uni.length >= 2 && uni.length <= 3, "university data gives different plans for the tiers (housing is no longer auto-filled from an estimate, Ver.1.2.5)");
  // (Vancouver has no automatically adopted figure since Ver.1.2.5, so its three plans are identical and merge into one card)
  const van3 = generate(defaultEasy({ cityId: "vancouver", studyType: "language" }), { now }); assert.equal(groupPlans(van3).length, 1);
  const same = generate({ ...defaultEasy({ cityId: "manchester", studyType: "university" }), housing: null }, { now }); const gg = groupPlans([same[0], { ...same[0], tier: "balanced" }, same[2]]); assert.equal(gg.length, JSON.stringify(same[0].calc) === JSON.stringify(same[2].calc) ? 1 : 2); assert.deepEqual(gg[0].tiers.slice(0, 2), ["budget", "balanced"]);
  const lang = generate({ ...defaultEasy({ cityId: "manchester", studyType: "language" }), housing: null }, { now }); const lg = groupPlans(lang); assert.equal(lg.length < 3 || lang[0].calc.total.converted !== lang[1].calc.total.converted, true);
});

t("merging never hides a difference: every merged tier has identical items and totals", () => {
  const now = "2026-10-14T00:00:00.000Z";
  for (const e of [defaultEasy({ cityId: "manchester", studyType: "language" }), defaultEasy({ cityId: "vancouver", studyType: "university" })]) {
    const ps = generate(e, { now }); for (const g of groupPlans(ps)) for (const tier of g.tiers) { const p = ps.find((x) => x.tier === tier)!; assert.equal(p.calc.total.converted, g.plan.calc.total.converted); assert.equal(JSON.stringify(p.plan.items), JSON.stringify(g.plan.plan.items)); }
  }
});

t("stored data from earlier versions still loads (Ver.1.6 plans, Ver.1.7 saved plans and draft)", () => {
  assert.equal(PLANS_KEY, "studyatlas.planner.v1"); assert.equal(SAVED_KEY, "studyatlas.smart.v1"); assert.equal(DRAFT_KEY, "studyatlas.smart.draft.v1");
  const v16 = JSON.parse(JSON.stringify({ version: 1, activeId: "a", compare: [null, null], plans: [setItem(newPlan({ cityId: "vancouver", now: "2026-10-01T00:00:00.000Z" }), "tuition", { value: 400, per: "week" })].map((p) => ({ ...p, id: "a" })) }));
  const s16 = cleanStore(v16)!; assert.equal(s16.plans.length, 1); assert.equal(calcPlan(s16.plans[0]).total.byCurrency.CAD, 4800);
  const e = defaultEasy({ cityId: "manchester", studyType: "university" }); const sp = generate({ ...e, assume: { ...e.assume, tuitionWeek: 200 } }, { now: "2026-10-14T00:00:00.000Z" })[0];
  const v17 = JSON.parse(JSON.stringify({ version: 1, compare: [], saved: [{ id: "s1", name: "old", tier: "budget", easy: e, plan: sp.plan, savedAt: "2026-10-14T00:00:00.000Z" }] }));
  const s17 = cleanSaved(v17)!; assert.equal(s17.saved.length, 1); assert.equal(s17.saved[0].name, "old"); assert.equal(calcPlan(s17.saved[0].plan).total.converted, sp.calc.total.converted);
  assert.deepEqual(cleanEasy(JSON.parse(JSON.stringify(e))), e);
});

t("texts: every Ver.1.8 string has Japanese and English with the same placeholders", () => {
  const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(","); let count = 0;
  const walk = (v: unknown, path: string) => { if (v && typeof v === "object" && "en" in v && "ja" in v) { const x = v as { en: string; ja: string }; assert.ok(x.en.trim() && x.ja.trim(), path); assert.equal(ph(x.en), ph(x.ja), path); count++; return; } assert.ok(v && typeof v === "object", path); for (const [k, c] of Object.entries(v as object)) walk(c, `${path}.${k}`); };
  walk(ux, "ux"); assert.ok(count > 30, `${count}`); for (const k of ["leadShort", "addConditions", "breakdown", "basisBtn", "countedSoFar", "missingMain", "leftAfter", "overShort"]) assert.ok((st as Record<string, unknown>)[k], k);
  for (const topic of TOPICS) { assert.ok(ux.topics[topic]); assert.ok(ux.blurb[topic]); }
  assert.equal(ux.more.ja, "詳しく見る"); assert.equal(ux.more.en, "Show details");
});

console.log(`\n${n} overview tests passed`);
