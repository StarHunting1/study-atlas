import { cities, countries } from "./registry";
import { checkProfile } from "./validate";
import type { City, Country } from "./types";
/*
 * Single read API for city data. Pages and components (detail page, compare table, search, map) go through this,
 * so they always show the same data. Today it reads the TypeScript files in data/; to move to a database
 * (e.g. Supabase) or add AI search, implement CityRepository against that backend and swap `repository`.
 */
export interface CityRepository {
  listCities(): City[];
  getCity(id: string): City | undefined;
  listCountries(): Country[];
  getCountry(code: string): Country | undefined;
}

const problems = [...cities.map((c) => checkProfile(c.id, c.profile)), ...countries.map((c) => checkProfile(c.code, c.profile))].flat();
if (problems.length) throw new Error("City data failed validation:\n" + problems.join("\n"));

export const repository: CityRepository = {
  listCities: () => cities,
  getCity: (id) => cities.find((c) => c.id === id),
  listCountries: () => countries,
  getCountry: (code) => countries.find((c) => c.code === code),
};
