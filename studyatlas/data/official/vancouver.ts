import type { ClimateNormals, DataPoint, Evidence, OfficialCityData } from "./types";
import { approveClimate } from "../approvals";
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
    conditions: { en: "Average rent of all rented units of this size in row and apartment structures of three units and over, in the area named “Vancouver, British Columbia” in the Statistics Canada table (census area code 933: a metropolitan-area definition, wider than the City of Vancouver). CMHC Rental Market Survey, reference year 2025. Whole rental market – not student housing, not the price of a newly listed unit.", ja: "Statistics Canadaの表で「Vancouver, British Columbia」とされる地域（国勢調査の地域コード933：都市圏の定義で、バンクーバー市より広い範囲）の、3戸以上の集合住宅・長屋における、この間取りの全賃貸住戸の平均家賃（CMHC 賃貸市場調査、調査対象年2025）。市場全体の値で、学生寮や新規募集物件の価格ではありません。" },
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
const climateOld: ClimateNormals = {
  id: "van-climate-eccc-1108447", cityId: "vancouver", sourceId: "eccc-climate-normals", station: "VANCOUVER INT'L A", stationId: "1108447", period: "1981–2010",
  months: mean.map((m, i) => ({ meanC: m, maxC: max[i], minC: min[i], precipMm: precip[i] })),
  evidence: [{ url: D_ECCC, publisher: "Environment and Climate Change Canada", section: { en: "Canadian Climate Normals 1981–2010, station VANCOUVER INT'L A (1108447): mean daily temperature, mean daily max/min temperature, total precipitation", ja: "カナダ気候平年値 1981–2010、観測地点 VANCOUVER INT'L A（1108447）：日平均気温、日最高・最低気温の平均、降水量" }, quote: `Mean daily temperature deg C: ${mean.join(", ")}` }],
  collectedIds: ["eccc-climate-normals:1108447:temp-mean", "eccc-climate-normals:1108447:temp-max", "eccc-climate-normals:1108447:temp-min", "eccc-climate-normals:1108447:precip"],
  retrievedAt: D, checkedAt: D, status: "verified",
  note: { en: "Values as published by the ECCC GeoMet OGC API (climate-normals collection, normals 1981–2010; calculated 2012-10-10). Superseded on 2026-10-17 by the approved 1991–2020 normals and kept only as history: it is not shown on the site.", ja: "ECCC GeoMet OGC API（climate-normals、1981–2010 平年値、2012-10-10 計算）の公表値です。2026-10-17 に承認済みの 1991–2020 平年値に置き換えたため履歴として保持しているだけで、サイトには表示しません。" },
};

/*
 * 1991–2020 normals (Ver.1.3.5): read on 2026-10-16 from ECCC's bulk download of the Canadian Climate Normals 1991–2020 for British Columbia
 * (Actions run 38904919856; one request, robots.txt allowed). Station: composite "VANCOUVER INTERNATIONAL (AIRPORT)" (normals code C), made from
 * climate IDs 1108447 (VANCOUVER INT'L A) and 1108395 (VANCOUVER INTL A, WMO 71892, YVR), 49.20 N / -123.18 E, elevation 4.3 m.
 * Rows used: "Daily Average (°C)", "Daily Maximum (°C)", "Daily Minimum (°C)" (quality code B) and "Precipitation (mm)" (code C).
 * Licence: ECCC Data Services End-use Licence v2.1.1, August 2026 (commercial use allowed; attribution required).
 * Ver.1.4.3: approved by a person on 2026-10-17 after all 48 values matched ECCC's own CSV (PR #46): this is now `climate` (shown); the earlier
 * 1981–2010 record is kept as `climateAlt` (history only, never shown). The approval record and the approved numbers are in data/approvals.ts.
 */
const D_NEW = "2026-10-16";
const mean2 = [4.1, 4.7, 6.7, 9.4, 13.0, 15.8, 18.2, 18.2, 15.2, 10.3, 6.4, 3.9];
const max2 = [6.8, 7.9, 10.1, 13.1, 16.9, 19.6, 22.4, 22.4, 19.1, 13.5, 9.3, 6.6];
const min2 = [1.4, 1.5, 3.3, 5.7, 9.0, 11.9, 13.9, 14.0, 11.2, 7.0, 3.6, 1.2];
const precip2 = [174.0, 90.8, 106.4, 85.5, 59.1, 51.1, 34.1, 36.1, 51.9, 123.9, 174.6, 172.2];
const climateNew: ClimateNormals = {
  id: "van-climate-eccc-1991-2020", cityId: "vancouver", sourceId: "eccc-climate-normals", station: "VANCOUVER INTERNATIONAL (AIRPORT) – composite of 1108447 and 1108395", stationId: "1108447+1108395", period: "1991–2020",
  months: mean2.map((m, i) => ({ meanC: m, maxC: max2[i], minC: min2[i], precipMm: precip2[i] })),
  evidence: [{ url: "https://climate.weather.gc.ca/climate_normals/index_e.html", publisher: "Environment and Climate Change Canada", section: { en: "Canadian Climate Normals 1991–2020, bulk download for British Columbia (CSV): composite station VANCOUVER INTERNATIONAL (AIRPORT): Daily Average / Daily Maximum / Daily Minimum (°C), Precipitation (mm)", ja: "カナダ気候平年値 1991–2020、ブリティッシュコロンビア州の一括ダウンロード（CSV）：合成観測所 VANCOUVER INTERNATIONAL (AIRPORT) の日平均・日最高・日最低気温（°C）と降水量（mm）" }, quote: `Daily Average (°C): ${mean2.join(", ")}; Precipitation (mm): ${precip2.join(", ")}` }],
  annual: { precipMm: 1159.5 },
  retrievedAt: D_NEW, checkedAt: "2026-10-17", status: "unverified",   // becomes "verified" only through the approval record (approveClimate)
  note: { en: "Official 1991–2020 normals of ECCC's composite station VANCOUVER INTERNATIONAL (AIRPORT), made from climate IDs 1108447 (VANCOUVER INT'L A) and 1108395 (VANCOUVER INTL A, WMO 71892); 49.20 N, 123.18 W; 4.3 m. All 48 monthly values were compared with ECCC's own CSV on 2026-10-17. The annual precipitation (1159.5 mm) is the value ECCC publishes; the monthly values add up to 1159.7 mm – the 0.2 mm difference is within the rounding of the monthly values, but how ECCC calculates its annual value is not stated, so no cause is claimed. Contains information licenced under the Data Server End-use Licence of Environment and Climate Change Canada (Version 2.1.1, August 2026).", ja: "ECCC の合成観測所 VANCOUVER INTERNATIONAL (AIRPORT) の公式な 1991–2020 平年値です。気候ID 1108447（VANCOUVER INT'L A）と 1108395（VANCOUVER INTL A、WMO 71892）を組み合わせたもので、北緯49.20度・西経123.18度、標高4.3mです。48個の月別値は 2026-10-17 に ECCC の元CSVと全件照合しました。年間降水量（1159.5mm）は ECCC が公表する年値で、月別値の合計は1159.7mmです。0.2mmの差は月別値の丸めの範囲内ですが、ECCC が年値をどう算出しているかは示されておらず、原因は断定しません。Contains information licenced under the Data Server End-use Licence of Environment and Climate Change Canada（Version 2.1.1、2026年8月）。" },
};

const ubc = (path: string) => `https://vancouver.housing.ubc.ca/applications/fees-payments/${path}`;
const data: OfficialCityData = { cityId: "vancouver", points, climate: approveClimate(climateNew), climateAlt: climateOld,
  notices: [{ topic: "housing", sourceId: "ubc-housing-fees",
    text: {
      en: "UBC residence fees (2026/27) were reviewed on 14 Oct 2026 but are not shown here: UBC's Terms of Use allow only short, unmodified extracts for personal non-commercial use and require written consent for any republication. Please check the official fee pages. (Room types, contract dates and who can apply are also on those pages.) StudyAtlas will add them if UBC gives permission.",
      ja: "UBCの寮料金（2026/27）は2026年10月14日に調査しましたが、掲載していません。UBCの利用規約では、個人の非商用目的での短い抜粋の利用に限られ、転載には書面による同意が必要なためです。部屋タイプ・契約期間・入居資格を含め、公式の料金ページでご確認ください。UBCの許可が得られた場合に追加します。",
    },
    links: [
      { label: { en: "UBC – Fees & Payments (all residences)", ja: "UBC – 料金と支払い（全寮）" }, url: ubc("") },
      { label: { en: "UBC – Marine Drive fees", ja: "UBC – Marine Drive の料金" }, url: ubc("marine-drive/") },
      { label: { en: "UBC – Place Vanier fees (first-year residence with meal plan)", ja: "UBC – Place Vanier の料金（第一学年寮・食事プラン付き）" }, url: ubc("place-vanier/") },
      { label: { en: "UBC – Eligibility", ja: "UBC – 入居資格" }, url: "https://vancouver.housing.ubc.ca/applications/eligibility/" },
      { label: { en: "UBC – Terms of Use", ja: "UBC – 利用規約" }, url: "https://www.ubc.ca/site/legal.html" },
    ] }],
};
export default data;
