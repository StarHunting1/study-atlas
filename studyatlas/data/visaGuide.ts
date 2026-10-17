import type { Localized } from "@/lib/i18n";
const t = (en: string, ja: string): Localized => ({ en, ja });
/*
 * Visa and healthcare guide of the city page (Ver.1.4.1): which statements and official pages belong to which short card. Display structure only:
 * the statements (claims) and their approval state stay in data/countries.ts and the profiles; nothing here is a fact about anyone's visa.
 * The short texts restate the statements below them in hedged form ("may", "depends") and are never a verdict on a person.
 * Countries without a guide (Australia: nothing researched yet) keep the plain list of official pages.
 */
export type GuideCard = {
  id: string; title: Localized; /** the route the card is about */ route: Localized; summary: Localized;
  /** statements (claim ids) shown in the details, in this order */ claims: string[];
  /** which of them are fees (shown under "料金") */ fees?: string[];
  /** official pages (URLs from data/visa.ts) that belong to this card */ links: string[];
  /** only for these cities (provincial or city-specific cards) */ cities?: string[];
};
export type Guide = { intro: Localized; cards: GuideCard[] };
const G = "https://www.gov.uk/", I = "https://ircc.canada.ca/english/helpcentre/answer.asp?", BC = "https://www2.gov.bc.ca/gov/content/health/";
export const visaGuides: Record<string, Guide> = {
  GBR: {
    intro: t("Which route applies is not decided by the length of stay alone: nationality, age, whether the school is accredited and the type of course all matter. The cards are a guide only – always check the official page.", "どの区分になるかは、滞在期間だけでは決まりません。国籍・年齢・学校の認定・コースの種類などの条件があります。以下は目安です。必ず公式情報で確認してください。"),
    cards: [
      { id: "gbr-visitor", title: t("Study of up to 6 months", "6か月以内の学習"), route: t("Standard Visitor", "Standard Visitor（訪問者）"), summary: t("A course of up to 6 months at an accredited institution can be studied as a Standard Visitor. Depending on your nationality a visa or ETA may still be needed.", "認定機関の6か月以内のコースは、訪問者として学べる場合があります。国籍によってはビザやETAが別途必要です。"), claims: ["U1"], links: [G + "standard-visitor/visit-to-study"] },
      { id: "gbr-short", title: t("English course of 6–11 months", "6か月超〜11か月の英語コース"), route: t("Short-term study visa", "Short-term study visa（短期学習ビザ）"), summary: t("An English-language course at an accredited institution of more than 6 and up to 11 months can fall under the Short-term study visa. Age and nationality can change this.", "認定機関の英語コースが6か月超〜11か月なら、短期学習ビザの対象になる場合があります。年齢や国籍で扱いが変わります。"), claims: ["U2", "U3"], fees: ["U3"], links: [G + "visa-to-study-english"] },
      { id: "gbr-student", title: t("Long-term and university study", "長期留学・大学留学"), route: t("Student visa and others", "Student visa など"), summary: t("Longer study usually involves a Student visa, which needs a place from a licensed student sponsor, enough money, English and an age of 16 or over. Course length alone does not decide it.", "長めの学習では Student visa などが関わります。認可を受けた学校（licensed student sponsor）の受講許可、資金、英語力、16歳以上が条件で、コースの期間だけでは決まりません。"), claims: ["U4"], links: [G + "student-visa"] },
      { id: "gbr-check", title: t("Visa or ETA by nationality", "国籍によるビザ・ETA"), route: t("Check before you travel", "渡航前に確認"), summary: t("Whether you need a visa or an electronic travel authorisation (ETA) depends on your nationality.", "ビザや電子渡航認証（ETA）が必要かどうかは、国籍によって異なります。"), claims: ["U6"], links: [G + "check-uk-visa"] },
      { id: "gbr-health", title: t("Healthcare and insurance", "医療・保険"), route: t("Healthcare surcharge (IHS)", "医療付加金（IHS）"), summary: t("The Immigration Health Surcharge (IHS) is usually paid with a Student or Short-term study visa application. Whether you pay and what you pay depend on the visa, its length and where you apply from.", "Student visa や短期学習ビザでは、通常、申請時に医療付加金（IHS）を支払います。支払いの要否と金額は、ビザの種類・期間・申請場所で異なります。"), claims: ["U5a", "U5b"], links: [G + "healthcare-immigration-application", G + "healthcare-immigration-application/how-much-pay"], cities: ["manchester"] },
    ],
  },
  CAN: {
    intro: t("The documents you need depend on the length of study, your nationality and how you travel. The cards paraphrase the official pages and are a guide only – always check the official page.", "必要な書類は、学習の期間・国籍・移動手段などで変わります。以下は公式ページの内容を言い換えた目安です。必ず公式情報で確認してください。"),
    cards: [
      { id: "can-short", title: t("Study of up to 6 months", "6か月以内の学習"), route: t("Usually no study permit; eTA or visitor visa", "就学許可は一般に不要／eTAまたは訪問者ビザ"), summary: t("A programme of 6 months or less generally needs no study permit, but you need a valid travel document (an eTA or a visitor visa, depending on your nationality).", "6か月以内のプログラムは就学許可（study permit）が一般に不要ですが、入国用の書類（eTAまたは訪問者ビザ。国籍で異なる）が必要です。"), claims: ["C1", "C2"], links: [I + "qnum=484&top=15", I + "qnum=1289&top=23"] },
      { id: "can-long", title: t("Study of more than 6 months", "6か月を超える学習"), route: t("Study permit", "就学許可（study permit）"), summary: t("Study of more than 6 months needs a study permit.", "6か月を超えて学ぶ場合は、就学許可（study permit）が必要とされています。"), claims: ["C3"], links: ["https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html"] },
      { id: "can-health", title: t("Healthcare and insurance (British Columbia)", "医療・保険（ブリティッシュコロンビア州）"), route: t("International student health fee and MSP", "国際学生ヘルスフィーとMSP"), summary: t("British Columbia has an international student health fee and the provincial plan (MSP). Other provinces have their own rules.", "ブリティッシュコロンビア州には、国際学生ヘルスフィーと州の医療保険（MSP）があります。他の州は別の制度です。"), claims: ["C4a", "C4b", "C4c"], links: [BC + "health-drug-coverage/msp", BC + "accessing-health-care/health-fee-international-students"], cities: ["vancouver"] },
    ],
  },
};
