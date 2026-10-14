import type { Source } from "../types";
import { canada } from "./canada";
import { eccc } from "./eccc";
import { govuk } from "./govuk";
import { metoffice } from "./metoffice";
import { pageSources } from "./pages";
import { statcan } from "./statcan";
/*
 * Source registry. Only "implemented" sources are fetched. The rest are listed so the report shows what is
 * planned and what is blocked on keys, agreements or terms. Provider details in `note` marked "(unchecked)"
 * come from prior knowledge and have not been confirmed against the provider's current terms.
 */
const planned: Source[] = [
  { id: "ons-api", name: "ONS API (UK official statistics)", country: "GBR", access: "open-api-planned", docs: "https://developer.ons.gov.uk/",
    domains: ["api.beta.ons.gov.uk"], topics: ["cost", "housing"], note: "Open API for ONS datasets (e.g. private rents, CPI) (unchecked). Next to implement for Manchester costs." },
  { id: "met-office-datahub", name: "Met Office Weather DataHub / climate averages", country: "GBR", access: "needs-key", docs: "https://datahub.metoffice.gov.uk/",
    domains: ["data.hub.api.metoffice.gov.uk", "www.metoffice.gov.uk"], topics: ["climate"], note: "DataHub APIs require registration and an API key; the station climate-average pages load figures with JavaScript (no documented API). Monthly station data files are read by metoffice-station-data instead. Do not scrape." },
  { id: "tfgm-open-data", name: "TfGM Open Data", country: "GBR", access: "needs-key", docs: "https://developer.tfgm.com/",
    domains: ["api.tfgm.com"], topics: ["transport"], note: "Developer portal with subscription key (unchecked). Fares and student tickets may not be in the API." },
  { id: "translink-open-api", name: "TransLink Open API / GTFS", country: "CAN", access: "needs-key", docs: "https://www.translink.ca/about-us/doing-business-with-translink/app-developer-resources",
    domains: ["api.translink.ca", "gtfs-static.translink.ca"], topics: ["transport"], note: "Real-time API requires registration; GTFS static is under TransLink's licence (unchecked). Fares/U-Pass are web pages: needs review." },
];
export const sources: Source[] = [govuk, canada, statcan, eccc, metoffice, ...pageSources(), ...planned];
export const getSource = (id: string) => sources.find((s) => s.id === id);
