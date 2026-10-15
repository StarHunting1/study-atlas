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
    note: { en: "Schools that appear in public accreditation directories (English UK / British Council) or on their own sites. Details were read from those listings, not confirmed with each school, and whether each school is operating today has not been checked directly, so everything here is unverified: check the school's site for the current address, courses, accommodation and fees. Prices are not shown.", ja: "公的な認定リスト（English UK／British Council）や各校サイトに掲載されている学校です。内容は掲載情報で、各校への直接確認や現在の営業状況の確認はしていないため、すべて未確認です。最新の住所・コース・滞在手配・料金は学校の公式サイトでご確認ください。料金は表示していません。" },
    sources: [{ url: "https://www.englishuk.com/", publisher: "English UK (member directory)" }, { url: "https://www.britishcouncil.org/", publisher: "British Council (Accreditation UK inspection summaries)" }],
    value: [
      { id: "man-express-english-college", name: "Express English College", url: "https://expressenglishcollege.co.uk", where: { en: "Manchester – 130 Princess Road, M16 7BY (south of the city centre, about 10 minutes by bus). Matches the English UK directory entry.", ja: "マンチェスター市内：130 Princess Road, M16 7BY（中心部から南へバスで約10分）。English UKの掲載内容と一致" }, courses: { en: "General English (15/20/30 hours a week), IELTS preparation, Business English on request", ja: "一般英語（週15・20・30時間）、IELTS対策、ビジネス英語（要相談）" }, stay: { en: "Homestay and residential options listed in the English UK directory", ja: "English UK掲載でホームステイ・寮の取り扱いあり" }, note: { en: "English UK member and British Council accredited (the school's own pages and a 2024 inspection summary say so).", ja: "English UK会員・British Council認定校（学校サイトと2024年の査察要約の記載）。" }, source: { url: "https://englishuk.com/member-directory?id=6665", publisher: "English UK" } },
      { id: "man-mc-academy", name: "MC Academy", url: "https://themcacademy.co.uk/", where: { en: "Manchester city centre (listings give two different street addresses – Oldham Street and Mosley Street – so none is shown)", ja: "マンチェスター中心部。掲載ごとに住所が異なる（Oldham Street／Mosley Street）ため住所は載せていません" }, courses: { en: "General English, one-to-one, junior courses, exam preparation", ja: "一般英語、マンツーマン、ジュニア向け、試験対策" }, stay: { en: "Homestay and residential options listed", ja: "ホームステイ・寮等の掲載あり" }, note: { en: "British Council accredited and an English UK member (formerly Manchester Central School of English). Which address is current is unconfirmed.", ja: "British Council認定・English UK会員（旧 Manchester Central School of English）。現在の住所は未確認。" }, source: { url: "https://www.englishuk.com/en/course-finder/course-finder-results?id=228", publisher: "English UK" } },
      { id: "man-excel-college", hidden: true, name: "Excel College (listed as “UKEC Academy – formerly Excel College Manchester”)", where: { en: "Manchester city centre (older listings: Fairfield Street; newer listings: Oxford Street – so no street address is shown)", ja: "マンチェスター中心部（古い掲載は Fairfield Street、新しい掲載は Oxford Street のため、住所は載せていません）" }, courses: { en: "General English, IELTS preparation, Business English (older listings)", ja: "一般英語、IELTS対策、ビジネス英語（古い掲載の情報）" }, note: { en: "Unconfirmed: a directory shows the school renamed UKEC Academy, and no official site or current accreditation was confirmed. Do not rely on this entry without checking with the school.", ja: "未確認：ディレクトリ上では UKEC Academy に名称変更とされ、公式サイトと現在の認定状況は確認できていません。学校に確認するまで、この情報を前提にしないでください。" }, source: { url: "https://www.languageinternational.co.uk/school/ukec-academy-formerly-excel-college-manchester-66291", publisher: "Language International (directory)" } },
    ] }, tuition: pending() },
  transport: { modes: { status: "unverified", note: carried, value: { en: "Metrolink tram, buses, rail.", ja: "メトロリンク（トラム）、バス、鉄道。" } },
    studentDiscount: textFact([P("man-anybus-28day-student")!, P("man-bus-allterms-student")!], { en: "Students aged 16–26: Bee AnyBus 28-day £63.30 (adult £87.40). Students at a Greater Manchester college/university: All Terms Bee Bus ticket £330 (1 Sep – 30 Jun).", ja: "16〜26歳の学生：Bee AnyBus 28日券 £63.30（大人 £87.40）。グレーター・マンチェスターの大学・カレッジの学生：All Terms Bee Bus 券 £330（9月1日〜6月30日）。" }) },
  living: { studentLife: { status: "unverified", note: carried, value: { en: "Music, football and a large student population.", ja: "音楽やサッカー、学生が多い街。" } }, healthcare: pending(), sim: pending(), banking: pending(), studentFacilities: pending() },
};
export default profile;
