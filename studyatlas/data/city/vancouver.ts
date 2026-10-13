import type { City } from "../types";
// Cost figures are DEMO SAMPLES until a source is added (see data/README.md).
const city: City = { id: "vancouver", country: "CAN", name: { en: "Vancouver", ja: "バンクーバー" }, coords: [-123.12, 49.28], hue: 200, officialUrl: "https://vancouver.ca",
  photo: { src: "/cities/vancouver.jpg", alt: { en: "Downtown Vancouver skyline and False Creek", ja: "バンクーバーのダウンタウンとフォールス・クリーク" }, author: "Quintin Soloviev", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Skyline_of_Vancouver,_BC.jpg" },
  blurb: { en: "Coastal city between mountains and sea.", ja: "海と山に囲まれた港湾都市。" }, housing: { en: "Homestay, residences, shared flats.", ja: "ホームステイ、寮、シェアハウス。" }, transport: { en: "TransLink: SkyTrain, buses, SeaBus.", ja: "TransLink（スカイトレイン、バス、シーバス）。" }, climate: { en: "Mild, rainy winters; drier summers.", ja: "冬は温暖で雨が多く、夏は比較的乾燥。" }, student: { en: "Outdoor-focused, diverse international community.", ja: "アウトドア志向で多国籍なコミュニティ。" },
  areas: ["Downtown", "Kitsilano", "Mount Pleasant"], schools: ["University of British Columbia", "Simon Fraser University"], updated: "2026-10-12",
  cost: { currency: "CAD", rent: 1500, monthly: 2500, transport: 110, isSample: true }
};
export default city;
