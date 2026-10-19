/*
 * `npm run audit` writes RELEASE_DATA_AUDIT.md (Ver.1.3.1): for every city, what the site really holds – verified / unverified /
 * demo-sample / pending – per field, official data points with their reuse status, schools, and items that look stale.
 * Everything is read from the data files; nothing here is typed in by hand except the "findings" text at the end.
 * Coverage counts only what a visitor can really use: a "demo sample" number is NOT counted as data.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { cities } from "../data/cities";
import { sections } from "../data/fields";
import { officialData } from "../data/official";
import { displayModeOf, rightsOfSource } from "../data/official/rights";
import { officialSources } from "../data/official/sources";
import { isSampleFact } from "../data/publicFacts";
import type { Status } from "../data/schema";
import { LINK_CHECKED_AT, LINK_CHECK_RUN, LINK_STATUS } from "../data/linkStatus";

const TODAY = process.env.AUDIT_DATE ?? new Date().toISOString().slice(0, 10);
const days = (d?: string) => (d ? Math.round((Date.parse(TODAY) - Date.parse(d)) / 86_400_000) : null);
const STALE = 180;
const ST: Status[] = ["verified", "unverified", "sample", "pending"];
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");

export function auditMarkdown(): string {
  const L: string[] = [];
  L.push("# RELEASE_DATA_AUDIT – データ監査（6都市）", "", `生成: \`npm run audit\`（基準日 ${TODAY}）。データファイルから自動生成。手書きの所見は末尾。`, "",
    "- **verified** = 引用した出典と照合済み / **unverified** = 出典未照合 / **sample** = 架空のデモ数値（公開画面では数値を出さない）/ **pending** = 未取得。",
    "- 「利用可能率」= verified と unverified（根拠付きで表示される事実）÷ 全項目。sample は**データとして数えません**。", "");
  L.push("## 1. 都市 × 分野の充足", "", "| 都市 | 項目数 | verified | unverified | sample（非公開） | pending | 利用可能率 | verified率 |", "|---|---|---|---|---|---|---|---|");
  const perCity: Record<string, Record<Status, number>> = {};
  for (const c of cities) {
    const n: Record<Status, number> = { verified: 0, unverified: 0, sample: 0, pending: 0 };
    for (const s of sections) for (const f of s.fields) n[f.get(c).status]++;
    perCity[c.id] = n; const tot = ST.reduce((a, k) => a + n[k], 0);
    L.push(`| ${c.name.en} | ${tot} | ${n.verified} | ${n.unverified} | ${n.sample} | ${n.pending} | ${pct(n.verified + n.unverified, tot)} | ${pct(n.verified, tot)} |`);
  }
  L.push("", "### 分野別（verified / unverified / sample / pending）", "", `| 分野 | ${cities.map((c) => c.name.en).join(" | ")} |`, `|---|${cities.map(() => "---").join("|")}|`);
  for (const s of sections) L.push(`| ${s.label.en} | ${cities.map((c) => { const n: Record<Status, number> = { verified: 0, unverified: 0, sample: 0, pending: 0 }; for (const f of s.fields) n[f.get(c).status]++; return ST.map((k) => n[k]).join(" / "); }).join(" | ")} |`);

  L.push("", "## 2. 公式データポイント（data/official）", "", "| 都市 | 件数 | verified | unverified | 表示=数値可 | 表示=リンクのみ/保留 | 気候 | 最終確認から" + STALE + "日超 |", "|---|---|---|---|---|---|---|---|");
  for (const c of cities) {
    const o = officialData(c.id); if (!o) { L.push(`| ${c.name.en} | 0 | – | – | – | – | なし | – |`); continue; }
    const shown = o.points.filter((p) => displayModeOf(p) === "full" || displayModeOf(p) === "figure-with-link").length;
    const stale = o.points.filter((p) => { const d = days(p.checkedAt ?? p.retrievedAt); return d === null || d > STALE; }).length;
    L.push(`| ${c.name.en} | ${o.points.length} | ${o.points.filter((p) => p.status === "verified").length} | ${o.points.filter((p) => p.status === "unverified").length} | ${shown} | ${o.points.length - shown} | ${o.climate ? `${o.climate.status}（${o.climate.period}）` : "なし"} | ${stale} |`);
  }

  L.push("", "## 3. 語学学校・大学", "", "| 都市 | 語学学校（表示） | 非表示 | 状態 | 大学（Ver.1.0引き継ぎ） |", "|---|---|---|---|---|");
  for (const c of cities) {
    const ls = c.profile.education.languageSchools, un = c.profile.education.universities;
    const all = ls.value ?? []; L.push(`| ${c.name.en} | ${all.filter((i) => !i.hidden).length} | ${all.filter((i) => i.hidden).length} | ${ls.status} | ${un.value?.length ?? 0}（${un.status}） |`);
  }

  L.push("", "## 4. 出典の利用条件（権利管理）", "", "| 出典 | 都市 | 利用区分 | 表示 | 自動取得 |", "|---|---|---|---|---|");
  for (const s of officialSources) { const r = rightsOfSource(s.id); L.push(`| ${r.sourceName} | ${s.cityIds.join(", ")} | ${r.reuseStatus} | ${r.display ?? "（区分から導出）"} | ${r.automation} |`); }

  const lk = (v: string) => LINK_STATUS.filter((r) => r[1] === v).length; const verifiedLinks = LINK_STATUS.filter((r) => r[1] === "ok" && r[3] === true);
  L.push("", "## 4b. 出典リンクの検査（Manchester / Vancouver）", "",
    `実行: GitHub Actions（${LINK_CHECKED_AT}、${LINK_CHECK_RUN}）。1リンク1回の確認（再試行なし・robots.txt遵守。要求してよいかは、通信の前に権利記録（collector/guard.ts）で判定し、禁止・未確認のリンクは通信せずに記録する）。`, "",
    `| 対象 | 検証済み（2xx＋期待語を確認） | 到達（語は未確認/不一致） | アクセス拒否 | リンク切れ | 要求せず |`, "|---|---|---|---|---|---|",
    `| ${LINK_STATUS.length} | ${verifiedLinks.length} | ${lk("ok") - verifiedLinks.length} | ${lk("access-denied")} | ${lk("broken")} | ${lk("skipped")} | ${lk("unconfirmed")} |`, "",
    "- 「権利上禁止／権利未確認」は通信していないため、リンク切れでも検証済みでもありません（確認できていないだけで、公式リンク自体は残しています）。", "- 「アクセス拒否」(401/403/429)は**リンク切れではありません**。ページは存在しうるが自動アクセスを拒むため、未検証のまま扱います。",
    "- 到達しても期待語が見つからないリンクは検証済みにしません（例: Express English College の公式サイトはタイトルに校名がなく、手動で English UK 掲載のサイトURLと一致を確認）。", "",
    "| 状態 | 件数 | 例 |", "|---|---|---|",
    `| アクセス拒否 | ${lk("access-denied")} | ${LINK_STATUS.filter((r) => r[1] === "access-denied").map((r) => r[0]).join(" , ")} |`);
  L.push("", "## 5. 未確認・仮データ一覧（項目ごと）", "");
  for (const c of cities) {
    const rows: string[] = [];
    for (const s of sections) for (const f of s.fields) { const fact = f.get(c); if (fact.status === "sample") rows.push(`- **sample（数値は非公開）** ${s.label.en} / ${f.label.en}`); else if (fact.status === "unverified") rows.push(`- unverified: ${s.label.en} / ${f.label.en}${fact.checkedAt ? `（確認日 ${fact.checkedAt}）` : "（確認日なし）"}`); else if (fact.status === "pending") rows.push(`- pending: ${s.label.en} / ${f.label.en}`); }
    L.push(`### ${c.name.en}`, "", ...(rows.length ? rows : ["- なし"]), "");
  }
  L.push("## 6. 古くなっている可能性（最終確認が" + STALE + "日より前、または日付なし）", "");
  let any = false;
  for (const c of cities) for (const p of officialData(c.id)?.points ?? []) { const d = days(p.checkedAt ?? p.retrievedAt); if (d === null || d > STALE) { any = true; L.push(`- ${c.name.en}: ${p.id}（${p.checkedAt ?? p.retrievedAt ?? "日付なし"}）`); } }
  if (!any) L.push("- なし（すべて" + STALE + "日以内）");
  L.push("", "## 7. 手書きの所見（2026-10-15）", "", FINDINGS);
  return L.join("\n") + "\n";
}

const FINDINGS = [
  "### 見つかった問題と対応",
  "1. **架空のデモ数値が公開画面に出ていた**: Toronto / London / Sydney / Melbourne の `cost.rent` `cost.transport` `cost.totalMonthly` は Ver.1.0 のデモ値（status = sample。期間・含まれる項目・出典が未定義）。都市ページの主要数値と都市比較の表に「デモ用サンプル」ラベル付きで数値が表示されていた。→ 本PRで**数値を表示しない**（「データ準備中」）よう修正。値自体はデータに残し、監査上は「データなし」として数える。",
  "2. **Ver.1.0 引き継ぎの概要文**（気候・住居の概要・交通・暮らし・大学名）は全都市で unverified。ラベル付きで表示されるが、出典はない。",
  "3. **Sydney / Melbourne** は公式データポイント・気候・語学学校がゼロ（Toronto / London は Ver.1.5.0 で項目34のとおり拡充。ただし家賃は承認待ちで数値は未掲載）。実質的に「概要文＋準備中」のみで、公開品質に達していない。",
  "4. 語学学校は Manchester 2校・Vancouver 3校（すべて unverified、料金なし）。Excel College / UKEC Academy は非表示。",
  "5. 公式データは Manchester / Vancouver のみ。TfGM・TransLink・UBC の料金は利用条件が `needs-review` / `restricted` のため、数値表示はそれぞれの権利区分に従う。",
  "6. 学生寮・ホームステイ・シェアハウスの1人あたり料金は、Manchester の University of Manchester 寮と大学見積もり以外に再利用可能な出典がなく「参考料金は準備中」。",
  "",
  "7. **Ver.1.3.1 で追加**: 英国・カナダの入国区分の概要（Visa）と、Manchester / Vancouver の医療保険の基本要件（Daily life / Healthcare）を、政府の公式ページを出典とする **unverified** の事実として追加（ページの突き合わせは未了。国籍・個別事情による違いを明記し、個人への判定はしない）。",
  "8. **古い可能性**: Manchester の気候は 1971–2000 の平年値のまま（1991–2020 は未取得）。Vancouver は Ver.1.4.3 で 1991–2020 に更新済み（項目33）。両都市の基準期間が異なるため、比較では同じ基準期間として扱わない。",
  "9. **地図タイル**: （Ver.1.3.5 で解消）MapLibre のデモタイルをやめ、同梱の静的SVG（Natural Earth）に変更した。",
  "10. `Climate / Monthly` と `Living costs / Rent` が pending なのは、都市ページが公式データ（data/official）を直接使うため。上の表は profile 項目だけを数えるので、Manchester / Vancouver の実データ量を過小に見せる。実データ量は §2 を参照。",
  "",
  "11. **Ver.1.3.2 の検査で見つかった誤り**: MC Academy に載せていた公式サイトURL（themcacademy.co.uk）は、現在は別の組織（Money Confidence Academy）のサイトだった → URLを削除。English UK の個別ページも開けず、公式サイト・営業状況・認定状況を確認できないため、一般向け一覧から**非表示**（Excel College / UKEC Academy と同じ扱い。データと記録は保持）。",
  "12. **気候 1991–2020**: （Vancouver は Ver.1.3.5 で候補を取得 → 項目18、Manchester は保留）。以下は Ver.1.3.2 時点の調査: ECCC の GeoMet API は 1981–2010 のみ。1991–2020 は気象庁のページから**一括CSV（zip）**でのみ提供され、Vancouver 国際空港は観測所IDが2013年に変わる合成観測所（1108447→1108395）のため、取り込みには別のPRで取得手順と観測所の扱いを確認する必要がある。Met Office は公式の 1991–2020 平年値に利用できるオープンデータのファイルが見つからず（data.gov.uk の UK Climate Averages は 1981–2010 の記述で、ライセンス・資源の記載なし）、サイト規約で自動取得も禁止されている → どちらも**取り込み保留**。既存の 1971–2000 / 1981–2010 は期間を明記し「最新の標準期間ではない」注意書きを都市ページに追加した。",
  "13. **Ver.1.3.3**: Manchester の語学学校を English UK 掲載を起点に 1校→3校（Express English College / International House Manchester / Kaplan Manchester）へ拡充。公式サイトの生存と English UK 掲載の住所一致を Actions（run 38793091211）で確認できた学校のみ公開。EC Manchester（English UK の個別ページ 404）・MC Academy・Excel College / UKEC は非表示。British Council のページは403のため認定状況は人の確認待ち。料金表は取り込まず、公式料金ページ（IH Manchester / IH Vancouver）へのリンクのみ。",
  "14. **Vancouver**: International House Vancouver は New Westminster 所在を維持。EF Vancouver は Languages Canada 掲載と住所・宿泊を照合。Sprachcaffe Vancouver は Languages Canada に掲載がなく認定の記載もないため非表示。",
  "15. **承認用の記録**: 英国・カナダの入国/保険/IHS/BC州学生ヘルスフィーの根拠・対象条件・出典・確認日・ライセンスは `data/APPROVAL_CANDIDATES.md` に集約（全件 unverified のまま、承認待ち）。Planner への自動計上はしない（テストで固定）。",
  "16. **Ver.1.3.4 政府情報10件の再検証**: 承認推奨9件（U1〜U6、C1〜C3）／修正が必要1件（C4：BC州ヘルスフィーの対象条件を「年間で少なくとも6か月は州内にいる、有効な就学許可の学生」「成人はMSP脱退で対象外」に是正済み）／確認不能0件。いずれも verified にはせず、1件ずつの承認手順を `data/APPROVAL_CANDIDATES.md` §0 に記録。英国の医療欄はIHSの申請場所・期間の条件（6か月以内は英国外から申請なら不要、英国内なら半額、6か月超〜1年未満は1年分）をページどおりに正確化。",
  "17. **語学学校の料金**: 5校（Manchester 3・Vancouver 2）すべてが公式の料金案内ページへのリンクを持つ。どの学校のサイトにも料金の再利用を認める記載がなく（Kaplan は書面許可なしの複製を禁止、IH Manchester・EF は著作権留保、Express は記載なし、IH Vancouver は自動アクセス403で規約未読）、**金額・料金表は取り込まず**（`language-school-fees` を link-only で記録）。授業料・週の授業時間・最低期間・登録料・教材費・滞在費はすべて「未取得」。学校比較には、料金を比べる前に揃える条件（週のレッスン数・期間・諸費用・滞在条件・年度と通貨）を表示。",
  "18. **Ver.1.3.5 気候 1991–2020**: Vancouver は ECCC の一括CSV（BC州、合成観測所 VANCOUVER INTERNATIONAL (AIRPORT)＝気候ID 1108447＋1108395、標高4.3m）から4要素（日平均・日最高・日最低・降水量）を取得し、**承認待ちの候補（unverified の `climateAlt`）**として保持。画面は確認済みの 1981–2010 のまま。Manchester は Met Office の1991–2020に使えるオープンデータファイルがなく、サイト規約で自動取得も禁止されているため**取り込み保留**（旧 1971–2000 を保持、理由は `data/APPROVAL_CANDIDATES.md`）。",
  "19. **地図**: トップページの地図を、MapLibre のデモタイル（本番用途ではない）から、同梱の静的SVG（Natural Earth、パブリックドメイン）へ変更。外部リクエスト・APIキー・料金・アクセス制限なし。比較表は `data/MAP_OPTIONS.md`。",
  "20. **承認レビュー表**: 政府情報10件を、表示文言・適用条件・出典と確認日・再利用条件・既存表示との差分・推奨/保留でまとめた（推奨10件、うち条件つき4件、保留0件）。U4 の文言は直接の根拠がない記述を削除。承認は Fact 単位（1件だけの承認はできない点を記録）。",
  "21. **Ver.1.3.6 承認管理**: 政府情報の候補10件（U1〜U6、C1〜C4）を、画面の Fact の中の**主張（claim）15件**に分け、主張ごとに出典・ライセンス・適用条件・推奨・承認記録を持たせた。Fact は全ての主張が verified のときだけ verified（一部のみ承認なら画面で主張ごとに表示）。承認記録（承認者・日付・比較内容）が無い verified、保留の主張の verified、混在 Fact の verified は、ビルド時の検査で失敗する。現在 verified は 0 件。承認用シートは `data/APPROVAL_SHEET.md`（`npm run approvals` で生成、テストで最新性を検査）。",
  "22. **保留**: C4-ref（StudyAtlas 自身の案内文で出典の記述ではない）は保留。U5 の「訪問者にはIHSがなく保険が必要」は根拠がないため削除、C3 の「渡航前に申請」は逐語の根拠がないため確認できた記載に置換。Canada.ca の商用再利用（C1〜C3）と BC州の転載（C4）は利用条件が未確認／書面許可が必要なため、言い換え＋リンクのみ。",
  "23. **Vancouver 気候 1991–2020**: 承認シート（`data/APPROVAL_SHEET.md` §5）に 1981–2010 との月別比較（気温差は最大 ±0.4 ℃、降水量は最大 ±14 mm、年間 1189.0→1159.7 mm）、観測地点（合成観測所 1108447＋1108395）、単位、出典URL、利用許諾と出典表示、画面切り替えの影響をまとめた。画面の確認済み値（1981–2010）は変更していない。",
  "24. **Ver.1.3.7 地図**: トップページを MapLibre ＋ OpenFreeMap（無料・商用可・キー不要・利用回数の上限なし、公式FAQで確認）のインタラクティブ地図に変更。デモタイルは不使用。接続できない場合は同梱SVG地図に自動切替。SLAなし（\"as-is\"）が残る唯一のリスク。詳細は `data/MAP_OPTIONS.md`。",
  "25. **Ver.1.3.7 UI**: トップは地図中心（ピン選択で都市カード、一覧・カード選択で移動）。都市比較に「比較できる項目の状況」と各行の理由1行、都市ヘッダー。学校比較は公式サイト・料金ページへの導線をヘッダーに集約し、スマホは1校ずつ縦並び。データ・検証状況・承認管理（claim）・Planner の計算は変更していない。",
  "26. **Ver.1.3.7b 地図の見た目**: 色が乏しかった原因は、選んでいた OpenFreeMap の `positron` がもともと白〜灰色のモノトーンだったこと（＋SVG時代の国の塗り分けが無くなったこと）。`liberty` に変更し、海・陸・森・国境をナチュラルな配色に再設定、対応国は緑の塗り＋輪郭（選択国は濃く）、ピンは白縁の紺（選択国は緑リング）にした。国ボタンは `fitBounds` で国全体と都市が入る範囲へ、都市は `flyTo`。国名は `lib/names.ts` に一本化し、タイル内の地名も言語に追従（日本語グリフは確認済み）。GitHub Actions のヘッドレス Chromium で OpenFreeMap の実タイルの描画を確認（スマホ390／iPad820／PC1280）。",
  "27. **Ver.1.3.9 承認の準備**: 政府情報の主張15件（推奨8／条件つき推奨6／保留1）について、対象（国籍・滞在期間・ビザ区分）・既存表示との違い・承認前に人が決めること・主張ごとのチェックリスト・承認記録の書き方を `data/APPROVAL_SHEET.md` に追加（`data/approvalScope.ts` から生成）。**verified への変更は 0 件**（承認記録なし）。この環境から外部サイトは開けないため、出典の再調査はしていません（最後の確認は 2026-10-15 の Actions）。",
  "28. **Vancouver 気候 1991–2020 の承認準備**: 月別48値・観測所ID（1108447＋1108395）・単位・期間・ライセンス・出典表示を承認用にまとめ、機械的な整合性チェック6項目（12か月そろい・日最低≤日平均≤日最高・現実的な範囲・月降水量の合計1159.7 mm が年値1159.5 mm と±1.0 mm 以内・季節性・記録の有無）が全て成立。ただし**出典との照合は人が行う**。年平均気温など気温の年値は未記録。承認までは 1981–2010 の verified 値を置き換えません。",
  "29. **再利用条件の未解決**: Canada.ca（C1〜C3）と BC州（C4a〜C4c）は、言い換え＋リンクで足りるかの判断（または書面確認）が必要。確認先の公式ページを承認シートに記載。許可が無い限り引用・転載はしません。",
  "30. **Ver.1.3.10 英国 claim の修正**: U4 を「Student visa はコース期間だけで決まらない（licensed student sponsor・資金・英語力・年齢）」に、U5a を「IHS の要否と NHS 利用の範囲はビザの種類・期間・申請場所・個々の事情で異なる（年£776／£1,035 は維持）」に修正（条件つき・承認者が出典と再照合）。U5-visa は U5a・U5b と重複するため承認候補から除外。政府 claim は 14 件（推奨5／条件つき8／保留1）。verified への変更は 0 件。",
  "31. **Ver.1.4.0 英国の政府 claim 5件を正式承認**: 人（StarHunting1）の明示的な承認指示（2026-10-17）に基づき、U1・U2・U3・U5b・U6 の5件だけを `verified` に変更（記録は `data/approvals.ts`、承認時の文言・条件・出典も保存。承認後に変更するとビルド失敗）。U4・U5a・Canada.ca の C1〜C3・BC州の C4a〜C4c・C4-ref は未承認（unverified）のまま、Vancouver 気候 1991–2020 も未承認。Fact は全 claim が verified のときだけ verified（英国「注意点」＝U3 のみ → verified、英国「公式情報」・Manchester 医療 → 未確認のまま、claim ごとに表示）。ビザ・IHS は Planner に自動計上しない。",
  "32. **Ver.1.4.2 Vancouver 1991–2020 の元CSV照合**: ECCC の一括CSV（BC州）を既存の GitHub Actions で1回だけ取得（run 39051554489）し、合成観測所の Normal の行と保存値を列見出しで照合。気温3要素と降水量の**48値すべて一致**（不一致 0）。年値：気温 10.5／14.0／7.0 ℃（月値の平均と一致）、降水量 1159.5 mm（月値の合計 1159.7 mm との差 0.2 mm は、四捨五入の最大誤差 ±0.6 mm の範囲内。算出方法は資料になく原因は断定しない）。観測所（1108447・1108395）と ECCC Data Services End-use Licence v2.1.1（商用利用可・出典表示必須）を確認。**承認と切り替えは人の最終承認待ち**（verified 変更なし）。",
  "33. **Ver.1.4.3 Vancouver 1991–2020 気候を正式承認・本番反映**: 人（StarHunting1）の明示的な公開承認（2026-10-17）と、PR #46 での ECCC 元CSVとの全48値照合に基づき、1991–2020（合成観測所 VANCOUVER INTERNATIONAL (AIRPORT)＝気候ID 1108447＋1108395）を verified に変更し本番表示に切り替え（承認記録と承認した数値は `data/approvals.ts`、承認後に変えるとビルド失敗）。年間降水量は ECCC の公表値 1159.5 mm を表示（月別合計 1159.7 mm との 0.2 mm 差は丸めの範囲内だが、ECCC の算出方法は未確認のため原因は断定しない）。旧 1981–2010 は履歴として保持し非表示。ライセンスの版表記を v2.1.1（2026年8月）に更新。Manchester（1971–2000）とは基準期間が異なるため、比較は「参考」のまま（同じ基準期間として比べない）。",
  "34. **Ver.1.5.0 Toronto / London の拡充**: 家賃統計を**候補として準備し、人の承認まで数値は表示しない**。Toronto＝CMHC 賃貸市場調査（Statistics Canada 表 34-10-0133-01、トロント都市圏〔国勢調査都市圏コード535・メンバー125〕、調査年2025、構造3戸以上、バチェラー1,491／1BR 1,761／2BR 2,045／3BR 2,294 カナダドル／月）。London＝ONS PIPR（ロンドン地域 E12000007、2026年8月、全住宅の平均 £2,332／月、16 Sep 2026版 Table 1）。いずれも Actions のプローブ（run 39058754956、2026-10-17）で公式データから読み取り。同時にロンドンの区別の値の差が大きいこと（例: Camden £2,819、Westminster £3,196）も確認（掲載はしない）。**Toronto とバンクーバーは同じ CMHC 定義・同じ年のため同じ基準、London（地域全体）と Manchester（1自治体）は別の統計**として扱い、後者は常に「参考値のみ」。語学学校は4校を追加表示（EF Toronto・Kaplan Toronto・Kaplan London・Frances King London、すべて unverified・料金はリンクのみ）、St Giles London Central は認定を確認できず非表示。TTC・TfL の運賃は再利用条件を確認していないためリンクのみ（TfL は自動アクセスに HTTP 403、再試行・回避なし）。気候・生活費は今回は見送り（理由は PR 本文）。",
  "35. **Ver.1.5.1 Toronto・London の家賃統計を公式データと再照合（承認準備のみ。verified への変更・公開はなし）**: Actions（run 39065320556、2026-10-17、読み取り専用・robots順守・再試行なし）で、Toronto の4値（Bachelor 1,491／1BR 1,761／2BR 2,045／3BR 2,294 CAD/月、2025、CMA 535、StatCan WDS ベクトル v3822835・v3822969・v3823103・v3823237）と London の1値（£2,332/月、2026年8月、E12000007、ONS PIPR 2026-09-16版）が**すべて公式と一致**。CMHC ライセンス（商用利用可・取消可能・出典表示必須）と OGL v3.0（商用利用可・出典表示）の文言も再読。承認は**数値ごと**の記録（`RENT_APPROVALS`、承認者・日付・根拠・内容ダイジェスト）で、数値・出典・期間・定義を変えるとダイジェスト不一致でビルドが失敗する。比較は `rentBasis.ts` の全項目（発表元・表・指標・構造・間取り・地域区分・年・通貨・期間）が一致する場合だけ「同じ基準」とし、Toronto と Vancouver は承認後に一致、London（地域）と Manchester（自治体）は地域区分が異なり常に参考値のみ。**承認記録は空のまま**（捏造なし）。",
  "36. **Ver.1.5.2 Toronto・London の家賃5件を正式承認・本番反映**: 人（StarHunting1）の明示的な公開承認（2026-10-17）と、PR #50 の Actions 照合（run 39065320556）に基づき、`RENT_APPROVALS` に数値ごとの承認記録を登録し、Toronto 4件（CMA 535、2025、Bachelor C$1,491／1BR 1,761／2BR 2,045／3BR 2,294）と London 1件（London region E12000007、2026年8月、£2,332）だけを verified に変更。ダイジェストは PR #50 で準備した内容と同一（差異なし）。数値・出典・期間・定義を変えるとビルドが失敗する。比較は Toronto／Vancouver が同じ基準（承認後に全項目一致）、London／Manchester は地域区分が異なり参考値のみ。ほかのデータ（英国政府 claim 5件、Vancouver 気候48値、Vancouver・Manchester の家賃）、Planner、地図、学校比較、ビザ・医療は変更なし。TTC・TfL は引き続きリンクのみ。",
  "37. **Ver.1.5.3 表示の見つけやすさ（データ・承認記録の変更なし）**: Toronto・London の承認済み家賃・学校4校・TTC/TfL リンクはビルドに入っていたが、都市ページの最初の画面では住居カードが「参考料金は準備中」、交通カードが未確認の説明文だけで、家賃は「詳しく見る」→「市場全体の家賃を見る」の2段階奥にあった。住居カードの見出しに市場全体の平均家賃（代表値・地域・年・「学生向けの料金ではありません」）を出し、交通カードの見出しに公式運賃ページへのリンクを出し、学生向けの価格がない都市では市場全体の家賃を最初から開き、5項目へのジャンプリンクを追加した。比較ページの判定・承認記録・Planner は変更なし。",
  "38. **Ver.1.6.0 Sydney・Melbourne のデータ拡充（家賃は取得済み・未承認で非公開／学校・交通・ビザの公式リンクを追加）**: 2026-10-19 に GitHub Actions のプローブ（読み取り専用・robots.txt 順守・1件ずつ・再試行なし）で、ABS 2021年国勢調査 QuickStats の週あたり家賃中央値（Greater Sydney 470／Greater Melbourne 390 AUD/週）、ABS の著作権表示（CC BY 4.0・商用利用可）、語学学校の公式ページ、豪州政府 Study Australia の提供機関ディレクトリ（CRICOS コード・住所の突き合わせ）、Transport for NSW／Transport Victoria、内務省・Study Australia のビザ・OSHC ページを確認した。家賃2件は `RENT_APPROVALS` に載せていないため**都市ページにも比較にも数値は出ない**（「確認中」と公式リンクのみ）。承認すると同じ統計・同じ定義の Sydney–Melbourne だけが「同じ基準」、他都市とは常に参考値のみ。NSW 賃貸保証金データ・ビクトリア州の賃貸レポートは定義が違う、または読めなかった（DFFH の robots.txt に接続できず）ため使っていない。語学学校は4校（ILSC Sydney／Navitas English Sydney Hyde Park／ILSC Melbourne／City Language Centre Melbourne）で全て未確認扱い。CRICOS 登録簿の課程検索は robots.txt が禁じているため使えず、ILSC は機関コード02137Mと住所をディレクトリと照合、City Language Centre は機関コード03893Mを照合、Navitas は登録簿との照合ができていない（学校自身の記載のみ）と明記。EF Sydney はディレクトリにキャンパスが載っていない、Kaplan Melbourne は学校ページに住所がない、Discover English は公式サイトに接続できない（証明書不一致）ため掲載しなかった。NEAS の認定はどの学校でも確認できず、認定校とは書いていない。Transport for NSW は運賃ページを開けたが利用規約未確認のためリンクのみ（対象者ページは大学・TAFE の学生を挙げ、留学生は挙げていない）。Transport Victoria は bot 確認ページ（HTTP 403）で読めず、回避せずリンクのみ。ビザ（subclass 500／600／601）と OSHC は公式ページへのリンクだけで、英国・カナダの claim は流用していない。Planner への自動計上はなし。",
  "39. **Ver.1.6.1 Sydney・Melbourne の家賃2件を正式承認・公開（承認者 StarHunting1、2026-10-19、PR #53 マージ後）**: Greater Sydney A$470／Greater Melbourne A$390（ABS 2021年国勢調査 QuickStats、週あたり家賃の**中央値**、実際の家賃、家賃なしの住戸を除く）。承認前に Actions run 39292612214 で QuickStats を再読し、数値・出典・地理区分（Geography type = Greater Capital City Statistical Areas）・定義が PR #53 の候補と一致することを確認した（地理区分の名称は説明文に反映したためダイジェストを更新し、更新後のダイジェストで承認を登録）。ライセンスは CC BY 4.0（ABS の著作権表示、商用利用可）。画面には「2021年の実際の家賃で、2026年現在の募集家賃ではなく、留学生個人の住居費でもない」と明示。Sydney と Melbourne は同じ統計・定義なので互いに「比較可能」、他都市とは「参考値のみ」（換算なし）。収集処理は ABS ページを robots.txt 順守のページ確認（page-check-only）で定期確認する。他の承認記録（Toronto・London 5件）、学校、交通・ビザのリンク、Planner は変更なし。",
  "40. **Ver.1.6.2 6都市の体験とデータ品質（データ・承認・ライセンスの変更なし）**: 6都市の都市ページを評価した結果、(a) 「ビザ・医療」へのジャンプリンクがオーストラリアにしかなかった、(b) 生活費カードが4都市で「データ準備中」のみで、入力・検討の方法が示されていなかった、(c) 家賃比較の理由が「違いの項目名」の固定的な言い方で、どの都市がどう違うのかが分かりにくかった、(d) Sydney・Melbourne の学校で、機関の登録確認とコース・キャンパスの確認が説明文の中に混在していた、(e) 都市比較・学校比較から費用プランナーへの導線がなかった。既存データだけで次を修正した：全6都市に「ビザ・医療」ジャンプリンク、生活費カードに「金額は自動で入らない」説明と費用プランナーへのリンク、家賃比較の理由を各図の定義（`rentBasis.ts`）から生成（同じ統計なら年・地域の単位・住宅・平均／中央値・通貨・週額／月額を明示、異なれば違う項目だけを各都市の値つきで説明。定義が未記録なら説明を作らない）、学校比較に項目別の確認状況（機関の登録／キャンパス／コース／認定を分離。Navitas は登録簿との照合なし、全校で NEAS 認定は未確認のまま）、都市比較・学校比較に費用プランナーへの短い案内。Planner の計算・保存・自動入力は変更なし。家賃7件の承認記録とダイジェスト、権利記録、出典URL・確認日は変更なし。",
  "41. **Ver.1.6.3 気候・公共交通の拡充（気候は取得・検証済みの候補として保存、数値は未公開／交通は制度の要約とリンク）**: Toronto の ECCC 1991–2020 平年値（オンタリオ州一括CSV、Actions run 39303865202、2026-10-19）から、市内中心部の複合観測所 TORONTO (CITY)（気候ID 6158350・6158355、標高112.5 m、空港ではない）の月別48値（日平均・日最高・日最低・降水量）と年値（平均気温9.7・平均最高13.4・平均最低6.0・降水量822.7）を取得し、`data/official/cityClimates.ts` に**承認待ちの候補**として保存した。整合チェック（48値・最低≤平均≤最高・年値と月別の一致）は全てOK。**CLIMATE_APPROVALS に承認記録はなく、都市ページ・グラフ・比較に数値は出ない**（「公式の平年値は取得済み・確認中」と出典・ライセンスへのリンクのみ）。承認すると `toronto.ts` が自動で `climate` を持つ。ECCC ライセンス v2.1.1（商用利用可・出典表示必須）を再読。Sydney・Melbourne は BoM のページが全て HTTP 403 で読めず、London は Met Office の利用規約がスクレイピングを禁じているため、数値は取得せず公式リンクのみ（回避なし・再試行なし）。比較は、統計期間が同じでも観測地点の種類（空港／市内中心部）が違えば「参考値のみ」とし、数値のない都市は「取得済み・確認中」または「公式サイトで確認」と表示。交通は、Toronto（TTC）・Sydney（Transport for NSW）で読めた内容（支払い方法・学生区分の対象条件の所在）を当方の言葉で要約し、運賃・路線図・学生割引の確認先のリンクを交通カードの最初の画面に表示。London（TfL）・Melbourne（Transport Victoria）は403で読めず、リンクのみ・確認中。TTC の利用規約を読み（実質的な部分の複製は書面許可が必要）制限ありと記録、金額は転載しない。Transport for NSW の対象者ページは大学・TAFEのフルタイム学生を対象とし、留学生は特定の奨学金のみ、語学学校は記載なし。学生割引の対象を推測せず、公式ページへ誘導。既存の承認済み家賃7件・Vancouver 気候・英国政府 claim・Planner は変更なし。",
  "42. **Ver.1.6.4 Toronto の気候データ 1991–2020 を正式承認・公開**: StarHunting1 が 2026-10-19 に承認（照合：GitHub Actions run 39308503517 で ECCC 公式CSVと48値・年値4件が全件一致）。対象は TORONTO (CITY)（気候ID 6158350・6158355、43.67 N・79.40 W、112.5 m、空港ではない）、年平均気温9.7・平均最高13.4・平均最低6.0 °C、年降水量822.7 mm（ECCC公表値。月別合計822.8 mm とは異なるが理由は未確認のため断定しない）、品質コード（気温A・降水量C）、ECCC Data Services End-use Licence v2.1.1。値・年値・観測所・期間・品質コード・出典を後から変えるとビルドが失敗する。Toronto vs Vancouver は同じ1991–2020でも市内中心部と空港で観測地点の種類が違うため「参考値のみ」。Sydney・Melbourne・London の気候数値は引き続き非公開。承認済み家賃7件・Vancouver 気候・英国政府 claim・Planner は変更なし。",
  "43. **Ver.1.6.5 生活費カードと交通カードの改善（新しい数値の公開なし）**: 6都市の交通ガイドを整備（Manchester・Vancouver を新設）。2026-10-19に GitHub Actions（run 39315079633、読み取り専用・各1回）で TfGM（バス乗車券・路線図）を読み、支払い方法・チケットの種類・学生券の対象条件の所在を当方の言葉で要約（金額は転載せず、学生割引の対象を断定しない）。同じプローブが、権利レコードで自動アクセスを禁じている TransLink の3ページも取得してしまったが（誤り）、内容は使わず、Vancouver はリンクのみとし、訂正を権利レコードに記録した。リンクは「応答した」と「内容を読んだ」を別に記録。London・Melbourne は前回 HTTP 403 のため再試行せずリンクのみ。生活費カードは費用の4項目（公共交通・食費・通信費・日用品）と公式運賃・費用プランナーへの導線を表示し、数値は出さない。公的な生活費統計の数値候補は取得できず（ONS 対象ページ HTTP 404、Statistics Canada HTTP 500、ABS 家計支出調査は2015–16年度・世帯単位）、世帯の平均支出を留学生の生活費として載せることもしていない。承認済みの家賃7件・英国政府 claim・Vancouver と Toronto の気候・Planner は変更なし。",
  "44. **Ver.1.6.6 データ収集の安全性（通信前の権利チェック）**: `collector/guard.ts` を新設し、収集・リンクチェック・調査スクリプトの自動リクエストを通信前に権利レコードで判定する（許可／条件付き／禁止／未確認。不明は許可しない）。取得方法（本文・API・データセット・robots・ステータスのみ）を区別し、robots.txt が許可していても権利レコードが禁止なら取得しない。リンクチェックは禁止・未確認のリンクを通信せずに記録し、取得方法と確認日を保持する。TransLink の全URLが通信前に拒否されることをモックのテストで保証。承認済みデータ・出典表示・Plannerは変更なし。限界：ガードを経由しない通信は防げない。",
  "45. **Ver.1.6.7 学校の確認状態の整理（新しい外部アクセスなし）**: 掲載中の語学学校13校すべてに、機関登録・所在地・コース・認定／加盟の4項目を別々の状態（2つの情報源で一致／情報源は1つだけ／学校自身の記載のみ／確認できていません／未確認）で記録した（Manchester・Vancouver・Toronto・London の9校は既存の記録の整理で、新しい調査結果ではない）。学校比較に、登録簿・ディレクトリなど第三者の記録へのリンク（なければ「見つかっていません」）を追加し、学校自身の記載と第三者の記録を分けて表示する。Study Australia／CRICOS・Languages Canada・English UK・British Council・各校サイトは権利レコードがなく、Ver.1.6.6 のガードにより自動取得されない（規約を読むための取得もできないため、権利レコードは推測で作っていない）。コースは全校で学校自身の記載のみ、NEAS 認定は4校とも未確認。学校全体の verified 判定・承認記録・料金の数値は追加していない。承認済みデータ・Planner は変更なし。",
  "",
  "### 承認待ちの確認結果（承認済みの5件を除き verified にはしていません）",
  "2026-10-15 の Actions ページ確認（run 38787463398）で、言い換えた記述が公式ページの記載と一致することを確認した項目。人が承認するまで unverified のまま。",
  "- GOV.UK: 学生のIHSは年£776（その他の申請は年£1,035）、英国外から申請する6か月以内はIHS不要 / 英語コースは6か月超〜11か月が短期学習ビザ（6か月以内は訪問者、11か月超は Student visa）、短期学習ビザの申請料£228 / 訪問者として6か月までの学習が可能（認定機関）",
  "- BC州: 国際学生ヘルスフィーは月$75、有効な就学許可を持ち年間で少なくとも6か月は州内にいる学生が対象（旧文言「6か月以上有効な就学許可」は不正確で Ver.1.3.4 で修正済み）、加入前に待機期間（居住開始月の残り＋2か月）があり民間保険が必要",
  "- IRCC: 6か月以内のプログラムは就学許可不要だが渡航書類（eTAまたは訪問者ビザ）は必要 / eTAは査証免除国の国籍で航空機を使う場合に必要（陸路・バス・鉄道・船は不要）",
  "",
  "### Planner で未計上になりやすい費用",
  "授業料・航空券・ビザ・保険は公式データがなく、手入力が必要（Ver.1.2.9 / 1.3 で入力欄を用意）。語学留学の住居・食費・交通・通信は、Manchester は大学生向け見積もり（対象外）のため公式値が使えず、手入力か未計上。Vancouver は CMHC 市場家賃が手動選択扱い。Toronto 他3都市はそもそも都市データがなくプランナーで選べない。",
].join("\n");

if (require.main === module) { const out = path.resolve(__dirname, "../RELEASE_DATA_AUDIT.md"); writeFileSync(out, auditMarkdown()); console.log(`wrote ${out}`); }
