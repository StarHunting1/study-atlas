import { pending, type CityProfile } from "../schema";
// Ver.1.0 text below was written without a checked source, so it is kept as "unverified".
// Demo cost numbers stay "sample". Everything else is "pending" until researched (see data/RESEARCH.md).
const carried = { en: "Initial summary from StudyAtlas Ver.1.0; not yet checked against an official source.", ja: "StudyAtlas Ver.1.0時点の概要です。公式情報との照合はまだ行っていません。" };
const demo = { en: "Demo placeholder. Period, coverage and source are undefined; do not use for planning.", ja: "デモ用の仮の数値です。対象期間・含まれる項目・出典が未定義のため、計画には使わないでください。" };
const profile: CityProfile = {
  cost: {
    rent: { status: "sample", value: { amount: 1500, currency: "CAD", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
    food: pending(),
    transport: { status: "sample", value: { amount: 110, currency: "CAD", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
    phone: pending(),
    totalMonthly: { status: "sample", value: { amount: 2500, currency: "CAD", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
  },
  housing: { overview: { status: "unverified", note: carried, value: { en: "Homestay, residences, shared flats.", ja: "ホームステイ、寮、シェアハウス。" } }, dorm: pending(), homestay: pending(), shareHouse: pending() },
  climate: { overview: { status: "unverified", note: carried, value: { en: "Mild, rainy winters; drier summers.", ja: "冬は温暖で雨が多く、夏は比較的乾燥。" } }, monthly: pending() },
  safety: { crimeStats: pending(), advice: pending() },
  education: { universities: { status: "unverified", note: carried, value: [{ name: "University of British Columbia" }, { name: "Simon Fraser University" }] }, languageSchools: pending(), tuition: pending() },
  transport: { modes: { status: "unverified", note: carried, value: { en: "TransLink: SkyTrain, buses, SeaBus.", ja: "TransLink（スカイトレイン、バス、シーバス）。" } }, studentDiscount: pending() },
  living: { studentLife: { status: "unverified", note: carried, value: { en: "Outdoor-focused, diverse international community.", ja: "アウトドア志向で多国籍なコミュニティ。" } }, healthcare: pending(), sim: pending(), banking: pending(), studentFacilities: pending() },
};
export default profile;
