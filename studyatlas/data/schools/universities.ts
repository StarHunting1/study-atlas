import { pending } from "../schema";
import type { University } from "./types";
/*
 * Real universities named in StudyAtlas Ver.1.0 city summaries. Names and website links have NOT been
 * checked against an official source in this version, so they are "unverified"; programmes, fees,
 * requirements and deadlines are "pending" (shown as "data coming soon").
 */
const note = { en: "Listed from the Ver.1.0 city summary; not yet checked. Check the university's own site.", ja: "Ver.1.0の都市概要から登録。未確認のため、大学公式サイトでご確認ください。" };
const linkNote = { en: "Link not yet checked.", ja: "リンク先は未確認です。" };
const uni = (id: string, name: string, cityId: string, url: string): University => ({
  kind: "university", id, name, cityId,
  record: { status: "unverified", value: { en: "Listed university", ja: "掲載大学" }, note },
  address: pending(), website: { status: "unverified", value: url, note: linkNote }, programs: [],
});
export const universities: University[] = [
  uni("ubc", "University of British Columbia", "vancouver", "https://www.ubc.ca"),
  uni("sfu", "Simon Fraser University", "vancouver", "https://www.sfu.ca"),
  uni("uoft", "University of Toronto", "toronto", "https://www.utoronto.ca"),
  uni("yorku", "York University", "toronto", "https://www.yorku.ca"),
  uni("uom", "University of Manchester", "manchester", "https://www.manchester.ac.uk"),
  uni("mmu", "Manchester Metropolitan University", "manchester", "https://www.mmu.ac.uk"),
  uni("ucl", "UCL", "london", "https://www.ucl.ac.uk"),
  uni("kcl", "King's College London", "london", "https://www.kcl.ac.uk"),
  uni("imperial", "Imperial College London", "london", "https://www.imperial.ac.uk"),
  uni("usyd", "University of Sydney", "sydney", "https://www.sydney.edu.au"),
  uni("unsw", "UNSW Sydney", "sydney", "https://www.unsw.edu.au"),
  uni("unimelb", "University of Melbourne", "melbourne", "https://www.unimelb.edu.au"),
  uni("monash", "Monash University", "melbourne", "https://www.monash.edu"),
];
