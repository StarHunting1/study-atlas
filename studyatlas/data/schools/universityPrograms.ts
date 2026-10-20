import { pending, type Fact } from "../schema";
import type { Localized } from "@/lib/i18n";
import type { Price, UniversityProgram } from "./types";
import type { Candidate, CandidateFieldName } from "./universityCandidates";
import { PUBLISHED_PROGRAMS } from "./universityPublished";
/*
 * University programmes (Ver.1.7.2). The research dossier's candidates are in universityCandidates.ts; this file turns a candidate field into a programme fact ONLY when a person has approved its accuracy (PROGRAM_APPROVALS)
 * AND cleared its republication rights (PROGRAM_RIGHTS) AND it has no open issue. Both lists are empty, so UNIVERSITY_PROGRAMS is empty and every university stays "coming soon". StarHunting does not estimate a fee,
 * invent a programme or copy a university-wide figure into a programme. `programIssues` still refuses an incomplete record at build time. Procedure and the per-field blockers: data/UNIVERSITY_INTAKE.md (`npm run universities`).
 */
/** Human approvals of programme facts, key `${universityId}/${programId}/${field}`. A fact becomes "verified" only with an entry here; nothing is generated. */
export const PROGRAM_APPROVALS: Record<string, { by: string; at: string; compared: string }> = {};
/** Rights clearances, same key. SEPARATE from accuracy: a person confirmed that StarHunting may republish this value (terms read, basis, scope "fact" = a bare figure / date, "text" = sentences or a table). Empty: none has been given. */
export type ProgramRight = { by: string; at: string; basis: string; scope: "fact" | "text" };
export const PROGRAM_RIGHTS: Record<string, ProgramRight> = {};
const NOT_A_PERSON = /claude|anthropic|\bai\b|\bbot\b|\bauto|generated|assistant|gpt|llm/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const FIELDS = ["years", "tuitionInternational", "entryRequirements", "applicationPeriod", "campus", "intake", "englishRequirement", "prerequisites"] as const;
/** Problems that keep a programme record out of the build. An empty list means the record is complete, not that its content is right. */
const human = (by?: string) => !!by && !NOT_A_PERSON.test(by);
/** Why a candidate field is (not) publishable. Empty `blockers` = it may be built into a programme record. */
export function publishBlockers(c: Candidate, name: CandidateFieldName, approvals = PROGRAM_APPROVALS, rights = PROGRAM_RIGHTS): string[] {
  const f = c.fields[name]; const key = `${c.uniId}/${c.programId}/${name}`; const b: string[] = []; if (!f) return ["not in the research"];
  for (const i of f.issues) b.push(`open issue: ${i}`);
  const a = approvals[key]; if (!a || !human(a.by) || !DATE.test(a.at) || !a.compared) b.push("needs a human accuracy approval (PROGRAM_APPROVALS)");
  const r = rights[key]; if (!r || !human(r.by) || !DATE.test(r.at) || !r.basis || (f.kind === "text" && r.scope !== "text")) b.push(`needs a rights clearance for republication (PROGRAM_RIGHTS, scope "${f.kind}")`);
  return b;
}
/** Builds programme records from candidates: only fields with no blocker are carried (as verified, dated by the approval); a candidate with no such field produces no programme. */
export function buildPrograms(cands: Candidate[], approvals = PROGRAM_APPROVALS, rights = PROGRAM_RIGHTS): Record<string, UniversityProgram[]> {
  const out: Record<string, UniversityProgram[]> = {};
  for (const c of cands) {
    const ok = (Object.keys(c.fields) as CandidateFieldName[]).filter((n) => !publishBlockers(c, n, approvals, rights).length); if (!ok.length) continue;
    const fact = (n: CandidateFieldName): Fact<never> | undefined => { if (!ok.includes(n)) return undefined; const f = c.fields[n]!; return { status: "verified", value: f.value as never, sources: [f.source], period: f.period, checkedAt: approvals[`${c.uniId}/${c.programId}/${n}`].at, note: f.applicability }; };
    const p: UniversityProgram = { id: c.programId, degree: { en: "Bachelor", ja: "学士" }, major: c.officialName, level: c.level,
      years: (fact("years") ?? pending()) as Fact<number>, tuitionInternational: (fact("tuitionInternational") ?? pending()) as Fact<Price>, entryRequirements: (fact("entryRequirements") ?? pending()) as Fact<Localized>, applicationPeriod: (fact("applicationPeriod") ?? pending()) as Fact<Localized> };
    for (const n of ["campus", "intake", "englishRequirement", "prerequisites"] as const) { const x = fact(n); if (x) p[n] = x as Fact<Localized>; }
    (out[c.uniId] ??= []).push(p);
  }
  return out;
}
/**
 * Programmes shown to users: empty until a person has approved AND cleared the rights of at least one candidate field. They are read from universityPublished.ts, which `npm run universities` writes from
 * the candidates + PROGRAM_APPROVALS + PROGRAM_RIGHTS (a test keeps it current). The candidates themselves are never imported here, so their values are not shipped to the browser.
 */
export const UNIVERSITY_PROGRAMS: Record<string, UniversityProgram[]> = PUBLISHED_PROGRAMS;

export function programIssues(uniId: string, p: UniversityProgram, approvals = PROGRAM_APPROVALS): string[] {
  const e: string[] = []; const at = `${uniId}/${p.id}`;
  if (!p.id || !p.degree?.en || !p.degree?.ja || !p.major?.en || !p.major?.ja) e.push(`${at}: id, degree and major are required in both languages`);
  if (!p.level) e.push(`${at}: level (bachelor / master / …) is required so that different levels are never compared`);
  for (const f of FIELDS) {
    const fact = (p as unknown as Record<string, Fact<unknown> | undefined>)[f]; if (!fact) continue; const where = `${at}.${f}`;
    if (fact.status === "sample") e.push(`${where}: sample data belongs to the demo schools only`);
    if (fact.status === "pending") continue;
    if (!fact.sources?.length || fact.sources.some((s) => !/^https:\/\//.test(s.url) || !s.publisher)) e.push(`${where}: needs an https source with its publisher`);
    if (!fact.period) e.push(`${where}: needs the academic year / period it applies to`);
    if (!DATE.test(fact.checkedAt ?? "")) e.push(`${where}: needs the date it was read (YYYY-MM-DD)`);
    if (fact.status === "verified") { const a = approvals[`${at}/${f}`]; if (!a || !a.by || NOT_A_PERSON.test(a.by) || !DATE.test(a.at) || !a.compared) e.push(`${where}: verified needs a human approval (PROGRAM_APPROVALS: who, when, what was compared)`); }
  }
  const price = p.tuitionInternational?.value as Price | undefined;
  if (price) {
    if (!/^[A-Z]{3}$/.test(price.currency ?? "")) e.push(`${at}.tuitionInternational: ISO currency code required`);
    if (!price.unit) e.push(`${at}.tuitionInternational: billing unit (year / term / course …) required`);
    if (!price.feeYear) e.push(`${at}.tuitionInternational: the fee year is required`);
    if (!price.applicability?.en) e.push(`${at}.tuitionInternational: say who the fee applies to (international students / fee category)`);
    if (!(price.amount > 0)) e.push(`${at}.tuitionInternational: amount must be a published figure`);
  }
  return e;
}
