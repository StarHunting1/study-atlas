import type { ClimateNormals, DataPoint, Evidence, OfficialCityData } from "./types";
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
    return { ...rest, id: `${idp}-z${z}`, highlight: idp === "van-monthly-adult" && z === 1, metric: `${metric}.zone${z}`, label: { en: `${labelEn} – ${z}-Zone`, ja: `${labelJa}（${z}ゾーン）` }, value: { amount, currency: "CAD", per }, conditions: { en: cond.en + offPeak.en, ja: cond.ja + offPeak.ja } };
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
  { id: "van-upass", highlight: true, cityId: "vancouver", topic: "transport", sourceId: "translink-fares", metric: "transport.studentProgramPass",
    label: { en: "U-Pass BC (students of participating institutions)", ja: "U-Pass BC（参加校の学生）" }, value: { amount: 47.85, currency: "CAD", per: "month" }, audience: "student",
    conditions: { en: "Most students enrolled at one of the ten participating public post-secondary institutions (including UBC, SFU, Langara, VCC, BCIT); each institution decides eligibility. Paid as part of student fees (not bought individually). Valid on TransLink bus, SeaBus and SkyTrain in Metro Vancouver. Private schools, e.g. most language schools, are not eligible.", ja: "参加している公立高等教育機関10校（UBC、SFU、Langara、VCC、BCIT など）に在籍する大半の学生。対象かどうかは各校が判断。個人購入ではなく学費（学生納付金）に含めて支払います。メトロバンクーバーのバス・シーバス・スカイトレインで利用可。私立校（多くの語学学校を含む）は対象外です。" },
    validFor: "1 Sep 2026 – 31 Aug 2027",
    evidence: [{ url: "https://www.translink.ca/transit-fares/u-pass-bc", publisher: "TransLink", section: { en: "U-Pass FAQ – What is the current U-Pass BC Fee?", ja: "U-Pass FAQ – 現在の U-Pass BC 料金" }, quote: "$47.85 from Sep 1 2026 to Aug 31 2027" },
      { url: "https://www.translink.ca/transit-fares/u-pass-bc", publisher: "TransLink", section: { en: "U-Pass FAQ – Are private institutions eligible?", ja: "U-Pass FAQ – 私立校は対象か" }, quote: "Privately-funded, post-secondary schools are not eligible to join the U-Pass BC Program at this time." }], ...ok,
    note: { en: "The page lists the fee schedule from May 2025 to August 2030; the amount shown is the one in force on the retrieval date.", ja: "ページには2025年5月〜2030年8月の料金表があり、ここでは取得日時点で適用されている額を表示しています。" } },

  // ---- Housing: whole rental market (CMHC via Statistics Canada) – NOT student housing ----
  ...([["bachelor", "Bachelor (studio)", "バチェラー（ワンルーム）", 1667, "Bachelor units"], ["1br", "1 bedroom", "1ベッドルーム", 1807, "One bedroom units"], ["2br", "2 bedrooms", "2ベッドルーム", 2364, "Two bedroom units"], ["3br", "3 bedrooms", "3ベッドルーム", 2820, "Three bedroom units"]] as const).map(([key, en, ja, amount, unit]): DataPoint => ({
    id: `van-cmhc-rent-${key}`, highlight: key === "1br", cityId: "vancouver", topic: "housing", sourceId: "statcan-cmhc-rents", metric: `housing.marketRent.${key}`, collectedId: `statcan-cmhc-rents:vancouver:${key}`,
    label: { en: `Average rent – ${en} (whole market)`, ja: `平均家賃 – ${ja}（市場全体）` }, value: { amount, currency: "CAD", per: "month" }, audience: "renter",
    conditions: { en: "Average rent of all rented units of this size in row and apartment structures of three units and over, Vancouver (CMHC Rental Market Survey). Whole rental market – not student housing, not the price of a newly listed unit.", ja: "バンクーバーの3戸以上の集合住宅・長屋における、この間取りの全賃貸住戸の平均家賃（CMHC 賃貸市場調査）。市場全体の値で、学生寮や新規募集物件の価格ではありません。" },
    validFor: "2025 (latest reference year; released by Statistics Canada 2025-12-17)",
    evidence: [{ url: "https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=3410013301", publisher: "Statistics Canada (CMHC data)", section: { en: `Table 34-10-0133-01 – Vancouver, British Columbia; Row and apartment structures of three units and over; ${unit}`, ja: `表 34-10-0133-01 – Vancouver, British Columbia; ${unit}` }, quote: `Vancouver, British Columbia; Row and apartment structures of three units and over; ${unit}; 2025: ${amount}`, terms: "Statistics Canada Open Licence" }],
    ...ok,
  })),
];

const D_ECCC = "https://climate.weather.gc.ca/climate_normals/";
const mean = [4.13, 4.9, 6.88, 9.39, 12.8, 15.66, 17.96, 18, 14.89, 10.29, 6.33, 3.57];
const max = [6.87, 8.19, 10.34, 13.15, 16.72, 19.59, 22.15, 22.18, 18.9, 13.54, 9.15, 6.28];
const min = [1.36, 1.58, 3.38, 5.57, 8.84, 11.67, 13.71, 13.77, 10.82, 7, 3.48, 0.83];
const precip = [168.44, 104.57, 113.86, 88.53, 65.03, 53.8, 35.58, 36.73, 50.89, 120.76, 188.89, 161.93];
const climate: ClimateNormals = {
  id: "van-climate-eccc-1108447", cityId: "vancouver", sourceId: "eccc-climate-normals", station: "VANCOUVER INT'L A", stationId: "1108447", period: "1981–2010",
  months: mean.map((m, i) => ({ meanC: m, maxC: max[i], minC: min[i], precipMm: precip[i] })),
  evidence: [{ url: D_ECCC, publisher: "Environment and Climate Change Canada", section: { en: "Canadian Climate Normals 1981–2010, station VANCOUVER INT'L A (1108447): mean daily temperature, mean daily max/min temperature, total precipitation", ja: "カナダ気候平年値 1981–2010、観測地点 VANCOUVER INT'L A（1108447）：日平均気温、日最高・最低気温の平均、降水量" }, quote: `Mean daily temperature deg C: ${mean.join(", ")}` }],
  collectedIds: ["eccc-climate-normals:1108447:temp-mean", "eccc-climate-normals:1108447:temp-max", "eccc-climate-normals:1108447:temp-min", "eccc-climate-normals:1108447:precip"],
  retrievedAt: D, checkedAt: D, status: "verified",
  note: { en: "Values as published by the ECCC GeoMet OGC API (climate-normals collection, normals 1981–2010; calculated 2012-10-10). Newer 1991–2020 normals exist on the ECCC website but are not in this API.", ja: "ECCC GeoMet OGC API（climate-normals、1981–2010 平年値、2012-10-10 計算）の公表値です。より新しい 1991–2020 平年値は ECCC のウェブサイトにありますが、この API には含まれていません。" },
};

const data: OfficialCityData = { cityId: "vancouver", points, climate };
export default data;
