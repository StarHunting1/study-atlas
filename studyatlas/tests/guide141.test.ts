import "./_react";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import FactView from "@/components/FactView";
import VisaGuide, { cardsFor, hasGuide } from "@/components/overview/VisaGuide";
import { countries, getCity } from "@/data/cities";
import { claimsStatus, displayStatus } from "@/data/factStatus";
import { healthLinks, visaLinks } from "@/data/visa";
import { visaGuides } from "@/data/visaGuide";
import { allClaims } from "@/data/approvalSheet";
let n = 0; const t = (name: string, f: () => void) => { f(); n++; console.log("ok", name); };
const wrap = (el: unknown) => renderToStaticMarkup(h(I18nProvider, null, el as never)); const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const country = (code: string) => countries.find((c) => c.code === code)!; const city = (id: string) => getCity(id)!;
const claims = allClaims();

t("display status: all verified / partly verified / none verified; it is display-only (the stored status and the claims are untouched) and a partly verified group is never 'verified'", () => {
  const v = { status: "verified" as const }, u = { status: "unverified" as const };
  assert.equal(claimsStatus([v, v]), "verified"); assert.equal(claimsStatus([v, u]), "partial"); assert.equal(claimsStatus([u, u]), "unverified"); assert.equal(claimsStatus([]), "unverified"); assert.equal(claimsStatus(undefined, "pending"), "pending");
  const gbr = country("GBR").profile.visa, man = city("manchester").profile.living.healthcare, can = country("CAN").profile.visa;
  assert.equal(gbr.official.status, "unverified"); assert.equal(displayStatus(gbr.official), "partial");   // U1/U2/U6 verified, U4 not
  assert.equal(man.status, "unverified"); assert.equal(displayStatus(man), "partial");                         // U5b verified, U5a not
  assert.equal(gbr.notes.status, "verified"); assert.equal(displayStatus(gbr.notes), "verified");
  assert.equal(displayStatus(can.official), "unverified"); assert.equal(displayStatus(can.notes), "unverified");
  assert.deepEqual(claims.filter((c) => c.status === "verified").map((c) => c.id).sort(), ["U1", "U2", "U3", "U5b", "U6"]);
});
t("Fact badges: a partly verified Fact says 一部確認済み, only its unverified statements carry a badge, verified ones carry none", () => {
  const html = wrap(h(FactView, { fact: country("GBR").profile.visa.official, kind: "text" })); const tx = text(html);
  assert.ok(tx.includes("一部確認済み")); assert.ok(/data-claim="U4"[^>]*data-status="unverified"/.test(html) && /data-claim="U1"[^>]*data-status="verified"/.test(html));
  assert.equal((html.match(/>未確認</g) ?? []).length, 1, "one 未確認 badge: only U4"); assert.ok(!tx.includes("確認済み 確認済み"));
  const en = text(wrap(h(I18nProvider, null, h(FactView, { fact: city("manchester").profile.living.healthcare, kind: "text" })))); assert.ok(en.includes("一部確認済み") || en.includes("Partly verified"));
  const none = wrap(h(FactView, { fact: country("CAN").profile.visa.official, kind: "text" })); assert.ok(text(none).includes("未確認") && !text(none).includes("一部確認済み") && !/>確認済み</.test(none));
});
t("guide cards: the UK shows five route cards (London four: IHS statements belong to the Manchester page), Canada three (Toronto two: the BC card is Vancouver only), Australia none", () => {
  const ids = (c: string) => cardsFor(city(c), country(city(c).country)).map((x) => x.id);
  assert.deepEqual(ids("manchester"), ["gbr-visitor", "gbr-short", "gbr-student", "gbr-check", "gbr-health"]); assert.deepEqual(ids("london"), ["gbr-visitor", "gbr-short", "gbr-student", "gbr-check"]);
  assert.deepEqual(ids("vancouver"), ["can-short", "can-long", "can-health"]); assert.deepEqual(ids("toronto"), ["can-short", "can-long"]);
  assert.ok(!hasGuide(country("AUS")) && !ids("sydney").length);
  assert.ok(!JSON.stringify(visaGuides.CAN).match(/Standard Visitor|Student visa|Short-term|IHS/), "UK routes are never reused for Canada");
});
t("the cards never decide by length alone: the summary names conditions, and the intro lists nationality, age, school accreditation and course type", () => {
  const g = visaGuides.GBR; for (const l of ["en", "ja"] as const) assert.ok(/nationality/.test(g.intro.en) && /国籍/.test(g.intro.ja) && /年齢/.test(g.intro.ja) && /認定/.test(g.intro.ja) && /コースの種類/.test(g.intro.ja));
  const student = g.cards.find((c) => c.id === "gbr-student")!; assert.ok(/licensed student sponsor/.test(student.summary.en) && /Course length alone does not decide/.test(student.summary.en) && /コースの期間だけでは決まりません/.test(student.summary.ja));
  assert.ok(/nationality/.test(g.cards.find((c) => c.id === "gbr-visitor")!.summary.en) && /国籍/.test(g.cards.find((c) => c.id === "gbr-visitor")!.summary.ja) && /ETA/.test(g.cards[0].summary.ja));
  assert.deepEqual(g.cards.slice(0, 3).map((c) => c.route.en), ["Standard Visitor", "Short-term study visa", "Student visa and others"]);
});
t("every statement and every official page is still reachable: all guide claim ids exist; all statements except the held cross-reference appear; every official page of data/visa.ts sits inside a card", () => {
  for (const [code, cs] of [["GBR", "manchester"], ["CAN", "vancouver"]] as const) {
    const cards = cardsFor(city(cs), country(code)); const shown = cards.flatMap((c) => c.claims); const idx = new Set(claims.map((c) => c.id));
    for (const id of shown) assert.ok(idx.has(id), id);
    const url = new Set(cards.flatMap((c) => c.links)); for (const l of [...(visaLinks[code] ?? []), ...(healthLinks[code] ?? [])]) assert.ok(url.has(l.link.value ?? ""), `${code}: ${l.link.value}`);
  }
  const shownAll = new Set([...cardsFor(city("manchester"), country("GBR")), ...cardsFor(city("vancouver"), country("CAN"))].flatMap((c) => c.claims));
  for (const c of claims) assert.equal(shownAll.has(c.id), c.id !== "C4-ref", `${c.id} (only C4-ref, a pointer to the card itself, is not listed)`);
});
t("rendered guide (ja/en): route cards, one status chip per card, details closed at first, no list of links up front, the open-licence notice stays visible, no developer wording", () => {
  for (const [c, code] of [["manchester", "GBR"], ["vancouver", "CAN"]] as const) {
    const html = wrap(h(VisaGuide, { city: city(c), country: country(code) })); const tx = text(html);
    assert.ok(html.includes('data-testid="visa-guide"'));
    assert.equal((html.match(/<a /g) ?? []).length, 0, `${c}: no links before a card is opened`);
    assert.ok(!/data-testid="guide-claim"/.test(html), "details closed at first");
    assert.ok(!/claim|Fact|approvals\.ts|data\/[a-z]/i.test(tx.replace(/Student visa claim/g, "")), `${c}: no developer wording`);
    if (code === "GBR") { assert.ok(html.includes('data-testid="ogl-notice"') && tx.includes("Open Government Licence v3.0")); assert.ok(/確認済み/.test(tx) && /一部確認済み/.test(tx) && />未確認</.test(html)); assert.equal((html.match(/data-testid="guide-[a-z]+-?[a-z]*" data-status/g) ?? []).length, 5); }
  }
});
t("the city page wires the guide in and shows healthcare once (not again under daily life) when a guide health card exists; countries without a guide keep the old list", () => {
  const src = readFileSync("components/overview/CityOverview.tsx", "utf8");
  assert.ok(/hasGuide\(country\) \? <VisaGuide city=\{city\} country=\{country\} \/>/.test(src) && /skip=\{hasGuide\(country\) && cardsFor\(city, country\)\.some\(\(c\) => c\.id\.endsWith\("-health"\)\)/.test(src) && /visaLinks\[country\.code\]/.test(src));
});
t("no developer wording reaches the notes shown to people, and the approval records are untouched", () => {
  for (const f of [country("GBR").profile.visa.official, country("GBR").profile.visa.notes, country("CAN").profile.visa.official, city("manchester").profile.living.healthcare]) for (const l of ["en", "ja"] as const) assert.ok(!/approvals\.ts|data\/|claim|Fact\b/i.test(f.note?.[l] ?? ""), l);
  for (const c of claims.filter((x) => x.status === "verified")) assert.ok(c.approval?.by === "StarHunting1" && c.approval.at === "2026-10-17", c.id);
  for (const id of ["U4", "U5a", "C1", "C2", "C3", "C4a", "C4b", "C4c", "C4-ref"]) assert.equal(claims.find((c) => c.id === id)!.status, "unverified", id);
});
console.log(n, "information UX tests passed");
