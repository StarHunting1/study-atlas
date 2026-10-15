# RELEASE_DATA_AUDIT – データ監査（6都市）

生成: `npm run audit`（基準日 2026-10-15）。データファイルから自動生成。手書きの所見は末尾。

- **verified** = 引用した出典と照合済み / **unverified** = 出典未照合 / **sample** = 架空のデモ数値（公開画面では数値を出さない）/ **pending** = 未取得。
- 「利用可能率」= verified と unverified（根拠付きで表示される事実）÷ 全項目。sample は**データとして数えません**。

## 1. 都市 × 分野の充足

| 都市 | 項目数 | verified | unverified | sample（非公開） | pending | 利用可能率 | verified率 |
|---|---|---|---|---|---|---|---|
| Vancouver | 25 | 2 | 9 | 0 | 14 | 44% | 8% |
| Toronto | 25 | 0 | 7 | 3 | 15 | 28% | 0% |
| Manchester | 25 | 5 | 9 | 0 | 11 | 56% | 20% |
| London | 25 | 0 | 7 | 3 | 15 | 28% | 0% |
| Sydney | 25 | 0 | 5 | 3 | 17 | 20% | 0% |
| Melbourne | 25 | 0 | 5 | 3 | 17 | 20% | 0% |

### 分野別（verified / unverified / sample / pending）

| 分野 | Vancouver | Toronto | Manchester | London | Sydney | Melbourne |
|---|---|---|---|---|---|---|
| Living costs | 1 / 0 / 0 / 4 | 0 / 0 / 3 / 2 | 4 / 0 / 0 / 1 | 0 / 0 / 3 / 2 | 0 / 0 / 3 / 2 | 0 / 0 / 3 / 2 |
| Housing | 0 / 1 / 0 / 3 | 0 / 1 / 0 / 3 | 0 / 1 / 0 / 3 | 0 / 1 / 0 / 3 | 0 / 1 / 0 / 3 | 0 / 1 / 0 / 3 |
| Climate | 1 / 1 / 0 / 0 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 |
| Safety | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 |
| Education | 0 / 2 / 0 / 1 | 0 / 1 / 0 / 2 | 0 / 2 / 0 / 1 | 0 / 1 / 0 / 2 | 0 / 1 / 0 / 2 | 0 / 1 / 0 / 2 |
| Transport | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 | 1 / 1 / 0 / 0 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 | 0 / 1 / 0 / 1 |
| Visa | 0 / 2 / 0 / 0 | 0 / 2 / 0 / 0 | 0 / 2 / 0 / 0 | 0 / 2 / 0 / 0 | 0 / 0 / 0 / 2 | 0 / 0 / 0 / 2 |
| Daily life | 0 / 2 / 0 / 3 | 0 / 1 / 0 / 4 | 0 / 2 / 0 / 3 | 0 / 1 / 0 / 4 | 0 / 1 / 0 / 4 | 0 / 1 / 0 / 4 |

## 2. 公式データポイント（data/official）

| 都市 | 件数 | verified | unverified | 表示=数値可 | 表示=リンクのみ/保留 | 気候 | 最終確認から180日超 |
|---|---|---|---|---|---|---|---|
| Vancouver | 16 | 16 | 0 | 4 | 12 | verified（1981–2010） | 0 |
| Toronto | 0 | – | – | – | – | なし | – |
| Manchester | 25 | 25 | 0 | 25 | 0 | verified（1971–2000） | 0 |
| London | 0 | – | – | – | – | なし | – |
| Sydney | 0 | – | – | – | – | なし | – |
| Melbourne | 0 | – | – | – | – | なし | – |

## 3. 語学学校・大学

| 都市 | 語学学校（表示） | 非表示 | 状態 | 大学（Ver.1.0引き継ぎ） |
|---|---|---|---|---|
| Vancouver | 3 | 0 | unverified | 2（unverified） |
| Toronto | 0 | 0 | pending | 2（unverified） |
| Manchester | 2 | 1 | unverified | 2（unverified） |
| London | 0 | 0 | pending | 3（unverified） |
| Sydney | 0 | 0 | pending | 2（unverified） |
| Melbourne | 0 | 0 | pending | 2（unverified） |

## 4. 出典の利用条件（権利管理）

| 出典 | 都市 | 利用区分 | 表示 | 自動取得 |
|---|---|---|---|---|
| Transport for Greater Manchester (Bee Network) | manchester | needs-review | （区分から導出） | page-check-only |
| TransLink | vancouver | restricted | （区分から導出） | blocked |
| The University of Manchester | manchester | needs-review | （区分から導出） | page-check-only |
| The University of Manchester (accommodation) | manchester | needs-review | （区分から導出） | page-check-only |
| Office for National Statistics – Price Index of Private Rents (Manchester) | manchester | permitted | （区分から導出） | allowed |
| Statistics Canada / CMHC – average rents (table 34-10-0133-01) | vancouver | permitted | （区分から導出） | allowed |
| Environment and Climate Change Canada – climate normals (MSC GeoMet API) | vancouver | permitted | （区分から導出） | allowed |
| Met Office – historical monthly station data (Ringway) | manchester | permitted | （区分から導出） | blocked |
| UBC Student Housing and Community Services | vancouver | restricted | （区分から導出） | blocked |

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
- pending: Education / Language schools
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
- unverified: Visa / Points to note（確認日 2026-10-15）
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
- pending: Education / Language schools
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
3. **Toronto / London / Sydney / Melbourne** は公式データポイント・気候・語学学校がゼロ。実質的に「概要文＋準備中」のみで、公開品質に達していない。
4. 語学学校は Manchester 2校・Vancouver 3校（すべて unverified、料金なし）。Excel College / UKEC Academy は非表示。
5. 公式データは Manchester / Vancouver のみ。TfGM・TransLink・UBC の料金は利用条件が `needs-review` / `restricted` のため、数値表示はそれぞれの権利区分に従う。
6. 学生寮・ホームステイ・シェアハウスの1人あたり料金は、Manchester の University of Manchester 寮と大学見積もり以外に再利用可能な出典がなく「参考料金は準備中」。

7. **Ver.1.3.1 で追加**: 英国・カナダの入国区分の概要（Visa）と、Manchester / Vancouver の医療保険の基本要件（Daily life / Healthcare）を、政府の公式ページを出典とする **unverified** の事実として追加（ページの突き合わせは未了。国籍・個別事情による違いを明記し、個人への判定はしない）。
8. **古い可能性**: Manchester の気候は 1971–2000、Vancouver は 1981–2010 の平年値。より新しい平年値（1991–2020）が公開されている可能性が高く、既存の GitHub Actions 収集の対象を更新して承認フローで差し替えるのが次の作業。
9. **地図タイル**: トップページの地図は MapLibre のデモタイルを使用（本番運用向けではない）。公開前に商用利用可能なタイル提供元へ切り替えが必要。
10. `Climate / Monthly` と `Living costs / Rent` が pending なのは、都市ページが公式データ（data/official）を直接使うため。上の表は profile 項目だけを数えるので、Manchester / Vancouver の実データ量を過小に見せる。実データ量は §2 を参照。

### Planner で未計上になりやすい費用
授業料・航空券・ビザ・保険は公式データがなく、手入力が必要（Ver.1.2.9 / 1.3 で入力欄を用意）。語学留学の住居・食費・交通・通信は、Manchester は大学生向け見積もり（対象外）のため公式値が使えず、手入力か未計上。Vancouver は CMHC 市場家賃が手動選択扱い。Toronto 他3都市はそもそも都市データがなくプランナーで選べない。
