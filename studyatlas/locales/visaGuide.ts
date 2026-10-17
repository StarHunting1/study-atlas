import type { Localized } from "@/lib/i18n";
const t = (en: string, ja: string): Localized => ({ en, ja });
/** Visa and healthcare guide on the city page (Ver.1.4.1). */
export const vg = {
  more: t("See the conditions", "詳しい条件を見る"), less: t("Close", "閉じる"),
  content: t("What the official page says", "公式情報の内容"), fees: t("Fees", "料金"), conditions: t("Conditions and exceptions", "適用条件・例外・注意"),
  status: t("Verification", "確認状況"), checked: t("Last checked", "最終確認日"), official: t("Official pages", "公式情報を見る"),
  sources: t("Sources and terms of use", "出典・利用条件"), ogl: t("Contains public sector information licensed under the Open Government Licence v3.0.", "出典：GOV.UK（Open Government Licence v3.0 に基づく公共部門情報を含みます）。"),
  feeNote: t("Amounts change: check the official page for the current figure.", "金額は変わります。最新額は公式情報で確認してください。"),
  partlyNote: t("Some statements are still being verified; each one is marked below.", "一部の記述は確認中です。確認状況は記述ごとに示しています。"),
};
