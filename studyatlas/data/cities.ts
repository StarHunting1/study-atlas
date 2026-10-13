// Entry point for city data. One file per city lives in data/city/; register new ones here (order = display order).
import vancouver from "./city/vancouver";
import toronto from "./city/toronto";
import manchester from "./city/manchester";
import london from "./city/london";
import sydney from "./city/sydney";
import melbourne from "./city/melbourne";
import type { City } from "./types";
export type { City, Country, Cost, Photo, Source } from "./types";
export { countries } from "./countries";
export const cities: City[] = [vancouver, toronto, manchester, london, sydney, melbourne];
export const getCity = (id: string) => cities.find((c) => c.id === id);
