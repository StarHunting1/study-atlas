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
  education: { universities: { status: "unverified", note: carried, value: [{ name: "University of British Columbia" }, { name: "Simon Fraser University" }] }, languageSchools: {
    status: "unverified", period: "2026-10", checkedAt: "2026-10-15",
    note: { en: "Schools that appear in the Languages Canada directory or on their own pages. Details were read from those listings, not checked on each school's site, so they are unverified: check the school's site for the current address, courses, accommodation and fees. Prices are not shown.", ja: "Languages Canadaの認定リストや各校のページに掲載されている学校です。内容は掲載情報で、学校公式サイトでの確認はまだです（未確認）。最新の住所・コース・滞在手配・料金は学校の公式サイトでご確認ください。料金は表示していません。" },
    sources: [{ url: "https://www.languagescanada.ca/en/listing-directory/students", publisher: "Languages Canada (accredited programs)" }],
    value: [
      { name: "International House Vancouver", url: "https://ihworld.com/schools/countries/canada/ih-vancouver", where: { en: "Downtown, near Chinatown (listings give different street addresses, so none is shown)", ja: "ダウンタウン（チャイナタウン付近）。掲載ごとに住所が異なるため住所は載せていません" }, courses: { en: "General, business and academic English, university-pathway and exam preparation, junior programmes", ja: "一般・ビジネス・アカデミック英語、大学進学準備、試験対策、ジュニア向け" }, stay: { en: "Homestay and shared student houses", ja: "ホームステイ・学生用シェアハウス" }, note: { en: "Languages Canada accredited", ja: "Languages Canada認定校" }, source: { url: "https://www.languagescanada.ca/en/listing-directory/students/international-house-vancouver", publisher: "Languages Canada" } },
      { name: "Sprachcaffe Vancouver", url: "https://www.sprachcaffe.com/english/adults-english-courses-canada.htm", where: { en: "Downtown (Seymour Street)", ja: "ダウンタウン（シーモア・ストリート）" }, courses: { en: "Standard course (20 lessons a week) and intensive course (30 lessons a week)", ja: "標準コース（週20レッスン）、集中コース（週30レッスン）" }, stay: { en: "Homestay and a downtown residence", ja: "ホームステイ・市内の学生寮" }, note: { en: "Languages Canada accredited, as stated on the school's page", ja: "Languages Canada認定（学校ページの記載）" }, source: { url: "https://www.sprachcaffe.com/english/adults-english-courses-canada.htm", publisher: "Sprachcaffe" } },
      { name: "EF Vancouver", url: "https://www.ef.com/ca/ilsd/schools/vancouver", where: { en: "Cambie Street, Vancouver", ja: "バンクーバー（カンビー・ストリート）" }, note: { en: "Languages Canada accredited, as stated on the school's page. Courses and accommodation not confirmed yet.", ja: "Languages Canada認定（学校ページの記載）。コース・滞在手配は未確認です。" }, source: { url: "https://www.ef.com/ca/ilsd/schools/vancouver", publisher: "EF Education First" } },
    ] }, tuition: pending() },
  transport: { modes: { status: "unverified", note: carried, value: { en: "TransLink: SkyTrain, buses, SeaBus.", ja: "TransLink（スカイトレイン、バス、シーバス）。" } }, studentDiscount: textFact([P("van-upass")!, P("van-monthly-concession")!], { en: "U-Pass BC: CAD 47.85/month (1 Sep 2026 – 31 Aug 2027) for most students of the ten participating public institutions, paid through student fees. Concession fares (youth 13–18, seniors) do not cover adult university students.", ja: "U-Pass BC：参加する公立10校の大半の学生が対象で月 CAD 47.85（2026年9月1日〜2027年8月31日）、学費とともに支払い。コンセッション運賃（13〜18歳・高齢者）は成人の大学生には適用されません。" }) },
  living: { studentLife: { status: "unverified", note: carried, value: { en: "Outdoor-focused, diverse international community.", ja: "アウトドア志向で多国籍なコミュニティ。" } }, healthcare: pending(), sim: pending(), banking: pending(), studentFacilities: pending() },
};
export default profile;
