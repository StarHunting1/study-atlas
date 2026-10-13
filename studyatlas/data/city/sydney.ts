import type { City } from "../types";
// Cost figures are DEMO SAMPLES until a source is added (see data/README.md).
const city: City = { id: "sydney", country: "AUS", name: { en: "Sydney", ja: "シドニー" }, coords: [151.21, -33.87], hue: 340, officialUrl: "https://www.cityofsydney.nsw.gov.au",
  photo: { src: "/cities/sydney.jpg", alt: { en: "Sydney Opera House and Harbour Bridge at dusk", ja: "夕暮れのシドニー・オペラハウスとハーバーブリッジ" }, author: "Benh LIEU SONG", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sydney_Opera_House_and_Harbour_Bridge_Dusk_(3)_2019-06-21.jpg" },
  blurb: { en: "Harbour city with beaches and global campuses.", ja: "ビーチとハーバーの国際都市。" }, housing: { en: "Share houses, residences, homestay.", ja: "シェアハウス、学生寮、ホームステイ。" }, transport: { en: "Opal card: trains, buses, ferries, light rail.", ja: "Opalカード（電車、バス、フェリー、ライトレール）。" }, climate: { en: "Warm, humid summers; mild winters.", ja: "夏は暖かく蒸し暑く、冬は穏やか。" }, student: { en: "Beach lifestyle and an active outdoor culture.", ja: "ビーチ文化とアウトドアが盛ん。" },
  areas: ["Surry Hills", "Newtown", "Ultimo"], schools: ["University of Sydney", "UNSW Sydney"], updated: "2026-10-12",
  cost: { currency: "AUD", rent: 1700, monthly: 2800, transport: 60, isSample: true }
};
export default city;
