import { officialSources } from "./sources";
import type { DataPoint, OfficialCityData } from "./types";
import { checkClimate, checkPoint } from "./validate";
import manchester from "./manchester";
import vancouver from "./vancouver";
import toronto from "./toronto";
import london from "./london";
import sydney from "./sydney";
import melbourne from "./melbourne";
// Read API for official city data. Register a new city's file here (and its sources in registry.ts).
const all: OfficialCityData[] = [manchester, vancouver, toronto, london, sydney, melbourne];

const problems = all.flatMap((c) => [...c.points.flatMap((p) => checkPoint(p, officialSources)), ...(c.climate ? checkClimate(c.climate, officialSources) : []), ...(c.climateAlt ? checkClimate(c.climateAlt, officialSources) : [])]);
const dup = all.flatMap((c) => c.points.map((p) => p.id)).filter((id, i, a) => a.indexOf(id) !== i);
if (dup.length) problems.push(`duplicate official data ids: ${dup.join(", ")}`);
if (problems.length) throw new Error(`Invalid official data:\n- ${problems.join("\n- ")}`);

export const officialData = (cityId: string): OfficialCityData | undefined => all.find((c) => c.cityId === cityId);
export const allOfficialData = () => all;
export const pointsOf = (cityId: string, topic?: DataPoint["topic"]) => (officialData(cityId)?.points ?? []).filter((p) => !topic || p.topic === topic);
export { officialSources };
