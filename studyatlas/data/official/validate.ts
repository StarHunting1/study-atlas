import type { ClimateNormals, DataPoint } from "./types";
import type { OfficialSource } from "./sources";
// Load-time checks for official data (a failing check fails `next build`). See data/README.md.
const isDate = (s?: string) => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const hasBoth = (l?: Record<string, string>) => !!l?.en && !!l?.ja;

/** Numbers as written on a page ("1,234.50" → "1234.50"), used to check that a quote really contains the value. */
export const numbersIn = (s: string) => (s.match(/\d[\d,]*(\.\d+)?/g) ?? []).map((n) => n.replace(/,/g, ""));
const sameNumber = (a: string, b: number) => Number(a) === b;

export function checkPoint(p: DataPoint, sources: OfficialSource[]): string[] {
  const e: string[] = []; const at = `official ${p.id}`;
  const src = sources.find((s) => s.id === p.sourceId);
  if (!src) e.push(`${at}: unknown sourceId ${p.sourceId}`);
  if (src && !src.cityIds.includes(p.cityId)) e.push(`${at}: source ${p.sourceId} is not registered for ${p.cityId}`);
  if (!hasBoth(p.label) || !hasBoth(p.conditions)) e.push(`${at}: label and conditions need en and ja`);
  if (!p.validFor) e.push(`${at}: validFor (fare year / academic year / survey period) is required`);
  if (!p.value && !p.text) e.push(`${at}: needs a value or a text`);
  if (p.value && !/^[A-Z]{3}$/.test(p.value.currency)) e.push(`${at}: ISO currency code required`);
  if (p.value?.per === "contract" && !p.housing?.contractWeeks) e.push(`${at}: a per-contract amount needs housing.contractWeeks`);
  if (p.audience === "universityStudent" && !p.housing && !/universit|college/i.test(p.conditions.en)) e.push(`${at}: university-only figures must name the university in conditions`);
  if (!p.evidence.length) e.push(`${at}: evidence (url, publisher, section, quote) is required`);
  for (const ev of p.evidence) {
    if (!/^https:\/\//.test(ev.url) || !ev.publisher || !hasBoth(ev.section) || !ev.quote) e.push(`${at}: evidence needs https url, publisher, section (en/ja) and a verbatim quote`);
    if (src && !src.pages.some((u) => ev.url.startsWith(u) || u.startsWith(ev.url))) e.push(`${at}: evidence url ${ev.url} is not one of source ${src.id}'s pages`);
  }
  // The amount must literally appear in the quoted source text (guards against typos when transcribing)
  if (p.value) for (const n of [p.value.amount, p.value.max].filter((x): x is number => x !== undefined))
    if (!p.evidence.some((ev) => numbersIn(ev.quote).some((q) => sameNumber(q, n)))) e.push(`${at}: amount ${n} does not appear in any evidence quote`);
  if (!isDate(p.retrievedAt)) e.push(`${at}: retrievedAt must be YYYY-MM-DD`);
  if (p.status === "verified" && !isDate(p.checkedAt)) e.push(`${at}: verified data needs checkedAt`);
  if (p.status === "pending" && (p.value || p.text)) e.push(`${at}: pending data must not carry a value`);
  if (p.status === "sample") e.push(`${at}: official data cannot be a demo sample`);
  return e;
}

export function checkClimate(c: ClimateNormals, sources: OfficialSource[]): string[] {
  const e: string[] = []; const at = `official climate ${c.id}`;
  if (!sources.some((s) => s.id === c.sourceId)) e.push(`${at}: unknown sourceId ${c.sourceId}`);
  if (c.months.length !== 12) e.push(`${at}: 12 months required`);
  if (!c.station || !c.period) e.push(`${at}: station and period are required`);
  if (!c.evidence.length) e.push(`${at}: evidence required`);
  if (!isDate(c.retrievedAt)) e.push(`${at}: retrievedAt must be YYYY-MM-DD`);
  if (c.status === "verified" && !isDate(c.checkedAt)) e.push(`${at}: verified data needs checkedAt`);
  if (c.status === "verified" && !c.collectedIds?.length && !(c.approval?.by && isDate(c.approval?.at) && c.approval?.compared)) e.push(`${at}: verified data needs an API record (collectedIds) or a person's approval (who, when, what was compared)`);
  if (c.approval && c.status !== "verified") e.push(`${at}: a record that is not verified must not carry an approval`);
  return e;
}
