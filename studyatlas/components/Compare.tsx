"use client";
import Link from "next/link";
import { City, getCity, type Fact, type Money } from "@/data/cities";
import { sections } from "@/data/fields";
import { moneyComparability } from "@/data/comparability";
import { useI18n } from "@/lib/i18n";
import { panel } from "@/lib/ui";
import { dataText as d } from "@/locales/data";
import FactView from "@/components/FactView";
// Same field registry and Facts as the city detail page, filtered to `compare: true`.
export default function Compare({ ids, onRemove }: { ids: string[]; onRemove: (id: string) => void }) {
  const { t, L } = useI18n();
  const list = ids.map(getCity).filter((c): c is City => !!c); // keep the order the user picked
  const groups = sections.map((s) => ({ ...s, fields: s.fields.filter((f) => f.compare) })).filter((s) => s.fields.length);
  const cmpNote = { notVerified: d.cmpNotVerified, currency: d.cmpCurrency, basis: d.cmpBasis } as const;
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">{L(d.cmpNote)}</p>
      <div className={`overflow-x-auto p-4 ${panel}`}>
        <table className="w-full min-w-[680px] text-sm">
          <thead><tr><th className="w-40" />{list.map((c) => (
            <th key={c.id} className="p-2 text-left align-top"><Link href={`/city/${c.id}`} className="text-base font-semibold hover:underline">{L(c.name)}</Link>
              <div><button onClick={() => onRemove(c.id)} className="text-xs font-normal text-slate-500 underline">{t("remove")}</button></div></th>))}</tr></thead>
          {groups.map((g) => (
            <tbody key={g.id}>
              <tr><th colSpan={list.length + 1} className="bg-slate-50 px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{L(g.label)}</th></tr>
              {g.fields.map((f) => {
                const facts = list.map((c) => f.get(c));
                const cmp = f.kind === "money" ? moneyComparability(facts as Fact<Money>[]) : "ok";
                return (
                  <tr key={f.id} className="border-t border-slate-100">
                    <td className="p-2 align-top text-slate-500">{L(f.label)}{cmp !== "ok" && <p className="mt-1 text-[11px] leading-snug text-amber-700">{L(cmpNote[cmp])}</p>}</td>
                    {list.map((c, i) => <td key={c.id} className="p-2 align-top"><FactView fact={facts[i]} kind={f.kind} compact /></td>)}
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}
