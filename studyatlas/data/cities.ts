import type { Localized } from "@/lib/i18n";
// All cost numbers are DEMO SAMPLES (isSample: true). Replace with verified, sourced data before launch.
// Photos are self-hosted in public/cities/. Only add a photo whose license has been verified on its source page.
export type Photo = { src: string; alt: Localized; author: string; license: string; licenseUrl: string; sourceUrl: string };
export type City = {
  id: string; country: string; name: Localized; coords: [number, number]; hue: number; officialUrl: string; photo?: Photo;
  blurb: Localized; housing: Localized; transport: Localized; climate: Localized; student: Localized;
  areas: string[]; schools: string[]; updated: string;
  cost: { currency: string; rent: number; monthly: number; transport: number; isSample: true };
};
export type Country = { code: string; name: Localized; center: [number, number]; zoom: number };
export const countries: Country[] = [
  { code: "CAN", name: { en: "Canada", ja: "カナダ" }, center: [-100, 55], zoom: 2.5 },
  { code: "GBR", name: { en: "United Kingdom", ja: "イギリス" }, center: [-2, 54], zoom: 4.5 },
  { code: "AUS", name: { en: "Australia", ja: "オーストラリア" }, center: [134, -26], zoom: 3 },
];
export const cities: City[] = [
  { id: "vancouver", country: "CAN", name: { en: "Vancouver", ja: "バンクーバー" }, coords: [-123.12, 49.28], hue: 200, officialUrl: "https://vancouver.ca",
    blurb: { en: "Coastal city between mountains and sea.", ja: "海と山に囲まれた港湾都市。" }, housing: { en: "Homestay, residences, shared flats.", ja: "ホームステイ、寮、シェアハウス。" }, transport: { en: "TransLink: SkyTrain, buses, SeaBus.", ja: "TransLink（スカイトレイン、バス、シーバス）。" }, climate: { en: "Mild, rainy winters; drier summers.", ja: "冬は温暖で雨が多く、夏は比較的乾燥。" }, student: { en: "Outdoor-focused, diverse international community.", ja: "アウトドア志向で多国籍なコミュニティ。" },
    areas: ["Downtown", "Kitsilano", "Mount Pleasant"], schools: ["University of British Columbia", "Simon Fraser University"], updated: "2026-10-12",
    cost: { currency: "CAD", rent: 1500, monthly: 2500, transport: 110, isSample: true } },
  { id: "toronto", country: "CAN", name: { en: "Toronto", ja: "トロント" }, coords: [-79.38, 43.65], hue: 230, officialUrl: "https://www.toronto.ca",
    blurb: { en: "Canada's largest city with a vast multicultural scene.", ja: "多文化が共存するカナダ最大の都市。" }, housing: { en: "Shared apartments, residences, homestay.", ja: "シェアアパート、寮、ホームステイ。" }, transport: { en: "TTC subway, streetcars and buses.", ja: "TTC（地下鉄、路面電車、バス）。" }, climate: { en: "Cold winters; warm, humid summers.", ja: "冬は寒く、夏は暖かく蒸し暑い。" }, student: { en: "Big city energy with many cultural events.", ja: "大都市ならではの活気と豊富な文化イベント。" },
    areas: ["The Annex", "Downtown", "Kensington Market"], schools: ["University of Toronto", "York University"], updated: "2026-10-12",
    cost: { currency: "CAD", rent: 1500, monthly: 2500, transport: 150, isSample: true } },
  { id: "manchester", country: "GBR", name: { en: "Manchester", ja: "マンチェスター" }, coords: [-2.24, 53.48], hue: 20, officialUrl: "https://www.manchester.gov.uk",
    blurb: { en: "Industrial-heritage city with a big student scene.", ja: "産業遺産と学生文化が息づく都市。" }, housing: { en: "University halls, student housing, house shares.", ja: "大学寮、学生向け住宅、ハウスシェア。" }, transport: { en: "Metrolink tram, buses, rail.", ja: "メトロリンク（トラム）、バス、鉄道。" }, climate: { en: "Cool and often rainy year-round.", ja: "年間を通じて涼しく雨が多め。" }, student: { en: "Music, football and a large student population.", ja: "音楽やサッカー、学生が多い街。" },
    areas: ["Fallowfield", "Northern Quarter", "Oxford Road"], schools: ["University of Manchester", "Manchester Metropolitan University"], updated: "2026-10-12",
    cost: { currency: "GBP", rent: 700, monthly: 1300, transport: 80, isSample: true } },
  { id: "london", country: "GBR", name: { en: "London", ja: "ロンドン" }, coords: [-0.13, 51.51], hue: 270, officialUrl: "https://www.london.gov.uk",
    blurb: { en: "Global capital with world-renowned universities.", ja: "世界的な大学が集まる国際首都。" }, housing: { en: "University halls, private halls, flat shares.", ja: "大学寮、民間学生寮、フラットシェア。" }, transport: { en: "Tube, buses, rail; Oyster/contactless.", ja: "地下鉄、バス、鉄道（Oyster／タッチ決済）。" }, climate: { en: "Mild; moderate rainfall through the year.", ja: "穏やかな気候で、年間を通して適度に雨。" }, student: { en: "Museums, networking and a huge range of events.", ja: "博物館や交流機会、多彩なイベント。" },
    areas: ["Bloomsbury", "Camden", "Shoreditch"], schools: ["UCL", "King's College London", "Imperial College London"], updated: "2026-10-12",
    cost: { currency: "GBP", rent: 1100, monthly: 2000, transport: 140, isSample: true } },
  { id: "sydney", country: "AUS", name: { en: "Sydney", ja: "シドニー" }, coords: [151.21, -33.87], hue: 340, officialUrl: "https://www.cityofsydney.nsw.gov.au",
    blurb: { en: "Harbour city with beaches and global campuses.", ja: "ビーチとハーバーの国際都市。" }, housing: { en: "Share houses, residences, homestay.", ja: "シェアハウス、学生寮、ホームステイ。" }, transport: { en: "Opal card: trains, buses, ferries, light rail.", ja: "Opalカード（電車、バス、フェリー、ライトレール）。" }, climate: { en: "Warm, humid summers; mild winters.", ja: "夏は暖かく蒸し暑く、冬は穏やか。" }, student: { en: "Beach lifestyle and an active outdoor culture.", ja: "ビーチ文化とアウトドアが盛ん。" },
    areas: ["Surry Hills", "Newtown", "Ultimo"], schools: ["University of Sydney", "UNSW Sydney"], updated: "2026-10-12",
    cost: { currency: "AUD", rent: 1700, monthly: 2800, transport: 60, isSample: true } },
  { id: "melbourne", country: "AUS", name: { en: "Melbourne", ja: "メルボルン" }, coords: [144.96, -37.81], hue: 160, officialUrl: "https://www.melbourne.vic.gov.au",
    blurb: { en: "Creative city known for caf\u00e9s, arts and laneways.", ja: "カフェやアートで知られるクリエイティブな都市。" }, housing: { en: "Share houses, student apartments, homestay.", ja: "シェアハウス、学生アパート、ホームステイ。" }, transport: { en: "Trams, trains and buses (myki).", ja: "トラム、電車、バス（myki）。" }, climate: { en: "Changeable weather with four distinct seasons.", ja: "天気が変わりやすく四季がある。" }, student: { en: "Caf\u00e9s, arts and a strong student community.", ja: "カフェとアート、活発な学生コミュニティ。" },
    areas: ["Carlton", "CBD", "Fitzroy"], schools: ["University of Melbourne", "Monash University"], updated: "2026-10-12",
    cost: { currency: "AUD", rent: 1500, monthly: 2600, transport: 60, isSample: true } },
];
export const getCity = (id: string) => cities.find((c) => c.id === id);
