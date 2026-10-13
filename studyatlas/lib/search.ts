import { cities, countries } from "@/data/cities";
export type Hit = { type: "country" | "city"; id: string };
// Local search over registered data only. Add external/AI providers in app/api/search/route.ts.
export function localSearch(q: string): Hit[] {
  const s = q.trim().toLowerCase(); if (!s) return [];
  const m = (v: string[]) => v.some((x) => x.toLowerCase().includes(s));
  const ccAlias: Record<string, string[]> = { CAN: ["canada"], GBR: ["uk", "england", "britain"], AUS: ["australia"] };
  return [
    ...countries.filter((c) => m([...Object.values(c.name), ...ccAlias[c.code]])).map((c) => ({ type: "country" as const, id: c.code })),
    ...cities.filter((c) => m([...Object.values(c.name), ...c.areas, ...c.schools, ...Object.values(c.blurb), ...Object.values(c.climate), ...Object.values(c.student), ...(ccAlias[c.country] ?? []), ...countries.filter((k) => k.code === c.country).flatMap((k) => Object.values(k.name))]))
      .map((c) => ({ type: "city" as const, id: c.id })),
  ];
}
