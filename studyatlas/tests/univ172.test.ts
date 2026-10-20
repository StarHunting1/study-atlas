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
import { PROGRAM_APPROVALS, PROGRAM_RIGHTS, UNIVERSITY_PROGRAMS, buildPrograms, programIssues, publishBlockers } from "@/data/schools/universityPrograms";
import { priceIssues } from "@/data/comparability";
import { CANDIDATES } from "@/data/schools/universityCandidates";
import { OFFICIAL_PAGE_LINKS, PROGRAMS_UNDER_RESEARCH } from "@/data/schools/universityLinks";
import { ACCESS_REVIEWS } from "../data/official/accessReviews";
import { readdirSync } from "node:fs";
import UniversityInfo, { universityInfoCounts } from "@/components/schools/UniversityInfo";
import { decideAccess } from "../collector/guard";
import { intakeMarkdown, publishedSource, PRIORITY } from "../collector/university-intake";
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

t("1. the 13 universities carry a formal name and main campuses as UNVERIFIED editorial entries, and six official-page slots: pending, or an UNVERIFIED link only where the research dossier named one (never verified)", () => {
  assert.equal(unis.length, 13); for (const u of unis) { assert.equal(u.officialName?.status, "unverified"); assert.equal(u.campuses?.status, "unverified"); assert.ok(u.officialName!.value!.en && u.officialName!.value!.ja && u.campuses!.value!.en && u.campuses!.value!.ja, u.id);
    assert.ok(!u.officialName!.sources && !u.officialName!.checkedAt, `${u.id}: an editorial entry claims no source and no check date`); assert.match(u.officialName!.note!.en, /not yet matched/);
    const given = Object.keys(OFFICIAL_PAGE_LINKS[u.id] ?? {}); for (const k of UNI_PAGE_KINDS) assert.equal(u.officialPages![k].status, given.includes(k) ? "unverified" : "pending", `${u.id} ${k}`); assert.equal(universityInfoCounts(u).verified, 0); assert.equal(universityInfoCounts(u).total, 8); assert.equal(universityInfoCounts(u).pagesPending, 6 - given.length); assert.equal(u.record.status, "unverified"); assert.equal(u.website.status, "unverified"); }
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

t("5. the university information is shown where people look: formal name, campuses, the six official pages (a link only where the dossier named one, labelled unverified), counts, and no fee or score", () => {
  const u = unis.find((x) => x.id === "uom")!; const html = wrap(h(UniversityInfo, { u, defaultOpen: true })); const tx = text(html);
  assert.ok(tx.includes("マンチェスター大学")); assert.match(html, /data-testid="uni-campuses"/); assert.equal((html.match(/data-kind="(programSearch|internationalAdmissions|tuition|deadlines|english|scholarships)"/g) ?? []).length, 6);
  assert.equal((tx.match(/未登録（公式ページの手動確認待ち）/g) ?? []).length, 4); assert.equal((html.match(/data-kind="[a-zA-Z]+" data-state="unverified"/g) ?? []).length, 2, "the two linked pages are unverified"); assert.ok(tx.includes("確認済み 0／8項目")); assert.ok(tx.includes("登録済みプログラム：0件")); assert.ok(tx.includes("推定や比較は行いません")); assert.ok(tx.includes("確認済みにするものではありません"));
  assert.ok(!/[$£€]\s?\d|\bIELTS\b|\d+\s?(円|ドル|ポンド)/.test(tx), "no fee or score"); assert.ok(!wrap(h(UniversityInfo, { u })).includes("data-testid=\"uni-info-body\""), "closed by default");
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


const FIGURES = /35,?300|44,?400|63,?570|72,?260|IELTS|AAA|7\.5|N201|N991|13 Jan|7 Nov|30 Nov|1月13日|11月7日|11月30日/;
const key = (c: (typeof CANDIDATES)[number], f: string) => `${c.uniId}/${c.programId}/${f}`; const cand = (id: string) => CANDIDATES.find((c) => c.uniId === id)!;
const human = { by: "A. Reviewer", at: "2026-11-01", compared: "official page" }; const right = { by: "A. Reviewer", at: "2026-11-01", basis: "terms page, clause fixture", scope: "fact" as const };

t("9. the four front-runner programmes are imported with provenance: ids, official name, level, target year, source URL (https), cohort, applicability, research date, 'candidate-only' state", () => {
  assert.deepEqual(CANDIDATES.map((c) => `${c.uniId}/${c.programId}`), ["uom/bsc-management", "ucl/management-science-bsc", "uoft/rotman-commerce", "unimelb/bachelor-of-commerce"]);
  for (const c of CANDIDATES) { assert.equal(c.level, "bachelor"); assert.equal(c.researchedAt, "2026-10-20"); assert.equal(c.confirmation, "candidate-only"); assert.match(c.researchedBy, /NOT an approval/); assert.ok(c.officialName.en && c.officialName.ja && c.targetYear && /^https:\/\//.test(c.officialUrl)); assert.ok(unis.some((u) => u.id === c.uniId));
    for (const [name, f] of Object.entries(c.fields)) { assert.ok(/^https:\/\//.test(f!.source.url) && f!.source.publisher && f!.period && f!.applicability.en && f!.applicability.ja, `${c.uniId} ${name}`); if (typeof f!.value === "object" && "amount" in f!.value) { assert.match(f!.value.currency, /^[A-Z]{3}$/); assert.ok(f!.value.unit && f!.value.feeYear && f!.value.applicability); } } }
  assert.deepEqual(cand("uom").codes, { ucas: "N201", institution: "M20" }); assert.equal(cand("ucl").codes.ucas, "N991");
  assert.equal(Object.keys(cand("uom").fields).length + Object.keys(cand("ucl").fields).length + Object.keys(cand("uoft").fields).length + Object.keys(cand("unimelb").fields).length, 4 + 5 + 3 + 5);
});

t("10. nothing is publishable: the research is not a human approval, so every candidate field is blocked, PROGRAM_APPROVALS / PROGRAM_RIGHTS are empty and no programme reaches a university", () => {
  assert.deepEqual(PROGRAM_APPROVALS, {}); assert.deepEqual(PROGRAM_RIGHTS, {}); assert.deepEqual(UNIVERSITY_PROGRAMS, {});
  for (const c of CANDIDATES) for (const n of Object.keys(c.fields) as never[]) { const b = publishBlockers(c, n); assert.ok(b.some((x) => /accuracy approval/.test(x)) && b.some((x) => /rights clearance/.test(x)), `${key(c, n)}: ${b}`); }
  for (const u of unis) { assert.equal(u.programs.length, 0); assert.equal(isComparable(u), false); }
});

t("11. unknowns are not filled and wrong-year figures are not data: open issues block Manchester's fee, UCL's English level and 3-year variant, Toronto's English level and deadlines; Toronto and Melbourne have NO fee field; the 2025/26 Toronto figures are 'never publish'", () => {
  const issues = (id: string, f: string) => (cand(id).fields as Record<string, { issues: string[] }>)[f]?.issues ?? [];
  assert.match(issues("uom", "tuitionInternational")[0], /course-details/); assert.match(issues("ucl", "englishRequirement")[0], /NOT confirmed/); assert.match(issues("ucl", "years")[0], /Year in Industry/); assert.match(issues("uoft", "englishRequirement")[0], /not confirmed/); assert.match(issues("uoft", "applicationPeriod")[0], /never merged/);
  assert.equal(cand("uoft").fields.tuitionInternational, undefined); assert.equal(cand("unimelb").fields.tuitionInternational, undefined); assert.ok(cand("uoft").open.some((o) => /Fall 2027 international tuition/.test(o))); assert.ok(cand("unimelb").open.some((o) => /no flat figure/.test(o)));
  assert.deepEqual(cand("uoft").neverPublish.map((x) => x.value), ["CAD 63,570 (2025/26)", "CAD 72,260 (2025/26)"]); assert.ok(cand("uoft").neverPublish.every((x) => /not a 2027 fee/.test(x.why)));
  assert.ok(!JSON.stringify(cand("uoft").fields).match(/63,?570|72,?260/), "the historic figures are not in any field"); assert.equal(cand("ucl").fields.campus, undefined, "the unclear campus is not guessed");
  assert.equal((cand("uom").fields.tuitionInternational!.value as { feeYear: string }).feeYear, "2027 entry"); assert.equal((cand("ucl").fields.tuitionInternational!.value as { feeYear: string }).feeYear, "2027/28");
  assert.equal(cand("unimelb").fields.applicationPeriod!.applicability.en.includes("VTAC"), true);
});

t("12. the publish gate: accuracy approval AND rights clearance AND no open issue are all needed; a tool name is refused; text needs a text scope; only cleared fields are built (as verified, dated by the approval)", () => {
  const A = { [key(cand("uom"), "years")]: human, [key(cand("uom"), "englishRequirement")]: human, [key(cand("uom"), "tuitionInternational")]: human };
  const R = { [key(cand("uom"), "years")]: right, [key(cand("uom"), "englishRequirement")]: right, [key(cand("uom"), "tuitionInternational")]: right };
  assert.deepEqual(buildPrograms(CANDIDATES, A, {}), {}, "approval without rights: nothing"); assert.deepEqual(buildPrograms(CANDIDATES, {}, R), {}, "rights without approval: nothing");
  const built = buildPrograms(CANDIDATES, A, R); const p = built.uom[0]; assert.equal(built.uom.length, 1); assert.equal(Object.keys(built).length, 1);
  assert.equal(p.years.status, "verified"); assert.equal(p.years.value, 3); assert.equal(p.years.checkedAt, "2026-11-01"); assert.equal(p.englishRequirement!.status, "verified");
  assert.equal(p.tuitionInternational.status, "pending", "the open fee issue keeps the fee out even when approved and cleared"); assert.equal(p.entryRequirements.status, "pending"); assert.equal(p.level, "bachelor");
  assert.deepEqual(programIssues("uom", p, A), [], "the built record satisfies the build-time rules");
  assert.deepEqual(buildPrograms(CANDIDATES, { [key(cand("uom"), "years")]: { ...human, by: "ChatGPT" } }, R), {}, "an AI name is not a person"); assert.deepEqual(buildPrograms(CANDIDATES, A, { [key(cand("uom"), "years")]: { ...right, by: "Claude" } }), {});
  const textCand = { ...cand("uom"), fields: { englishRequirement: { ...cand("uom").fields.englishRequirement!, kind: "text" as const } } };
  assert.ok(publishBlockers(textCand, "englishRequirement", A, R).some((x) => /scope "text"/.test(x)), "a copied sentence needs a text-scope clearance"); assert.deepEqual(publishBlockers(textCand, "englishRequirement", A, { [key(cand("uom"), "englishRequirement")]: { ...right, scope: "text" } }), []);
});

t("13. a built fee is still compared honestly: UCL's 2027/28 fee and Manchester's '2027 entry' fee are not set side by side (fee year differs); with fixtures only", () => {
  const clear = (id: string) => ({ ...cand(id), fields: { tuitionInternational: { ...cand(id).fields.tuitionInternational!, issues: [] } } }); const cs = [clear("uom"), clear("ucl")];
  const A = Object.fromEntries(cs.map((c) => [key(c, "tuitionInternational"), human])); const R = Object.fromEntries(cs.map((c) => [key(c, "tuitionInternational"), right])); const b = buildPrograms(cs, A, R);
  const fees = [b.uom[0].tuitionInternational, b.ucl[0].tuitionInternational]; assert.deepEqual(fees.map((f) => f.status), ["verified", "verified"]); const iss = priceIssues(fees, [], ["bachelor", "bachelor"]);
  assert.ok(iss.includes("feeYear") && !iss.includes("currency") && !iss.includes("unit") && !iss.includes("degree"), iss.join()); assert.ok(priceIssues(fees, [], ["bachelor", "master"]).includes("degree"));
});

t("14. users see only names and official links of the programmes under research: no fee, score, date, code or campus appears in the university information; the candidate file is imported by no screen", () => {
  for (const [id, list] of Object.entries(PROGRAMS_UNDER_RESEARCH)) { const u = unis.find((x) => x.id === id)!; const html = wrap(h(UniversityInfo, { u, defaultOpen: true })); const tx = text(html);
    assert.match(html, /data-testid="uni-research"/); for (const p of list) { assert.ok(html.includes(`data-program="${p.id}"`) && tx.includes(p.name.ja) && html.includes(`href="${p.url.replace(/&/g, "&amp;")}"`), `${id} ${p.id}`); }
    assert.ok(tx.includes("調査中のプログラム（内容は未公開）") && tx.includes("人による確認と大学の再利用条件の確認が済むまで公開しません")); assert.ok(!FIGURES.test(tx), `${id}: ${tx.match(FIGURES)}`); }
  const other = unis.find((x) => x.id === "monash")!; assert.ok(!wrap(h(UniversityInfo, { u: other, defaultOpen: true })).includes("uni-research"), "a university with no research shows none");
  const walk = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? (["node_modules", ".next", "tests", "collector"].includes(e.name) ? [] : walk(`${d}/${e.name}`)) : /\.tsx?$/.test(e.name) ? [`${d}/${e.name}`] : []);
  const users = ["app", "components", "lib", "locales"].flatMap(walk).filter((f) => /universityCandidates/.test(readFileSync(f, "utf8"))); assert.deepEqual(users, [], "no screen or component imports the internal candidates");
  const only = readFileSync("data/schools/universityLinks.ts", "utf8").replace(/^\s*\/\*[\s\S]*?\*\//, ""); assert.ok(!/amount|currency|IELTS|£|CAD \d/.test(only), "the shipped link file holds no figure");
});

t("16. the shipped programme list is generated from candidates + approvals + rights and is current; the internal candidates are imported only by the generator, not by the data layer the browser loads", () => {
  assert.equal(readFileSync("data/schools/universityPublished.ts", "utf8"), publishedSource(), "run `npm run universities`"); assert.deepEqual(buildPrograms(CANDIDATES, PROGRAM_APPROVALS, PROGRAM_RIGHTS), {});
  const importers = ["data/schools/index.ts", "data/schools/universityPrograms.ts", "data/schools/universities.ts", "data/schools/universityPublished.ts"].filter((f) => /^import(?! type)[^\n]*universityCandidates/m.test(readFileSync(f, "utf8"))); assert.deepEqual(importers, []);
});

t("15. the guard is untouched: the dossier's URLs are links, not permission; no human review exists; no page body of any named host may be requested", () => {
  assert.deepEqual(ACCESS_REVIEWS, []); for (const links of Object.values(OFFICIAL_PAGE_LINKS)) for (const l of Object.values(links)) { assert.equal(decideAccess(l!.url, "html").allow, false, l!.url); assert.equal(decideAccess(l!.url, "api").allow, false, l!.url); }
  for (const c of CANDIDATES) for (const f of Object.values(c.fields)) assert.equal(decideAccess(f!.source.url, "html").allow, false, f!.source.url);
});

console.log(n, "Ver.1.7.2 university data tests passed");
