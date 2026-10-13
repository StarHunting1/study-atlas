import { pending, type CityProfile } from "../schema";
// Ver.1.0 text below was written without a checked source, so it is kept as "unverified".
// Demo cost numbers stay "sample". Everything else is "pending" until researched (see data/RESEARCH.md).
const carried = { en: "Initial summary from StudyAtlas Ver.1.0; not yet checked against an official source.", ja: "StudyAtlas Ver.1.0時点の概要です。公式情報との照合はまだ行っていません。" };
const demo = { en: "Demo placeholder. Period, coverage and source are undefined; do not use for planning.", ja: "デモ用の仮の数値です。対象期間・含まれる項目・出典が未定義のため、計画には使わないでください。" };
const profile: CityProfile = {
  cost: {
    rent: { status: "sample", value: { amount: 1100, currency: "GBP", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
    food: pending(),
    transport: { status: "sample", value: { amount: 140, currency: "GBP", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
    phone: pending(),
    totalMonthly: { status: "sample", value: { amount: 2000, currency: "GBP", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
  },
  housing: { overview: { status: "unverified", note: carried, value: { en: "University halls, private halls, flat shares.", ja: "大学寮、民間学生寮、フラットシェア。" } }, dorm: pending(), homestay: pending(), shareHouse: pending() },
  climate: { overview: { status: "unverified", note: carried, value: { en: "Mild; moderate rainfall through the year.", ja: "穏やかな気候で、年間を通して適度に雨。" } }, monthly: pending() },
  safety: { crimeStats: pending(), advice: pending() },
  education: { universities: { status: "unverified", note: carried, value: [{ name: "UCL" }, { name: "King's College London" }, { name: "Imperial College London" }] }, languageSchools: pending(), tuition: pending() },
  transport: { modes: { status: "unverified", note: carried, value: { en: "Tube, buses, rail; Oyster/contactless.", ja: "地下鉄、バス、鉄道（Oyster／タッチ決済）。" } }, studentDiscount: pending() },
  living: { studentLife: { status: "unverified", note: carried, value: { en: "Museums, networking and a huge range of events.", ja: "博物館や交流機会、多彩なイベント。" } }, healthcare: pending(), sim: pending(), banking: pending(), studentFacilities: pending() },
};
export default profile;
