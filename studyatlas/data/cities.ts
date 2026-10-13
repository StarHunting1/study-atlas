// Convenience facade over the repository, kept so existing imports (`@/data/cities`) keep working.
import { repository } from "./repository";
export type * from "./types";
export const cities = repository.listCities();
export const countries = repository.listCountries();
export const getCity = repository.getCity;
export const getCountry = repository.getCountry;
