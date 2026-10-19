import type { OfficialCityData, TopicNotice } from "./types";
import { RENT_APPROVALS, melbourneRentPoints, pendingRentIds, type RentApproval } from "./cityRents";
/*
 * Melbourne – official data (Ver.1.6.0). The ABS Census rent comes from cityRents.ts / auRents.ts and exists here ONLY after a person's approval.
 * Until then the city page and the comparison show the conditions and the official links below instead of a number ("confirming").
 * Transport Victoria (formerly PTV) fares are link-only: transport.vic.gov.au answered the automated check with a bot-check page (HTTP 403), so the pages were neither read nor retried.
 */
const ABS = "https://www.abs.gov.au/census/find-census-data/quickstats/2021/2GMEL";
export const melbourneData = (approvals: Record<string, RentApproval> = RENT_APPROVALS): OfficialCityData => ({
  cityId: "melbourne",
  points: [...melbourneRentPoints(approvals)],
  notices: [
    ...(pendingRentIds("melbourne", approvals).length === 0 ? [] : [{ topic: "housing", sourceId: "abs-census-rent", why: "awaiting-approval",
      text: {
        en: "A public rent statistic exists for Greater Melbourne: the Australian Bureau of Statistics' 2021 Census gives a median weekly rent for households that rent (actual rent paid, in Australian dollars per week). It has been collected but has not been checked and approved by a person yet, so StudyAtlas does not show the number. When approved it will appear as a 2021 whole-market median for the whole Greater Melbourne area – not student housing, not advertised asking rents. The Victorian Government also publishes rental reports (new leases); that is a different statistic, its page could not be read by our automated check, and it is not used here. Check the official page meanwhile.",
        ja: "グレーター・メルボルンには公的な家賃統計があります。オーストラリア統計局（ABS）の2021年国勢調査に、住居を借りている世帯の週あたり家賃の中央値（実際に支払われている家賃、オーストラリアドル／週）があります。収集はしましたが、人による確認と承認が済んでいないため、StudyAtlasでは数値を表示していません。承認後は、グレーター・メルボルン全体の2021年の市場全体の中央値として表示します（学生向け住居ではなく、募集家賃でもありません）。ビクトリア州政府も賃貸レポート（新規契約が対象）を公開していますが、別の統計で、自動確認では読めなかったため、ここでは使っていません。それまでは公式ページでご確認ください。",
      },
      links: [
        { label: { en: "ABS – 2021 Census QuickStats: Greater Melbourne", ja: "ABS – 2021年国勢調査 QuickStats：グレーター・メルボルン" }, url: ABS },
        { label: { en: "ABS – copyright and licence (Creative Commons Attribution 4.0)", ja: "ABS – 著作権とライセンス（CC BY 4.0）" }, url: "https://www.abs.gov.au/website-privacy-copyright-and-disclaimer" },
      ] }] as TopicNotice[]),
    { topic: "transport", sourceId: "ptv-fares", why: "unreviewed",
      text: {
        en: "Melbourne's public transport is paid for with a myki card (Transport Victoria, formerly Public Transport Victoria). Fares, daily caps, concession rules and who qualifies are not copied here, and StudyAtlas could not read the official pages (the site answered the automated check with a bot-check page), so the pages are linked without a summary of their content. Do not assume that international or language-school students get a concession fare – check the eligibility rules on the official page. A monthly cost should be worked out by you from the current fares (the Planner keeps your own input).",
        ja: "メルボルンの公共交通は myki カードで支払います（Transport Victoria。旧Public Transport Victoria）。運賃・1日の上限・割引の条件・対象者はここに転載していません。公式ページは、自動確認に確認用ページが返ってきたため内容を読めておらず、内容の要約なしでリンクだけを載せています。留学生や語学学校の学生が割引運賃を受けられるとは限りません。対象条件は公式ページでご確認ください。月額の目安は、最新の運賃を見てご自身で計算してください（プランナーはご自身の入力のままです）。",
      },
      links: [
        { label: { en: "Transport Victoria – Fares", ja: "Transport Victoria – 運賃" }, url: "https://transport.vic.gov.au/tickets-and-myki/fares" },
        { label: { en: "Transport Victoria – myki", ja: "Transport Victoria – myki" }, url: "https://transport.vic.gov.au/tickets-and-myki/myki" },
      ] },
    { topic: "climate", sourceId: "bom-climate", why: "unreviewed",
      text: { en: "The Bureau of Meteorology publishes official climate statistics for Melbourne, but StudyAtlas could not read them: the Bureau's pages answered the automated check with HTTP 403 (access denied), the request was not repeated and no workaround was attempted, and its terms of reuse were not reviewed. No climate numbers are shown or compared for this city; the climate text above is an unverified overview. Please check the official statistics (the link was not opened by StudyAtlas).", ja: "気象局（BoM）はメルボルンの公式の気候統計を公開していますが、StudyAtlasでは読み取れませんでした。気象局のページが自動確認にHTTP 403（アクセス拒否）を返したため、再試行も回避策も行っていません。再利用の条件も確認していません。この都市の気候の数値は表示も比較もしておらず、上の気候の文章は未確認の概要です。公式の統計をご確認ください（リンク先はStudyAtlasでは開けていません）。" },
      links: [{ label: { en: "Bureau of Meteorology – Climate statistics for Australian locations (Melbourne)", ja: "気象局（BoM）– 豪州各地の気候統計（メルボルン）" }, url: "https://www.bom.gov.au/climate/averages/tables/cw_086071.shtml" }] },
  ],
});
export default melbourneData();
