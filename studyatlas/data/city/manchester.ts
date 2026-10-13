import type { City } from "../types";
// Cost figures are DEMO SAMPLES until a source is added (see data/README.md).
const city: City = { id: "manchester", country: "GBR", name: { en: "Manchester", ja: "マンチェスター" }, coords: [-2.24, 53.48], hue: 20, officialUrl: "https://www.manchester.gov.uk",
  photo: { src: "/cities/manchester.jpg", alt: { en: "Manchester city centre skyline beyond green trees", ja: "緑の木々の向こうに広がるマンチェスター中心部の高層ビル群" }, author: "Anthony O'Neil", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Manchester_city_centre_-_geograph.org.uk_-_8059388.jpg" },
  blurb: { en: "Industrial-heritage city with a big student scene.", ja: "産業遺産と学生文化が息づく都市。" }, housing: { en: "University halls, student housing, house shares.", ja: "大学寮、学生向け住宅、ハウスシェア。" }, transport: { en: "Metrolink tram, buses, rail.", ja: "メトロリンク（トラム）、バス、鉄道。" }, climate: { en: "Cool and often rainy year-round.", ja: "年間を通じて涼しく雨が多め。" }, student: { en: "Music, football and a large student population.", ja: "音楽やサッカー、学生が多い街。" },
  areas: ["Fallowfield", "Northern Quarter", "Oxford Road"], schools: ["University of Manchester", "Manchester Metropolitan University"], updated: "2026-10-12",
  cost: { currency: "GBP", rent: 700, monthly: 1300, transport: 80, isSample: true }
};
export default city;
