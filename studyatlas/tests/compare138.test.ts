import "./_react";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import QuickCompare from "@/components/overview/QuickCompare";
import { cities, getCity } from "@/data/cities";
import { allOfficialData } from "@/data/official";
import { isFigureShown } from "@/data/official/rights";
import { compareRows, missingReason, pickPoint } from "@/data/official/compare";
import { availability, compareKeys, keyFigure, rentCmp, rentKey, TOPICS, type Key } from "@/lib/overview";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const wrap = (el: unknown) => renderToStaticMarkup(h(I18nProvider, null, el as never)); const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const city = (id: string) => getCity(id)!;
const av = (ids: string[], topic: (typeof TOPICS)[number]) => { const keys = ids.map((i) => keyFigure(city(i), topic)); return availability(keys, compareKeys(keys)); };
const rentAv = (ids: string[]) => { const keys = ids.map((i) => rentKey(city(i))); return availability(keys, rentCmp(keys)); };

t("Manchester × Vancouver: living and student housing have a figure for Manchester only (reference); transport is partial (Vancouver link-only); climate has different periods; the market-rent row is reference only", () => {
  const ids = ["manchester", "vancouver"];
  assert.equal(av(ids, "living"), "partial"); assert.equal(av(ids, "housing"), "partial"); assert.equal(av(ids, "transport"), "partial"); assert.equal(av(ids, "climate"), "reference");
  assert.equal(rentAv(ids), "reference");
});
t("student housing and the general rental market are separate rows: a university hall price never appears as a market rent and a market rent never as a student price", () => {
  for (const c of cities) {
    const h = keyFigure(c, "housing"), r = rentKey(c);
    if (h.kind === "point") assert.notEqual(h.point.audience, "renter", `${c.id}: student row holds no market rent`);
    if (r.kind === "point") { assert.equal(r.point.audience, "renter", `${c.id}: market row holds only market rent`); assert.ok(isFigureShown(r.point)); }
  }
  const m = keyFigure(city("manchester"), "housing"); assert.ok(m.kind === "point" && m.point.audience === "universityStudent" && m.point.housing);
  assert.equal(keyFigure(city("vancouver"), "housing").kind, "none", "Vancouver has no student price: not obtained (UBC held back)");
  const mr = rentKey(city("manchester")), vr = rentKey(city("vancouver"));
  assert.ok(mr.kind === "point" && mr.point.metric === "housing.privateRent.average" && mr.point.value!.currency === "GBP");
  assert.ok(vr.kind === "point" && vr.point.metric === "housing.marketRent.1br" && vr.point.value!.currency === "CAD" && vr.point.status === "verified");
  { const sy = rentKey(city("sydney")); assert.ok(sy.kind === "point" && sy.point.metric === "housing.marketRent.censusMedianWeekly" && sy.point.value!.amount === 470 && sy.point.value!.currency === "AUD" && sy.point.value!.per === "week", "Sydney: approved ABS Census median (Ver.1.6.1)"); }
  const tr = rentKey(city("toronto")); assert.ok(tr.kind === "point" && tr.point.metric === "housing.marketRent.1br" && tr.point.value!.amount === 1761 && tr.point.status === "verified", "Toronto: approved 1-bedroom (Ver.1.5.2)");
});
t("the market-rent row never calls different statistics comparable (ONS vs CMHC: metric, source, currency, year all differ); only the very same statistic could be", () => {
  const keys = ["manchester", "vancouver"].map((i) => rentKey(city(i))); assert.equal(rentCmp(keys), "differ");
  const m = (keys[0] as { point: import("@/data/official/types").DataPoint }).point; const same: Key[] = [{ kind: "point", point: m }, { kind: "point", point: { ...m, id: "x" } }];
  assert.equal(rentCmp(same), "same"); assert.equal(rentCmp([{ kind: "point", point: m }, { kind: "point", point: { ...m, id: "x2", cityId: "other" } }]), "differ", "a city whose rent basis is not recorded (rentBasis.ts) is never comparable (Ver.1.5.1)"); assert.equal(rentCmp([{ kind: "point", point: m }, { kind: "point", point: { ...m, id: "y", validFor: "2020" } }]), "differ");
  assert.equal(rentCmp([{ kind: "point", point: m }, { kind: "none" }]), "missing"); assert.equal(rentCmp([{ kind: "point", point: m }, { kind: "point", point: { ...m, id: "z", status: "unverified" } }]), "unverified");
  assert.notEqual(av(["manchester", "vancouver"], "climate"), "comparable");
});
t("vancouver transport is a link (publisher terms), never a number", () => { assert.equal(keyFigure(city("vancouver"), "transport").kind, "link"); });
t("availability: link-only and not-obtained are told apart; one-sided data is reference only", () => {
  const none: Key = { kind: "none" }, link: Key = { kind: "link", url: "https://x.example", publisher: "X" };
  assert.equal(availability([none, none], "missing"), "notYet"); assert.equal(availability([link, none], "missing"), "linkOnly"); assert.equal(availability([link, link], "missing"), "linkOnly");
  const pt = keyFigure(city("manchester"), "living"); assert.equal(availability([pt, none], "missing"), "partial"); assert.equal(availability([pt, link], "missing"), "partial");
  assert.equal(availability([pt, pt], "same"), "comparable"); assert.equal(availability([pt, pt], "differ"), "reference"); assert.equal(availability([pt, pt], "unverified"), "reference");
});
t("compare rows: a city whose figure is held back says why (link / notice) instead of 'no data'; a city with nothing says no data", () => {
  const row = (id: string) => compareRows.find((r) => r.id === id)!;
  const m = missingReason("vancouver", row("single")); assert.equal(m?.kind, "link"); assert.ok(m?.kind === "link" && /translink\.ca/.test(m.url));
  assert.equal(pickPoint("vancouver", row("single")), undefined, "the held figure is still not picked for display");
  assert.equal(missingReason("vancouver", row("uniHalls"))?.kind, "notice");
  assert.equal(missingReason("vancouver", row("livingTotal")), undefined); assert.equal(missingReason("manchester", row("single")), undefined, "a city with a shown figure has no gap");
});
t("page: two housing rows with their conditions, chips use the states, no ranking words, no number from a held source", () => {
  const html = wrap(h(QuickCompare, { ids: ["manchester", "vancouver"] })); const tx = text(html);
  assert.ok(html.includes('id="cmp-housing"') && html.includes('id="cmp-rent"') && html.indexOf('id="cmp-housing"') < html.indexOf('id="cmp-rent"') && html.indexOf('id="cmp-rent"') < html.indexOf('id="cmp-transport"'));
  assert.ok(tx.includes("学生向け住居費（1人あたり）") && tx.includes("一般賃貸市場の家賃"));
  const rent = html.slice(html.indexOf('id="cmp-rent"'), html.indexOf('id="cmp-transport"')), hous = html.slice(html.indexOf('id="cmp-housing"'), html.indexOf('id="cmp-rent"'));
  assert.ok(/data-av="reference"/.test(rent) && !/data-av="comparable"/.test(rent) && /同じ統計ではないため参考比較です/.test(text(rent)));
  assert.ok(text(rent).includes("ONS") && text(rent).includes("CMHC") && /GBP/.test(rent) && /CAD/.test(rent) && text(rent).includes("2026年8月"), "ONS Aug 2026, CMHC 2025, each currency");
  assert.ok(text(rent).includes("2025年") && text(rent).includes("民間賃貸住宅すべて") && text(rent).includes("バンクーバー都市圏") && text(rent).includes("賃貸世帯全体"), "area, dwelling type, year, audience are shown");
  assert.ok(/£555/.test(hous) && !/1,807/.test(hous) && !/£1,373/.test(hous), "student row: Manchester hall price only, no market rent");
  assert.ok(/料金掲載見合わせ/.test(text(hous)) && !/未取得/.test(text(hous)), "Vancouver student housing: held back, not 'not obtained'");
  assert.ok(html.includes('data-testid="key-link"') && html.includes("translink.ca"), "Vancouver transport is an official link");
  for (const p of allOfficialData().flatMap((d) => d.points).filter((p) => p.value && !isFigureShown(p))) assert.ok(!html.includes(String(p.value!.amount).replace(/\.0+$/, "") + " ") || p.value!.amount < 10, `held figure ${p.metric} not in the page`);
  assert.ok(!/おすすめ|最安|best|cheapest|cheaper|安い/i.test(tx), "no ranking words");
});
t("Vancouver student housing: held back by terms (not 'no data'); wording in ja and en; the notice keeps the eligibility note and the official UBC links; real gaps stay 'not obtained'", () => {
  const { hasHeldNotice } = require("@/data/official/compare") as typeof import("@/data/official/compare"); const { cu } = require("@/locales/compareUi") as typeof import("@/locales/compareUi");
  assert.ok(hasHeldNotice("vancouver", "housing") && !hasHeldNotice("manchester", "housing") && !hasHeldNotice("vancouver", "living"));
  assert.equal(cu.noticeHere.ja, "料金掲載見合わせ"); assert.equal(cu.heldDetail.ja, "公式料金は公開されていますが、利用条件によりStudyAtlasでは数値を掲載していません。");
  assert.ok(cu.noticeHere.en && cu.heldDetail.en && cu.noticeHere.en !== cu.notYet.en);
  const row = compareRows.find((r) => r.id === "uniHalls")!; const m = missingReason("vancouver", row);
  assert.ok(m?.kind === "notice" && /who can apply|入居資格/.test(m.text.en + m.text.ja) && m.links.length > 0 && m.links.every((l) => /ubc\.ca/.test(l.url)));
  const ja = wrap(h(QuickCompare, { ids: ["manchester", "vancouver"] })), tx = text(ja);
  const sec = (id: string, next: string) => text(ja.slice(ja.indexOf(`id="cmp-${id}"`), ja.indexOf(`id="cmp-${next}"`)));
  assert.ok(sec("housing", "rent").includes("料金掲載見合わせ") && !sec("housing", "rent").includes("未取得"));
  assert.ok(sec("living", "housing").includes("未取得"), "a real gap is still 'not obtained'");
});
t("no status was promoted: every compared point keeps its recorded status; nothing is 'verified' that the data does not say", () => {
  const html = wrap(h(QuickCompare, { ids: ["manchester", "toronto"] })); 
  for (const topic of TOPICS) { const keys = ["manchester", "toronto"].map((i) => keyFigure(city(i), topic)); if (keys.some((k) => k.kind === "text")) assert.notEqual(availability(keys, compareKeys(keys)), "comparable", topic); }
});
console.log(n, "comparison data tests passed");
