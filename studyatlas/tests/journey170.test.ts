import "./_react";
// Tests for Ver.1.7.0 (student journey). Pure logic and static rendering; the real navigation is exercised in the browser.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { listCompareSchools, getCompareSchool } from "@/data/languageSchools";
import { EMPTY_SEL, toggleSchool } from "@/data/schoolFinder";
import { loadLastPair, parsePlannerRef, parseSchoolView, plannerHref, saveLastPair, schoolViewUrl, schoolsCompareHref } from "@/lib/journey";
import { PLANS_KEY } from "@/lib/planner";
import { SchoolCompareView } from "@/components/schools/LanguageSchoolCompare";
import { SelectionTray } from "@/components/schools/SchoolFinder";
import CompareTabs from "@/components/CompareTabs";
import { RENT_APPROVALS } from "../data/official/cityRents";
import { CLIMATE_APPROVALS } from "../data/approvals";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const wrap = (el: ReturnType<typeof h>) => renderToStaticMarkup(h(I18nProvider, null, el)); const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const store = new Map<string, string>(); (globalThis as { localStorage?: unknown }).localStorage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) };

t("1+2. the URL carries the selection: a direct link with a and b opens the comparison, an incomplete link opens the list, pick=1 reopens the list with the pair kept", () => {
  assert.deepEqual(parseSchoolView("?a=syd-ilsc&b=syd-navitas"), { a: "syd-ilsc", b: "syd-navitas", city: "", pick: false });
  assert.equal(parseSchoolView("?a=syd-ilsc").pick, true); assert.equal(parseSchoolView("").pick, true); assert.deepEqual(parseSchoolView("?a=syd-ilsc&b=syd-navitas&pick=1"), { a: "syd-ilsc", b: "syd-navitas", city: "", pick: true });
  const v = parseSchoolView("?a=man-kaplan&b=tor-ef"); assert.equal(schoolViewUrl(v), "?a=man-kaplan&b=tor-ef"); assert.equal(schoolViewUrl({ ...v, pick: true }), "?a=man-kaplan&b=tor-ef&pick=1"); assert.equal(schoolsCompareHref({ city: "london" }), "/schools/compare?city=london");
  const html = wrap(h(SchoolCompareView, { a: getCompareSchool(v.a), b: getCompareSchool(v.b) })); assert.match(html, /data-testid="school-compare"/);
});

t("4. schools in different cities compare (the pair is kept as ids; the comparison says the cities differ and links each city page)", () => {
  const v = parseSchoolView("?a=man-kaplan&b=syd-ilsc"); assert.equal(v.pick, false); const html = wrap(h(SchoolCompareView, { a: getCompareSchool(v.a), b: getCompareSchool(v.b) }));
  assert.match(html, /data-cross-city="true"/); assert.equal((html.match(/data-testid="school-city-link"/g) ?? []).length, 2); assert.match(html, /href="\/city\/manchester"/); assert.match(html, /href="\/city\/sydney"/);
});

t("3. a third school still asks which one to replace (the 1.6.9 behaviour is kept)", () => {
  const two = toggleSchool(toggleSchool(EMPTY_SEL, "man-kaplan"), "syd-ilsc"); const p = toggleSchool(two, "tor-ef"); assert.deepEqual([p.a, p.b, p.pending], ["man-kaplan", "syd-ilsc", "tor-ef"]);
  const tray = wrap(h(SelectionTray, { all: listCompareSchools(), sel: p, onRemove() {}, onClear() {}, onReplace() {}, onCancel() {}, onGo() {} })); assert.match(tray, /data-testid="pending-notice"/);
  assert.match(wrap(h(SelectionTray, { all: listCompareSchools(), sel: two, onRemove() {}, onClear() {}, onReplace() {}, onCancel() {}, onGo() {} })), /<button[^>]*data-testid="tray-go"/, "see the comparison is a button that switches the view, not an anchor far down the page");
});

t("9. invalid parameters fall back safely: unknown ids, the same school twice, markup, long input and an unknown city are dropped", () => {
  for (const q of ["?a=nope&b=also-nope", "?a=<script>alert(1)</script>&b=syd-ilsc", `?a=${"x".repeat(5000)}`, "?a=syd-ilsc&b=syd-ilsc", "?city=atlantis", "?pick=yes", "?a[]=syd-ilsc", "?a=%00&b=%ff"]) { const v = parseSchoolView(q); assert.ok(["", ...listCompareSchools().map((s) => s.id)].includes(v.a) && ["", ...listCompareSchools().map((s) => s.id)].includes(v.b), q); assert.equal(v.city, ""); assert.ok(!(v.a && v.a === v.b)); }
  assert.deepEqual(parseSchoolView("?a=nope&b=syd-ilsc"), { a: "", b: "syd-ilsc", city: "", pick: true }); assert.equal(parseSchoolView("?city=sydney").city, "sydney");
  assert.deepEqual(parsePlannerRef("?schools=syd-ilsc,nope,syd-ilsc,syd-navitas,man-kaplan&cities=sydney,atlantis,london,sydney,toronto,vancouver"), { schools: ["syd-ilsc", "syd-navitas"], cities: ["sydney", "london", "toronto"] }); assert.deepEqual(parsePlannerRef(""), { schools: [], cities: [] });
});

t("6+7. comparison to Planner and back: the links carry ids only and come back to the same comparison; no cost, name or personal input is ever in a URL", () => {
  const to = plannerHref({ schools: ["man-kaplan", "syd-ilsc"], cities: ["manchester", "sydney"] }); assert.equal(to, "/planner?schools=man-kaplan%2Csyd-ilsc&cities=manchester%2Csydney");
  const back = parsePlannerRef(to.split("?")[1]); assert.equal(schoolsCompareHref({ a: back.schools[0], b: back.schools[1] }), "/schools/compare?a=man-kaplan&b=syd-ilsc");
  assert.equal(plannerHref({}), "/planner"); assert.equal(plannerHref({ schools: ["nope"], cities: ["atlantis"] }), "/planner", "unknown ids are never put in a link");
  for (const u of [to, schoolsCompareHref({ a: "man-kaplan", b: "syd-ilsc", city: "london", pick: true })]) assert.deepEqual([...new URLSearchParams(u.split("?")[1]).keys()].filter((k) => !["a", "b", "city", "pick", "schools", "cities"].includes(k)), []);
});

t("8. saved costs are never touched: remembering a school pair uses its own key, and the planner's stored plans are byte-for-byte unchanged", () => {
  const plans = JSON.stringify({ version: 1, activeId: "p1", plans: [{ id: "p1", name: "My plan", note: "x" }], compare: [null, null] }); store.set(PLANS_KEY, plans);
  saveLastPair("man-kaplan", "syd-ilsc"); assert.deepEqual(loadLastPair(), { a: "man-kaplan", b: "syd-ilsc" }); saveLastPair("", ""); assert.deepEqual(loadLastPair(), { a: "", b: "" }); store.set("studyatlas.schoolcompare.last", JSON.stringify({ a: "nope", b: 5 })); assert.deepEqual(loadLastPair(), { a: "", b: "" }, "a damaged entry is ignored");
  assert.equal(store.get(PLANS_KEY), plans);
  for (const f of ["lib/journey.ts", "components/planner/PlannerReference.tsx"]) { const src = readFileSync(f, "utf8"); assert.ok(!/PLANS_KEY|usePersistentState|setStore|calcPlan|importPlan|updatePlan|applyCandidate|candidatesFor/.test(src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")), `${f} does not read or write the plan`); }
});

t("5. both comparison pages share one switch (cities / schools); the planner page shows the reference panel and keeps its own code", () => {
  const html = wrap(h(CompareTabs, { current: "schools" })); assert.match(html, /href="\/compare"/); assert.match(html, /href="\/schools\/compare"[^>]*aria-current="page"|aria-current="page"[^>]*href="\/schools\/compare"/);
  assert.ok(readFileSync("app/planner/page.tsx", "utf8").includes("<PlannerReference />")); assert.ok(readFileSync("app/compare/page.tsx", "utf8").includes("plannerHref({ cities: ids })")); assert.ok(readFileSync("components/overview/CityOverview.tsx", "utf8").includes("/schools/compare?city=${city.id}"));
  assert.ok(text(html).includes("語学学校") && text(html).includes("都市"));
});

t("10. approved data, the 13 schools' data and sources are unchanged", () => {
  const digest = createHash("sha256").update(JSON.stringify(listCompareSchools().map((s) => [s.id, s.cityId, s.status, s.checkedAt, s.inst, s.factSources]))).digest("hex"); assert.equal(digest, "669dda0b269e0862762178d9f4178fe116e38a883eab4110861fde4d59c164b9");
  assert.equal(Object.keys(RENT_APPROVALS).length, 7); assert.equal(RENT_APPROVALS["tor-cmhc-rent-1br"].digest, "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1"); assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020", "tor-climate-eccc-1991-2020"]);
  for (const s of listCompareSchools()) assert.notEqual(s.status, "verified");
});

console.log(n, "Ver.1.7.0 student journey tests passed");
