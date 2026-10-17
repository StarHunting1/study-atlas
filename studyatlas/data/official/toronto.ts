import type { OfficialCityData } from "./types";
import { torontoRentPoints } from "./cityRents";
/*
 * Toronto – official data (Ver.1.5.0). The CMHC rents come from cityRents.ts and exist here ONLY after a person's approval (TORONTO_RENT_APPROVAL).
 * Until then the city page and the comparison show the conditions and the official links below instead of numbers.
 * TTC fares are link-only (no amounts are copied): the TTC terms of use have not been reviewed for reuse.
 */
const TABLE = "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301";
const data: OfficialCityData = {
  cityId: "toronto",
  points: [...torontoRentPoints()],
  notices: [
    { topic: "housing", sourceId: "statcan-cmhc-rents", why: "awaiting-approval",
      text: {
        en: "Public rent statistics exist for the Toronto metropolitan area (CMHC Rental Market Survey via Statistics Canada, table 34-10-0133-01, reference year 2025, in Canadian dollars per month by unit size). They have been collected but have not been checked and approved by a person yet, so StudyAtlas does not show the numbers. When approved they will appear as whole-market averages for the census metropolitan area (code 535, much wider than the City of Toronto) – not student housing and not language-school housing. Check the official table meanwhile.",
        ja: "トロント都市圏の公的な家賃統計（CMHC 賃貸市場調査／Statistics Canada 表 34-10-0133-01、調査対象年2025、間取り別・カナダドル・月額）はありますが、人による確認と承認が済んでいないため、StudyAtlasでは数値を表示していません。承認後は、国勢調査の都市圏（コード535、トロント市より大きく広い範囲）の市場全体の平均として表示します（学生向け住居や語学学校の滞在先の料金ではありません）。それまでは公式の表でご確認ください。",
      },
      links: [
        { label: { en: "Statistics Canada – Table 34-10-0133-01 (CMHC average rents)", ja: "Statistics Canada – 表 34-10-0133-01（CMHC 平均家賃）" }, url: TABLE },
        { label: { en: "CMHC – licence for the use of data", ja: "CMHC – データ利用ライセンス" }, url: "https://www.cmhc-schl.gc.ca/about-us/terms-conditions/hmip-terms-conditions" },
      ] },
    { topic: "transport", sourceId: "ttc-fares", why: "unreviewed",
      text: {
        en: "TTC fares (adult fare, passes, discounts, who qualifies by age or student status) are not copied here: StudyAtlas has not reviewed whether the TTC's terms allow reuse, so the official page is linked instead. Do not assume that language-school students get a student discount – check the eligibility rules on the TTC page. A monthly cost should be worked out by you from the current fares (the Planner keeps your own input).",
        ja: "TTCの運賃（大人運賃・定期・割引・年齢や学生資格による対象）はここに転載していません。TTCの利用規約が再利用を認めているかを確認していないため、公式ページへのリンクのみとしています。語学学校の学生が学生割引を受けられるとは限りません。対象条件はTTCのページでご確認ください。月額の目安は、最新の運賃を見てご自身で計算してください（プランナーはご自身の入力のままです）。",
      },
      links: [{ label: { en: "TTC – Fares and passes", ja: "TTC – 運賃とパス" }, url: "https://www.ttc.ca/fares-and-passes" }] },
  ],
};
export default data;
