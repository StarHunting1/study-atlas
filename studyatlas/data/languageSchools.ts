import { cities } from "./cities";
import type { Institution, SourceRef, Status } from "./schema";
import type { Localized } from "@/lib/i18n";
/*
 * Language schools that can be compared (Ver.1.2.8): read from the city profiles (education.languageSchools), no new data.
 * A school is offered only if it has an id, is not `hidden`, and its fact is not "pending". Nothing is added or inferred here.
 */
export type CompareSchool = { id: string; cityId: string; inst: Institution; status: Status; checkedAt?: string; factNote?: Localized; factSources: SourceRef[] };

export function listCompareSchools(): CompareSchool[] {
  return cities.flatMap((c) => {
    const f = c.profile.education.languageSchools; if (!f.value || f.status === "pending") return [];
    return f.value.filter((i): i is Institution & { id: string } => !!i.id && !i.hidden).map((inst) => ({ id: inst.id, cityId: c.id, inst, status: f.status, checkedAt: f.checkedAt, factNote: f.note, factSources: f.sources ?? [] }));
  });
}
export const getCompareSchool = (id: string | null | undefined) => (id ? listCompareSchools().find((s) => s.id === id) : undefined);
export const compareHref = (a: string, b?: string) => `/schools/compare?a=${encodeURIComponent(a)}${b ? `&b=${encodeURIComponent(b)}` : ""}`;
