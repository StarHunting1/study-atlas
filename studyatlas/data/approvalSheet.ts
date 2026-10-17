import type { Claim } from "./schema";
import { GBR_VISA_CLAIMS, GBR_NOTES_CLAIMS, CAN_VISA_CLAIMS, CAN_NOTES_CLAIMS } from "./countries";
import { UK_HEALTH_CLAIMS } from "./profiles/manchester";
import { BC_HEALTH_CLAIMS } from "./profiles/vancouver";
import official from "./official/vancouver";
import { RIGHTS } from "./official/rights.data";
import { SCOPE, TERMS_CHECK } from "./approvalScope";
import type { ClimateNormals } from "./official/types";

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
  if (annualPrecip !== undefined) out.push({ label: `月降水量の合計が公表の年値（${annualPrecip} mm）と一致（四捨五入の誤差 ±1.0 mm）`, ok: Math.abs(sum - annualPrecip) <= 1.0, detail: `合計 ${sum} mm、差 ${(sum - annualPrecip).toFixed(1)} mm` });
  const mean = m.map((x) => x.meanC!); const warm = mean.indexOf(Math.max(...mean)), cold = mean.indexOf(Math.min(...mean));
  out.push({ label: "最暖月が7〜8月、最寒月が12〜2月（北半球の気候として自然）", ok: [6, 7].includes(warm) && [11, 0, 1].includes(cold), detail: `最暖 ${warm + 1}月、最寒 ${cold + 1}月` });
  out.push({ label: "観測所ID・期間・出典URL・取得日・引用が記録されている", ok: !!(c.stationId && c.period && c.evidence[0]?.url && c.retrievedAt && c.evidence[0]?.quote), detail: `${c.stationId}／${c.period}／${c.retrievedAt}` });
  return out;
}
export const CANDIDATES = ["U1", "U2", "U3", "U4", "U5", "U6", "C1", "C2", "C3", "C4"];
export const allClaims = () => CLAIM_GROUPS.flatMap((g) => g.claims.map((c) => ({ ...c, group: g })));
const esc = (t: string) => t.replace(/\|/g, "\\|").replace(/\n/g, " ");
const VERDICT = { recommend: "推奨", conditional: "条件つき推奨", hold: "保留" } as const;

export function approvalSheet(): string {
  const L: string[] = []; const all = allClaims();
  L.push("# 承認シート（Ver.1.3.6／1.3.9 チェックリスト追加）— 政府情報の主張ごとの承認と Vancouver 気候データ", "", "_`npm run approvals` が `data/approvalSheet.ts` と各データから生成します。手で編集しないでください。_", "",
    "**これは承認ではありません。** 全ての主張・気候データは `unverified` のままで、画面にも「未確認」と表示されます。自動のページ確認（GitHub Actions）だけで `verified` にすることはありません。`verified` にできるのは、人が下の手順で承認の記録（承認者・日付・比較した内容）を書いた主張だけです（`data/validate.ts` が検査し、無いとビルドが失敗します）。", "",
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
      `**承認チェックリスト（${c.id}）** — 承認者が1件ずつ印を付けます。**全部に印が付くまで \`verified\` にしません。**`, "",
      "- [ ] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している",
      "- [ ] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている",
      `- [ ] 再利用条件を判断した（${c.candidate.startsWith("U") ? "OGL v3.0：出典表示で可" : "Canada.ca／BC州：言い換え＋リンクで足りると判断した、または書面確認を得た"}）`,
      "- [ ] 金額・日付がある場合、確認日が文言に併記されている",
      "- [ ] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した",
      `- [ ] 承認の記録を書いた：\`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }\`、\`checkedAt\`、\`period\``, "");
  }
  // ---- Vancouver climate
  const old = official.climate!, nw = official.climateAlt!; const r = RIGHTS["eccc-climate-normals"];
  const f1 = (x?: number) => (x === undefined ? "—" : x.toFixed(1)); const d1 = (a?: number, b?: number) => { if (a === undefined || b === undefined) return "—"; const x = Number((b - a).toFixed(1)); return x === 0 ? "0.0" : `${x > 0 ? "+" : ""}${x.toFixed(1)}`; };
  const MO = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const tot = (c: typeof old) => c.months.reduce((n, m) => n + (m.precipMm ?? 0), 0);
  L.push("## 5. Vancouver の気候データ（K1）: 1981–2010（画面の確認済み値）と 1991–2020（承認待ち候補）", "",
    "| 項目 | 現在（画面・verified） | 候補（未表示・unverified） |", "|---|---|---|",
    `| 基準期間 | ${old.period} | ${nw.period} |`, `| 観測地点 | ${old.station}（気候ID ${old.stationId}） | ${nw.station} |`, `| 状態 | ${old.status} | ${nw.status} |`,
    `| 単位 | 気温 ℃（日平均・日最高・日最低の月平均）、降水量 mm（月合計） | 同じ（ECCC の行: Daily Average / Daily Maximum / Daily Minimum (°C)、Precipitation (mm)） |`,
    `| 取得日・方法 | ${old.retrievedAt}・ECCC GeoMet API（2012-10-10 計算） | ${nw.retrievedAt}・ECCC 一括CSV（BC州）を1回取得（Actions run 38904919856） |`,
    `| 出典URL | ${old.evidence.map((e) => e.url).join(", ")} | ${nw.evidence.map((e) => e.url).join(", ")}（一括ダウンロード: \`/climate_normals/download/1991_e.html?area=province&province[]=BC&product[]=data&product[]=station_inventory\`） |`,
    `| 利用許諾 | ${r.licence}（商用利用可・出典表示が必要） | 同じ |`, `| 出典表示（画面に表示する文言） | ${r.attribution} | 同じ |`, "",
    "**観測地点・合成観測所の条件**: 1991–2020 の値は ECCC の「合成観測所」（normals code C）VANCOUVER INTERNATIONAL (AIRPORT) のもので、気候ID **1108447（VANCOUVER INT'L A）と 1108395（VANCOUVER INTL A、WMO 71892、YVR）** を組み合わせています（北緯49.20・西経123.18・標高4.3 m）。観測所IDは2013年前後で切り替わるため、30年分は2つのIDの観測をつないだものです。1981–2010 は旧ID 1108447 のみです。品質コード: 気温 B、降水量 C（ECCC の凡例による）。承認者は、この合成が「バンクーバー国際空港の平年値」として適切かを判断してください。", "",
    "| 月 | 日平均 旧→新 (℃) | 差 | 日最高 旧→新 (℃) | 差 | 日最低 旧→新 (℃) | 差 | 降水量 旧→新 (mm) | 差 |", "|---|---|---|---|---|---|---|---|---|");
  nw.months.forEach((m, i) => { const o = old.months[i]; L.push(`| ${MO[i]} | ${f1(o.meanC)} → ${f1(m.meanC)} | ${d1(o.meanC, m.meanC)} | ${f1(o.maxC)} → ${f1(m.maxC)} | ${d1(o.maxC, m.maxC)} | ${f1(o.minC)} → ${f1(m.minC)} | ${d1(o.minC, m.minC)} | ${f1(o.precipMm)} → ${f1(m.precipMm)} | ${d1(o.precipMm, m.precipMm)} |`); });
  L.push("", `年間降水量（月の合計）: ${tot(old).toFixed(1)} mm → ${tot(nw).toFixed(1)} mm（${d1(tot(old), tot(nw))}）。ECCC の年値（1991–2020）は 1159.5 mm。`, "",
    "**画面を切り替えたときの影響**（承認するまで切り替えません）:",
    "- 都市ページの「気候」と都市比較の月別表の値が、上表の「新」に変わる（気温は最大 ±0.4 ℃、降水量は月により最大 ±14 mm 程度の増減）。",
    "- 「最新の標準期間（1991–2020）ではありません」という注意書きは、期間の終わりが 2020 になるため表示されなくなる（Manchester は 1971–2000 のまま注意書きが残る）。",
    "- 画面の確認状況は、承認して `status: \"verified\"` にした時点でだけ「確認済み」になる。観測所の表記は合成観測所の名称と気候IDに変わる。",
    "- 出典表示（ECCC の文言）と出典URL（上表）が表示される。",
    "- 切り替え手順: `data/official/vancouver.ts` で `climateAlt` を `climate` に入れ替え（旧 1981–2010 は `climateAlt` へ）、`status`・`note`（承認者・日付）を更新。それまでは本番の確認済み値（1981–2010）を変更しません。", "",
    "**整合性の機械チェック**（入力ミスの検出用。出典との照合は人が行います）:", "", "| 確認項目 | 結果 | 詳細 |", "|---|---|---|",
    ...climateChecks(nw, ECCC_ANNUAL_PRECIP_1991_2020).map((k) => `| ${k.label} | ${k.ok ? "✅ 一致" : "❌ 要確認"} | ${esc(k.detail)} |`),
    "", "- 年平均気温など、気温の年値は記録していません。承認者が ECCC の CSV（Year 列）と月別値を照合してください。",
    "- 旧 1981–2010 との差は上表のとおり（気温は最大 ±0.4 ℃、月降水量は最大 −14.3〜+10.3 mm）。基準期間が10年ずれたこと（1981–2010 → 1991–2020）と、観測所が単独の 1108447 から合成観測所（1108447＋1108395）に変わったことの両方が考えられ、この資料だけではどちらの影響かを分けられません。",
    "", "### 気候データ承認チェックリスト（K1）", "",
    "- [ ] ECCC の公式ページ／一括CSVを開き、観測所（合成観測所 VANCOUVER INTERNATIONAL (AIRPORT)、気候ID 1108447・1108395）が一致している",
    "- [ ] 月別の日平均・日最高・日最低（℃）と降水量（mm）の48個の値が上表の「新」と一致している（年値も照合）",
    "- [ ] 単位・基準期間（1991–2020）・品質コード（気温 B、降水量 C）を確認した",
    "- [ ] ライセンス（ECCC Data Services End-use Licence v2.1）と出典表示の文言が画面に出る設定になっている",
    "- [ ] 画面を切り替えたときの影響（上記）を読み、1981–2010 を `climateAlt` に残す手順に同意した",
    "- [ ] 承認の記録を書いた：`status: \"verified\"`、`note` に承認者・日付、`checkedAt`", "",
    "**Manchester**: 1991–2020 は取り込めていません（旧 1971–2000 のまま）。理由は `data/APPROVAL_CANDIDATES.md` の「気候データの承認候補」を参照。");
  return L.join("\n") + "\n";
}
