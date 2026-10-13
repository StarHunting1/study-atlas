// One icon set for the Discover / Compare / Decide steps: 24px grid, 1.75 stroke, round caps.
const paths = {
  discover: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2.2 4.8-4.8 2.2 2.2-4.8z" /></>, // compass
  compare: <><rect x="3.5" y="5" width="6.5" height="14" rx="1.5" /><rect x="14" y="5" width="6.5" height="14" rx="1.5" /><path d="M6 9.5h1.5M6 12.5h1.5M16.5 9.5H18M16.5 12.5H18" /></>, // side-by-side columns
  decide: <><circle cx="12" cy="12" r="9" /><path d="M8 12.3l2.7 2.7L16.2 9.5" /></>, // check
};
export default function StepIcon({ name, className = "h-6 w-6" }: { name: keyof typeof paths; className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>{paths[name]}</svg>;
}
