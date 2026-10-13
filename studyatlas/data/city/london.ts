import type { City } from "../types";
// Cost figures are DEMO SAMPLES until a source is added (see data/README.md).
const city: City = { id: "london", country: "GBR", name: { en: "London", ja: "ロンドン" }, coords: [-0.13, 51.51], hue: 270, officialUrl: "https://www.london.gov.uk",
  photo: { src: "/cities/london.jpg", alt: { en: "Tower Bridge and the River Thames in London", ja: "ロンドンのタワーブリッジとテムズ川" }, author: "Colin", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tower_Bridge_from_London_City_Hall_2015.jpg" },
  blurb: { en: "Global capital with world-renowned universities.", ja: "世界的な大学が集まる国際首都。" }, housing: { en: "University halls, private halls, flat shares.", ja: "大学寮、民間学生寮、フラットシェア。" }, transport: { en: "Tube, buses, rail; Oyster/contactless.", ja: "地下鉄、バス、鉄道（Oyster／タッチ決済）。" }, climate: { en: "Mild; moderate rainfall through the year.", ja: "穏やかな気候で、年間を通して適度に雨。" }, student: { en: "Museums, networking and a huge range of events.", ja: "博物館や交流機会、多彩なイベント。" },
  areas: ["Bloomsbury", "Camden", "Shoreditch"], schools: ["UCL", "King's College London", "Imperial College London"], updated: "2026-10-12",
  cost: { currency: "GBP", rent: 1100, monthly: 2000, transport: 140, isSample: true }
};
export default city;
