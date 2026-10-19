import { pending, type CityProfile } from "../schema";
// Ver.1.0 text below was written without a checked source, so it is kept as "unverified".
// Demo cost numbers stay "sample". Everything else is "pending" until researched (see data/RESEARCH.md).
const carried = { en: "Initial summary from StudyAtlas Ver.1.0; not yet checked against an official source.", ja: "StudyAtlas Ver.1.0時点の概要です。公式情報との照合はまだ行っていません。" };
const demo = { en: "Demo placeholder. Period, coverage and source are undefined; do not use for planning.", ja: "デモ用の仮の数値です。対象期間・含まれる項目・出典が未定義のため、計画には使わないでください。" };
const profile: CityProfile = {
  cost: {
    rent: { status: "sample", value: { amount: 1500, currency: "CAD", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
    food: pending(),
    transport: { status: "sample", value: { amount: 150, currency: "CAD", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
    phone: pending(),
    totalMonthly: { status: "sample", value: { amount: 2500, currency: "CAD", per: "month", includes: { en: "undefined (demo)", ja: "未定義（デモ）" } }, note: demo },
  },
  housing: { overview: { status: "unverified", note: carried, value: { en: "Shared apartments, residences, homestay.", ja: "シェアアパート、寮、ホームステイ。" } }, dorm: pending(), homestay: pending(), shareHouse: pending() },
  climate: { overview: { status: "unverified", note: carried, value: { en: "Cold winters; warm, humid summers.", ja: "冬は寒く、夏は暖かく蒸し暑い。" } }, monthly: pending() },
  safety: { crimeStats: pending(), advice: pending() },
  education: { universities: { status: "unverified", note: carried, value: [{ name: "University of Toronto" }, { name: "York University" }] }, languageSchools: {
    status: "unverified", period: "2026-10", checkedAt: "2026-10-17",
    note: { en: "Language schools whose own pages (and, for EF, the Languages Canada listing) were opened on 2026-10-17. The address and the accreditation wording are what those pages say; the schools were not contacted and whether each is operating today is judged only from the live pages, so everything here is unverified: check the school's site for the current address, courses, accommodation and fees. These are language schools, not universities. Prices are not shown.", ja: "2026-10-17に各校の公式ページ（EFはLanguages Canadaの掲載ページも）を開いて確認した語学学校です。住所や認定に関する記載は各ページの内容で、各校への直接確認はしておらず、現在の営業状況もページが稼働していることから判断しているだけなので、すべて未確認です。最新の住所・コース・滞在手配・料金は学校の公式サイトでご確認ください。大学ではなく語学学校です。料金は表示していません。" },
    sources: [{ url: "https://www.languagescanada.ca/en/listing-directory/students", publisher: "Languages Canada (accredited programs)" }],
    value: [
      { id: "tor-ef", name: "EF International Language Campus – Toronto", checks: [
        { kind: "provider", state: "notChecked", detail: { en: "The school's legal registration (company or education-provider registration) was not looked up, so none is stated.", ja: "学校の法人・教育機関としての登録は調べていないため、記載していません。" } },
        { kind: "campus", state: "confirmed", detail: { en: "The Languages Canada listing gives 127 Portland Street, ON M5V 2N4; the school's page gives the same postal code.", ja: "Languages Canadaの掲載は127 Portland Street, ON M5V 2N4で、学校のページの郵便番号も一致しています。" } },
        { kind: "course", state: "stated", detail: { en: "Courses are what the school's own pages say; they were not matched to any third-party record.", ja: "コースは学校自身のページの記載で、第三者の記録とは照合していません。" } },
        { kind: "accreditation", state: "confirmed", detail: { en: "The Languages Canada listing and the school's own page both say the programme is accredited by Languages Canada.", ja: "Languages Canadaの掲載と学校自身のページの両方が、Languages Canadaの認定プログラムであると記載しています。" } },
      ], url: "https://www.ef.com/ca/ilsd/schools/toronto/", feesUrl: "https://www.ef.com/ca/ilsd/schools/toronto/", where: { en: "Toronto – 127 Portland Street, ON M5V 2N4 (Languages Canada listing; the school's page gives the same postal code)", ja: "トロント市内：127 Portland Street, ON M5V 2N4（Languages Canadaの掲載。学校ページの郵便番号も一致）" }, courses: { en: "English courses for international students; see the school's page for programmes, start dates and minimum age", ja: "留学生向けの英語コース（プログラム・開始日・最低年齢は学校ページで確認）" }, note: { en: "Listed by Languages Canada, and the school's page says it is accredited by Languages Canada. Fees are on the school's own pages; none are copied here.", ja: "Languages Canadaの認定リストに掲載され、学校ページもLanguages Canada認定と記載。料金は学校の公式ページにあり、ここには転載していません。" }, source: { url: "https://www.languagescanada.ca/en/listing-directory/students/ef-international-language-schools-canada-toronto", publisher: "Languages Canada" } },
      { id: "tor-kaplan", name: "Kaplan International Languages – Toronto", checks: [
        { kind: "provider", state: "notChecked", detail: { en: "The school's legal registration (company or education-provider registration) was not looked up, so none is stated.", ja: "学校の法人・教育機関としての登録は調べていないため、記載していません。" } },
        { kind: "campus", state: "stated", detail: { en: "The address is from the school's own page (and the address data embedded in it) only.", ja: "住所は学校自身のページ（とそこに埋め込まれた住所データ）のみに基づきます。" } },
        { kind: "course", state: "stated", detail: { en: "Courses are what the school's own pages say; they were not matched to any third-party record.", ja: "コースは学校自身のページの記載で、第三者の記録とは照合していません。" } },
        { kind: "accreditation", state: "stated", detail: { en: "The school's page says it is accredited by Languages Canada. No Languages Canada directory entry for it was found by our check, so this rests on the school's own statement.", ja: "学校のページはLanguages Canadaの認定と記載していますが、Languages Canadaのディレクトリに該当する掲載は見つからなかったため、学校自身の記載のみに基づきます。" } },
      ], url: "https://www.kaplaninternational.com/language-schools/canada/toronto", feesUrl: "https://www.kaplaninternational.com/faq/prices-and-payment", where: { en: "Toronto – 35 The Esplanade #250, ON M5E 1Z4 (the school's page and its structured address data)", ja: "トロント市内：35 The Esplanade #250, ON M5E 1Z4（学校ページと、そこに埋め込まれた住所データ）" }, courses: { en: "English courses for adults aged 16+; Academic Year Abroad and a University Placement Service are also listed", ja: "16歳以上の成人向け英語コース。アカデミック・イヤー・アブロードと大学進学サポートも掲載" }, note: { en: "The school's page says it is accredited by Languages Canada. A Languages Canada directory entry for it could not be found by our check, so the accreditation rests on the school's own statement. Fee information is on the school's price page; none is copied here.", ja: "学校ページはLanguages Canada認定と記載。ただしLanguages Canadaのディレクトリで該当ページを見つけられなかったため、認定は学校自身の記載に基づきます。料金は学校の料金案内ページにあり、ここには転載していません。" }, source: { url: "https://www.kaplaninternational.com/language-schools/canada/toronto", publisher: "Kaplan International Languages (school page)" } },
    ] }, tuition: pending() },
  transport: { modes: { status: "unverified", note: carried, value: { en: "TTC subway, streetcars and buses.", ja: "TTC（地下鉄、路面電車、バス）。" } }, studentDiscount: pending() },
  living: { studentLife: { status: "unverified", note: carried, value: { en: "Big city energy with many cultural events.", ja: "大都市ならではの活気と豊富な文化イベント。" } }, healthcare: pending(), sim: pending(), banking: pending(), studentFacilities: pending() },
};
export default profile;
