// Japanese wording for the `validFor` strings (kept in English in the data because they also feed Fact.period).
// Unknown strings fall back to the English original, so a new entry never breaks the page.
const ja: Record<string, string> = {
  "Published fare on the TfGM page as of 13 Oct 2026 (no effective date stated on the page)": "2026年10月13日時点でTfGMのページに掲載の運賃（ページに適用開始日の記載なし）",
  "‘Current Fares’ column of the TransLink fare tables as of 13 Oct 2026 (the page also shows a ‘July 1 Fares’ column without a year)": "2026年10月13日時点のTransLink運賃表「Current Fares」列（ページには年の記載がない「July 1 Fares」列もあります）",
  "2026/27 academic year (undergraduate year of 41 weeks)": "2026/27学年（学部の1学年・41週）",
  "2026/27 (as published on the cost-of-living page)": "2026/27（生活費ページの記載）",
  "As published on 13 Oct 2026 (academic year not stated next to the price)": "2026年10月13日時点の掲載（価格の横に学年の記載なし）",
  "1 Sep 2026 – 31 Aug 2027": "2026年9月1日〜2027年8月31日",
  "2025 (latest reference year; released by Statistics Canada 2025-12-17)": "2025年（最新の調査年。Statistics Canadaが2025-12-17に公表）",
};
// Short English forms used where the long text does not fit
export const validForText = (s: string, lang: string) => (lang === "ja" ? ja[s] ?? s : s);
/** Short form for tight spaces (before the first parenthesis). */
export const validForShort = (s: string, lang: string) => validForText(s, lang).split(/ \(|（/)[0];
