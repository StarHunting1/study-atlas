import type { City } from "../types";
import profile from "../profiles/sydney";
// Identity and display data. Researched information lives in data/profiles/<id>.ts.
const city: City = { id: "sydney", country: "AUS", name: { en: "Sydney", ja: "シドニー" }, coords: [151.21, -33.87], hue: 340, officialUrl: "https://www.cityofsydney.nsw.gov.au",
  photo: { src: "/cities/sydney.jpg", alt: { en: "Sydney Opera House and Harbour Bridge at dusk", ja: "夕暮れのシドニー・オペラハウスとハーバーブリッジ" }, author: "Benh LIEU SONG", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Sydney_Opera_House_and_Harbour_Bridge_Dusk_(3)_2019-06-21.jpg" },
  blurb: { en: "Harbour city with beaches and global campuses.", ja: "ビーチとハーバーの国際都市。" },
  areas: ["Surry Hills", "Newtown", "Ultimo"],
  profile,
};
export default city;
