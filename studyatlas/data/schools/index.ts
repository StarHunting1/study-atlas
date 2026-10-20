import { checkProfile } from "../validate";
import { sampleLanguageSchools, sampleUniversities } from "./samples";
import { UNIVERSITY_PROGRAMS, programIssues } from "./universityPrograms";
import { universities } from "./universities";
import type { LanguageSchool, School, SchoolKind, University } from "./types";
export type * from "./types";
/*
 * Read API for schools. Same idea as data/repository.ts: UI code calls these functions only,
 * so the source can later move to a database without touching the screens.
 * Real language schools have not been researched yet, so there are none (no invented entries).
 */
// Programmes recorded in universityPrograms.ts are attached by university id; an incomplete record fails the build.
const real: School[] = universities.map((u) => ({ ...u, programs: [...u.programs, ...(UNIVERSITY_PROGRAMS[u.id] ?? [])] }));
const programProblems = universities.flatMap((u) => (UNIVERSITY_PROGRAMS[u.id] ?? []).flatMap((p) => programIssues(u.id, p)));
if (programProblems.length) throw new Error("University programme data problems:\n" + programProblems.join("\n"));
for (const id of Object.keys(UNIVERSITY_PROGRAMS)) if (!universities.some((u) => u.id === id)) throw new Error(`Programmes for unknown university "${id}"`);
const samples: School[] = [...sampleLanguageSchools, ...sampleUniversities];

const problems = [...real, ...samples].flatMap((s) => checkProfile(s.id, s as unknown as Parameters<typeof checkProfile>[1]));
if (problems.length) throw new Error("School data failed validation:\n" + problems.join("\n"));
if (samples.some((s) => !s.demo)) throw new Error("Sample schools must be marked demo: true");

export function listSchools(kind: SchoolKind, opts: { includeSamples: boolean }): School[] {
  return [...real, ...(opts.includeSamples ? samples : [])].filter((s) => s.kind === kind);
}
export const getSchool = (id: string): School | undefined => [...real, ...samples].find((s) => s.id === id);
export const isLanguage = (s: School): s is LanguageSchool => s.kind === "language";
export const isUniversity = (s: School): s is University => s.kind === "university";
/** Options a school offers: language courses or university programmes. */
export const optionsOf = (s: School) => (isLanguage(s) ? s.courses.map((c) => ({ id: c.id, label: c.name })) : s.programs.map((p) => ({ id: p.id, label: { en: `${p.degree.en} ${p.major.en}`, ja: `${p.degree.ja} ${p.major.ja}` } })));

/** A school can be compared only when it has something to compare (programmes / courses) or is an explicit sample. A listed university without data is "coming soon". */
export const isComparable = (s: School) => !!s.demo || optionsOf(s).length > 0;
