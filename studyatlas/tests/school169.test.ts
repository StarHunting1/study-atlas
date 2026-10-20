import "./_react";
// Tests for Ver.1.6.9 (school discovery and comparison UX). Pure logic + static rendering; the interactions are checked in the browser.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { cities } from "@/data/cities";
import { listCompareSchools, getCompareSchool } from "@/data/languageSchools";
import { EMPTY_SEL, NO_FILTER, cityCounts, diffRows, dismissPending, filterSchools, isFiltered, replaceWithPending, toggleSchool } from "@/data/schoolFinder";
import { SchoolFinder, SelectionTray } from "@/components/schools/SchoolFinder";
import { SchoolCompareView } from "@/components/schools/LanguageSchoolCompare";
import { RENT_APPROVALS } from "../data/official/cityRents";
import { CLIMATE_APPROVALS } from "../data/approvals";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const all = listCompareSchools(); const cityName = (id: string) => cities.find((c) => c.id === id)!.name;
const ids = (f: Partial<typeof NO_FILTER>) => filterSchools(all, { ...NO_FILTER, ...f }, cityName).map((s) => s.id);
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const wrap = (el: ReturnType<typeof h>) => renderToStaticMarkup(h(I18nProvider, null, el));

t("1. a search shows only the schools that match (display name, registered name, city name in either language, address)", () => {
  assert.deepEqual(ids({ q: "kaplan" }).sort(), ["lon-kaplan", "man-kaplan", "tor-kaplan"]); assert.deepEqual(ids({ q: "ILSC" }).sort(), ["mel-ilsc", "syd-ilsc"]);
  assert.deepEqual(ids({ q: "シドニー" }).sort(), ["syd-ilsc", "syd-navitas"]); assert.deepEqual(ids({ q: "  sydney  " }).sort(), ["syd-ilsc", "syd-navitas"]); assert.deepEqual(ids({ q: "ＫＡＰＬＡＮ" }).length, 3, "full-width letters match");
  assert.deepEqual(ids({ q: "kaplan london" }), ["lon-kaplan"], "every word must match"); assert.deepEqual(ids({ q: "no such school" }), []);
});

t("2. the city filter shows only that city's schools, and the counts add up to the 13 schools", () => {
  const c = cityCounts(all); assert.equal(Object.values(c).reduce((a, b) => a + b, 0), 13); assert.deepEqual(Object.keys(c).sort(), ["london", "manchester", "melbourne", "sydney", "toronto", "vancouver"]);
  for (const city of Object.keys(c)) { const r = ids({ city }); assert.equal(r.length, c[city]); assert.ok(r.every((id) => getCompareSchool(id)!.cityId === city)); }
});

t("3+4. search and city combine; clearing returns every school", () => {
  assert.deepEqual(ids({ q: "kaplan", city: "toronto" }), ["tor-kaplan"]); assert.deepEqual(ids({ q: "kaplan", city: "sydney" }), []); assert.equal(isFiltered({ q: "kaplan", city: "", record: "all" }), true);
  assert.equal(ids({ q: "kaplan", city: "toronto" }).length < 13, true); assert.equal(isFiltered(NO_FILTER), false); assert.equal(ids(NO_FILTER).length, 13);
  const third = ids({ record: "third" }), own = ids({ record: "own" }); assert.equal(third.length + own.length, 13); assert.ok(third.every((id) => !own.includes(id))); assert.ok(own.includes("syd-navitas") && third.includes("syd-ilsc"));
});

t("5. the two-school selection is kept as it is, can be removed, and survives a filter change (the selection is separate from the filters)", () => {
  let s = toggleSchool(EMPTY_SEL, "syd-ilsc"); assert.deepEqual([s.a, s.b], ["syd-ilsc", ""]); s = toggleSchool(s, "man-kaplan"); assert.deepEqual([s.a, s.b], ["syd-ilsc", "man-kaplan"]);
  s = toggleSchool(s, "syd-ilsc"); assert.deepEqual([s.a, s.b], ["", "man-kaplan"]); s = toggleSchool(s, "tor-ef"); assert.deepEqual([s.a, s.b], ["tor-ef", "man-kaplan"], "a freed slot is refilled in place");
  assert.equal(filterSchools(all, { ...NO_FILTER, city: "london" }, cityName).some((x) => x.id === s.a), false, "the selected school can be outside the current filter");
});

t("6. a third school is never swapped in silently: it waits, and the person chooses which one it replaces (or cancels)", () => {
  const two = toggleSchool(toggleSchool(EMPTY_SEL, "syd-ilsc"), "syd-navitas"); const p = toggleSchool(two, "tor-ef");
  assert.deepEqual([p.a, p.b, p.pending], ["syd-ilsc", "syd-navitas", "tor-ef"], "nothing changed yet"); assert.deepEqual([replaceWithPending(p, "b").a, replaceWithPending(p, "b").b, replaceWithPending(p, "b").pending], ["syd-ilsc", "tor-ef", ""]);
  assert.deepEqual([replaceWithPending(p, "a").a, replaceWithPending(p, "a").b], ["tor-ef", "syd-navitas"]); assert.deepEqual([dismissPending(p).a, dismissPending(p).b, dismissPending(p).pending], ["syd-ilsc", "syd-navitas", ""]);
  const html = wrap(h(SelectionTray, { all, sel: p, onRemove() {}, onClear() {}, onReplace() {}, onCancel() {} })); const tx = text(html);
  assert.match(html, /role="alert"/); assert.match(html, /data-testid="replace-a"/); assert.match(html, /data-testid="replace-b"/); assert.match(html, /data-testid="replace-cancel"/); assert.ok(tx.includes("比較できるのは2校までです") && tx.includes("EF International Language Campus – Toronto") && tx.includes("ILSC Sydney") && tx.includes("Navitas English – Sydney Hyde Park"));
  assert.ok(!text(wrap(h(SelectionTray, { all, sel: two, onRemove() {}, onClear() {}, onReplace() {}, onCancel() {} }))).includes("比較できるのは2校までです"), "no notice without a third click"); assert.match(wrap(h(SelectionTray, { all, sel: two, onRemove() {}, onClear() {}, onReplace() {}, onCancel() {} })), /data-testid="tray-go"/);
});

t("7. schools in different cities can be compared, and the comparison names the difference without a verdict", () => {
  const a = getCompareSchool("man-kaplan")!, b = getCompareSchool("syd-ilsc")!; assert.notEqual(a.cityId, b.cityId); const html = wrap(h(SchoolCompareView, { a, b })); const tx = text(html);
  assert.match(html, /data-cross-city="true"/); assert.match(html, /data-testid="cross-city"/); assert.ok(!/おすすめ|No\.?1|ベスト|最も|優れ/.test(tx) && !/\bbest\b|recommended|top pick|better school/i.test(tx)); assert.match(html, /data-testid="no-verdict"/);
  assert.match(html, /data-testid="diff-where"[^>]*data-diff="differ"/); assert.match(html, /data-testid="diff-tuition"[^>]*data-diff="incomparable"/); assert.ok(tx.includes("比較できない"));
});

t("difference labels: same / different / includes unconfirmed / cannot be compared, decided per item", () => {
  const a = getCompareSchool("syd-ilsc")!, b = getCompareSchool("syd-navitas")!, d = diffRows(a, b);
  assert.equal(d.kinds.accreditation, "unconfirmed"); assert.equal(d.kinds.provider, "differ", "ILSC: two sources agree; Navitas: the school's statement only");
  assert.equal(diffRows(a, a).where, "same"); assert.equal(diffRows(a, a).checks, "unconfirmed", "the same school twice still has unconfirmed items");
  const noChecks = { ...b, inst: { ...b.inst, checks: undefined, where: undefined, courses: undefined } }; const x = diffRows(a, noChecks); assert.equal(x.checks, "incomparable"); assert.equal(x.where, "incomparable"); assert.equal(x.courses, "incomparable");
  const ef1 = getCompareSchool("van-ef")!, ef2 = getCompareSchool("tor-ef")!; assert.equal(diffRows(ef1, ef2).kinds.accreditation, "same"); assert.equal(diffRows(ef1, ef2).kinds.campus, "same");
  assert.equal(diffRows(getCompareSchool("tor-kaplan")!, getCompareSchool("van-ef")!).kinds.accreditation, "differ");
});

t("finder cards show the essentials without opening anything, never a fee, never 'verified', and 'not confirmed' is not framed as low quality", () => {
  const html = wrap(h(SchoolFinder, { all, sel: EMPTY_SEL, onToggle() {} })); const tx = text(html);
  assert.equal((html.match(/data-testid="school-card"/g) ?? []).length, 13); assert.equal((html.match(/data-testid="card-compare"/g) ?? []).length, 13); assert.equal((html.match(/data-testid="card-site"/g) ?? []).length, 13);
  assert.match(html, /data-testid="school-search"/); assert.match(html, /data-testid="city-all"/); for (const c of ["manchester", "vancouver", "toronto", "london", "sydney", "melbourne"]) assert.match(html, new RegExp(`data-testid="city-${c}"`));
  assert.ok(tx.includes("13校中 13校を表示")); assert.ok(tx.includes("未確認」は学校の質が低いという意味ではなく")); assert.ok(!/[$£€]\s?\d|\d\s?(AUD|CAD|GBP)/.test(tx), "no fee or estimate"); assert.ok(!html.includes("verified") && !/data-testid="(school-)?rank/.test(html));
  assert.ok(!/syd-ilsc|man-kaplan|data-testid=undefined|\bundefined\b|\bnull\b/.test(tx), "no internal id or developer text on screen");
  assert.match(html, /data-testid="card-summary"[^>]*data-headline="(third|partial|own|open)"/); /* Ver.1.7.1: the item-by-item checks moved into the details (closed in static rendering; see tests/card171.test.ts) */ const sel = wrap(h(SchoolFinder, { all, sel: { a: "syd-ilsc", b: "", pending: "" }, onToggle() {} })); assert.match(sel, /data-school="syd-ilsc"[^>]*data-selected="1"/); assert.ok(text(sel).includes("1校目に選択中"));
  const none = wrap(h(SchoolFinder, { all, sel: EMPTY_SEL, onToggle() {}, initial: { q: "zzz", city: "", record: "all" } })); assert.match(none, /data-testid="no-match"/); assert.ok(text(none).includes("この条件に合う学校はありません") && text(none).includes("解除")); assert.match(none, /data-testid="clear-filters-empty"/);
});

t("9+10. school data, sources and statuses are unchanged; approved data are unchanged; no school is verified", () => {
  const digest = createHash("sha256").update(JSON.stringify(listCompareSchools().map((s) => [s.id, s.cityId, s.status, s.checkedAt, s.inst, s.factSources]))).digest("hex");
  assert.equal(digest, "669dda0b269e0862762178d9f4178fe116e38a883eab4110861fde4d59c164b9", "the 13 schools' data and sources are exactly those of Ver.1.6.8");
  for (const s of all) assert.notEqual(s.status, "verified");
  assert.equal(Object.keys(RENT_APPROVALS).length, 7); assert.equal(RENT_APPROVALS["tor-cmhc-rent-1br"].digest, "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1"); assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020", "tor-climate-eccc-1991-2020"]);
});

console.log(n, "Ver.1.6.9 school discovery tests passed");
