// Shared wording for Progressive Disclosure and the simplified city / compare pages (Ver.1.8). Every entry has ja and en.
export const ux = {
  more: { en: "Show details", ja: "詳しく見る" }, close: { en: "Close", ja: "閉じる" }, sources: { en: "Sources & conditions", ja: "出典・適用条件を見る" },
  topics: { living: { en: "Living costs", ja: "生活費" }, housing: { en: "Housing", ja: "住居" }, transport: { en: "Transport", ja: "交通" }, climate: { en: "Climate", ja: "気候" }, education: { en: "Schools", ja: "学校" } },
  blurb: {
    living: { en: "Monthly cost of living for students", ja: "学生の月あたり生活費の目安" }, housing: { en: "Where you could live and what it costs", ja: "住まいの選択肢と費用" },
    transport: { en: "Getting around and student fares", ja: "移動手段と学生向け運賃" }, climate: { en: "Average temperature through the year", ja: "年間の平均気温" }, education: { en: "Universities and language schools", ja: "大学・語学学校" },
  },
  school: { fees: { en: "Fees: see the school’s own fee page", ja: "料金：学校の公式の料金案内ページ" }, feesOpen: { en: "Open fee information ↗", ja: "料金案内を開く ↗" }, where: { en: "Area", ja: "所在地" }, courses: { en: "Main courses", ja: "主なコース" }, stay: { en: "Accommodation arranged by the school", ja: "滞在先の手配" } },
  studyMode: {
    label: { en: "Study type", ja: "留学タイプ" }, language: { en: "Language study", ja: "語学留学" }, university: { en: "University study", ja: "大学留学" },
    hint: { language: { en: "Showing language-school study first: language schools, homestay, shared houses and the transport and housing language students can use.", ja: "語学留学向け：語学学校・ホームステイ・シェアハウス、語学留学生が利用できる交通・住居情報を優先して表示しています。" },
      university: { en: "Showing university study first: universities, student halls, university-student living costs and university schemes.", ja: "大学留学向け：大学・学生寮・大学生向け生活費・大学の学生向け制度を優先して表示しています。" } },
    common: { en: "Climate, general transport and city features are the same for both.", ja: "気候・一般的な交通・都市の特徴はどちらでも共通です。" },
    otherMore: { language: { en: "Not for language study / eligibility unconfirmed", ja: "語学留学では対象外・対象未確認の情報" }, university: { en: "Information for other study types", ja: "他の留学タイプ向けの情報" } },
    unconfirmed: { en: "Open to “students”, but it is not confirmed that language-school students qualify. Check with the provider before counting on it.", ja: "「学生」向けですが、語学学校の学生が対象かは確認できていません。利用前に提供元でご確認ください。" },
    unconfirmedTitle: { en: "Eligibility not confirmed", ja: "対象かどうか未確認" }, notForTitle: { en: "University / college students only", ja: "大学・カレッジの学生のみ" },
    notFor: { en: "For university or college students only – not available to language-school students.", ja: "大学・カレッジの学生向けで、語学留学生は利用できません。" },
  },
  noData: { en: "Data coming soon", ja: "データ準備中" }, pricePrep: { en: "Reference price in preparation", ja: "参考料金は準備中" }, unverifiedShort: { en: "Not verified", ja: "未確認" },
  schoolsU: { en: "{u} universities", ja: "大学 {u}校" }, schoolsL: { en: "{l} language schools", ja: "語学学校 {l}校" },
  seeSchools: { en: "Compare schools →", ja: "学校を比較する →" }, tempLabel: { en: "Monthly mean temperature over the year", ja: "月別平均気温の年間の幅" },
  // city page
  moreInfo: { en: "Visa, healthcare, safety and more", ja: "ビザ・医療・治安などの重要情報" }, moreInfoLead: { en: "Important information that is not shown in the five cards above.", ja: "上の5項目に入らない、大切な情報です。" },
  rows: { visa: { en: "Visa & healthcare", ja: "ビザ・医療" }, safety: { en: "Safety", ja: "治安" }, daily: { en: "Daily life", ja: "生活（SIM・銀行など）" }, data: { en: "Data status & sources", ja: "データの状態と出典" } },
  rowHint: { visa: { en: "Entry routes, healthcare and official pages", ja: "入国区分・医療の目安と公式情報" }, safety: { en: "Statistics and advice", ja: "統計と防犯情報" }, daily: { en: "Student life, SIM, banking", ja: "学生生活・SIM・銀行" }, data: { en: "What is verified and where it comes from", ja: "確認済みの範囲と出典" } },
  // compare
  cmpIntro: { en: "Five key points side by side. Figures are shown in each city's own currency and are never converted or filled in.", ja: "重要な5項目を並べています。数値は各都市の通貨のままで、換算や推測での補完は行いません。" },
  moreCompare: { en: "Compare more", ja: "さらに比較する" }, lessCompare: { en: "Show fewer", ja: "項目を減らす" },
  cmpSame: { en: "Same basis", ja: "条件は同じ" }, cmpDiff: { en: "Conditions differ", ja: "条件が異なります" }, cmpMissing: { en: "Not enough data", ja: "データ不足" }, cmpUnverified: { en: "Not verified", ja: "未確認を含む" },
  extra: { safety: { en: "Safety", ja: "治安" }, visa: { en: "Visa", ja: "ビザ" }, medical: { en: "Healthcare", ja: "医療" }, daily: { en: "Student life", ja: "学生生活" } },
  // generic
  allDetails: { en: "All details for this item", ja: "この項目の詳細" },
} as const;
