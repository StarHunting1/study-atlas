import type { Localized } from "@/lib/i18n";
import type { Status } from "./schema";
import { cities, countries } from "./registry";
import { visaLinks } from "./visa";
import collected from "./collected/snapshot.json";
/*
 * Knowledge registry for future multilingual AI search. Each document is an official page or dataset that
 * facts are taken from. An AI search layer would fetch/index these (respecting each site's terms), answer in the
 * user's language, and may only state as fact what comes from documents with status "verified".
 * Today it is built from the sources already referenced in the data; nothing is fetched.
 */
export type KnowledgeDocument = {
  url: string;
  publisher?: string;
  title?: Localized;
  /** Language of the source page (BCP 47), e.g. "en"; answers may be in another language */
  sourceLanguage: string;
  /** Country whose rules/data it describes (StudyAtlas code) */
  jurisdiction?: string;
  topics: string[];                // e.g. "visa", "cost.rent", "school.fees"
  status: Status;                  // verified only when someone checked the page content
  checkedAt?: string;              // YYYY-MM-DD
  retrievedAt?: string;            // when an indexer last fetched it
  terms?: string;                  // licence / reuse terms
};

type WithSources = { sources?: { url: string; publisher: string; terms?: string }[]; status: Status; checkedAt?: string };
export function knowledgeDocuments(): KnowledgeDocument[] {
  const docs = new Map<string, KnowledgeDocument>();
  const add = (d: KnowledgeDocument) => { if (!docs.has(d.url)) docs.set(d.url, d); else docs.get(d.url)!.topics.push(...d.topics); };
  const walk = (o: unknown, path: string, jurisdiction: string) => {
    if (!o || typeof o !== "object") return;
    const f = o as WithSources;
    if ("status" in f && f.sources) f.sources.forEach((s) => add({ url: s.url, publisher: s.publisher, terms: s.terms, sourceLanguage: "en", jurisdiction, topics: [path], status: f.status, checkedAt: f.checkedAt }));
    else for (const [k, v] of Object.entries(o)) walk(v, path ? `${path}.${k}` : k, jurisdiction);
  };
  cities.forEach((c) => walk(c.profile, "", c.country));
  countries.forEach((c) => (visaLinks[c.code] ?? []).forEach((l) => add({ url: l.link.value!, title: l.label, sourceLanguage: "en", jurisdiction: c.code, topics: ["visa"], status: l.link.status })));
  // Pages and datasets fetched by the collector (collector/), with the date they were retrieved
  for (const r of Object.values(collected.records as Record<string, { sourceUrl: string; country: string; field: string; retrievedAt: string; licence?: string; status: Status }>))
    add({ url: r.sourceUrl, sourceLanguage: "en", jurisdiction: r.country, topics: [r.field], status: r.status, retrievedAt: r.retrievedAt, terms: r.licence });
  return [...docs.values()];
}
