import { pending, type CityProfile } from "../schema";
import official from "../official/manchester";
import { moneyFact, pointById, textFact } from "../official/toFact";
// Ver.1.0 text below was written without a checked source, so it is kept as "unverified".
// Costs and student transport come from official data (data/official/manchester.ts, Ver.1.5); the Ver.1.0 demo
// cost numbers were removed. Everything else is "pending" until researched (see data/RESEARCH.md).
const P = (id: string) => pointById(official.points, id);
const ugEstimate = (what: string, ja: string) => ({ en: `${what} – University of Manchester estimate for a single undergraduate (2026/27, 41-week year)`, ja: `${ja} – マンチェスター大学の単身学部生向け見積もり（2026/27、41週）` });
const carried = { en: "Initial summary from StudyAtlas Ver.1.0; not yet checked against an official source.", ja: "StudyAtlas Ver.1.0時点の概要です。公式情報との照合はまだ行っていません。" };
const profile: CityProfile = {
  cost: {
    rent: pending({ en: "No official city-wide rent statistic yet (ONS source planned). See the Housing tab for University of Manchester hall prices.", ja: "市全体の公式家賃統計はまだありません（ONS を予定）。大学寮の料金は「住居」タブをご覧ください。" }),
    food: moneyFact(P("man-uom-ug-groceries"), ugEstimate("Groceries", "食料品")),
    transport: moneyFact(P("man-uom-ug-transport"), ugEstimate("Transport incl. travel elsewhere", "交通費（市外への移動を含む）")),
    phone: moneyFact(P("man-uom-ug-phone"), ugEstimate("Mobile phone", "携帯電話")),
    totalMonthly: moneyFact(P("man-uom-ug-total"), ugEstimate("Total incl. catered accommodation", "合計（食事付き寮を含む）")),
  },
  housing: { overview: { status: "unverified", note: carried, value: { en: "University halls, student housing, house shares.", ja: "大学寮、学生向け住宅、ハウスシェア。" } }, dorm: pending(), homestay: pending(), shareHouse: pending() },
  climate: { overview: { status: "unverified", note: carried, value: { en: "Cool and often rainy year-round.", ja: "年間を通じて涼しく雨が多め。" } }, monthly: pending() },
  safety: { crimeStats: pending(), advice: pending() },
  education: { universities: { status: "unverified", note: carried, value: [{ name: "University of Manchester" }, { name: "Manchester Metropolitan University" }] }, languageSchools: pending(), tuition: pending() },
  transport: { modes: { status: "unverified", note: carried, value: { en: "Metrolink tram, buses, rail.", ja: "メトロリンク（トラム）、バス、鉄道。" } },
    studentDiscount: textFact([P("man-anybus-28day-student")!, P("man-bus-allterms-student")!], { en: "Students aged 16–26: Bee AnyBus 28-day £63.30 (adult £87.40). Students at a Greater Manchester college/university: All Terms Bee Bus ticket £330 (1 Sep – 30 Jun).", ja: "16〜26歳の学生：Bee AnyBus 28日券 £63.30（大人 £87.40）。グレーター・マンチェスターの大学・カレッジの学生：All Terms Bee Bus 券 £330（9月1日〜6月30日）。" }) },
  living: { studentLife: { status: "unverified", note: carried, value: { en: "Music, football and a large student population.", ja: "音楽やサッカー、学生が多い街。" } }, healthcare: pending(), sim: pending(), banking: pending(), studentFacilities: pending() },
};
export default profile;
