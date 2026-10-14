import type { ClimateNormals, DataPoint, Evidence, OfficialCityData } from "./types";
/*
 * Manchester – official figures. Every quote below is verbatim page text read by the collector's live probe on
 * GitHub Actions (2026-10-13, robots.txt allowed). The page check re-reads these pages on each source's cadence.
 */
const D = "2026-10-13";
const BUS = "https://tfgm.com/tickets-and-passes/bus-tickets";
const STUDENT_BUS = "https://tfgm.com/tickets-and-passes/all-terms-bee-bus-student";
const COL = "https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/";
const INTL = "https://www.manchester.ac.uk/study/international/accommodation/";
const TFGM = "Transport for Greater Manchester (Bee Network)"; const UOM = "The University of Manchester";

const busEv = (quote: string): Evidence => ({ url: BUS, publisher: TFGM, section: { en: "Bus tickets – ticket prices", ja: "バス乗車券 – 料金" }, quote });
const colEv = (quote: string, section = { en: "Estimated living costs 2026/7 for undergraduate students (table)", ja: "学部生の生活費見積もり 2026/7（表）" }): Evidence => ({ url: COL, publisher: UOM, section, quote });
const busFare = { en: "Published fare on the TfGM page as of 13 Oct 2026 (no effective date stated on the page)", ja: "2026年10月13日時点でTfGMのページに掲載の運賃（ページに適用開始日の記載なし）" };
const ok = { retrievedAt: D, checkedAt: D, status: "verified" as const };
const ugYear = "2026/27 academic year (undergraduate year of 41 weeks)";

const points: DataPoint[] = [
  // ---- Transport (Bee Network buses) ----
  { id: "man-bus-single-adult", cityId: "manchester", topic: "transport", sourceId: "tfgm-fares", metric: "transport.single.adult",
    label: { en: "Bus single ticket (adult)", ja: "バス 片道（大人）" }, value: { amount: 2, currency: "GBP", per: "trip" }, audience: "adult",
    conditions: { en: "Bee Bus single ‘hopper’ ticket on Bee Network buses. Children £1.", ja: "Bee Network のバスの片道「hopper」券。子どもは £1。" },
    validFor: busFare.en, evidence: [busEv("The Bee Bus single ‘hopper’ ticket costs £2 for adults and £1 for children.")], ...ok },
  { id: "man-bus-day-adult", cityId: "manchester", topic: "transport", sourceId: "tfgm-fares", metric: "transport.dayPass.adult",
    label: { en: "Bus 1-day ticket (adult)", ja: "バス 1日券（大人）" }, value: { amount: 5, currency: "GBP", per: "day" }, audience: "adult",
    conditions: { en: "1-day Bee Bus ticket, Bee Network buses.", ja: "Bee Network のバス 1日券。" },
    validFor: busFare.en, evidence: [busEv("A 1-day Bee Bus ticket costs £2.50 for children and £5 for adults.")], ...ok },
  { id: "man-bus-7day-adult", cityId: "manchester", topic: "transport", sourceId: "tfgm-fares", metric: "transport.weekPass.adult",
    label: { en: "Bus 7-day ticket (adult)", ja: "バス 7日券（大人）" }, value: { amount: 20, currency: "GBP", per: "week" }, audience: "adult",
    conditions: { en: "7-day Bee Bus ticket, Bee Network buses.", ja: "Bee Network のバス 7日券。" },
    validFor: busFare.en, evidence: [busEv("A 7-day Bee Bus ticket costs £10 for children and £20 for adults.")], ...ok },
  { id: "man-bus-28day-adult", highlight: true, cityId: "manchester", topic: "transport", sourceId: "tfgm-fares", metric: "transport.periodPass.adult",
    label: { en: "Bus 28-day ticket (adult)", ja: "バス 28日券（大人）" }, value: { amount: 80, currency: "GBP", per: "4weeks" }, audience: "adult",
    conditions: { en: "28-day Bee Bus ticket, Bee Network buses only (not other operators, not tram).", ja: "Bee Network のバスのみ（他社バス・トラムは対象外）の28日券。" },
    validFor: busFare.en, evidence: [busEv("A 28-day Bee Bus ticket costs £40 for children and £80 for adults.")], ...ok },
  { id: "man-bus-annual-adult", cityId: "manchester", topic: "transport", sourceId: "tfgm-fares", metric: "transport.annualPass.adult",
    label: { en: "Annual Bee Bus ticket (adult)", ja: "バス 年間券（大人）" }, value: { amount: 800, currency: "GBP", per: "year" }, audience: "adult",
    conditions: { en: "Annual Bee Bus ticket, Bee Network buses.", ja: "Bee Network のバス 年間券。" },
    validFor: busFare.en, evidence: [busEv("The Annual Bee Bus ticket costs £800, offering savings of up to £240.")], ...ok },
  { id: "man-anybus-28day-adult", cityId: "manchester", topic: "transport", sourceId: "tfgm-fares", metric: "transport.periodPassAllOperators.adult",
    label: { en: "Bee AnyBus 28-day ticket (adult, any operator)", ja: "Bee AnyBus 28日券（大人・全事業者のバス）" }, value: { amount: 87.4, currency: "GBP", per: "4weeks" }, audience: "adult",
    conditions: { en: "Any bus operator in Greater Manchester.", ja: "グレーター・マンチェスター内の全事業者のバスで利用可。" },
    validFor: busFare.en, evidence: [busEv("A 28-day Bee AnyBus ticket costs £63.30 for a young person (aged 16-21) / student (aged 16-26) and £87.40 for adults.")], ...ok },
  { id: "man-anybus-28day-student", highlight: true, cityId: "manchester", topic: "transport", sourceId: "tfgm-fares", metric: "transport.periodPassAllOperators.student",
    label: { en: "Bee AnyBus 28-day ticket (student / young person)", ja: "Bee AnyBus 28日券（学生・若者）" }, value: { amount: 63.3, currency: "GBP", per: "4weeks" }, audience: "student",
    conditions: { en: "Students aged 16–26 or young people aged 16–21. Any bus operator in Greater Manchester.", ja: "16〜26歳の学生、または16〜21歳の若者。グレーター・マンチェスター内の全事業者のバスで利用可。" },
    validFor: busFare.en, evidence: [busEv("A 28-day Bee AnyBus ticket costs £63.30 for a young person (aged 16-21) / student (aged 16-26) and £87.40 for adults.")], ...ok },
  { id: "man-anybus-7day-student", cityId: "manchester", topic: "transport", sourceId: "tfgm-fares", metric: "transport.weekPassAllOperators.student",
    label: { en: "Bee AnyBus 7-day ticket (student / young person)", ja: "Bee AnyBus 7日券（学生・若者）" }, value: { amount: 18.6, currency: "GBP", per: "week" }, audience: "student",
    conditions: { en: "Students aged 16–26 or young people aged 16–21 (adult price £21). Any bus operator in Greater Manchester.", ja: "16〜26歳の学生、または16〜21歳の若者（大人は £21）。全事業者のバスで利用可。" },
    validFor: busFare.en, evidence: [busEv("A 7-day Bee AnyBus ticket costs £18.60 for a young person (aged 16-21) / student (aged 16-26) and £21 for adults.")], ...ok },
  { id: "man-bus-allterms-student", cityId: "manchester", topic: "transport", sourceId: "tfgm-fares", metric: "transport.studentTermPass",
    label: { en: "All Terms Bee Bus student ticket", ja: "学生向け All Terms Bee Bus 券（通年）" }, value: { amount: 330, currency: "GBP", per: "academicYear" }, audience: "student",
    conditions: { en: "Students at any college or university in Greater Manchester, with a Greater Manchester college/university ID (not an NUS card). Valid 1 September – 30 June on Bee Network buses.", ja: "グレーター・マンチェスターの大学・カレッジの学生（学生証が必要、NUSカード不可）。9月1日〜6月30日、Bee Network のバスで有効。" },
    validFor: busFare.en,
    evidence: [{ url: STUDENT_BUS, publisher: TFGM, section: { en: "All Terms Bee Bus ticket – Price", ja: "All Terms Bee Bus ticket – 料金" }, quote: "The cost of an All Terms Bee Bus ticket is £330." }], ...ok },

  // ---- Housing: University of Manchester halls (university-run, NOT the city rent average) ----
  { id: "man-uom-halls-selfcatered-year", cityId: "manchester", topic: "housing", sourceId: "uom-accommodation", metric: "housing.universityHalls.selfCatered",
    label: { en: "University of Manchester halls, self-catered (per year)", ja: "マンチェスター大学寮・自炊（年額）" }, value: { amount: 4853, max: 12096, currency: "GBP", per: "year" }, audience: "universityStudent",
    conditions: { en: "University of Manchester students in University halls. Hall fees include contents insurance, utility bills (usually gas and electricity) and internet. Contracts run for the year of study (e.g. 41/42 weeks undergraduate, 50/51 weeks postgraduate taught).", ja: "マンチェスター大学の学生（大学寮）。寮費に家財保険・光熱費（通常ガス・電気）・インターネットを含む。契約期間は学年単位（例：学部 41/42週、修士 50/51週）。" },
    validFor: "2026/27 (as published on the cost-of-living page)",
    housing: { schoolId: "uom", school: "The University of Manchester", roomType: { en: "Self-catered rooms (range across halls and room types)", ja: "自炊の部屋（寮・部屋タイプ全体の幅）" }, contract: { en: "41/42 weeks (undergraduate) or 50/51 weeks (postgraduate taught)", ja: "41/42週（学部）または 50/51週（修士）" }, includes: { en: "Contents insurance, utility bills (usually gas and electricity), internet", ja: "家財保険、光熱費（通常ガス・電気）、インターネット" }, catered: false },
    evidence: [colEv("The University of Manchester self-catered accommodation can range in price from £4,853 to £12,096 a year.", { en: "Estimated accommodation costs", ja: "住居費の見積もり" }),
      colEv("University halls of residence contracts run for the duration of your year of study (e.g. 41/42 weeks for undergraduate and 50/51 for postgraduate taught).", { en: "Estimated accommodation costs", ja: "住居費の見積もり" })], ...ok },
  { id: "man-uom-halls-catered-month", highlight: true, cityId: "manchester", topic: "housing", sourceId: "uom-accommodation", metric: "housing.universityHalls.catered",
    label: { en: "University of Manchester halls, catered (per month)", ja: "マンチェスター大学寮・食事付き（月額）" }, value: { amount: 555, max: 982, currency: "GBP", per: "month" }, audience: "universityStudent",
    conditions: { en: "University of Manchester catered halls; the monthly figure includes the cost of catering. Catering is offered 34 of the 41 weeks of the licence agreement.", ja: "マンチェスター大学の食事付き寮。月額に食費を含む。食事の提供は契約41週のうち34週。" },
    validFor: "2026/27 (as published on the cost-of-living page)",
    housing: { schoolId: "uom", school: "The University of Manchester", roomType: { en: "Catered rooms (range)", ja: "食事付きの部屋（幅）" }, contractWeeks: 41, contract: { en: "41 weeks (catered halls)", ja: "41週（食事付き寮）" }, includes: { en: "Catering, contents insurance, utility bills, internet", ja: "食事、家財保険、光熱費、インターネット" }, catered: true },
    evidence: [colEv("The University of Manchester halls of residence (catered) £555-£982 (includes cost of catering)", { en: "Estimated accommodation costs – Monthly cost", ja: "住居費の見積もり – 月額" }),
      { url: "https://www.manchester.ac.uk/study/accommodation/student-accommodation/", publisher: UOM, section: { en: "Catered halls", ja: "食事付きの寮" }, quote: "Catering is available every week except for vacation dates and bank holidays, therefore offered 34 of the 41 weeks of your licence agreement." }], ...ok },
  { id: "man-uom-intl-selfcatered-shared-week", cityId: "manchester", topic: "housing", sourceId: "uom-accommodation", metric: "housing.universityHalls.selfCateredShared.from",
    label: { en: "University of Manchester: single self-catering room, shared facilities (from)", ja: "マンチェスター大学：自炊・共用設備の個室（最低額）" }, value: { amount: 119, currency: "GBP", per: "week" }, audience: "universityStudent",
    conditions: { en: "Starting price stated on the University's international students' accommodation page.", ja: "大学の留学生向け住居ページに記載の最低価格。" },
    validFor: "As published on 13 Oct 2026 (academic year not stated next to the price)",
    housing: { schoolId: "uom", school: "The University of Manchester", roomType: { en: "Single self-catering room with shared facilities", ja: "自炊・共用設備の個室" }, catered: false },
    evidence: [{ url: INTL, publisher: UOM, section: { en: "International students' accommodation – prices", ja: "留学生向け住居 – 料金" }, quote: "from £119 per week for a single self-catering room with shared facilities;" }], ...ok },
  { id: "man-uom-intl-selfcatered-ensuite-week", cityId: "manchester", topic: "housing", sourceId: "uom-accommodation", metric: "housing.universityHalls.selfCateredEnsuite.from",
    label: { en: "University of Manchester: single self-catering en-suite room (from)", ja: "マンチェスター大学：自炊・専用バスルーム付き個室（最低額）" }, value: { amount: 175, currency: "GBP", per: "week" }, audience: "universityStudent",
    conditions: { en: "Starting price stated on the University's international students' accommodation page.", ja: "大学の留学生向け住居ページに記載の最低価格。" },
    validFor: "As published on 13 Oct 2026 (academic year not stated next to the price)",
    housing: { schoolId: "uom", school: "The University of Manchester", roomType: { en: "Single self-catering room with en-suite facilities", ja: "自炊・専用バスルーム付き個室" }, catered: false },
    evidence: [{ url: INTL, publisher: UOM, section: { en: "International students' accommodation – prices", ja: "留学生向け住居 – 料金" }, quote: "from £175 per week for a single self-catering room with en-suite facilities;" }], ...ok },
  { id: "man-uom-intl-catered-week", cityId: "manchester", topic: "housing", sourceId: "uom-accommodation", metric: "housing.universityHalls.cateredShared.from",
    label: { en: "University of Manchester: single room, catered hall (from)", ja: "マンチェスター大学：食事付き寮の個室（最低額）" }, value: { amount: 184, currency: "GBP", per: "week" }, audience: "universityStudent",
    conditions: { en: "Starting price stated on the University's international students' accommodation page.", ja: "大学の留学生向け住居ページに記載の最低価格。" },
    validFor: "As published on 13 Oct 2026 (academic year not stated next to the price)",
    housing: { schoolId: "uom", school: "The University of Manchester", roomType: { en: "Single room with shared facilities in a catered hall", ja: "食事付き寮の共用設備の個室" }, catered: true },
    evidence: [{ url: INTL, publisher: UOM, section: { en: "International students' accommodation – prices", ja: "留学生向け住居 – 料金" }, quote: "from £184 per week for a single room with shared facilities in a catered hall." }], ...ok },
  { id: "man-uom-est-private-share-month", cityId: "manchester", topic: "housing", sourceId: "uom-cost-of-living", metric: "housing.privateShare.universityEstimate",
    label: { en: "Private house share incl. bills – University estimate (per month)", ja: "民間シェアハウス（光熱費込み）– 大学の見積もり（月額）" }, value: { amount: 645, max: 710, currency: "GBP", per: "month" }, audience: "universityStudent",
    conditions: { en: "University of Manchester estimate for students renting a room in a private house share, with average bills included. Not an official city-wide rent statistic.", ja: "マンチェスター大学による、民間シェアハウスの1部屋（平均的な光熱費込み）の見積もり。市全体の公式家賃統計ではありません。" },
    validFor: "2026/27 (as published on the cost-of-living page)",
    evidence: [colEv("Privately rented house shares (with average bills cost included) £ 645 - 710", { en: "Estimated accommodation costs – Monthly cost", ja: "住居費の見積もり – 月額" })], ...ok },

  // ---- Living costs: University of Manchester undergraduate estimate (not an average for all students) ----
  ...([
    ["groceries", "Groceries", "食料品", 250, "Groceries** £2,500 £250", "Lower if the student chooses catered accommodation (page note).", "食事付き寮を選ぶ場合は少なくなります（ページの注記）。"],
    ["takeaways", "Takeaways", "テイクアウト", 51, "Takeaways £510 £51", "", ""],
    ["transport", "Transport (local and travel elsewhere)", "交通費（市内・市外への移動）", 70, "Transport (including local transport and travelling elsewhere) £700 £70", "", ""],
    ["phone", "Mobile phone", "携帯電話", 35, "Mobile phone contract/payments £350 £35", "", ""],
    ["social", "Going out and socialising", "外出・交際費", 110, "Going out and socialising £1,100 £110", "", ""],
    ["clothes", "Clothes", "衣類", 42, "Clothes £420 £42", "", ""],
    ["health", "Health and wellbeing", "健康・ウェルビーイング", 25, "Health and wellbeing £250 £25", "", ""],
    ["course", "Course materials", "教材費", 21, "Course materials £210 £21", "", ""],
    ["total", "Total (catered; self-catered £1,503)", "合計（食事付き寮の場合。自炊は £1,503）", 1484, "Total* £14,840 (£15,030 if self-catered) £1,484 (£1,503 if self-catered)", "Total including accommodation, for one undergraduate year of 41 weeks.", "住居費を含む、学部の1学年（41週）の合計です。"],
  ] as const).map(([key, en, ja, amount, quote, noteEn, noteJa]): DataPoint => ({
    id: `man-uom-ug-${key}`, highlight: key === "total", cityId: "manchester", topic: "living", sourceId: "uom-cost-of-living", metric: `living.universityEstimate.${key}`,
    label: { en: `${en} – UoM undergraduate estimate`, ja: `${ja} – マンチェスター大学の学部生向け見積もり` }, value: { amount, currency: "GBP", per: "month" }, audience: "undergraduate",
    conditions: { en: "University of Manchester estimate for a single undergraduate student; monthly figure based on a 41-week undergraduate year. A guide only, not an average for all students.", ja: "マンチェスター大学による単身の学部生向けの見積もり。月額は学部の1学年41週を基準にした値です。目安であり、すべての留学生の平均ではありません。" },
    validFor: ugYear, evidence: [colEv(quote)], ...ok,
    note: { en: `Groceries based on a budget supermarket shop in April 2026; other costs from savethestudent.org's National Student Money Survey, increased with inflation as of February 2026 (as stated on the page).${noteEn ? " " + noteEn : ""}`, ja: `食料品は2026年4月の格安スーパーでの買い物、その他は savethestudent.org の National Student Money Survey を2026年2月時点のインフレ率で調整した値です（ページの記載）。${noteJa}` },
  })),
];

/* Ringway (Manchester Airport): Met Office monthly station data, calendar-month means derived by StudyAtlas (collector/sources/metoffice.ts). */
const RW = "https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/ringwaydata.txt";
const tmax = [6.85, 7.27, 9.46, 11.92, 15.68, 18.01, 20.3, 20.09, 17.14, 13.54, 9.58, 7.61];
const tmin = [1.52, 1.57, 3.06, 4.49, 7.39, 10.12, 12.36, 12.13, 9.98, 7.24, 3.9, 2.32];
const rain = [71.51, 51.59, 64.02, 49.05, 53.81, 66.77, 59.51, 70.9, 69.94, 85.99, 81.88, 81.21];
const rwEv = (key: string, v: number[]): Evidence => ({ url: RW, publisher: "Met Office", section: { en: `Historical monthly data, station Ringway, column ${key}: calendar-month means 1971–2000`, ja: `月別履歴データ 観測地点 Ringway、列 ${key}：1971–2000 暦月平均` }, quote: `Ringway ${key} 1971–2000 calendar-month means: ${v.join(", ")}`, terms: "UK Open Government Licence v3.0" });
const climate: ClimateNormals = {
  id: "man-climate-ringway-1971-2000", cityId: "manchester", sourceId: "metoffice-station-data", station: "Ringway (Manchester Airport)", period: "1971–2000", derived: true,
  months: tmax.map((m, i) => ({ maxC: m, minC: tmin[i], precipMm: rain[i] })),
  evidence: [rwEv("tmax", tmax), rwEv("tmin", tmin), rwEv("rain", rain)],
  collectedIds: ["metoffice-station-data:ringway:1971-2000:tmax", "metoffice-station-data:ringway:1971-2000:tmin", "metoffice-station-data:ringway:1971-2000:rain"],
  retrievedAt: "2026-10-14", checkedAt: "2026-10-14", status: "verified",
  note: {
    en: "Calculated by StudyAtlas from the Met Office's monthly values for Ringway (tmax = mean daily maximum, tmin = mean daily minimum, rain = total rainfall; each calendar month averaged over 1971–2000, all 30 years present). Mean temperature is not published in this dataset, so it is not shown. Ringway is Manchester Airport, about 14 km south of the city centre (53.356°N, 2.279°W, 69 m): city-centre temperatures can differ. The Ringway file ends in October 2004 (\"Site Closed\"), so 1981–2010 and 1991–2020 cannot be calculated from it.",
    ja: "Met Officeが公開するRingway（マンチェスター空港）の月別値から、StudyAtlasが計算した値です（tmax＝日最高気温の平均、tmin＝日最低気温の平均、rain＝降水量の合計。1971〜2000年の30年分すべてがそろった暦月ごとの平均）。このデータセットには平均気温がないため表示していません。Ringwayは市中心部から約14km南の空港（北緯53.356°・西経2.279°・標高69m）にあり、市中心部の気温とは異なる場合があります。Ringwayのファイルは2004年10月で終わっている（「Site Closed」）ため、1981–2010・1991–2020は計算できません。",
  },
};

const data: OfficialCityData = { cityId: "manchester", points, climate };
export default data;
