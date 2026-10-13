import { pending, type CityProfile } from "../schema";
// Ver.1.0 text below was written without a checked source, so it is kept as "unverified".
// Demo cost numbers stay "sample". Everything else is "pending" until researched (see data/RESEARCH.md).
const carried = { en: "Initial summary from StudyAtlas Ver.1.0; not yet checked against an official source.", ja: "StudyAtlas Ver.1.0時点の概要です。公式情報との照合はまだ行っていません。" };
const demo = { en: "Demo placeholder. Period, coverage and source are undefined; do not use for planning.", ja: "デモ用の仮の数値です。対象期間・含まれる項目・出典が未定義のため、計画には使わないでください。" };
const profile: CityProfile = {
  cost: {
    rent: { status: "sample", value: { amount: 700, currency: "GBP", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
    food: pending(),
    transport: { status: "sample", value: { amount: 80, currency: "GBP", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
    phone: pending(),
    totalMonthly: { status: "sample", value: { amount: 1300, currency: "GBP", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
  },
  housing: { overview: { status: "unverified", note: carried, value: { en: "University halls, student housing, house shares.", ja: "大学寮、学生向け住宅、ハウスシェア。" } }, dorm: pending(), homestay: pending(), shareHouse: pending() },
  climate: { overview: { status: "unverified", note: carried, value: { en: "Cool and often rainy year-round.", ja: "年間を通じて涼しく雨が多め。" } }, monthly: pending() },
  safety: { crimeStats: pending(), advice: pending() },
  education: { universities: { status: "unverified", note: carried, value: [{ name: "University of Manchester" }, { name: "Manchester Metropolitan University" }] }, languageSchools: pending(), tuition: pending() },
  transport: { modes: { status: "unverified", note: carried, value: { en: "Metrolink tram, buses, rail.", ja: "メトロリンク（トラム）、バス、鉄道。" } }, studentDiscount: pending() },
  living: { studentLife: { status: "unverified", note: carried, value: { en: "Music, football and a large student population.", ja: "音楽やサッカー、学生が多い街。" } }, healthcare: pending(), sim: pending(), banking: pending(), studentFacilities: pending() },
};
export default profile;
