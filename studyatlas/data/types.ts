import type { Localized } from "@/lib/i18n";
import type { CityProfile, CountryProfile } from "./schema";
// Shared data shapes. See data/README.md for how to add a city or research a field.
export type * from "./schema";

/** Photos are self-hosted in public/cities/. Only add one whose license was verified on its source page. */
export type Photo = { src: string; alt: Localized; author: string; license: string; licenseUrl: string; sourceUrl: string };

/** Identity and display data for a city. Researched information is in `profile` (data/profiles/<id>.ts). */
export type City = {
  id: string; country: string; name: Localized; coords: [number, number];
  /** Fallback gradient hue, used only when the photo is missing or fails to load. */
  hue: number;
  officialUrl: string; photo?: Photo;
  blurb: Localized;
  /** Neighbourhood names, used as search keywords */
  areas: string[];
  profile: CityProfile;
};

export type Country = { code: string; name: Localized; center: [number, number]; zoom: number; profile: CountryProfile };
