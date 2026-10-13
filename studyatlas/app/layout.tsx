import "./globals.css";
import { I18nProvider } from "@/lib/i18n";
import { CompareProvider } from "@/lib/store";
import Header from "@/components/Header";
export const metadata = { title: "StudyAtlas", description: "Explore the world. Find your place." };
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="ja"><body><I18nProvider><CompareProvider><Header /><main className="mx-auto max-w-7xl px-4 py-8">{children}</main></CompareProvider></I18nProvider></body></html>);
}
