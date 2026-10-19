import "./_react";
// Tests for Ver.1.5.3 (visibility): the data that already exists is findable from the city page's first screen. Local tests only.
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { countries, getCity } from "@/data/cities";
import { officialData } from "@/data/official";
import CityOverview from "@/components/overview/CityOverview";
import { keyFigure, marketRentSummary, rentKey, transportLinkKey } from "@/lib/overview";
import { listCompareSchools } from "@/data/languageSchools";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const city = (id: string) => getCity(id)!;
const page = (id: string) => { const c = city(id); return renderToStaticMarkup(h(I18nProvider, null, h(CityOverview, { city: c, country: countries.find((x) => x.code === c.country)!, data: officialData(id) }))); };
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const keyOf = (html: string, topic: string) => { const i = html.indexOf(`data-testid="key-${topic}"`); const j = html.indexOf("<button", i); return html.slice(i, j > i ? j : i + 3000); };

t("housing headline: with no student price, the verified whole-market rent is the headline (amount, area, year, 'not a student price') instead of 'reference price in preparation'", () => {
  const tor = keyOf(page("toronto"), "housing"), lon = keyOf(page("london"), "housing");
  const tx = text(tor), lx = text(lon);
  assert.ok(tx.includes("$1,761") && tx.includes("CAD") && tx.includes("トロント都市圏") && tx.includes("2025") && tx.includes("学生向けの料金ではありません") && tx.includes("賃貸市場全体の平均家賃"), tx);
  assert.ok(tx.includes("4件"), "the other sizes are announced"); assert.ok(!tor.includes('data-testid="key-prep"'), "no bare placeholder");
  assert.ok(lx.includes("£2,332") && lx.includes("GBP") && lx.includes("ロンドン地域全体") && lx.includes("2026年8月") && lx.includes("学生向けの料金ではありません"), lx); assert.ok(!lon.includes('data-testid="key-prep"'));
  assert.match(tor, /data-testid="key-market-rent"/);
});

t("the comparison is not affected: the student-housing key stays 'in preparation'; the market rent never becomes a student figure", () => {
  for (const id of ["toronto", "london"]) { const k = keyFigure(city(id), "housing"); assert.equal(k.kind, "none"); const r = rentKey(city(id)); assert.ok(r.kind === "point" && r.point.audience === "renter"); const m = marketRentSummary(city(id))!; assert.equal(m.point.id, r.kind === "point" ? r.point.id : ""); }
  assert.equal(marketRentSummary(city("toronto"))!.count, 4); assert.equal(marketRentSummary(city("london"))!.count, 1);
  assert.equal(keyFigure(city("manchester"), "housing").kind, "point", "Manchester keeps its university-halls headline");
});

t("transport headline: Toronto and London show the official fares link (TTC / TfL), not an unverified description; Vancouver and Manchester keep their own keys", () => {
  const tor = keyOf(page("toronto"), "transport"), lon = keyOf(page("london"), "transport");
  assert.match(tor, /href="https:\/\/www\.ttc\.ca\/fares-and-passes"/); assert.match(lon, /href="https:\/\/tfl\.gov\.uk\/fares"/);
  assert.ok(text(tor).includes("運賃の金額は転載していません") && text(lon).includes("運賃の金額は転載していません"));
  assert.ok(!/\d\s?(CAD|GBP)|[$£]\s?\d/.test(text(tor) + text(lon)), "no fare amount is copied");
  assert.equal(transportLinkKey(city("vancouver")), undefined); assert.equal(transportLinkKey(city("manchester")), undefined);
  assert.ok(text(keyOf(page("vancouver"), "transport")).includes("公式ページで確認"));
});

t("jump links: the five topics are one tap away (anchors to the cards), in the study-mode order", () => {
  for (const id of ["toronto", "london"]) { const html = page(id); assert.match(html, /data-testid="topic-jump"/); for (const k of ["education", "housing", "transport", "living", "climate"]) assert.match(html, new RegExp(`data-testid="jump-${k}" class="[^"]*" ?`) , k); for (const k of ["education", "housing", "transport"]) assert.ok(html.includes(`href="#${k}"`) && html.includes(`id="${k}"`), k); }
});

t("schools: EF Toronto, Kaplan Toronto, Kaplan London and Frances King London are in the compare list and the city's school headline counts them", () => {
  const ids = listCompareSchools().map((s) => s.id); for (const id of ["tor-ef", "tor-kaplan", "lon-kaplan", "lon-frances-king"]) assert.ok(ids.includes(id), id);
  assert.ok(text(keyOf(page("toronto"), "education")).includes("語学学校 2校")); assert.ok(text(keyOf(page("london"), "education")).includes("語学学校 2校"));
});

console.log(n, "Ver.1.5.3 visibility tests passed");
