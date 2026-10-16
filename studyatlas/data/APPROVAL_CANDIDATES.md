# 承認用の記録（人間の承認が必要な候補）— Ver.1.3.6（Ver.1.3.3 の記録を 1.3.4 で再検証、1.3.5 でレビュー表）

> **Ver.1.3.6 から、承認は「主張（claim）」ごとにできます。最新の承認用シートは生成物 [`APPROVAL_SHEET.md`](APPROVAL_SHEET.md)（`npm run approvals`）です。** 下の §−1 の表は Ver.1.3.5 時点の記録で、U4・U5・C1・C3 の文言は 1.3.6 で見直しました（詳細はシートの各 claim の「推奨と理由」）。

**状態はすべて「承認待ち（unverified のまま）」です。** GitHub Actions のページ確認だけを理由に verified へ変更していません。承認する場合は、承認者・日付・比較した内容を記録した上で、該当する事実の `status` を `verified`、`sources` / `period` / `checkedAt` を満たす形で更新してください（`data/validate.ts` が検査します）。

確認方法: GitHub Actions（run [38787463398](https://github.com/StarHunting1/study-atlas/actions/runs/38787463398)・[38791190742](https://github.com/StarHunting1/study-atlas/actions/runs/38791190742)・[この PR の最新 run]）。各ページを1回だけ取得し、記載の語・金額をページ本文と照合（再試行なし、robots.txt 遵守）。ページの更新日は GOV.UK の Content API（`public_updated_at`）、canada.ca / BC の `dcterms.modified` による。

**Planner への自動計上は行いません。** ビザ・保険・医療関連費用は、どの区分に当てはまるかが国籍・コース・年齢・申請場所で変わるため、利用者が入力した値だけを計上します（`tests/releasecheck.test.ts` が、Manchester / Vancouver のどのプラン条件でも `visa` / `insurance` が自動で選ばれないことを検査）。

## −2. 気候データの承認候補（Ver.1.3.5）

| # | 内容 | 出典・観測地点・期間・単位 | 利用条件 | 状態 |
|---|---|---|---|---|
| K1 | Vancouver 1991–2020 平年値（日平均 4.1/4.7/6.7/9.4/13.0/15.8/18.2/18.2/15.2/10.3/6.4/3.9 ℃、日最高 6.8/7.9/10.1/13.1/16.9/19.6/22.4/22.4/19.1/13.5/9.3/6.6 ℃、日最低 1.4/1.5/3.3/5.7/9.0/11.9/13.9/14.0/11.2/7.0/3.6/1.2 ℃、降水量 174.0/90.8/106.4/85.5/59.1/51.1/34.1/36.1/51.9/123.9/174.6/172.2 mm、年 1159.5 mm） | ECCC「Canadian Climate Normals 1991–2020」ブリティッシュコロンビア州の一括CSV（2026-10-16 に1回取得、Actions run 38904919856）。観測所は**合成観測所** VANCOUVER INTERNATIONAL (AIRPORT)（normals code C）で、気候ID **1108447（VANCOUVER INT'L A）と 1108395（VANCOUVER INTL A、WMO 71892、YVR）** の合成、北緯49.20・西経123.18・標高4.3 m。気温の品質コードは B、降水量は C | ECCC Data Services End-use Licence v2.1.1（商用利用可・出典表示が必要：「Contains information licenced under the Data Server End-use Licence of Environment and Climate Change Canada.」） | **承認待ち（unverified の `climateAlt`）。画面にはまだ出していない**。画面は確認済みの 1981–2010 のまま（「最新の標準期間ではない」の注意書きつき） |

承認する場合: `data/official/vancouver.ts` で `climateAlt` を `climate` に入れ替え（旧 1981–2010 は `climateAlt` へ）、`status` を `verified`、`note` に承認者・日付を記録する。合成観測所の扱い（2013年前後で観測所IDが変わる）が利用目的に合うかを確認してください。

**Manchester の 1991–2020 は取り込めていません（旧 1971–2000 のまま）**。理由: ①Met Office の 1991–2020 の地点別平年値は、同社サイトの JavaScript ページにあり、公開APIやダウンロードファイルが見つからない。②サイトの規約が自動取得を禁じている（`metoffice-station-data` は自動アクセス不可）。③地点ページが Ringway（マンチェスター空港）を網羅するか未確認（「公式観測所のみ・地理的に均等な地点」と説明されている）。④代替の NOAA GHCN-Monthly v4 は公開データだが、公式の平年値ではなく、StudyAtlas が月平均から30年平均を計算することになり（「公式の平年値」と区別が必要）、降水量は別データセット、Manchester Airport の観測所IDと欠測の確認も未了のため、今回は実装していません。次の候補: 人が Met Office のページ（または Ringway 月別データ）から1991–2020を確認して提供するか、NOAA GHCNm から「StudyAtlas 計算値」として扱う設計を承認する。

## −1. 承認レビュー表（Ver.1.3.5）— 1件ずつ確認する用

**verified への変更は人間の明示的な承認があるまで行いません（現在10件すべて unverified）。** 新規の調査は行わず、§0〜§2 の既存の確認結果（Actions run 38787463398・38798253317、確認日 2026-10-15）を整理しました。
「承認の単位」の（Ver.1.3.6 で解消）Fact は複数の主張（claim）からでき、主張ごとに承認できます。下表の「載っている Fact」は、その候補の主張が入っている場所です。

| # | 表示予定の文言・数値（画面の現在の表示） | 適用条件 | 出典URL・確認日 | 再利用条件 | 既存表示との差分 | 推奨／保留と理由 | 載っている Fact |
|---|---|---|---|---|---|---|---|
| U1 | 「6か月以内のコースは、認定機関に受講先があれば訪問者（Standard Visitor）として学習できる」 | 認定機関のコース（英語コース含む）。遠隔学習を除き6か月以内。アカデミー・公立校は対象外。国籍によりビザ/ETAが別途必要 | gov.uk/standard-visitor/visit-to-study ／ 2026-10-15（更新日 2024-10-31） | OGL v3.0（商用可・出典表示） | 差なし。「アカデミー・公立校は対象外」「遠隔学習の例外」は画面に未記載（簡略化） | **推奨**：記載と一致。簡略化は誤りではない | 英国 `visa.official` |
| U2 | 「英語コースが6か月超〜11か月なら短期学習ビザ（Short-term study visa）」 | 16歳以上の英語のみのコース・認定機関。6か月以内=訪問者、11か月超=Student visa。国籍別の渡航認証は別 | gov.uk/visa-to-study-english ／ 2026-10-15（更新日 2025-02-06） | OGL v3.0 | 差なし | **推奨** | 英国 `visa.official` |
| U3 | 「短期学習ビザの申請料は£228（2026-10-15に確認したページの記載）」 | 上記ビザを申請する場合。IHSなど他の費用は別 | 同上 ／ 2026-10-15 | OGL v3.0 | 差なし（確認日つきで表示済み） | **推奨**：金額は変更されるため「確認時点」の表記を維持 | 英国 `visa.notes` |
| U4 | 「それより長いコースは Student visa で、認可を受けた学校（licensed student sponsor）での受講許可が必要（16歳以上）」 | 16歳以上、licensed student sponsor の受講許可、資金・英語力など。申請料£558は同ページにあるが**画面には載せていない** | gov.uk/student-visa ／ 2026-10-15（更新日 2024-10-31） | OGL v3.0 | **本PRで修正**：旧文言の「学位取得も Student visa」はページに直接の記載がなかったため削除し、ページの記載（16歳以上・licensed student sponsor）に合わせた | **推奨**（修正後の文言を承認対象に）。16・17歳は保護者同意が必要（Child Student visa の可能性）で画面は触れていない | 英国 `visa.official` |
| U5 | 「学生は年£776（その他の多くの申請は年£1,035）。6か月以内は英国外から申請なら不要（英国内からは半額）、6か月超〜1年未満は1年分」 | Student visa／短期学習ビザの申請者。18歳未満も£776。申請場所と期間で変わる | gov.uk/healthcare-immigration-application/how-much-pay ／ 2026-10-15（更新日 2024-11-28）。短期学習ビザのページは「usually costs £776」 | OGL v3.0 | Ver.1.3.4 で「申請場所の条件」を補って修正済み（旧文言は条件が不足）。現在は差なし | **推奨**。Planner には自動計上しない（金額は期間・年齢・申請場所で変わる） | Manchester `living.healthcare` |
| U6 | 画面に文言なし。リンク「GOV.UK – Check if you need a UK visa」のみ | すべての申請者の入口（国籍で ETA/ビザの要否が変わる） | gov.uk/check-uk-visa ／ 2026-10-15 | OGL v3.0 | リンクのみ（確認済みの事実として載せていない） | **推奨**：リンクの正しさ（200・見出し一致）を確認済み。承認対象は「リンク先が適切」であること | `data/visa.ts` のリンク |
| C1 | 「6か月以内のプログラムなら一般に就学許可は不要。ただし有効な渡航書類（eTA か訪問者ビザ）は必要。6か月超や学習を続ける可能性があるなら渡航前に study permit を申請するよう IRCC は案内」 | 6か月以内のプログラム。免除の例外は別規定 | ircc.canada.ca/…answer.asp?qnum=484&top=15 ／ 2026-10-15（ページに更新日なし） | Canada.ca: 非商用の複製は許可、**商用は未確認** → 言い換え＋リンクのみ | 差なし | **推奨（条件つき）**：事実は一致。ページに更新日がなく、商用再利用が未確認のため、承認者が「言い換え＋リンクで足りる」と判断すること | カナダ `visa.official` |
| C2 | 「eTAは査証免除国の国籍で航空機で入国する場合に必要（陸路・バス・鉄道・船は不要）」 | 査証免除国の国籍で6か月未満の学習。それ以外は訪問者ビザ等 | ircc.canada.ca/…qnum=1289&top=23 ／ 2026-10-15（更新日なし） | C1と同じ | 差なし | **推奨（条件つき）**：C1と同じ | カナダ `visa.notes` |
| C3 | 画面に金額なし。リンク「IRCC – Study permit」のみ（ページの「Study permit: $CAN 150」は画面に未掲載） | study permit を申請する場合 | canada.ca/…/study-permit.html ／ 2026-10-15（更新日 2026-04-24） | C1と同じ | 金額は載せていない | **推奨**：リンクのみで承認可。金額を載せる場合は別途承認 | `data/visa.ts` のリンク |
| C4 | 「BC州の国際学生ヘルスフィーは月75カナダドル（2026-10-15確認）。有効な就学許可があり年間で少なくとも6か月は州内にいる国際学生が対象。成人はMSPから正式に脱退すれば対象外（未成年は不可）。加入前の待機期間（居住開始月の残り＋2か月）があり、その間の民間保険が案内されている」 | BC州。就学許可＋年6か月以上の滞在。他州は別制度 | www2.gov.bc.ca/…/health-fee-international-students ／ 2026-10-15（ページ公開日 2024-01-08・更新 2026-01-30） | BC州 Copyright: 書面許可なしの複製・再配布不可 → **言い換え＋リンクのみ**（引用はしない） | Ver.1.3.4 で修正済み（旧文言「6か月以上有効な就学許可」は不正確） | **推奨（条件つき）**：修正後の文言をページと照合してから承認。許可を得れば引用も可能になる | Vancouver `living.healthcare` |

集計：**推奨 10件**（うち条件つき 4件：C1・C2・C4 は利用条件、C3 は金額を載せない前提）／保留 0件。U4 の文言は本PRで修正（旧表示に直接の根拠がない記述があったため）。

### 承認するとき（人が行う）
1. 上表の出典URLを開いて、文言・数値が一致することを確認する。
2. 該当 Fact（`data/countries.ts` の `gbrVisa` / `canVisa`、`data/profiles/manchester.ts` と `vancouver.ts` の `living.healthcare`）の `status` を `verified` にし、`note` に承認者・日付・比較した内容を書く。`data/validate.ts` が `sources`・`period`・`checkedAt` の有無を検査する。
3. 保留する項目は何もしない（「未確認」と表示され続ける）。ビザ・保険・医療費は、承認後も Planner に自動計上しない。

## 0. Ver.1.3.4 の再検証結果（10件の分類）

Actions run [38798253317](https://github.com/StarHunting1/study-atlas/actions/runs/38798253317)（2026-10-15、各ページ1回ずつ・再試行なし）で、条件・例外の記載を再確認しました。**どの候補も verified にはしていません。** 「承認推奨」は「ページの記載と一致し、適用条件・例外も記録できた」という意味で、承認するかは人が決めます。

| # | 分類 | 再検証で分かったこと | 承認で見てほしい点 |
|---|---|---|---|
| U1 | **承認推奨** | 6か月以内・認定機関・英語コース含む・アカデミー/公立校は対象外、をページで再確認 | 国籍別のビザ/ETA要否は当サイトで判定しない旨 |
| U2 | **承認推奨** | 6か月超〜11か月、6か月以内=訪問者、11か月超=Student visa、をページで再確認 | 16歳以上の記載は本ページにはなし（Student visa ページに記載） |
| U3 | **承認推奨** | 「It costs £228 for a Short-term study visa」を再確認 | 金額は変更される。確認時点を明記済み |
| U4 | **承認推奨** | 16歳以上・licensed student sponsor を再確認。申請料は£558（英国外から申請）も同ページに記載（当サイトは未掲載） | 16・17歳は保護者の同意が必要（Child Student visa の可能性）。Planner には計上しない |
| U5 | **承認推奨** | 学生£776/年、18歳未満も£776、その他£1,035、6か月以内で英国外から申請=不要（英国内から=半額 £388）、6か月超〜1年未満=1年分、を再確認。短期学習ビザのページは「usually costs £776」 | Manchester の医療欄の文言を、ページ記載どおりに正確化（旧文言は「6か月以内のコースはIHS対象外」だけで、申請場所の条件が抜けていた） |
| U6 | **承認推奨** | 「Depending on your nationality, you may need to get an electronic travel authorisation (ETA)」を確認（入口ページとしての役割） | 判定ツールへのリンクであり、事実の主張ではない |
| C1 | **承認推奨**（利用条件の注記つき） | 「You don't need a study permit if your program or course is less than 6 months」＋「still need a valid travel document (eTA or visitor visa)」を再確認 | ページに更新日なし。Canada.ca の商用再利用は未確認 → 言い換え＋リンクのみ |
| C2 | **承認推奨**（同上） | 「eTA … visa-exempt … by air」「don't need … car, bus, train or boat」を再確認 | 同上 |
| C3 | **承認推奨**（同上） | 「Study permit: $CAN 150」を再確認 | 金額は変更される。同上 |
| C4 | **修正が必要 → 本PRで修正済み（再確認推奨）** | 旧文言「6か月以上有効な就学許可」は不正確。ページは「a valid study permit **for at least six months of the year**」、成人はMSPから正式に脱退すれば対象外（未成年は不可）、待機期間と民間保険の案内あり | 修正後の文言（`data/profiles/vancouver.ts` の医療欄）をページと照合 |
| 確認不能 | 0件 | — | — |

**承認推奨 9件／修正が必要 1件（修正済み）／確認不能 0件。** C1〜C3・C4 は BC州・Canada.ca の利用条件上、文章の転載はせず「事実の言い換え＋リンク」のみです（商用での再利用許可は確認できていません）。

### 1件ずつ承認するための手順
1. 上の表の項目を選び、下の §1・§2 の「根拠」欄のURLを開いて、引用文が現在のページにあることを確認する。
2. 該当する Fact を編集する（U1〜U4・U6 は `data/countries.ts` の `gbrVisa`、U5 は `data/profiles/manchester.ts` の `living.healthcare`、C1〜C3 は `data/countries.ts` の `canVisa`、C4 は `data/profiles/vancouver.ts` の `living.healthcare`）。`status: "verified"`、`sources`・`period`・`checkedAt` を設定し、`note` に「承認者・日付・比較した内容」を書く。`data/validate.ts` が不足を検査します。
3. 承認しない／保留する場合は何もしない（unverified のまま表示され、画面に「未確認」と出ます）。
4. どの項目も **Planner には自動で入りません**（ビザ・保険は利用者の手入力のみ。`tests/releasecheck.test.ts` が検査）。

## 1. 英国

| # | 記述（当サイトの言い換え） | 適用条件 | 適用されない／要確認の条件 | 根拠（ページ記載の要点） | ページ更新日 | 確認日 | 利用条件（ライセンス） |
|---|---|---|---|---|---|---|---|
| U1 | 6か月以内のコースは訪問者（Standard Visitor）として学習できる | 認定を受けた英国の教育機関のコース。英語コースを含む。コースが6か月以内（遠隔学習を除く） | 国籍によってはビザや電子渡航認証（ETA）が別途必要。アカデミー・公立校は対象外。就労は別規定 | `gov.uk/standard-visitor/visit-to-study`: 「You can visit the UK for up to 6 months to: study at an accredited institution (this includes English language courses…)」 | 2024-10-31 | 2026-10-15 | GOV.UK: Open Government Licence v3.0（商用利用可・出典表示が条件。事実の言い換え＋出典リンクで利用） |
| U2 | 英語コースが6か月超〜11か月なら短期学習ビザ（Short-term study visa） | 16歳以上。英語のみのコース、認定機関。コース期間が6か月超11か月以内 | 6か月以内→訪問者、11か月超→Student visa（同ページ）。18歳未満は別の手配・同意が必要。国籍による渡航認証は別 | `gov.uk/visa-to-study-english`: 「your course must last longer than 6 months but not more than 11 months」「6 months or shorter - … Visitor visa」「longer than 11 months - … Student visa」 | 2025-02-06 | 2026-10-15 | OGL v3.0 |
| U3 | 短期学習ビザの申請料は£228（確認時点） | 上記ビザを申請する場合 | 料金は変更される。ビザ以外の費用（IHS等）は別 | 同ページ「It costs £228 for a Short-term study visa」 | 2025-02-06 | 2026-10-15 | OGL v3.0 |
| U4 | Student visa は、認可を受けた学校（licensed student sponsor）から受講許可を得た16歳以上が対象 | 学位課程や11か月を超えるコースなど | 国籍・年齢・資金要件・申請場所で条件が異なる | `gov.uk/student-visa`:「have been offered a place on a course by a licensed student sponsor」 | 2024-10-31 | 2026-10-15 | OGL v3.0 |
| U5 | 医療付加金（IHS）は学生年£776、その他の申請は年£1,035。英国外から申請する6か月以内は不要。6か月超〜1年未満は1年分 | 英国外から申請する学生（Student visa / 短期学習ビザ 等）。**金額は申請ごとの滞在期間で変わる** | 6か月以内を英国外から申請する場合は不要。英国内から申請する場合は半額（£388 など）。18歳未満の扱いは別の年額。免除・還付制度は別規定 | `gov.uk/healthcare-immigration-application/how-much-pay`: 「£776 per year for students, their dependants, and those on a Youth Mobility Scheme visa」「6 months or less: You do not need to pay the surcharge if you’re applying from outside the UK for 6 months or less」 | 2024-11-28 | 2026-10-15 | OGL v3.0 |
| U6 | ビザが必要かの確認は GOV.UK の「Check if you need a UK visa」で | すべての申請者の入口 | — | `gov.uk/check-uk-visa`（ページ到達と見出しを確認） | 2021-06-16 | 2026-10-15 | OGL v3.0 |

## 2. カナダ（ブリティッシュコロンビア州）

| # | 記述 | 適用条件 | 適用されない／要確認の条件 | 根拠 | ページ更新日 | 確認日 | 利用条件 |
|---|---|---|---|---|---|---|---|
| C1 | 6か月以内のプログラムは就学許可（study permit）が一般に不要。ただし有効な渡航書類（eTAまたは訪問者ビザ）は必要 | 6か月以内のプログラム・コース | 6か月を超える／学習を続ける可能性がある場合は、渡航前の申請を IRCC は案内。学習許可免除の例外は別規定 | `ircc.canada.ca/…answer.asp?qnum=484`: 「You don't need a study permit if your program or course is les[s than 6 months]」「You still need a valid travel document (electronic travel authorization or visitor visa)」 | ページに日付表示なし | 2026-10-15 | Canada.ca の Terms and conditions（2026-10-15 に本文を確認）：「Unless otherwise specified you may reproduce the materials … for non-commercial purposes … without charge or further permission」。**商用での再利用は同ページで許可を確認できていない**ため、事実の言い換え＋リンクのみ（本文・表の転載なし） |
| C2 | eTA は、査証免除国の国籍で航空機で入国する場合に必要（陸路・バス・鉄道・船は不要） | 査証免除国の国籍で、6か月未満の学習のため入国する場合 | 国籍が査証免除国でなければ訪問者ビザなど別の書類 | `…answer.asp?qnum=1289`: 「You need to apply for an eTA if you are from a visa-exempt country and plan to travel to Canada by air. You don't need an eTA if you plan to travel by car, bus, train or boat」 | ページに日付表示なし | 2026-10-15 | 同上（Canada.ca の条件。商用再利用は未確認 → 言い換え＋リンクのみ） |
| C3 | 就学許可の手続き・料金の入口 | study permit を申請する場合 | 申請料等は変更される | `canada.ca/…/study-permit.html`（「Study permit: $CAN 150」の表示をページで確認） | 2026-04-24 | 2026-10-15 | 同上（Canada.ca の条件。商用再利用は未確認 → 言い換え＋リンクのみ） |
| C4 | BC州の国際学生ヘルスフィーは月$75。有効な就学許可（6か月以上）で州に居住する国際学生が対象。加入前に待機期間（居住開始月の残り＋2か月）があり、民間保険が必要 | BC州で6か月以上の就学許可を持ち、MSP に加入する学生 | 6か月未満の滞在・訪問者としての滞在が対象になるかは公式ページで確認（当サイトは断定しない）。他州は別制度 | `www2.gov.bc.ca/…/health-fee-international-students`: 「a mandatory monthly fee of $75 charged to all international students studying in British Columbia on a valid study permit」「Before health-care coverage begins, there is a wait period consisting of the balance of the month in which residency is established, plus two months」「International students should carry private insurance until this wait period ends」 | 2026-01-30 | 2026-10-15 | BC州「Copyright」ページ（2026-10-15 に本文を確認）：「This material is owned by the Government of British Columbia and protected by copyright law. It may not be reproduced or redistributed without the prior written permission of the Province of British Columbia.」→ **文章の転載・再配布は書面許可が必要**。当サイトは事実（金額・期間）を自分の言葉で言い換えてリンクするのみ。許可を得る場合は同ページの Copyright Permission Request Form |

## 3. 区別すべき点（表示・Planner での扱い）

| 区別 | 現在の扱い |
|---|---|
| ビザの種類（訪問者／短期学習ビザ／Student visa／study permit／eTA） | コースの種類・期間で変わる旨を概要に記載。**どれが当てはまるかは判定しない** |
| 国籍 | 「国籍によって異なる」と明記し、公式の確認ページ（Check if you need a UK visa、IRCC）へ誘導 |
| 滞在期間 | 6か月／11か月の境界を記載（上表）。期間の入力から区分を自動判定しない |
| 学校・コースの種類 | 認定機関・英語のみのコース等の条件を記載 |
| 医療保険の加入要件 | 英国=IHS（申請時に前払い、期間で金額が変わる）、BC州=ヘルスフィー＋待機期間中の民間保険。いずれも**一律には適用しない** |
| 料金が実際に適用される条件 | 上表の「適用条件」欄。金額は「確認時点」と明記し、公式ページで最新額を確認する旨を併記 |
| Planner | ビザ・保険は利用者の手入力のみ。IHS・ヘルスフィー・ビザ料金の自動計上なし |

## 4. 承認の手順（人が行うこと）

1. 上表の「根拠」欄のページを開き、記載が一致することを確認する。
2. 利用条件が未確認の出典（canada.ca / BC州）は、言い換え＋リンクのみで足りるか、またはより広い利用が許可されているかを判断する。
3. 承認する場合は、`data/countries.ts`（ビザ概要）・`data/profiles/*.ts`（医療）の該当 Fact の `status` を `verified` にし、承認者・日付・比較内容を `note` に記録する。承認しない場合は unverified のまま。

## 5. 学校情報の確認結果（承認候補：学校名・所在地・サイト・コース・滞在手配）

学校は `unverified` のまま表示（verified にはしていません）。表示の可否は「公式サイトが稼働し、かつ第二の情報源（認定団体・ディレクトリ）で所在地等が一致する」ことを基準にしました。

| 学校 | 都市 | 公式サイト | 第二の情報源 | 一致した内容 | 判定 |
|---|---|---|---|---|---|
| Express English College | Manchester（Hulme, M16 7BY） | 連絡先ページに 130 Princess Road, M16 7BY。学生寮・ホームステイ・一般英語（週20/30コマ）の案内あり | English UK 会員ページ（2026年表示）の住所・サイトURLが一致 | 住所、サイトURL、一般英語、滞在手配（寮・ホームステイ）。British Council 認定は今回再確認できず | 表示（unverified） |
| IH Manchester | Manchester（M1 3FH） | 住所・一般英語/IELTS/ビジネス英語・ホームステイ/学生寮/スタジオの案内・料金ページ・British Council認定の記載 | English UK 会員ページ（id 878）の住所・サイトが一致、ホームステイ・寮に印 | 同左 | 表示（unverified）。料金は公式ページへのリンクのみ |
| Kaplan International Manchester | Manchester（M1 3BE） | 住所、一般英語等（16歳以上）、British Council認定・English UK会員の記載、滞在先の案内 | English UK 会員ページ（id 897）の住所・サイトが一致、ホームステイ・寮に印 | 同左 | 表示（unverified）。料金案内ページは見つからず |
| International House Vancouver | **New Westminster**（103 – 960 Quayside Drive） | 新キャンパスの告知（2025-02-03 から全授業）、一般英語等、滞在先・料金ページ | Languages Canada 掲載ページ：一般英語等・滞在先「Homestay, Off-campus (residence)」 | 所在地（New Westminster）、コース、滞在先 | 表示（unverified）。バンクーバー市内ではない旨を維持 |
| EF Vancouver | Vancouver（200 – 750 Cambie St） | 住所、一般英語（毎週月曜開始）、ホームステイ、Languages Canada認定の記載 | Languages Canada 掲載ページ：住所、滞在先「Homestay, Off-campus (residence)」 | 住所、コース、滞在先、認定 | 表示（unverified） |
| EC Manchester | Manchester | 稼働中。住所 85 Piccadilly M1 2DA | English UK の個別ページは 404。古い掲載は別の通り | 第二の情報源で確認できない | **非表示**（データ保持） |
| Sprachcaffe Vancouver | Vancouver | 稼働中（ホストファミリー、18歳以上） | Languages Canada の検索に該当なし。学校ページに認定の記載なし | 認定・営業状況を第二の情報源で確認できない | **非表示**（データ保持） |
| MC Academy / Excel College (UKEC Academy) | Manchester | 公式サイト・営業状況を確認できない（PR #36） | — | — | 非表示（データ保持） |

British Council の認定センター一覧ページは自動アクセスを拒否（403）するため、認定状況の最終確認は人が行う必要があります。再試行は行っていません。

## 6. 語学学校の料金情報（Ver.1.3.4）— 金額は取り込んでいません

調査の結論：**5校とも、公式サイトに料金の再利用を認める記載がなく**（Actions run 38798253317 で各校のフッター・規約を1回ずつ確認、`data/official/RIGHTS.md` の `language-school-fees`）、料金は週のレッスン数・期間・時期・含まれる費用で変わるため、金額・料金表は一切記録せず、公式料金ページへのリンクと「揃えるべき条件」の一覧だけを提供します。検索結果などで見かけた金額も使っていません。

| 学校 | 公式の料金案内（リンクのみ） | 再利用条件の確認結果（2026-10-15） | 授業料・週の授業時間・最低期間・登録料・教材費・滞在費 |
|---|---|---|---|
| Express English College (Manchester) | `expressenglishcollege.co.uk/courses/general-english/`（コースページ） | サイト・規約に著作権/再利用の記載なし → 不明として扱う | 未取得（料金ページで確認） |
| IH Manchester | `ihmanchester.com/prices-and-special-offers/` | 「© Copyright 2026 IH Manchester. All Rights Reserved.」 | 未取得 |
| Kaplan International Manchester | `kaplaninternational.com/faq/prices-and-payment`（価格表の入手方法の案内） | 「Without our prior written permission, you may not copy … any material on this website」 | 未取得 |
| International House Vancouver | `ihvancouver.com/ihv-price-list/` | サイトが自動アクセスにボット確認（403）を返したため規約は未読・再試行なし | 未取得 |
| EF Vancouver | `ef.com/ca/ilsd/schools/vancouver/`（見積依頼のあるページ） | 「© Signum International AG 2026. All rights reserved.」 | 未取得 |

人が許可を得る／法務確認をする場合は、`language-school-fees`（`expertReview: true`）を更新したうえで、学校ごとに「対象年度・通貨・週あたりのレッスン数・期間区分・含まれる費用」を添えて取り込む必要があります。取り込むまでは Planner の授業料は利用者の手入力のみで、主要費用が未入力の間は「暫定」と表示されます。
