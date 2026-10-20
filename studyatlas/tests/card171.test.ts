import "./_react";
// Tests for Ver.1.7.1 (compact school cards, honest check summary, university "coming soon"). Static rendering + pure logic; interactions are checked in the browser.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { listCompareSchools, getCompareSchool } from "@/data/languageSchools";
import { EMPTY_SEL, checkSummary, diffRows, roughArea, toggleSchool } from "@/data/schoolFinder";
import { SchoolCard } from "@/components/schools/SchoolFinder";
import { SchoolCompareView } from "@/components/schools/LanguageSchoolCompare";
import { isComparable, listSchools, optionsOf } from "@/data/schools";
import { parseSchoolView, schoolViewUrl } from "@/lib/journey";
import { PLANS_KEY } from "@/lib/planner";
import { RENT_APPROVALS } from "../data/official/cityRents";
import { CLIMATE_APPROVALS } from "../data/approvals";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const wrap = (el: ReturnType<typeof h>) => renderToStaticMarkup(h(I18nProvider, null, el)); const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
const all = listCompareSchools(); const card = (id: string, open = false) => wrap(h(SchoolCard, { s: getCompareSchool(id)!, sel: EMPTY_SEL, onToggle() {}, detailsOpen: open }));
const sha = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");

t("1. the 13 language schools' data, sources and statuses are exactly those of Ver.1.7.0", () => {
  assert.equal(sha(all.map((s) => [s.id, s.cityId, s.status, s.checkedAt, s.inst, s.factSources])), "669dda0b269e0862762178d9f4178fe116e38a883eab4110861fde4d59c164b9");
});

t("2. the compact card shows the essentials first; opening the details loses nothing (address, full courses, accommodation, every check with its explanation, third-party link, notes)", () => {
  for (const s of all) {
    const closed = card(s.id), open = card(s.id, true), cx = text(closed), ox = text(open);
    assert.match(closed, /data-testid="card-site"/); assert.match(closed, /data-testid="card-compare"/); assert.ok(cx.includes(s.inst.name)); assert.match(closed, /data-testid="card-summary"/); assert.match(closed, /data-testid="card-details"/);
    assert.ok(!/data-testid="card-checks"|data-testid="card-address"/.test(closed), `${s.id}: the long parts are not in the first view`); assert.ok(closed.length < open.length);
    if (s.inst.feesUrl) assert.match(closed, /data-testid="card-fees"/);
    assert.ok(ox.includes(text(`${s.inst.where?.ja}`).slice(0, 60)), `${s.id}: full address text`); assert.ok(ox.includes(`${s.inst.courses?.ja}`.slice(0, 40)), `${s.id}: full courses`); if (s.inst.stay) assert.ok(ox.includes(`${s.inst.stay.ja}`.slice(0, 30)));
    assert.ok(ox.includes(`${s.inst.note?.ja}`.slice(0, 40)), `${s.id}: note kept`); for (const c of s.inst.checks!) { assert.match(open, new RegExp(`data-kind="${c.kind}" data-state="${c.state}"`)); assert.ok(ox.includes(`${c.detail!.ja}`.slice(0, 30)), `${s.id} ${c.kind}: explanation kept`); }
    assert.equal((open.match(/data-kind="(provider|campus|course|accreditation)"/g) ?? []).length, 4);
  }
});

t("3. unconfirmed states are kept and the summary never overstates them", () => {
  for (const s of all) { const cs = checkSummary(s); const st = s.inst.checks!.map((c) => c.state);
    assert.equal(cs.total, 4); assert.equal(cs.third + cs.own + cs.open, 4);
    if (st.some((x) => x === "stated" || x === "notConfirmed" || x === "notChecked")) assert.notEqual(cs.headline, "third", `${s.id}: not everything is backed by a record`);
    if (st.every((x) => x === "stated" || x === "notConfirmed" || x === "notChecked")) assert.ok(["own", "open"].includes(cs.headline), `${s.id}: no third-party item, so no 'backed' headline`);
    assert.match(card(s.id), new RegExp(`data-headline="${cs.headline}"`)); }
  for (const id of ["syd-ilsc", "syd-navitas", "mel-ilsc", "mel-city-language-centre"]) assert.ok(getCompareSchool(id)!.inst.checks!.some((c) => c.kind === "accreditation" && c.state === "notConfirmed"), `${id}: NEAS stays unconfirmed`);
  assert.equal(checkSummary(getCompareSchool("syd-navitas")!).third, 0); assert.equal(checkSummary(getCompareSchool("van-international-house")!).conflict, true, "the directory still shows old addresses: the disagreement is flagged"); assert.deepEqual(all.filter((s) => checkSummary(s).conflict).map((s) => s.id), ["van-international-house"]);
  assert.match(card("van-international-house"), /data-testid="card-conflict"/); assert.ok(text(card("van-international-house")).includes("食い違う"));
  const tx = text(card("tor-kaplan")); assert.ok(!/(おすすめ|最高|優れ|ベスト)/.test(tx) && !/\bbest\b|top\b|recommended/i.test(tx)); assert.ok(text(card("syd-ilsc", true)).includes("評価ではありません"));
});

t("the rough area comes from the existing wording (before the street), in both languages; the street stays in the details", () => {
  assert.equal(roughArea(getCompareSchool("syd-ilsc")!.inst.where, "en"), "Sydney CBD"); assert.equal(roughArea(getCompareSchool("syd-ilsc")!.inst.where, "ja"), "シドニー中心部"); assert.equal(roughArea(getCompareSchool("lon-kaplan")!.inst.where, "en"), "Central London");
  assert.equal(roughArea(getCompareSchool("man-ih-manchester")!.inst.where, "en"), "Manchester city centre"); assert.equal(roughArea(getCompareSchool("van-international-house")!.inst.where, "en"), "New Westminster"); assert.equal(roughArea(undefined, "ja"), "");
  for (const s of all) for (const l of ["en", "ja"]) { const a = roughArea(s.inst.where, l); assert.ok(a.length > 0 && a.length <= 48 && !/\d{3}/.test(a), `${s.id} ${l}: ${a}`); }
});

t("4+5. selection and the URL state still work (1.7.0 behaviour kept)", () => {
  const two = toggleSchool(toggleSchool(EMPTY_SEL, "man-kaplan"), "syd-ilsc"); assert.deepEqual([two.a, two.b], ["man-kaplan", "syd-ilsc"]); assert.deepEqual([toggleSchool(two, "tor-ef").pending], ["tor-ef"]);
  assert.deepEqual(parseSchoolView("?a=man-kaplan&b=syd-ilsc&city=london&pick=1"), { a: "man-kaplan", b: "syd-ilsc", city: "london", pick: true }); assert.equal(schoolViewUrl({ a: "x" }), "?a=x"); assert.match(wrap(h(SchoolCard, { s: getCompareSchool("van-ef")!, sel: { a: "van-ef", b: "", pending: "" }, onToggle() {} })), /data-selected="1"/);
});

t("6. comparison labels match the data: two unconfirmed items are 'includes unconfirmed', never 'same'; two school-only statements say so; missing data is 'cannot be compared'; the order starts with the essentials", () => {
  const a = getCompareSchool("syd-ilsc")!, b = getCompareSchool("syd-navitas")!; assert.equal(diffRows(a, b).kinds.accreditation, "unconfirmed"); assert.notEqual(diffRows(a, b).kinds.accreditation, "same");
  const k1 = getCompareSchool("tor-kaplan")!, k2 = getCompareSchool("lon-kaplan")!; assert.equal(diffRows(k1, k2).kinds.accreditation, "same"); const html = wrap(h(SchoolCompareView, { a: k1, b: k2 })); assert.match(html, /data-testid="diff-kind-accreditation-why"/); assert.ok(text(html).includes("同じ：どちらも学校の記載のみ")); assert.ok(text(html).includes("学校の内容が同じという意味ではありません"));
  const ef1 = getCompareSchool("van-ef")!, ef2 = getCompareSchool("tor-ef")!; assert.ok(text(wrap(h(SchoolCompareView, { a: ef1, b: ef2 }))).includes("同じ：どちらも記録あり"));
  const blank = { ...b, inst: { ...b.inst, checks: undefined, courses: undefined, stay: undefined } }; assert.equal(diffRows(a, blank).checks, "incomparable"); assert.equal(diffRows(a, blank).courses, "incomparable"); assert.equal(diffRows(blank, blank).stay, "incomparable");
  const order = ["row-where", "row-courses", "row-checks", "row-stay", "row-tuition", "row-status"].map((k) => html.indexOf(`data-testid="${k}"`)); assert.ok(order.every((x, i) => x > 0 && (i === 0 || x > order[i - 1])), "where, courses, checks, then stay, fees, status: " + order);
  assert.match(html, /data-testid="school-city-link"/); assert.match(html, /data-testid="school-site"/);
});

t("7+8. universities: none of the 13 listed universities has data to compare, so they are 'coming soon'; samples stay comparable; the page, its storage keys and the university data are intact", () => {
  const real = listSchools("university", { includeSamples: false }); assert.equal(real.length, 13); for (const u of real) { assert.equal(isComparable(u), false, u.id); assert.equal(optionsOf(u).length, 0); assert.equal(u.record.status, "unverified"); assert.equal(u.address.status, "pending"); assert.ok(u.website.value?.startsWith("https://")); }
  const samples = listSchools("university", { includeSamples: true }).filter((u) => u.demo); assert.ok(samples.length >= 2 && samples.every(isComparable), "explicit samples can still be compared");
  assert.equal(sha(real.map((u) => [u.id, u.name, u.cityId, u.record.status, u.website.value, u.programs])), "1c6196154eca81a210f6fffb8592439233efd1cc001466d24baa723f2a03f2fd", "the 13 universities (names, cities, status, links) are exactly those of Ver.1.7.0");
  const page = readFileSync("app/schools/page.tsx", "utf8"); for (const k of ["studyatlas.schools.kind", "studyatlas.schools.compare", "studyatlas.schools.samples"]) assert.ok(page.includes(k), `storage key ${k} kept`);
  for (const w of ['data-testid="uni-coming-soon"', 'data-testid="uni-disabled"', 'data-testid="uni-kept"', "isComparable", 'data-testid="lang-banner"']) assert.ok(page.includes(w), w); assert.ok(!/tuition|ranking|入学条件を|学費は/.test(readFileSync("locales/schoolCompare.ts", "utf8").split("export const up")[1].split("lead:")[0]), "no invented figures in the notice heading");
  const up = readFileSync("locales/schoolCompare.ts", "utf8").split("export const up")[1]; assert.ok(!/[$£€]\s?\d|\d+\s?(円|ドル|ポンド)|ランキング\d|No\.\s?1/.test(up), "no figures or rankings in the preparation notice"); assert.ok(up.includes("収集しておらず"));
});

t("9+10. the planner's saved plans are never touched by this change, and the approved data are unchanged", () => {
  for (const f of ["components/schools/SchoolFinder.tsx", "components/schools/LanguageSchoolCompare.tsx", "app/schools/page.tsx"]) assert.ok(!/PLANS_KEY|calcPlan|importPlan|updatePlan|applyCandidate/.test(readFileSync(f, "utf8")), `${f} does not touch the plan`); assert.equal(PLANS_KEY, "studyatlas.planner.v1");
  assert.equal(Object.keys(RENT_APPROVALS).length, 7); assert.equal(RENT_APPROVALS["tor-cmhc-rent-1br"].digest, "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1"); assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020", "tor-climate-eccc-1991-2020"]); for (const s of all) assert.notEqual(s.status, "verified");
});

console.log(n, "Ver.1.7.1 card, comparison and university tests passed");
