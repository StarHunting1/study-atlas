import "./_react";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { getCity } from "@/data/cities";
import { officialData } from "@/data/official";
import FactView from "@/components/FactView";
import KeyView from "@/components/overview/KeyView";
import { HousingStudentFirst } from "@/components/overview/CityOverview";
import { keyFigure } from "@/lib/overview";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const schools = (id: string) => getCity(id)!.profile.education.languageSchools;
const wrap = (el: unknown) => renderToStaticMarkup(h(I18nProvider, null, el as never));

t("language schools: 3 per city, never 'verified', each with a source page; the fact keeps URL(s) and a check date; no price anywhere", () => {
  for (const id of ["manchester", "vancouver"]) {
    const f = schools(id); assert.equal(f.status, "unverified"); assert.ok(f.checkedAt && f.sources && f.sources.length > 0 && f.note);
    assert.ok(f.value!.length >= 2 && f.value!.length <= 3);
    for (const s of f.value!) { assert.ok(s.source?.url.startsWith("https://"), s.name); if (s.url) assert.ok(s.url.startsWith("https://")); assert.ok(!/[£$€¥]\s?\d|\d+\s?(GBP|CAD)/.test(JSON.stringify(s)), "no price in " + s.name); }
    assert.ok(new Set(f.value!.map((s) => s.name)).size === f.value!.length);
  }
});
t("a school whose street address differs between listings shows no street address; thin entries (EF) carry no invented courses or accommodation", () => {
  const mc = schools("manchester").value!.find((s) => s.name === "MC Academy")!; assert.ok(!/Oldham|Mosley/.test(JSON.stringify(mc)));
  const ih = schools("vancouver").value!.find((s) => s.name.startsWith("International House"))!; assert.ok(!/Quayside|Pender/.test(JSON.stringify(ih)));
  const ef = schools("vancouver").value!.find((s) => s.name === "EF Vancouver")!; assert.ok(!ef.courses && !ef.stay);
});
t("the school list renders name, area, courses, accommodation, source link and the 'unverified' badge (ja and en text exist)", () => {
  const out = wrap(h(FactView, { fact: schools("manchester"), kind: "institutions" }));
  assert.ok(out.includes("Express English College") && out.includes("所在地") && out.includes("主なコース") && out.includes("滞在先の手配") && out.includes("English UK") && out.includes("2026-10-15"));
  assert.equal((out.match(/data-testid="institution"/g) ?? []).length, 3);
  for (const s of [...schools("manchester").value!, ...schools("vancouver").value!]) for (const f of [s.where, s.courses, s.stay, s.note]) if (f) assert.ok(f.en && f.ja);
});
t("first view (education key): language mode names language schools first, university mode keeps universities first", () => {
  const k = keyFigure(getCity("manchester")!, "education"); assert.equal(k.kind, "schools");
  const lang = wrap(h(KeyView, { k, languageFirst: true })).replace(/<[^>]+>/g, ""), uni = wrap(h(KeyView, { k })).replace(/<[^>]+>/g, "");
  assert.ok(lang.indexOf("語学学校") >= 0 && lang.indexOf("語学学校") < lang.indexOf("大学"));
  assert.ok(uni.indexOf("大学") < uni.indexOf("語学学校"));
});
t("housing: homestay, shared house, student halls and private rental are all explained with their check points – even where no price exists", () => {
  for (const id of ["manchester", "vancouver"]) { const c = getCity(id)!, d = officialData(id)!;
    const out = wrap(h(HousingStudentFirst, { city: c, data: d, mode: "language", points: [] }));
    for (const k of ["homestay", "share", "dorm", "market"]) assert.ok(out.includes(`data-testid="type-${k}"`), k);
    assert.ok(out.includes("確認：") && out.includes("民間賃貸") && out.includes("語学留学生は不可の場合が多い")); }
});
t("ONS and CMHC statistics remain, framed as a city reference (not student housing)", () => {
  assert.ok(officialData("manchester")!.points.some((p) => p.id.startsWith("man-ons-pipr")) && officialData("vancouver")!.points.some((p) => p.id.startsWith("van-cmhc")));
  const { ot } = require("@/locales/official"); assert.ok(ot.housingMarketMore.ja.includes("都市の参考情報") && ot.housingMarketMore.ja.includes("学生向けではありません"));
});
console.log(n, "language student tests passed");
