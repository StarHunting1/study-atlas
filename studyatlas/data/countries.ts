import { pending, type Fact } from "./schema";
import type { Localized } from "@/lib/i18n";
import type { Country } from "./types";
// Visa information is national. It stays "pending" until checked on the government's own page (see data/RESEARCH.md).
const visa = () => ({ official: pending<never>(), notes: pending<never>() });
/*
 * Ver.1.3.1: a plain-language outline of the entry routes, written from the governments' own pages as they appeared in public search
 * on 2026-10-15 (the pages themselves were not opened). Always "unverified". It never says which route applies to a person: that depends
 * on nationality, course, age and plans, and the final check is the government page.
 */
const outline = (sources: { url: string; publisher: string }[], note: Localized, value: Localized): Fact<Localized> => ({ status: "unverified", value, sources: sources.map((s) => ({ ...s, terms: "Reuse terms not confirmed – facts paraphrased, link only" })), period: "2026-10", checkedAt: "2026-10-15", note });
const checkOfficial: Localized = { en: "Paraphrased from the government's public pages; not yet compared with them page by page. Which route applies depends on your nationality and personal circumstances – confirm on the official page before you plan.", ja: "政府の公開ページの内容を言い換えたもので、ページごとの照合は未了です。どの区分が必要かは国籍・個別の事情で異なります。計画の前に必ず公式ページで確認してください。" };
const gbrVisa = () => ({
  official: outline([{ url: "https://www.gov.uk/standard-visitor/visit-to-study", publisher: "GOV.UK (Home Office)" }, { url: "https://www.gov.uk/visa-to-study-english", publisher: "GOV.UK (Home Office)" }, { url: "https://www.gov.uk/student-visa", publisher: "GOV.UK (Home Office)" }], checkOfficial,
    { en: "Entry routes for study in the UK depend mainly on the length and type of course: a course of up to 6 months can be studied as a Standard Visitor (with a place at an accredited institution); an English-language course of more than 6 and up to 11 months falls under the Short-term study visa; longer courses, or degree study, need a Student visa with a licensed sponsor. Whether you need a visa or an electronic travel authorisation before travelling depends on your nationality.", ja: "英国での学習の入国区分は、主にコースの期間と種類で決まります。6か月以内のコースは、認定機関に受講先があれば訪問者（Standard Visitor）として学習できます。英語コースが6か月超〜11か月なら短期学習ビザ（Short-term study visa）、それより長いコースや学位取得は、認可を受けた学校のスポンサーが必要な Student visa になります。渡航前にビザや電子渡航認証が必要かどうかは国籍によって異なります。" }),
  notes: outline([{ url: "https://www.gov.uk/visa-to-study-english", publisher: "GOV.UK (Home Office)" }, { url: "https://www.gov.uk/healthcare-immigration-application/how-much-pay", publisher: "GOV.UK (Home Office)" }], checkOfficial,
    { en: "Short-term study visa holders cannot work, switch course or provider, and can extend only up to 11 months at the same institution. The Immigration Health Surcharge (IHS) is paid upfront with a Student visa application; GOV.UK says courses of 6 months or less do not pay it. Check the current amounts on the official pages.", ja: "短期学習ビザでは就労、コースや学校の変更はできず、延長も同じ学校で最大11か月までです。Student visa では申請時に医療付加金（IHS）を前払いします。GOV.UK によると6か月以内のコースは対象外です。金額は変更されるため、公式ページで最新額を確認してください。" }),
});
const canVisa = () => ({
  official: outline([{ url: "https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=484&top=15", publisher: "IRCC (Government of Canada)" }, { url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html", publisher: "IRCC (Government of Canada)" }], checkOfficial,
    { en: "IRCC says a study permit is generally not needed for a programme of 6 months or less, but you still need a valid travel document to enter (an eTA if you are from a visa-exempt country and fly in, or a visitor visa). For a longer programme, or if you may continue studying, IRCC advises applying for a study permit before you travel.", ja: "IRCCの案内では、6か月以内のプログラムなら一般に就学許可（study permit）は不要ですが、入国には有効な渡航書類が必要です（査証免除国の国籍で航空機を使う場合はeTA、それ以外は訪問者ビザなど）。プログラムが6か月を超える場合や、学習を続ける可能性がある場合は、渡航前に study permit を申請するようIRCCは案内しています。" }),
  notes: outline([{ url: "https://ircc.canada.ca/English/helpcentre/answer.asp?qnum=1289&top=23&wbdisable=true", publisher: "IRCC (Government of Canada)" }], checkOfficial,
    { en: "The eTA requirement depends on your nationality and how you travel (not needed by land, bus, train or boat). Provincial health coverage depends on the permit length and the province – see the Daily life section for British Columbia.", ja: "eTAが必要かどうかは国籍と移動手段で異なります（陸路・バス・鉄道・船では不要）。州の医療保険は就学許可の期間と州によって異なります。ブリティッシュコロンビア州は「暮らし」の項目をご覧ください。" }),
});
export const countries: Country[] = [
  { code: "CAN", name: { en: "Canada", ja: "カナダ" }, center: [-100, 55], zoom: 2.5, profile: { visa: canVisa() } },
  { code: "GBR", name: { en: "United Kingdom", ja: "イギリス" }, center: [-2, 54], zoom: 4.5, profile: { visa: gbrVisa() } },
  { code: "AUS", name: { en: "Australia", ja: "オーストラリア" }, center: [134, -26], zoom: 3, profile: { visa: visa() } },
];
