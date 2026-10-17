import type { Localized } from "@/lib/i18n";
// UI strings for researched data (status labels, metadata, comparability notes).
export const dataText = {
  verified: { en: "Verified", ja: "確認済み" },
  unverified: { en: "Unverified", ja: "未確認" },
  partial: { en: "Partly verified", ja: "一部確認済み" },
  checkedLine: { en: "Last checked", ja: "最終確認日" },
  sample: { en: "Demo sample – not verified", ja: "デモ用サンプル（未検証）" },
  pending: { en: "Data coming soon", ja: "データ準備中" },
  period: { en: "Period", ja: "対象期間" },
  checked: { en: "Last checked", ja: "最終確認日" },
  source: { en: "Source", ja: "出典" },
  includes: { en: "Includes", ja: "含まれる項目" },
  station: { en: "Station", ja: "観測地点" },
  tempC: { en: "Mean temp (°C)", ja: "平均気温（℃）" },
  precipMm: { en: "Precipitation (mm)", ja: "降水量（mm）" },
  per: { month: { en: "/ month", ja: "／月" }, week: { en: "/ week", ja: "／週" }, year: { en: "/ year", ja: "／年" }, once: { en: "one-off", ja: "（1回）" } },
  statusTitle: { en: "Data status", ja: "データの状態" },
  statusHelp: {
    en: "Only “Verified” items have been checked against the cited source. “Partly verified” means only some of the statements in an item are verified (each one is marked in the details). “Unverified” and “Demo sample” items are shown for reference only, and “Data coming soon” items have not been researched yet.",
    ja: "「確認済み」のみ出典と照合済みの情報です。「一部確認済み」は、まとまりの一部の記述だけが確認済みという意味です（記述ごとの状況は詳細に表示）。「未確認」「デモ用サンプル」は参考表示で、「データ準備中」は未調査の項目です。",
  },
  cmpNotVerified: { en: "Not comparable: figures are not verified yet.", ja: "比較不可：確認済みの数値がまだありません。" },
  cmpCurrency: { en: "Different currencies – shown as-is, not converted or compared.", ja: "通貨が異なるため、換算・比較はしていません。" },
  cmpBasis: { en: "Different period or coverage – not directly comparable.", ja: "対象期間または含まれる項目が異なるため、直接比較できません。" },
  cmpNote: {
    en: "Costs are shown in each city's own currency for the stated period. StudyAtlas does not convert currencies or compare figures with different coverage.",
    ja: "費用は各都市の現地通貨・記載の対象期間のまま表示しています。通貨の換算や、条件の異なる数値どうしの比較は行いません。",
  },
  visaCountry: { en: "National rules for", ja: "国の制度：" },
  months: { en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], ja: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"] },
} as const;
export type LocalizedText = Localized;
