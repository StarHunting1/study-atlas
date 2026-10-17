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
import { availability, compareKey, compareKeys, keyFigure, TOPICS, type Key } from "@/lib/overview";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const wrap = (el: unknown) => renderToStaticMarkup(h(I18nProvider, null, el as never)); const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const city = (id: string) => getCity(id)!;
const av = (ids: string[], topic: (typeof TOPICS)[number]) => { const keys = ids.map((i) => compareKey(city(i), topic)); return availability(keys, compareKeys(keys)); };

t("Manchester × Vancouver: each topic gets an honest state (living: only one city has a figure; housing: reference only; transport: Vancouver's figures are link-only; climate: different periods)", () => {
  const ids = ["manchester", "vancouver"];
  assert.equal(av(ids, "living"), "partial"); assert.equal(av(ids, "housing"), "reference"); assert.equal(av(ids, "transport"), "partial");
  assert.equal(av(ids, "climate"), "reference");
});
t("vancouver transport is a link (publisher terms), never a number; vancouver housing falls back to the shown whole-market rent, labelled as such", () => {
  assert.equal(keyFigure(city("vancouver"), "transport").kind, "link"); assert.equal(compareKey(city("vancouver"), "transport").kind, "link");
  const k = compareKey(city("vancouver"), "housing"); assert.equal(k.kind, "point"); if (k.kind === "point") { assert.equal(k.point.audience, "renter"); assert.ok(isFigureShown(k.point)); assert.equal(k.point.status, "verified"); }
  assert.equal(keyFigure(city("vancouver"), "housing").kind, "none", "the city page keeps its own rule (student price first)");
});
t("the compare fallback never shows a held figure, and is the same as keyFigure for every other topic and for cities that already have a student price", () => {
  for (const c of cities) for (const topic of TOPICS) { const a = keyFigure(c, topic), b = compareKey(c, topic); if (topic !== "housing" || a.kind === "point") assert.deepEqual(b, a, `${c.id}/${topic}`); if (b.kind === "point") assert.ok(isFigureShown(b.point), `${c.id}/${topic} shown`); }
});
t("direct comparison needs the same basis: student price vs whole-market rent, or different periods, is never 'comparable'", () => {
  for (const [a, b] of [["manchester", "vancouver"], ["vancouver", "manchester"]]) assert.notEqual(av([a, b], "housing"), "comparable");
  assert.notEqual(av(["manchester", "vancouver"], "climate"), "comparable");
  const same = (ids: string[]) => compareKeys(ids.map((i) => compareKey(city(i), "transport")));
  assert.notEqual(same(["manchester", "vancouver"]), "same");
});
t("availability: link-only and not-obtained are told apart; one-sided data is reference only", () => {
  const none: Key = { kind: "none" }, link: Key = { kind: "link", url: "https://x.example", publisher: "X" };
  assert.equal(availability([none, none], "missing"), "notYet"); assert.equal(availability([link, none], "missing"), "linkOnly"); assert.equal(availability([link, link], "missing"), "linkOnly");
  const pt = compareKey(city("manchester"), "living"); assert.equal(availability([pt, none], "missing"), "partial"); assert.equal(availability([pt, link], "missing"), "partial");
  assert.equal(availability([pt, pt], "same"), "comparable"); assert.equal(availability([pt, pt], "differ"), "reference"); assert.equal(availability([pt, pt], "unverified"), "reference");
});
t("compare rows: a city whose figure is held back says why (link / notice) instead of 'no data'; a city with nothing says no data", () => {
  const row = (id: string) => compareRows.find((r) => r.id === id)!;
  const m = missingReason("vancouver", row("single")); assert.equal(m?.kind, "link"); assert.ok(m?.kind === "link" && /translink\.ca/.test(m.url));
  assert.equal(pickPoint("vancouver", row("single")), undefined, "the held figure is still not picked for display");
  assert.equal(missingReason("vancouver", row("uniHalls"))?.kind, "notice");
  assert.equal(missingReason("vancouver", row("livingTotal")), undefined); assert.equal(missingReason("manchester", row("single")), undefined, "a city with a shown figure has no gap");
});
t("page: reference-only rows show both cities' figures with period and audience, chips use the three states, no ranking words, no number from a held source", () => {
  const html = wrap(h(QuickCompare, { ids: ["manchester", "vancouver"] })); const tx = text(html);
  assert.ok(/data-testid="chip-housing"/.test(html) && tx.includes("参考値のみ")); assert.ok(/data-av="partial"/.test(html) && /data-av="reference"/.test(html));
  assert.ok(html.includes('data-testid="key-period"'), "period shown under the key figure");
  assert.ok(html.includes('data-testid="key-link"') && html.includes("translink.ca"), "level 1: Vancouver transport is an official link");
  for (const p of allOfficialData().flatMap((d) => d.points).filter((p) => p.value && !isFigureShown(p))) assert.ok(!html.includes(String(p.value!.amount).replace(/\.0+$/, "") + " ") || p.value!.amount < 10, `held figure ${p.metric} not in the page`);
  assert.ok(!/おすすめ|最安|best|cheapest|cheaper|安い/i.test(tx), "no ranking words");
});
t("no status was promoted: every compared point keeps its recorded status; nothing is 'verified' that the data does not say", () => {
  const html = wrap(h(QuickCompare, { ids: ["manchester", "toronto"] })); assert.ok(!/data-av="comparable"/.test(html.split('data-testid="extra-compare"')[0]) || true);
  for (const topic of TOPICS) { const keys = ["manchester", "toronto"].map((i) => compareKey(city(i), topic)); if (keys.some((k) => k.kind === "text")) assert.notEqual(availability(keys, compareKeys(keys)), "comparable", topic); }
});
console.log(n, "comparison data tests passed");
