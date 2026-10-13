// Raw city registry. One file per city in data/city/ (+ data/profiles/); register new ones here (order = display order).
// Read data through data/repository.ts (or the @/data/cities facade), not from here, so validation always runs.
import vancouver from "./city/vancouver";
import toronto from "./city/toronto";
import manchester from "./city/manchester";
import london from "./city/london";
import sydney from "./city/sydney";
import melbourne from "./city/melbourne";
import type { City } from "./types";
export { countries } from "./countries";
export const cities: City[] = [vancouver, toronto, manchester, london, sydney, melbourne];
