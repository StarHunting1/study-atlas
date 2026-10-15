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
t("International House Vancouver is shown in New Westminster, never as a City-of-Vancouver address; stale Vancouver addresses and the disputed suite are absent", () => {
  const ih = schools("vancouver").value!.find((s) => s.name.startsWith("International House"))!; const raw = JSON.stringify(ih);
  assert.ok(ih.where!.ja.includes("ニューウェストミンスター") && ih.where!.ja.includes("バンクーバー市内ではなく") && ih.where!.en.includes("New Westminster") && ih.where!.en.includes("not in the City of Vancouver"));
  assert.ok(!/Chinatown|チャイナタウン|Pender|West Broadway|Stadium/.test(ih.where!.ja + ih.where!.en + (ih.courses?.en ?? "")), "no former downtown location");
  assert.ok(!/\b10[38]\b|Suite|部屋番号は.*\d/.test(raw.replace("部屋番号は掲載により異なるため載せていません", "")), "no suite number");
  assert.ok(schools("vancouver").note!.ja.includes("バンクーバー市内とは限りません"));
  assert.equal(ih.url, "https://ihvancouver.com/");
});
t("every school states its city; Express English College matches the English UK directory entry; uncertain entries stay flagged and unaddressed", () => {
  for (const id of ["manchester", "vancouver"]) for (const s of schools(id).value!) assert.ok(/Manchester|Vancouver|New Westminster/.test(s.where!.en) && /マンチェスター|バンクーバー|ニューウェストミンスター/.test(s.where!.ja), s.name);
  const ex = schools("manchester").value!.find((s) => s.name === "Express English College")!;
  assert.ok(ex.where!.en.includes("130 Princess Road") && ex.where!.en.includes("M16 7BY") && ex.source!.url === "https://englishuk.com/member-directory?id=6665" && ex.url === "https://expressenglishcollege.co.uk");
  const xl = schools("manchester").value!.find((s) => s.name.startsWith("Excel College"))!; assert.equal(xl.hidden, true, "kept as data, hidden from visitors"); assert.ok(schools("manchester").value!.length === 3 && schools("manchester").value!.filter((s) => !s.hidden).length === 2 && schools("vancouver").value!.every((s) => !s.hidden), "only Excel/UKEC is hidden; the other five stay shown");
  assert.ok(xl.name.includes("UKEC Academy") && xl.note!.ja.includes("未確認") && !xl.url && !/Oxford Street \d|Fairfield Street \d|M1 \d/.test(JSON.stringify(xl)));
  const mc = schools("manchester").value!.find((s) => s.name === "MC Academy")!; assert.ok(!/\d+\s*(Oldham|Mosley)|21-23|M1 1JG|M2 3AN/.test(JSON.stringify(mc)));
  const ef = schools("vancouver").value!.find((s) => s.name === "EF Vancouver")!; assert.ok(!ef.stay, "EF accommodation stays unconfirmed");
  for (const id of ["manchester", "vancouver"]) assert.ok(schools(id).note!.ja.includes("営業状況") && schools(id).status === "unverified");
});
t("the school list renders name, area, courses, accommodation, source link and the 'unverified' badge (ja and en text exist)", () => {
  const out = wrap(h(FactView, { fact: schools("manchester"), kind: "institutions" }));
  assert.ok(out.includes("Express English College") && out.includes("所在地") && out.includes("主なコース") && out.includes("滞在先の手配") && out.includes("English UK") && out.includes("2026-10-15"));
  assert.equal((out.match(/data-testid="institution"/g) ?? []).length, 2, "Excel College / UKEC Academy is hidden");
  assert.ok(!out.includes("Excel College") && !out.includes("UKEC"));
  assert.equal((wrap(h(FactView, { fact: schools("vancouver"), kind: "institutions" })).match(/data-testid="institution"/g) ?? []).length, 3);
  for (const s of [...schools("manchester").value!, ...schools("vancouver").value!]) for (const f of [s.where, s.courses, s.stay, s.note]) if (f) assert.ok(f.en && f.ja);
});
t("first view (education key): language mode names language schools first, university mode keeps universities first", () => {
  const k = keyFigure(getCity("manchester")!, "education"); assert.equal(k.kind, "schools");
  const lang = wrap(h(KeyView, { k, languageFirst: true })).replace(/<[^>]+>/g, ""), uni = wrap(h(KeyView, { k })).replace(/<[^>]+>/g, "");
  assert.ok(lang.includes("語学学校 2校"), "hidden entry is not counted"); assert.ok(lang.indexOf("語学学校") >= 0 && lang.indexOf("語学学校") < lang.indexOf("大学"));
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
