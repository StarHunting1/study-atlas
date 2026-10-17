# RELEASE_DATA_AUDIT – データ監査（6都市）

生成: `npm run audit`（基準日 2026-10-17）。データファイルから自動生成。手書きの所見は末尾。

- **verified** = 引用した出典と照合済み / **unverified** = 出典未照合 / **sample** = 架空のデモ数値（公開画面では数値を出さない）/ **pending** = 未取得。
- 「利用可能率」= verified と unverified（根拠付きで表示される事実）÷ 全項目。sample は**データとして数えません**。

## 1. 都市 × 分野の充足

| 都市 | 項目数 | verified | unverified | sample（非公開） | pending | 利用可能率 | verified率 |
|---|---|---|---|---|---|---|---|
| Vancouver | 25 | 2 | 9 | 0 | 14 | 44% | 8% |
| Toronto | 25 | 0 | 8 | 3 | 14 | 32% | 0% |
| Manchester | 25 | 6 | 8 | 0 | 11 | 56% | 24% |
| London | 25 | 1 | 7 | 3 | 14 | 32% | 4% |
| Sydney | 25 | 0 | 5 | 3 | 17 | 20% | 0% |
| Melbourne | 25 | 0 | 5 | 3 | 17 | 20% | 0% |

### 分野別（verified / unverified / sample / pending）

| 分野 | Vancouver | Toronto | Manchester | London | Sydney | Melbourne |
|---|---|---|---|---|---|---|
| Living costs | 1 / 0 / 0 / 4 | 0 / 0 / 3 / 2 | 4 / 0 / 0 / 1 | 0 / 0 / 3 / 2 | 0 / 0 / 3 / 2 | 0 / 0 / 3 / 2 |
| Housing | 0 / 1 / 0 / 3 | 0 / 1 / 0 / 3 | 0 / 1 / 0 / 3 | 0 / 1 / 0 / 3 | 0 / 1 / 0 / 3 | 0 / 1 / 0 / 3 |
| Climate | 1 / 1 / 0 / 0 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 |
| Safety | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 |
| Education | 0 / 2 / 0 / 1 | 0 / 2 / 0 / 1 | 0 / 2 / 0 / 1 | 0 / 2 / 0 / 1 | 0 / 1 / 0 / 2 | 0 / 1 / 0 / 2 |
| Transport | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 | 1 / 1 / 0 / 0 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 |
| Visa | 0 / 2 / 0 / 0 | 0 / 2 / 0 / 0 | 1 / 1 / 0 / 0 | 1 / 1 / 0 / 0 | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 |
| Daily life | 0 / 2 / 0 / 3 | 0 / 1 / 0 / 4 | 0 / 2 / 0 / 3 | 0 / 1 / 0 / 4 | 0 / 1 / 0 / 4 | 0 / 1 / 0 / 4 |

## 2. 公式データポイント（data/official）

| 都市 | 件数 | verified | unverified | 表示=数値可 | 表示=リンクのみ/保留 | 気候 | 最終確認から180日超 |
|---|---|---|---|---|---|---|---|
| Vancouver | 16 | 16 | 0 | 4 | 12 | verified（1991–2020） | 0 |
| Toronto | 0 | 0 | 0 | 0 | 0 | なし | 0 |
| Manchester | 25 | 25 | 0 | 25 | 0 | verified（1971–2000） | 0 |
| London | 0 | 0 | 0 | 0 | 0 | なし | 0 |
| Sydney | 0 | – | – | – | – | なし | – |
| Melbourne | 0 | – | – | – | – | なし | – |

## 3. 語学学校・大学

| 都市 | 語学学校（表示） | 非表示 | 状態 | 大学（Ver.1.0引き継ぎ） |
|---|---|---|---|---|
| Vancouver | 2 | 1 | unverified | 2（unverified） |
| Toronto | 2 | 0 | unverified | 2（unverified） |
| Manchester | 3 | 3 | unverified | 2（unverified） |
| London | 2 | 1 | unverified | 3（unverified） |
| Sydney | 0 | 0 | pending | 2（unverified） |
| Melbourne | 0 | 0 | pending | 2（unverified） |

## 4. 出典の利用条件（権利管理）

| 出典 | 都市 | 利用区分 | 表示 | 自動取得 |
|---|---|---|---|---|
| Transport for Greater Manchester (Bee Network) | manchester | needs-review | （区分から導出） | page-check-only |
| TransLink | vancouver | restricted | （区分から導出） | blocked |
| The University of Manchester | manchester | needs-review | （区分から導出） | page-check-only |
| The University of Manchester (accommodation) | manchester | needs-review | （区分から導出） | page-check-only |
| Office for National Statistics – Price Index of Private Rents (Manchester) | manchester, london | permitted | （区分から導出） | allowed |
| Statistics Canada / CMHC – average rents (table 34-10-0133-01) | vancouver, toronto | permitted | （区分から導出） | allowed |
| Environment and Climate Change Canada – climate normals (MSC GeoMet API) | vancouver | permitted | （区分から導出） | allowed |
| Met Office – historical monthly station data (Ringway) | manchester | permitted | （区分から導出） | blocked |
| UBC Student Housing and Community Services | vancouver | restricted | （区分から導出） | blocked |
| Toronto Transit Commission (TTC) – fares and passes | toronto | unknown | link-only | blocked |
| Transport for London (TfL) – fares and discounts | london | unknown | link-only | blocked |

## 4b. 出典リンクの検査（Manchester / Vancouver）

実行: GitHub Actions（2026-10-17、https://github.com/StarHunting1/study-atlas/actions/runs/39060315008）。1リンク1回の確認（再試行なし・robots.txt遵守。権利記録で自動アクセスを禁じている TransLink / UBC / Met Office サイトは要求しない）。

| 対象 | 検証済み（2xx＋期待語を確認） | 到達（語は未確認/不一致） | アクセス拒否 | リンク切れ | 要求せず |
|---|---|---|---|---|---|
| 67 | 40 | 11 | 3 | 0 | 11 |

- 「アクセス拒否」(401/403/429)は**リンク切れではありません**。ページは存在しうるが自動アクセスを拒むため、未検証のまま扱います。
- 到達しても期待語が見つからないリンクは検証済みにしません（例: Express English College の公式サイトはタイトルに校名がなく、手動で English UK 掲載のサイトURLと一致を確認）。

| 状態 | 件数 | 例 |
|---|---|---|
| アクセス拒否 | 3 | https://ihvancouver.com/ , https://ihvancouver.com/2024/11/08/new-campus/ , https://ihvancouver.com/ihv-price-list/ |

## 5. 未確認・仮データ一覧（項目ごと）

### Vancouver

- pending: Living costs / Food
- pending: Living costs / Transport
- pending: Living costs / Phone / mobile data
- pending: Living costs / Total monthly living cost
- unverified: Housing / Overview（確認日なし）
- pending: Housing / Student halls / dormitories
- pending: Housing / Homestay
- pending: Housing / Shared houses / flats
- unverified: Climate / Overview（確認日なし）
- pending: Safety / Official crime statistics
- pending: Safety / Safety advice
- unverified: Education / Universities（確認日なし）
- unverified: Education / Language schools（確認日 2026-10-15）
- pending: Education / Tuition fees
- unverified: Transport / Main transport（確認日なし）
- pending: Transport / Student discounts
- unverified: Visa / Official information（確認日 2026-10-15）
- unverified: Visa / Points to note（確認日 2026-10-15）
- unverified: Daily life / Student life（確認日なし）
- unverified: Daily life / Healthcare（確認日 2026-10-15）
- pending: Daily life / SIM / mobile
- pending: Daily life / Banking
- pending: Daily life / Student facilities

### Toronto

- **sample（数値は非公開）** Living costs / Rent
- pending: Living costs / Food
- **sample（数値は非公開）** Living costs / Transport
- pending: Living costs / Phone / mobile data
- **sample（数値は非公開）** Living costs / Total monthly living cost
- unverified: Housing / Overview（確認日なし）
- pending: Housing / Student halls / dormitories
- pending: Housing / Homestay
- pending: Housing / Shared houses / flats
- unverified: Climate / Overview（確認日なし）
- pending: Climate / Monthly mean temperature and precipitation
- pending: Safety / Official crime statistics
- pending: Safety / Safety advice
- unverified: Education / Universities（確認日なし）
- unverified: Education / Language schools（確認日 2026-10-17）
- pending: Education / Tuition fees
- unverified: Transport / Main transport（確認日なし）
- pending: Transport / Student discounts
- unverified: Visa / Official information（確認日 2026-10-15）
- unverified: Visa / Points to note（確認日 2026-10-15）
- unverified: Daily life / Student life（確認日なし）
- pending: Daily life / Healthcare
- pending: Daily life / SIM / mobile
- pending: Daily life / Banking
- pending: Daily life / Student facilities

### Manchester

- pending: Living costs / Rent
- unverified: Housing / Overview（確認日なし）
- pending: Housing / Student halls / dormitories
- pending: Housing / Homestay
- pending: Housing / Shared houses / flats
- unverified: Climate / Overview（確認日なし）
- pending: Climate / Monthly mean temperature and precipitation
- pending: Safety / Official crime statistics
- pending: Safety / Safety advice
- unverified: Education / Universities（確認日なし）
- unverified: Education / Language schools（確認日 2026-10-15）
- pending: Education / Tuition fees
- unverified: Transport / Main transport（確認日なし）
- unverified: Visa / Official information（確認日 2026-10-15）
- unverified: Daily life / Student life（確認日なし）
- unverified: Daily life / Healthcare（確認日 2026-10-15）
- pending: Daily life / SIM / mobile
- pending: Daily life / Banking
- pending: Daily life / Student facilities

### London

- **sample（数値は非公開）** Living costs / Rent
- pending: Living costs / Food
- **sample（数値は非公開）** Living costs / Transport
- pending: Living costs / Phone / mobile data
- **sample（数値は非公開）** Living costs / Total monthly living cost
- unverified: Housing / Overview（確認日なし）
- pending: Housing / Student halls / dormitories
- pending: Housing / Homestay
- pending: Housing / Shared houses / flats
- unverified: Climate / Overview（確認日なし）
- pending: Climate / Monthly mean temperature and precipitation
- pending: Safety / Official crime statistics
- pending: Safety / Safety advice
- unverified: Education / Universities（確認日なし）
- unverified: Education / Language schools（確認日 2026-10-17）
- pending: Education / Tuition fees
- unverified: Transport / Main transport（確認日なし）
- pending: Transport / Student discounts
- unverified: Visa / Official information（確認日 2026-10-15）
- unverified: Daily life / Student life（確認日なし）
- pending: Daily life / Healthcare
- pending: Daily life / SIM / mobile
- pending: Daily life / Banking
- pending: Daily life / Student facilities

### Sydney

- **sample（数値は非公開）** Living costs / Rent
- pending: Living costs / Food
- **sample（数値は非公開）** Living costs / Transport
- pending: Living costs / Phone / mobile data
- **sample（数値は非公開）** Living costs / Total monthly living cost
- unverified: Housing / Overview（確認日なし）
- pending: Housing / Student halls / dormitories
- pending: Housing / Homestay
- pending: Housing / Shared houses / flats
- unverified: Climate / Overview（確認日なし）
- pending: Climate / Monthly mean temperature and precipitation
- pending: Safety / Official crime statistics
- pending: Safety / Safety advice
- unverified: Education / Universities（確認日なし）
- pending: Education / Language schools
- pending: Education / Tuition fees
- unverified: Transport / Main transport（確認日なし）
- pending: Transport / Student discounts
- pending: Visa / Official information
- pending: Visa / Points to note
- unverified: Daily life / Student life（確認日なし）
- pending: Daily life / Healthcare
- pending: Daily life / SIM / mobile
- pending: Daily life / Banking
- pending: Daily life / Student facilities

### Melbourne

- **sample（数値は非公開）** Living costs / Rent
- pending: Living costs / Food
- **sample（数値は非公開）** Living costs / Transport
- pending: Living costs / Phone / mobile data
- **sample（数値は非公開）** Living costs / Total monthly living cost
- unverified: Housing / Overview（確認日なし）
- pending: Housing / Student halls / dormitories
- pending: Housing / Homestay
- pending: Housing / Shared houses / flats
- unverified: Climate / Overview（確認日なし）
- pending: Climate / Monthly mean temperature and precipitation
- pending: Safety / Official crime statistics
- pending: Safety / Safety advice
- unverified: Education / Universities（確認日なし）
- pending: Education / Language schools
- pending: Education / Tuition fees
- unverified: Transport / Main transport（確認日なし）
- pending: Transport / Student discounts
- pending: Visa / Official information
- pending: Visa / Points to note
- unverified: Daily life / Student life（確認日なし）
- pending: Daily life / Healthcare
- pending: Daily life / SIM / mobile
- pending: Daily life / Banking
- pending: Daily life / Student facilities

## 6. 古くなっている可能性（最終確認が180日より前、または日付なし）

- なし（すべて180日以内）

## 7. 手書きの所見（2026-10-15）

### 見つかった問題と対応
1. **架空のデモ数値が公開画面に出ていた**: Toronto / London / Sydney / Melbourne の `cost.rent` `cost.transport` `cost.totalMonthly` は Ver.1.0 のデモ値（status = sample。期間・含まれる項目・出典が未定義）。都市ページの主要数値と都市比較の表に「デモ用サンプル」ラベル付きで数値が表示されていた。→ 本PRで**数値を表示しない**（「データ準備中」）よう修正。値自体はデータに残し、監査上は「データなし」として数える。
2. **Ver.1.0 引き継ぎの概要文**（気候・住居の概要・交通・暮らし・大学名）は全都市で unverified。ラベル付きで表示されるが、出典はない。
3. **Sydney / Melbourne** は公式データポイント・気候・語学学校がゼロ（Toronto / London は Ver.1.5.0 で項目34のとおり拡充。ただし家賃は承認待ちで数値は未掲載）。実質的に「概要文＋準備中」のみで、公開品質に達していない。
4. 語学学校は Manchester 2校・Vancouver 3校（すべて unverified、料金なし）。Excel College / UKEC Academy は非表示。
5. 公式データは Manchester / Vancouver のみ。TfGM・TransLink・UBC の料金は利用条件が `needs-review` / `restricted` のため、数値表示はそれぞれの権利区分に従う。
6. 学生寮・ホームステイ・シェアハウスの1人あたり料金は、Manchester の University of Manchester 寮と大学見積もり以外に再利用可能な出典がなく「参考料金は準備中」。

7. **Ver.1.3.1 で追加**: 英国・カナダの入国区分の概要（Visa）と、Manchester / Vancouver の医療保険の基本要件（Daily life / Healthcare）を、政府の公式ページを出典とする **unverified** の事実として追加（ページの突き合わせは未了。国籍・個別事情による違いを明記し、個人への判定はしない）。
8. **古い可能性**: Manchester の気候は 1971–2000 の平年値のまま（1991–2020 は未取得）。Vancouver は Ver.1.4.3 で 1991–2020 に更新済み（項目33）。両都市の基準期間が異なるため、比較では同じ基準期間として扱わない。
9. **地図タイル**: （Ver.1.3.5 で解消）MapLibre のデモタイルをやめ、同梱の静的SVG（Natural Earth）に変更した。
10. `Climate / Monthly` と `Living costs / Rent` が pending なのは、都市ページが公式データ（data/official）を直接使うため。上の表は profile 項目だけを数えるので、Manchester / Vancouver の実データ量を過小に見せる。実データ量は §2 を参照。

11. **Ver.1.3.2 の検査で見つかった誤り**: MC Academy に載せていた公式サイトURL（themcacademy.co.uk）は、現在は別の組織（Money Confidence Academy）のサイトだった → URLを削除。English UK の個別ページも開けず、公式サイト・営業状況・認定状況を確認できないため、一般向け一覧から**非表示**（Excel College / UKEC Academy と同じ扱い。データと記録は保持）。
12. **気候 1991–2020**: （Vancouver は Ver.1.3.5 で候補を取得 → 項目18、Manchester は保留）。以下は Ver.1.3.2 時点の調査: ECCC の GeoMet API は 1981–2010 のみ。1991–2020 は気象庁のページから**一括CSV（zip）**でのみ提供され、Vancouver 国際空港は観測所IDが2013年に変わる合成観測所（1108447→1108395）のため、取り込みには別のPRで取得手順と観測所の扱いを確認する必要がある。Met Office は公式の 1991–2020 平年値に利用できるオープンデータのファイルが見つからず（data.gov.uk の UK Climate Averages は 1981–2010 の記述で、ライセンス・資源の記載なし）、サイト規約で自動取得も禁止されている → どちらも**取り込み保留**。既存の 1971–2000 / 1981–2010 は期間を明記し「最新の標準期間ではない」注意書きを都市ページに追加した。
13. **Ver.1.3.3**: Manchester の語学学校を English UK 掲載を起点に 1校→3校（Express English College / International House Manchester / Kaplan Manchester）へ拡充。公式サイトの生存と English UK 掲載の住所一致を Actions（run 38793091211）で確認できた学校のみ公開。EC Manchester（English UK の個別ページ 404）・MC Academy・Excel College / UKEC は非表示。British Council のページは403のため認定状況は人の確認待ち。料金表は取り込まず、公式料金ページ（IH Manchester / IH Vancouver）へのリンクのみ。
14. **Vancouver**: International House Vancouver は New Westminster 所在を維持。EF Vancouver は Languages Canada 掲載と住所・宿泊を照合。Sprachcaffe Vancouver は Languages Canada に掲載がなく認定の記載もないため非表示。
15. **承認用の記録**: 英国・カナダの入国/保険/IHS/BC州学生ヘルスフィーの根拠・対象条件・出典・確認日・ライセンスは `data/APPROVAL_CANDIDATES.md` に集約（全件 unverified のまま、承認待ち）。Planner への自動計上はしない（テストで固定）。
16. **Ver.1.3.4 政府情報10件の再検証**: 承認推奨9件（U1〜U6、C1〜C3）／修正が必要1件（C4：BC州ヘルスフィーの対象条件を「年間で少なくとも6か月は州内にいる、有効な就学許可の学生」「成人はMSP脱退で対象外」に是正済み）／確認不能0件。いずれも verified にはせず、1件ずつの承認手順を `data/APPROVAL_CANDIDATES.md` §0 に記録。英国の医療欄はIHSの申請場所・期間の条件（6か月以内は英国外から申請なら不要、英国内なら半額、6か月超〜1年未満は1年分）をページどおりに正確化。
17. **語学学校の料金**: 5校（Manchester 3・Vancouver 2）すべてが公式の料金案内ページへのリンクを持つ。どの学校のサイトにも料金の再利用を認める記載がなく（Kaplan は書面許可なしの複製を禁止、IH Manchester・EF は著作権留保、Express は記載なし、IH Vancouver は自動アクセス403で規約未読）、**金額・料金表は取り込まず**（`language-school-fees` を link-only で記録）。授業料・週の授業時間・最低期間・登録料・教材費・滞在費はすべて「未取得」。学校比較には、料金を比べる前に揃える条件（週のレッスン数・期間・諸費用・滞在条件・年度と通貨）を表示。
18. **Ver.1.3.5 気候 1991–2020**: Vancouver は ECCC の一括CSV（BC州、合成観測所 VANCOUVER INTERNATIONAL (AIRPORT)＝気候ID 1108447＋1108395、標高4.3m）から4要素（日平均・日最高・日最低・降水量）を取得し、**承認待ちの候補（unverified の `climateAlt`）**として保持。画面は確認済みの 1981–2010 のまま。Manchester は Met Office の1991–2020に使えるオープンデータファイルがなく、サイト規約で自動取得も禁止されているため**取り込み保留**（旧 1971–2000 を保持、理由は `data/APPROVAL_CANDIDATES.md`）。
19. **地図**: トップページの地図を、MapLibre のデモタイル（本番用途ではない）から、同梱の静的SVG（Natural Earth、パブリックドメイン）へ変更。外部リクエスト・APIキー・料金・アクセス制限なし。比較表は `data/MAP_OPTIONS.md`。
20. **承認レビュー表**: 政府情報10件を、表示文言・適用条件・出典と確認日・再利用条件・既存表示との差分・推奨/保留でまとめた（推奨10件、うち条件つき4件、保留0件）。U4 の文言は直接の根拠がない記述を削除。承認は Fact 単位（1件だけの承認はできない点を記録）。
21. **Ver.1.3.6 承認管理**: 政府情報の候補10件（U1〜U6、C1〜C4）を、画面の Fact の中の**主張（claim）15件**に分け、主張ごとに出典・ライセンス・適用条件・推奨・承認記録を持たせた。Fact は全ての主張が verified のときだけ verified（一部のみ承認なら画面で主張ごとに表示）。承認記録（承認者・日付・比較内容）が無い verified、保留の主張の verified、混在 Fact の verified は、ビルド時の検査で失敗する。現在 verified は 0 件。承認用シートは `data/APPROVAL_SHEET.md`（`npm run approvals` で生成、テストで最新性を検査）。
22. **保留**: C4-ref（StudyAtlas 自身の案内文で出典の記述ではない）は保留。U5 の「訪問者にはIHSがなく保険が必要」は根拠がないため削除、C3 の「渡航前に申請」は逐語の根拠がないため確認できた記載に置換。Canada.ca の商用再利用（C1〜C3）と BC州の転載（C4）は利用条件が未確認／書面許可が必要なため、言い換え＋リンクのみ。
23. **Vancouver 気候 1991–2020**: 承認シート（`data/APPROVAL_SHEET.md` §5）に 1981–2010 との月別比較（気温差は最大 ±0.4 ℃、降水量は最大 ±14 mm、年間 1189.0→1159.7 mm）、観測地点（合成観測所 1108447＋1108395）、単位、出典URL、利用許諾と出典表示、画面切り替えの影響をまとめた。画面の確認済み値（1981–2010）は変更していない。
24. **Ver.1.3.7 地図**: トップページを MapLibre ＋ OpenFreeMap（無料・商用可・キー不要・利用回数の上限なし、公式FAQで確認）のインタラクティブ地図に変更。デモタイルは不使用。接続できない場合は同梱SVG地図に自動切替。SLAなし（"as-is"）が残る唯一のリスク。詳細は `data/MAP_OPTIONS.md`。
25. **Ver.1.3.7 UI**: トップは地図中心（ピン選択で都市カード、一覧・カード選択で移動）。都市比較に「比較できる項目の状況」と各行の理由1行、都市ヘッダー。学校比較は公式サイト・料金ページへの導線をヘッダーに集約し、スマホは1校ずつ縦並び。データ・検証状況・承認管理（claim）・Planner の計算は変更していない。
26. **Ver.1.3.7b 地図の見た目**: 色が乏しかった原因は、選んでいた OpenFreeMap の `positron` がもともと白〜灰色のモノトーンだったこと（＋SVG時代の国の塗り分けが無くなったこと）。`liberty` に変更し、海・陸・森・国境をナチュラルな配色に再設定、対応国は緑の塗り＋輪郭（選択国は濃く）、ピンは白縁の紺（選択国は緑リング）にした。国ボタンは `fitBounds` で国全体と都市が入る範囲へ、都市は `flyTo`。国名は `lib/names.ts` に一本化し、タイル内の地名も言語に追従（日本語グリフは確認済み）。GitHub Actions のヘッドレス Chromium で OpenFreeMap の実タイルの描画を確認（スマホ390／iPad820／PC1280）。
27. **Ver.1.3.9 承認の準備**: 政府情報の主張15件（推奨8／条件つき推奨6／保留1）について、対象（国籍・滞在期間・ビザ区分）・既存表示との違い・承認前に人が決めること・主張ごとのチェックリスト・承認記録の書き方を `data/APPROVAL_SHEET.md` に追加（`data/approvalScope.ts` から生成）。**verified への変更は 0 件**（承認記録なし）。この環境から外部サイトは開けないため、出典の再調査はしていません（最後の確認は 2026-10-15 の Actions）。
28. **Vancouver 気候 1991–2020 の承認準備**: 月別48値・観測所ID（1108447＋1108395）・単位・期間・ライセンス・出典表示を承認用にまとめ、機械的な整合性チェック6項目（12か月そろい・日最低≤日平均≤日最高・現実的な範囲・月降水量の合計1159.7 mm が年値1159.5 mm と±1.0 mm 以内・季節性・記録の有無）が全て成立。ただし**出典との照合は人が行う**。年平均気温など気温の年値は未記録。承認までは 1981–2010 の verified 値を置き換えません。
29. **再利用条件の未解決**: Canada.ca（C1〜C3）と BC州（C4a〜C4c）は、言い換え＋リンクで足りるかの判断（または書面確認）が必要。確認先の公式ページを承認シートに記載。許可が無い限り引用・転載はしません。
30. **Ver.1.3.10 英国 claim の修正**: U4 を「Student visa はコース期間だけで決まらない（licensed student sponsor・資金・英語力・年齢）」に、U5a を「IHS の要否と NHS 利用の範囲はビザの種類・期間・申請場所・個々の事情で異なる（年£776／£1,035 は維持）」に修正（条件つき・承認者が出典と再照合）。U5-visa は U5a・U5b と重複するため承認候補から除外。政府 claim は 14 件（推奨5／条件つき8／保留1）。verified への変更は 0 件。
31. **Ver.1.4.0 英国の政府 claim 5件を正式承認**: 人（StarHunting1）の明示的な承認指示（2026-10-17）に基づき、U1・U2・U3・U5b・U6 の5件だけを `verified` に変更（記録は `data/approvals.ts`、承認時の文言・条件・出典も保存。承認後に変更するとビルド失敗）。U4・U5a・Canada.ca の C1〜C3・BC州の C4a〜C4c・C4-ref は未承認（unverified）のまま、Vancouver 気候 1991–2020 も未承認。Fact は全 claim が verified のときだけ verified（英国「注意点」＝U3 のみ → verified、英国「公式情報」・Manchester 医療 → 未確認のまま、claim ごとに表示）。ビザ・IHS は Planner に自動計上しない。
32. **Ver.1.4.2 Vancouver 1991–2020 の元CSV照合**: ECCC の一括CSV（BC州）を既存の GitHub Actions で1回だけ取得（run 39051554489）し、合成観測所の Normal の行と保存値を列見出しで照合。気温3要素と降水量の**48値すべて一致**（不一致 0）。年値：気温 10.5／14.0／7.0 ℃（月値の平均と一致）、降水量 1159.5 mm（月値の合計 1159.7 mm との差 0.2 mm は、四捨五入の最大誤差 ±0.6 mm の範囲内。算出方法は資料になく原因は断定しない）。観測所（1108447・1108395）と ECCC Data Services End-use Licence v2.1.1（商用利用可・出典表示必須）を確認。**承認と切り替えは人の最終承認待ち**（verified 変更なし）。
33. **Ver.1.4.3 Vancouver 1991–2020 気候を正式承認・本番反映**: 人（StarHunting1）の明示的な公開承認（2026-10-17）と、PR #46 での ECCC 元CSVとの全48値照合に基づき、1991–2020（合成観測所 VANCOUVER INTERNATIONAL (AIRPORT)＝気候ID 1108447＋1108395）を verified に変更し本番表示に切り替え（承認記録と承認した数値は `data/approvals.ts`、承認後に変えるとビルド失敗）。年間降水量は ECCC の公表値 1159.5 mm を表示（月別合計 1159.7 mm との 0.2 mm 差は丸めの範囲内だが、ECCC の算出方法は未確認のため原因は断定しない）。旧 1981–2010 は履歴として保持し非表示。ライセンスの版表記を v2.1.1（2026年8月）に更新。Manchester（1971–2000）とは基準期間が異なるため、比較は「参考」のまま（同じ基準期間として比べない）。
34. **Ver.1.5.0 Toronto / London の拡充**: 家賃統計を**候補として準備し、人の承認まで数値は表示しない**。Toronto＝CMHC 賃貸市場調査（Statistics Canada 表 34-10-0133-01、トロント都市圏〔国勢調査都市圏コード535・メンバー125〕、調査年2025、構造3戸以上、バチェラー1,491／1BR 1,761／2BR 2,045／3BR 2,294 カナダドル／月）。London＝ONS PIPR（ロンドン地域 E12000007、2026年8月、全住宅の平均 £2,332／月、16 Sep 2026版 Table 1）。いずれも Actions のプローブ（run 39058754956、2026-10-17）で公式データから読み取り。同時にロンドンの区別の値の差が大きいこと（例: Camden £2,819、Westminster £3,196）も確認（掲載はしない）。**Toronto とバンクーバーは同じ CMHC 定義・同じ年のため同じ基準、London（地域全体）と Manchester（1自治体）は別の統計**として扱い、後者は常に「参考値のみ」。語学学校は4校を追加表示（EF Toronto・Kaplan Toronto・Kaplan London・Frances King London、すべて unverified・料金はリンクのみ）、St Giles London Central は認定を確認できず非表示。TTC・TfL の運賃は再利用条件を確認していないためリンクのみ（TfL は自動アクセスに HTTP 403、再試行・回避なし）。気候・生活費は今回は見送り（理由は PR 本文）。

### 承認待ちの確認結果（承認済みの5件を除き verified にはしていません）
2026-10-15 の Actions ページ確認（run 38787463398）で、言い換えた記述が公式ページの記載と一致することを確認した項目。人が承認するまで unverified のまま。
- GOV.UK: 学生のIHSは年£776（その他の申請は年£1,035）、英国外から申請する6か月以内はIHS不要 / 英語コースは6か月超〜11か月が短期学習ビザ（6か月以内は訪問者、11か月超は Student visa）、短期学習ビザの申請料£228 / 訪問者として6か月までの学習が可能（認定機関）
- BC州: 国際学生ヘルスフィーは月$75、有効な就学許可を持ち年間で少なくとも6か月は州内にいる学生が対象（旧文言「6か月以上有効な就学許可」は不正確で Ver.1.3.4 で修正済み）、加入前に待機期間（居住開始月の残り＋2か月）があり民間保険が必要
- IRCC: 6か月以内のプログラムは就学許可不要だが渡航書類（eTAまたは訪問者ビザ）は必要 / eTAは査証免除国の国籍で航空機を使う場合に必要（陸路・バス・鉄道・船は不要）

### Planner で未計上になりやすい費用
授業料・航空券・ビザ・保険は公式データがなく、手入力が必要（Ver.1.2.9 / 1.3 で入力欄を用意）。語学留学の住居・食費・交通・通信は、Manchester は大学生向け見積もり（対象外）のため公式値が使えず、手入力か未計上。Vancouver は CMHC 市場家賃が手動選択扱い。Toronto 他3都市はそもそも都市データがなくプランナーで選べない。
