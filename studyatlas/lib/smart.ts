import { applyCandidate, candidatesFor, cityCandidates, type Candidate } from "@/data/official/planner";
import { DESTINATIONS } from "@/data/airports";
import type { TripType } from "./flights";
import { CITY_CCY, CURRENCIES, HOUSING_TYPES, ITEM_IDS, STUDY_TYPES, calcItem, calcPlan, cleanPlan, moneyOf, newPlan, setItem, setRate, stayWeeks, touch, type Ccy, type CityId, type HousingType, type ItemId, type Money, type Plan, type PlanCalc, type StudyType } from "./planner";
/*
 * Smart planner (Ver.1.7): turns a handful of choices (route, study type, duration, month, budget, housing) into three plans.
 * Deterministic and rule based: every number in a generated plan is (a) a verified official figure or school fee that passed the
 * eligibility and contract checks, (b) an assumption the user typed, or (c) missing. A missing item is never counted as 0 and
 * no price is invented. The result carries structured reasons (codes, not prose) so an AI could later write the explanation
 * from the same facts; the UI renders them in Japanese or English.
 */
export const TIERS = ["budget", "balanced", "comfort"] as const;
export type Tier = (typeof TIERS)[number];
/** Items a verdict "within budget" needs. If one is missing the plan is provisional and no verdict is given. */
export const MAIN_ITEMS: readonly ItemId[] = ["tuition", "housing", "food", "transport", "flights", "visa", "insurance"];
const LEVEL_ITEMS: readonly ItemId[] = ["tuition", "housing", "food", "transport", "phone", "leisure", "registration", "materials"];
/** Items the user may give as an assumption in Easy mode (all optional). */
export const ASSUME_ITEMS = ["tuition", "visa", "insurance"] as const;

export type Easy = {
  origin: { country: string; airport: string; custom: string };
  cityId: CityId; studyType: StudyType; duration: Plan["duration"]; month: number | null;
  budget: { amount: number; currency: Ccy }; housing: HousingType | null; trip: TripType;
  /** manual exchange rates: 1 unit of the currency = rate × budget currency (the user enters them; no rate API is connected) */
  rates: Plan["rates"];
  assume: { tuitionWeek: number | null; visa: number | null; insurance: number | null; flight: { round: number | null; oneway: number | null };
    /** housing the user enters themselves (Ver.1.2.9): an amount per week or per month; absent in older saved data = not entered */ housing?: { amount: number | null; per: "week" | "month" } };
};
export const defaultBudget = (c: Ccy) => (c === "JPY" ? 2_000_000 : c === "CAD" ? 15_000 : 10_000);
export function defaultEasy(o: Partial<Pick<Easy, "cityId" | "studyType" | "duration" | "budget">> = {}): Easy {
  const cityId = o.cityId ?? "manchester";
  return { origin: { country: "JP", airport: "HND", custom: "" }, cityId, studyType: o.studyType ?? "language", duration: o.duration ?? { value: 12, unit: "weeks" }, month: null,
    budget: o.budget ?? { amount: defaultBudget(CITY_CCY[cityId]), currency: CITY_CCY[cityId] }, housing: null, trip: "round", rates: {},
    assume: { tuitionWeek: null, visa: null, insurance: null, flight: { round: null, oneway: null } } };
}
export const originCode = (e: Easy) => (e.origin.airport === "OTHER" ? e.origin.custom.toUpperCase() : e.origin.airport);
export const destCode = (cityId: CityId) => DESTINATIONS[cityId].code;
export const flightPrice = (e: Easy) => e.assume.flight[e.trip];

export type Why = "askUser" | "noVerified" | "ineligible" | "contract";
export type ItemPick = { status: "official" | "assumption" | "unset"; why?: Why; cand?: Candidate };
export type Excluded = { itemId: ItemId; kind: "eligibility" | "contract" | "scope"; cand: Candidate };
export type NoteCode = "adjusted" | "cannotFit" | "noRate" | "fewFigures" | "flightMissing";
export type Note = { code: NoteCode; itemId?: ItemId; items?: ItemId[] };
export type Verdict = "within" | "over" | "overAlready" | "undetermined" | "needsRate";
export type Suggestion =
  | { kind: "duration"; weeks: number; saving: number | null } | { kind: "durationNotEnough" }
  | { kind: "housing"; housing: HousingType; saving: number };

export type SmartPlan = {
  tier: Tier; plan: Plan; calc: PlanCalc; picks: Record<ItemId, ItemPick>; excluded: Excluded[]; notes: Note[];
  verdict: Verdict; /** budget − counted costs, in the budget currency; null when it cannot be expressed */ remaining: number | null;
  mainMissing: ItemId[]; setCount: number; provisional: boolean; suggestions: Suggestion[];
  /** convenient sums for the card */ initialOther: Money; flights: Money;
};

type Opt = { cand: Candidate; total: number };
const PICK = (n: number, tier: Tier) => (tier === "budget" ? 0 : tier === "comfort" ? n - 1 : Math.floor((n - 1) / 2));
const stayOk = (c: Candidate, weeks: number) => c.coverageWeeks === undefined || Math.abs(c.coverageWeeks - weeks) <= 2;

/** Candidates for one item that pass the eligibility and contract checks, cheapest first (by total over the stay). */
function optionsFor(base: Plan, itemId: ItemId, easy: Easy, excluded: Excluded[], opts: { allowSample?: boolean }): Opt[] {
  const weeks = stayWeeks(base); const seen = new Set<string>(); const all: Candidate[] = [];
  const types: HousingType[] = itemId === "housing" ? (easy.housing ? [easy.housing] : [...HOUSING_TYPES]) : [base.housingType];
  for (const ht of types) for (const c of candidatesFor(base.cityId, itemId, { studyType: base.studyType, housingType: ht, allowSample: opts.allowSample })) { if (!seen.has(c.id)) { seen.add(c.id); all.push(c); } }
  const out: Opt[] = [];
  for (const c of all) {
    if (!c.auto) { excluded.push({ itemId, kind: "scope", cand: c }); continue; }
    if (!c.eligible) { excluded.push({ itemId, kind: "eligibility", cand: c }); continue; }
    if (!stayOk(c, weeks)) { excluded.push({ itemId, kind: "contract", cand: c }); continue; }
    const t = calcItem(applyCandidate(base, c), itemId); if (t.state === "ok") out.push({ cand: c, total: t.total });
  }
  // same-currency comparison only (all city figures share the city currency); otherwise keep the published order
  const cur = out[0]?.cand.currency; return out.every((o) => o.cand.currency === cur) ? out.sort((a, b) => a.total - b.total) : out;
}
const dedupe = (o: Opt[]) => o.filter((x, i) => o.findIndex((y) => y.cand.id === x.cand.id) === i);

function build(easy: Easy, tier: Tier, opts: { now?: string; allowSample?: boolean; noSuggest?: boolean }): SmartPlan {
  const ccy = easy.budget.currency;
  let plan = newPlan({ cityId: easy.cityId, studyType: easy.studyType, housingType: easy.housing ?? "dorm", displayCurrency: ccy, duration: easy.duration, goal: { amount: easy.budget.amount, currency: ccy }, now: opts.now });
  plan = { ...plan, id: `smart-${tier}` }; // generated plans are reproducible; a saved copy gets its own id
  for (const c of CURRENCIES) { const r = easy.rates[c]; if (c !== ccy && r && r.rate > 0) plan = setRate(plan, c, r.rate, r.date); }
  const cityCcy = CITY_CCY[easy.cityId]; const picks = Object.fromEntries(ITEM_IDS.map((id) => [id, { status: "unset", why: "noVerified" } as ItemPick])) as Record<ItemId, ItemPick>;
  const excluded: Excluded[] = []; const notes: Note[] = [];

  // user assumptions (the only source of tuition / visa / insurance / flights today)
  const assume = (id: ItemId, value: number | null, currency: Ccy, per: "week" | "month" | "once") => {
    if (value === null) { picks[id] = { status: "unset", why: "askUser" }; return; }
    plan = setItem(plan, id, { value, currency, per }); picks[id] = { status: "assumption" };
  };
  assume("tuition", easy.assume.tuitionWeek, cityCcy, "week"); assume("visa", easy.assume.visa, cityCcy, "once"); assume("insurance", easy.assume.insurance, cityCcy, "once");
  assume("flights", flightPrice(easy), ccy, "once");
  assume("housing", easy.assume.housing?.amount ?? null, cityCcy, easy.assume.housing?.per ?? "week");

  // verified candidates, one level per tier
  const options: Partial<Record<ItemId, Opt[]>> = {}; const idx: Partial<Record<ItemId, number>> = {};
  for (const id of LEVEL_ITEMS) {
    if (picks[id].status === "assumption") continue; // the user's own number wins over a table value
    const o = dedupe(optionsFor(plan, id, easy, excluded, opts)); options[id] = o;
    if (!o.length) { const ex = excluded.filter((e) => e.itemId === id); picks[id] = { status: "unset", why: ex.some((e) => e.kind === "contract") && !ex.some((e) => e.kind === "eligibility") ? "contract" : ex.length ? "ineligible" : id === "tuition" ? "askUser" : "noVerified" }; continue; }
    idx[id] = PICK(o.length, tier);
  }
  const apply = () => {
    let p = plan;
    for (const id of LEVEL_ITEMS) { const o = options[id]; if (!o?.length) continue; const c = o[idx[id]!].cand; p = applyCandidate(p, c); if (id === "housing" && c.housingType) p = { ...p, housingType: c.housingType }; picks[id] = { status: "official", cand: c }; }
    return p;
  };
  plan = apply();

  // budget-aware: a plan above the budget steps items down one level at a time (largest saving first) while that helps
  const goalOf = (p: Plan) => calcPlan(p).goal;
  if (tier !== "budget" && goalOf(plan)?.state === "over") {
    const lowered: ItemId[] = [];
    for (let guard = 0; guard < 60 && goalOf(plan)?.state === "over"; guard++) {
      let best: { id: ItemId; saving: number } | null = null;
      for (const id of LEVEL_ITEMS) { const o = options[id]; const i = idx[id]; if (!o?.length || !i || i <= 0 || o[i].cand.currency !== o[i - 1].cand.currency) continue; const s = o[i].total - o[i - 1].total; if (s > 0 && (!best || s > best.saving)) best = { id, saving: s }; }
      if (!best) break; idx[best.id] = idx[best.id]! - 1; if (!lowered.includes(best.id)) lowered.push(best.id); plan = apply();
    }
    if (lowered.length) notes.push({ code: "adjusted", items: lowered });
  }
  if (tier !== "budget") { const few = LEVEL_ITEMS.filter((id) => { const n = options[id]?.length ?? 0; return n > 0 && n < 3; }); if (few.length && !notes.some((n) => n.code === "adjusted")) notes.push({ code: "fewFigures", items: few }); }

  if (opts.now) plan = { ...plan, updatedAt: opts.now };
  const calc = calcPlan(plan); const goal = calc.goal;
  const mainMissing = MAIN_ITEMS.filter((id) => calc.items[id].state === "unset");
  const provisional = mainMissing.length > 0; const setCount = ITEM_IDS.length - calc.unset.length;
  const verdict: Verdict = !goal ? "undetermined" : goal.state === "noRate" ? "needsRate" : !provisional ? (goal.state === "over" ? "over" : "within") : goal.state === "over" ? "overAlready" : "undetermined";
  if (verdict === "needsRate") notes.push({ code: "noRate" });
  if (picks.flights.status === "unset") notes.push({ code: "flightMissing" });
  const remaining = goal && goal.diff !== null ? goal.diff : null;
  const sp: SmartPlan = { tier, plan, calc, picks, excluded, notes, verdict, remaining, mainMissing, setCount, provisional, suggestions: [],
    initialOther: moneyOf(plan, calc, ["registration", "materials", "visa", "insurance", "otherInitial"]), flights: moneyOf(plan, calc, ["flights"]) };
  if (!opts.noSuggest && (verdict === "over" || verdict === "overAlready")) { sp.suggestions = suggest(easy, sp, opts); if (!sp.suggestions.length || !sp.suggestions.some((s) => s.kind !== "durationNotEnough")) notes.push({ code: "cannotFit" }); }
  return sp;
}

const countedIn = (c: PlanCalc, ccy: Ccy) => (Object.keys(c.total.unconverted).length === 0 ? c.total.converted : (c.total.byCurrency[ccy] ?? null));

/** What to change to bring an over-budget plan down. Every suggestion is computed, never a rule of thumb. */
function suggest(easy: Easy, sp: SmartPlan, opts: { now?: string; allowSample?: boolean }): Suggestion[] {
  const out: Suggestion[] = []; const budget = easy.budget.amount; const now = countedIn(sp.calc, easy.budget.currency); if (now === null) return out;
  // 1. shorter stay: the longest stay (weeks) whose counted costs fit
  const cur = stayWeeks(sp.plan); let fit: number | null = null;
  for (let w = Math.floor(cur) - 1; w >= 1; w--) {
    const t = countedIn(calcPlan({ ...sp.plan, duration: { value: w, unit: "weeks" } }), easy.budget.currency);
    if (t !== null && t <= budget) { fit = w; break; }
  }
  if (fit !== null) out.push({ kind: "duration", weeks: fit, saving: now - (countedIn(calcPlan({ ...sp.plan, duration: { value: fit, unit: "weeks" } }), easy.budget.currency) ?? now) });
  else out.push({ kind: "durationNotEnough" });
  // 2. another housing type (cheapest plan with that type, if verified figures exist)
  if (sp.picks.housing.status !== "unset" || easy.housing) {
    let best: { housing: HousingType; saving: number } | null = null;
    for (const h of HOUSING_TYPES) {
      if (h === sp.plan.housingType && sp.picks.housing.status === "official") continue;
      if (!cityCandidates(easy.cityId, "housing", { studyType: easy.studyType, housingType: h }).some((c) => c.eligible)) continue;
      const alt = build({ ...easy, housing: h }, "budget", { ...opts, noSuggest: true }); const t = countedIn(alt.calc, easy.budget.currency);
      if (t !== null && alt.picks.housing.status === "official" && now - t > 0.5 && (!best || now - t > best.saving)) best = { housing: h, saving: now - t };
    }
    if (best) out.push({ kind: "housing", ...best });
  }
  return out;
}

export function generate(easy: Easy, opts: { now?: string; allowSample?: boolean } = {}): SmartPlan[] { return TIERS.map((t) => build(easy, t, opts)); }
export const generateOne = (easy: Easy, tier: Tier, opts: { now?: string; allowSample?: boolean } = {}) => build(easy, tier, opts);

/**
 * Plans that come out identical (same figures from the same sources) are shown once: with the data available there is no
 * real difference to offer, and a second card with the same numbers would only add noise. Adjacent tiers are merged.
 */
export type PlanGroup = { tiers: Tier[]; plan: SmartPlan };
export function groupPlans(plans: SmartPlan[]): PlanGroup[] {
  const sig = (p: SmartPlan) => JSON.stringify(ITEM_IDS.map((id) => { const i = p.plan.items[id]; return [i.value, i.per, i.currency, i.coverageWeeks, i.source.kind === "official" ? i.source.ref : "user"]; }));
  const out: PlanGroup[] = [];
  for (const p of plans) { const last = out[out.length - 1]; if (last && sig(last.plan) === sig(p)) last.tiers.push(p.tier); else out.push({ tiers: [p.tier], plan: p }); }
  return out;
}

/** Tuition headroom: what is left of the budget for costs that are not counted yet, per week of the stay. */
export function headroom(sp: SmartPlan, weeks: number): { total: number; perWeek: number } | null {
  return sp.remaining !== null && sp.remaining > 0 && weeks > 0 ? { total: sp.remaining, perWeek: sp.remaining / weeks } : null;
}

/* ---------- Saved smart plans (browser only) ---------- */
export type Saved = { id: string; name: string; tier: Tier; easy: Easy; plan: Plan; savedAt: string };
export type SavedStore = { version: 1; saved: Saved[]; compare: string[] };
export const SAVED_KEY = "studyatlas.smart.v1"; export const DRAFT_KEY = "studyatlas.smart.draft.v1";
export const MAX_SAVED = 20; export const MAX_COMPARE = 3;
export const emptySaved = (): SavedStore => ({ version: 1, saved: [], compare: [] });

const num = (x: unknown): number | null => (typeof x === "number" && Number.isFinite(x) ? x : null);
const nn = (x: unknown): number | null => { const v = num(x); return v !== null && v >= 0 ? v : null; };
const oneOf = <T extends string>(list: readonly T[], x: unknown, d: T): T => ((list as readonly string[]).includes(x as string) ? (x as T) : d);
export function cleanEasy(v: unknown): Easy | undefined {
  if (!v || typeof v !== "object") return undefined; const e = v as Partial<Easy>; const d = defaultEasy();
  const cityId = oneOf(["manchester", "vancouver"] as const, e.cityId, "manchester"); const unit = e.duration?.unit === "months" ? "months" : "weeks"; const max = unit === "weeks" ? 104 : 24;
  const ccy = oneOf(CURRENCIES, e.budget?.currency, CITY_CCY[cityId]); const am = num(e.budget?.amount);
  const rates: Plan["rates"] = {}; for (const c of CURRENCIES) { const r = e.rates?.[c]; if (r && num(r.rate)! > 0 && c !== ccy) rates[c] = { rate: r.rate, date: typeof r.date === "string" ? r.date : "" }; }
  const code = typeof e.origin?.airport === "string" && /^[A-Z]{3}$|^OTHER$/.test(e.origin.airport) ? e.origin.airport : d.origin.airport;
  const m = num(e.month);
  return { origin: { country: typeof e.origin?.country === "string" ? e.origin.country.slice(0, 2) : d.origin.country, airport: code, custom: typeof e.origin?.custom === "string" && /^[A-Za-z]{0,3}$/.test(e.origin.custom) ? e.origin.custom.toUpperCase() : "" },
    cityId, studyType: oneOf(STUDY_TYPES, e.studyType, "language"), duration: { unit, value: Math.min(max, Math.max(1, num(e.duration?.value) ?? 12)) }, month: m !== null && m >= 1 && m <= 12 ? Math.round(m) : null,
    budget: { currency: ccy, amount: am !== null && am > 0 ? am : defaultBudget(ccy) }, housing: e.housing && (HOUSING_TYPES as readonly string[]).includes(e.housing) ? e.housing : null, trip: e.trip === "oneway" ? "oneway" : "round", rates,
    assume: { tuitionWeek: nn(e.assume?.tuitionWeek), visa: nn(e.assume?.visa), insurance: nn(e.assume?.insurance), flight: { round: nn(e.assume?.flight?.round), oneway: nn(e.assume?.flight?.oneway) },
      ...(nn(e.assume?.housing?.amount) !== null || e.assume?.housing?.per === "month" ? { housing: { amount: nn(e.assume?.housing?.amount), per: e.assume?.housing?.per === "month" ? "month" as const : "week" as const } } : {}) } };
}
export function cleanSaved(v: unknown): SavedStore | undefined {
  if (!v || typeof v !== "object") return undefined; const s = v as Partial<SavedStore>;
  const saved: Saved[] = [];
  for (const x of Array.isArray(s.saved) ? s.saved : []) {
    const r = x as Partial<Saved>; const easy = cleanEasy(r?.easy); const plan = cleanPlan(r?.plan); if (!easy || !plan || typeof r.id !== "string" || !r.id) continue;
    saved.push({ id: r.id, name: typeof r.name === "string" ? r.name.slice(0, 60) : "", tier: oneOf(TIERS, r.tier, "balanced"), easy, plan, savedAt: typeof r.savedAt === "string" ? r.savedAt : "" });
  }
  const ids = new Set(saved.map((x) => x.id));
  return { version: 1, saved: saved.slice(-MAX_SAVED), compare: (Array.isArray(s.compare) ? s.compare : []).filter((x): x is string => typeof x === "string" && ids.has(x)).slice(0, MAX_COMPARE) };
}
const sid = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export function savePlan(s: SavedStore, sp: SmartPlan, easy: Easy, name: string, now = new Date().toISOString()): SavedStore {
  const id = sid(); const plan = touch({ ...JSON.parse(JSON.stringify(sp.plan)), id, name }, now);
  return { ...s, saved: [...s.saved, { id, name, tier: sp.tier, easy: JSON.parse(JSON.stringify(easy)), plan, savedAt: now }].slice(-MAX_SAVED) };
}
export const renameSaved = (s: SavedStore, id: string, name: string): SavedStore => ({ ...s, saved: s.saved.map((x) => (x.id === id ? { ...x, name: name.slice(0, 60), plan: { ...x.plan, name: name.slice(0, 60) } } : x)) });
export const deleteSaved = (s: SavedStore, id: string): SavedStore => ({ ...s, saved: s.saved.filter((x) => x.id !== id), compare: s.compare.filter((x) => x !== id) });
/** Up to three plans can be compared; adding a fourth is refused (returns the same store). */
export function toggleCompare(s: SavedStore, id: string): SavedStore {
  if (s.compare.includes(id)) return { ...s, compare: s.compare.filter((x) => x !== id) };
  return s.compare.length >= MAX_COMPARE || !s.saved.some((x) => x.id === id) ? s : { ...s, compare: [...s.compare, id] };
}
