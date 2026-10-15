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
  education: { universities: { status: "unverified", note: carried, value: [{ name: "University of Manchester" }, { name: "Manchester Metropolitan University" }] }, languageSchools: {
    status: "unverified", period: "2026-10", checkedAt: "2026-10-15",
    note: { en: "Schools that appear in public accreditation directories (English UK / British Council). Details were read from those listings, not from each school's own site, so they are unverified: check the school's site for the current address, courses, accommodation and fees. Prices are not shown.", ja: "公的な認定リスト（English UK／British Council）に掲載されている学校です。内容は各リストの掲載情報で、学校公式サイトでの確認はまだです（未確認）。最新の住所・コース・滞在手配・料金は学校の公式サイトでご確認ください。料金は表示していません。" },
    sources: [{ url: "https://www.englishuk.com/", publisher: "English UK (member directory)" }, { url: "https://www.britishcouncil.org/", publisher: "British Council (Accreditation UK inspection summaries)" }],
    value: [
      { name: "Express English College", url: "https://www.expressenglishcollege.co.uk", where: { en: "Princess Road, south of the city centre (about 10 minutes by bus)", ja: "プリンセス・ロード（中心部から南へバスで約10分）" }, courses: { en: "General English (15/20/30 hours a week), IELTS preparation, Business English on request", ja: "一般英語（週15・20・30時間）、IELTS対策、ビジネス英語（要相談）" }, stay: { en: "Homestay and residential options listed", ja: "ホームステイ・寮の掲載あり" }, note: { en: "British Council accredited", ja: "British Council認定校" }, source: { url: "https://englishuk.com/member-directory?id=6665", publisher: "English UK" } },
      { name: "Excel College", where: { en: "City centre, near Piccadilly station", ja: "中心部（ピカデリー駅の近く）" }, courses: { en: "General English, IELTS preparation, Business English", ja: "一般英語、IELTS対策、ビジネス英語" }, stay: { en: "Homestay or flat share said to be arranged (third-party listing – check with the school)", ja: "ホームステイ・フラットシェアの手配あり（第三者掲載の情報・要確認）" }, note: { en: "British Council accredited; no official school URL confirmed yet", ja: "British Council認定校（公式サイトURLは未確認）" }, source: { url: "https://takeielts.britishcouncil.org/excel-college", publisher: "British Council" } },
      { name: "MC Academy", where: { en: "City centre, near Piccadilly Gardens (listings give different street addresses, so none is shown)", ja: "中心部（ピカデリー・ガーデンズ付近）。掲載ごとに住所が異なるため住所は載せていません" }, courses: { en: "General English, one-to-one, junior courses, exam preparation", ja: "一般英語、マンツーマン、ジュニア向け、試験対策" }, stay: { en: "Homestay and residential options listed", ja: "ホームステイ・寮等の掲載あり" }, note: { en: "British Council accredited; no official school URL confirmed yet", ja: "British Council認定校（公式サイトURLは未確認）" }, source: { url: "https://www.englishuk.com/en/course-finder/course-finder-results?id=228", publisher: "English UK" } },
    ] }, tuition: pending() },
  transport: { modes: { status: "unverified", note: carried, value: { en: "Metrolink tram, buses, rail.", ja: "メトロリンク（トラム）、バス、鉄道。" } },
    studentDiscount: textFact([P("man-anybus-28day-student")!, P("man-bus-allterms-student")!], { en: "Students aged 16–26: Bee AnyBus 28-day £63.30 (adult £87.40). Students at a Greater Manchester college/university: All Terms Bee Bus ticket £330 (1 Sep – 30 Jun).", ja: "16〜26歳の学生：Bee AnyBus 28日券 £63.30（大人 £87.40）。グレーター・マンチェスターの大学・カレッジの学生：All Terms Bee Bus 券 £330（9月1日〜6月30日）。" }) },
  living: { studentLife: { status: "unverified", note: carried, value: { en: "Music, football and a large student population.", ja: "音楽やサッカー、学生が多い街。" } }, healthcare: pending(), sim: pending(), banking: pending(), studentFacilities: pending() },
};
export default profile;
