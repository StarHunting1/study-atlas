import type { Source } from "../types";
import { canada } from "./canada";
import { govuk } from "./govuk";
/*
 * Source registry. Only "implemented" sources are fetched. The rest are listed so the report shows what is
 * planned and what is blocked on keys, agreements or terms. Provider details in `note` marked "(unchecked)"
 * come from prior knowledge and have not been confirmed against the provider's current terms.
 */
const planned: Source[] = [
  { id: "ons-api", name: "ONS API (UK official statistics)", country: "GBR", access: "open-api-planned", docs: "https://developer.ons.gov.uk/",
    domains: ["api.beta.ons.gov.uk"], topics: ["cost", "housing"], note: "Open API for ONS datasets (e.g. private rents, CPI) (unchecked). Next to implement for Manchester costs." },
  { id: "met-office-datahub", name: "Met Office Weather DataHub / climate averages", country: "GBR", access: "needs-key", docs: "https://datahub.metoffice.gov.uk/",
    domains: ["data.hub.api.metoffice.gov.uk", "www.metoffice.gov.uk"], topics: ["climate"], note: "DataHub APIs require registration and an API key; climate-average pages are web pages without a documented API (unchecked). Do not scrape." },
  { id: "tfgm-open-data", name: "TfGM Open Data", country: "GBR", access: "needs-key", docs: "https://developer.tfgm.com/",
    domains: ["api.tfgm.com"], topics: ["transport"], note: "Developer portal with subscription key (unchecked). Fares and student tickets may not be in the API." },
  { id: "eccc-geomet", name: "ECCC MSC GeoMet OGC API (climate normals)", country: "CAN", access: "open-api-planned", docs: "https://api.weather.gc.ca/",
    domains: ["api.weather.gc.ca"], topics: ["climate"], note: "Open OGC API including climate normals collections (unchecked). Next to implement for Vancouver climate." },
  { id: "cmhc-hmip", name: "CMHC Housing Market Information Portal", country: "CAN", access: "needs-terms-review", docs: "https://www.cmhc-schl.gc.ca/",
    domains: ["www.cmhc-schl.gc.ca"], topics: ["housing"], note: "No documented public API known; use datasets republished on open.canada.ca or CMHC downloads after terms review. Do not scrape." },
  { id: "translink-open-api", name: "TransLink Open API / GTFS", country: "CAN", access: "needs-key", docs: "https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources",
    domains: ["api.translink.ca", "gtfs-static.translink.ca"], topics: ["transport"], note: "Real-time API requires registration; GTFS static is under TransLink's licence (unchecked). Fares/U-Pass are web pages: needs review." },
];
export const sources: Source[] = [govuk, canada, ...planned];
export const getSource = (id: string) => sources.find((s) => s.id === id);
