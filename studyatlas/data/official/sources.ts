import type { Localized } from "@/lib/i18n";
/*
 * Official information sources for city data (Ver.1.5). One entry per publisher page or data service.
 * Data points (data/official/<city>.ts) point at a source by id; the collector checks each source on its own
 * cadence. To add a city, register its sources here and its data points in a new data/official/<city>.ts.
 *
 * method
 *   api   – documented open API / data service (JSON or CSV). Values are read by collector/sources/*.
 *   page  – public web page without an API. The collector never extracts new values from it: it only checks,
 *           at most once per cadence and only where robots.txt allows, that every recorded value is still
 *           shown on the page. A value that disappears becomes a change candidate for a person to review.
 */
export type Topic = "transport" | "housing" | "living" | "climate";
export type TermsStatus = "open-licence" | "page-check-only" | "needs-review";
export type OfficialSource = {
  id: string; publisher: string; name: Localized; country: "GBR" | "CAN"; cityIds: string[]; topic: Topic;
  method: "api" | "page";
  /** Pages a person (and the page check) reads. For api sources: the human-readable page for the data. */
  pages: string[];
  /** Days between checks. Fares and rents change at most a few times a year; climate normals once a decade. */
  cadenceDays: number;
  terms: { status: TermsStatus; licence?: string; url?: string; note: Localized };
};

const factsOnly = {
  en: "No open licence is published for this page. StudyAtlas records only the figures (facts) with a link to the page and a short quote as evidence; page content is not republished. Reuse terms to be confirmed by a person.",
  ja: "このページには公開ライセンスが示されていません。StudyAtlasは数値（事実）と出典リンク、証拠としての短い引用のみを記録し、ページ内容は転載しません。利用条件は人による確認が必要です。",
};
export const officialSources: OfficialSource[] = [
  { id: "tfgm-fares", publisher: "Transport for Greater Manchester (Bee Network)", name: { en: "Bus tickets and student tickets", ja: "バス乗車券・学生向け乗車券" }, country: "GBR", cityIds: ["manchester"], topic: "transport", method: "page",
    pages: ["https://tfgm.com/tickets-and-passes/bus-tickets", "https://tfgm.com/tickets-and-passes/all-terms-bee-bus-student"], cadenceDays: 30,
    terms: { status: "page-check-only", url: "https://tfgm.com/disclaimer", note: factsOnly } },
  { id: "translink-fares", publisher: "TransLink", name: { en: "Pricing and Fare Zones", ja: "運賃とゾーン" }, country: "CAN", cityIds: ["vancouver"], topic: "transport", method: "page",
    pages: ["https://www.translink.ca/transit-fares/pricing-and-fare-zones", "https://www.translink.ca/transit-fares/u-pass-bc"], cadenceDays: 30,
    terms: { status: "page-check-only", note: factsOnly } },
  { id: "uom-cost-of-living", publisher: "The University of Manchester", name: { en: "Cost of living (undergraduate)", ja: "生活費（学部生向け）" }, country: "GBR", cityIds: ["manchester"], topic: "living", method: "page",
    pages: ["https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/"], cadenceDays: 60,
    terms: { status: "page-check-only", url: "https://www.manchester.ac.uk/copyright/", note: factsOnly } },
  { id: "uom-accommodation", publisher: "The University of Manchester", name: { en: "University accommodation", ja: "大学寮" }, country: "GBR", cityIds: ["manchester"], topic: "housing", method: "page",
    pages: ["https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/", "https://www.manchester.ac.uk/study/international/accommodation/", "https://www.manchester.ac.uk/study/accommodation/student-accommodation/"], cadenceDays: 60,
    terms: { status: "page-check-only", url: "https://www.manchester.ac.uk/copyright/", note: factsOnly } },
  { id: "statcan-cmhc-rents", publisher: "Statistics Canada / CMHC", name: { en: "Average rents (CMHC Rental Market Survey), table 34-10-0133-01", ja: "平均家賃（CMHC 賃貸市場調査）表 34-10-0133-01" }, country: "CAN", cityIds: ["vancouver"], topic: "housing", method: "api",
    pages: ["https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301"], cadenceDays: 30,
    terms: { status: "open-licence", licence: "Statistics Canada Open Licence", url: "https://www.statcan.gc.ca/en/terms-conditions/open-licence", note: { en: "Use, reproduction and publication allowed with attribution under the Statistics Canada Open Licence.", ja: "Statistics Canada Open Licence に基づき、出典を示して利用・転載できます。" } } },
  { id: "eccc-climate-normals", publisher: "Environment and Climate Change Canada", name: { en: "Canadian Climate Normals 1981–2010 (GeoMet OGC API)", ja: "カナダ気候平年値 1981–2010（GeoMet OGC API）" }, country: "CAN", cityIds: ["vancouver"], topic: "climate", method: "api",
    pages: ["https://climate.weather.gc.ca/climate_normals/", "https://api.weather.gc.ca/collections/climate-normals"], cadenceDays: 180,
    terms: { status: "open-licence", licence: "Government of Canada terms (reproduction with attribution); API data licence to be confirmed", url: "https://www.canada.ca/en/transparency/terms.html", note: { en: "Government of Canada materials may be reproduced for non-commercial purposes with attribution. The licence attached to the API data itself is still to be confirmed by a person.", ja: "カナダ政府の資料は、出典を示せば非商用目的で転載できます。API データ自体のライセンスは人による確認が必要です。" } } },
];
