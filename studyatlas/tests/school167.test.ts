import "./_react";
// Tests for Ver.1.6.7 (school verification states). No network: nothing here requests a school or register site.
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { SchoolCompareView } from "@/components/schools/LanguageSchoolCompare";
import { getCompareSchool, listCompareSchools, thirdPartyRecord } from "@/data/languageSchools";
import { decideAccess, guardedFetch } from "../collector/guard";
import { RENT_APPROVALS } from "../data/official/cityRents";
import { CLIMATE_APPROVALS } from "../data/approvals";

let n = 0; const t = (name: string, fn: () => void | Promise<void>) => Promise.resolve(fn()).then(() => { n++; console.log("ok", name); });
const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const render = (a: string, b: string, _lang: "ja" | "en") => { return renderToStaticMarkup(h(I18nProvider, null, h(SchoolCompareView, { a: getCompareSchool(a), b: getCompareSchool(b) }))); };
const SHOWN = ["man-express-english-college", "man-ih-manchester", "man-kaplan", "van-international-house", "van-ef", "tor-ef", "tor-kaplan", "lon-kaplan", "lon-frances-king", "syd-ilsc", "syd-navitas", "mel-ilsc", "mel-city-language-centre"];
const KINDS = ["provider", "campus", "course", "accreditation"];

(async () => {
  await t("the 13 shown schools are exactly the compare list, and every one has the four items (registration, campus, courses, accreditation) once each", () => {
    assert.deepEqual(listCompareSchools().map((s) => s.id).sort(), [...SHOWN].sort());
    for (const s of listCompareSchools()) assert.deepEqual((s.inst.checks ?? []).map((c) => c.kind).sort(), [...KINDS].sort(), s.id);
  });

  await t("registration is not confused with campus or courses: a course is never 'confirmed' (the CRICOS course search and the accreditors' course lists were not matched), and a registration is 'confirmed' only with a provider code and a third-party record", () => {
    for (const s of listCompareSchools()) { const st = Object.fromEntries((s.inst.checks ?? []).map((c) => [c.kind, c.state]));
      assert.ok(st.course !== "confirmed" && st.course !== "single", `${s.id}: courses are the school's own statement`);
      if (st.provider === "confirmed") { assert.ok(thirdPartyRecord(s.inst), `${s.id}: registration needs a third-party record`); assert.match((s.inst.checks ?? []).find((c) => c.kind === "provider")!.detail!.en, /\b\d{5}[A-Z]\b/, `${s.id}: provider code`); } }
    for (const id of ["syd-ilsc", "syd-navitas", "mel-ilsc", "mel-city-language-centre"]) { const c = getCompareSchool(id)!.inst.checks!; assert.notEqual(c.find((x) => x.kind === "accreditation")!.state, "confirmed", `${id}: NEAS stays unconfirmed`); assert.equal(c.find((x) => x.kind === "accreditation")!.state, "notConfirmed"); }
  });

  await t("the school's own statement is never counted as a third-party record: 'confirmed' / 'single' need a register or directory of another body; Navitas' only source is its own page", () => {
    for (const s of listCompareSchools()) for (const c of s.inst.checks ?? []) if (c.state === "confirmed" || c.state === "single") assert.ok(thirdPartyRecord(s.inst), `${s.id} ${c.kind}: needs a register / directory record apart from the school`);
    assert.equal(thirdPartyRecord(getCompareSchool("syd-navitas")!.inst), undefined); assert.ok(thirdPartyRecord(getCompareSchool("syd-ilsc")!.inst)); assert.ok(thirdPartyRecord(getCompareSchool("van-ef")!.inst));
    for (const id of ["tor-kaplan", "lon-kaplan", "lon-frances-king"]) { const c = getCompareSchool(id)!.inst.checks!; assert.equal(c.find((x) => x.kind === "accreditation")!.state, "stated", `${id}: accreditation is the school's own statement`); assert.equal(c.find((x) => x.kind === "campus")!.state, "stated"); }
    const st = (id: string, k: string) => getCompareSchool(id)!.inst.checks!.find((c) => c.kind === k)!.state;
    assert.equal(st("van-international-house", "campus"), "stated", "the directory still shows former addresses: only the school's announcement is used"); assert.equal(st("van-ef", "accreditation"), "confirmed"); assert.equal(st("man-kaplan", "accreditation"), "single");
  });

  await t("no school, fact or item is verified, and no approval record was written", () => {
    for (const s of listCompareSchools()) { assert.notEqual(s.status, "verified", s.id); assert.ok(!("approval" in s.inst), s.id); assert.ok(!JSON.stringify(s.inst).includes('"verified"')); }
  });

  await t("comparison page: confirmed and unconfirmed items are told apart in both languages, with the register/directory record kept apart from the school's own site, and no internal id on screen", () => {
    for (const lang of ["ja"] as const) { // static rendering is always Japanese; English is checked below and in the browser
      const html = render("syd-ilsc", "syd-navitas", lang); const tx = text(html);
      assert.match(html, /data-kind="provider" data-state="confirmed"/); assert.match(html, /data-kind="provider" data-state="stated"/); assert.match(html, /data-kind="accreditation" data-state="notConfirmed"/);
      assert.equal((html.match(/data-testid="third-party-record"/g) ?? []).length, 1, "only ILSC has a register record"); assert.equal((html.match(/data-testid="third-party-none"/g) ?? []).length, 1);
      assert.ok(tx.includes(lang === "ja" ? "学校自身の記載のみ" : "School's own statement only")); assert.ok(tx.includes(lang === "ja" ? "確認できていません" : "Could not be confirmed"));
      assert.ok(!/syd-ilsc|syd-navitas|data-testid|undefined|\bnull\b/.test(tx), "no internal id or developer text on screen");
      assert.match(html, /data-testid="school-site"/); assert.match(html, /data-testid="fees-link-head"/);
      assert.ok(!/[$£€]\s?\d|\d\s?(AUD|CAD|GBP)/.test(tx), "no tuition figure is copied");
    }
    for (const sch of listCompareSchools()) for (const c of sch.inst.checks ?? []) { assert.ok(c.detail?.en && c.detail?.ja, `${sch.id} ${c.kind}`); assert.ok(!/[\u3040-\u30ff\u4e00-\u9fff]/.test(c.detail!.en), `${sch.id} ${c.kind}: English text has no Japanese`); }
    const m = render("man-kaplan", "tor-kaplan", "en"); assert.match(m, /data-kind="accreditation" data-state="single"/); assert.match(m, /data-kind="accreditation" data-state="stated"/);
  });

  await t("fail closed: none of the school, register or accreditor hosts may be requested automatically (no rights record), so nothing was checked by a script in this version", async () => {
    for (const u of ["https://search.studyaustralia.gov.au/provider/x", "https://www.studyaustralia.gov.au/en", "https://cricos.education.gov.au/", "https://www.languagescanada.ca/en/listing-directory/students", "https://www.englishuk.com/member-directory?id=878", "https://www.britishcouncil.org/", "https://www.ilsc.com/", "https://www.kaplaninternational.com/", "https://www.navitasenglish.edu.au/", "https://www.ef.com/ca/ilsd/schools/toronto/"])
      for (const k of ["html", "api", "dataset", "status-only", "robots"] as const) { assert.equal(decideAccess(u, k).allow, false, `${k} ${u}`); assert.equal(decideAccess(u, k).state, "unconfirmed"); }
    let calls = 0; await assert.rejects(guardedFetch("https://cricos.education.gov.au/", "html", undefined, { transport: async () => { calls++; return new Response(""); }, paceMs: 0 })); assert.equal(calls, 0);
  });

  await t("approved data are unchanged", () => {
    assert.equal(Object.keys(RENT_APPROVALS).length, 7); assert.equal(RENT_APPROVALS["tor-cmhc-rent-1br"].digest, "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1"); assert.equal(RENT_APPROVALS["syd-abs-census-median-weekly-rent"].digest, "506c97aa71ea3e2cdbea993353f47c6f3f099459bfdec41c6241aa2cac1c73f2");
    assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020", "tor-climate-eccc-1991-2020"]);
  });

  console.log(n, "Ver.1.6.7 school verification tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
