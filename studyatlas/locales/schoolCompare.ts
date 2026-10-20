// Ver.1.2.8 – language school comparison. Every entry has en + ja.
const t = (en: string, ja: string) => ({ en, ja });
export const sc = {
  title: t("Compare language schools", "語学学校を比較"),
  intro: t("Pick two schools – in the same city or in Manchester and Vancouver. Only the differences that matter are shown first; details and sources are one click away.", "2校を選んで比べます（同じ都市でも、ManchesterとVancouverでも可）。まず大切な違いだけを表示し、詳細と出典は展開して確認できます。"),
  pickA: t("School A", "学校A"), pickB: t("School B", "学校B"), choose: t("Select a school…", "学校を選んでください"),
  needTwo: t("Choose two different schools to compare.", "比較するには、異なる2校を選んでください。"),
  none: t("No language schools to compare yet.", "比較できる語学学校はまだありません。"),
  rows: { where: t("Location", "所在地"), courses: t("Main courses", "主なコース"), stay: t("Accommodation arranged by the school", "滞在先の手配"), tuition: t("Tuition", "授業料"), checks: t("Registration and accreditation", "登録・認定の確認状況"), status: t("Confirmation status", "確認状況") },
  missing: t("Not available", "未取得"),
  checksRow: t("Registration and accreditation", "登録・認定の確認状況"),
  officialName: t("Name as registered or stated", "登録・記載上の名称"),
  checksNone: t("The registration and accreditation of this school have not been checked item by item. Check the school's site and the official register.", "この学校の登録・認定は、項目ごとには確認していません。学校の公式サイトと公的な登録簿でご確認ください。"),
  checkKinds: { provider: t("Institution registration (e.g. CRICOS provider)", "機関の登録（CRICOS機関など）"), campus: t("Campus address", "キャンパスの所在地"), course: t("Courses (registered course codes)", "コース（登録されたコース番号）"), accreditation: t("Accreditation (e.g. NEAS)", "認定（NEASなど）") },
  checkStates: { confirmed: t("Confirmed by two sources", "2つの情報源で一致"), single: t("One source only", "情報源は1つだけ"), stated: t("School's own statement only", "学校自身の記載のみ"), notConfirmed: t("Could not be confirmed", "確認できていません"), notChecked: t("Not checked", "未確認") },
  thirdParty: t("Register / directory record", "登録・加盟の記録（第三者）"), thirdPartyNone: t("No record by a register or directory has been found yet; the items above rest on the school’s own pages.", "登録簿・ディレクトリ側の記録はまだ見つかっておらず、上の項目は学校自身のページに基づきます。"),
  checksNote: t("“Confirmed” never means that the school is enrolling today or that its fees are right.", "「一致」は、現在募集中であることや料金が正しいことを意味しません。"),

  tuitionNote: t("No verified fee is held for this school. Check the school's site for current fees.", "この学校の確認済み料金はありません。最新の料金は学校の公式サイトでご確認ください。"),
  statusNote: t("Not compared with the school's own site yet.", "学校公式サイトとの照合はまだです。"),
  checked: t("Last checked", "最終確認日"),
  noVerdict: t("StudyAtlas does not rank or judge schools. Differences are shown side by side only.", "StudyAtlasは学校の優劣を判定しません。違いを並べて表示するだけです。"),
  crossCity: t("The schools are in different cities (different currency and system). Fees are never converted or compared.", "学校の都市が異なります（通貨や制度が違います）。料金は換算・比較しません。"),
  website: t("Official site", "公式サイト"), details: t("Notes", "補足"), sourceLabel: t("Source", "出典"),
  toPlanner: t("School fees are not copied here and are never entered into your budget automatically. Check each school's fee page, then enter the amounts you choose in the cost planner.", "学校の料金はここに転載しておらず、予算に自動で入ることもありません。各校の料金ページを確認し、選んだ金額を費用プランナーに入力してください。"),
  toPlannerLink: t("Open the cost planner →", "費用プランナーを開く →"),
  openCompare: t("Compare this school →", "この学校を比較 →"), openCompareCity: t("Compare two language schools →", "語学学校を2校比較する →"),
  feeCondTitle: t("Before comparing any two fees, match these conditions", "料金を比べる前に、次の条件を揃えてください"),
  feeConds: [
    t("Lessons or hours per week (e.g. 15 / 20 / 30 lessons) and how long a lesson is", "週あたりのレッスン数・時間（例：15／20／30コマ）と1コマの長さ"),
    t("Number of weeks: the weekly rate often changes with course length and start date", "受講週数：週あたりの料金は期間や開始時期で変わることが多い"),
    t("Registration / application fee, course books and materials, exam fees", "登録料・入学金、教材費、試験料"),
    t("Accommodation: room type, meals, utilities, contract length and booking fee", "滞在費：部屋のタイプ、食事、光熱費、契約期間、手配料"),
    t("Price year and currency (GBP / CAD): an older price list is not today’s price", "料金の年度と通貨（英ポンド／カナダドル）：古い料金表は現在の料金ではない"),
  ],
  feesLink: t("Open the school’s fee information ↗", "学校の料金案内を開く ↗"),
  swap: t("Swap", "入れ替え"),
};

/** Ver.1.6.9 – finding and choosing schools. */
export const fd = {
  findTitle: t("Find a school", "学校を探す"),
  lead: t("All language schools StudyAtlas lists, by city. Pick two to see their differences side by side.", "StudyAtlasに掲載している語学学校の一覧です。2校を選ぶと、違いを並べて見られます。"),
  search: t("Search by school or city name", "学校名・都市名で検索"), searchPh: t("e.g. Kaplan, Sydney", "例：Kaplan、シドニー"),
  cityAll: t("All cities", "すべての都市"), cityLabel: t("City", "都市"),
  recordLabel: t("Where the checks come from", "確認の出どころ"), recordAll: t("All", "すべて"), recordThird: t("Register / directory record found", "登録簿・ディレクトリの記録あり"), recordOwn: t("School's own pages only", "学校自身のページのみ"),
  moreFilters: t("More filters", "さらに絞り込む"), lessFilters: t("Fewer filters", "絞り込みを閉じる"),
  count: t("Showing {n} of {total} schools", "{total}校中 {n}校を表示"), clear: t("Show all schools", "すべて表示に戻す"),
  noMatch: t("No school matches these conditions.", "この条件に合う学校はありません。"), noMatchHint: t("Clear the search or the filters to see every school again.", "検索や絞り込みを解除すると、すべての学校が表示されます。"),
  notQuality: t("“Not confirmed” does not mean a school is worse; it only says that StudyAtlas has not matched that item with a register or directory. Schools are not ranked.", "「未確認」は学校の質が低いという意味ではなく、登録簿やディレクトリと照合できていないという意味です。学校の順位付けはしていません。"),
  address: t("Campus", "キャンパス"), course: t("Courses", "コース"), noCourse: t("Courses: see the school's site", "コース：学校の公式サイトで確認"), noAddress: t("Address: see the school's site", "所在地：学校の公式サイトで確認"),
  checksShort: t("Checks", "確認状況"),
  kindShort: { provider: t("Registration", "機関登録"), campus: t("Campus", "所在地"), course: t("Courses", "コース"), accreditation: t("Accreditation", "認定・加盟") },
  stateShort: { confirmed: t("two sources agree", "2つの情報源で一致"), single: t("one source", "情報源1つ"), stated: t("school's statement", "学校の記載のみ"), notConfirmed: t("not confirmed", "確認できず"), notChecked: t("not checked", "未確認") },
  add: t("Add to comparison", "比較に追加"), selectedA: t("Selected as school 1 – remove", "1校目に選択中・解除"), selectedB: t("Selected as school 2 – remove", "2校目に選択中・解除"),
  traySlot1: t("School 1", "1校目"), traySlot2: t("School 2", "2校目"), trayEmpty: t("Not chosen yet", "未選択"), trayRemove: t("Remove", "解除"), trayClear: t("Clear selection", "選択をクリア"),
  trayOne: t("Choose one more school to compare.", "もう1校選ぶと比較できます。"), trayNone: t("Choose two schools to compare.", "比較したい学校を2校選んでください。"), trayGo: t("See the comparison →", "比較を見る →"), trayReady: t("Two schools chosen.", "2校を選択しました。"),
  full: t("You can compare two schools at a time. To add “{name}”, choose which school it replaces:", "比較できるのは2校までです。「{name}」を加えるには、入れ替える学校を選んでください："),
  replace: t("Replace {name}", "{name}と入れ替える"), cancel: t("Keep my two schools", "今の2校のままにする"),
  pickList: t("Choose from a drop-down list instead", "プルダウンから選ぶ"),
  diffTitle: t("How the two schools differ", "2校の違い"),
  diff: { same: t("Same", "同じ"), differ: t("Different", "異なる"), unconfirmed: t("Includes unconfirmed", "未確認を含む"), incomparable: t("Cannot be compared", "比較できない") },
  diffNote: t("The labels only describe how the two entries relate. They are not a judgement of either school.", "ラベルは2校の情報の関係を示すだけで、どちらかの学校への評価ではありません。"),
};

/** Ver.1.7.0 – moving between choosing, comparing and planning. */
export const jn = {
  tabsLabel: t("Compare", "比較"), tabCities: t("Cities", "都市"), tabSchools: t("Language schools", "語学学校"),
  resultTitle: t("Comparison of two schools", "2校の比較"), changeSelection: t("← Change the schools", "← 学校を選び直す"), changeHint: t("Your two schools are kept.", "選んだ2校は保持されます。"),
  cityPage: t("City details →", "都市の詳細 →"), seeCityCompare: t("Compare cities →", "都市を比較する →"),
  nextTitle: t("Next", "次のステップ"), toPlanner: t("Plan the costs →", "費用を計画する →"),
  fromCity: t("Schools in {city}", "{city}の語学学校"), showingCity: t("Showing the schools of {city}.", "{city}の学校を表示しています。"),
};
export const pj = {
  title: t("Candidates you were looking at", "検討中の候補"), note: t("For reference only: nothing here is entered into your plan, and no price is filled in for you.", "参考表示です。ここから費用が自動入力されることはなく、料金も入りません。"),
  schools: t("Schools", "学校"), cities: t("Cities", "都市"), back: t("← Back to the school comparison", "← 学校の比較に戻る"), backCities: t("← Back to the city comparison", "← 都市の比較に戻る"),
  details: t("Details", "詳細"), compareSchools: t("Open the school comparison", "学校の比較を開く"), compareCities: t("Open the city comparison", "都市の比較を開く"),
};

/** Ver.1.7.1 – compact card, details, university preparation notice. */
export const cd = {
  area: t("Area", "エリア"), details: t("School information and sources", "学校情報と出典を見る"), detailsClose: t("Hide school information", "学校情報を閉じる"),
  address: t("Address and notes", "住所と補足"), allCourses: t("Courses in full", "コースの詳細"), stay: t("Accommodation", "滞在先の手配"), sources: t("Sources", "出典"), checkTitle: t("What has been checked, and against what", "確認状況（何と照らしたか）"),
  headline: { third: t("School information: backed by a register or directory", "学校情報：登録簿・ディレクトリの記録あり"), partial: t("School information: partly backed by a register or directory", "学校情報：一部のみ登録簿等の記録あり"), own: t("School information: the school's own statements", "学校情報：学校自身の記載のみ"), open: t("School information: not confirmed", "学校情報：未確認"), none: t("School information: not checked item by item", "学校情報：項目ごとの確認はまだ") },
  counts: t("{third} backed by a record · {own} school's statement only · {open} not confirmed", "記録あり {third}・学校の記載のみ {own}・未確認 {open}"), of: t("of {n} items", "（{n}項目中）"),
  conflict: t("Sources disagree on at least one item (see the details).", "情報源の間で食い違う項目があります（詳細を参照）。"),
  moreDetail: t("The details show each item and where it comes from. This is not a rating of the school.", "詳細では項目ごとの出どころを確認できます。学校の評価ではありません。"),
};
export const diffk = { note: t("These labels compare how far each item has been checked, not whether the schools are alike.", "ラベルは項目ごとの確認の度合いの比較で、学校の内容が同じという意味ではありません。"),
  sameStated: t("Same: both only state it themselves", "同じ：どちらも学校の記載のみ"), sameBacked: t("Same: both backed by a record", "同じ：どちらも記録あり") };
/** Universities (Ver.1.7.1): listed, not yet comparable. */
export const up = {
  title: t("University comparison: coming soon", "大学比較：準備中"),
  lead: t("So far only the name, the city, a link to the university's own site, and an unverified editorial entry of the formal name and main campuses are listed. Programmes, tuition, entry requirements and deadlines have not been collected, so there is nothing to compare yet. The list is shown so you can find each university; language schools can be compared now.", "現在は、大学名・都市・大学公式サイトへのリンクと、正式名称・主なキャンパス（編集者による未確認の記載）を掲載しています。学部・授業料・入学条件・出願時期はまだ収集しておらず、比較できる情報はありません。大学を探す手がかりとして一覧を表示しています。語学学校は今すぐ比較できます。"),
  soon: t("Planned", "今後対応予定"), disabled: t("Comparison coming soon", "比較は準備中"), listed: t("Listed information: name, city, official site", "掲載情報：大学名・都市・公式サイト"), linkNote: t("Link not yet checked", "リンクは未確認"),
  kept: t("Universities you chose earlier are kept and will appear in the comparison when the data is ready.", "以前に選んだ大学の選択は保存されており、データが整い次第、比較に表示されます。"),
  goLanguage: t("Compare language schools now →", "語学学校を今すぐ比較する →"), langBanner: t("The 13 language schools StudyAtlas lists can be compared on their own page.", "StudyAtlasに掲載している語学学校13校は、専用の比較ページで比べられます。"),
};

/** Ver.1.7.2 – what is recorded about a university. */
export const uinfo = {
  open: t("University information and official pages", "大学の基本情報と公式ページ"), close: t("Hide university information", "大学の基本情報を閉じる"),
  counts: t("Confirmed {v} of {n} items · programmes recorded: {p}", "確認済み {v}／{n}項目・登録済みプログラム：{p}件"),
  officialName: t("Formal name", "正式名称"), campuses: t("Main campuses", "主なキャンパス"), pages: t("Official pages for students", "留学生向けの公式ページ"),
  kinds: { programSearch: t("Programme search", "プログラム検索"), internationalAdmissions: t("International admissions", "留学生向け入学案内"), tuition: t("International tuition", "留学生向け授業料"), deadlines: t("Deadlines", "出願時期・締切"), english: t("English-language requirements", "英語要件"), scholarships: t("Scholarships", "奨学金") },
  pagePending: t("Not entered yet – waiting for a person to supply and open the official page", "未登録（公式ページの手動確認待ち）"), openPage: t("Open the page", "ページを開く"),
  pageNote: t("An entered link only says where to look; the content of the page is not confirmed by it.", "登録されたリンクは確認先を示すだけで、ページの内容を確認済みにするものではありません。"),
  programsNote: t("Tuition, entry requirements and deadlines are recorded per programme, from an official source, with their year, currency and billing unit. None has been recorded yet, so nothing is estimated or compared.", "授業料・入学条件・出願時期は、公式資料に基づき、年度・通貨・課金単位とともにプログラム単位で記録します。まだ登録がないため、推定や比較は行いません。"),
};
