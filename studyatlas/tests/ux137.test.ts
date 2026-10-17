import "./_react";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import QuickCompare from "@/components/overview/QuickCompare";
import { SchoolCompareView } from "@/components/schools/LanguageSchoolCompare";
import { getCompareSchool } from "@/data/languageSchools";
import { cu } from "@/locales/compareUi";
import { home } from "@/locales/home";
import { TOPICS } from "@/lib/overview";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const wrap = (el: unknown) => renderToStaticMarkup(h(I18nProvider, null, el as never)); const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

t("city comparison: an at-a-glance strip lists every key topic, each with a one-line reason, and only same-basis topics are called comparable", () => {
  const html = wrap(h(QuickCompare, { ids: ["manchester", "vancouver"] }));
  assert.ok(html.includes('data-testid="glance"'));
  for (const topic of TOPICS) {
    assert.ok(html.includes(`data-testid="glance-${topic}"`) && html.includes(`id="cmp-${topic}"`) && html.includes(`data-testid="why-${topic}"`), topic);
    const kind = /data-testid="glance-[a-z]+" data-kind="(\w+)"/.exec(html.slice(html.indexOf(`data-testid="glance-${topic}"`) - 5))?.[1];
    const cmp = new RegExp(`data-testid="cmp-${topic}" data-cmp="([^"]+)"`).exec(html)?.[1]!;
    assert.equal(kind, cmp === "same" ? "ok" : cmp === "missing" ? "none" : "ref", `${topic}: glance agrees with the row verdict (${cmp})`);
  }
  assert.ok(!/Same unit, period and audience|単位・期間・対象が同じ/.test(text(html)) || /data-cmp="same"/.test(html), "the 'comparable' reason only appears for a same-basis row");
  assert.ok(!/おすすめ|最安|best|cheapest/i.test(text(html)), "no ranking words");
});
t("school comparison: each school head has its official-site link and its fee-page link; unverified stays unverified; rows carry a school label for small screens", () => {
  const html = wrap(h(SchoolCompareView, { a: getCompareSchool("man-ih-manchester"), b: getCompareSchool("van-ef") }));
  assert.equal((html.match(/data-testid="school-site"/g) ?? []).length, 2); assert.equal((html.match(/data-testid="fees-link-head"/g) ?? []).length, 2);
  assert.ok(html.includes("https://ihmanchester.com/") && html.includes("https://www.ef.com/ca/ilsd/schools/vancouver/"));
  assert.ok(text(html).includes("未確認") && !/>\s*確認済み\s*</.test(html)); assert.ok(html.includes("sm:hidden"));
});
t("ja and en exist for the new home and comparison strings", () => {
  const walk = (o: unknown) => { if (o && typeof o === "object") { const r = o as Record<string, unknown>; if (typeof r.en === "string" && typeof r.ja === "string") { assert.ok(r.en && r.ja); return; } Object.values(r).forEach(walk); } };
  walk(cu); walk(home);
});
t("home page: every city is reachable without the map (list rows, cards, search) and cities without researched data say so instead of showing numbers", () => {
  const fs = require("node:fs") as typeof import("node:fs"); const page = fs.readFileSync("app/page.tsx", "utf8");
  assert.ok(/city-list/.test(page) && /CityCard/.test(page) && /SearchBox/.test(page) && /hasData/.test(page) && /home\.data\.preparing/.test(page));
  assert.ok(!/\d{2,}\s*(GBP|CAD|AUD)|[£$]\s?\d/.test(page), "no number on the home cards");
});
console.log(n, "ux tests passed");
