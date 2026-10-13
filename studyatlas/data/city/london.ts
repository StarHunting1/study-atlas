import type { City } from "../types";
import profile from "../profiles/london";
// Identity and display data. Researched information lives in data/profiles/<id>.ts.
const city: City = { id: "london", country: "GBR", name: { en: "London", ja: "ロンドン" }, coords: [-0.13, 51.51], hue: 270, officialUrl: "https://www.london.gov.uk",
  photo: { src: "/cities/london.jpg", alt: { en: "Tower Bridge and the River Thames in London", ja: "ロンドンのタワーブリッジとテムズ川" }, author: "Colin", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Tower_Bridge_from_London_City_Hall_2015.jpg" },
  blurb: { en: "Global capital with world-renowned universities.", ja: "世界的な大学が集まる国際首都。" },
  areas: ["Bloomsbury", "Camden", "Shoreditch"],
  profile,
};
export default city;
