import type { CityProfile, CountryProfile, Fact } from "./schema";
// Runs when the data is loaded (also during `next build`), so a bad entry fails the build instead of reaching users.
type Problem = string;
const isDate = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);

export function checkFact(path: string, f: Fact<unknown>): Problem[] {
  const p: Problem[] = [];
  const hasValue = f.value !== undefined && !(Array.isArray(f.value) && f.value.length === 0);
  if (f.status === "pending" && hasValue) p.push(`${path}: pending facts must not carry a value`);
  if (f.status !== "pending" && !hasValue) p.push(`${path}: ${f.status} fact has no value (use status "pending")`);
  if (f.status === "verified") {
    if (!f.sources?.length) p.push(`${path}: verified fact needs at least one source`);
    f.sources?.forEach((s, i) => { if (!/^https:\/\//.test(s.url)) p.push(`${path}: source ${i} needs an https URL`); if (!s.publisher) p.push(`${path}: source ${i} needs a publisher`); });
    if (!f.period) p.push(`${path}: verified fact needs the period it describes`);
    if (!isDate(f.checkedAt)) p.push(`${path}: verified fact needs checkedAt (YYYY-MM-DD)`);
  }
  if (f.checkedAt && !isDate(f.checkedAt)) p.push(`${path}: checkedAt must be YYYY-MM-DD`);
  const v = f.value as { amount?: number; currency?: string; meanTempC?: number[]; precipMm?: number[] } | undefined;
  if (v && typeof v === "object" && "amount" in v && !/^[A-Z]{3}$/.test(v.currency ?? "")) p.push(`${path}: money needs an ISO currency code`);
  if (v && typeof v === "object" && "meanTempC" in v && (v.meanTempC?.length !== 12 || v.precipMm?.length !== 12)) p.push(`${path}: monthly climate needs 12 values each`);
  return p;
}

/** Walks every Fact inside a profile (any object with a "status" key). */
export function checkProfile(id: string, profile: CityProfile | CountryProfile): Problem[] {
  const out: Problem[] = [];
  const walk = (o: Record<string, unknown>, path: string) => {
    for (const [k, v] of Object.entries(o)) {
      if (v && typeof v === "object" && "status" in v) out.push(...checkFact(`${path}.${k}`, v as Fact<unknown>));
      else if (v && typeof v === "object") walk(v as Record<string, unknown>, `${path}.${k}`);
    }
  };
  walk(profile as unknown as Record<string, unknown>, id);
  return out;
}
