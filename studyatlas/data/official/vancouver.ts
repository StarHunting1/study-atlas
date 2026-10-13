import type { DataPoint, Evidence, OfficialCityData } from "./types";
/*
 * Vancouver – official figures. TransLink quotes are verbatim page text read by the collector's live probe on
 * GitHub Actions (2026-10-13, robots.txt allowed). CMHC rents and ECCC climate normals come from open APIs
 * (collector sources statcan-cmhc-rents / eccc-climate-normals).
 */
const D = "2026-10-13";
const FARES = "https://www.translink.ca/transit-fares/pricing-and-fare-zones";
const ev = (sectionEn: string, sectionJa: string, quote: string): Evidence => ({ url: FARES, publisher: "TransLink", section: { en: sectionEn, ja: sectionJa }, quote });
const fareYear = "‘Current Fares’ column of the TransLink fare tables as of 13 Oct 2026 (the page also shows a ‘July 1 Fares’ column without a year)";
const ok = { retrievedAt: D, checkedAt: D, status: "verified" as const };
const adult = { en: "Adult fare: most people aged 19 to 64 (TransLink definition).", ja: "大人運賃：19〜64歳の大半の利用者（TransLink の定義）。" };
const offPeak = { en: " After 6:30 p.m. on weekdays, at weekends and on statutory holidays every trip is a 1-Zone fare; all bus trips are 1-Zone at all times.", ja: " 平日18時30分以降・週末・祝日は全区間1ゾーン運賃、バスは常に1ゾーン運賃。" };

const SV = "Stored Value Adult Fares Zone Current Fares July 1 Fares 1-Zone $2.85 $2.85 (+$0.15) 2-Zone $4.20 $4.20 (+$0.20) 3-Zone $5.40";
const MP = "Adult Monthly Pass Zone Current Fares July 1 Fares 1-Zone $117.20 $117.20 (+$5.60) 2-Zone $156.70 $156.70 (+$7.45) 3-Zone $211.65";
const CASH = "Adult Cash Fares Zone Current Fares July 1 Fares 1-Zone $3.50 $3.50 (+$0.15) 2-Zone $5.10 $5.10 (+$0.25) 3-Zone $6.70";

const zones = (base: Omit<DataPoint, "id" | "label" | "value" | "metric" | "conditions"> & { idp: string; metric: string; labelEn: string; labelJa: string; cond: { en: string; ja: string } }, amounts: [number, number, number], per: "trip" | "month") =>
  amounts.map((amount, i): DataPoint => {
    const { idp, labelEn, labelJa, cond, metric, ...rest } = base; const z = i + 1;
    return { ...rest, id: `${idp}-z${z}`, metric: `${metric}.zone${z}`, label: { en: `${labelEn} – ${z}-Zone`, ja: `${labelJa}（${z}ゾーン）` }, value: { amount, currency: "CAD", per }, conditions: { en: cond.en + offPeak.en, ja: cond.ja + offPeak.ja } };
  });

const points: DataPoint[] = [
  ...zones({ idp: "van-fare-stored-adult", metric: "transport.single.adult", labelEn: "Single fare, Compass Card Stored Value (adult)", labelJa: "片道 Compass Card ストアドバリュー（大人）", cityId: "vancouver", topic: "transport", sourceId: "translink-fares", audience: "adult",
    cond: { en: `${adult.en} Paid with Stored Value on a Compass Card; valid 90 minutes across bus, SkyTrain, SeaBus and HandyDART.`, ja: `${adult.ja} Compass Card のストアドバリューで支払い。バス・スカイトレイン・シーバス・HandyDART で90分間有効。` },
    validFor: fareYear, evidence: [ev("Fare Pricing – Stored Value Adult Fares", "運賃 – ストアドバリュー大人運賃", SV)], ...ok }, [2.85, 4.2, 5.4], "trip"),
  ...zones({ idp: "van-fare-cash-adult", metric: "transport.singleCash.adult", labelEn: "Single fare, cash / contactless (adult)", labelJa: "片道 現金・タッチ決済（大人）", cityId: "vancouver", topic: "transport", sourceId: "translink-fares", audience: "adult",
    cond: { en: `${adult.en} Compass Ticket bought with cash, or contactless card payment (same price).`, ja: `${adult.ja} 現金で購入する Compass Ticket、またはクレジットカード等のタッチ決済（同額）。` },
    validFor: fareYear, evidence: [ev("Fare Pricing – Adult Cash Fares", "運賃 – 大人現金運賃", CASH)], ...ok }, [3.5, 5.1, 6.7], "trip"),
  ...zones({ idp: "van-monthly-adult", metric: "transport.monthlyPass.adult", labelEn: "Monthly Pass (adult)", labelJa: "マンスリーパス（大人）", cityId: "vancouver", topic: "transport", sourceId: "translink-fares", audience: "adult",
    cond: { en: `${adult.en} Unlimited SkyTrain and SeaBus within the zones purchased, plus unlimited buses and HandyDART at any time.`, ja: `${adult.ja} 購入ゾーン内のスカイトレイン・シーバスが乗り放題、バスと HandyDART は常に乗り放題。` },
    validFor: fareYear, evidence: [ev("Monthly Pass (Compass Card) – Adult Monthly Pass", "マンスリーパス – 大人", MP)], ...ok }, [117.2, 156.7, 211.65], "month"),
  { id: "van-monthly-concession", cityId: "vancouver", topic: "transport", sourceId: "translink-fares", metric: "transport.monthlyPass.concession",
    label: { en: "Concession Monthly Pass (all zones)", ja: "コンセッション・マンスリーパス（全ゾーン）" }, value: { amount: 66.95, currency: "CAD", per: "month" }, audience: "youth",
    conditions: { en: "Concession fares: youth 13 to 18, seniors 65 and older, HandyCard holders; valid photo ID proving age required. University students aged 19+ are not eligible for concession fares (they may have U-Pass BC through their institution).", ja: "コンセッション運賃：13〜18歳、65歳以上、HandyCard 所持者が対象（年齢を証明する写真付きIDが必要）。19歳以上の大学生は対象外です（在籍校を通じて U-Pass BC がある場合があります）。" },
    validFor: fareYear, evidence: [ev("Monthly Pass (Compass Card) – Concession Monthly Pass", "マンスリーパス – コンセッション", "Concession Monthly Pass Zone Current Fares July 1 Fares All Zones $66.95"),
      ev("Concession Fares", "コンセッション運賃", "Concession fares are discounted fares available for the following customers: HandyCard holders Seniors 65 and older* Youth 13 to 18 years old* *Must have a valid photo ID proving age.")], ...ok },
  { id: "van-daypass-adult", cityId: "vancouver", topic: "transport", sourceId: "translink-fares", metric: "transport.dayPass.adult",
    label: { en: "DayPass (adult, all zones)", ja: "デイパス（大人・全ゾーン）" }, value: { amount: 12.55, currency: "CAD", per: "day" }, audience: "adult",
    conditions: { en: `${adult.en} Unlimited bus, SkyTrain, SeaBus and HandyDART for one day, all zones.`, ja: `${adult.ja} 1日間、全ゾーンでバス・スカイトレイン・シーバス・HandyDART が乗り放題。` },
    validFor: fareYear, evidence: [ev("DayPass (Compass Card/Ticket) – Adult DayPass", "デイパス – 大人", "Adult DayPass Zone Current Fares July 1 Fares All Zones $12.55")], ...ok },
];

const data: OfficialCityData = { cityId: "vancouver", points };
export default data;
