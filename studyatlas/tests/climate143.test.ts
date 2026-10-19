import "./_react";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import ClimateCharts from "@/components/official/ClimateCharts";
import { getCity } from "@/data/cities";
import { officialData } from "@/data/official";
import { climateCompare, climateIssues } from "@/data/official/compare";
import { RIGHTS } from "@/data/official/rights.data";
import { approveClimate, CLIMATE_APPROVALS } from "@/data/approvals";
import { keyFigure, compareKeys, availability } from "@/lib/overview";
import { allClaims } from "@/data/approvalSheet";
import { ot } from "@/locales/official";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const wrap = (el: unknown) => renderToStaticMarkup(h(I18nProvider, null, el as never)); const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const van = officialData("vancouver")!, man = officialData("manchester")!; const A = CLIMATE_APPROVALS["van-climate-eccc-1991-2020"];

t("the shown Vancouver record is the approved one: 48 values, station, period, annual value and source equal the approval record; it is verified with the approval (StarHunting1, 2026-10-17)", () => {
  const c = van.climate!; const col = (k: "meanC" | "maxC" | "minC" | "precipMm") => c.months.map((m) => m[k]);
  assert.deepEqual(col("meanC"), A.meanC); assert.deepEqual(col("maxC"), A.maxC); assert.deepEqual(col("minC"), A.minC); assert.deepEqual(col("precipMm"), A.precipMm);
  assert.equal(c.months.length * 4, 48); assert.equal(c.period, "1991–2020"); assert.equal(c.stationId, "1108447+1108395"); assert.ok(/composite of 1108447 and 1108395/.test(c.station));
  assert.equal(c.status, "verified"); assert.deepEqual(c.approval, A.approval); assert.equal(A.approval.by, "StarHunting1"); assert.equal(A.approval.at, "2026-10-17"); assert.ok(/PR #46/.test(A.approval.compared) && /48/.test(A.approval.compared));
  assert.deepEqual(c.evidence.map((e) => e.url), A.sources);
});
t("annual precipitation is ECCC's published 1159.5 mm, not the 1159.7 mm sum of the months, and the note does not claim a cause for the 0.2 mm difference", () => {
  const c = van.climate!; assert.equal(c.annual?.precipMm, 1159.5); assert.equal(Number(c.months.reduce((s, m) => s + m.precipMm!, 0).toFixed(1)), 1159.7);
  assert.equal(climateCompare("vancouver")!.precipTotal, 1159.5);
  assert.ok(/not stated, so no cause is claimed/.test(c.note!.en) && /原因は断定しません/.test(c.note!.ja));
  const html = wrap(h(ClimateCharts, { c })); assert.ok(html.includes('data-testid="climate-annual"') && text(html).includes("1159.5 mm") && !text(html).includes("1159.7") && text(html).includes("1991–2020") && text(html).includes("VANCOUVER INTERNATIONAL (AIRPORT)") && html.includes("1108447"));
  assert.ok(text(html).includes("年間降水量（ECCCが公表する年値）") && ot.climateAnnual.en.includes("annual value published by ECCC"), "ja and en labels");
});
t("an approved record cannot be edited silently: changing a value, the annual value or the station fails until a person approves again; an unapproved record is never verified", () => {
  const base = { ...van.climate!, status: "unverified" as const, approval: undefined };
  assert.equal(approveClimate(base).status, "verified");
  assert.throws(() => approveClimate({ ...base, months: base.months.map((m, i) => (i === 0 ? { ...m, precipMm: 175 } : m)) }), /changed after its approval/);
  assert.throws(() => approveClimate({ ...base, annual: { precipMm: 1159.7 } }), /changed after its approval/);
  assert.throws(() => approveClimate({ ...base, stationId: "1108447" }), /changed after its approval/);
  assert.equal(approveClimate({ ...base, id: "other" }).status, "unverified");
});
t("1981–2010 is history only: it is kept as climateAlt, never read by any page, and its values are never mixed into the 1991–2020 display", () => {
  assert.equal(van.climateAlt!.period, "1981–2010"); assert.equal(van.climateAlt!.months[0].meanC, 4.13);
  const files = ["components", "app", "lib"].flatMap((d) => (readdirSync(d, { recursive: true }) as string[]).filter((f) => /\.tsx?$/.test(f)).map((f) => `${d}/${f}`));
  for (const f of files) assert.ok(!/climateAlt/.test(readFileSync(f, "utf8")), `${f} does not read the history record`);
  const monthly = getCity("vancouver")!.profile.climate.monthly; assert.equal(monthly.period, "1991–2020"); assert.equal(monthly.status, "verified");
  assert.deepEqual(monthly.value!.meanTempC, A.meanC);
});
t("the old-period notice is gone for 1991–2020 and stays for Manchester's 1971–2000; Manchester's climate is unchanged", () => {
  const endYear = (p: string) => Number(/(\d{4})\D*$/.exec(p)?.[1]); assert.ok(!(endYear(van.climate!.period) < 2020)); assert.ok(endYear(man.climate!.period) < 2020);
  assert.equal(man.climate!.period, "1971–2000"); assert.equal(man.climate!.derived, true); assert.equal(man.climate!.station, "Ringway (Manchester Airport)"); assert.equal(man.climate!.annual, undefined);
  assert.equal(climateCompare("manchester")!.precipTotal, 806);
});
t("city comparison: Vancouver (1991–2020) and Manchester (1971–2000) are never compared as the same basis: the row says the periods differ and the overview is 'reference only'", () => {
  assert.deepEqual(climateIssues([climateCompare("manchester"), climateCompare("vancouver")]), ["period"]);
  const keys = ["manchester", "vancouver"].map((i) => keyFigure(getCity(i)!, "climate")); assert.ok(keys.every((k) => k.kind === "temp"));
  assert.equal(compareKeys(keys), "differ"); assert.equal(availability(keys, "differ"), "reference");
  const vk = keys[1]; assert.ok(vk.kind === "temp" && vk.period === "1991–2020" && vk.status === "verified");
});
t("licence and attribution: ECCC Data Services End-use Licence v2.1.1 (August 2026), commercial use allowed, the required attribution statement is shown on the climate card; source URL, check date, period and station are shown", () => {
  const r = RIGHTS["eccc-climate-normals"]; assert.ok(/v2\.1\.1/.test(r.licence!) && /August 2026/.test(r.licence!)); assert.equal(r.reuseStatus, "permitted");
  assert.equal(r.attribution, "Contains information licenced under the Data Server End-use Licence of Environment and Climate Change Canada.");
  assert.ok(van.climate!.note!.en.includes(r.attribution!) || van.climate!.note!.en.includes("Contains information licenced under the Data Server End-use Licence of Environment and Climate Change Canada"));
  const src = readFileSync("components/overview/CityOverview.tsx", "utf8"); assert.ok(/data-testid="climate-attribution"/.test(src) && /RIGHTS\[data\.climate\.sourceId\]\?\.attribution/.test(src) && /d\.checked\)\}: \$\{data\.climate\.checkedAt/.test(src));
  assert.equal(van.climate!.retrievedAt, "2026-10-16"); assert.equal(van.climate!.checkedAt, "2026-10-17", "checked against ECCC's own CSV on 2026-10-17"); assert.ok(van.climate!.evidence[0].url.startsWith("https://climate.weather.gc.ca/"));
});
t("nothing else was promoted: still exactly five verified claims, no other climate record carries an approval, Planner untouched", () => {
  assert.deepEqual(allClaims().filter((c) => c.status === "verified").map((c) => c.id).sort(), ["U1", "U2", "U3", "U5b", "U6"]);
  assert.equal(man.climate!.approval, undefined); assert.equal(van.climateAlt!.approval, undefined); assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020", "tor-climate-eccc-1991-2020"]);
  assert.ok(!/climate|ECCC/i.test(readFileSync("lib/planner.ts", "utf8").replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")));
});
console.log(n, "Vancouver climate release tests passed");
