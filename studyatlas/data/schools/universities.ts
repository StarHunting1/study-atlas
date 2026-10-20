import { pending } from "../schema";
import { UNI_PAGE_KINDS, type UniPageKind, type University } from "./types";
import type { Fact } from "../schema";
import type { Localized } from "@/lib/i18n";
/*
 * Real universities named in StudyAtlas Ver.1.0 city summaries. Names and website links have NOT been
 * checked against an official source in this version, so they are "unverified"; programmes, fees,
 * requirements and deadlines are "pending" (shown as "data coming soon").
 */
const note = { en: "Listed from the Ver.1.0 city summary; not yet checked. Check the university's own site.", ja: "Ver.1.0の都市概要から登録。未確認のため、大学公式サイトでご確認ください。" };
const linkNote = { en: "Link not yet checked.", ja: "リンク先は未確認です。" };
/*
 * Ver.1.7.2: institution-level facts. The formal name and the main campuses are an EDITORIAL entry (general knowledge of the institution, not read from the university's site): "unverified", with no source and no
 * check date. The six official pages a student needs (programme search, international admissions, tuition, deadlines, English requirements, scholarships) are "pending": no address is entered until a person has supplied
 * and opened it, because a guessed link is not a source. Programmes are in universityPrograms.ts (none yet).
 */
const editorial: Localized = { en: "Editorial entry from general knowledge; not yet matched to the university's own site.", ja: "編集者が一般的な知識から記載したもので、大学公式サイトとの照合はまだです。" };
const pages = (): Record<UniPageKind, Fact<string>> => Object.fromEntries(UNI_PAGE_KINDS.map((k) => [k, pending<string>()])) as Record<UniPageKind, Fact<string>>;
const uni = (id: string, name: string, cityId: string, url: string, official: Localized, campuses: Localized): University => ({
  kind: "university", id, name, cityId,
  record: { status: "unverified", value: { en: "Listed university", ja: "掲載大学" }, note },
  address: pending(), website: { status: "unverified", value: url, note: linkNote }, programs: [],
  officialName: { status: "unverified", value: official, note: editorial }, campuses: { status: "unverified", value: campuses, note: editorial }, officialPages: pages(),
});
const l = (en: string, ja: string): Localized => ({ en, ja });
export const universities: University[] = [
  uni("ubc", "University of British Columbia", "vancouver", "https://www.ubc.ca", l("The University of British Columbia", "ブリティッシュ・コロンビア大学"), l("Vancouver (Point Grey) and Okanagan (Kelowna)", "バンクーバー（ポイントグレイ）、オカナガン（ケロウナ）")),
  uni("sfu", "Simon Fraser University", "vancouver", "https://www.sfu.ca", l("Simon Fraser University", "サイモン・フレーザー大学"), l("Burnaby, Vancouver and Surrey", "バーナビー、バンクーバー、サリー")),
  uni("uoft", "University of Toronto", "toronto", "https://www.utoronto.ca", l("University of Toronto", "トロント大学"), l("St. George (downtown Toronto), Mississauga and Scarborough", "セント・ジョージ（トロント中心部）、ミシサガ、スカボロー")),
  uni("yorku", "York University", "toronto", "https://www.yorku.ca", l("York University", "ヨーク大学（カナダ）"), l("Keele and Glendon campuses, Toronto", "キール、グレンドン（いずれもトロント）")),
  uni("uom", "University of Manchester", "manchester", "https://www.manchester.ac.uk", l("The University of Manchester", "マンチェスター大学"), l("Main campus on Oxford Road, Manchester", "マンチェスター市内オックスフォード・ロードのメインキャンパス")),
  uni("mmu", "Manchester Metropolitan University", "manchester", "https://www.mmu.ac.uk", l("Manchester Metropolitan University", "マンチェスター・メトロポリタン大学"), l("All Saints and Birley Fields campuses, Manchester", "オール・セインツ、バーリー・フィールズ（いずれもマンチェスター）")),
  uni("ucl", "UCL", "london", "https://www.ucl.ac.uk", l("UCL (University College London)", "ユニバーシティ・カレッジ・ロンドン（UCL）"), l("Main campus in Bloomsbury, London; UCL East in Stratford", "ブルームズベリーのメインキャンパス（ロンドン）、ストラットフォードのUCL East")),
  uni("kcl", "King's College London", "london", "https://www.kcl.ac.uk", l("King's College London", "キングス・カレッジ・ロンドン"), l("Strand, Waterloo, Guy's and Denmark Hill (London)", "ストランド、ウォータールー、ガイズ、デンマーク・ヒル（ロンドン）")),
  uni("imperial", "Imperial College London", "london", "https://www.imperial.ac.uk", l("Imperial College London", "インペリアル・カレッジ・ロンドン"), l("South Kensington (main campus) and other London sites", "サウス・ケンジントン（メインキャンパス）ほかロンドン市内")),
  uni("usyd", "University of Sydney", "sydney", "https://www.sydney.edu.au", l("The University of Sydney", "シドニー大学"), l("Camperdown/Darlington (main campus) and other Sydney campuses", "キャンパーダウン／ダーリントン（メインキャンパス）ほかシドニー市内")),
  uni("unsw", "UNSW Sydney", "sydney", "https://www.unsw.edu.au", l("UNSW Sydney (The University of New South Wales)", "ニューサウスウェールズ大学（UNSW シドニー）"), l("Kensington (main campus), Sydney", "ケンジントン（メインキャンパス、シドニー）")),
  uni("unimelb", "University of Melbourne", "melbourne", "https://www.unimelb.edu.au", l("The University of Melbourne", "メルボルン大学"), l("Parkville (main campus), Melbourne", "パークビル（メインキャンパス、メルボルン）")),
  uni("monash", "Monash University", "melbourne", "https://www.monash.edu", l("Monash University", "モナシュ大学"), l("Clayton (main campus) and other Melbourne-area campuses", "クレイトン（メインキャンパス）ほかメルボルン周辺")),
];
