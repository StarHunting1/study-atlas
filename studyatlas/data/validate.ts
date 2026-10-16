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
  if (f.claims) {
    const ids = new Set<string>();
    f.claims.forEach((c, i) => {
      const at = `${path}.claims[${c.id ?? i}]`;
      if (!c.id || ids.has(c.id)) p.push(`${at}: claim ids must be unique and non-empty`); ids.add(c.id);
      if (!c.text?.en || !c.text?.ja || !c.conditions?.en || !c.conditions?.ja || !c.review?.reason?.en || !c.review?.reason?.ja) p.push(`${at}: needs text, conditions and a review reason in both languages`);
      if (!c.sources?.length || c.sources.some((x) => !/^https:\/\//.test(x.url) || !x.publisher)) p.push(`${at}: needs https sources with a publisher`);
      if (c.status === "verified") {
        if (!c.period || !isDate(c.checkedAt)) p.push(`${at}: verified claim needs period and checkedAt`);
        if (!c.approval?.by || !isDate(c.approval?.at) || !c.approval?.compared) p.push(`${at}: verified claim needs an approval (who, when YYYY-MM-DD, what was compared): an automated check never verifies`);
        if (c.review.verdict === "hold") p.push(`${at}: a claim on hold cannot be verified`);
      } else if (c.approval) p.push(`${at}: an unverified claim must not carry an approval`);
    });
    const expect = f.claims.every((c) => c.status === "verified") ? "verified" : "unverified";
    if (f.status !== expect) p.push(`${path}: status is derived from its claims (expected ${expect}, found ${f.status})`);
  }
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
