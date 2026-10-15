import "./_react";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { getCity } from "@/data/cities";
import { compareHref, getCompareSchool, listCompareSchools } from "@/data/languageSchools";
import { SchoolCompareView } from "@/components/schools/LanguageSchoolCompare";
import FactView from "@/components/FactView";
import { sc } from "@/locales/schoolCompare";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const wrap = (el: unknown) => renderToStaticMarkup(h(I18nProvider, null, el as never));
const view = (a?: string, b?: string) => wrap(h(SchoolCompareView, { a: getCompareSchool(a), b: getCompareSchool(b) }));
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

t("candidates: the five visible schools of both cities; the hidden Excel College / UKEC Academy is never offered, not even by id", () => {
  const ids = listCompareSchools().map((s) => s.id).sort();
  assert.deepEqual(ids, ["man-express-english-college", "man-mc-academy", "van-ef", "van-international-house", "van-sprachcaffe"]);
  assert.equal(getCompareSchool("man-excel-college"), undefined);
  assert.ok(getCity("manchester")!.profile.education.languageSchools.value!.some((s) => s.id === "man-excel-college" && s.hidden), "its data is kept");
  assert.ok(listCompareSchools().every((s) => s.status === "unverified"));
});
t("two schools side by side: location, courses, accommodation, tuition, status, with a school header each; Manchester vs Vancouver works", () => {
  const out = view("man-express-english-college", "van-sprachcaffe");
  for (const k of ["where", "courses", "stay", "tuition", "status"]) assert.ok(out.includes(`data-testid="row-${k}"`), k);
  assert.equal((out.match(/data-testid="school-head"/g) ?? []).length, 2);
  assert.ok(out.includes('data-cross-city="true"') && out.includes("料金は換算・比較しません"));
  const tx = text(out); assert.ok(tx.includes("Express English College") && tx.includes("Sprachcaffe Vancouver") && tx.includes("130 Princess Road") && tx.includes("568 Seymour Street"));
  assert.ok(view("van-ef", "van-sprachcaffe").includes('data-cross-city="false"'));
});
t("unverified stays unverified (badge, check date, note) and is never shown as verified", () => {
  const tx = text(view("man-mc-academy", "van-international-house"));
  assert.ok(tx.includes("未確認") && tx.includes("2026-10-15") && tx.includes("学校公式サイトとの照合はまだです"));
  assert.ok(!tx.replaceAll("確認済み料金はありません", "").includes("確認済み") && !/>\s*確認済み\s*</.test(view("man-mc-academy", "van-international-house")), "no verified badge");
});
t("missing information reads 未取得 (tuition for every school; EF's accommodation) and nothing is guessed", () => {
  const out = view("van-ef", "man-mc-academy"); const tx = text(out);
  assert.ok((out.match(/data-testid="missing"/g) ?? []).length >= 3);
  assert.ok(tx.includes("未取得") && tx.includes("確認済み料金はありません"));
  assert.ok(!/[£$¥]\s?\d|\d\s?(GBP|CAD|円)/.test(tx), "no price figure appears");
  const ef = getCompareSchool("van-ef")!; assert.ok(!ef.inst.stay);
});
t("no verdict: no ranking words or scores; an explicit no-ranking line is shown", () => {
  const out = view("man-express-english-college", "van-international-house"); const tx = text(out);
  assert.ok(out.includes('data-testid="no-verdict"') && tx.includes("優劣を判定しません"));
  assert.ok(!/おすすめ|最安|安い|高い|優れ|best|cheaper|cheapest|score|rank(ed|ing)? #/i.test(tx.replace(sc.noVerdict.en, "").replace("優劣を判定しません", "")));
});
t("International House Vancouver keeps the New Westminster location in the comparison", () => {
  const tx = text(view("van-international-house", "van-ef")); assert.ok(tx.includes("ニューウェストミンスター") && tx.includes("バンクーバー市内ではなく"));
});
t("fewer than two schools: a prompt, no table; details and sources sit in disclosures (closed by default)", () => {
  assert.ok(view("van-ef").includes('data-testid="need-two"') && !view("van-ef").includes("school-compare"));
  const out = view("man-mc-academy", "van-ef"); assert.ok(out.includes('data-testid="compare-more"') && !out.includes("englishuk.com"), "sources are not rendered while closed");
});
t("entry points: each visible school card links to the comparison; hidden or id-less entries do not", () => {
  const f = getCity("manchester")!.profile.education.languageSchools;
  const out = wrap(h(FactView, { fact: f, kind: "institutions" }));
  assert.equal((out.match(/data-testid="compare-link"/g) ?? []).length, 2);
  assert.ok(out.includes(compareHref("man-express-english-college")) && !out.includes("man-excel-college"));
  assert.equal(compareHref("a", "b"), "/schools/compare?a=a&b=b");
});
t("ja and en text exist for every comparison string", () => {
  const walk = (o: unknown) => { if (o && typeof o === "object") { const r = o as Record<string, unknown>; if (typeof r.en === "string" && typeof r.ja === "string") { assert.ok(r.en && r.ja); return; } Object.values(r).forEach(walk); } else assert.fail("bad entry"); };
  walk(sc);
});
console.log(n, "school compare tests passed");
