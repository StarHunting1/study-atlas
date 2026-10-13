import type { City } from "../types";
import profile from "../profiles/melbourne";
// Identity and display data. Researched information lives in data/profiles/<id>.ts.
const city: City = { id: "melbourne", country: "AUS", name: { en: "Melbourne", ja: "メルボルン" }, coords: [144.96, -37.81], hue: 160, officialUrl: "https://www.melbourne.vic.gov.au",
  photo: { src: "/cities/melbourne.jpg", alt: { en: "Princes Bridge and the Melbourne skyline over the Yarra River", ja: "ヤラ川に架かるプリンセス橋とメルボルンの街並み" }, author: "DXR", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Princes_Bridge_and_Melbourne_skyline,_southwest_view_20230219_1.jpg" },
  blurb: { en: "Creative city known for caf\u00e9s, arts and laneways.", ja: "カフェやアートで知られるクリエイティブな都市。" },
  areas: ["Carlton", "CBD", "Fitzroy"],
  profile,
};
export default city;
