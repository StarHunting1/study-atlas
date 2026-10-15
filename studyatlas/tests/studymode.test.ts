import "./_react";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { getCity, countries } from "@/data/cities";
import { officialData } from "@/data/official";
import CityOverview, { HousingStudentFirst } from "@/components/overview/CityOverview";
import { fitOf } from "@/data/official/studyType";
import { keyFigure, keyPoint } from "@/lib/overview";
import { cleanMode, STUDY_MODE_KEY } from "@/lib/studyMode";
import { PROFILE_KEY } from "@/lib/profile";
import { readFileSync } from "node:fs";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const page = (id: string, ...[]: []) => { const c = getCity(id)!; return c; };
// CityOverview reads the mode from the browser; server render shows the default (language). The mode-specific parts are tested through their pure functions.
const html = (id: string) => { const c = page(id); return renderToStaticMarkup(h(I18nProvider, null, h(CityOverview, { city: c, country: countries.find((x) => x.code === c.country)!, data: officialData(id) }))); };
const pts = (id: string) => officialData(id)!.points;

t("eligibility: university-only figures are never 'applies' for language study; every figure applies to university study", () => {
  for (const id of ["manchester", "vancouver"]) for (const p of pts(id)) {
    assert.equal(fitOf(p, "university"), "applies");
    if (["universityStudent", "undergraduate", "postgraduate"].includes(p.audience)) assert.equal(fitOf(p, "language"), "not", p.id);
    if (["adult", "renter", "youth"].includes(p.audience)) assert.equal(fitOf(p, "language"), "applies", p.id);
  }
  assert.equal(fitOf({ id: "van-upass", audience: "student" }, "language"), "not");
  assert.equal(fitOf({ id: "man-bus-allterms-student", audience: "student" }, "language"), "not");
  assert.equal(fitOf({ id: "man-anybus-28day-student", audience: "student" }, "language"), "unconfirmed");   // eligibility of language students not stated: never 'applies'
});
t("key figures follow the mode and never use a non-applicable figure", () => {
  assert.equal(keyPoint("manchester", "transport", "language")?.audience, "adult");
  assert.equal(keyPoint("manchester", "transport", "university")?.id, keyPoint("manchester", "transport")?.id);   // university: nothing is filtered
  assert.notEqual(keyPoint("vancouver", "transport", "language")?.id, "van-upass");
  assert.deepEqual(keyFigure(getCity("manchester")!, "housing", "language"), { kind: "none", prep: true });      // halls are university-only: reference price in preparation
  const m = keyFigure(getCity("manchester")!, "housing", "university"); assert.equal(m.kind, "point");
  for (const id of ["manchester", "vancouver"]) for (const topic of ["living", "housing", "transport"] as const) { const k = keyFigure(getCity(id)!, topic, "language"); if (k.kind === "point") assert.equal(fitOf(k.point, "language"), "applies"); }
});
t("without a mode nothing changes (compare page, existing behaviour)", () => {
  assert.equal(keyPoint("manchester", "transport")?.id, "man-bus-28day-adult");
  assert.equal(keyPoint("vancouver", "transport"), undefined);   // unchanged: the fares are link-only
});
t("switch is on the city page (both languages, two buttons, 44px targets) and shows the hint plus the common-info note", () => {
  const out = html("manchester");
  assert.ok(out.includes('data-testid="study-switch"') && out.includes('data-testid="mode-language"') && out.includes('data-testid="mode-university"'));
  assert.ok(out.includes("語学留学") && out.includes("大学留学") && out.includes("気候・一般的な交通・都市の特徴はどちらでも共通です"));
  assert.ok(out.includes("min-h-[44px]"));
  assert.ok(out.indexOf("study-switch") < out.indexOf('data-testid="cards"'), "switch above the cards");
});
t("default (language) order: schools, housing, transport, living costs, climate; common climate card is always there", () => {
  for (const id of ["manchester", "vancouver"]) { const o = html(id); const ix = ["education", "housing", "transport", "living", "climate"].map((x) => o.indexOf(`data-testid="card-${x}"`)); assert.ok(ix.every((v) => v > 0)); assert.deepEqual([...ix].sort((a, b) => a - b), ix); }
});
t("housing block by mode: language leads with homestay / shared house, university with halls; applicable figures only; missing prices say 'in preparation'", () => {
  const c = getCity("manchester")!; const d = officialData("manchester")!;
  const render = (mode: "language" | "university") => renderToStaticMarkup(h(I18nProvider, null, h(HousingStudentFirst, { city: c, data: d, mode, points: d.points.filter((p) => p.topic === "housing" && fitOf(p, mode) === "applies") })));
  const lang = render("language"), uni = render("university");
  assert.ok(lang.indexOf('data-testid="kind-homestay"') < lang.indexOf('data-testid="kind-share"') && lang.indexOf('data-testid="kind-share"') < lang.indexOf('data-testid="kind-dorm"'));
  assert.ok(uni.indexOf('data-testid="kind-dorm"') < uni.indexOf('data-testid="kind-share"') && uni.indexOf('data-testid="kind-share"') < uni.indexOf('data-testid="kind-homestay"'));
  assert.ok(!lang.includes('data-point="man-uom'), "no university hall / university estimate card in language mode");
  assert.ok(lang.includes('data-testid="prep-dorm"') && lang.includes('data-testid="prep-share"') && lang.includes("参考料金は準備中"));
  assert.ok(uni.includes('data-point="man-uom-halls-catered-month"') && !uni.includes('data-testid="prep-dorm"'));
});
t("storage: separate key; the Planner profile key is only read", () => {
  assert.equal(cleanMode("language"), "language"); assert.equal(cleanMode("university"), "university"); assert.equal(cleanMode("x"), undefined);
  assert.notEqual(STUDY_MODE_KEY, PROFILE_KEY);
  const src = readFileSync("lib/studyMode.ts", "utf8");
  assert.ok(!/setItem\([^)]*PROFILE_KEY/.test(src) && !/usePersistentState[^;]*PROFILE_KEY/.test(src), "profile is never written");
});
console.log(n, "study mode tests passed");
