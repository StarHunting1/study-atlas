import "./_react";
// Tests for Ver.1.6.2 (six-city experience and data quality). Local tests only; no data, approval or licence is changed by this version.
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { countries, getCity } from "@/data/cities";
import { officialData } from "@/data/official";
import CityOverview from "@/components/overview/CityOverview";
import QuickCompare from "@/components/overview/QuickCompare";
import { SchoolCompareView } from "@/components/schools/LanguageSchoolCompare";
import { getCompareSchool, listCompareSchools } from "@/data/languageSchools";
import { rentExplain } from "../data/official/rentExplain";
import { RENT_APPROVALS } from "../data/official/cityRents";
import type { DataPoint } from "../data/official/types";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const SIX = ["manchester", "vancouver", "toronto", "london", "sydney", "melbourne"];
const city = (id: string) => getCity(id)!;
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const page = (id: string) => renderToStaticMarkup(h(I18nProvider, null, h(CityOverview, { city: city(id), country: countries.find((x) => x.code === city(id).country)!, data: officialData(id) })));
const wrap = (el: ReturnType<typeof h>) => renderToStaticMarkup(h(I18nProvider, null, el));
const rent = (id: string): DataPoint => officialData(id)!.points.find((p) => p.topic === "housing" && p.audience === "renter" && (id !== "manchester" || p.metric === "housing.privateRent.average") && (id !== "vancouver" && id !== "toronto" || p.metric === "housing.marketRent.1br"))!;
const why = (a: string, b: string) => rentExplain([rent(a), rent(b)], [city(a).name, city(b).name])!;

t("rent reasons are built from the recorded definitions: the same statistic is named in full (year, area kind, dwellings, average or median, currency, per week or month)", () => {
  const vt = why("vancouver", "toronto"); assert.ok(vt.same); assert.match(vt.ja, /^いずれも2025年の、都市圏/); assert.ok(vt.ja.includes("1ベッドルーム") && vt.ja.includes("平均家賃") && vt.ja.includes("CAD・月額")); assert.match(vt.en, /^Both are the 2025 average rent \(CAD, per month\)/);
  const sm = why("sydney", "melbourne"); assert.ok(sm.same); assert.ok(sm.ja.includes("2021年") && sm.ja.includes("家賃の中央値") && sm.ja.includes("AUD・週額") && sm.ja.includes("大都市圏統計区域")); assert.ok(sm.en.includes("median rent (AUD, per week)"));
  assert.ok(!sm.ja.includes("平均家賃") && !vt.ja.includes("中央値"), "average and median are never mixed up");
});

t("different statistics are 'reference only' and the reason names exactly the parts that differ, with each city's value (no fixed text)", () => {
  const ml = why("manchester", "london"); assert.ok(!ml.same); assert.ok(ml.ja.includes("対象地域の単位が違います") && ml.ja.includes("マンチェスター：1つの地方自治体") && ml.ja.includes("ロンドン：地域全体"));
  for (const wrong of ["対象年", "週額", "中央値", "通貨が違います"]) assert.ok(!ml.ja.includes(wrong), `Manchester vs London do not differ in: ${wrong}`);
  assert.match(ml.en, /Manchester: one local authority, London: a whole region/); assert.ok(!/year differs|currency differs|per week/.test(ml.en));
  const st = why("sydney", "toronto");
  for (const part of ["対象地域の単位が違います", "平均と中央値", "対象年が違います（シドニー：2021年、トロント：2025年）", "週額と月額", "通貨が違います（換算はしません）"]) assert.ok(st.ja.includes(part), part);
  assert.ok(st.ja.includes("週額と月額など") && st.ja.includes("シドニー：週額") && st.ja.includes("トロント：月額")); assert.ok(/never converted/.test(st.en));
  assert.ok(st.ja.includes("数値の優劣は判定せず") && !/安い|cheaper/.test(st.ja + st.en));
  const vm = why("vancouver", "melbourne"); assert.ok(vm.ja.includes("バンクーバー：平均家賃") && vm.ja.includes("メルボルン：家賃の中央値"));
});

t("no reason is invented for a figure without a recorded definition (the caller keeps its generic wording)", () => {
  const halls = officialData("manchester")!.points.find((p) => p.housing)!; assert.equal(rentExplain([halls, rent("london")], [city("manchester").name, city("london").name]), undefined);
  assert.equal(rentExplain([rent("london")], [city("london").name]), undefined);
});

t("the comparison page shows the generated reason for each verdict (Vancouver+Toronto comparable, Sydney+Melbourne comparable, Manchester+London reference, Sydney+Toronto reference)", () => {
  const chipOf = (html: string) => /data-testid="chip-rent"[^>]*>([^<]*)</.exec(html)?.[1];
  const vt = wrap(h(QuickCompare, { ids: ["vancouver", "toronto"] })); assert.equal(chipOf(vt), "比較可能"); assert.ok(text(vt).includes("いずれも2025年の、都市圏"));
  const sm = wrap(h(QuickCompare, { ids: ["sydney", "melbourne"] })); assert.equal(chipOf(sm), "比較可能"); assert.ok(text(sm).includes("いずれも2021年の、大都市圏統計区域"));
  const ml = wrap(h(QuickCompare, { ids: ["manchester", "london"] })); assert.equal(chipOf(ml), "参考値のみ"); assert.ok(text(ml).includes("マンチェスター：1つの地方自治体"));
  const stc = wrap(h(QuickCompare, { ids: ["sydney", "toronto"] })); assert.equal(chipOf(stc), "参考値のみ"); assert.ok(text(stc).includes("シドニー：週額")); assert.ok(!text(stc).includes("同じ統計・同じ期間・同じ通貨です"));
  assert.ok(!text(vt).includes("同じ統計ではありません"), "a comparable pair never carries the 'not the same' text");
});

t("every city page has the five jump links plus 'visa & health' (to the visa section for the UK and Canada, to the visible panel for Australia) and a living-cost note that leads to the Planner without entering anything", () => {
  for (const id of SIX) {
    const html = page(id); for (const k of ["education", "housing", "transport", "living", "climate", "visa-links"]) assert.match(html, new RegExp(`data-testid="jump-${k}"`), `${id}/${k}`);
    assert.match(html, id === "sydney" || id === "melbourne" ? /data-testid="jump-visa-links"[^>]*href="#visa-links"|href="#visa-links"[^>]*data-testid="jump-visa-links"/ : /href="#visa"[^>]*data-testid="jump-visa-links"|data-testid="jump-visa-links"[^>]*href="#visa"/, id);
    assert.match(html, /data-testid="living-planner-link"/); assert.ok(html.includes('href="/planner"'));
    const tx = text(html); assert.ok(tx.includes("StudyAtlasが金額を自動で入れることはありません") && tx.includes("費用プランナーで試算する"), id);
  }
});

t("school compare: registration is shown item by item (institution, campus, courses, accreditation) and never merged; Navitas is never shown as confirmed; no school shows NEAS as confirmed", () => {
  const kinds = (id: string) => Object.fromEntries(getCompareSchool(id)!.inst.checks!.map((c) => [c.kind, c.state]));
  assert.deepEqual(kinds("syd-ilsc"), { provider: "confirmed", campus: "confirmed", course: "stated", accreditation: "notConfirmed" }); assert.deepEqual(kinds("mel-ilsc"), kinds("syd-ilsc"));
  assert.deepEqual(kinds("syd-navitas"), { provider: "stated", campus: "stated", course: "stated", accreditation: "notConfirmed" });
  assert.deepEqual(kinds("mel-city-language-centre"), { provider: "confirmed", campus: "single", course: "notChecked", accreditation: "notConfirmed" });
  for (const s of listCompareSchools().filter((x) => /^(syd|mel)-/.test(x.id))) { const c = s.inst.checks!; assert.equal(c.length, 4); assert.ok(c.every((x) => x.detail && x.detail.en && x.detail.ja)); assert.ok(!c.some((x) => x.kind === "course" && x.state === "confirmed"), "no course is confirmed against the register"); assert.ok(!c.some((x) => x.kind === "accreditation" && x.state !== "notConfirmed")); }
  const nav = getCompareSchool("syd-navitas")!.inst.checks![0].detail!; assert.match(nav.en, /NOT matched against the register/); assert.match(nav.ja, /照合はできていません/);
  const html = wrap(h(SchoolCompareView, { a: getCompareSchool("syd-ilsc"), b: getCompareSchool("syd-navitas") })); const tx = text(html);
  assert.equal((html.match(/data-testid="school-checks"/g) ?? []).length, 2); for (const k of ["機関の登録（CRICOS機関など）", "キャンパスの所在地", "コース（登録されたコース番号）", "認定（NEASなど）", "2つの情報源で一致", "学校自身の記載のみ", "確認できていません"]) assert.ok(tx.includes(k), k);
  assert.ok(tx.includes("「一致」は、現在募集中であることや料金が正しいことを意味しません"));
  const navHtml = html.slice(html.lastIndexOf('data-testid="school-checks"')); assert.ok(!/data-kind="provider" data-state="confirmed"/.test(navHtml), "Navitas provider is not 'confirmed'");
  assert.match(html, /data-testid="official-name"/);
});

t("schools without item-by-item checks say so instead of implying a registration was confirmed", () => {
  const html = wrap(h(SchoolCompareView, { a: getCompareSchool("man-kaplan"), b: getCompareSchool("tor-ef") })); assert.equal((html.match(/data-testid="school-checks-none"/g) ?? []).length, 2); assert.ok(text(html).includes("項目ごとには確認していません"));
});

t("protected data: the seven rent approvals keep their digests and records (nothing is re-approved or edited by this version)", () => {
  const want: Record<string, string> = {
    "tor-cmhc-rent-bachelor": "4a79633baf6e7b89bdd7e14393229e1674567a418856ca355e824e5739eab8cf", "tor-cmhc-rent-1br": "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1",
    "syd-abs-census-median-weekly-rent": "506c97aa71ea3e2cdbea993353f47c6f3f099459bfdec41c6241aa2cac1c73f2", "mel-abs-census-median-weekly-rent": "ed4c547df54b47f95701207d8f22bd2a1c01b3e89f96d022713ef353b87a7a91",
  };
  for (const [id, d] of Object.entries(want)) assert.equal(RENT_APPROVALS[id].digest, d, id);
  assert.equal(Object.keys(RENT_APPROVALS).length, 7); for (const a of Object.values(RENT_APPROVALS)) assert.equal(a.approvedBy, "StarHunting1");
});

console.log(n, "Ver.1.6.2 quality tests passed");
