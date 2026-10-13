import { pending, type CityProfile } from "../schema";
// Ver.1.0 text below was written without a checked source, so it is kept as "unverified".
// Demo cost numbers stay "sample". Everything else is "pending" until researched (see data/RESEARCH.md).
const carried = { en: "Initial summary from StudyAtlas Ver.1.0; not yet checked against an official source.", ja: "StudyAtlas Ver.1.0時点の概要です。公式情報との照合はまだ行っていません。" };
const demo = { en: "Demo placeholder. Period, coverage and source are undefined; do not use for planning.", ja: "デモ用の仮の数値です。対象期間・含まれる項目・出典が未定義のため、計画には使わないでください。" };
const profile: CityProfile = {
  cost: {
    rent: { status: "sample", value: { amount: 1500, currency: "AUD", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
    food: pending(),
    transport: { status: "sample", value: { amount: 60, currency: "AUD", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
    phone: pending(),
    totalMonthly: { status: "sample", value: { amount: 2600, currency: "AUD", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
  },
  housing: { overview: { status: "unverified", note: carried, value: { en: "Share houses, student apartments, homestay.", ja: "シェアハウス、学生アパート、ホームステイ。" } }, dorm: pending(), homestay: pending(), shareHouse: pending() },
  climate: { overview: { status: "unverified", note: carried, value: { en: "Changeable weather with four distinct seasons.", ja: "天気が変わりやすく四季がある。" } }, monthly: pending() },
  safety: { crimeStats: pending(), advice: pending() },
  education: { universities: { status: "unverified", note: carried, value: [{ name: "University of Melbourne" }, { name: "Monash University" }] }, languageSchools: pending(), tuition: pending() },
  transport: { modes: { status: "unverified", note: carried, value: { en: "Trams, trains and buses (myki).", ja: "トラム、電車、バス（myki）。" } }, studentDiscount: pending() },
  living: { studentLife: { status: "unverified", note: carried, value: { en: "Caf\u00e9s, arts and a strong student community.", ja: "カフェとアート、活発な学生コミュニティ。" } }, healthcare: pending(), sim: pending(), banking: pending(), studentFacilities: pending() },
};
export default profile;
