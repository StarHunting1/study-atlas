import type { Status } from "@/data/schema";
import type { Fact } from "@/data/schema";
import { getSchool, isLanguage, type Price } from "@/data/schools";
import { totalFor, type Period } from "./money";
/*
 * Study-abroad budget model. Pure functions only (no React), so the maths is easy to test.
 * - An item left empty is "missing", never treated as 0. Typing 0 is an explicit "costs nothing".
 * - Each item keeps its own currency. Converting to the display currency needs a manual rate with the date it was entered.
 * - An item can be linked to a school fee. Its amount is then read from the school data every time,
 *   so when official (verified) fees are registered later the simulator picks them up automatically.
 */
export const ITEM_IDS = ["tuition", "registration", "materials", "housing", "food", "transport", "phone", "flights", "insurance", "visa", "contingency"] as const;
export type ItemId = (typeof ITEM_IDS)[number];
export type SchoolLink = { schoolId: string; optionId: string; field: "tuition" | "registrationFee" | "materialsFee" | "tuitionInternational" };
export type Item = { amount: number | null; currency: string; per: Period | "percent"; link?: SchoolLink };
export type Rate = { rate: number; date: string }; // 1 unit of the currency = rate × display currency
export type Plan = { weeks: number | null; displayCurrency: string; items: Record<ItemId, Item>; rates: Record<string, Rate> };

export const newPlan = (displayCurrency = "JPY", weeks: number | null = null): Plan => ({
  weeks, displayCurrency, rates: {},
  items: Object.fromEntries(ITEM_IDS.map((id) => [id, { amount: null, currency: displayCurrency, per: id === "contingency" ? "percent" : "once" }])) as Record<ItemId, Item>,
});

/** Map a school price unit onto the simulator's periods. "term"/"course" cannot be spread per week, so they count once. */
const unitToPer = (u: Price["unit"]): Period => (u === "week" ? "week" : u === "month" ? "month" : u === "year" ? "year" : "once");

/** The school fee behind a link, read live from school data. */
export function linkedFact(link: SchoolLink): Fact<Price> | undefined {
  const s = getSchool(link.schoolId); if (!s) return undefined;
  if (isLanguage(s)) { const c = s.courses.find((x) => x.id === link.optionId); return c && link.field !== "tuitionInternational" ? c[link.field] : undefined; }
  const p = s.programs.find((x) => x.id === link.optionId); return p && link.field === "tuitionInternational" ? p.tuitionInternational : undefined;
}

export type ItemResult =
  | { state: "missing" | "noWeeks" | "pendingSource" | "noRate"; currency: string; sourceStatus?: Status; termOrCourse?: boolean }
  | { state: "ok"; original: number; currency: string; converted: number; sourceStatus?: Status; termOrCourse?: boolean };
export type PlanResult = { items: Record<ItemId, ItemResult>; subtotal: number; total: number; complete: boolean; missing: ItemId[]; usedRates: string[] };

/** Effective amount/currency/period of an item: from the linked school fee when linked, else the manual input. */
export function effective(item: Item): { amount: number | null; currency: string; per: Period | "percent"; status?: Status; termOrCourse?: boolean } {
  if (!item.link) return { amount: item.amount, currency: item.currency, per: item.per };
  const f = linkedFact(item.link);
  // Only verified (official) or explicitly fictional sample fees are used; unverified prices count as "data coming soon".
  if (!f || !f.value || (f.status !== "verified" && f.status !== "sample")) return { amount: null, currency: item.currency, per: item.per, status: f?.status ?? "pending" };
  return { amount: f.value.amount, currency: f.value.currency, per: unitToPer(f.value.unit), status: f.status, termOrCourse: f.value.unit === "term" || f.value.unit === "course" };
}

export function calculate(plan: Plan): PlanResult {
  const items = {} as Record<ItemId, ItemResult>; const usedRates = new Set<string>(); let subtotal = 0;
  const convert = (amount: number, currency: string): number | null => {
    if (currency === plan.displayCurrency) return amount;
    const r = plan.rates[currency]; if (!r || !(r.rate > 0)) return null;
    usedRates.add(currency); return amount * r.rate;
  };
  for (const id of ITEM_IDS) {
    if (id === "contingency") continue;
    const e = effective(plan.items[id]); const meta = { currency: e.currency, sourceStatus: e.status, termOrCourse: e.termOrCourse };
    if (e.amount === null) { items[id] = { state: plan.items[id].link ? "pendingSource" : "missing", ...meta }; continue; }
    const original = totalFor(e.amount, e.per as Period, plan.weeks);
    if (original === null) { items[id] = { state: "noWeeks", ...meta }; continue; }
    const converted = convert(original, e.currency);
    if (converted === null) { items[id] = { state: "noRate", ...meta }; continue; }
    items[id] = { state: "ok", original, converted, ...meta }; subtotal += converted;
  }
  // Contingency: a percentage of the other items, or a fixed amount.
  const c = plan.items.contingency;
  if (c.amount === null) items.contingency = { state: "missing", currency: plan.displayCurrency };
  else if (c.per === "percent") { const v = (subtotal * c.amount) / 100; items.contingency = { state: "ok", original: v, converted: v, currency: plan.displayCurrency }; }
  else {
    const original = totalFor(c.amount, c.per, plan.weeks); const converted = original === null ? null : convert(original, c.currency);
    items.contingency = original === null ? { state: "noWeeks", currency: c.currency } : converted === null ? { state: "noRate", currency: c.currency } : { state: "ok", original, converted, currency: c.currency };
  }
  const missing = ITEM_IDS.filter((id) => items[id].state !== "ok");
  const total = subtotal + (items.contingency.state === "ok" ? items.contingency.converted : 0);
  return { items, subtotal, total, complete: missing.length === 0, missing, usedRates: [...usedRates] };
}

/** Validate plans loaded from localStorage (older shapes, hand edits). */
export function cleanPlan(v: unknown): Plan | undefined {
  if (!v || typeof v !== "object") return undefined; const p = v as Partial<Plan>;
  if (typeof p.displayCurrency !== "string" || !p.items) return undefined;
  const base = newPlan(p.displayCurrency, typeof p.weeks === "number" ? p.weeks : null);
  for (const id of ITEM_IDS) { const it = (p.items as Record<string, Item>)[id]; if (it && typeof it.currency === "string") base.items[id] = { ...base.items[id], ...it, amount: typeof it.amount === "number" ? it.amount : null }; }
  base.rates = p.rates && typeof p.rates === "object" ? p.rates : {};
  return base;
}
