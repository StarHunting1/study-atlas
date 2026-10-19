import type { Localized } from "@/lib/i18n";
import { rentBasisOf, type RentBasis } from "./rentBasis";
import type { DataPoint } from "./types";
/*
 * Plain-language reason for a rent comparison verdict (Ver.1.6.2). The sentence is BUILT from the recorded definition of each figure (rentBasis.ts), never a fixed text:
 * what is measured (average or median), for which kind of area, which dwellings, which year, in which currency and per which period. When every part is equal it says so
 * and names the shared definition; when parts differ it names exactly those parts with each city's value. A part the tables below do not know falls back to the raw recorded
 * word (so nothing is invented), and a figure without a recorded basis gets no explanation at all (the caller keeps its generic text).
 */
type Pair = { en: string; ja: string };
const AREA: Record<string, Pair> = {
  "census metropolitan area": { en: "a census metropolitan area (wider than the city)", ja: "都市圏（市より広い範囲）" },
  "local authority": { en: "one local authority", ja: "1つの地方自治体" },
  region: { en: "a whole region", ja: "地域全体" },
  "ABS Greater Capital City Statistical Area": { en: "a Greater Capital City Statistical Area (the whole metropolitan region)", ja: "大都市圏統計区域（都市圏全体）" },
};
const STRUCT: Record<string, Pair> = {
  "Row and apartment structures of three units and over": { en: "apartments and row houses of 3+ units", ja: "3戸以上の集合住宅・長屋" },
  "all dwellings": { en: "all private rented dwellings", ja: "民間賃貸住宅すべて" },
  "all rented dwellings": { en: "all rented dwellings", ja: "賃貸住宅すべて" },
};
const UNIT: Record<string, Pair> = {
  "Bachelor units": { en: "studio", ja: "バチェラー（ワンルーム）" }, "One bedroom units": { en: "1-bedroom", ja: "1ベッドルーム" },
  "Two bedroom units": { en: "2-bedroom", ja: "2ベッドルーム" }, "Three bedroom units": { en: "3-bedroom", ja: "3ベッドルーム" }, "all sizes": { en: "all sizes", ja: "間取りの区別なし" },
};
const PER: Record<string, Pair> = { month: { en: "per month", ja: "月額" }, week: { en: "per week", ja: "週額" } };
const stat = (b: RentBasis): Pair => (/median/i.test(b.measure) ? { en: "median rent", ja: "家賃の中央値" } : { en: "average rent", ja: "平均家賃" });
const pick = (m: Record<string, Pair>, k: string): Pair => m[k] ?? { en: k, ja: k };
/** "<unit> <dwellings>" in words, e.g. "1-bedroom apartments and row houses of 3+ units". */
const what = (b: RentBasis): Pair => {
  const s = pick(STRUCT, b.structure), u = pick(UNIT, b.unitKey);
  return b.unitKey === "all sizes" ? s : { en: `${u.en} ${s.en}`, ja: `${s.ja}の${u.ja}` };
};
type Part = (b: RentBasis) => Pair;
const PART: Partial<Record<keyof RentBasis, { why: Pair; of: Part }>> = {
  area: { why: { en: "the kind of area differs", ja: "対象地域の単位が違います" }, of: (b) => pick(AREA, b.area) },
  measure: { why: { en: "one is an average and the other a median, or they are averaged differently", ja: "平均と中央値など、集計の方法が違います" }, of: (b) => stat(b) },
  year: { why: { en: "the year differs", ja: "対象年が違います" }, of: (b) => ({ en: b.year, ja: `${b.year}年` }) },
  per: { why: { en: "one is per week and the other per month (never converted)", ja: "週額と月額など、金額の単位が違います（換算はしません）" }, of: (b) => pick(PER, b.per) },
  currency: { why: { en: "the currency differs (never converted)", ja: "通貨が違います（換算はしません）" }, of: (b) => ({ en: b.currency, ja: b.currency }) },
  structure: { why: { en: "the dwellings counted differ", ja: "対象の住宅の種類が違います" }, of: (b) => pick(STRUCT, b.structure) },
  unitKey: { why: { en: "the bedroom size differs", ja: "間取りが違います" }, of: (b) => pick(UNIT, b.unitKey) },
  publisher: { why: { en: "the publisher differs", ja: "発表元が違います" }, of: (b) => ({ en: b.publisher, ja: b.publisher }) },
  table: { why: { en: "the statistic (table) differs", ja: "統計の種類（表）が違います" }, of: (b) => ({ en: b.table, ja: b.table }) },
};
const ORDER: (keyof RentBasis)[] = ["area", "measure", "year", "per", "currency", "structure", "unitKey", "publisher", "table"];
const join = (xs: string[], lang: "en" | "ja") => xs.join(lang === "ja" ? "、" : ", ");

/** The reason for the verdict, or undefined when some figure has no recorded definition (the caller then keeps its generic wording). `names` = the city names, in the order of `points`. */
export function rentExplain(points: DataPoint[], names: Localized[]): { same: boolean; en: string; ja: string } | undefined {
  const bs = points.map(rentBasisOf); if (points.length < 2 || bs.some((b) => !b)) return undefined;
  const B = bs as RentBasis[]; const first = B[0];
  const diff = ORDER.filter((k) => B.some((b) => b[k] !== first[k]));
  if (!diff.length) {
    const st = stat(first), w = what(first), a = pick(AREA, first.area), per = pick(PER, first.per);
    return {
      same: true,
      en: `${points.length === 2 ? "Both" : "All"} are the ${first.year} ${st.en} (${first.currency}, ${per.en}) of ${w.en} in ${a.en}, from the same publisher and the same definition, so the numbers can be compared directly.`,
      ja: `いずれも${first.year}年の、${a.ja}を対象にした${w.ja}の${st.ja}（${first.currency}・${per.ja}）で、発表元も定義も同じなので、数値をそのまま比べられます。`,
    };
  }
  const nm = (i: number, lang: "en" | "ja") => names[i]?.[lang] ?? names[i]?.en ?? "";
  const lines = (lang: "en" | "ja") => diff.slice(0, 6).map((k) => {
    const p = PART[k]!; const vals = B.map((b, i) => `${nm(i, lang)}${lang === "ja" ? "：" : ": "}${p.of(b)[lang]}`);
    return lang === "ja" ? `${p.why.ja}（${join(vals, "ja")}）` : `${p.why.en} (${join(vals, "en")})`;
  });
  return {
    same: false,
    en: `Not the same statistic, so this is a reference comparison only: ${lines("en").join("; ")}. No ranking or verdict is given and currencies are not converted.`,
    ja: `同じ統計ではないため参考比較です：${lines("ja").join("。")}。数値の優劣は判定せず、通貨も換算しません。`,
  };
}
