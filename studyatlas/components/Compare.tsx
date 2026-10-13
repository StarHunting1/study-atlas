"use client";
import { cities } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
export default function Compare({ ids, onRemove }: { ids: string[]; onRemove: (id: string) => void }) {
  const { t, L } = useI18n();
  const list = cities.filter((c) => ids.includes(c.id));
  type C = (typeof cities)[0];
  const m = (c: C, v: number) => <span>{v.toLocaleString()} {c.cost.currency}<span className="ml-1 rounded bg-amber-100 px-1 text-[10px] text-amber-800">{t("sample")}</span></span>;
  const rows: [string, (c: C) => React.ReactNode][] = [
    [t("rent"), (c) => m(c, c.cost.rent)], [t("monthly"), (c) => m(c, c.cost.monthly)], [t("transportCost"), (c) => m(c, c.cost.transport)],
    [t("transport"), (c) => L(c.transport)], [t("climate"), (c) => L(c.climate)], [t("schools"), (c) => c.schools.join(", ")], [t("student"), (c) => L(c.student)],
  ];
  return (
    <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <table className="w-full min-w-[640px] text-sm">
        <thead><tr><th className="w-28" />{list.map((c) => (
          <th key={c.id} className="p-2 text-left align-top"><div className="text-base font-semibold">{L(c.name)}</div>
            <button onClick={() => onRemove(c.id)} className="text-xs font-normal text-slate-500 underline">{t("remove")}</button></th>))}</tr></thead>
        <tbody>{rows.map(([l, f]) => (<tr key={l} className="border-t border-slate-100"><td className="p-2 text-slate-500">{l}</td>{list.map((c) => <td key={c.id} className="p-2 align-top">{f(c)}</td>)}</tr>))}</tbody>
      </table>
    </div>
  );
}
