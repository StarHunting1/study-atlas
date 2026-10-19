import type { Candidate } from "./cityRents";
/*
 * Public rent statistics for Sydney and Melbourne (Ver.1.6.0) – prepared, NOT published. Same rule as Toronto/London (cityRents.ts): a figure without its own entry in
 * RENT_APPROVALS is not part of the official data, so no card, no key figure and no comparison cell shows its number; the city page shows the conditions and the official link
 * ("confirming") instead. The licence is recorded in rights.data.ts (ABS: Creative Commons Attribution 4.0), apart from the approval of a person.
 *
 * What they are: the ABS 2021 Census "median weekly rent" of Greater Sydney and Greater Melbourne, read from the two QuickStats pages on GitHub Actions on 2026-10-19.
 * It is ACTUAL rent paid by households that rent (2021 Census; dwellings occupied rent-free are excluded), a median (not a mean), per WEEK in Australian dollars.
 * What they are not: advertised asking rents for new leases, the NSW rental-bond or Victorian rental-report medians (different statistics, not read here), student halls, language-school
 * housing or an average for international students. They are four years old, so the city page must say "2021" next to the number.
 * The same table and the same definition are used for both cities, so Sydney and Melbourne can be compared with each other (rentBasis.ts) – and with nobody else.
 */
const SYD = "https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD";
const MEL = "https://www.abs.gov.au/census/find-census-data/quickstats/2021/2GMEL";
const cond = (city: "Greater Sydney" | "Greater Melbourne", ja: string) => ({
  en: `Median weekly rent of the households in ${city} that rent their home, from the 2021 Census. The area is the ABS's “${city}”, a Greater Capital City Statistical Area (ABS geography type “Greater Capital City Statistical Areas”): the whole metropolitan region, much wider than the city centre. Actual rent paid by renting households in 2021, NOT today's (2026) advertised asking rents for new leases; dwellings occupied rent-free are excluded (ABS footnote). A median, not a mean, per week (not per month) in Australian dollars – multiplying by 52 and dividing by 12 is a rough conversion only, so StudyAtlas does not do it. Whole rental market: NOT an international student's own housing cost, not student housing, not university halls and not language-school accommodation. The figure is from 2021, so current rents are likely to be different.`,
  ja: `${ja}の、住居を借りている世帯の週あたり家賃の中央値（2021年国勢調査）。区域はABSの「${city}」で、ABSの地理区分「Greater Capital City Statistical Areas（大都市圏統計区域）」に当たり、都心よりずっと広い都市圏全体です。2021年に実際に支払われていた家賃であり、2026年現在の新規契約の募集家賃ではありません。家賃を払っていない住戸は除かれます（ABSの注記）。平均ではなく中央値で、月額ではなく「週」あたりのオーストラリアドルです（52倍して12で割る換算は概算にしかならないため、StudyAtlasでは行いません）。市場全体の値で、留学生個人の住居費ではなく、学生向け住居・大学寮・語学学校の滞在先の料金でもありません。2021年の値なので、現在の家賃は異なる可能性が高いです。`,
});
const make = (cityId: "sydney" | "melbourne", name: "Greater Sydney" | "Greater Melbourne", ja: string, amount: number, url: string): Candidate => ({
  id: `${cityId === "sydney" ? "syd" : "mel"}-abs-census-median-weekly-rent`, cityId, topic: "housing", sourceId: "abs-census-rent", metric: "housing.marketRent.censusMedianWeekly", collectedId: undefined, highlight: true,
  label: { en: `Median weekly rent – households that rent (2021 Census, ${name})`, ja: `週あたり家賃の中央値・賃貸世帯（2021年国勢調査・${ja}）` },
  value: { amount, currency: "AUD", per: "week" }, audience: "renter",
  conditions: cond(name, ja),
  validFor: "2021 (ABS 2021 Census; latest Census release shown on the QuickStats page)",
  evidence: [{ url, publisher: "Australian Bureau of Statistics", section: { en: `2021 Census All persons QuickStats – ${name} – Median weekly rent`, ja: `2021年国勢調査 All persons QuickStats – ${ja} – 週あたり家賃の中央値` }, quote: `${name}; Median weekly rent; 2021: ${amount}`, terms: "Creative Commons Attribution 4.0 International" }],
  retrievedAt: "2026-10-19",
  note: { en: `Read from the ABS QuickStats page (${name}) by the GitHub Actions probe on 2026-10-19: “Median weekly rent (b) $${amount}”, footnote (b): “For 2021, median weekly rent calculations exclude dwellings being occupied rent-free”. Not collected automatically; a person must compare it with the page before it is approved.`, ja: `2026-10-19にGitHub Actionsのプローブが ABS QuickStats（${ja}）から取得：「Median weekly rent (b) $${amount}」、注記(b)「2021年の家賃中央値の計算では、家賃なしで占有される住戸を除く」。自動収集はしておらず、承認前に人がページと突き合わせる必要があります。` },
});
export const SYDNEY_RENT_CANDIDATE = make("sydney", "Greater Sydney", "グレーター・シドニー", 470, SYD);
export const MELBOURNE_RENT_CANDIDATE = make("melbourne", "Greater Melbourne", "グレーター・メルボルン", 390, MEL);
export const AU_RENT_CANDIDATES: Candidate[] = [SYDNEY_RENT_CANDIDATE, MELBOURNE_RENT_CANDIDATE];
