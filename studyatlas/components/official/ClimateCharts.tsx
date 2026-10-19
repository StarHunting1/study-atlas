"use client";
import { tpl } from "@/components/planner/format";
import { useState } from "react";
import type { ClimateNormals } from "@/data/official/types";
import { useI18n } from "@/lib/i18n";
import { dataText as d } from "@/locales/data";
import { ot } from "@/locales/official";
/*
 * Two small charts instead of one dual-axis chart: temperature (mean line + daily max–min band) and precipitation
 * (bars). Values are drawn exactly as published; a month the source does not give is left as a gap, never filled.
 * Hover (or tap) a month for its values; "Show as table" gives the same numbers as text.
 */
const W = 560, H = 190, PAD = { l: 36, r: 8, t: 12, b: 26 };
const xOf = (i: number) => PAD.l + ((W - PAD.l - PAD.r) / 12) * (i + 0.5);
const colW = (W - PAD.l - PAD.r) / 12;

function ticks(min: number, max: number, n = 4) {
  const step = [1, 2, 5, 10, 20, 25, 50, 100].find((s) => (max - min) / s <= n) ?? 100;
  const out: number[] = []; const hi = Math.ceil(max / step) * step; for (let v = Math.floor(min / step) * step; v <= hi + 1e-9; v += step) out.push(v); return out;
}

function Frame({ title, yTicks, y, hover, setHover, months, children, tip }: { title: string; yTicks: number[]; y: (v: number) => number; hover: number | null; setHover: (i: number | null) => void; months: readonly string[]; children: React.ReactNode; tip: (i: number) => string }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1 text-sm font-semibold text-slate-700">{title}</figcaption>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={title} onMouseLeave={() => setHover(null)}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(t)} y2={y(t)} className={t === 0 ? "stroke-slate-300" : "stroke-slate-100"} strokeWidth={1} />
              <text x={PAD.l - 6} y={y(t) + 3} textAnchor="end" className="fill-slate-400 text-[10px]">{t}</text>
            </g>
          ))}
          {months.map((m, i) => <text key={m} x={xOf(i)} y={H - 8} textAnchor="middle" className={`text-[10px] ${hover === i ? "fill-slate-700" : "fill-slate-400"}`}>{m}</text>)}
          {hover !== null && <rect x={xOf(hover) - colW / 2} y={PAD.t} width={colW} height={H - PAD.t - PAD.b} className="fill-slate-900/5" />}
          {children}
          {/* hit targets larger than the marks */}
          {months.map((m, i) => <rect key={m} x={xOf(i) - colW / 2} y={0} width={colW} height={H} fill="transparent" onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} />)}
        </svg>
        {hover !== null && (
          <div className="pointer-events-none absolute top-0 rounded-lg bg-slate-900/90 px-2 py-1 text-[11px] text-white shadow" style={{ left: `${Math.min(78, Math.max(0, (xOf(hover) / W) * 100 - 8))}%` }}>
            <span className="font-medium">{months[hover]}</span> {tip(hover)}
          </div>
        )}
      </div>
    </figure>
  );
}

export default function ClimateCharts({ c }: { c: ClimateNormals }) {
  const { L, lang } = useI18n(); const months = d.months[lang === "ja" ? "ja" : "en"];
  const [hover, setHover] = useState<number | null>(null); const [table, setTable] = useState(false);
  const hasMeanEarly = c.months.some((m) => m.meanC !== undefined);
  const temps = c.months.flatMap((m) => [m.meanC, m.maxC, m.minC]).filter((v): v is number => v !== undefined);
  const tMin = Math.min(0, ...temps), tMax = Math.max(...temps, 1);
  const tTicks = ticks(tMin, tMax); const ty = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - (v - tTicks[0]) / (tTicks[tTicks.length - 1] - tTicks[0]));
  const precs = c.months.map((m) => m.precipMm).filter((v): v is number => v !== undefined);
  const pTicks = ticks(0, Math.max(...precs, 1)); const py = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / pTicks[pTicks.length - 1]);
  const line = (key: "meanC" | "maxC" | "minC") => c.months.map((m, i) => (m[key] === undefined ? null : `${xOf(i)},${ty(m[key]!)}`));
  const segs = (pts: (string | null)[]) => pts.reduce<string[][]>((acc, p) => { if (p === null) acc.push([]); else acc[acc.length - 1].push(p); return acc; }, [[]]).filter((s) => s.length);
  const band = hasMeanEarly && c.months.every((m) => m.maxC !== undefined && m.minC !== undefined)
    ? `${c.months.map((m, i) => `${xOf(i)},${ty(m.maxC!)}`).join(" ")} ${[...c.months].map((m, i) => `${xOf(i)},${ty(m.minC!)}`).reverse().join(" ")}` : null;
  const num = (v?: number) => (v === undefined ? "—" : v.toFixed(1));
  const hasMean = c.months.some((m) => m.meanC !== undefined);
  return (
    <div className="space-y-3">
      <div className="grid gap-4 lg:grid-cols-2">
        <Frame title={L(ot.climateTemp)} yTicks={tTicks} y={ty} hover={hover} setHover={setHover} months={months}
          tip={(i) => [hasMean && `${L(ot.climateMean)} ${num(c.months[i].meanC)}°C`, c.months[i].maxC !== undefined && `${L(ot.climateMax)} ${num(c.months[i].maxC)}°C`, c.months[i].minC !== undefined && `${L(ot.climateMin)} ${num(c.months[i].minC)}°C`].filter(Boolean).join(" · ")}>
          {band && <polygon points={band} className="fill-sky-200/60" />}
          {hasMean && segs(line("meanC")).map((s, k) => <polyline key={k} points={s.join(" ")} fill="none" className="stroke-sky-700" strokeWidth={2} strokeLinejoin="round" />)}
          {hasMean && c.months.map((m, i) => m.meanC !== undefined && <circle key={i} cx={xOf(i)} cy={ty(m.meanC)} r={hover === i ? 5 : 3.5} className="fill-sky-700 stroke-white" strokeWidth={2} />)}
          {!hasMean && (["maxC", "minC"] as const).map((k) => (
            <g key={k}>
              {segs(line(k)).map((sg, n) => <polyline key={n} points={sg.join(" ")} fill="none" className={k === "maxC" ? "stroke-sky-700" : "stroke-indigo-400"} strokeWidth={2} strokeLinejoin="round" />)}
              {c.months.map((m, i) => m[k] !== undefined && <circle key={i} cx={xOf(i)} cy={ty(m[k]!)} r={hover === i ? 5 : 3.5} className={`${k === "maxC" ? "fill-sky-700" : "fill-indigo-400"} stroke-white`} strokeWidth={2} />)}
            </g>))}
        </Frame>
        <Frame title={L(ot.climatePrecip)} yTicks={pTicks} y={py} hover={hover} setHover={setHover} months={months} tip={(i) => `${num(c.months[i].precipMm)} mm`}>
          {c.months.map((m, i) => m.precipMm !== undefined && (
            <path key={i} d={(() => { const x = xOf(i) - colW * 0.3, w = colW * 0.6, y0 = py(0), y1 = py(m.precipMm!), r = Math.min(4, (y0 - y1) / 2); return `M${x},${y0} V${y1 + r} Q${x},${y1} ${x + r},${y1} H${x + w - r} Q${x + w},${y1} ${x + w},${y1 + r} V${y0} Z`; })()}
              className={hover === i ? "fill-indigo-700" : "fill-indigo-500"} />
          ))}
        </Frame>
      </div>
      <p className="text-xs text-slate-500">
        {hasMean && <><span className="mr-1 inline-block h-0.5 w-4 bg-sky-700 align-middle" />{L(ot.climateMean)} </>}
        {!hasMean && <><span className="mr-1 inline-block h-0.5 w-4 bg-sky-700 align-middle" />{L(ot.climateMax)} <span className="ml-2 mr-1 inline-block h-0.5 w-4 bg-indigo-400 align-middle" />{L(ot.climateMin)} </>}
        {band && hasMean && <><span className="ml-2 mr-1 inline-block h-2.5 w-4 rounded-sm bg-sky-200 align-middle" />{L(ot.climateRange)}</>}
        <span className="ml-3">{L(ot.climateStation)}: {c.station}{c.stationId ? ` (${c.stationId})` : ""} · {L(ot.climatePeriod)}: <strong>{c.period}</strong></span>
      </p>
      {c.annual?.meanC !== undefined && <p className="text-sm text-slate-700" data-testid="climate-annual-temp">{tpl(L(ot.climateAnnualTemp), { mean: c.annual.meanC.toFixed(1), max: c.annual.maxC !== undefined ? c.annual.maxC.toFixed(1) : "—", min: c.annual.minC !== undefined ? c.annual.minC.toFixed(1) : "—" })}</p>}
      {c.stationInfo && <p className="text-xs text-slate-600" data-testid="climate-site">{L(c.stationInfo.where)}</p>}
      {c.annual?.precipMm !== undefined && <p className="text-sm text-slate-700" data-testid="climate-annual">{L(ot.climateAnnual)}: <strong className="tabular-nums">{c.annual.precipMm.toFixed(1)} mm</strong></p>}
      <button onClick={() => setTable(!table)} className="text-xs text-sky-700 underline">{L(table ? ot.hideTable : ot.showTable)}</button>
      {table && (
        <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-center text-xs">
          <thead><tr><th />{months.map((m) => <th key={m} className="px-1 py-1 font-medium text-slate-500">{m}</th>)}</tr></thead>
          <tbody>
            {([["meanC", ot.climateMean], ["maxC", ot.climateMax], ["minC", ot.climateMin]] as const).filter(([k]) => c.months.some((m) => m[k] !== undefined)).map(([k, label]) => (
              <tr key={k}><th className="pr-2 text-left font-medium text-slate-500">{L(label)} (°C)</th>{c.months.map((m, i) => <td key={i} className="px-1 py-1 tabular-nums">{num(m[k])}</td>)}</tr>))}
            <tr><th className="pr-2 text-left font-medium text-slate-500">{L(d.precipMm)}</th>{c.months.map((m, i) => <td key={i} className="px-1 py-1 tabular-nums">{num(m.precipMm)}</td>)}</tr>
          </tbody>
        </table></div>
      )}
    </div>
  );
}
