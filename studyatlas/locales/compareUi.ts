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
  comparable: t("Comparable", "比較可能"), reference: t("Reference only", "参考値のみ"), notYet: t("Not obtained", "未取得"), checking: t("Being checked", "確認中"), linkOnly: t("Official link only", "公式リンクのみ"),
  heldHere: t("Figure not shown (publisher's terms)", "規約により数値は非表示"), heldLink: t("See the official page", "公式ページで確認"), noticeHere: t("Fees not shown (held back)", "料金掲載見合わせ"),
  rentPendingHere: t("Awaiting approval (figure not shown)", "承認待ち（数値は未掲載）"),
  rentPendingDetail: t("A public statistic has been collected, but a person has not approved it yet, so StudyAtlas does not show the number. See the official page.", "公的統計は取得済みですが、人による承認が済むまでStudyAtlasでは数値を表示しません。公式ページをご確認ください。"),
  unreviewedHere: t("Official link only", "公式リンクのみ"),
  unreviewedDetail: t("StudyAtlas has not reviewed whether the publisher's terms allow reuse, so no amounts are copied. See the official page.", "発表元の利用条件で再利用が認められるかを確認していないため、金額は転載していません。公式ページをご確認ください。"),
  heldDetail: t("Official fees are published, but under the publisher's terms of use StudyAtlas does not show the figures.", "公式料金は公開されていますが、利用条件によりStudyAtlasでは数値を掲載していません。"),
  /** Housing is split in two rows so a per-student price is never read as a market statistic (and the other way round). */
  studentHousingTitle: t("Student housing cost (per person)", "学生向け住居費（1人あたり）"), rentTitle: t("General rental market rent", "一般賃貸市場の家賃"),
  studentHousingNote: t("University-run housing for that university's students. Not the general market.", "大学が運営する住居で、その大学の学生が対象です。一般の賃貸市場ではありません。"),
  rentWhy: {
    differ: t("Different statistics (publisher, area, dwelling type, year or currency): shown side by side as reference, never as a direct comparison. Currencies are not converted.", "統計の種類（発表元・地域・住居タイプ・年・通貨）が異なるため、参考として並べるだけで、直接は比較しません（通貨は換算しません）。"),
    same: t("The same statistic, area basis, period and currency.", "同じ統計・同じ期間・同じ通貨です。"),
  },
  /** Short "what exactly is this number" line per rent statistic, taken from the conditions recorded with each figure. */
  rentBasis: {
    "housing.privateRent.average": t("ONS · all private rented dwellings · Manchester city", "ONS・民間賃貸住宅すべて・マンチェスター市"),
    "housing.privateRent.regionAverage": t("ONS · all private rented dwellings · whole London region (33 boroughs; not one borough)", "ONS・民間賃貸住宅すべて・ロンドン地域全体（33の区の平均で、特定の区ではない）"),
    "housing.marketRent.1br@toronto": t("CMHC · 1-bedroom, apartments & row houses of 3+ units · Toronto census area (wider than the city)", "CMHC・1ベッドルーム（3戸以上の集合住宅・長屋）・トロント都市圏（市より広い）"),
    "housing.marketRent.1br": t("CMHC · 1-bedroom, apartments & row houses of 3+ units · Vancouver census area (wider than the city)", "CMHC・1ベッドルーム（3戸以上の集合住宅・長屋）・バンクーバー都市圏（市より広い）"),
  "housing.marketRent.censusMedianWeekly": t("ABS · median weekly rent of renting households, 2021 Census · whole Greater Sydney / Greater Melbourne (A$ per week; 2021 data)", "ABS・賃貸世帯の週あたり家賃の中央値（2021年国勢調査）・グレーター・シドニー／メルボルン全体（豪ドル／週・2021年のデータ）"),
  } as Record<string, Localized>,
  /** Why two whole-market rents are not on the same footing, named from the parts that really differ (rentBasis.ts). */
  rentDiff: {
    fields: {
      publisher: t("publisher", "発表元"), table: t("statistic / table", "統計の種類・表"), measure: t("what is averaged", "平均の取り方"), structure: t("dwelling types included", "対象の住宅の種類"), unitKey: t("bedroom size", "間取り"),
      area: t("kind of area (region, metropolitan area or one local authority)", "地域区分（地域全体・都市圏・1つの自治体）"), year: t("year or month", "対象年・月"), currency: t("currency", "通貨"), per: t("period unit", "期間の単位"),
    } as Record<string, Localized>,
    why: t("Not the same statistic. It differs in: {fields}. Shown side by side as reference, never as a direct comparison. Currencies are not converted.", "同じ統計ではありません（違い：{fields}）。参考として並べるだけで、直接は比較しません。通貨は換算しません。"),
    note: t("Not directly comparable. It differs in: {fields}. No “cheaper” verdict is given and currencies are not converted.", "直接は比較できません（違い：{fields}）。どちらが安いかは判定せず、通貨は換算しません。"),
  },
  remove: t("Remove from comparison", "比較から外す"), details: t("City details", "都市の詳細"),
};
