import { pending } from "./schema";
import type { Country } from "./types";
// Visa information is national. It stays "pending" until checked on the government's own page (see data/RESEARCH.md).
const visa = () => ({ official: pending<never>(), notes: pending<never>() });
export const countries: Country[] = [
  { code: "CAN", name: { en: "Canada", ja: "カナダ" }, center: [-100, 55], zoom: 2.5, profile: { visa: visa() } },
  { code: "GBR", name: { en: "United Kingdom", ja: "イギリス" }, center: [-2, 54], zoom: 4.5, profile: { visa: visa() } },
  { code: "AUS", name: { en: "Australia", ja: "オーストラリア" }, center: [134, -26], zoom: 3, profile: { visa: visa() } },
];
