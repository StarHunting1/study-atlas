import type { City } from "../types";
import profile from "../profiles/toronto";
// Identity and display data. Researched information lives in data/profiles/<id>.ts.
const city: City = { id: "toronto", country: "CAN", name: { en: "Toronto", ja: "トロント" }, coords: [-79.38, 43.65], hue: 230, officialUrl: "https://www.toronto.ca",
  photo: { src: "/cities/toronto.jpg", alt: { en: "Toronto skyline with the CN Tower across Lake Ontario", ja: "オンタリオ湖越しに見るCNタワーとトロントの街並み" }, author: "Maksim Sokolov (maxergon.com)", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Toronto_skyline_viewed_from_Trillium_Park.jpg" },
  blurb: { en: "Canada's largest city with a vast multicultural scene.", ja: "多文化が共存するカナダ最大の都市。" },
  areas: ["The Annex", "Downtown", "Kensington Market"],
  profile,
};
export default city;
