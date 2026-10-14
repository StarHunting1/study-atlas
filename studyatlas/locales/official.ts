// UI strings for official city data (Ver.1.5): city tabs, data cards, climate charts, compare rows.
export const ot = {
  tabs: {
    overview: { en: "Overview", ja: "概要" }, living: { en: "Living Costs", ja: "生活費" }, housing: { en: "Housing", ja: "住居" },
    transport: { en: "Transport", ja: "交通" }, climate: { en: "Climate", ja: "気候" }, education: { en: "Education", ja: "学校" },
    visa: { en: "Visa & Healthcare", ja: "ビザ・医療" },
  },
  per: {
    trip: { en: "per trip", ja: "1回" }, day: { en: "per day", ja: "1日" }, week: { en: "per week", ja: "1週間" }, "4weeks": { en: "per 28 days", ja: "28日間" },
    month: { en: "per month", ja: "1か月" }, year: { en: "per year", ja: "1年" }, academicYear: { en: "per academic year", ja: "1学年" }, contract: { en: "per contract", ja: "契約期間" },
  },
  audience: {
    adult: { en: "General adult", ja: "一般の大人" }, student: { en: "Students (conditions apply)", ja: "学生（条件あり）" }, youth: { en: "Youth / concession", ja: "若者・割引対象者" },
    universityStudent: { en: "Students of this university", ja: "この大学の学生" }, undergraduate: { en: "Undergraduates (university estimate)", ja: "学部生（大学の見積もり）" },
    postgraduate: { en: "Postgraduates", ja: "大学院生" }, renter: { en: "All renters (whole market)", ja: "賃貸世帯全体（市場全体）" },
  },
  whoFor: { en: "Who it applies to", ja: "対象" }, validFor: { en: "Valid for", ja: "対象期間・年度" },
  conditions: { en: "Conditions", ja: "適用条件" }, section: { en: "Where on the page", ja: "該当箇所" },
  retrieved: { en: "Retrieved", ja: "最終取得日" }, checked: { en: "Last checked", ja: "最終確認日" }, source: { en: "Source", ja: "出典" },
  contract: { en: "Contract", ja: "契約期間" }, includes: { en: "Includes", ja: "含まれるもの" }, school: { en: "School", ja: "学校" },
  unverifiedNote: { en: "Not checked against the source yet – reference only.", ja: "出典との照合が未了のため、参考情報です。" },
  pendingNote: { en: "Not available yet.", ja: "まだ取得できていません。" },
  officialBadge: { en: "Official sources", ja: "公式情報源" },
  officialIntro: {
    en: "Figures below come from official pages and open data, in the original currency, with the period and the people they apply to. Each card links to its source.",
    ja: "以下の数値は公式ページ・オープンデータからの値です。元の通貨のまま、対象期間と対象者を明記し、各カードから出典を確認できます。",
  },
  noData: { en: "No official figures for this topic yet.", ja: "このテーマの公式データはまだありません。" },
  // Topic intros
  livingIntro: {
    en: "Living-cost estimates published by a university for its own students. They are a guide for that group (here: single undergraduates), not an average for every international student.",
    ja: "大学が自校の学生向けに公表している生活費の見積もりです。その対象（ここでは単身の学部生）向けの目安であり、すべての留学生の平均ではありません。",
  },
  housingUni: { en: "University accommodation (tied to a school and contract)", ja: "大学寮（学校・契約期間ごと）" },
  housingMarket: { en: "City rental market (all renters – not student housing)", ja: "都市の賃貸市場（全世帯対象・学生寮ではありません）" },
  housingEstimate: { en: "University estimates for other housing", ja: "その他の住居に関する大学の見積もり" },
  housingNote: {
    en: "University hall prices and city-wide average rents describe different things (contract, bills, who can apply). They are shown separately and never combined.",
    ja: "大学寮の料金と都市全体の平均家賃は、契約内容・光熱費・入居資格が異なる別の情報です。分けて表示し、混ぜて扱いません。",
  },
  transportAdult: { en: "Standard adult fares", ja: "大人の通常運賃" },
  transportStudent: { en: "Student, youth and concession options", ja: "学生・若者・割引の選択肢" },
  // Climate
  climateTemp: { en: "Average temperature (°C)", ja: "平均気温（℃）" },
  climatePrecip: { en: "Average precipitation (mm)", ja: "平均降水量（mm）" },
  climateMean: { en: "Mean", ja: "平均" }, climateRange: { en: "Daily max–min", ja: "日最高〜日最低" },
  climateMax: { en: "Max", ja: "最高" }, climateMin: { en: "Min", ja: "最低" },
  climatePeriod: { en: "Averaging period", ja: "統計期間" }, climateStation: { en: "Station", ja: "観測地点" },
  showTable: { en: "Show as table", ja: "表で表示" }, hideTable: { en: "Hide table", ja: "表を閉じる" },
  climateMissing: { en: "Monthly climate averages are not available from an official source yet.", ja: "公式な月別の気候平年値はまだ取得できていません。" },
  // Visa
  visaIntro: {
    en: "Visa and healthcare rules depend on your nationality, course and dates, and change often. StudyAtlas does not give guidance here: check the official pages below. Collected summaries are not shown until a person has approved them.",
    ja: "ビザや医療の制度は、国籍・課程・時期によって異なり、頻繁に変わります。StudyAtlasでは案内を行わず、以下の公式ページでの確認をお願いしています。収集した要約は、人による承認までは表示しません。",
  },
  officialPages: { en: "Official pages to check", ja: "確認すべき公式ページ" },
  linkUnchecked: { en: "link not yet checked by StudyAtlas", ja: "リンクはStudyAtlasで未確認" },
  // Overview
  highlights: { en: "Key figures", ja: "主な数値" },
  dataStatus: { en: "Official data status", ja: "公式データの状態" },
  seeTab: { en: "Details", ja: "詳細" },
  // Compare
  cmpTitle: { en: "Official figures side by side", ja: "公式データの並列比較" },
  cmpIntro: {
    en: "Shown in each city's own currency. A row is marked comparable only when the figures are verified and describe the same thing (same period, same group of people). Currencies are not converted.",
    ja: "各都市の通貨のまま表示します。確認済みで、同じ期間・同じ対象者の数値どうしのときだけ「比較可」とします。通貨換算は行いません。",
  },
  cmpOk: { en: "Same basis – different currencies, not converted", ja: "条件は同じ（通貨が異なるため換算なし）" },
  cmpOkSame: { en: "Same basis", ja: "条件は同じ" },
  cmpPer: { en: "Not comparable: different period", ja: "比較不可：期間の単位が異なる" },
  cmpAudience: { en: "Not comparable: different groups of people", ja: "比較不可：対象者が異なる" },
  cmpUnverified: { en: "Not comparable: not verified", ja: "比較不可：未確認のデータ" },
  cmpMissing: { en: "No official figure", ja: "公式データなし" },
  cmpClimatePeriods: { en: "Averaging periods differ", ja: "統計期間が異なります" },
} as const;
