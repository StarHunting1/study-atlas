import type { Localized } from "@/lib/i18n";
import { countries } from "./registry";
import type { City, Fact } from "./types";
/*
 * Field registry: the one list of what we show for a city. The detail page renders every field;
 * the compare table renders the ones with `compare: true`. Both read the same Fact through `get`,
 * so they can never disagree. Add a field here once and both screens pick it up.
 */
export type FieldKind = "text" | "money" | "institutions" | "climate";
export type Field = { id: string; label: Localized; kind: FieldKind; get: (c: City) => Fact<unknown>; compare?: boolean };
export type Section = { id: string; label: Localized; fields: Field[] };

const visaOf = (c: City) => countries.find((k) => k.code === c.country)!.profile.visa;

export const sections: Section[] = [
  { id: "cost", label: { en: "Living costs", ja: "生活費" }, fields: [
    { id: "cost.rent", label: { en: "Rent", ja: "家賃" }, kind: "money", get: (c) => c.profile.cost.rent, compare: true },
    { id: "cost.food", label: { en: "Food", ja: "食費" }, kind: "money", get: (c) => c.profile.cost.food, compare: true },
    { id: "cost.transport", label: { en: "Transport", ja: "交通費" }, kind: "money", get: (c) => c.profile.cost.transport, compare: true },
    { id: "cost.phone", label: { en: "Phone / mobile data", ja: "通信費" }, kind: "money", get: (c) => c.profile.cost.phone, compare: true },
    { id: "cost.totalMonthly", label: { en: "Total monthly living cost", ja: "月の生活費（合計）" }, kind: "money", get: (c) => c.profile.cost.totalMonthly, compare: true },
  ] },
  { id: "housing", label: { en: "Housing", ja: "住居" }, fields: [
    { id: "housing.overview", label: { en: "Overview", ja: "概要" }, kind: "text", get: (c) => c.profile.housing.overview, compare: true },
    { id: "housing.dorm", label: { en: "Student halls / dormitories", ja: "学生寮" }, kind: "text", get: (c) => c.profile.housing.dorm },
    { id: "housing.homestay", label: { en: "Homestay", ja: "ホームステイ" }, kind: "text", get: (c) => c.profile.housing.homestay },
    { id: "housing.shareHouse", label: { en: "Shared houses / flats", ja: "シェアハウス" }, kind: "text", get: (c) => c.profile.housing.shareHouse },
  ] },
  { id: "climate", label: { en: "Climate", ja: "気候" }, fields: [
    { id: "climate.overview", label: { en: "Overview", ja: "概要" }, kind: "text", get: (c) => c.profile.climate.overview, compare: true },
    { id: "climate.monthly", label: { en: "Monthly mean temperature and precipitation", ja: "月別平均気温・降水量" }, kind: "climate", get: (c) => c.profile.climate.monthly },
  ] },
  { id: "safety", label: { en: "Safety", ja: "治安" }, fields: [
    { id: "safety.crimeStats", label: { en: "Official crime statistics", ja: "公的な犯罪統計" }, kind: "text", get: (c) => c.profile.safety.crimeStats, compare: true },
    { id: "safety.advice", label: { en: "Safety advice", ja: "防犯情報" }, kind: "text", get: (c) => c.profile.safety.advice },
  ] },
  { id: "education", label: { en: "Education", ja: "教育" }, fields: [
    { id: "education.universities", label: { en: "Universities", ja: "大学" }, kind: "institutions", get: (c) => c.profile.education.universities, compare: true },
    { id: "education.languageSchools", label: { en: "Language schools", ja: "語学学校" }, kind: "institutions", get: (c) => c.profile.education.languageSchools },
    { id: "education.tuition", label: { en: "Tuition fees", ja: "授業料" }, kind: "text", get: (c) => c.profile.education.tuition, compare: true },
  ] },
  { id: "transport", label: { en: "Transport", ja: "交通" }, fields: [
    { id: "transport.modes", label: { en: "Main transport", ja: "主な交通機関" }, kind: "text", get: (c) => c.profile.transport.modes, compare: true },
    { id: "transport.studentDiscount", label: { en: "Student discounts", ja: "学生向け割引" }, kind: "text", get: (c) => c.profile.transport.studentDiscount, compare: true },
  ] },
  { id: "visa", label: { en: "Visa", ja: "ビザ" }, fields: [
    { id: "visa.official", label: { en: "Official information", ja: "公式情報" }, kind: "text", get: (c) => visaOf(c).official },
    { id: "visa.notes", label: { en: "Points to note", ja: "注意点" }, kind: "text", get: (c) => visaOf(c).notes },
  ] },
  { id: "living", label: { en: "Daily life", ja: "生活" }, fields: [
    { id: "living.studentLife", label: { en: "Student life", ja: "学生生活" }, kind: "text", get: (c) => c.profile.living.studentLife, compare: true },
    { id: "living.healthcare", label: { en: "Healthcare", ja: "医療" }, kind: "text", get: (c) => c.profile.living.healthcare },
    { id: "living.sim", label: { en: "SIM / mobile", ja: "SIM・携帯" }, kind: "text", get: (c) => c.profile.living.sim },
    { id: "living.banking", label: { en: "Banking", ja: "銀行" }, kind: "text", get: (c) => c.profile.living.banking },
    { id: "living.studentFacilities", label: { en: "Student facilities", ja: "学生向け施設" }, kind: "text", get: (c) => c.profile.living.studentFacilities },
  ] },
];

export const allFields = sections.flatMap((s) => s.fields);
/** Count of facts per status for a city (used for the "data status" summary). */
export const statusSummary = (c: City) => allFields.reduce<Record<string, number>>((acc, f) => { const s = f.get(c).status; acc[s] = (acc[s] ?? 0) + 1; return acc; }, {});
