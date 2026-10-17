import { pending, type Claim, type Fact } from "./schema";
import { claim, factFromClaims, source } from "./claims";
import { approve } from "./approvals";
import type { Localized } from "@/lib/i18n";
import type { Country } from "./types";
// Visa information is national. It stays "pending" until checked on the government's own page (see data/RESEARCH.md).
const visa = () => ({ official: pending<never>(), notes: pending<never>() });
/*
 * Ver.1.3.1: a plain-language outline of the entry routes, written from the governments' own pages as they appeared in public search
 * on 2026-10-15 (the pages themselves were not opened). Always "unverified". It never says which route applies to a person: that depends
 * on nationality, course, age and plans, and the final check is the government page.
 */
const GOVUK = "GOV.UK (Home Office)", IRCC = "IRCC (Government of Canada)";
const U = { visitor: source("https://www.gov.uk/standard-visitor/visit-to-study", GOVUK), shortTerm: source("https://www.gov.uk/visa-to-study-english", GOVUK), student: source("https://www.gov.uk/student-visa", GOVUK), check: source("https://www.gov.uk/check-uk-visa", GOVUK), ihs: source("https://www.gov.uk/healthcare-immigration-application/how-much-pay", GOVUK) };
const C = { permit6: source("https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=484&top=15", IRCC), eta: source("https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=1289&top=23", IRCC), permit: source("https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html", IRCC) };
const ukLicence = { en: "GOV.UK content is under the Open Government Licence v3.0 (commercial use allowed with attribution): facts are paraphrased and linked.", ja: "GOV.UKの内容は Open Government Licence v3.0（出典表示で商用利用可）。事実を言い換え、リンクを付けて表示。" };
const caLicence = { en: "Canada.ca terms allow non-commercial reproduction; commercial reuse is not confirmed: facts are paraphrased and linked, nothing is copied.", ja: "Canada.ca の条件は非商用の複製を許可。商用の再利用は未確認：事実の言い換えとリンクのみ（転載なし）。" };
const checkOfficial: Localized = { en: "Paraphrased from the government's public pages. Each statement shows its own status: only statements a person has approved carry an approval record (data/approvals.ts); statements marked “Not verified” await a person's approval. Which route applies depends on your nationality and personal circumstances – confirm on the official page before you plan, and re-check amounts there (they change).", ja: "政府の公開ページの内容を言い換えたものです。確認状況は記述ごとに表示しています。人が承認した記述だけに承認の記録（data/approvals.ts）があり、「未確認」の記述は人の承認待ちです。どの区分が必要かは国籍・個別の事情で異なります。計画の前に必ず公式ページで確認し、金額は変わるため公式ページで最新額を確認してください。" };
const where = (what: string) => `Country page → Visa → ${what}`;
export const GBR_VISA_CLAIMS: Claim[] = [
  claim({ id: "U1", candidate: "U1", sources: [U.visitor], where: where("Official information"), verdict: "recommend",
    text: { en: "Entry routes for study in the UK depend mainly on the length and type of course. A course of up to 6 months can be studied as a Standard Visitor, with a place at an accredited institution.", ja: "英国での学習の入国区分は、主にコースの期間と種類で決まります。6か月以内のコースは、認定機関に受講先があれば訪問者（Standard Visitor）として学習できます。" },
    conditions: { en: "Accredited UK institution (English language courses included); the course is no more than 6 months (distance learning excepted); not an academy or state-funded school. A visa or ETA may still be needed by nationality.", ja: "認定を受けた英国の教育機関（英語コース含む）。コースが6か月以内（遠隔学習を除く）。アカデミー・公立校は対象外。国籍によりビザ/ETAが別途必要な場合あり。" },
    reason: { en: "Matches gov.uk/standard-visitor/visit-to-study (read 2026-10-15; page updated 2024-10-31). The exceptions are not in the text (simplified, not wrong).", ja: "gov.uk/standard-visitor/visit-to-study（2026-10-15確認、ページ更新 2024-10-31）と一致。例外は文言に含めていない（簡略化であり誤りではない）。" } }),
  claim({ id: "U2", candidate: "U2", sources: [U.shortTerm], where: where("Official information"), verdict: "recommend",
    text: { en: "An English-language course of more than 6 and up to 11 months falls under the Short-term study visa.", ja: "英語コースが6か月超〜11か月なら短期学習ビザ（Short-term study visa）になります。" },
    conditions: { en: "English-language course at an accredited institution, longer than 6 and no more than 11 months (6 months or shorter: Visitor visa; longer than 11 months: Student visa). Under-18 rules differ. Nationality-based travel authorisation is separate.", ja: "認定機関の英語コースで、6か月超11か月以内（6か月以内=訪問者、11か月超=Student visa）。18歳未満は別の扱い。国籍別の渡航認証は別。" },
    reason: { en: "Matches gov.uk/visa-to-study-english (page updated 2025-02-06).", ja: "gov.uk/visa-to-study-english（ページ更新 2025-02-06）と一致。" } }),
  claim({ id: "U4", candidate: "U4", sources: [U.student], where: where("Official information"), verdict: "conditional",
    text: { en: "A Student visa is the route for longer study in the UK, but the length of the course alone does not decide it. You need to be 16 or over, to have been offered a place on a course by a licensed student sponsor (a school the Home Office has licensed), and to show you have enough money and the required level of English (16- and 17-year-olds also need a parent's consent). Which route applies to you also depends on your age, nationality and plans, so check the official page.", ja: "Student visa は、英国で長めに学ぶときの区分ですが、コースの期間だけで決まるわけではありません。16歳以上で、認可を受けた学校（licensed student sponsor）から受講許可を得ていること、十分な資金と必要な水準の英語力を示せることが条件です（16・17歳は保護者の同意も必要）。どの区分になるかは年齢・国籍・学習の計画によっても変わるため、公式ページで確認してください。" },
    conditions: { en: "Aged 16 or over; offered a place by a licensed student sponsor; enough money and English; 16–17-year-olds need parental consent (a Child Student visa may apply). Shorter courses may fall under the Short-term study or Standard Visitor routes (U1, U2). Age, nationality and plans also matter. The £558 fee on the page is not shown on StudyAtlas.", ja: "16歳以上、licensed student sponsor の受講許可、資金・英語力。16・17歳は保護者の同意が必要（Child Student visa の可能性）。短いコースは短期学習ビザや訪問者の区分になる場合がある（U1・U2）。年齢・国籍・計画も関わる。ページの申請料£558は画面に載せていない。" },
    reason: { en: "Reworded on request (Ver.1.3.10): the earlier text could be read as “Student visa = a long course”. The new wording must be compared with gov.uk/student-visa (page updated 2024-10-31) by the approver before approval.", ja: "依頼により文言を修正（Ver.1.3.10）：旧文言は「長いコース＝Student visa」と読める恐れがあった。修正後の文言は、承認者が gov.uk/student-visa（ページ更新 2024-10-31）と照合してから承認する。" } }),
  claim({ id: "U6", candidate: "U6", sources: [U.check], where: where("Official information"), verdict: "recommend",
    text: { en: "Whether you need a visa or an electronic travel authorisation before travelling depends on your nationality.", ja: "渡航前にビザや電子渡航認証が必要かどうかは国籍によって異なります。" },
    conditions: { en: "Applies to every applicant: GOV.UK “Check if you need a UK visa” is the entry point.", ja: "すべての申請者が対象。入口は GOV.UK の「Check if you need a UK visa」。" },
    reason: { en: "The page says “Depending on your nationality, you may need to get an electronic travel authorisation (ETA)” and “You may need a visa” (page dated 2021-06-16).", ja: "ページに「Depending on your nationality, you may need to get an electronic travel authorisation (ETA)」「You may need a visa」とある（ページ日付 2021-06-16）。" } }),
].map(approve);
export const GBR_NOTES_CLAIMS: Claim[] = [
  claim({ id: "U3", candidate: "U3", sources: [U.shortTerm], where: where("Points to note"), verdict: "recommend",
    text: { en: "GOV.UK lists the Short-term study visa fee as £228 (page read on 2026-10-15). Fees change – check the current amount on the official page.", ja: "GOV.UKでは短期学習ビザの申請料を£228と記載しています（2026-10-15に確認したページの記載）。金額は変更されるため、公式ページで最新額を確認してください。" },
    conditions: { en: "Only if you apply for the Short-term study visa; the healthcare surcharge and other costs are separate.", ja: "短期学習ビザを申請する場合のみ。医療付加金などは別。" },
    reason: { en: "Matches “It costs £228 for a Short-term study visa” (page updated 2025-02-06). The amount can change, hence the date.", ja: "「It costs £228 for a Short-term study visa」と一致（ページ更新 2025-02-06）。金額は変わりうるため確認日を併記。" } }),
].map(approve);
export const CAN_VISA_CLAIMS: Claim[] = [
  claim({ id: "C1", candidate: "C1", sources: [C.permit6, C.eta], where: where("Official information"), verdict: "conditional",
    text: { en: "IRCC says a study permit is generally not needed for a programme of 6 months or less, but you still need a valid travel document to enter (an eTA or a visitor visa); which one depends on your nationality.", ja: "IRCCの案内では、6か月以内のプログラムなら一般に就学許可（study permit）は不要ですが、入国には有効な渡航書類（eTAまたは訪問者ビザ）が必要です。どちらが必要かは国籍によって異なります。" },
    conditions: { en: "Programme or course of less than 6 months; exceptions to the permit rule exist. The eTA/visa depends on nationality (see C2).", ja: "6か月未満のプログラム・コース。就学許可の例外は別規定。eTA/ビザの要否は国籍で異なる（C2参照）。" },
    reason: { en: "Matches the IRCC answer (qnum=484), which shows no update date. Commercial reuse of Canada.ca text is not confirmed: approve only if paraphrase plus link is acceptable.", ja: "IRCCの回答（qnum=484）と一致。ページに更新日なし。Canada.ca の文章の商用再利用は未確認：言い換え＋リンクで足りると判断する場合のみ承認。" } }),
  claim({ id: "C3", candidate: "C3", sources: [C.permit6, C.permit], where: where("Official information"), verdict: "conditional",
    text: { en: "IRCC says you must get a study permit if you want to study for longer than 6 months; the study permit page lists the application fee (check the current amount there).", ja: "IRCCは、6か月を超えて学習する場合は就学許可（study permit）が必要としています。申請料は study permit のページに記載されています（最新額はそちらで確認）。" },
    conditions: { en: "Programmes longer than 6 months. The fee amount is deliberately not shown on StudyAtlas.", ja: "6か月を超えるプログラム。料金の金額は画面に載せていない。" },
    reason: { en: "Replaces the earlier sentence about applying “before you travel” / “if you may continue studying”, which was not found verbatim on the pages read. Study permit page dated 2026-04-24; commercial reuse of Canada.ca text is not confirmed.", ja: "旧文言の「渡航前に申請」「学習を続ける可能性がある場合」は読んだページに逐語の記載がなかったため、確認できた記載に置き換えた。study permit ページの日付 2026-04-24。Canada.ca の商用再利用は未確認。" } }),
];
export const CAN_NOTES_CLAIMS: Claim[] = [
  claim({ id: "C2", candidate: "C2", sources: [C.eta], where: where("Points to note"), verdict: "conditional",
    text: { en: "The eTA requirement depends on your nationality and how you travel: it is needed if you are from a visa-exempt country and fly to Canada, and not needed if you travel by car, bus, train or boat.", ja: "eTAが必要かどうかは国籍と移動手段で異なります。査証免除国の国籍で航空機を使う場合は必要で、陸路・バス・鉄道・船では不要です。" },
    conditions: { en: "Visa-exempt nationalities studying less than six months; other nationalities need a visitor visa or another document.", ja: "査証免除国の国籍で6か月未満の学習。それ以外の国籍は訪問者ビザなど別の書類。" },
    reason: { en: "Matches the IRCC answer (qnum=1289), no update date. Commercial reuse of Canada.ca text not confirmed (paraphrase plus link only).", ja: "IRCCの回答（qnum=1289）と一致。更新日なし。Canada.ca の商用再利用は未確認（言い換え＋リンクのみ）。" } }),
  claim({ id: "C4-ref", candidate: "C4", sources: [source("https://www2.gov.bc.ca/gov/content/health/accessing-health-care/health-fee-international-students", "Government of British Columbia")], where: where("Points to note"), verdict: "hold",
    text: { en: "Provincial health coverage depends on the permit length and the province – see the Daily life section for British Columbia.", ja: "州の医療保険は就学許可の期間と州によって異なります。ブリティッシュコロンビア州は「暮らし」の項目をご覧ください。" },
    conditions: { en: "A cross-reference to the Vancouver healthcare statements (C4a–C4c), not a separate statement from a source.", ja: "Vancouver の医療欄（C4a〜C4c）への案内で、出典に基づく独立した記述ではない。" },
    reason: { en: "On hold: it is StudyAtlas's own pointer, not a statement taken from a page. Approve C4a–C4c instead; this one can be reworded as a plain link.", ja: "保留：出典のページにある記述ではなく、StudyAtlas 自身の案内文。C4a〜C4c を承認する方が適切で、この文はリンクのみに書き換え可能。" } }),
];
const outline = (claims: Claim[]): Fact<Localized> => factFromClaims(claims, checkOfficial);
const gbrVisa = () => ({ official: outline(GBR_VISA_CLAIMS), notes: outline(GBR_NOTES_CLAIMS) });
const canVisa = () => ({ official: outline(CAN_VISA_CLAIMS), notes: outline(CAN_NOTES_CLAIMS) });
export const countries: Country[] = [
  { code: "CAN", name: { en: "Canada", ja: "カナダ" }, center: [-100, 55], zoom: 2.5, profile: { visa: canVisa() } },
  { code: "GBR", name: { en: "United Kingdom", ja: "イギリス" }, center: [-2, 54], zoom: 4.5, profile: { visa: gbrVisa() } },
  { code: "AUS", name: { en: "Australia", ja: "オーストラリア" }, center: [134, -26], zoom: 3, profile: { visa: visa() } },
];
