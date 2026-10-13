import type { Localized } from "@/lib/i18n";
import type { Fact } from "@/data/schema";
import type { CollectedRecord } from "./types";
/**
 * A collected record in the Ver.1.3 Fact shape, for a reviewer to paste into data/profiles/*.
 * It is always returned as "unverified": a person sets status "verified" and checkedAt after opening the source.
 */
export function toFact(r: CollectedRecord): Fact<Localized> {
  const summary = r.ai?.summary;
  return {
    status: "unverified",
    value: summary ?? { en: r.value.text ?? "", ja: r.value.text ?? "" },
    sources: [{ url: r.sourceUrl, publisher: new URL(r.sourceUrl).hostname, ...(r.licence ? { terms: r.licence } : {}) }],
    ...(r.period ? { period: r.period } : {}),
    note: {
      en: `Collected automatically on ${r.retrievedAt.slice(0, 10)}${r.sourceUpdatedAt ? ` (source updated ${r.sourceUpdatedAt.slice(0, 10)})` : ""}${summary ? "; summary written by AI" : ""}. Not yet checked by a person.`,
      ja: `${r.retrievedAt.slice(0, 10)}に自動取得${r.sourceUpdatedAt ? `（情報源の更新日 ${r.sourceUpdatedAt.slice(0, 10)}）` : ""}${summary ? "。要約はAIが作成" : ""}。人による確認は未了です。`,
    },
  };
}
