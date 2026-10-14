import { pending, type CityProfile } from "../schema";
import official from "../official/vancouver";
import { climateFact, moneyFact, pointById, textFact } from "../official/toFact";
// Ver.1.0 text below was written without a checked source, so it is kept as "unverified".
// Rent, transport, student transport and climate come from official data (data/official/vancouver.ts, Ver.1.5);
// the Ver.1.0 demo cost numbers were removed. Everything else is "pending" until researched (see data/RESEARCH.md).
const P = (id: string) => pointById(official.points, id);
const carried = { en: "Initial summary from StudyAtlas Ver.1.0; not yet checked against an official source.", ja: "StudyAtlas Ver.1.0時点の概要です。公式情報との照合はまだ行っていません。" };
const profile: CityProfile = {
  cost: {
    rent: moneyFact(P("van-cmhc-rent-1br"), { en: "Average rent, 1-bedroom, whole rental market (CMHC 2025) – not student housing", ja: "1ベッドルームの平均家賃・市場全体（CMHC 2025）– 学生寮ではありません" }),
    food: pending(),
    transport: moneyFact(P("van-monthly-adult-z1"), { en: "TransLink adult Monthly Pass, 1 zone", ja: "TransLink 大人マンスリーパス（1ゾーン）" }),
    phone: pending(),
    totalMonthly: pending({ en: "No official living-cost estimate read yet (UBC pages planned).", ja: "公式の生活費見積もりはまだ取得していません（UBC のページを予定）。" }),
  },
  housing: { overview: { status: "unverified", note: carried, value: { en: "Homestay, residences, shared flats.", ja: "ホームステイ、寮、シェアハウス。" } }, dorm: pending(), homestay: pending(), shareHouse: pending() },
  climate: { overview: { status: "unverified", note: carried, value: { en: "Mild, rainy winters; drier summers.", ja: "冬は温暖で雨が多く、夏は比較的乾燥。" } }, monthly: climateFact(official.climate) },
  safety: { crimeStats: pending(), advice: pending() },
  education: { universities: { status: "unverified", note: carried, value: [{ name: "University of British Columbia" }, { name: "Simon Fraser University" }] }, languageSchools: pending(), tuition: pending() },
  transport: { modes: { status: "unverified", note: carried, value: { en: "TransLink: SkyTrain, buses, SeaBus.", ja: "TransLink（スカイトレイン、バス、シーバス）。" } }, studentDiscount: textFact([P("van-upass")!, P("van-monthly-concession")!], { en: "U-Pass BC: CAD 47.85/month (1 Sep 2026 – 31 Aug 2027) for most students of the ten participating public institutions, paid through student fees. Concession fares (youth 13–18, seniors) do not cover adult university students.", ja: "U-Pass BC：参加する公立10校の大半の学生が対象で月 CAD 47.85（2026年9月1日〜2027年8月31日）、学費とともに支払い。コンセッション運賃（13〜18歳・高齢者）は成人の大学生には適用されません。" }) },
  living: { studentLife: { status: "unverified", note: carried, value: { en: "Outdoor-focused, diverse international community.", ja: "アウトドア志向で多国籍なコミュニティ。" } }, healthcare: pending(), sim: pending(), banking: pending(), studentFacilities: pending() },
};
export default profile;
