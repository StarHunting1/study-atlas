import type { Localized } from "@/lib/i18n";
const t = (en: string, ja: string): Localized => ({ en, ja });
/** City comparison page (Ver.1.3.7): one short reason under each verdict, the at-a-glance strip and the city header. */
export const cu = {
  why: {
    same: t("Same unit, period and audience: the figures can be compared directly.", "単位・期間・対象が同じなので、数値をそのまま比べられます。"),
    differ: t("Unit, period, audience or kind of figure differs: do not compare the sizes of the numbers.", "単位・期間・対象・種類のいずれかが異なるため、数値の大小は比べません。"),
    unverified: t("Includes unverified values: shown for reference, not as a verdict.", "未確認の値を含むため、参考として並べています（優劣は示しません）。"),
    missing: t("Not enough data to compare (not obtained yet).", "比べられるだけのデータがありません（未取得）。"),
    partial: t("Only some of the cities have a figure: shown as reference, not compared.", "一部の都市のみ数値があります。参考として表示し、比較はしません。"),
    linkOnly: t("The figure exists, but the publisher's terms allow only a link: see the official page.", "数値は取得済みですが、提供元の規約により公式ページへのリンクのみ案内しています。"),
    "n/a": t("Shown side by side as text; not judged as the same basis.", "文章として並べています（同じ基準かどうかは判定しません）。"),
  },
  glanceTitle: t("What can be compared", "比較できる項目の状況"),
  glanceNote: t("Only items with the same basis on both sides count as comparable.", "どの都市も同じ基準で揃っている項目だけを「比較可能」としています。"),
  comparable: t("Comparable", "比較可能"), reference: t("Reference only", "参考値のみ"), notYet: t("Not obtained", "未取得"), linkOnly: t("Official link only", "公式リンクのみ"),
  heldHere: t("Figure not shown (publisher's terms)", "規約により数値は非表示"), heldLink: t("See the official page", "公式ページで確認"), noticeHere: t("Held back (see note)", "掲載見合わせ（注記あり）"),
  remove: t("Remove from comparison", "比較から外す"), details: t("City details", "都市の詳細"),
};
