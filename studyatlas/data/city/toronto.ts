import type { City } from "../types";
// Cost figures are DEMO SAMPLES until a source is added (see data/README.md).
const city: City = { id: "toronto", country: "CAN", name: { en: "Toronto", ja: "トロント" }, coords: [-79.38, 43.65], hue: 230, officialUrl: "https://www.toronto.ca",
  photo: { src: "/cities/toronto.jpg", alt: { en: "Toronto skyline with the CN Tower across Lake Ontario", ja: "オンタリオ湖越しに見るCNタワーとトロントの街並み" }, author: "Maksim Sokolov (maxergon.com)", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Toronto_skyline_viewed_from_Trillium_Park.jpg" },
  blurb: { en: "Canada's largest city with a vast multicultural scene.", ja: "多文化が共存するカナダ最大の都市。" }, housing: { en: "Shared apartments, residences, homestay.", ja: "シェアアパート、寮、ホームステイ。" }, transport: { en: "TTC subway, streetcars and buses.", ja: "TTC（地下鉄、路面電車、バス）。" }, climate: { en: "Cold winters; warm, humid summers.", ja: "冬は寒く、夏は暖かく蒸し暑い。" }, student: { en: "Big city energy with many cultural events.", ja: "大都市ならではの活気と豊富な文化イベント。" },
  areas: ["The Annex", "Downtown", "Kensington Market"], schools: ["University of Toronto", "York University"], updated: "2026-10-12",
  cost: { currency: "CAD", rent: 1500, monthly: 2500, transport: 150, isSample: true }
};
export default city;
