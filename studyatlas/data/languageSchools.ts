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

const hostOf = (u?: string) => { try { return new URL(u ?? "").hostname.replace(/^www\d?\./, ""); } catch { return ""; } };
/** The record of a body other than the school (a register, a directory of an accrediting or membership body), or undefined when the only source is the school's own site. A school's own statement is never counted as a third-party record. */
export const thirdPartyRecord = (inst: Institution): SourceRef | undefined => inst.record ?? (inst.source && hostOf(inst.source.url) && hostOf(inst.source.url) !== hostOf(inst.url) ? inst.source : undefined);
