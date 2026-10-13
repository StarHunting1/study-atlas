import type { City } from "../types";
import profile from "../profiles/manchester";
// Identity and display data. Researched information lives in data/profiles/<id>.ts.
const city: City = { id: "manchester", country: "GBR", name: { en: "Manchester", ja: "マンチェスター" }, coords: [-2.24, 53.48], hue: 20, officialUrl: "https://www.manchester.gov.uk",
  photo: { src: "/cities/manchester.jpg", alt: { en: "Manchester city centre skyline beyond green trees", ja: "緑の木々の向こうに広がるマンチェスター中心部の高層ビル群" }, author: "Anthony O'Neil", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/", sourceUrl: "https://commons.wikimedia.org/wiki/File:Manchester_city_centre_-_geograph.org.uk_-_8059388.jpg" },
  blurb: { en: "Industrial-heritage city with a big student scene.", ja: "産業遺産と学生文化が息づく都市。" },
  areas: ["Fallowfield", "Northern Quarter", "Oxford Road"],
  profile,
};
export default city;
