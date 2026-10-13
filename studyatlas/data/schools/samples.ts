import type { LanguageSchool, University } from "./types";
import type { Fact } from "../schema";
/*
 * FICTIONAL sample schools. They do not exist. They are here so the school compare screen and the
 * budget simulator can be used and tested before real fees are researched. Every value is status "sample",
 * and the UI shows them only when "Show sample data" is switched on, always labelled as fictional.
 * Links point to example.com (reserved for documentation, RFC 2606).
 */
const s = <T,>(value: T): Fact<T> => ({ status: "sample", value, note: { en: "Fictional sample for testing.", ja: "テスト用の架空のサンプルです。" } });
const fictional = s({ en: "Fictional sample school", ja: "架空のサンプル校" });
const intl = { en: "All students (sample)", ja: "全学生（サンプル）" };
const intlUni = { en: "International students (sample)", ja: "留学生（サンプル）" };

export const sampleLanguageSchools: LanguageSchool[] = [
  { kind: "language", id: "demo-maple", name: "Maple Leaf English Academy (Sample)", cityId: "vancouver", demo: true, record: fictional,
    address: s({ en: "Downtown Vancouver (fictional)", ja: "バンクーバー中心部（架空）" }), website: s("https://example.com/maple-leaf"),
    accommodation: s({ en: "Homestay arranged by the school", ja: "学校手配のホームステイあり" }),
    courses: [
      { id: "general", name: { en: "General English", ja: "一般英語" }, hoursPerWeek: s(20), duration: s({ minWeeks: 4, maxWeeks: 48 }),
        tuition: s({ amount: 400, currency: "CAD", unit: "week", feeYear: "2026", applicability: intl, tax: "notApplicable", includes: { en: "Tuition only", ja: "授業料のみ" } }),
        registrationFee: s({ amount: 150, currency: "CAD", unit: "once", feeYear: "2026", tax: "notApplicable" }),
        materialsFee: s({ amount: 25, currency: "CAD", unit: "week", feeYear: "2026", tax: "notApplicable" }) },
      { id: "intensive", name: { en: "Intensive English", ja: "集中英語" }, hoursPerWeek: s(28), duration: s({ minWeeks: 4, maxWeeks: 24 }),
        tuition: s({ amount: 480, currency: "CAD", unit: "week", feeYear: "2026", applicability: intl, tax: "notApplicable", includes: { en: "Tuition only", ja: "授業料のみ" } }),
        registrationFee: s({ amount: 150, currency: "CAD", unit: "once", feeYear: "2026", tax: "notApplicable" }),
        materialsFee: s({ amount: 25, currency: "CAD", unit: "week", feeYear: "2026", tax: "notApplicable" }) },
    ] },
  { kind: "language", id: "demo-redbrick", name: "Red Brick Language Centre (Sample)", cityId: "manchester", demo: true, record: fictional,
    address: s({ en: "Manchester city centre (fictional)", ja: "マンチェスター中心部（架空）" }), website: s("https://example.com/red-brick"),
    accommodation: s({ en: "Student residence and homestay", ja: "学生寮・ホームステイあり" }),
    courses: [
      { id: "general", name: { en: "General English", ja: "一般英語" }, hoursPerWeek: s(15), duration: s({ minWeeks: 2, maxWeeks: 36 }),
        tuition: s({ amount: 290, currency: "GBP", unit: "week", feeYear: "2026", applicability: intl, tax: "unknown", includes: { en: "Tuition and materials", ja: "授業料・教材費込み" } }),
        registrationFee: s({ amount: 80, currency: "GBP", unit: "once", feeYear: "2026", tax: "unknown" }),
        materialsFee: s({ amount: 0, currency: "GBP", unit: "once", feeYear: "2026", tax: "unknown", includes: { en: "Included in tuition", ja: "授業料に含む" } }) },
    ] },
  { kind: "language", id: "demo-canal", name: "Canal Street Institute (Sample)", cityId: "manchester", demo: true, record: fictional,
    address: s({ en: "Manchester (fictional)", ja: "マンチェスター（架空）" }), website: s("https://example.com/canal-street"),
    accommodation: s({ en: "No accommodation service", ja: "滞在先の手配なし" }),
    courses: [
      { id: "term12", name: { en: "12-week English package", ja: "12週間英語パッケージ" }, hoursPerWeek: s(21), duration: s({ minWeeks: 12, maxWeeks: 12 }),
        tuition: s({ amount: 3300, currency: "GBP", unit: "course", feeYear: "2025", applicability: intl, tax: "included", includes: { en: "Tuition, materials and exam fee", ja: "授業料・教材費・試験料込み" } }),
        registrationFee: s({ amount: 100, currency: "GBP", unit: "once", feeYear: "2025", tax: "included" }),
        materialsFee: s({ amount: 0, currency: "GBP", unit: "once", feeYear: "2025", tax: "included", includes: { en: "Included in tuition", ja: "授業料に含む" } }) },
    ] },
];

export const sampleUniversities: University[] = [
  { kind: "university", id: "demo-northvale", name: "Northvale University (Sample)", cityId: "manchester", demo: true, record: fictional,
    address: s({ en: "Manchester (fictional)", ja: "マンチェスター（架空）" }), website: s("https://example.com/northvale"),
    programs: [
      { id: "bsc-cs", degree: { en: "BSc", ja: "学士（BSc）" }, major: { en: "Computer Science", ja: "コンピューターサイエンス" }, years: s(3),
        tuitionInternational: s({ amount: 26000, currency: "GBP", unit: "year", feeYear: "2026/27", applicability: intlUni, tax: "notApplicable", includes: { en: "Tuition only", ja: "授業料のみ" } }),
        entryRequirements: s({ en: "Sample: A-levels or equivalent; IELTS 6.5", ja: "サンプル：A-level相当、IELTS 6.5" }),
        applicationPeriod: s({ en: "Sample: Sep–Jan", ja: "サンプル：9月〜1月" }) },
      { id: "msc-ds", degree: { en: "MSc", ja: "修士（MSc）" }, major: { en: "Data Science", ja: "データサイエンス" }, years: s(1),
        tuitionInternational: s({ amount: 30000, currency: "GBP", unit: "course", feeYear: "2026/27", applicability: intlUni, tax: "notApplicable", includes: { en: "Tuition only", ja: "授業料のみ" } }),
        entryRequirements: s({ en: "Sample: relevant bachelor's degree; IELTS 7.0", ja: "サンプル：関連分野の学士号、IELTS 7.0" }),
        applicationPeriod: s({ en: "Sample: Oct–Jun", ja: "サンプル：10月〜6月" }) },
    ] },
  { kind: "university", id: "demo-pacific", name: "Pacific Coast University (Sample)", cityId: "vancouver", demo: true, record: fictional,
    address: s({ en: "Vancouver (fictional)", ja: "バンクーバー（架空）" }), website: s("https://example.com/pacific-coast"),
    programs: [
      { id: "bsc-cs", degree: { en: "BSc", ja: "学士（BSc）" }, major: { en: "Computer Science", ja: "コンピューターサイエンス" }, years: s(4),
        tuitionInternational: s({ amount: 48000, currency: "CAD", unit: "year", feeYear: "2026/27", applicability: intlUni, tax: "notApplicable", includes: { en: "Tuition and student fees", ja: "授業料・学生費用込み" } }),
        entryRequirements: s({ en: "Sample: high-school diploma; IELTS 6.5", ja: "サンプル：高校卒業資格、IELTS 6.5" }),
        applicationPeriod: s({ en: "Sample: Oct–Jan", ja: "サンプル：10月〜1月" }) },
    ] },
];
