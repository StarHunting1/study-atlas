import type { City } from "../types";
import profile from "../profiles/vancouver";
// Identity and display data. Researched information lives in data/profiles/<id>.ts.
const city: City = { id: "vancouver", country: "CAN", name: { en: "Vancouver", ja: "バンクーバー" }, coords: [-123.12, 49.28], hue: 200, officialUrl: "https://vancouver.ca",
  photo: { src: "/cities/vancouver.jpg", alt: { en: "Downtown Vancouver skyline and False Creek", ja: "バンクーバーのダウンタウンとフォールス・クリーク" }, author: "Quintin Soloviev", license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Skyline_of_Vancouver,_BC.jpg" },
  blurb: { en: "Coastal city between mountains and sea.", ja: "海と山に囲まれた港湾都市。" },
  areas: ["Downtown", "Kitsilano", "Mount Pleasant"],
  profile,
};
export default city;
