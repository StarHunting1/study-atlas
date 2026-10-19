import "./_react";
// Tests for Ver.1.6.5 (living costs and transport): six transport guides, link status kept apart from "content read", living categories without invented numbers.
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { countries, getCity } from "@/data/cities";
import { officialData } from "@/data/official";
import CityOverview from "@/components/overview/CityOverview";
import { LivingBreakdown } from "@/components/overview/LivingBreakdown";
import { TransportGuideDetail } from "@/components/overview/TransportGuide";
import { TRANSPORT_GUIDES, guideOf, guideLink } from "../data/official/transportGuides";
import { CLIMATE_APPROVALS } from "../data/approvals";
import { RENT_APPROVALS } from "../data/official/cityRents";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const wrap = (el: ReturnType<typeof h>) => renderToStaticMarkup(h(I18nProvider, null, el));
const page = (id: string) => wrap(h(CityOverview, { city: getCity(id)!, country: countries.find((x) => x.code === getCity(id)!.country)!, data: officialData(id) }));
const SIX = ["manchester", "vancouver", "toronto", "london", "sydney", "melbourne"];

t("every one of the six cities has a transport guide with an operator, a fares link and (where a page exists) map and student links; no amount or promised discount", () => {
  assert.deepEqual(TRANSPORT_GUIDES.map((g) => g.cityId).sort(), [...SIX].sort());
  for (const g of TRANSPORT_GUIDES) { assert.ok(g.operator, g.cityId); assert.ok(guideLink(g, "fares"), g.cityId); assert.ok(g.links.every((l) => l.url.startsWith("https://")));
    const all = JSON.stringify([g.modes, g.payment, g.paymentShort, g.zones, g.passes, g.student]); assert.ok(!/[$£€]\s?\d|\d\s?(CAD|AUD|GBP)|\d+\.\d\d/.test(all), `${g.cityId}: no fare amount`);
    assert.ok(!/(get|receive|are entitled to|qualify for) a student (discount|fare|pass)/i.test(g.student.en), `${g.cityId}: no promised discount`); assert.ok(/check|confirm|not mentioned|Not confirmed|eligib/i.test(g.student.en)); }
  for (const id of ["manchester", "vancouver"]) { const g = guideOf(id)!; assert.ok(g.read && g.checkedAt === "2026-10-19" && g.payment && g.paymentShort && g.student); assert.ok(guideLink(g, "map") && guideLink(g, "student")); }
  assert.match(guideOf("vancouver")!.student.en, /Language-school students are not mentioned/); assert.match(guideOf("vancouver")!.student.en, /each institution decides eligibility/); assert.match(guideOf("manchester")!.student.en, /does not say that every international or language-school student is eligible/);
  assert.match(guideOf("vancouver")!.zones!.en, /three fare zones/); assert.match(guideOf("manchester")!.payment!.en, /contactless/);
});

t("a link that answered is not described as read: only links whose page was read carry read:true; London and Melbourne (HTTP 403, not retried) have no read link and no summary", () => {
  for (const g of TRANSPORT_GUIDES) for (const l of g.links) { if (l.read) assert.ok(l.opened, `${g.cityId} ${l.url}: read implies opened`); if (!g.read) assert.ok(!l.opened && !l.read, `${g.cityId}: nothing opened when the guide was not read`); }
  assert.equal(guideLink(guideOf("manchester")!, "student")!.read, false); assert.equal(guideLink(guideOf("manchester")!, "student")!.opened, true); assert.equal(guideLink(guideOf("vancouver")!, "map")!.opened, false);
  const man = text(wrap(h(TransportGuideDetail, { cityId: "manchester" }))); assert.ok(man.includes("リンクは確認済みで、内容を読みました") && man.includes("リンクは確認済み（内容は要約に含めていません）") && man.includes("リンク先の動作は未確認"));
  for (const id of ["london", "melbourne"]) { const g = guideOf(id)!; assert.ok(!g.payment && !g.paymentShort && !g.passes); }
});

t("transport card first screen (all six): operator and fares link visible without opening anything; payment line only when the page was read; Manchester's approved transport figure is still there", () => {
  for (const id of SIX) { const html = page(id); const k = html.slice(html.indexOf('data-testid="key-transport"'), html.indexOf('data-testid="more-transport"')); assert.match(k, /data-testid="guide-operator"/, id); assert.match(k, /data-testid="guide-fares"/, id);
    assert.equal(/data-testid="guide-payment-short"/.test(k), guideOf(id)!.read, `${id}: payment line only for a page that was read`); }
  const man = page("manchester"); assert.ok(man.slice(man.indexOf('data-testid="key-transport"'), man.indexOf('data-testid="more-transport"')).includes("£"), "approved Manchester transport figure still shown");
});

t("living card: four categories (transport, food, phone/internet, daily goods) with no invented number; planner link; the fares link only where a guide exists; first screen links the official fares and the planner", () => {
  for (const id of SIX) { const html = wrap(h(LivingBreakdown, { cityId: id })); const tx = text(html); for (const k of ["transport", "food", "telecom", "daily"]) assert.match(html, new RegExp(`data-testid="living-row-${k}"`), `${id} ${k}`);
    assert.match(html, /data-testid="living-breakdown-planner"[^>]*href="\/planner"|href="\/planner"[^>]*data-testid="living-breakdown-planner"/); assert.ok(!/[$£€]\s?\d|\d\s?(CAD|AUD|GBP|円)/.test(tx), `${id}: no amount`); assert.ok(tx.includes("世帯の平均支出の統計は留学生個人の生活費ではない")); assert.ok(tx.includes("自動入力はしません")); }
  for (const id of SIX) { const html = page(id); const k = html.slice(html.indexOf('data-testid="key-living"'), html.indexOf('data-testid="more-living"')); assert.match(k, /data-testid="living-fares-link"/, id); assert.match(k, /data-testid="living-planner-link"/, id); }
});

t("nothing unapproved appears and protected data is unchanged (7 rents, Vancouver and Toronto climate)", () => {
  assert.equal(Object.keys(RENT_APPROVALS).length, 7); assert.equal(RENT_APPROVALS["tor-cmhc-rent-1br"].digest, "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1"); assert.equal(RENT_APPROVALS["mel-abs-census-median-weekly-rent"].digest, "ed4c547df54b47f95701207d8f22bd2a1c01b3e89f96d022713ef353b87a7a91");
  assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020", "tor-climate-eccc-1991-2020"]); assert.equal(CLIMATE_APPROVALS["tor-climate-eccc-1991-2020"].approval.at, "2026-10-19");
  for (const id of ["sydney", "melbourne", "london"]) assert.equal(officialData(id)!.climate, undefined);
});

console.log(n, "Ver.1.6.5 living and transport tests passed");
