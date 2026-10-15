// Tests for Ver.1.2.5 (student housing first): kinds, key figures, card order, planner eligibility. Local tests only.
import "./_react";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getCity } from "../data/cities";
import { allOfficialData, officialData, pointsOf } from "../data/official";
import { housingKindOf, isStudentHousing } from "../data/official/housingKind";
import { cityCandidates } from "../data/official/planner";
import { HOUSING_TYPES, STUDY_TYPES } from "../lib/planner";
import { compareKeys, keyFigure, keyPoint } from "../lib/overview";
import { I18nProvider } from "../lib/i18n";
import { HousingStudentFirst } from "../components/overview/CityOverview";
import { ot } from "../locales/official";
import { ux } from "../locales/ux";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const man = getCity("manchester")!, van = getCity("vancouver")!;
const html = (city: typeof man) => renderToStaticMarkup(React.createElement(I18nProvider, null, React.createElement(HousingStudentFirst, { city, data: officialData(city.id), points: pointsOf(city.id, "housing") })));
const text = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

t("housing kinds: halls, a room in a shared house, homestay and the whole-market statistics are told apart; nothing is ever re-labelled", () => {
  const kinds = (c: string) => pointsOf(c, "housing").map((p) => `${p.id}:${housingKindOf(p)}`);
  assert.deepEqual(kinds("manchester").filter((k) => k.endsWith(":dorm")).length, 5);
  assert.ok(kinds("manchester").includes("man-uom-est-private-share-month:share")); assert.ok(kinds("manchester").includes("man-ons-pipr-private-rent-month:market"));
  assert.deepEqual(kinds("vancouver").map((k) => k.split(":")[1]), ["market", "market", "market", "market"]);
  for (const p of allOfficialData().flatMap((c) => c.points)) if (p.topic === "housing") { assert.ok(!(housingKindOf(p) === "market" && isStudentHousing(p))); if (p.audience === "renter") assert.equal(housingKindOf(p), "market"); }
  assert.equal(allOfficialData().flatMap((c) => c.points).filter((p) => housingKindOf(p) === "homestay").length, 0, "no homestay price is registered: none is invented");
});

t("the ONS and CMHC rent statistics are kept (verified, nothing deleted) and sit in the details, not in the key figure", () => {
  const market = (c: string) => pointsOf(c, "housing").filter((p) => housingKindOf(p) === "market");
  assert.equal(market("manchester").length, 1); assert.equal(market("vancouver").length, 4); for (const p of [...market("manchester"), ...market("vancouver")]) assert.equal(p.status, "verified");
  for (const c of [man, van]) { const k = keyFigure(c, "housing"); if (k.kind === "point") assert.ok(isStudentHousing(k.point)); }
});

t("key figure: Manchester shows a verified student price; Vancouver has none and says 'reference price in preparation' – no invented number", () => {
  const km = keyFigure(man, "housing"), kv = keyFigure(van, "housing");
  assert.equal(km.kind, "point"); assert.equal(housingKindOf((km as { point: { metric: string; audience: "renter"; housing?: object } }).point as never), "dorm");
  assert.deepEqual(kv, { kind: "none", prep: true }); assert.equal(keyPoint("vancouver", "housing"), undefined);
  assert.equal(compareKeys([km, kv]), "missing");
  assert.equal(ux.pricePrep.ja, "参考料金は準備中"); assert.ok(ux.pricePrep.en.length > 5);
});

t("the housing card order: 1) per-person prices, 2) the housing types open to students, then (outside this block) the market statistics in the details", () => {
  for (const c of [man, van]) {
    const h = text(html(c)); const a = h.indexOf("留学生が負担する住居費（1人あたり）"), b = h.indexOf("留学生が使える住居タイプ");
    assert.ok(a >= 0 && b > a, "prices first, types second"); const raw = html(c); assert.ok(!/data-point="(van-cmhc|man-ons-pipr)/.test(raw), "no market data card in the student block");
    for (const k of ["学生寮", "ホームステイ", "シェアハウス（個室）"]) assert.ok(h.includes(k), k);
  }
});

t("missing prices say so: Vancouver (all three kinds) and Manchester (homestay) show 'reference price in preparation'; Manchester halls and house share show real cards", () => {
  const hv = html(van), hm = html(man); const prep = (h: string, k: string) => new RegExp(`data-testid="prep-${k}"`).test(h);
  for (const k of ["dorm", "homestay", "share"]) assert.ok(prep(hv, k), `vancouver ${k}`);
  assert.ok(prep(hm, "homestay")); assert.ok(!prep(hm, "dorm")); assert.ok(!prep(hm, "share"));
  assert.match(text(hv), /参考料金は準備中/); assert.match(hm, /data-point="man-uom-halls-catered-month"/); assert.match(hm, /data-point="man-uom-est-private-share-month"/);
  assert.match(hv, /UBC/, "the UBC fee pages stay linked as an official notice"); assert.ok(!/\d,\d{3}\s*CAD|data-point="van-cmhc/.test(hv), "no CMHC rent in the student block");
});

t("the types text never promises eligibility and never turns a whole rent into a share price", () => {
  for (const lang of ["en", "ja"] as const) { assert.ok(ot.housingTypes.dorm[lang].length > 40 && ot.housingTypes.homestay[lang].length > 40 && ot.housingTypes.share[lang].length > 40); }
  assert.match(ot.housingTypes.dorm.ja, /語学留学の方や他校の学生は申し込めないことがあります/); assert.match(ot.housingTypes.share.ja, /人数で割った値ではありません/); assert.match(ot.housingTypes.share.en, /not the whole home divided/);
  assert.match(ot.housingTypesCheck.ja, /入居資格・契約期間/);
});

t("Planner: a housing figure is picked automatically only when it is a per-person student price with a known eligibility and contract", () => {
  let auto = 0;
  for (const cityId of ["manchester", "vancouver"] as const) for (const studyType of STUDY_TYPES) for (const housingType of HOUSING_TYPES) for (const c of cityCandidates(cityId, "housing", { studyType, housingType })) {
    if (!c.auto || !c.eligible) continue; auto++;
    const p = officialData(cityId)!.points.find((x) => x.id === c.id.replace(/:max$/, ""))!;
    assert.ok(isStudentHousing(p), `${c.id} is not a student price`); assert.ok(c.coverageWeeks !== undefined, `${c.id} has no stated contract length`); assert.equal(studyType, "university", `${c.id}: eligibility is for university students only`);
  }
  assert.ok(auto > 0, "the catered-hall 41-week price is still offered");
  // the manual ones are still listed (nothing is hidden), just never picked
  const vanAll = cityCandidates("vancouver", "housing", { studyType: "university", housingType: "other" }); assert.ok(vanAll.length >= 3 && vanAll.every((c) => !c.auto));
  const manShare = cityCandidates("manchester", "housing", { studyType: "university", housingType: "share" }); assert.ok(manShare.length >= 1 && manShare.every((c) => !c.auto));
});

t("the planner module's rules do not mention the market rents as automatic", () => {
  const src = readFileSync(path.resolve(__dirname, "../data/official/planner.ts"), "utf8");
  for (const id of ["van-cmhc-rent-bachelor", "van-cmhc-rent-1br", "van-cmhc-rent-2br"]) assert.match(src, new RegExp(`pointId: "${id}"[^}]*manual: true`));
  for (const id of ["man-uom-intl-selfcatered-shared-week", "man-uom-intl-selfcatered-ensuite-week", "man-uom-intl-catered-week", "man-uom-est-private-share-month"]) assert.match(src, new RegExp(`pointId: "${id}"[^}]*manual: true`));
});

console.log(`${n} student housing tests passed`);
