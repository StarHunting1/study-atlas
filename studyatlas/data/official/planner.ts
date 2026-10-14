import type { Localized } from "@/lib/i18n";
import type { Ccy, CityId, HousingType, ItemId, Per, StudyType } from "@/lib/planner";
import { CURRENCIES } from "@/lib/planner";
import { getSchool, isLanguage, listSchools, type Price } from "../schools";
import { officialData, officialSources } from "./index";
import type { DataPoint } from "./types";
/*
 * Cost planner candidates (Ver.1.6): verified official figures from data/official/* (Ver.1.5) and, later, school fees,
 * offered as starting values for a planner item. Nothing is fetched or republished beyond what the city pages already show.
 * A candidate is only offered when its data point is "verified"; a figure with a range offers its lower and upper end separately.
 */
export type Candidate = {
  id: string; itemId: ItemId; per: Per; value: number; currency: Ccy; coverageWeeks?: number;
  label: Localized; /** short text for the source line */ publisher: string; url: string; validFor: string; status: DataPoint["status"];
  /** who the figure is for / eligibility, as published */ audience: Localized;
  /** shown in amber when the figure may not fit the user's situation */ caution?: Localized;
  /** the source page grants no reuse licence (terms to be confirmed) */ termsUnconfirmed: boolean;
  /** "official" from city data, "school" from a school's fee table */ origin: "city" | "school";
  /** false when the figure is for a group the chosen study type does not belong to (e.g. U-Pass BC for a language school) */ eligible: boolean;
  /** false when the figure describes something other than what a student pays (e.g. a whole flat): shown, but never picked automatically */ auto: boolean;
  /** housing type the figure belongs to (housing items only) */ housingType?: HousingType;
};

type Rule = { itemId: ItemId; pointId: string; per: Per; housing?: HousingType[]; types?: StudyType[]; use?: "value" | "max" | "both"; manual?: boolean; coverageWeeks?: number; caution?: Localized; label?: Localized };
const uniOnly: Localized = { en: "This figure is a University of Manchester estimate for undergraduates. It may not match a language-school student.", ja: "マンチェスター大学の学部生向けの見積もりです。語学留学の方には当てはまらない可能性があります。" };
const RULES: Record<CityId, Rule[]> = {
  manchester: [
    { itemId: "housing", pointId: "man-uom-intl-selfcatered-shared-week", per: "week", housing: ["dorm"], types: ["university"], label: { en: "University halls, self-catered, shared facilities (from)", ja: "大学寮・自炊・共用設備（最低額）" } },
    { itemId: "housing", pointId: "man-uom-intl-selfcatered-ensuite-week", per: "week", housing: ["dorm"], types: ["university"], label: { en: "University halls, self-catered, en-suite (from)", ja: "大学寮・自炊・専用バスルーム（最低額）" } },
    { itemId: "housing", pointId: "man-uom-intl-catered-week", per: "week", housing: ["dorm"], types: ["university"], label: { en: "University halls, catered (from)", ja: "大学寮・食事付き（最低額）" } },
    { itemId: "housing", pointId: "man-uom-halls-catered-month", per: "month", housing: ["dorm"], types: ["university"], use: "both", coverageWeeks: 41, label: { en: "University halls, catered (41-week contract)", ja: "大学寮・食事付き（41週の契約）" } },
    { itemId: "housing", pointId: "man-uom-est-private-share-month", per: "month", housing: ["share"], use: "both", caution: uniOnly, label: { en: "Private house share incl. bills (University estimate)", ja: "民間シェアハウス・光熱費込み（大学の見積もり）" } },
    { itemId: "food", pointId: "man-uom-ug-groceries", per: "month", caution: uniOnly, label: { en: "Groceries", ja: "食料品" } },
    { itemId: "transport", pointId: "man-uom-ug-transport", per: "month", caution: uniOnly, label: { en: "Transport incl. travel elsewhere", ja: "交通費（市外への移動を含む）" } },
    { itemId: "transport", pointId: "man-bus-allterms-student", per: "once", types: ["university"], label: { en: "All Terms Bee Bus student ticket (1 Sep – 30 Jun)", ja: "学生向け All Terms Bee Bus 券（9/1〜6/30）" }, caution: { en: "For students of a Greater Manchester college or university (ID required). One ticket covers the academic year.", ja: "グレーター・マンチェスターの大学・カレッジの学生（学生証が必要）が対象です。1枚で学年全体をカバーします。" } },
    { itemId: "phone", pointId: "man-uom-ug-phone", per: "month", caution: uniOnly, label: { en: "Mobile phone", ja: "携帯電話" } },
    { itemId: "leisure", pointId: "man-uom-ug-social", per: "month", caution: uniOnly, label: { en: "Going out and socialising", ja: "外出・交際費" } },
  ],
  vancouver: [
    { itemId: "housing", pointId: "van-cmhc-rent-bachelor", per: "month", housing: ["other"], label: { en: "Average rent, bachelor (whole market)", ja: "平均家賃・バチェラー（市場全体）" }, caution: { en: "Whole rental market average, not student housing.", ja: "賃貸市場全体の平均で、学生寮ではありません。" } },
    { itemId: "housing", pointId: "van-cmhc-rent-1br", per: "month", housing: ["other"], label: { en: "Average rent, 1 bedroom (whole market)", ja: "平均家賃・1ベッドルーム（市場全体）" }, caution: { en: "Whole rental market average, not student housing.", ja: "賃貸市場全体の平均で、学生寮ではありません。" } },
    { itemId: "housing", pointId: "van-cmhc-rent-2br", per: "month", housing: ["other"], manual: true, label: { en: "Average rent, 2 bedrooms (whole market)", ja: "平均家賃・2ベッドルーム（市場全体）" }, caution: { en: "Whole rental market average for the whole unit, not one room.", ja: "賃貸市場全体の、住戸全体の平均です（1部屋分ではありません）。" } },
    { itemId: "transport", pointId: "van-upass", per: "month", types: ["university"], label: { en: "U-Pass BC", ja: "U-Pass BC" }, caution: { en: "Only students of participating public institutions; paid through student fees. Private schools (e.g. most language schools) are not eligible.", ja: "参加する公立校の学生が対象で、学費に含めて支払います。私立校（多くの語学学校を含む）は対象外です。" } },
    { itemId: "transport", pointId: "van-monthly-adult-z1", per: "month", label: { en: "Monthly Pass, adult, 1 zone", ja: "マンスリーパス・大人・1ゾーン" } },
    { itemId: "transport", pointId: "van-monthly-adult-z2", per: "month", label: { en: "Monthly Pass, adult, 2 zones", ja: "マンスリーパス・大人・2ゾーン" } },
    { itemId: "transport", pointId: "van-monthly-adult-z3", per: "month", label: { en: "Monthly Pass, adult, 3 zones", ja: "マンスリーパス・大人・3ゾーン" } },
  ],
};

const audienceOf = (p: DataPoint): Localized => ({ en: p.conditions.en, ja: p.conditions.ja });
const ccyOf = (c: string): Ccy | undefined => ((CURRENCIES as readonly string[]).includes(c) ? (c as Ccy) : undefined);

/** All verified official candidates for an item in a city (for the chosen housing type and study type). */
export function cityCandidates(cityId: CityId, itemId: ItemId, o: { studyType: StudyType; housingType: HousingType }): Candidate[] {
  const data = officialData(cityId); if (!data) return [];
  const out: Candidate[] = [];
  for (const r of RULES[cityId] ?? []) {
    if (r.itemId !== itemId) continue;
    if (r.housing && !r.housing.includes(o.housingType)) continue;
    const p = data.points.find((x) => x.id === r.pointId); if (!p || p.status !== "verified" || !p.value) continue;
    const currency = ccyOf(p.value.currency); if (!currency) continue;
    const terms = officialSources.find((s) => s.id === p.sourceId)?.terms.status === "page-check-only";
    const mismatch = r.types && !r.types.includes(o.studyType);
    const base = { itemId, per: r.per, currency, coverageWeeks: r.coverageWeeks, eligible: !mismatch, auto: !r.manual, housingType: itemId === "housing" ? o.housingType : undefined, publisher: p.evidence[0].publisher, url: p.evidence[0].url, validFor: p.validFor, status: p.status, audience: audienceOf(p), termsUnconfirmed: !!terms, origin: "city" as const,
      caution: mismatch ? { en: "Not meant for your study type: " + (r.caution?.en ?? "check the conditions."), ja: "選択中の留学タイプ向けではありません。" + (r.caution?.ja ?? "適用条件をご確認ください。") } : r.caution };
    const label = r.label ?? p.label; const range = p.value.max !== undefined && r.use !== "value";
    out.push({ ...base, id: `${p.id}`, value: p.value.amount, label: range ? { en: `${label.en} – lower end`, ja: `${label.ja}（下限）` } : label });
    if (range) out.push({ ...base, id: `${p.id}:max`, value: p.value.max!, label: { en: `${label.en} – upper end`, ja: `${label.ja}（上限）` } });
  }
  return out;
}

const priceToPer = (u: Price["unit"]): Per => (u === "week" ? "week" : u === "month" ? "month" : u === "term" ? "term" : u === "year" ? "year" : "once");

/**
 * Fees of schools in a city, once their data is verified: choosing a school fills tuition / registration / materials.
 * Today no real language school is registered and universities have no verified fees, so this returns nothing
 * (`allowSample` exists for tests and demos: fictional sample schools are never offered otherwise).
 */
export function schoolCandidates(cityId: CityId, itemId: ItemId, studyType: StudyType, o: { allowSample?: boolean } = {}): Candidate[] {
  if (itemId !== "tuition" && itemId !== "registration" && itemId !== "materials") return [];
  const ok = (s: DataPoint["status"]) => s === "verified" || (!!o.allowSample && s === "sample");
  const out: Candidate[] = [];
  for (const school of listSchools(studyType, { includeSamples: !!o.allowSample }).filter((s) => s.cityId === cityId)) {
    const s = getSchool(school.id)!; const web = s.website.value ?? ""; const demo = !!s.demo;
    const push = (fact: { status: DataPoint["status"]; value?: Price; period?: string; sources?: { url: string; publisher: string }[] }, optId: string, optName: Localized, weeks?: number) => {
      if (!ok(fact.status) || !fact.value) return; const cur = ccyOf(fact.value.currency); if (!cur) return;
      out.push({ id: `school:${s.id}:${optId}:${itemId}`, itemId, per: priceToPer(fact.value.unit), value: fact.value.amount, currency: cur, coverageWeeks: weeks,
        label: { en: `${s.name} – ${optName.en}`, ja: `${s.name} – ${optName.ja}` }, publisher: fact.sources?.[0]?.publisher ?? s.name, url: fact.sources?.[0]?.url ?? web, validFor: fact.value.feeYear ?? fact.period ?? "",
        status: fact.status, audience: fact.value.applicability ?? { en: "See the school's conditions", ja: "学校の条件をご確認ください" }, termsUnconfirmed: false, origin: "school", eligible: true, auto: true,
        caution: demo ? { en: "Fictional sample school (demo only).", ja: "架空のサンプル校です（デモ用）。" } : undefined });
    };
    if (isLanguage(s)) for (const c of s.courses) {
      const weeks = c.duration.status === "verified" || (o.allowSample && c.duration.status === "sample") ? c.duration.value?.minWeeks : undefined;
      if (itemId === "tuition") push(c.tuition, c.id, c.name, weeks); else if (itemId === "registration") push(c.registrationFee, c.id, c.name); else push(c.materialsFee, c.id, c.name);
    } else if (itemId === "tuition") for (const pr of s.programs) push(pr.tuitionInternational, pr.id, { en: `${pr.degree.en} ${pr.major.en}`, ja: `${pr.degree.ja} ${pr.major.ja}` });
  }
  return out;
}

export const candidatesFor = (cityId: CityId, itemId: ItemId, o: { studyType: StudyType; housingType: HousingType; allowSample?: boolean }): Candidate[] => [...schoolCandidates(cityId, itemId, o.studyType, { allowSample: o.allowSample }), ...cityCandidates(cityId, itemId, o)];

/** Reviewed-but-not-shown notices (e.g. UBC residence fees) for a city and topic, with official links. */
export const noticesFor = (cityId: CityId, topic: "housing" | "transport" | "living") => officialData(cityId)?.notices?.filter((n) => n.topic === topic) ?? [];

import type { Plan } from "@/lib/planner";
import { touch } from "@/lib/planner";
/** Put a candidate into a plan item as an official figure (value, unit, currency, own billed period and its source). */
export function applyCandidate(p: Plan, c: Candidate): Plan {
  return touch({ ...p, items: { ...p.items, [c.itemId]: { value: c.value, currency: c.currency, per: c.per, coverageWeeks: c.coverageWeeks ?? null, source: { kind: "official", ref: c.id, label: c.publisher, url: c.url, validFor: c.validFor } } } });
}
