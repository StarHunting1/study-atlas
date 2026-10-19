import type { Localized } from "@/lib/i18n";
/*
 * What each city's public transport system looks like, in StudyAtlas's own words (Ver.1.6.3): how fares are paid, whether a student category exists and where its eligibility is decided, and the official fares and map pages.
 * NO fare amount is copied (the publishers' terms are restricted or unreviewed: see rights.data.ts) and NO student discount is promised: eligibility depends on enrolment type, age and residence, so it always points to the official page.
 * `read` = the page's content was read on `checkedAt` by the GitHub Actions probe (read-only, robots.txt respected, one request per page). A guide that was not read (TfL and Transport Victoria answered the
 * automated check with HTTP 403 / a bot check) has only links, and says so. Everything here is "unverified": a short paraphrase of a public page that no person has compared yet.
 */
export type GuideLinkKind = "fares" | "payment" | "student" | "map";
export type GuideLink = { kind: GuideLinkKind; label: Localized; url: string; /** the page was opened by StudyAtlas's own check (false = link only, not confirmed to work) */ opened: boolean };
export type TransportGuide = {
  cityId: string; sourceId: string; /** date the pages were opened; null when they could not be read */ checkedAt: string | null; read: boolean;
  modes?: Localized; payment?: Localized; fareSystem?: Localized; student: Localized; links: GuideLink[];
};
const t = (en: string, ja: string): Localized => ({ en, ja });
export const TRANSPORT_GUIDES: TransportGuide[] = [
  { cityId: "toronto", sourceId: "ttc-fares", checkedAt: "2026-10-19", read: true,
    modes: t("TTC subway, streetcars and buses (see the official routes and schedules).", "TTCの地下鉄・路面電車・バス（路線と時刻は公式ページで確認）。"),
    payment: t("According to the TTC fares page, a fare can be paid with a PRESTO card (physical or in a mobile wallet), a PRESTO ticket, an Interac debit or credit card (including a mobile wallet) or cash. The page also describes monthly fare capping for eligible fares paid by PRESTO, debit or credit card.", "TTCの運賃ページによると、PRESTOカード（物理カードまたはスマホのウォレット）、PRESTOチケット、Interacデビット／クレジットカード（スマホのウォレット含む）、現金で支払えます。PRESTO・デビット・クレジットカードで払う対象運賃には、月ごとの運賃上限（マンスリー・フェア・キャッピング）の説明もあります。"),
    student: t("The TTC lists a post-secondary student fare category. Its eligibility is set on the TTC's own page (it names full-time study at a recognized post-secondary institution or a registered private career college in Toronto). Language-school students are not mentioned there, so check the TTC before assuming a student fare.", "TTCには、ポストセカンダリー（大学・カレッジ等）の学生向けの運賃区分があります。対象はTTC自身のページで定められており（トロント市内の認定された高等教育機関、または登録された私立キャリアカレッジへのフルタイムの在籍と記載）、語学学校の学生には触れていません。学生運賃があると思い込まず、TTCで確認してください。"),
    links: [
      { kind: "fares", label: t("TTC – Fares and passes", "TTC – 運賃とパス"), url: "https://www.ttc.ca/fares-and-passes", opened: true },
      { kind: "student", label: t("TTC – Fare types and discounts (student eligibility)", "TTC – 運賃の種類と割引（学生の対象条件）"), url: "https://www.ttc.ca/Fares-and-passes/Fares-types-and-discounts", opened: true },
      { kind: "map", label: t("TTC – Routes and schedules (maps)", "TTC – 路線と時刻表（路線図）"), url: "https://www.ttc.ca/routes-and-schedules", opened: true },
    ] },
  { cityId: "sydney", sourceId: "tfnsw-fares", checkedAt: "2026-10-19", read: true,
    modes: t("Opal network: trains, buses, ferries and light rail in Sydney and the surrounding regions (Transport for NSW names the Blue Mountains, Central Coast, Hunter and Illawarra).", "Opalの対象：シドニーと周辺地域の電車・バス・フェリー・ライトレール（Transport for NSWは、ブルーマウンテンズ・セントラルコースト・ハンター・イラワラも挙げています）。"),
    payment: t("According to Transport for NSW, you can pay with an Opal card, or with a credit/debit card or a digital wallet (Apple Pay, Google Pay, Samsung Pay) that has the contactless symbol; you tap on at the start and tap off at the end of the trip. Concession fares need a concession entitlement linked to the card.", "Transport for NSWによると、Opalカード、またはコンタクトレスのマークがあるクレジット／デビットカードやデジタルウォレット（Apple Pay・Google Pay・Samsung Pay）で支払えます。乗車時と降車時にタップします。割引運賃には、カードに紐づけた割引の資格（コンセッション）が必要です。"),
    fareSystem: t("The fare depends on where, when and how you travel and on any Opal benefits that apply (see the official fares pages for the amounts).", "運賃は、どこで・いつ・どのように乗るかと、適用されるOpalの特典で変わります（金額は公式の運賃ページで確認）。"),
    student: t("Concession fares exist for tertiary and TAFE students. Transport for NSW describes them for students enrolled full-time and on-campus in an accredited course with a registered higher-education or vocational provider, and names international students only for certain scholarships; language-school courses are not mentioned. Do not assume a student discount – check the official page.", "大学・TAFEの学生には割引運賃があります。Transport for NSWは、登録された高等教育機関または職業教育機関の認定コースにフルタイムで通学（オンキャンパス）する学生を対象とし、留学生が挙がるのは特定の奨学金の場合だけで、語学学校のコースには触れていません。学生割引があると思い込まず、公式ページで確認してください。"),
    links: [
      { kind: "fares", label: t("Transport for NSW – Fares and ways to pay", "Transport for NSW – 運賃と支払い方法"), url: "https://transportnsw.info/tickets-fares/fares", opened: true },
      { kind: "payment", label: t("Transport for NSW – Contactless payments", "Transport for NSW – コンタクトレス決済"), url: "https://transportnsw.info/tickets-fares/contactless-payments", opened: false },
      { kind: "student", label: t("Transport for NSW – Tertiary and TAFE students (eligibility)", "Transport for NSW – 大学・TAFEの学生（対象条件）"), url: "https://transportnsw.info/tickets-fares/eligibility-concessions/tertiary-tafe-students", opened: true },
      { kind: "map", label: t("Transport for NSW – Opal network map (PDF)", "Transport for NSW – Opal路線図（PDF）"), url: "https://transportnsw.info/document/6027/opal-network-map.pdf", opened: false },
    ] },
  { cityId: "london", sourceId: "tfl-fares", checkedAt: null, read: false,
    student: t("Not confirmed: check on the TfL site who can get a student or other discount.", "確認中：学生などの割引の対象は、TfLのサイトで確認してください。"),
    links: [
      { kind: "fares", label: t("TfL – Fares", "TfL – 運賃"), url: "https://tfl.gov.uk/fares", opened: false },
      { kind: "student", label: t("TfL – Free and discounted travel (eligibility)", "TfL – 無料・割引の乗車（対象条件）"), url: "https://tfl.gov.uk/fares/free-and-discounted-travel", opened: false },
      { kind: "map", label: t("TfL – Maps", "TfL – 路線図"), url: "https://tfl.gov.uk/maps", opened: false },
    ] },
  { cityId: "melbourne", sourceId: "ptv-fares", checkedAt: null, read: false,
    student: t("Not confirmed: check on the Transport Victoria site who can get a concession fare.", "確認中：割引運賃の対象は、Transport Victoriaのサイトで確認してください。"),
    links: [
      { kind: "fares", label: t("Transport Victoria – Fares", "Transport Victoria – 運賃"), url: "https://transport.vic.gov.au/tickets-and-myki/fares", opened: false },
      { kind: "payment", label: t("Transport Victoria – myki", "Transport Victoria – myki"), url: "https://transport.vic.gov.au/tickets-and-myki/myki", opened: false },
    ] },
];
export const guideOf = (cityId: string) => TRANSPORT_GUIDES.find((g) => g.cityId === cityId);
export const guideLink = (g: TransportGuide, kind: GuideLinkKind) => g.links.find((l) => l.kind === kind);
