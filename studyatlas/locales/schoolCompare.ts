// Ver.1.2.8 – language school comparison. Every entry has en + ja.
const t = (en: string, ja: string) => ({ en, ja });
export const sc = {
  title: t("Compare language schools", "語学学校を比較"),
  intro: t("Pick two schools – in the same city or in Manchester and Vancouver. Only the differences that matter are shown first; details and sources are one click away.", "2校を選んで比べます（同じ都市でも、ManchesterとVancouverでも可）。まず大切な違いだけを表示し、詳細と出典は展開して確認できます。"),
  pickA: t("School A", "学校A"), pickB: t("School B", "学校B"), choose: t("Select a school…", "学校を選んでください"),
  needTwo: t("Choose two different schools to compare.", "比較するには、異なる2校を選んでください。"),
  none: t("No language schools to compare yet.", "比較できる語学学校はまだありません。"),
  rows: { where: t("Location", "所在地"), courses: t("Main courses", "主なコース"), stay: t("Accommodation arranged by the school", "滞在先の手配"), tuition: t("Tuition", "授業料"), status: t("Confirmation status", "確認状況") },
  missing: t("Not available", "未取得"),
  tuitionNote: t("No verified fee is held for this school. Check the school's site for current fees.", "この学校の確認済み料金はありません。最新の料金は学校の公式サイトでご確認ください。"),
  statusNote: t("Not compared with the school's own site yet.", "学校公式サイトとの照合はまだです。"),
  checked: t("Last checked", "最終確認日"),
  noVerdict: t("StudyAtlas does not rank or judge schools. Differences are shown side by side only.", "StudyAtlasは学校の優劣を判定しません。違いを並べて表示するだけです。"),
  crossCity: t("The schools are in different cities (different currency and system). Fees are never converted or compared.", "学校の都市が異なります（通貨や制度が違います）。料金は換算・比較しません。"),
  website: t("Official site", "公式サイト"), details: t("Notes", "補足"), sourceLabel: t("Source", "出典"),
  openCompare: t("Compare this school →", "この学校を比較 →"), openCompareCity: t("Compare two language schools →", "語学学校を2校比較する →"),
  feesLink: t("Open the school’s fee information ↗", "学校の料金案内を開く ↗"),
  swap: t("Swap", "入れ替え"),
};
