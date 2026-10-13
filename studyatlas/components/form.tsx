"use client";
// Small form controls shared by the My Study pages. Empty number inputs mean "not entered" (null), never 0.
export const inputCls = "w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 outline-none transition focus:ring-2 focus:ring-sky-400";
export function Field({ label, htmlFor, children, hint }: { label: string; htmlFor?: string; children: React.ReactNode; hint?: string }) {
  return <div className="space-y-1"><label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">{label}</label>{children}{hint && <p className="text-xs text-slate-400">{hint}</p>}</div>;
}
export function Select({ id, value, onChange, options, placeholder, className = "" }: { id?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder?: string; className?: string }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${inputCls} ${className}`}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
export function NumberInput({ id, value, onChange, min = 0, step = "any", className = "", placeholder, label }: { id?: string; value: number | null; onChange: (v: number | null) => void; min?: number; step?: string; className?: string; placeholder?: string; label?: string }) {
  return <input id={id} aria-label={label} type="number" inputMode="decimal" min={min} step={step} value={value ?? ""} placeholder={placeholder} onChange={(e) => { const v = e.target.value; onChange(v === "" ? null : Math.max(min, Number(v))); }} className={`${inputCls} ${className}`} />;
}
