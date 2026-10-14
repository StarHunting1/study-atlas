import type { FxProvider, FxRate } from "./fx";
import { convert } from "./fx";
import type { Profile } from "./profile";
/*
 * Study cost planner (Ver.1.6). Pure functions only (no React), so every rule is testable.
 *
 * Rules (also shown to the user next to each result):
 *  - An item that has not been set is "unset": it is NOT counted and NOT treated as 0. Setting 0 is an explicit "costs nothing".
 *  - Weeks ↔ months: 1 month = 52/12 weeks (≈ 4.33). A stay entered in months becomes weeks × 52/12.
 *  - Quantity of a rate: per week × billed weeks · per month × billed months (billed weeks ÷ 52/12) ·
 *    per term × whole terms (billed weeks ÷ term length, rounded up) · per year × whole years (billed weeks ÷ 52, rounded up) · once × 1.
 *  - Billed weeks = the item's own coverage (course length, housing contract) or, when not given, the stay.
 *  - Each item keeps its own currency. Totals in the display currency add only items in that currency or with a manual rate;
 *    anything else is listed separately and never summed with other currencies.
 */
export const WEEKS_PER_MONTH = 52 / 12;
export const CURRENCIES = ["GBP", "CAD", "JPY"] as const;
export type Ccy = (typeof CURRENCIES)[number];
export const CITIES = ["manchester", "vancouver"] as const;
export type CityId = (typeof CITIES)[number];
export const CITY_CCY: Record<CityId, Ccy> = { manchester: "GBP", vancouver: "CAD" };
export const STUDY_TYPES = ["language", "university"] as const;
export type StudyType = (typeof STUDY_TYPES)[number];
export const HOUSING_TYPES = ["dorm", "homestay", "share", "other"] as const;
export type HousingType = (typeof HOUSING_TYPES)[number];
export const PERS = ["week", "month", "term", "once", "year"] as const;
export type Per = (typeof PERS)[number];

export const RECURRING = ["tuition", "housing", "food", "transport", "phone", "leisure", "otherLiving"] as const;
export const ONE_OFF = ["flights", "registration", "materials", "visa", "insurance", "otherInitial"] as const;
export const ITEM_IDS = [...RECURRING, ...ONE_OFF] as const;
export type ItemId = (typeof ITEM_IDS)[number];
export const isOneOff = (id: ItemId) => (ONE_OFF as readonly string[]).includes(id);
/** Items whose cost depends on how long the stay is (tuition and housing can follow their own course/contract length). */
export const hasCoverage = (id: ItemId) => id === "tuition" || id === "housing";

/** Where a value came from: an official (verified) figure picked by the user, or the user's own number. */
export type Source = { kind: "user" } | { kind: "official"; ref: string; label: string; url?: string; validFor?: string };
export type Input = { value: number | null; currency: Ccy; per: Per; /** weeks billed (course length / housing contract); null = same as the stay */ coverageWeeks: number | null; source: Source };
export type Rate = { rate: number; date: string }; // 1 unit of the currency = rate × display currency
export type Plan = {
  id: string; name: string; cityId: CityId; studyType: StudyType; housingType: HousingType;
  duration: { value: number; unit: "weeks" | "months" };
  /** Length of one term in weeks (for "per term" prices) */
  termWeeks: number;
  goal: { amount: number | null; currency: Ccy };
  displayCurrency: Ccy;
  items: Record<ItemId, Input>;
  rates: Partial<Record<Ccy, Rate>>;
  updatedAt: string;
  fromProfile?: boolean;
};

const newId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const defaultPer = (id: ItemId): Per => (isOneOff(id) ? "once" : id === "tuition" || id === "housing" ? "week" : "month");
export const defaultCurrency = (id: ItemId, city: CityId): Ccy => (id === "flights" ? "JPY" : CITY_CCY[city]);

export function newPlan(o: Partial<Pick<Plan, "name" | "cityId" | "studyType" | "housingType" | "displayCurrency" | "duration" | "goal">> & { now?: string } = {}): Plan {
  const cityId = o.cityId ?? "manchester";
  return {
    id: newId(), name: o.name ?? "", cityId, studyType: o.studyType ?? "university", housingType: o.housingType ?? "dorm",
    duration: o.duration ?? { value: 12, unit: "weeks" }, termWeeks: 12, goal: o.goal ?? { amount: null, currency: o.displayCurrency ?? CITY_CCY[cityId] },
    displayCurrency: o.displayCurrency ?? CITY_CCY[cityId], rates: {}, updatedAt: o.now ?? new Date().toISOString(),
    items: Object.fromEntries(ITEM_IDS.map((id) => [id, { value: null, currency: defaultCurrency(id, cityId), per: defaultPer(id), coverageWeeks: null, source: { kind: "user" } }])) as Record<ItemId, Input>,
  };
}

/** Start a plan from the saved "My Study Profile" (destination, study type, duration, budget, display currency). */
export function planFromProfile(p: Profile, now?: string): Plan {
  const cityId = (CITIES as readonly string[]).includes(p.destCity) ? (p.destCity as CityId) : "manchester";
  const ccy = (c: string): Ccy | undefined => (CURRENCIES as readonly string[]).includes(c) ? (c as Ccy) : undefined;
  const display = ccy(p.currency) ?? CITY_CCY[cityId];
  // years → months (×12); weeks and months are kept as entered
  const dv = p.duration.value; const duration: Plan["duration"] = dv && dv > 0 ? (p.duration.unit === "weeks" ? { value: Math.min(104, dv), unit: "weeks" } : { value: Math.min(24, p.duration.unit === "years" ? dv * 12 : dv), unit: "months" }) : { value: 12, unit: "weeks" };
  const plan = newPlan({ cityId, studyType: (p.studyType || undefined) as StudyType | undefined, displayCurrency: display, duration, now,
    goal: { amount: p.budget.amount, currency: ccy(p.budget.currency) ?? display } });
  plan.fromProfile = true; return plan;
}

export const stayWeeks = (p: Pick<Plan, "duration">) => (p.duration.unit === "weeks" ? p.duration.value : p.duration.value * WEEKS_PER_MONTH);
export const weeksToMonths = (w: number) => w / WEEKS_PER_MONTH;

/** How many billing units a rate is multiplied by (see rules above). */
export function quantity(per: Per, weeks: number, termWeeks: number): number {
  const eps = 1e-9;
  switch (per) {
    case "week": return weeks;
    case "month": return weeks / WEEKS_PER_MONTH;
    case "term": return Math.max(1, Math.ceil(weeks / Math.max(1, termWeeks) - eps));
    case "year": return Math.max(1, Math.ceil(weeks / 52 - eps));
    case "once": return 1;
  }
}

export type Warn = "coverageShorter" | "coverageLonger";
export type ItemCalc =
  | { state: "unset"; currency: Ccy }
  | { state: "ok"; currency: Ccy; rate: number; per: Per; qty: number; weeks: number | null; total: number; source: "official" | "user"; warn?: Warn; gapWeeks?: number };

export function calcItem(plan: Plan, id: ItemId): ItemCalc {
  const it = plan.items[id];
  if (it.value === null || !Number.isFinite(it.value)) return { state: "unset", currency: it.currency };
  const stay = stayWeeks(plan); const timeBased = it.per !== "once";
  const weeks = timeBased ? (hasCoverage(id) && it.coverageWeeks ? it.coverageWeeks : stay) : null;
  const qty = quantity(it.per, weeks ?? stay, plan.termWeeks);
  const base = { state: "ok" as const, currency: it.currency, rate: it.value, per: it.per, qty, weeks, total: it.value * qty, source: it.source.kind };
  if (timeBased && hasCoverage(id) && it.coverageWeeks && Math.abs(it.coverageWeeks - stay) > 1e-6)
    return { ...base, warn: it.coverageWeeks < stay ? "coverageShorter" : "coverageLonger", gapWeeks: Math.abs(stay - it.coverageWeeks) };
  return base;
}

/** Manual exchange rates as an FxProvider (a future rate API implements the same interface). */
export function manualFx(plan: Plan): FxProvider {
  return { rate: (from, to): FxRate | undefined => { const r = plan.rates[from as Ccy]; return to === plan.displayCurrency && r && r.rate > 0 ? { from, to, rate: r.rate, date: r.date, publisher: "Manual (entered by the user)", url: "" } : undefined; } };
}

export const GROUPS = ["tuition", "housing", "food", "transport", "phone", "leisure", "otherLiving", "initial"] as const;
export type GroupId = (typeof GROUPS)[number];
export const groupOf = (id: ItemId): GroupId => (isOneOff(id) ? "initial" : (id as GroupId));
export type ByCcy = Partial<Record<Ccy, number>>;
export type Money = { byCurrency: ByCcy; /** sum in the display currency, only of items that are in it or have a manual rate */ converted: number; /** items that could not be converted (no rate) */ unconverted: ByCcy };

export type PlanCalc = {
  weeks: number; months: number; items: Record<ItemId, ItemCalc>;
  groups: Record<GroupId, Money>; total: Money; living: Money; monthlyLiving: { converted: number; byCurrency: ByCcy } | null;
  complete: boolean; unset: ItemId[]; missingRates: Ccy[]; usedRates: FxRate[];
  goal: { amount: number; currency: Ccy; diff: number | null; state: "under" | "over" | "equal" | "noRate" } | null;
  sources: { official: number; user: number; unset: number };
};

const add = (m: ByCcy, c: Ccy, v: number) => { m[c] = (m[c] ?? 0) + v; };
const emptyMoney = (): Money => ({ byCurrency: {}, converted: 0, unconverted: {} });

/** Sum of some items' totals (e.g. "other start-up costs"), kept per currency and converted only with a manual rate. */
export function moneyOf(plan: Plan, calc: PlanCalc, ids: readonly ItemId[]): Money {
  const fx = manualFx(plan); const m = emptyMoney();
  for (const id of ids) {
    const r = calc.items[id]; if (r.state !== "ok") continue; add(m.byCurrency, r.currency, r.total);
    const c = convert(r.total, r.currency, plan.displayCurrency, fx); if (c) m.converted += c.amount; else add(m.unconverted, r.currency, r.total);
  }
  return m;
}

export function calcPlan(plan: Plan): PlanCalc {
  const items = Object.fromEntries(ITEM_IDS.map((id) => [id, calcItem(plan, id)])) as Record<ItemId, ItemCalc>;
  const fx = manualFx(plan); const used = new Map<string, FxRate>(); const missing = new Set<Ccy>();
  const groups = Object.fromEntries(GROUPS.map((g) => [g, emptyMoney()])) as Record<GroupId, Money>;
  const total = emptyMoney(); const living = emptyMoney();
  const put = (m: Money, c: Ccy, v: number) => {
    add(m.byCurrency, c, v);
    const r = convert(v, c, plan.displayCurrency, fx);
    if (r) { m.converted += r.amount; if (r.rate) used.set(c, r.rate); } else { add(m.unconverted, c, v); missing.add(c); }
  };
  for (const id of ITEM_IDS) { const r = items[id]; if (r.state !== "ok") continue; put(groups[groupOf(id)], r.currency, r.total); put(total, r.currency, r.total); if (!isOneOff(id) && id !== "tuition") put(living, r.currency, r.total); }
  const unset = ITEM_IDS.filter((id) => items[id].state === "unset");
  const months = weeksToMonths(stayWeeks(plan));
  // Monthly living cost = (housing + food + transport + phone + leisure + other living over the stay) ÷ stay months; items not set are not included.
  const monthlyLiving = months > 0 && Object.keys(living.byCurrency).length ? { converted: living.converted / months, byCurrency: Object.fromEntries(Object.entries(living.byCurrency).map(([c, v]) => [c, v! / months])) as ByCcy } : null;
  let goal: PlanCalc["goal"] = null;
  if (plan.goal.amount !== null && plan.goal.amount > 0) {
    const g = plan.goal; const only = Object.keys(total.byCurrency) as Ccy[];
    // The comparison is made in the goal's currency: the plan total must be expressible in it (own currency, or the display currency when the goal is in it)
    const same = only.length === 0 || (only.length === 1 && only[0] === g.currency);
    const inDisplay = g.currency === plan.displayCurrency && Object.keys(total.unconverted).length === 0;
    const spent = same ? (total.byCurrency[g.currency] ?? 0) : inDisplay ? total.converted : null;
    goal = { amount: g.amount!, currency: g.currency, diff: spent === null ? null : g.amount! - spent, state: spent === null ? "noRate" : Math.abs(g.amount! - spent) < 0.005 ? "equal" : spent > g.amount! ? "over" : "under" };
  }
  const n = { official: 0, user: 0, unset: unset.length };
  for (const id of ITEM_IDS) { const r = items[id]; if (r.state === "ok") n[r.source]++; }
  return { weeks: stayWeeks(plan), months, items, groups, total, living, monthlyLiving, complete: unset.length === 0, unset, missingRates: [...missing], usedRates: [...used.values()], goal, sources: n };
}

/* ---------- Slider ranges ---------- */
/** UI scale only (slider ranges for amounts in other currencies). NOT an exchange rate and never used for conversion. */
const UI_SCALE: Record<Ccy, number> = { GBP: 1, CAD: 2, JPY: 200 };
const BASE: Record<ItemId, Partial<Record<Per, [number, number]>>> = { // [max, step] in GBP-scale units
  tuition: { week: [600, 10], month: [2400, 50], term: [6000, 100], year: [25000, 500], once: [20000, 250] },
  housing: { week: [400, 5], month: [1800, 25], term: [4800, 100], year: [15000, 250], once: [15000, 250] },
  food: { week: [120, 2], month: [500, 10], term: [1500, 25], year: [6000, 100], once: [5000, 100] },
  transport: { week: [40, 1], month: [160, 5], term: [500, 10], year: [1800, 25], once: [2000, 25] },
  phone: { week: [15, 1], month: [60, 1], term: [200, 5], year: [700, 10], once: [600, 10] },
  leisure: { week: [100, 2], month: [400, 10], term: [1200, 25], year: [4800, 100], once: [4000, 50] },
  otherLiving: { week: [100, 2], month: [400, 10], term: [1200, 25], year: [4800, 100], once: [4000, 50] },
  flights: { once: [3000, 50] }, registration: { once: [600, 10] }, materials: { once: [800, 10] }, visa: { once: [1500, 25] }, insurance: { once: [2500, 25] }, otherInitial: { once: [3000, 50] },
};
/** 1, 2, 2.5, 5 × 10^n */
export function niceNumber(x: number): number {
  if (!(x > 0)) return 1; const e = Math.pow(10, Math.floor(Math.log10(x))); const f = x / e;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
}
export type Range = { min: number; max: number; step: number; fine: number };
export function rangeFor(id: ItemId, per: Per, ccy: Ccy): Range {
  const [max, step] = BASE[id][per] ?? BASE[id].once ?? BASE[id].month ?? [1000, 10];
  const s = UI_SCALE[ccy]; const m = niceNumber(max * s); const st = Math.max(1, niceNumber(step * s));
  const fine = ccy === "JPY" ? Math.min(st, 100) : 1; // ± buttons: 1 pound/dollar, 100 yen
  return { min: 0, max: m, step: st, fine };
}
export const clampTo = (v: number, r: Range) => Math.min(r.max, Math.max(r.min, v));
/** Slider position for a value: values above the range extend it so a typed amount is never cut off. */
export const rangeWith = (r: Range, v: number | null): Range => (v !== null && v > r.max ? { ...r, max: Math.ceil(v / r.step) * r.step } : r);

/** Duration slider: weeks 1–104 or months 1–24. */
export const durationRange = (unit: "weeks" | "months") => (unit === "weeks" ? { min: 1, max: 104, step: 1 } : { min: 1, max: 24, step: 1 });
export const goalRange = (c: Ccy) => ({ min: 0, max: c === "JPY" ? 10_000_000 : c === "CAD" ? 50_000 : 25_000, step: c === "JPY" ? 50_000 : c === "CAD" ? 500 : 250 });

/* ---------- Plan edits (immutable) ---------- */
export const touch = (p: Plan, now = new Date().toISOString()): Plan => ({ ...p, updatedAt: now });
export function setValue(p: Plan, id: ItemId, value: number | null, source: Source = { kind: "user" }): Plan {
  const it = p.items[id]; if (value !== null && (!Number.isFinite(value) || value < 0)) return p;
  // Changing an official value by hand makes it the user's own number
  return touch({ ...p, items: { ...p.items, [id]: { ...it, value, source: value === null ? { kind: "user" } : source } } });
}
export function setItem(p: Plan, id: ItemId, patch: Partial<Input>): Plan {
  return touch({ ...p, items: { ...p.items, [id]: { ...p.items[id], ...patch, source: patch.source ?? (patch.value !== undefined ? { kind: "user" } : p.items[id].source) } } });
}
/** Changing the unit or currency of an official value keeps no official label: the number no longer means what the source says. */
export function changeUnit(p: Plan, id: ItemId, per: Per): Plan { const it = p.items[id]; return touch({ ...p, items: { ...p.items, [id]: { ...it, per, source: it.source.kind === "official" && it.per !== per ? { kind: "user" } : it.source } } }); }
export function changeCurrency(p: Plan, id: ItemId, currency: Ccy): Plan { const it = p.items[id]; return touch({ ...p, items: { ...p.items, [id]: { ...it, currency, value: it.source.kind === "official" && it.currency !== currency ? null : it.value, source: it.source.kind === "official" && it.currency !== currency ? { kind: "user" } : it.source } } }); }
/** A different city starts item currencies over; values that came from the old city's official data are cleared. */
export function changeCity(p: Plan, cityId: CityId): Plan {
  if (p.cityId === cityId) return p;
  const items = { ...p.items };
  for (const id of ITEM_IDS) { const it = items[id]; items[id] = { ...it, currency: it.currency === CITY_CCY[p.cityId] ? CITY_CCY[cityId] : it.currency, ...(it.source.kind === "official" ? { value: null, source: { kind: "user" } as Source, coverageWeeks: null } : {}) }; }
  return touch({ ...p, cityId, items, ...(p.goal.currency === CITY_CCY[p.cityId] && p.goal.amount === null ? { goal: { ...p.goal, currency: CITY_CCY[cityId] } } : {}) });
}
export const setRate = (p: Plan, c: Ccy, rate: number | null, date: string): Plan => {
  const rates = { ...p.rates }; if (rate && rate > 0) rates[c] = { rate, date }; else delete rates[c];
  return touch({ ...p, rates });
};
/** Setting the display currency never rewrites item values or rates; only how the total is expressed. */
export const setDisplayCurrency = (p: Plan, c: Ccy): Plan => touch({ ...p, displayCurrency: c, rates: Object.fromEntries(Object.entries(p.rates).filter(([k]) => k !== c)) as Plan["rates"] });

/* ---------- Validation of stored data ---------- */
const num = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? x : null);
const oneOf = <T extends string>(list: readonly T[], x: unknown, d: T): T => ((list as readonly string[]).includes(x as string) ? (x as T) : d);
export function cleanPlan(v: unknown): Plan | undefined {
  if (!v || typeof v !== "object") return undefined; const p = v as Partial<Plan>;
  const cityId = oneOf(CITIES, p.cityId, "manchester"); const dc = oneOf(CURRENCIES, p.displayCurrency, CITY_CCY[cityId]);
  const dur = p.duration && typeof p.duration === "object" ? p.duration : { value: 12, unit: "weeks" as const };
  const unit = dur.unit === "months" ? "months" : "weeks"; const r = durationRange(unit);
  const base = newPlan({ cityId, displayCurrency: dc });
  const plan: Plan = {
    ...base, id: typeof p.id === "string" && p.id ? p.id : base.id, name: typeof p.name === "string" ? p.name.slice(0, 60) : "",
    studyType: oneOf(STUDY_TYPES, p.studyType, "university"), housingType: oneOf(HOUSING_TYPES, p.housingType, "dorm"),
    duration: { unit, value: Math.min(r.max, Math.max(r.min, num(dur.value) ?? 12)) }, termWeeks: Math.min(52, Math.max(1, num(p.termWeeks) ?? 12)),
    goal: { amount: num(p.goal?.amount) !== null && num(p.goal?.amount)! >= 0 ? num(p.goal?.amount) : null, currency: oneOf(CURRENCIES, p.goal?.currency, dc) },
    updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : base.updatedAt, fromProfile: p.fromProfile === true ? true : undefined,
  };
  for (const id of ITEM_IDS) {
    const it = (p.items as Record<string, Partial<Input>> | undefined)?.[id]; if (!it || typeof it !== "object") continue;
    const val = num(it.value); const src = it.source as Source | undefined;
    plan.items[id] = {
      value: val !== null && val >= 0 ? val : null, currency: oneOf(CURRENCIES, it.currency, plan.items[id].currency), per: oneOf(PERS, it.per, plan.items[id].per),
      coverageWeeks: (num(it.coverageWeeks) ?? 0) > 0 ? num(it.coverageWeeks) : null,
      source: src && src.kind === "official" && typeof src.ref === "string" && typeof src.label === "string" ? { kind: "official", ref: src.ref.slice(0, 120), label: src.label.slice(0, 160), url: typeof src.url === "string" && /^https:\/\//.test(src.url) ? src.url : undefined, validFor: typeof src.validFor === "string" ? src.validFor.slice(0, 160) : undefined } : { kind: "user" },
    };
    if (plan.items[id].value === null) plan.items[id].source = { kind: "user" };
  }
  for (const c of CURRENCIES) { const r = (p.rates as Plan["rates"] | undefined)?.[c]; if (r && num(r.rate)! > 0 && c !== dc) plan.rates[c] = { rate: r.rate, date: typeof r.date === "string" ? r.date : "" }; }
  return plan;
}

/* ---------- Plan list (what is saved in the browser) ---------- */
export type Store = { version: 1; activeId: string | null; plans: Plan[]; compare: [string | null, string | null] };
export const PLANS_KEY = "studyatlas.planner.v1";
export const emptyStore = (): Store => ({ version: 1, activeId: null, plans: [], compare: [null, null] });
export function cleanStore(v: unknown): Store | undefined {
  if (!v || typeof v !== "object") return undefined; const s = v as Partial<Store>;
  const plans = (Array.isArray(s.plans) ? s.plans : []).map(cleanPlan).filter((p): p is Plan => !!p).slice(0, 30);
  const ids = new Set(plans.map((p) => p.id)); const pick = (x: unknown) => (typeof x === "string" && ids.has(x) ? x : null);
  return { version: 1, plans, activeId: pick(s.activeId) ?? plans[0]?.id ?? null, compare: [pick(s.compare?.[0]), pick(s.compare?.[1])] };
}
export const activePlan = (s: Store) => s.plans.find((p) => p.id === s.activeId);
export const addPlan = (s: Store, p: Plan): Store => ({ ...s, plans: [...s.plans, p].slice(-30), activeId: p.id });
export const updatePlan = (s: Store, p: Plan): Store => ({ ...s, plans: s.plans.map((x) => (x.id === p.id ? p : x)) });
export const renamePlan = (s: Store, id: string, name: string): Store => ({ ...s, plans: s.plans.map((x) => (x.id === id ? { ...x, name: name.slice(0, 60) } : x)) });
export const duplicatePlan = (s: Store, id: string, name: string): Store => { const p = s.plans.find((x) => x.id === id); return p ? addPlan(s, { ...JSON.parse(JSON.stringify(p)), id: newId(), name }) : s; };
/** Add a copy of a plan made elsewhere (e.g. a Smart planner plan) as a new editable plan. */
export const importPlan = (s: Store, p: Plan): Store => addPlan(s, { ...JSON.parse(JSON.stringify(p)), id: newId(), updatedAt: new Date().toISOString() });
export function deletePlan(s: Store, id: string): Store {
  const plans = s.plans.filter((x) => x.id !== id); const pick = (x: string | null) => (x && plans.some((p) => p.id === x) ? x : null);
  return { ...s, plans, activeId: pick(s.activeId) ?? plans[plans.length - 1]?.id ?? null, compare: [pick(s.compare[0]), pick(s.compare[1])] };
}
