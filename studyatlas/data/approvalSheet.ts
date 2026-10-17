import type { Claim } from "./schema";
import { GBR_VISA_CLAIMS, GBR_NOTES_CLAIMS, CAN_VISA_CLAIMS, CAN_NOTES_CLAIMS } from "./countries";
import { UK_HEALTH_CLAIMS } from "./profiles/manchester";
import { BC_HEALTH_CLAIMS } from "./profiles/vancouver";
import official from "./official/vancouver";
import { RIGHTS } from "./official/rights.data";
import { SCOPE, TERMS_CHECK } from "./approvalScope";
import type { ClimateNormals } from "./official/types";
import { ALL_RENT_CANDIDATES, RENT_APPROVALS, rentDigest } from "./official/cityRents";
import { rentBasisOf } from "./official/rentBasis";

/** Where each list of claims lives in the code (what a reviewer edits to approve one claim). */
export const CLAIM_GROUPS: { file: string; name: string; fact: string; claims: Claim[] }[] = [
  { file: "data/countries.ts", name: "GBR_VISA_CLAIMS", fact: "United Kingdom · visa.official", claims: GBR_VISA_CLAIMS },
  { file: "data/countries.ts", name: "GBR_NOTES_CLAIMS", fact: "United Kingdom · visa.notes", claims: GBR_NOTES_CLAIMS },
  { file: "data/profiles/manchester.ts", name: "UK_HEALTH_CLAIMS", fact: "Manchester · living.healthcare", claims: UK_HEALTH_CLAIMS },
  { file: "data/countries.ts", name: "CAN_VISA_CLAIMS", fact: "Canada · visa.official", claims: CAN_VISA_CLAIMS },
  { file: "data/countries.ts", name: "CAN_NOTES_CLAIMS", fact: "Canada · visa.notes", claims: CAN_NOTES_CLAIMS },
  { file: "data/profiles/vancouver.ts", name: "BC_HEALTH_CLAIMS", fact: "Vancouver · living.healthcare", claims: BC_HEALTH_CLAIMS },
];
/** Published annual precipitation of the 1991–2020 composite station (ECCC bulk CSV, "Year" column, as read in Actions run 38904919856). Used only to check that the monthly values add up. */
export const ECCC_ANNUAL_PRECIP_1991_2020 = 1159.5;
export type Check = { label: string; ok: boolean; detail: string };
/** Mechanical consistency checks of a climate record. They find typing errors; they do not verify the values against the source (a person does that). */
export function climateChecks(c: ClimateNormals, annualPrecip?: number): Check[] {
  const m = c.months; const out: Check[] = [];
  out.push({ label: "12か月分がそろっている", ok: m.length === 12 && m.every((x) => x.meanC !== undefined && x.maxC !== undefined && x.minC !== undefined && x.precipMm !== undefined), detail: `${m.length} か月` });
  const order = m.map((x, i) => (x.minC! <= x.meanC! && x.meanC! <= x.maxC! ? "" : `${i + 1}月`)).filter(Boolean);
  out.push({ label: "各月で 日最低 ≤ 日平均 ≤ 日最高", ok: order.length === 0, detail: order.length ? `不整合: ${order.join(", ")}` : "全12か月で成立" });
  const range = m.every((x) => [x.meanC!, x.maxC!, x.minC!].every((v) => v > -40 && v < 45) && x.precipMm! >= 0 && x.precipMm! < 1000);
  out.push({ label: "値が現実的な範囲（気温 −40〜45 ℃、月降水量 0〜1000 mm）", ok: range, detail: range ? "範囲内" : "範囲外の値あり" });
  const sum = Number(m.reduce((n, x) => n + (x.precipMm ?? 0), 0).toFixed(1));
  if (annualPrecip !== undefined) out.push({ label: `月降水量の合計が公表の年値（${annualPrecip} mm）と、月値12個の四捨五入の最大誤差（±0.6 mm）以内で一致`, ok: Math.abs(sum - annualPrecip) <= 0.6, detail: `合計 ${sum} mm、差 ${(sum - annualPrecip).toFixed(1)} mm` });
  const mean = m.map((x) => x.meanC!); const warm = mean.indexOf(Math.max(...mean)), cold = mean.indexOf(Math.min(...mean));
  out.push({ label: "最暖月が7〜8月、最寒月が12〜2月（北半球の気候として自然）", ok: [6, 7].includes(warm) && [11, 0, 1].includes(cold), detail: `最暖 ${warm + 1}月、最寒 ${cold + 1}月` });
  out.push({ label: "観測所ID・期間・出典URL・取得日・引用が記録されている", ok: !!(c.stationId && c.period && c.evidence[0]?.url && c.retrievedAt && c.evidence[0]?.quote), detail: `${c.stationId}／${c.period}／${c.retrievedAt}` });
  return out;
}
export const CANDIDATES = ["U1", "U2", "U3", "U4", "U5", "U6", "C1", "C2", "C3", "C4"];
export const allClaims = () => CLAIM_GROUPS.flatMap((g) => g.claims.map((c) => ({ ...c, group: g })));
const esc = (t: string) => t.replace(/\|/g, "\\|").replace(/\n/g, " ");
const mark = (c: { status: string }) => (c.status === "verified" ? "x" : " ");
const VERDICT = { recommend: "推奨", conditional: "条件つき推奨", hold: "保留" } as const;

export function approvalSheet(): string {
  const L: string[] = []; const all = allClaims();
  L.push("# 承認シート（Ver.1.3.6／1.3.9 チェックリスト追加）— 政府情報の主張ごとの承認と Vancouver 気候データ", "", "_`npm run approvals` が `data/approvalSheet.ts` と各データから生成します。手で編集しないでください。_", "",
    "**承認の状況（Ver.1.4.0）**: 人が明示的に承認した英国の5件（U1・U2・U3・U5b・U6）だけが `verified`（承認記録は `data/approvals.ts`、承認者 StarHunting1、2026-10-17）。それ以外の主張は `unverified` のままで（Vancouver の 1991–2020 気候データは Ver.1.4.3 で承認・反映済み。§5）、画面にも「未確認」と表示されます。自動のページ確認（GitHub Actions）だけで `verified` にすることはありません。`verified` にできるのは、人が承認の記録（承認者・日付・比較した内容）を `data/approvals.ts` に書いた主張だけです（`approve()` と `data/validate.ts` が検査し、承認後に文言・条件・出典を変えるとビルドが失敗します）。", "",
    "| 承認済み（verified） | 承認者・日付 | 承認の根拠 |", "|---|---|---|",
    ...all.filter((c) => c.status === "verified").map((c) => `| ${c.id} | ${c.approval!.by}・${c.approval!.at} | ${esc(c.approval!.compared)} |`), "",
    "## 1. 承認の単位と手順", "",
    "- 画面の1つの項目（Fact）は、複数の主張（claim）からできています。**主張ごと**に `status` と承認記録を持つので、1件ずつ承認できます。Fact 全体は「全ての主張が verified」のときだけ verified になり、一部だけ承認した場合は、画面で主張ごとに確認状況が表示されます。",
    "- 承認する手順: ①根拠のURLを開いて文言・数値が一致することを確認 → ②下の「編集する場所」の該当 claim で `status: \"verified\"` にし、`approval: { by: \"氏名\", at: \"YYYY-MM-DD\", compared: \"何と何を比べたか\" }`、`period`、`checkedAt` を設定 → ③`npm test` と `npm run approvals`。",
    "- 保留の主張は承認できません（`hold` のまま verified にするとビルドが失敗します）。文言を直すか、リンクのみにしてください。",
    "- ビザ・医療費は、承認後も Planner に自動計上しません（`tests/releasecheck.test.ts`）。", "",
    "## 2. 候補（U1〜U6、C1〜C4）と主張の対応", "", "| 候補 | 主張 | 推奨 | 状態 |", "|---|---|---|---|");
  for (const cand of CANDIDATES) { const cs = all.filter((c) => c.candidate === cand); L.push(`| ${cand} | ${cs.map((c) => c.id).join(", ")} | ${cs.map((c) => `${c.id}: ${VERDICT[c.review.verdict]}`).join(" / ")} | ${cs.map((c) => `${c.id}: ${c.status}`).join(", ")} |`); }
  const hold = all.filter((c) => c.review.verdict === "hold");
  L.push("", `集計: 主張 ${all.length} 件（推奨 ${all.filter((c) => c.review.verdict === "recommend").length}／条件つき推奨 ${all.filter((c) => c.review.verdict === "conditional").length}／保留 ${hold.length}）。verified は ${all.filter((c) => c.status === "verified").length} 件。`, "");
  L.push("## 3. 保留すべき情報", "");
  for (const c of hold) L.push(`- **${c.id}**（候補 ${c.candidate}）: ${c.review.reason.ja}`);
  L.push("- **U5-visa（承認候補から除外）**: U5a・U5b と内容が重複する（同じ料金ページを根拠に、IHS の前払いと6か月以内の免除だけを言い直した文）ため、Ver.1.3.10 で claim から外した。U5 は U5a・U5b で承認する。国ページには医療情報への案内リンクのみを置く場合も、承認対象の claim にはしない。", "- **U4・U5a（文言を修正、条件つき）**: Ver.1.3.10 で、U4 は「長いコース＝Student visa」と読めない形に、U5a は「IHSを支払えばNHSを利用できる」と断定しない形に直した。修正後の文言は、承認者が出典ページと照合してから承認する。");
  L.push("- **U5（旧文言）の「訪問者の滞在にはIHSがなく保険が必要」**: 読んだページにない推論のため画面から削除済み（承認対象にしていない）。", "- **C3 の旧文言「渡航前に申請」「学習を続ける可能性がある場合」**: 逐語の記載が確認できず、確認できた記載に置き換え済み。", "- **Canada.ca の商用再利用（C1・C2・C3）と BC州の転載（C4a〜c）**: 利用条件が未確認／書面許可が必要なため、承認する場合も「言い換え＋リンクのみ」で足りるという判断が必要。許可を得ない限り引用・転載はしない。", "");
  L.push("## 3b. 承認の判断サマリー（人が決めること）", "", "| 主張 | 判断 | 対象（国籍／滞在期間／ビザ区分） | 承認前に人が決めること |", "|---|---|---|---|");
  for (const c of all) { const k = SCOPE[c.id]; L.push(`| ${c.id} | ${VERDICT[c.review.verdict]} | ${esc(k.who)}／${esc(k.stay)}／${esc(k.visa)} | ${esc(k.decide)} |`); }
  L.push("", "### 再利用条件が未確認の出典（確認先）", "", "| 出典 | 対象の主張 | 確認する公式ページ | 確認したいこと |", "|---|---|---|---|");
  for (const t of TERMS_CHECK) L.push(`| ${t.who} | ${t.claims} | ${t.pages.map((p) => `[${esc(p.label)}](${p.url})`).join("<br>")} | ${esc(t.question)} |`);
  L.push("", "※ 上のページは、この資料を作った環境からは開いていません（承認者が直接確認してください）。確認が取れるまで、Canada.ca と BC州の主張は「言い換え＋リンクのみ」の扱いで、引用・転載はしません。", "",
    "### Fact ごとの表示（一部だけ承認したとき）", "", "| 画面の項目（Fact） | 含まれる主張 | 一部だけ承認したとき |", "|---|---|---|");
  for (const g of CLAIM_GROUPS) L.push(`| ${g.fact} | ${g.claims.map((c) => c.id).join(", ")} | 承認した主張だけが「確認済み」、残りは「未確認」。Fact 全体は全主張が承認されるまで「未確認」 |`);
  L.push("", "## 4. 主張ごとの承認シート", "");
  for (const g of CLAIM_GROUPS) for (const c of g.claims) {
    L.push(`### ${c.id}（候補 ${c.candidate}）— ${VERDICT[c.review.verdict]}`, "",
      `| 項目 | 内容 |`, `|---|---|`,
      `| 公開予定の文言（日本語） | ${esc(c.text.ja)} |`, `| 公開予定の文言（English） | ${esc(c.text.en)} |`,
      `| 公式出典 | ${c.sources.map((s) => `[${esc(s.publisher)}](${s.url})`).join("<br>")} |`,
      `| 確認日・対象期間 | ${c.checkedAt ?? "—"}・${c.period ?? "—"}（Actions のページ確認） |`,
      `| 適用条件と例外 | ${esc(c.conditions.ja)} |`,
      `| 利用条件（商用再利用） | ${[...new Set(c.sources.map((s) => s.terms ?? "未確認"))].map(esc).join("<br>")} |`,
      `| 推奨と理由 | **${VERDICT[c.review.verdict]}**：${esc(c.review.reason.ja)} |`,
      `| 画面上の表示場所 | ${esc(c.where)}（${g.fact}） |`,
      `| 現在の状態 | ${c.status}${c.approval ? `（承認: ${c.approval.by}、${c.approval.at}、${esc(c.approval.compared)}）` : "（承認記録なし）"} |`,
      `| 対象（国籍） | ${esc(SCOPE[c.id].who)} |`, `| 対象（滞在期間・コース） | ${esc(SCOPE[c.id].stay)} |`, `| 対象（ビザ区分） | ${esc(SCOPE[c.id].visa)} |`,
      `| 既存表示との違い | ${esc(SCOPE[c.id].changed)} |`, `| 承認前に人が決めること | ${esc(SCOPE[c.id].decide)} |`,
      `| 編集する場所 | \`${g.file}\` の \`${g.name}\`（claim \`${c.id}\`） |`, "",
      `**承認チェックリスト（${c.id}）** — ${c.status === "verified" ? `✅ **承認済み**（${c.approval!.by}、${c.approval!.at}。記録: \`data/approvals.ts\`）。以下は承認時の確認項目` : "承認者が1件ずつ印を付けます。**全部に印が付くまで \`verified\` にしません。**"}`, "",
      `- [${mark(c)}] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している`,
      `- [${mark(c)}] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている`,
      `- [${mark(c)}] 再利用条件を判断した（${c.candidate.startsWith("U") ? "OGL v3.0：出典表示で可" : "Canada.ca／BC州：言い換え＋リンクで足りると判断した、または書面確認を得た"}）`,
      `- [${mark(c)}] 金額・日付がある場合、確認日が文言に併記されている`,
      `- [${mark(c)}] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した`,
      `- [${mark(c)}] 承認の記録を書いた：\`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }\`、\`checkedAt\`、\`period\``, "");
  }
  // ---- Vancouver climate
  const old = official.climateAlt!, nw = official.climate!; const r = RIGHTS["eccc-climate-normals"];
  const f1 = (x?: number) => (x === undefined ? "—" : x.toFixed(1)); const d1 = (a?: number, b?: number) => { if (a === undefined || b === undefined) return "—"; const x = Number((b - a).toFixed(1)); return x === 0 ? "0.0" : `${x > 0 ? "+" : ""}${x.toFixed(1)}`; };
  const MO = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const tot = (c: typeof old) => c.months.reduce((n, m) => n + (m.precipMm ?? 0), 0);
  L.push("## 5. Vancouver の気候データ（K1）: 承認済み・本番反映（Ver.1.4.3）— 画面は 1991–2020、1981–2010 は履歴", "",
    "| 項目 | 旧（履歴・画面には表示しない） | 現在（画面・verified・承認済み） |", "|---|---|---|",
    `| 承認 | — | ${nw.approval ? `${nw.approval.by}・${nw.approval.at}` : "なし"} |`, `| 年間降水量 | （月の合計 ${old.months.reduce((n, m) => n + (m.precipMm ?? 0), 0).toFixed(1)} mm） | ECCC の年値 ${nw.annual?.precipMm} mm（画面に表示） |`,
    `| 基準期間 | ${old.period} | ${nw.period} |`, `| 観測地点 | ${old.station}（気候ID ${old.stationId}） | ${nw.station} |`, `| 状態 | ${old.status} | ${nw.status} |`,
    `| 単位 | 気温 ℃（日平均・日最高・日最低の月平均）、降水量 mm（月合計） | 同じ（ECCC の行: Daily Average / Daily Maximum / Daily Minimum (°C)、Precipitation (mm)） |`,
    `| 取得日・方法 | ${old.retrievedAt}・ECCC GeoMet API（2012-10-10 計算） | ${nw.retrievedAt}・ECCC 一括CSV（BC州）を1回取得（Actions run 38904919856） |`,
    `| 出典URL | ${old.evidence.map((e) => e.url).join(", ")} | ${nw.evidence.map((e) => e.url).join(", ")}（一括ダウンロード: \`/climate_normals/download/1991_e.html?area=province&province[]=BC&product[]=data&product[]=station_inventory\`） |`,
    `| 利用許諾 | ${r.licence}（商用利用可・出典表示が必要） | 同じ |`, `| 出典表示（画面に表示する文言） | ${r.attribution} | 同じ |`, "",
    "**観測地点・合成観測所の条件**: 1991–2020 の値は ECCC の「合成観測所」（normals code C）VANCOUVER INTERNATIONAL (AIRPORT) のもので、気候ID **1108447（VANCOUVER INT'L A）と 1108395（VANCOUVER INTL A、WMO 71892、YVR）** を組み合わせています（北緯49.20・西経123.18・標高4.3 m）。観測所IDは2013年前後で切り替わるため、30年分は2つのIDの観測をつないだものです。1981–2010 は旧ID 1108447 のみです。品質コード: 気温 B、降水量 C（ECCC の凡例による）。承認者は、この合成が「バンクーバー国際空港の平年値」として適切かを判断してください。", "",
    "| 月 | 日平均 旧→新 (℃) | 差 | 日最高 旧→新 (℃) | 差 | 日最低 旧→新 (℃) | 差 | 降水量 旧→新 (mm) | 差 |", "|---|---|---|---|---|---|---|---|---|");
  nw.months.forEach((m, i) => { const o = old.months[i]; L.push(`| ${MO[i]} | ${f1(o.meanC)} → ${f1(m.meanC)} | ${d1(o.meanC, m.meanC)} | ${f1(o.maxC)} → ${f1(m.maxC)} | ${d1(o.maxC, m.maxC)} | ${f1(o.minC)} → ${f1(m.minC)} | ${d1(o.minC, m.minC)} | ${f1(o.precipMm)} → ${f1(m.precipMm)} | ${d1(o.precipMm, m.precipMm)} |`); });
  L.push("", `年間降水量（月の合計）: ${tot(old).toFixed(1)} mm → ${tot(nw).toFixed(1)} mm（${d1(tot(old), tot(nw))}）。ECCC の年値（1991–2020）は 1159.5 mm。`, "",
    "**画面を切り替えた影響**（2026-10-17 の承認を受けて Ver.1.4.3 で反映済み）:",
    "- 都市ページの「気候」と都市比較の月別表の値が、上表の「新」に変わる（気温は最大 ±0.4 ℃、降水量は月により最大 ±14 mm 程度の増減）。",
    "- 「最新の標準期間（1991–2020）ではありません」という注意書きは、期間の終わりが 2020 になるため表示されなくなる（Manchester は 1971–2000 のまま注意書きが残る）。",
    "- 画面の確認状況は「確認済み」（承認記録つき）。観測所の表記は合成観測所の名称と気候IDに変わった。",
    "- 出典表示（ECCC の文言）と出典URL（上表）が表示される。",
    "- 切り替え内容: `data/official/vancouver.ts` で 1991–2020 を `climate`（承認記録は `data/approvals.ts`）、旧 1981–2010 を `climateAlt`（履歴、非表示）に入れ替えた。1981–2010 と 1991–2020 の値は混在させない。", "",
    "**整合性の機械チェック**（入力ミスの検出用。出典との照合は人が行います）:", "", "| 確認項目 | 結果 | 詳細 |", "|---|---|---|",
    ...climateChecks(nw, ECCC_ANNUAL_PRECIP_1991_2020).map((k) => `| ${k.label} | ${k.ok ? "✅ 一致" : "❌ 要確認"} | ${esc(k.detail)} |`),
    "", "- 年平均気温など、気温の年値は記録していません。承認者が ECCC の CSV（Year 列）と月別値を照合してください。",
    "- 旧 1981–2010 との差は上表のとおり（気温は最大 ±0.4 ℃、月降水量は最大 −14.3〜+10.3 mm）。基準期間が10年ずれたこと（1981–2010 → 1991–2020）と、観測所が単独の 1108447 から合成観測所（1108447＋1108395）に変わったことの両方が考えられ、この資料だけではどちらの影響かを分けられません。",
    "", "### ECCC の元 CSV との照合結果（Ver.1.4.2、GitHub Actions run 39051554489・2026-10-17）", "",
    "ECCC の一括CSV（`1991-2020_Canadian_Climate_Normals_BC_Data.csv`、ブリティッシュコロンビア州、HTTP 200、1回だけ取得、robots.txt 許可）の「VANCOUVER INTERNATIONAL (AIRPORT)」の Normal の行と、保存済みの値を列の見出し（NORMALS_ELEMENT）で突き合わせた結果です。取得したCSVは保存していません。", "",
    "| 要素（CSV の NORMALS_ELEMENT） | 月別12値 | ECCC の年値 | 月値の平均／合計 | コード |", "|---|---|---|---|---|",
    "| Daily Average (°C) | **12/12 一致** | 10.5 | 平均 10.49 | B |", "| Daily Maximum (°C) | **12/12 一致** | 14.0 | 平均 13.98 | B |", "| Daily Minimum (°C) | **12/12 一致** | 7.0 | 平均 6.97 | B |", "| Precipitation (mm) | **12/12 一致** | 1159.5 | 合計 1159.7 | C |", "",
    "- **一致**：48個すべて（4要素×12か月）。不一致は 0 件。",
    "- **年値**：気温の年値は月値の平均を小数第1位に丸めた値と一致（10.49→10.5、13.98→14.0、6.97→7.0）。降水量は ECCC の年値 1159.5 mm と月値の合計 1159.7 mm で **0.2 mm 差**。月値12個はそれぞれ小数第1位への四捨五入なので、合計には最大 ±0.6 mm の誤差が入りうる範囲に収まっている（0.2 mm は範囲内）。ただし ECCC が年値をどう算出しているか（月値の合計か、年ごとの値の平均か）は CSV や資料に書かれておらず、**差の原因を断定はできません**。",
    "- **観測所**（観測所一覧より）：合成観測所 VANCOUVER INTERNATIONAL (AIRPORT)（NORMALS_CODE C）。構成：VANCOUVER INT'L A（気候ID 1108447、TC識別子 YVR、WMO なし、北緯49.20・西経-123.18、標高4.3 m）と VANCOUVER INTL A（気候ID 1108395、WMO 71892、YVR、北緯49.19・西経-123.18、標高4.3 m）。ID は保存値（1108447＋1108395）と一致。",
    "- **単位・期間**：気温 °C、降水量 mm。ECCC の 1991–2020 カナダ気候平年値（Normal）。保存値の期間表記 1991–2020 と一致。",
    "- **ライセンス**（ECCC の公式ページで確認、HTTP 200）：Environment and Climate Change Canada Data Services End-use Licence **Version 2.1.1（2026年8月版）**。「商用目的を含めて」世界的・無償・永続的・非独占で利用可。出典表示：「Contains information licenced under the Data Server End-use Licence of Environment and Climate Change Canada.」（本サイトはこの文言を表示する設定）。保存値の記録は v2.1 と書いているので、版番号を 2.1.1 に直す余地がある（内容の違いは未確認）。",
    "- **未確認・未解決**：①コード B（気温）・C（降水量）の意味（ECCC の凡例）は今回確認していません。②降水量の年値の差 0.2 mm の算出方法。③この照合は Actions が取得した CSV と保存値の機械的な一致で、**人による承認ではありません**。",
    "", "### 気候データ承認チェックリスト（K1）", "",
    "- [ ] ECCC の公式ページ／一括CSVを開き、観測所（合成観測所 VANCOUVER INTERNATIONAL (AIRPORT)、気候ID 1108447・1108395）が一致している",
    "- [ ] 月別の日平均・日最高・日最低（℃）と降水量（mm）の48個の値が上表の「新」と一致している（年値も照合）— Actions の機械照合では全一致（上の結果）。人の最終確認はここ",
    "- [ ] 単位・基準期間（1991–2020）・品質コード（気温 B、降水量 C）を確認した",
    "- [ ] ライセンス（ECCC Data Services End-use Licence v2.1.1）と出典表示の文言が画面に出る設定になっている",
    "- [ ] 画面を切り替えたときの影響（上記）を読み、1981–2010 を履歴（`climateAlt`）に残す手順に同意した",
    "- [x] 承認の記録を書いた（2026-10-17、StarHunting1。`data/approvals.ts`）", "",
    "**Manchester**: 1991–2020 は取り込めていません（旧 1971–2000 のまま）。理由は `data/APPROVAL_CANDIDATES.md` の「気候データの承認候補」を参照。");
  L.push("", "## 6. Toronto・London の家賃統計（Ver.1.5.1）: 照合済み・承認待ち（verified ではありません）", "",
    "公式データとの再照合は 2026-10-17 の GitHub Actions（run 39065320556、読み取り専用・robots.txt 順守・再試行なし）で実施し、**5つの数値すべてが公式と一致**しました。ここに書いてあるのは承認の**準備**だけです。承認記録（`RENT_APPROVALS`）が空の間、数値は画面にも比較にも出ず、どれも verified になりません。承認は**数値ごと**（Toronto 4件・London 1件）に別々にできます。",
    "", "| 項目 | 内容 |", "|---|---|",
    "| Toronto の出典 | Statistics Canada 表 34-10-0133-01（CMHC 賃貸市場調査）。地域メンバー125「Toronto, Ontario」＝国勢調査都市圏（CMA）コード535（geoLevel 503）。Toronto 市そのものではなく、より広い都市圏全体 |",
    "| Toronto の定義 | 構造タイプ3「Row and apartment structures of three units and over」の、間取り別の平均家賃（調査対象年2025、2025-12-17公表）。学生向け住居・語学学校の滞在先・留学生の平均ではない |",
    "| London の出典 | ONS Price Index of Private Rents（PIPR）月次価格統計、2026年9月16日版 Table 1。地域コード E12000007「London」＝イングランドの地域区分（グレーター・ロンドン）。区ごとの値ではなく地域全体の平均 |",
    "| London の定義 | 民間賃貸住宅すべて（新規契約と既存契約）の月額家賃の平均、2026年8月、1ポンド単位に丸め。ONSは「開発中の公式統計」としている |",
    "| ライセンス（Toronto） | CMHC Licence Agreement for the Use of Data：情報（および付加価値製品）の使用・複製・公表・配布・販売を許可（取消可能・世界的・無償）。**商用利用可**。情報は正確に複製し、出典表示（Source: CMHC, 製品名, 基準日。…as is basis with the permission of CMHC）が必須。Statistics Canada の表ページがこのCMHCライセンスを参照 |",
    "| ライセンス（London） | Open Government Licence v3.0：複製・公表・配布・改変・**商用利用可**。出典表示「Contains public sector information licensed under the Open Government Licence v3.0」。PIPRのデータセットページに「特に断りがない限りOGL v3.0」と明記 |",
    "| 再利用許諾の確認日 | 2026-10-17（`data/official/RIGHTS.md`。検証状態とは別の記録） |", "",
    "### 6.1 数値ごとの照合と承認の準備", "",
    "| 数値 | 公式（2026-10-17に取得） | サイトの候補 | 照合 | 比較の基準 | 承認の状態 | 承認で記録するダイジェスト |", "|---|---|---|---|---|---|---|");
  for (const c of ALL_RENT_CANDIDATES) {
    const b = rentBasisOf({ ...c, status: "unverified" }); const a = RENT_APPROVALS[c.id];
    L.push(`| ${c.id} | ${c.cityId === "toronto" ? "CMA 535" : "E12000007"} ・ ${c.value!.amount.toLocaleString("en-US")} ${c.value!.currency}/月 ・ ${c.validFor.split(" (")[0]} | ${c.value!.amount.toLocaleString("en-US")} ${c.value!.currency}/月 | 一致 | ${b ? `${b.area}・${b.structure}・${b.unitKey}・${b.year}` : "—"} | ${a ? `承認済み（${a.approvedBy}・${a.approvedAt}）` : "**未承認**（非表示）"} | \`${rentDigest(c)}\` |`);
  }
  L.push("", "### 6.2 承認の手順（人が行う）", "",
    "1. 上の公式URL（Statistics Canada の表／ONS の PIPR データセットページ）を自分で開き、数値・地域・期間・単位が上表と一致することを確認する（Actions の機械照合は補助です）。",
    "2. CMHC ライセンスと OGL v3.0 の商用利用の許可、出典表示が画面に出る設定であることを確認する（再利用許諾が曖昧な場合は承認しないでください）。",
    "3. `data/official/cityRents.ts` の `RENT_APPROVALS` に、承認する数値だけを追加する（数値ごとに別のエントリ。他の都市・他の数値は公開されません）:",
    "   `\"tor-cmhc-rent-1br\": { approvedBy: \"（名前）\", approvedAt: \"YYYY-MM-DD\", basis: \"（何を何と照合したか）\", digest: \"（上表のダイジェスト）\" }`",
    "4. 数値・出典・期間・定義を後から変更すると、ダイジェストが一致せずビルドが失敗します（承認した内容と違うものは公開されません）。変更した場合は公式データと再照合して承認し直してください。",
    "5. 承認していない数値は、都市ページでは「承認待ち」の説明と公式リンクが残り、都市比較では「承認待ち（数値は未掲載）」と表示されます。Smart Planner には自動計上されません（Toronto・London には Planner の規則がありません）。", "",
    "### 6.3 承認チェックリスト", "",
    "- [ ] Toronto 4値（Bachelor 1,491／1BR 1,761／2BR 2,045／3BR 2,294 CAD/月、2025、CMA 535）を公式の表と照合した",
    "- [ ] London 1値（£2,332/月、2026年8月、London region E12000007、全住宅）を公式と照合した",
    "- [ ] CMHC ライセンス（商用利用可・出典表示必須・取消可能）と OGL v3.0 を確認した",
    "- [ ] 「Toronto市ではなくCMA」「London region全体であり区ではない」「学生向け住居ではない」の説明が画面に出ることを確認した",
    "- [ ] 承認記録を `RENT_APPROVALS` に書いた（数値ごと）");
  return L.join("\n") + "\n";
}
