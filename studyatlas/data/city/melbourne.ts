import type { City } from "../types";
// Cost figures are DEMO SAMPLES until a source is added (see data/README.md).
const city: City = { id: "melbourne", country: "AUS", name: { en: "Melbourne", ja: "メルボルン" }, coords: [144.96, -37.81], hue: 160, officialUrl: "https://www.melbourne.vic.gov.au",
  photo: { src: "/cities/melbourne.jpg", alt: { en: "Princes Bridge and the Melbourne skyline over the Yarra River", ja: "ヤラ川に架かるプリンセス橋とメルボルンの街並み" }, author: "DXR", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Princes_Bridge_and_Melbourne_skyline,_southwest_view_20230219_1.jpg" },
  blurb: { en: "Creative city known for caf\u00e9s, arts and laneways.", ja: "カフェやアートで知られるクリエイティブな都市。" }, housing: { en: "Share houses, student apartments, homestay.", ja: "シェアハウス、学生アパート、ホームステイ。" }, transport: { en: "Trams, trains and buses (myki).", ja: "トラム、電車、バス（myki）。" }, climate: { en: "Changeable weather with four distinct seasons.", ja: "天気が変わりやすく四季がある。" }, student: { en: "Caf\u00e9s, arts and a strong student community.", ja: "カフェとアート、活発な学生コミュニティ。" },
  areas: ["Carlton", "CBD", "Fitzroy"], schools: ["University of Melbourne", "Monash University"], updated: "2026-10-12",
  cost: { currency: "AUD", rent: 1500, monthly: 2600, transport: 60, isSample: true }
};
export default city;
