# 承認用の記録（人間の承認が必要な候補）— Ver.1.3.3

**状態はすべて「承認待ち（unverified のまま）」です。** GitHub Actions のページ確認だけを理由に verified へ変更していません。承認する場合は、承認者・日付・比較した内容を記録した上で、該当する事実の `status` を `verified`、`sources` / `period` / `checkedAt` を満たす形で更新してください（`data/validate.ts` が検査します）。

確認方法: GitHub Actions（run [38787463398](https://github.com/StarHunting1/study-atlas/actions/runs/38787463398)・[38791190742](https://github.com/StarHunting1/study-atlas/actions/runs/38791190742)・[この PR の最新 run]）。各ページを1回だけ取得し、記載の語・金額をページ本文と照合（再試行なし、robots.txt 遵守）。ページの更新日は GOV.UK の Content API（`public_updated_at`）、canada.ca / BC の `dcterms.modified` による。

**Planner への自動計上は行いません。** ビザ・保険・医療関連費用は、どの区分に当てはまるかが国籍・コース・年齢・申請場所で変わるため、利用者が入力した値だけを計上します（`tests/releasecheck.test.ts` が、Manchester / Vancouver のどのプラン条件でも `visa` / `insurance` が自動で選ばれないことを検査）。

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
