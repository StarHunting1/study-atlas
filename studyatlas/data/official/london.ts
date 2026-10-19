import type { OfficialCityData, TopicNotice } from "./types";
import { RENT_APPROVALS, londonRentPoints, pendingRentIds, type RentApproval } from "./cityRents";
/*
 * London – official data (Ver.1.5.0). The ONS rent comes from cityRents.ts and exists here ONLY after a person's approval (LONDON_RENT_APPROVAL).
 * Until then the city page and the comparison show the conditions and the official links below instead of numbers.
 * TfL fares are link-only: tfl.gov.uk answered an automated request with HTTP 403, so the pages were neither read nor retried and no amount is copied.
 */
const PIPR = "https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics";
/** The London data for a given set of rent approvals (the real one by default). Tests call it with other sets to check the unapproved and partly approved states. */
export const londonData = (approvals: Record<string, RentApproval> = RENT_APPROVALS): OfficialCityData => ({
  cityId: "london",
  points: [...londonRentPoints(approvals)],
  notices: [
    // the "awaiting approval" notice stays while any of this city's rent figures is still unapproved
    ...(pendingRentIds("london", approvals).length === 0 ? [] : [{ topic: "housing", sourceId: "ons-private-rents", why: "awaiting-approval",
      text: {
        en: "A public rent statistic exists for London (Office for National Statistics, Price Index of Private Rents: average monthly private rent of all dwellings in the London region, August 2026, in pounds). It has been collected but has not been checked and approved by a person yet, so StudyAtlas does not show that number. When approved it will appear as a region-wide average (ONS code E12000007, all 33 local authorities of Greater London; boroughs differ a lot) – not student housing, not university halls and not language-school housing. It will not be treated as the same statistic as Manchester's figure, which covers one local authority only.",
        ja: "ロンドンの公的な家賃統計（英国国家統計局 ONS の民間家賃指数：ロンドン地域の民間賃貸住宅すべての平均月額家賃、2026年8月、ポンド）はありますが、人による確認と承認が済んでいないため、StudyAtlasでは数値を表示していません。承認後は、地域全体の平均（ONS地域コード E12000007、グレーター・ロンドンの33自治体すべて。区ごとの差は大きい）として表示します（学生向け住居・大学寮・語学学校の滞在先の料金ではありません）。単一の自治体を対象とするマンチェスターの値と同じ統計としては扱いません。",
      },
      links: [{ label: { en: "ONS – Price Index of Private Rents (monthly price statistics)", ja: "ONS – 民間家賃指数（月次価格統計）" }, url: PIPR }] }] as TopicNotice[]),
    { topic: "transport", sourceId: "tfl-fares", why: "unreviewed",
      text: {
        en: "TfL fares (adult fares, zones, passes, discounts, who qualifies by age or student status) are not copied here, and StudyAtlas could not read the TfL pages: they refused an automated request (HTTP 403), which was not retried or worked around. Open the official pages in your browser. Do not assume that language-school students get a student discount, and do not turn a pay-as-you-go fare into a monthly amount without the cap rules. The Planner keeps your own input.",
        ja: "TfLの運賃（大人運賃・ゾーン・パス・割引・年齢や学生資格による対象）はここに転載していません。また、TfLのページは自動アクセスを拒否した（HTTP 403）ため読み取れておらず、再試行や回避もしていません。公式ページをブラウザでご確認ください。語学学校の学生が学生割引を受けられるとは限りません。1回ごとの運賃を、上限（キャップ）の規則を見ずに月額へ換算することもしないでください。プランナーはご自身の入力のままです。",
      },
      links: [{ label: { en: "TfL – Fares", ja: "TfL – 運賃" }, url: "https://tfl.gov.uk/fares" }] },
    { topic: "climate", sourceId: "metoffice-station-data", why: "unreviewed",
      text: { en: "The Met Office is the official source of UK climate averages, but StudyAtlas collected no London climate numbers: the Met Office website terms do not allow robots or page scraping other than its own APIs, and no API for London's averages was available. So no climate numbers are shown or compared for London; the climate text above is an unverified overview. Please check the Met Office's climate averages for a London station.", ja: "英国の気候平年値の公式な出典は英国気象庁（Met Office）ですが、StudyAtlasはロンドンの気候の数値を収集していません。Met Officeのサイト利用規約は、同庁が提供するAPI以外でのロボットやページのスクレイピングを認めておらず、ロンドンの平年値を取得できるAPIも使えなかったためです。ロンドンの気候の数値は表示も比較もしておらず、上の気候の文章は未確認の概要です。Met Officeの気候平年値（ロンドンの観測所）をご確認ください。" },
      links: [] },
  ],
});
export default londonData();
