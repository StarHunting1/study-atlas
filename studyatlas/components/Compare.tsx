"use client";
import Link from "next/link";
import { City, getCity } from "@/data/cities";
import { useI18n } from "@/lib/i18n";
import { panel } from "@/lib/ui";
import SampleBadge from "@/components/SampleBadge";
export default function Compare({ ids, onRemove }: { ids: string[]; onRemove: (id: string) => void }) {
  const { t, L } = useI18n();
  const list = ids.map(getCity).filter((c): c is City => !!c); // keep the order the user picked
  const m = (c: City, v: number) => <span>{v.toLocaleString()} {c.cost.currency}<SampleBadge show={c.cost.isSample} /></span>;
  const rows: [string, (c: City) => React.ReactNode][] = [
    [t("rent"), (c) => m(c, c.cost.rent)], [t("monthly"), (c) => m(c, c.cost.monthly)], [t("transportCost"), (c) => m(c, c.cost.transport)],
    [t("transport"), (c) => L(c.transport)], [t("climate"), (c) => L(c.climate)], [t("schools"), (c) => c.schools.join(", ")], [t("student"), (c) => L(c.student)],
  ];
  return (
    <div className={`overflow-x-auto p-4 ${panel}`}>
      <table className="w-full min-w-[640px] text-sm">
        <thead><tr><th className="w-28" />{list.map((c) => (
          <th key={c.id} className="p-2 text-left align-top"><Link href={`/city/${c.id}`} className="text-base font-semibold hover:underline">{L(c.name)}</Link>
            <div><button onClick={() => onRemove(c.id)} className="text-xs font-normal text-slate-500 underline">{t("remove")}</button></div></th>))}</tr></thead>
        <tbody>{rows.map(([l, f]) => (<tr key={l} className="border-t border-slate-100"><td className="p-2 text-slate-500">{l}</td>{list.map((c) => <td key={c.id} className="p-2 align-top">{f(c)}</td>)}</tr>))}</tbody>
      </table>
    </div>
  );
}
