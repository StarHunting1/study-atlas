import { allOfficialData } from "../data/official";
import type { Snapshot } from "./types";
/*
 * Cross-check between published official data (data/official/*) and what the API sources returned
 * (data/collected/snapshot.json). A figure shown on the site that no longer matches its API is reported, so a
 * person can update it in a reviewed PR. Nothing is changed automatically.
 */
export type Consistency = { id: string; collectedId: string; result: "match" | "differs" | "not-collected"; detail?: string };

export function officialConsistency(snap: Snapshot): Consistency[] {
  const out: Consistency[] = [];
  for (const c of allOfficialData()) {
    for (const p of c.points) {
      if (!p.collectedId) continue;
      const r = snap.records[p.collectedId];
      if (!r) { out.push({ id: p.id, collectedId: p.collectedId, result: "not-collected" }); continue; }
      const same = r.value.number === p.value?.amount && (r.period ?? "") === p.validFor.slice(0, (r.period ?? "").length);
      out.push({ id: p.id, collectedId: p.collectedId, result: same ? "match" : "differs", detail: same ? undefined : `site ${p.value?.amount} (${p.validFor}) vs API ${r.value.number} (${r.period})` });
    }
    for (const cl of [c.climate, c.climateAlt]) for (const cid of cl?.collectedIds ?? []) {
      const r = snap.records[cid];
      if (!r) { out.push({ id: cl!.id, collectedId: cid, result: "not-collected" }); continue; }
      const key = ({ "temp-mean": "meanC", "temp-max": "maxC", "temp-min": "minC", precip: "precipMm", tmax: "maxC", tmin: "minC", rain: "precipMm" } as const)[cid.split(":").pop() as "tmax"] ?? "precipMm";
      const site = cl!.months.map((m) => m[key] ?? null);
      const same = JSON.stringify(site) === JSON.stringify(r.value.series ?? []) && r.period === cl!.period;
      out.push({ id: cl!.id, collectedId: cid, result: same ? "match" : "differs", detail: same ? undefined : `site ${JSON.stringify(site)} (${cl!.period}) vs API ${JSON.stringify(r.value.series)} (${r.period})` });
    }
  }
  return out;
}
