// Release checks (Ver.1.3.1): what a visitor can see must be real, labelled and sourced. Local tests – not a legal review.
import "./_react";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { cities, countries } from "@/data/cities";
import { sections } from "@/data/fields";
import { listSchools } from "@/data/schools";
import { officialData } from "@/data/official";
import { visaLinks, healthLinks } from "@/data/visa";
import FactView from "@/components/FactView";
import KeyView from "@/components/overview/KeyView";
import { keyFigure, TOPICS } from "@/lib/overview";
import { publicFact } from "@/data/publicFacts";
import { listCompareSchools } from "@/data/languageSchools";
import { cleanEasy, defaultEasy } from "@/lib/smart";
import { cleanProfile } from "@/lib/profile";
import { auditMarkdown } from "../collector/audit";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const wrap = (el: unknown) => renderToStaticMarkup(h(I18nProvider, null, el as never));
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const SAMPLE_AMOUNTS = new Set<string>();
for (const c of cities) for (const s of sections) for (const f of s.fields) { const x = f.get(c); if (x.status === "sample") { const v = x.value as { amount?: number } | undefined; if (v?.amount !== undefined) SAMPLE_AMOUNTS.add(`${c.id}:${f.id}:${v.amount}`); } }

t("demo 'sample' numbers exist in the data (kept) but are never rendered: field view, key figures, city comparison", () => {
  assert.ok(SAMPLE_AMOUNTS.size >= 12, "the four demo cities still hold their Ver.1.0 placeholders in the data files");
  for (const c of cities) for (const s of sections) for (const f of s.fields) {
    const fact = f.get(c); if (fact.status !== "sample") continue;
    const out = text(wrap(h(FactView, { fact, kind: f.kind }))); const amount = String((fact.value as { amount: number }).amount);
    assert.ok(!out.includes(amount), `${c.id} ${f.id} shows its demo amount`);
    assert.ok(out.includes("データ準備中"), `${c.id} ${f.id} reads 'data coming soon'`);
    assert.equal(publicFact(fact).value, undefined);
  }
  for (const c of cities) for (const topic of TOPICS) { const k = keyFigure(c, topic); assert.notEqual(k.kind === "money" && k.fact.status === "sample", true, `${c.id}/${topic}`); }
  for (const id of ["toronto", "london", "sydney", "melbourne"]) { const out = text(wrap(h(KeyView, { k: keyFigure(cities.find((c) => c.id === id)!, "living") }))); assert.ok(out.includes("データ準備中"), id); assert.ok(!/\d{3,}\s*(CAD|GBP|AUD)/.test(out), id); }
});
t("no fictional school or fee reaches the public list or the comparison; samples need an explicit switch and are labelled demo", () => {
  assert.equal(listSchools("language", { includeSamples: false }).length, 0, "no real school record exists in the structured school list yet");
  const unis = listSchools("university", { includeSamples: false }); assert.equal(unis.length, 13, "13 real universities named in the city summaries");
  assert.ok(unis.every((u) => !u.demo && u.record.status === "unverified" && u.website.status === "unverified" && /^https:\/\//.test(u.website.value ?? "")), "real universities are listed as unverified with their site link only");
  assert.ok(listSchools("language", { includeSamples: true }).every((s) => s.demo), "samples are flagged demo");
  assert.ok(listCompareSchools().every((s) => !/example\.com/.test(JSON.stringify(s.inst)) && s.status !== "sample" && !s.inst.hidden));
});
t("every unverified or sample fact is labelled, and a verified fact always has a source, a period and a check date", () => {
  for (const c of cities) for (const s of sections) for (const f of s.fields) {
    const x = f.get(c); if (x.status === "pending") continue;
    if (x.status === "verified") assert.ok(x.sources?.length && x.period && x.checkedAt, `${c.id} ${f.id}`);
    if (x.status === "unverified") { const out = text(wrap(h(FactView, { fact: x, kind: f.kind }))); assert.ok(out.includes("未確認"), `${c.id} ${f.id} is not marked unverified`); assert.ok(!out.includes("確認済み"), `${c.id} ${f.id}`); }
  }
});
t("source links are https and no example/placeholder host appears in real data", () => {
  const urls: string[] = [];
  for (const c of cities) for (const s of sections) for (const f of s.fields) { const x = f.get(c); x.sources?.forEach((u) => urls.push(u.url)); if (Array.isArray(x.value)) (x.value as { url?: string; source?: { url: string } }[]).forEach((i) => { if (i.url) urls.push(i.url); if (i.source) urls.push(i.source.url); }); }
  for (const k of Object.values(visaLinks).concat(Object.values(healthLinks))) k.forEach((l) => urls.push(l.link.value!));
  for (const c of cities) officialData(c.id)?.points.forEach((p) => p.evidence.forEach((e) => urls.push(e.url)));
  assert.ok(urls.length > 40); for (const u of urls) { assert.ok(/^https:\/\//.test(u), u); assert.ok(!/example\.(com|org)|localhost|\.test\//.test(u), u); }
  assert.equal(new Set(urls.filter((u) => /\s/.test(u))).size, 0);
});
t("visa and health outlines: unverified, sourced, dated, never say which route applies to a person, and point to the official page", () => {
  for (const code of ["GBR", "CAN"]) {
    const v = countries.find((c) => c.code === code)!.profile.visa;
    for (const f of [v.official, v.notes]) { assert.equal(f.status, "unverified"); assert.ok(f.sources!.length >= 1 && f.checkedAt && f.period); assert.ok(f.note!.ja.includes("公式ページで確認") && f.note!.en.includes("confirm")); }
    const body = JSON.stringify(v.official.value); assert.ok(body.includes("国籍") && !/あなたは|必ず(必要|不要)|you must apply for/i.test(body), "no individual verdict");
  }
  for (const id of ["manchester", "vancouver"]) { const hc = cities.find((c) => c.id === id)!.profile.living.healthcare; assert.equal(hc.status, "unverified"); assert.ok(hc.sources?.[0].url.startsWith("https://") && hc.checkedAt); }
});
t("the audit report is generated from the data and counts demo samples as 'no data'", () => {
  const md = auditMarkdown(); assert.ok(md.includes("RELEASE_DATA_AUDIT") && md.includes("sample（非公開）"));
  for (const id of ["Toronto", "London", "Sydney", "Melbourne"]) assert.ok(new RegExp(`\\| ${id} \\| 25 \\| 0 \\| \\d+ \\| 3 \\| \\d+ \\| \\d+% \\| 0% \\|`).test(md), `${id}: 3 demo samples, no verified field`);
});
t("saved data stays readable: older planner drafts and profiles load unchanged", () => {
  const e = cleanEasy({ ...defaultEasy(), assume: { tuitionWeek: 120, visa: null, insurance: null, flight: { round: null, oneway: null } } })!; assert.equal(e.assume.tuitionWeek, 120);
  const p = cleanProfile({ nationality: "JP", destCity: "manchester", studyType: "language" })!; assert.equal(p.nationality, "JP"); assert.equal(p.destCity, "manchester");
});
t("government fees are never counted for a person automatically: visa, insurance and flights stay 'unset' in every generated plan unless the user types them", () => {
  const { generate, defaultEasy } = require("@/lib/smart") as typeof import("@/lib/smart");
  for (const cityId of ["manchester", "vancouver"] as const) for (const studyType of ["language", "university"] as const) for (const dur of [{ value: 3, unit: "months" as const }, { value: 12, unit: "weeks" as const }, { value: 41, unit: "weeks" as const }, { value: 18, unit: "months" as const }]) {
    for (const sp of generate(defaultEasy({ cityId, studyType, duration: dur }), { now: "2026-10-15T00:00:00.000Z" })) for (const id of ["visa", "insurance", "flights"] as const) { assert.equal(sp.picks[id].status, "unset", `${cityId}/${studyType}/${dur.value}${dur.unit}/${id}`); assert.ok(sp.mainMissing.includes(id)); }
  }
});
t("tuition is never filled from a school: no school fee is held, so a language-school plan stays provisional (未完成) until the user types it", () => {
  const { generate, defaultEasy } = require("@/lib/smart") as typeof import("@/lib/smart");
  for (const cityId of ["manchester", "vancouver"] as const) for (const sp of generate(defaultEasy({ cityId, studyType: "language", duration: { value: 12, unit: "weeks" } }), { now: "2026-10-15T00:00:00.000Z" })) { assert.equal(sp.picks.tuition.status, "unset", cityId); assert.equal(sp.provisional, true, `${cityId}: main items missing → provisional`); assert.ok(sp.mainMissing.includes("tuition")); }
});
t("fee pages of the schools are recorded as link-only in the rights record; no fee figure is held for any displayed school", () => {
  const { RIGHTS } = require("@/data/official/rights.data") as typeof import("@/data/official/rights.data"); const r = RIGHTS["language-school-fees"];
  assert.equal(r.display, "link-only"); assert.notEqual(r.reuseStatus, "permitted"); assert.ok(r.reviewed.length >= 4);
});
t("the home-page map is production-safe: bundled SVG, no tile/style request, no key, every country of the data has a clickable path, cities are buttons", () => {
  const fs = require("node:fs") as typeof import("node:fs");
  const src = fs.readFileSync("components/WorldMap.tsx", "utf8"), data = fs.readFileSync("data/worldMap.ts", "utf8"), pkg = fs.readFileSync("package.json", "utf8");
  assert.ok(!/https?:\/\/|NEXT_PUBLIC|maplibre|demotiles|fetch\(/i.test(src), "WorldMap makes no external request"); assert.ok(!/maplibre/i.test(pkg), "no tile-map library left");
  assert.ok(!/demotiles/.test(fs.readFileSync("locales/en.ts", "utf8") + fs.readFileSync("locales/ja.ts", "utf8")), "no demo-tile credit left");
  const { COUNTRY_PATHS } = require("@/data/worldMap") as typeof import("@/data/worldMap"); const { countries, cities } = require("@/data/cities") as typeof import("@/data/cities");
  for (const c of countries) assert.ok(COUNTRY_PATHS[c.code]?.d.length > 50, `map path for ${c.code}`); assert.ok(/Natural Earth/.test(data) && /public domain/i.test(data), "source and licence recorded");
  const React = require("react") as typeof import("react"); const { renderToStaticMarkup } = require("react-dom/server") as typeof import("react-dom/server");
  const { I18nProvider } = require("@/lib/i18n") as typeof import("@/lib/i18n"); const WorldMap = (require("@/components/WorldMap") as typeof import("@/components/WorldMap")).default;
  const html = renderToStaticMarkup(React.createElement(I18nProvider, null, React.createElement(WorldMap, { country: "GBR", onCountry() {}, onCity() {}, onUnsupported() {} })));
  for (const c of countries) assert.ok(html.includes(`data-testid="country-${c.code}"`), c.code); for (const c of cities) assert.ok(html.includes(`data-testid="city-${c.id}"`), c.id);
  assert.ok(html.includes('aria-pressed="true"'), "the selected country is marked"); assert.ok(!/<img|<script|href=/.test(html));
});
console.log(n, "release check tests passed");
