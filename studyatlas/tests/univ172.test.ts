import "./_react";
// Tests for Ver.1.7.2 (university data structure, programme intake rules, honest comparison). No network; nothing here fetches a university site.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement as h } from "react";
import { I18nProvider } from "@/lib/i18n";
import { isComparable, isUniversity, listSchools, optionsOf } from "@/data/schools";
import { UNI_PAGE_KINDS, type UniversityProgram } from "@/data/schools/types";
import { PROGRAM_APPROVALS, UNIVERSITY_PROGRAMS, programIssues } from "@/data/schools/universityPrograms";
import { priceIssues } from "@/data/comparability";
import UniversityInfo, { universityInfoCounts } from "@/components/schools/UniversityInfo";
import { decideAccess } from "../collector/guard";
import { intakeMarkdown, PRIORITY } from "../collector/university-intake";
import { listCompareSchools } from "@/data/languageSchools";
import { RENT_APPROVALS } from "../data/official/cityRents";
import { CLIMATE_APPROVALS } from "../data/approvals";

let n = 0; const t = (name: string, fn: () => void) => { fn(); n++; console.log("ok", name); };
const wrap = (el: ReturnType<typeof h>) => renderToStaticMarkup(h(I18nProvider, null, el)); const text = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/\s+/g, " ");
const unis = listSchools("university", { includeSamples: false }).filter(isUniversity); const sha = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const L = (en: string, ja: string) => ({ en, ja });
// FIXTURES (not data): a fictional programme used only to exercise the rules
const fx = (o: Partial<UniversityProgram> = {}, fee: Record<string, unknown> = {}): UniversityProgram => ({
  id: "fx-ba", degree: L("Bachelor", "学士"), major: L("Business", "経営"), level: "bachelor",
  years: { status: "unverified", value: 3, sources: [{ url: "https://example.edu/p", publisher: "Example University" }], period: "2026/27", checkedAt: "2026-10-01" },
  tuitionInternational: { status: "unverified", value: { amount: 30000, currency: "GBP", unit: "year", feeYear: "2026/27", applicability: L("International students", "留学生"), tax: "notApplicable", ...fee } as never, sources: [{ url: "https://example.edu/fees", publisher: "Example University" }], period: "2026/27", checkedAt: "2026-10-01" },
  entryRequirements: { status: "pending" }, applicationPeriod: { status: "pending" }, ...o });

t("1. the 13 universities carry a formal name and main campuses as UNVERIFIED editorial entries, and six official pages that are all still pending (no guessed link)", () => {
  assert.equal(unis.length, 13); for (const u of unis) { assert.equal(u.officialName?.status, "unverified"); assert.equal(u.campuses?.status, "unverified"); assert.ok(u.officialName!.value!.en && u.officialName!.value!.ja && u.campuses!.value!.en && u.campuses!.value!.ja, u.id);
    assert.ok(!u.officialName!.sources && !u.officialName!.checkedAt, `${u.id}: an editorial entry claims no source and no check date`); assert.match(u.officialName!.note!.en, /not yet matched/);
    for (const k of UNI_PAGE_KINDS) assert.equal(u.officialPages![k].status, "pending", `${u.id} ${k}`); assert.equal(universityInfoCounts(u).verified, 0); assert.equal(universityInfoCounts(u).total, 8); assert.equal(universityInfoCounts(u).pagesPending, 6); assert.equal(u.record.status, "unverified"); assert.equal(u.website.status, "unverified"); }
  assert.equal(unis.find((u) => u.id === "uom")!.officialName!.value!.en, "The University of Manchester");
});

t("2. no programme was invented: none is recorded, none is comparable, and the universities stay 'coming soon'", () => {
  assert.deepEqual(UNIVERSITY_PROGRAMS, {}); assert.deepEqual(PROGRAM_APPROVALS, {}); for (const u of unis) { assert.equal(u.programs.length, 0); assert.equal(optionsOf(u).length, 0); assert.equal(isComparable(u), false); }
  const src = readFileSync("data/schools/universities.ts", "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, ""); assert.ok(!/tuitionInternational|amount:|currency|IELTS|TOEFL|£\s?\d|\$\s?\d/i.test(src), "no fee, score or currency in the university data");
});

t("3. a programme record without source, year, currency, billing unit, fee year, audience or level is refused; sample data and unapproved 'verified' are refused", () => {
  assert.deepEqual(programIssues("fx", fx()), []);
  const bad: [string, UniversityProgram, RegExp][] = [
    ["no level", fx({ level: undefined }), /level/], ["no source", fx({ years: { status: "unverified", value: 3, period: "2026/27", checkedAt: "2026-10-01" } }), /source/], ["no year", fx({ years: { status: "unverified", value: 3, sources: [{ url: "https://e.edu", publisher: "E" }], checkedAt: "2026-10-01" } }), /academic year/],
    ["no read date", fx({ years: { status: "unverified", value: 3, sources: [{ url: "https://e.edu", publisher: "E" }], period: "2026/27" } }), /date it was read/], ["http source", fx({ years: { status: "unverified", value: 3, sources: [{ url: "http://e.edu", publisher: "E" }], period: "2026/27", checkedAt: "2026-10-01" } }), /https/],
    ["sample", fx({ campus: { status: "sample", value: L("x", "x") } }), /sample/], ["verified without approval", fx({ years: { status: "verified", value: 3, sources: [{ url: "https://e.edu", publisher: "E" }], period: "2026/27", checkedAt: "2026-10-01" } }), /human approval/],
    ["no currency", fx({}, { currency: "pounds" }), /currency/], ["no unit", fx({}, { unit: undefined }), /billing unit/], ["no fee year", fx({}, { feeYear: undefined }), /fee year/], ["no audience", fx({}, { applicability: undefined }), /who the fee applies/], ["zero amount", fx({}, { amount: 0 }), /published figure/],
  ];
  for (const [name, p, re] of bad) assert.ok(programIssues("fx", p).some((x) => re.test(x)), `${name}: ${programIssues("fx", p).join(" | ")}`);
  const ok = fx({ years: { status: "verified", value: 3, sources: [{ url: "https://e.edu", publisher: "E" }], period: "2026/27", checkedAt: "2026-10-01" } });
  assert.deepEqual(programIssues("fx", ok, { "fx/fx-ba/years": { by: "A. Reviewer", at: "2026-10-02", compared: "official programme page" } }), []); assert.ok(programIssues("fx", ok, { "fx/fx-ba/years": { by: "Claude", at: "2026-10-02", compared: "x" } }).some((x) => /human approval/.test(x)), "a tool cannot approve");
});

t("4. comparison only where it is honest: different degree levels, missing level, currencies, billing units, fee years and fee categories are named as reasons, never compared at face value", () => {
  const v = (o: Record<string, unknown> = {}, lv: UniversityProgram["level"] = "bachelor") => fx({ level: lv }, o).tuitionInternational; const ver = (f: ReturnType<typeof v>) => ({ ...f, status: "verified" as const });
  assert.deepEqual(priceIssues([ver(v()), ver(v())], [], ["bachelor", "bachelor"]), [], "same level, year, currency, unit, audience: comparable");
  assert.ok(priceIssues([ver(v()), ver(v())], [], ["bachelor", "master"]).includes("degree")); assert.ok(priceIssues([ver(v()), ver(v())], [], ["bachelor", undefined]).includes("degree"));
  assert.ok(priceIssues([ver(v()), ver(v({ currency: "CAD" }))], [], ["bachelor", "bachelor"]).includes("currency")); assert.ok(priceIssues([ver(v()), ver(v({ unit: "term" }))], [], ["bachelor", "bachelor"]).includes("unit")); assert.ok(priceIssues([ver(v()), ver(v({ feeYear: "2025/26" }))], [], ["bachelor", "bachelor"]).includes("feeYear"));
  assert.ok(priceIssues([ver(v()), ver(v({ applicability: L("Home students", "自国学生") }))], [], ["bachelor", "bachelor"]).includes("applicability")); assert.ok(priceIssues([v(), ver(v())], [], ["bachelor", "bachelor"]).includes("notVerified"), "unverified fees are not compared as real prices");
  assert.deepEqual(priceIssues([ver(v()), ver(v())], [], []), [], "language-school fees (no levels) behave as before");
});

t("5. the university information is shown where people look: formal name, campuses, six official pages (all 'not entered'), counts of confirmed items, and the statement that nothing is estimated", () => {
  const u = unis.find((x) => x.id === "uom")!; const html = wrap(h(UniversityInfo, { u, defaultOpen: true })); const tx = text(html);
  assert.ok(tx.includes("The University of Manchester".length ? "マンチェスター大学" : "")); assert.match(html, /data-testid="uni-campuses"/); assert.equal((html.match(/data-kind="(programSearch|internationalAdmissions|tuition|deadlines|english|scholarships)"/g) ?? []).length, 6);
  assert.equal((tx.match(/未登録（公式ページの手動確認待ち）/g) ?? []).length, 6); assert.ok(tx.includes("確認済み 0／8項目")); assert.ok(tx.includes("登録済みプログラム：0件")); assert.ok(tx.includes("推定や比較は行いません")); assert.ok(tx.includes("確認済みにするものではありません")); assert.ok(!/[$£€]\s?\d|\bIELTS\b|\d+\s?(円|ドル|ポンド)/.test(tx), "no fee or score");
  assert.match(html, /data-state="pending"/); assert.ok(!/href=/.test(html.replace(/<a [^>]*href="https:\/\/www\.manchester[^"]*"/g, "")), "no entered page link yet");
  assert.ok(!wrap(h(UniversityInfo, { u })).includes("data-testid=\"uni-info-body\""), "closed by default");
});

t("6. access: no university host may be requested automatically (UBC is blocked by its rights record), and the intake sheet lists what is missing and is current", () => {
  for (const u of unis) { assert.notEqual(decideAccess(u.website.value!, "api").allow, true, u.id); assert.equal(decideAccess(u.website.value!, "html").allow, false, `${u.id}: page bodies are not read`); }
  assert.equal(decideAccess("https://www.ubc.ca/", "status-only").state, "forbidden"); assert.equal(decideAccess("https://www.ucl.ac.uk/", "status-only").state, "unconfirmed"); assert.deepEqual(PRIORITY, ["uom", "uoft", "unimelb", "ucl"]);
  assert.equal(readFileSync("data/UNIVERSITY_INTAKE.md", "utf8"), intakeMarkdown(), "run `npm run universities`"); const md = intakeMarkdown(); for (const u of unis) assert.ok(md.includes(u.name)); assert.ok(md.includes("(priority)") && md.includes("nothing is estimated") && md.includes("PROGRAM_APPROVALS"));
});

t("7+8. existing data are untouched: language schools (hash), university names / cities / links, approved data; no school is verified", () => {
  assert.equal(sha(listCompareSchools().map((s) => [s.id, s.cityId, s.status, s.checkedAt, s.inst, s.factSources])), "669dda0b269e0862762178d9f4178fe116e38a883eab4110861fde4d59c164b9");
  assert.equal(sha(unis.map((u) => [u.id, u.name, u.cityId, u.record.status, u.website.value, u.programs])), "1c6196154eca81a210f6fffb8592439233efd1cc001466d24baa723f2a03f2fd", "the 13 universities' names, cities, status, links and (empty) programmes are as in Ver.1.7.1");
  assert.equal(Object.keys(RENT_APPROVALS).length, 7); assert.equal(RENT_APPROVALS["tor-cmhc-rent-1br"].digest, "abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1"); assert.deepEqual(Object.keys(CLIMATE_APPROVALS), ["van-climate-eccc-1991-2020", "tor-climate-eccc-1991-2020"]);
  for (const s of listCompareSchools()) assert.notEqual(s.status, "verified"); const page = readFileSync("app/schools/page.tsx", "utf8"); for (const k of ["studyatlas.schools.kind", "studyatlas.schools.compare", "uni-coming-soon", "isComparable", "do not use up the slots"]) assert.ok(page.includes(k), k);
});

console.log(n, "Ver.1.7.2 university data tests passed");
