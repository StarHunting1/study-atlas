import type { OfficialCityData, TopicNotice } from "./types";
import { RENT_APPROVALS, sydneyRentPoints, pendingRentIds, type RentApproval } from "./cityRents";
/*
 * Sydney – official data (Ver.1.6.0). The ABS Census rent comes from cityRents.ts / auRents.ts and exists here ONLY after a person's approval.
 * Until then the city page and the comparison show the conditions and the official links below instead of a number ("confirming").
 * Transport for NSW fares are link-only: its terms of use were not reviewed, so no amount, table or concession rule is copied.
 */
const ABS = "https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD";
export const sydneyData = (approvals: Record<string, RentApproval> = RENT_APPROVALS): OfficialCityData => ({
  cityId: "sydney",
  points: [...sydneyRentPoints(approvals)],
  notices: [
    ...(pendingRentIds("sydney", approvals).length === 0 ? [] : [{ topic: "housing", sourceId: "abs-census-rent", why: "awaiting-approval",
      text: {
        en: "A public rent statistic exists for Greater Sydney: the Australian Bureau of Statistics' 2021 Census gives a median weekly rent for households that rent (actual rent paid, in Australian dollars per week). It has been collected but has not been checked and approved by a person yet, so StudyAtlas does not show the number. When approved it will appear as a 2021 whole-market median for the whole Greater Sydney area – not student housing, not advertised asking rents, and not comparable with monthly or mean figures of other cities. The NSW Government also publishes rental bond data (new leases lodged with the bond system); that is a different statistic and is not used here. Check the official pages meanwhile.",
        ja: "グレーター・シドニーには公的な家賃統計があります。オーストラリア統計局（ABS）の2021年国勢調査に、住居を借りている世帯の週あたり家賃の中央値（実際に支払われている家賃、オーストラリアドル／週）があります。収集はしましたが、人による確認と承認が済んでいないため、StudyAtlasでは数値を表示していません。承認後は、グレーター・シドニー全体の2021年の市場全体の中央値として表示します（学生向け住居ではなく、募集家賃でもなく、他都市の月額や平均の値とは比較できません）。NSW州政府は賃貸保証金（ボンド）のデータも公開していますが、新規契約を対象とした別の統計で、ここでは使っていません。それまでは公式ページでご確認ください。",
      },
      links: [
        { label: { en: "ABS – 2021 Census QuickStats: Greater Sydney", ja: "ABS – 2021年国勢調査 QuickStats：グレーター・シドニー" }, url: ABS },
        { label: { en: "ABS – copyright and licence (Creative Commons Attribution 4.0)", ja: "ABS – 著作権とライセンス（CC BY 4.0）" }, url: "https://www.abs.gov.au/website-privacy-copyright-and-disclaimer" },
        { label: { en: "NSW Government – rental bond data", ja: "NSW州政府 – 賃貸保証金（ボンド）データ" }, url: "https://www.nsw.gov.au/housing-and-construction/rental-forms-surveys-and-data/rental-bond-data" },
      ] }] as TopicNotice[]),
    { topic: "transport", sourceId: "tfnsw-fares", why: "unreviewed",
      text: {
        en: "Sydney fares are paid with an Opal card or a contactless card or phone (Transport for NSW says you tap on and tap off). Fares, caps, concession rules and who qualifies are not copied here: StudyAtlas has not reviewed whether Transport for NSW's terms allow reuse, so the official pages are linked instead. The official eligibility page lists tertiary and TAFE students among those who can get concession fares; it does not say that international or language-school students do, so do not assume a student discount – check the rules on the official page. A monthly cost should be worked out by you from the current fares (the Planner keeps your own input).",
        ja: "シドニーの運賃は、Opalカード、またはコンタクトレス対応のカード・スマートフォンで支払います（Transport for NSWは乗車時と降車時にタップするとしています）。運賃・上限額・割引の条件・対象者はここに転載していません。Transport for NSWの利用規約が再利用を認めているかを確認していないため、公式ページへのリンクのみとしています。公式の対象者ページは、割引運賃を受けられる人の区分に大学・TAFEの学生を挙げていますが、留学生や語学学校の学生が対象とは書いていません。学生割引があると思い込まず、公式ページで条件を確認してください。月額の目安は、最新の運賃を見てご自身で計算してください（プランナーはご自身の入力のままです）。",
      },
      links: [
        { label: { en: "Transport for NSW – Fares and ways to pay", ja: "Transport for NSW – 運賃と支払い方法" }, url: "https://transportnsw.info/tickets-fares/fares" },
        { label: { en: "Transport for NSW – Eligibility and concessions", ja: "Transport for NSW – 対象者と割引" }, url: "https://transportnsw.info/tickets-fares/eligibility-concessions" },
      ] },
    { topic: "climate", sourceId: "bom-climate", why: "unreviewed",
      text: { en: "The Bureau of Meteorology publishes official climate statistics for Sydney, but StudyAtlas could not read them: the Bureau's pages answered the automated check with HTTP 403 (access denied), the request was not repeated and no workaround was attempted, and its terms of reuse were not reviewed. No climate numbers are shown or compared for this city; the climate text above is an unverified overview. Please check the official statistics (the link was not opened by StudyAtlas).", ja: "気象局（BoM）はシドニーの公式の気候統計を公開していますが、StudyAtlasでは読み取れませんでした。気象局のページが自動確認にHTTP 403（アクセス拒否）を返したため、再試行も回避策も行っていません。再利用の条件も確認していません。この都市の気候の数値は表示も比較もしておらず、上の気候の文章は未確認の概要です。公式の統計をご確認ください（リンク先はStudyAtlasでは開けていません）。" },
      links: [{ label: { en: "Bureau of Meteorology – Climate statistics for Australian locations (Sydney)", ja: "気象局（BoM）– 豪州各地の気候統計（シドニー）" }, url: "https://www.bom.gov.au/climate/averages/tables/cw_066062.shtml" }] },
  ],
});
export default sydneyData();
