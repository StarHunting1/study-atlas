import type { Localized } from "@/lib/i18n";
/*
 * Official information sources for city data (Ver.1.5). What each source permits (licence, reuse status, access method) is recorded in rights.ts (Ver.1.2). One entry per publisher page or data service.
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
export type OfficialSource = {
  id: string; publisher: string; name: Localized; country: "GBR" | "CAN" | "AUS"; cityIds: string[]; topic: Topic;
  method: "api" | "page";
  /** Pages a person (and the page check) reads. For api sources: the human-readable page for the data. */
  pages: string[];
  /** Days between checks. Fares and rents change at most a few times a year; climate normals once a decade. */
  cadenceDays: number;
};

export const officialSources: OfficialSource[] = [
  { id: "tfgm-fares", publisher: "Transport for Greater Manchester (Bee Network)", name: { en: "Bus tickets and student tickets", ja: "バス乗車券・学生向け乗車券" }, country: "GBR", cityIds: ["manchester"], topic: "transport", method: "page",
    pages: ["https://tfgm.com/tickets-and-passes/bus-tickets", "https://tfgm.com/tickets-and-passes/all-terms-bee-bus-student"], cadenceDays: 30,
  },
  { id: "translink-fares", publisher: "TransLink", name: { en: "Pricing and Fare Zones", ja: "運賃とゾーン" }, country: "CAN", cityIds: ["vancouver"], topic: "transport", method: "page",
    pages: ["https://www.translink.ca/transit-fares/pricing-and-fare-zones", "https://www.translink.ca/transit-fares/u-pass-bc"], cadenceDays: 30,
  },
  { id: "uom-cost-of-living", publisher: "The University of Manchester", name: { en: "Cost of living (undergraduate)", ja: "生活費（学部生向け）" }, country: "GBR", cityIds: ["manchester"], topic: "living", method: "page",
    pages: ["https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/"], cadenceDays: 60,
  },
  { id: "uom-accommodation", publisher: "The University of Manchester", name: { en: "University accommodation", ja: "大学寮" }, country: "GBR", cityIds: ["manchester"], topic: "housing", method: "page",
    pages: ["https://www.manchester.ac.uk/study/undergraduate/fees-and-funding/cost-of-living/", "https://www.manchester.ac.uk/study/international/accommodation/", "https://www.manchester.ac.uk/study/accommodation/student-accommodation/"], cadenceDays: 60,
  },
  { id: "ons-private-rents", publisher: "Office for National Statistics", name: { en: "Price Index of Private Rents (PIPR): average monthly private rent by local authority", ja: "民間家賃指数（PIPR）：自治体別の平均月額民間家賃" }, country: "GBR", cityIds: ["manchester", "london"], topic: "housing", method: "api",
    pages: ["https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics", "https://www.ons.gov.uk/visualisations/housingpriceslocal/E08000003"], cadenceDays: 30,
  },
  { id: "statcan-cmhc-rents", publisher: "Statistics Canada / CMHC", name: { en: "Average rents (CMHC Rental Market Survey), table 34-10-0133-01", ja: "平均家賃（CMHC 賃貸市場調査）表 34-10-0133-01" }, country: "CAN", cityIds: ["vancouver", "toronto"], topic: "housing", method: "api",
    pages: ["https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301"], cadenceDays: 30,
  },
  { id: "eccc-climate-normals", publisher: "Environment and Climate Change Canada", name: { en: "Canadian Climate Normals 1981–2010 (GeoMet OGC API)", ja: "カナダ気候平年値 1981–2010（GeoMet OGC API）" }, country: "CAN", cityIds: ["vancouver"], topic: "climate", method: "api",
    pages: ["https://climate.weather.gc.ca/climate_normals/", "https://api.weather.gc.ca/collections/climate-normals"], cadenceDays: 180,
  },
  { id: "metoffice-station-data", publisher: "Met Office", name: { en: "Historical monthly data for meteorological stations (Ringway)", ja: "気象観測地点の月別履歴データ（リングウェイ）" }, country: "GBR", cityIds: ["manchester"], topic: "climate", method: "api",
    pages: ["https://www.data.gov.uk/api/action/package_show?id=17ba3bbe-0e98-4a8c-9937-bd1d50fdc3c5", "https://www.metoffice.gov.uk/pub/data/weather/uk/climate/stationdata/ringwaydata.txt"], cadenceDays: 90,
  },
  { id: "ubc-housing-fees", publisher: "UBC Student Housing and Community Services", name: { en: "Residence fees 2026/27 (reviewed, not used)", ja: "寮料金 2026/27（調査済み・掲載せず）" }, country: "CAN", cityIds: ["vancouver"], topic: "housing", method: "page",
    pages: ["https://vancouver.housing.ubc.ca/applications/fees-payments/", "https://vancouver.housing.ubc.ca/applications/fees-payments/marine-drive/", "https://vancouver.housing.ubc.ca/applications/fees-payments/place-vanier/"], cadenceDays: 60,
  },
  { id: "ttc-fares", publisher: "Toronto Transit Commission (TTC)", name: { en: "Fares and passes (link only)", ja: "運賃とパス（リンクのみ）" }, country: "CAN", cityIds: ["toronto"], topic: "transport", method: "page",
    pages: ["https://www.ttc.ca/fares-and-passes"], cadenceDays: 60,
  },
  { id: "tfl-fares", publisher: "Transport for London (TfL)", name: { en: "Fares and discounts (link only)", ja: "運賃と割引（リンクのみ）" }, country: "GBR", cityIds: ["london"], topic: "transport", method: "page",
    pages: ["https://tfl.gov.uk/fares"], cadenceDays: 60,
  },
  { id: "abs-census-rent", publisher: "Australian Bureau of Statistics (ABS)", name: { en: "2021 Census QuickStats: median weekly rent (Greater Sydney, Greater Melbourne)", ja: "2021年国勢調査クイックスタッツ：週あたり家賃の中央値（グレーター・シドニー／グレーター・メルボルン）" }, country: "AUS", cityIds: ["sydney", "melbourne"], topic: "housing", method: "page",
    pages: ["https://www.abs.gov.au/census/find-census-data/quickstats/2021/1GSYD", "https://www.abs.gov.au/census/find-census-data/quickstats/2021/2GMEL"], cadenceDays: 180,
  },
  { id: "tfnsw-fares", publisher: "Transport for NSW", name: { en: "Tickets and fares, Opal and concessions (link only)", ja: "乗車券と運賃・Opal・割引（リンクのみ）" }, country: "AUS", cityIds: ["sydney"], topic: "transport", method: "page",
    pages: ["https://transportnsw.info/tickets-fares", "https://transportnsw.info/tickets-fares/fares", "https://transportnsw.info/tickets-fares/eligibility-concessions"], cadenceDays: 60,
  },
  { id: "ptv-fares", publisher: "Transport Victoria (formerly Public Transport Victoria)", name: { en: "myki and fares (link only)", ja: "myki と運賃（リンクのみ）" }, country: "AUS", cityIds: ["melbourne"], topic: "transport", method: "page",
    pages: ["https://transport.vic.gov.au/tickets-and-myki/myki", "https://transport.vic.gov.au/tickets-and-myki/fares"], cadenceDays: 60,
  },
];
