import type { Localized } from "@/lib/i18n";
// Shared data shapes. See data/README.md for how to add a city or a new info section.

/** Where a figure came from. Required before a value can drop its "demo sample" label. */
export type Source = { name: string; url: string; checked: string };

/** Photos are self-hosted in public/cities/. Only add one whose license was verified on its source page. */
export type Photo = { src: string; alt: Localized; author: string; license: string; licenseUrl: string; sourceUrl: string };

/** Monthly figures in local currency. isSample: true shows the "demo sample" badge everywhere it is displayed. */
export type Cost = { currency: string; rent: number; monthly: number; transport: number; isSample: boolean; source?: Source };

export type City = {
  id: string; country: string; name: Localized; coords: [number, number];
  /** Fallback gradient hue, used only when the photo is missing or fails to load. */
  hue: number;
  officialUrl: string; photo?: Photo;
  blurb: Localized; housing: Localized; transport: Localized; climate: Localized; student: Localized;
  areas: string[]; schools: string[]; updated: string;
  cost: Cost;
};

export type Country = { code: string; name: Localized; center: [number, number]; zoom: number };
