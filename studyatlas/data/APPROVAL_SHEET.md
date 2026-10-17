# 承認シート（Ver.1.3.6／1.3.9 チェックリスト追加）— 政府情報の主張ごとの承認と Vancouver 気候データ

_`npm run approvals` が `data/approvalSheet.ts` と各データから生成します。手で編集しないでください。_

**承認の状況（Ver.1.4.0）**: 人が明示的に承認した英国の5件（U1・U2・U3・U5b・U6）だけが `verified`（承認記録は `data/approvals.ts`、承認者 StarHunting1、2026-10-17）。それ以外の主張は `unverified` のままで（Vancouver の 1991–2020 気候データは Ver.1.4.3 で承認・反映済み。§5）、画面にも「未確認」と表示されます。自動のページ確認（GitHub Actions）だけで `verified` にすることはありません。`verified` にできるのは、人が承認の記録（承認者・日付・比較した内容）を `data/approvals.ts` に書いた主張だけです（`approve()` と `data/validate.ts` が検査し、承認後に文言・条件・出典を変えるとビルドが失敗します）。

| 承認済み（verified） | 承認者・日付 | 承認の根拠 |
|---|---|---|
| U1 | StarHunting1・2026-10-17 | 2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/standard-visitor/visit-to-study |
| U2 | StarHunting1・2026-10-17 | 2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/visa-to-study-english |
| U6 | StarHunting1・2026-10-17 | 2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/check-uk-visa |
| U3 | StarHunting1・2026-10-17 | 2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/visa-to-study-english |
| U5b | StarHunting1・2026-10-17 | 2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/healthcare-immigration-application/how-much-pay |

## 1. 承認の単位と手順

- 画面の1つの項目（Fact）は、複数の主張（claim）からできています。**主張ごと**に `status` と承認記録を持つので、1件ずつ承認できます。Fact 全体は「全ての主張が verified」のときだけ verified になり、一部だけ承認した場合は、画面で主張ごとに確認状況が表示されます。
- 承認する手順: ①根拠のURLを開いて文言・数値が一致することを確認 → ②下の「編集する場所」の該当 claim で `status: "verified"` にし、`approval: { by: "氏名", at: "YYYY-MM-DD", compared: "何と何を比べたか" }`、`period`、`checkedAt` を設定 → ③`npm test` と `npm run approvals`。
- 保留の主張は承認できません（`hold` のまま verified にするとビルドが失敗します）。文言を直すか、リンクのみにしてください。
- ビザ・医療費は、承認後も Planner に自動計上しません（`tests/releasecheck.test.ts`）。

## 2. 候補（U1〜U6、C1〜C4）と主張の対応

| 候補 | 主張 | 推奨 | 状態 |
|---|---|---|---|
| U1 | U1 | U1: 推奨 | U1: verified |
| U2 | U2 | U2: 推奨 | U2: verified |
| U3 | U3 | U3: 推奨 | U3: verified |
| U4 | U4 | U4: 条件つき推奨 | U4: unverified |
| U5 | U5a, U5b | U5a: 条件つき推奨 / U5b: 推奨 | U5a: unverified, U5b: verified |
| U6 | U6 | U6: 推奨 | U6: verified |
| C1 | C1 | C1: 条件つき推奨 | C1: unverified |
| C2 | C2 | C2: 条件つき推奨 | C2: unverified |
| C3 | C3 | C3: 条件つき推奨 | C3: unverified |
| C4 | C4-ref, C4a, C4b, C4c | C4-ref: 保留 / C4a: 条件つき推奨 / C4b: 条件つき推奨 / C4c: 条件つき推奨 | C4-ref: unverified, C4a: unverified, C4b: unverified, C4c: unverified |

集計: 主張 14 件（推奨 5／条件つき推奨 8／保留 1）。verified は 5 件。

## 3. 保留すべき情報

- **C4-ref**（候補 C4）: 保留：出典のページにある記述ではなく、StudyAtlas 自身の案内文。C4a〜C4c を承認する方が適切で、この文はリンクのみに書き換え可能。
- **U5-visa（承認候補から除外）**: U5a・U5b と内容が重複する（同じ料金ページを根拠に、IHS の前払いと6か月以内の免除だけを言い直した文）ため、Ver.1.3.10 で claim から外した。U5 は U5a・U5b で承認する。国ページには医療情報への案内リンクのみを置く場合も、承認対象の claim にはしない。
- **U4・U5a（文言を修正、条件つき）**: Ver.1.3.10 で、U4 は「長いコース＝Student visa」と読めない形に、U5a は「IHSを支払えばNHSを利用できる」と断定しない形に直した。修正後の文言は、承認者が出典ページと照合してから承認する。
- **U5（旧文言）の「訪問者の滞在にはIHSがなく保険が必要」**: 読んだページにない推論のため画面から削除済み（承認対象にしていない）。
- **C3 の旧文言「渡航前に申請」「学習を続ける可能性がある場合」**: 逐語の記載が確認できず、確認できた記載に置き換え済み。
- **Canada.ca の商用再利用（C1・C2・C3）と BC州の転載（C4a〜c）**: 利用条件が未確認／書面許可が必要なため、承認する場合も「言い換え＋リンクのみ」で足りるという判断が必要。許可を得ない限り引用・転載はしない。

## 3b. 承認の判断サマリー（人が決めること）

| 主張 | 判断 | 対象（国籍／滞在期間／ビザ区分） | 承認前に人が決めること |
|---|---|---|---|
| U1 | 推奨 | 国籍を問わず（国籍によりビザ/ETAが別途必要）／6か月以内のコース／訪問者（Standard Visitor） | 例外を文言に入れなくてよいか（簡略化であり誤りではないと判断）。OGL v3.0 の範囲で再利用可（出典表示）。追加の判断は不要。 |
| U2 | 推奨 | 国籍を問わず（国籍別の渡航認証は別）／英語コースで6か月超〜11か月／短期学習ビザ（Short-term study visa） | 18歳未満は別扱いである点を文言に入れなくてよいか。OGL v3.0 の範囲で再利用可（出典表示）。追加の判断は不要。 |
| U4 | 条件つき推奨 | 国籍を問わず（16歳以上）／長期の学習（コースの期間だけでは決まらない）／Student visa | 修正後の文言を gov.uk/student-visa と照合。短いコースは U1・U2 の区分になる場合があると読めるか。OGL v3.0 の範囲で再利用可（出典表示）。 |
| U6 | 推奨 | すべての申請者（国籍で要否が異なる）／—（渡航前の確認）／ビザ／電子渡航認証（ETA） | OGL v3.0 の範囲で再利用可（出典表示）。追加の判断は不要。 |
| U3 | 推奨 | 短期学習ビザの申請者／6か月超〜11か月の英語コース／短期学習ビザ | 金額は変わりうる。確認日つきで掲載することでよいか（承認後も陳腐化するので、再確認の期限を決める）。OGL v3.0 の範囲で再利用可（出典表示）。追加の判断は不要。 |
| U5a | 条件つき推奨 | Student visa／短期学習ビザの申請者／ビザの期間による（年額）／Student visa／短期学習ビザ | 修正後の文言を料金ページと照合。金額は変わる。Planner には自動計上しない（承認後も同じ）。OGL v3.0 の範囲で再利用可（出典表示）。 |
| U5b | 推奨 | ビザ申請者（英国外／英国内で異なる）／6か月以内／6か月超〜1年未満／Student visa／短期学習ビザ | 同伴者・免除の規定に触れなくてよいか。OGL v3.0 の範囲で再利用可（出典表示）。追加の判断は不要。 |
| C1 | 条件つき推奨 | 国籍により eTA または訪問者ビザ（C2 参照）／6か月以内のプログラム／就学許可（study permit）不要／eTA・訪問者ビザ | Canada.ca の商用再利用が未確認。「言い換え＋リンク」で足りると判断して承認するか、書面で確認するか、リンクのみにするか。 |
| C3 | 条件つき推奨 | 国籍を問わず／6か月を超えるプログラム／就学許可（study permit） | C1 と同じ（Canada.ca の再利用条件）。 |
| C2 | 条件つき推奨 | 査証免除国の国籍（それ以外は訪問者ビザなど）／6か月未満の学習／eTA（航空機で入国する場合） | C1 と同じ（Canada.ca の再利用条件）。 |
| C4-ref | 保留 | —／—／— | 保留。承認せず、C4a〜C4c を承認するか、この文をリンクのみに書き換える。 |
| C4a | 条件つき推奨 | 有効な就学許可を持つ国際学生（BC州）／年間で少なくとも6か月は州内に滞在／就学許可（study permit） | BC州の著作権は書面許可なしの複製・再配布を禁止。「事実の言い換え＋リンク」で足りるか、BC州に書面で確認するか。医療費は Planner に自動計上しない。 |
| C4b | 条件つき推奨 | 成人の国際学生（未成年は脱退不可）／MSP 加入期間／就学許可（study permit） | C4a と同じ（BC州の再利用条件）。脱退すると州の医療保険が使えない点を画面で伝えているか。 |
| C4c | 条件つき推奨 | MSP に加入する学生／居住開始月の残り＋2か月の待機／就学許可（study permit） | C4a と同じ（BC州の再利用条件）。 |

### 再利用条件が未確認の出典（確認先）

| 出典 | 対象の主張 | 確認する公式ページ | 確認したいこと |
|---|---|---|---|
| Canada.ca（IRCC） | C1・C2・C3 | [Government of Canada – Terms and conditions](https://www.canada.ca/en/transparency/terms.html) | 短い事実を自分の言葉に言い換え、出典リンクを付けて商用サイトに載せてよいか（引用・転載はしない前提）。 |
| Province of British Columbia | C4a・C4b・C4c（C4-ref は保留） | [Province of BC – Copyright](https://www2.gov.bc.ca/gov/content/home/copyright)<br>[Province of BC – Disclaimer](https://www2.gov.bc.ca/gov/content/home/disclaimer) | 料金・対象条件などの事実の言い換え＋出典リンクが、書面許可なしの複製・再配布に当たらないか。当たる場合は許可の申請先。 |

※ 上のページは、この資料を作った環境からは開いていません（承認者が直接確認してください）。確認が取れるまで、Canada.ca と BC州の主張は「言い換え＋リンクのみ」の扱いで、引用・転載はしません。

### Fact ごとの表示（一部だけ承認したとき）

| 画面の項目（Fact） | 含まれる主張 | 一部だけ承認したとき |
|---|---|---|
| United Kingdom · visa.official | U1, U2, U4, U6 | 承認した主張だけが「確認済み」、残りは「未確認」。Fact 全体は全主張が承認されるまで「未確認」 |
| United Kingdom · visa.notes | U3 | 承認した主張だけが「確認済み」、残りは「未確認」。Fact 全体は全主張が承認されるまで「未確認」 |
| Manchester · living.healthcare | U5a, U5b | 承認した主張だけが「確認済み」、残りは「未確認」。Fact 全体は全主張が承認されるまで「未確認」 |
| Canada · visa.official | C1, C3 | 承認した主張だけが「確認済み」、残りは「未確認」。Fact 全体は全主張が承認されるまで「未確認」 |
| Canada · visa.notes | C2, C4-ref | 承認した主張だけが「確認済み」、残りは「未確認」。Fact 全体は全主張が承認されるまで「未確認」 |
| Vancouver · living.healthcare | C4a, C4b, C4c | 承認した主張だけが「確認済み」、残りは「未確認」。Fact 全体は全主張が承認されるまで「未確認」 |

## 4. 主張ごとの承認シート

### U1（候補 U1）— 推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | 英国での学習の入国区分は、主にコースの期間と種類で決まります。6か月以内のコースは、認定機関に受講先があれば訪問者（Standard Visitor）として学習できます。 |
| 公開予定の文言（English） | Entry routes for study in the UK depend mainly on the length and type of course. A course of up to 6 months can be studied as a Standard Visitor, with a place at an accredited institution. |
| 公式出典 | [GOV.UK (Home Office)](https://www.gov.uk/standard-visitor/visit-to-study) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | 認定を受けた英国の教育機関（英語コース含む）。コースが6か月以内（遠隔学習を除く）。アカデミー・公立校は対象外。国籍によりビザ/ETAが別途必要な場合あり。 |
| 利用条件（商用再利用） | Open Government Licence v3.0 – Contains public sector information licensed under the Open Government Licence v3.0 |
| 推奨と理由 | **推奨**：gov.uk/standard-visitor/visit-to-study（2026-10-15確認、ページ更新 2024-10-31）と一致。例外は文言に含めていない（簡略化であり誤りではない）。 |
| 画面上の表示場所 | Country page → Visa → Official information（United Kingdom · visa.official） |
| 現在の状態 | verified（承認: StarHunting1、2026-10-17、2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/standard-visitor/visit-to-study） |
| 対象（国籍） | 国籍を問わず（国籍によりビザ/ETAが別途必要） |
| 対象（滞在期間・コース） | 6か月以内のコース |
| 対象（ビザ区分） | 訪問者（Standard Visitor） |
| 既存表示との違い | Ver.1.3.4 で簡略化。例外（アカデミー・公立校・遠隔学習）は文言に入れていない |
| 承認前に人が決めること | 例外を文言に入れなくてよいか（簡略化であり誤りではないと判断）。OGL v3.0 の範囲で再利用可（出典表示）。追加の判断は不要。 |
| 編集する場所 | `data/countries.ts` の `GBR_VISA_CLAIMS`（claim `U1`） |

**承認チェックリスト（U1）** — ✅ **承認済み**（StarHunting1、2026-10-17。記録: `data/approvals.ts`）。以下は承認時の確認項目

- [x] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [x] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [x] 再利用条件を判断した（OGL v3.0：出典表示で可）
- [x] 金額・日付がある場合、確認日が文言に併記されている
- [x] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [x] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### U2（候補 U2）— 推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | 英語コースが6か月超〜11か月なら短期学習ビザ（Short-term study visa）になります。 |
| 公開予定の文言（English） | An English-language course of more than 6 and up to 11 months falls under the Short-term study visa. |
| 公式出典 | [GOV.UK (Home Office)](https://www.gov.uk/visa-to-study-english) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | 認定機関の英語コースで、6か月超11か月以内（6か月以内=訪問者、11か月超=Student visa）。18歳未満は別の扱い。国籍別の渡航認証は別。 |
| 利用条件（商用再利用） | Open Government Licence v3.0 – Contains public sector information licensed under the Open Government Licence v3.0 |
| 推奨と理由 | **推奨**：gov.uk/visa-to-study-english（ページ更新 2025-02-06）と一致。 |
| 画面上の表示場所 | Country page → Visa → Official information（United Kingdom · visa.official） |
| 現在の状態 | verified（承認: StarHunting1、2026-10-17、2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/visa-to-study-english） |
| 対象（国籍） | 国籍を問わず（国籍別の渡航認証は別） |
| 対象（滞在期間・コース） | 英語コースで6か月超〜11か月 |
| 対象（ビザ区分） | 短期学習ビザ（Short-term study visa） |
| 既存表示との違い | 変更なし |
| 承認前に人が決めること | 18歳未満は別扱いである点を文言に入れなくてよいか。OGL v3.0 の範囲で再利用可（出典表示）。追加の判断は不要。 |
| 編集する場所 | `data/countries.ts` の `GBR_VISA_CLAIMS`（claim `U2`） |

**承認チェックリスト（U2）** — ✅ **承認済み**（StarHunting1、2026-10-17。記録: `data/approvals.ts`）。以下は承認時の確認項目

- [x] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [x] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [x] 再利用条件を判断した（OGL v3.0：出典表示で可）
- [x] 金額・日付がある場合、確認日が文言に併記されている
- [x] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [x] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### U4（候補 U4）— 条件つき推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | Student visa は、英国で長めに学ぶときの区分ですが、コースの期間だけで決まるわけではありません。16歳以上で、認可を受けた学校（licensed student sponsor）から受講許可を得ていること、十分な資金と必要な水準の英語力を示せることが条件です（16・17歳は保護者の同意も必要）。どの区分になるかは年齢・国籍・学習の計画によっても変わるため、公式ページで確認してください。 |
| 公開予定の文言（English） | A Student visa is the route for longer study in the UK, but the length of the course alone does not decide it. You need to be 16 or over, to have been offered a place on a course by a licensed student sponsor (a school the Home Office has licensed), and to show you have enough money and the required level of English (16- and 17-year-olds also need a parent's consent). Which route applies to you also depends on your age, nationality and plans, so check the official page. |
| 公式出典 | [GOV.UK (Home Office)](https://www.gov.uk/student-visa) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | 16歳以上、licensed student sponsor の受講許可、資金・英語力。16・17歳は保護者の同意が必要（Child Student visa の可能性）。短いコースは短期学習ビザや訪問者の区分になる場合がある。年齢・国籍・計画も関わる。ページの申請料£558は画面に載せていない。 |
| 利用条件（商用再利用） | Open Government Licence v3.0 – Contains public sector information licensed under the Open Government Licence v3.0 |
| 推奨と理由 | **条件つき推奨**：依頼により文言を修正（Ver.1.3.10）：旧文言は「長いコース＝Student visa」と読める恐れがあった。修正後の文言は、承認者が gov.uk/student-visa（ページ更新 2024-10-31）と照合してから承認する。 |
| 画面上の表示場所 | Country page → Visa → Official information（United Kingdom · visa.official） |
| 現在の状態 | unverified（承認記録なし） |
| 対象（国籍） | 国籍を問わず（16歳以上） |
| 対象（滞在期間・コース） | 長期の学習（コースの期間だけでは決まらない） |
| 対象（ビザ区分） | Student visa |
| 既存表示との違い | Ver.1.3.10 で文言を修正：「長いコース＝Student visa」と読める表現をやめ、licensed student sponsor・資金・英語力・年齢（16歳以上、16・17歳は保護者の同意）を明記。旧「学位取得も」は削除済み。申請料£558は画面に載せていない |
| 承認前に人が決めること | 修正後の文言を gov.uk/student-visa と照合。短いコースは U1・U2 の区分になる場合があると読めるか。OGL v3.0 の範囲で再利用可（出典表示）。 |
| 編集する場所 | `data/countries.ts` の `GBR_VISA_CLAIMS`（claim `U4`） |

**承認チェックリスト（U4）** — 承認者が1件ずつ印を付けます。**全部に印が付くまで `verified` にしません。**

- [ ] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [ ] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [ ] 再利用条件を判断した（OGL v3.0：出典表示で可）
- [ ] 金額・日付がある場合、確認日が文言に併記されている
- [ ] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [ ] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### U6（候補 U6）— 推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | 渡航前にビザや電子渡航認証が必要かどうかは国籍によって異なります。 |
| 公開予定の文言（English） | Whether you need a visa or an electronic travel authorisation before travelling depends on your nationality. |
| 公式出典 | [GOV.UK (Home Office)](https://www.gov.uk/check-uk-visa) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | すべての申請者が対象。入口は GOV.UK の「Check if you need a UK visa」。 |
| 利用条件（商用再利用） | Open Government Licence v3.0 – Contains public sector information licensed under the Open Government Licence v3.0 |
| 推奨と理由 | **推奨**：ページに「Depending on your nationality, you may need to get an electronic travel authorisation (ETA)」「You may need a visa」とある（ページ日付 2021-06-16）。 |
| 画面上の表示場所 | Country page → Visa → Official information（United Kingdom · visa.official） |
| 現在の状態 | verified（承認: StarHunting1、2026-10-17、2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/check-uk-visa） |
| 対象（国籍） | すべての申請者（国籍で要否が異なる） |
| 対象（滞在期間・コース） | —（渡航前の確認） |
| 対象（ビザ区分） | ビザ／電子渡航認証（ETA） |
| 既存表示との違い | 変更なし |
| 承認前に人が決めること | OGL v3.0 の範囲で再利用可（出典表示）。追加の判断は不要。 |
| 編集する場所 | `data/countries.ts` の `GBR_VISA_CLAIMS`（claim `U6`） |

**承認チェックリスト（U6）** — ✅ **承認済み**（StarHunting1、2026-10-17。記録: `data/approvals.ts`）。以下は承認時の確認項目

- [x] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [x] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [x] 再利用条件を判断した（OGL v3.0：出典表示で可）
- [x] 金額・日付がある場合、確認日が文言に併記されている
- [x] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [x] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### U3（候補 U3）— 推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | GOV.UKでは短期学習ビザの申請料を£228と記載しています（2026-10-15に確認したページの記載）。金額は変更されるため、公式ページで最新額を確認してください。 |
| 公開予定の文言（English） | GOV.UK lists the Short-term study visa fee as £228 (page read on 2026-10-15). Fees change – check the current amount on the official page. |
| 公式出典 | [GOV.UK (Home Office)](https://www.gov.uk/visa-to-study-english) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | 短期学習ビザを申請する場合のみ。医療付加金などは別。 |
| 利用条件（商用再利用） | Open Government Licence v3.0 – Contains public sector information licensed under the Open Government Licence v3.0 |
| 推奨と理由 | **推奨**：「It costs £228 for a Short-term study visa」と一致（ページ更新 2025-02-06）。金額は変わりうるため確認日を併記。 |
| 画面上の表示場所 | Country page → Visa → Points to note（United Kingdom · visa.notes） |
| 現在の状態 | verified（承認: StarHunting1、2026-10-17、2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/visa-to-study-english） |
| 対象（国籍） | 短期学習ビザの申請者 |
| 対象（滞在期間・コース） | 6か月超〜11か月の英語コース |
| 対象（ビザ区分） | 短期学習ビザ |
| 既存表示との違い | 金額に確認日（2026-10-15）を併記済み |
| 承認前に人が決めること | 金額は変わりうる。確認日つきで掲載することでよいか（承認後も陳腐化するので、再確認の期限を決める）。OGL v3.0 の範囲で再利用可（出典表示）。追加の判断は不要。 |
| 編集する場所 | `data/countries.ts` の `GBR_NOTES_CLAIMS`（claim `U3`） |

**承認チェックリスト（U3）** — ✅ **承認済み**（StarHunting1、2026-10-17。記録: `data/approvals.ts`）。以下は承認時の確認項目

- [x] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [x] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [x] 再利用条件を判断した（OGL v3.0：出典表示で可）
- [x] 金額・日付がある場合、確認日が文言に併記されている
- [x] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [x] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### U5a（候補 U5）— 条件つき推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | Student visa や短期学習ビザでは、通常、ビザ申請時に医療付加金（IHS）を支払います。支払うとNHSの医療を利用できる場合がありますが、支払いが必要かどうか、どの範囲でNHSを利用できるかは、申請するビザの種類・期間・申請場所・個々の事情によって異なります（次の記述も参照）。公式ページで確認してください。2026-10-15に確認したページでは学生料金は年£776（その他の多くの申請は年£1,035）です。 |
| 公開予定の文言（English） | For a Student visa or a Short-term study visa the Immigration Health Surcharge (IHS) is usually paid with the visa application. Paying it can give you access to NHS care, but whether you must pay, and what NHS access you get, depends on the visa you apply for, its length, where you apply from and your circumstances (see the next statement) – check the official page. On the page read on 2026-10-15 the student rate is £776 per year (£1,035 per year for most other applications). |
| 公式出典 | [GOV.UK (Home Office)](https://www.gov.uk/healthcare-immigration-application/how-much-pay)<br>[GOV.UK (Home Office)](https://www.gov.uk/visa-to-study-english) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | Student visa／短期学習ビザの申請者。IHSの要否とNHSの利用範囲は、ビザの種類・期間・申請場所・個々の事情で変わる（免除・同伴者は別規定）。18歳未満も年£776、その他は年£1,035。Plannerには自動計上しない。 |
| 利用条件（商用再利用） | Open Government Licence v3.0 – Contains public sector information licensed under the Open Government Licence v3.0 |
| 推奨と理由 | **条件つき推奨**：依頼により文言を修正（Ver.1.3.10）：旧文言は「IHSを支払えばNHSを利用できる」と無条件に読める恐れがあった。年£776／£1,035は維持（ページ更新 2024-11-28、短期学習ビザのページ「usually costs £776」）。修正後の文言は承認者がページと照合してから承認する。料金は変わるので日付を維持。 |
| 画面上の表示場所 | Manchester city page → Daily life → Healthcare（Manchester · living.healthcare） |
| 現在の状態 | unverified（承認記録なし） |
| 対象（国籍） | Student visa／短期学習ビザの申請者 |
| 対象（滞在期間・コース） | ビザの期間による（年額） |
| 対象（ビザ区分） | Student visa／短期学習ビザ |
| 既存表示との違い | Ver.1.3.10 で文言を修正：「IHSを支払えばNHSを利用できる」という無条件の表現をやめ、ビザの種類・期間・申請場所・個々の事情で支払いとNHS利用の扱いが異なることを明記。年£776／£1,035は維持 |
| 承認前に人が決めること | 修正後の文言を料金ページと照合。金額は変わる。Planner には自動計上しない（承認後も同じ）。OGL v3.0 の範囲で再利用可（出典表示）。 |
| 編集する場所 | `data/profiles/manchester.ts` の `UK_HEALTH_CLAIMS`（claim `U5a`） |

**承認チェックリスト（U5a）** — 承認者が1件ずつ印を付けます。**全部に印が付くまで `verified` にしません。**

- [ ] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [ ] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [ ] 再利用条件を判断した（OGL v3.0：出典表示で可）
- [ ] 金額・日付がある場合、確認日が文言に併記されている
- [ ] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [ ] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### U5b（候補 U5）— 推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | 金額はビザの期間と申請場所で変わります：6か月以内は英国外から申請する場合は不要（英国内から申請する場合は年額の半額）、6か月超〜1年未満は1年分です。 |
| 公開予定の文言（English） | It depends on the length of the visa and where you apply from: for 6 months or less you do not pay when applying from outside the UK (half the yearly cost when applying from inside the UK); for more than 6 months but less than a year you pay a full year. |
| 公式出典 | [GOV.UK (Home Office)](https://www.gov.uk/healthcare-immigration-application/how-much-pay) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | 実際に付与されるビザの期間に対して適用。英国内からの申請は半額（学生は£388など）。同伴者・免除は別規定。 |
| 利用条件（商用再利用） | Open Government Licence v3.0 – Contains public sector information licensed under the Open Government Licence v3.0 |
| 推奨と理由 | **推奨**：同ページの「Cost for part of a year」の記載と一致。旧文言の「訪問者の滞在にはIHSがなく保険が必要」は読んだページにない推論のため削除。 |
| 画面上の表示場所 | Manchester city page → Daily life → Healthcare（Manchester · living.healthcare） |
| 現在の状態 | verified（承認: StarHunting1、2026-10-17、2026-10-17 StarHunting1 によるこの5件（U1・U2・U3・U5b・U6）の明示的な承認指示。照合：GOV.UK の公式情報との照合結果（2026-10-15 の GitHub Actions ページ確認で記載との一致を確認済み、およびユーザーによる GOV.UK 公式情報の確認）。出典: https://www.gov.uk/healthcare-immigration-application/how-much-pay） |
| 対象（国籍） | ビザ申請者（英国外／英国内で異なる） |
| 対象（滞在期間・コース） | 6か月以内／6か月超〜1年未満 |
| 対象（ビザ区分） | Student visa／短期学習ビザ |
| 既存表示との違い | 旧文言「訪問者の滞在にはIHSがなく保険が必要」は読んだページにない推論のため削除済み |
| 承認前に人が決めること | 同伴者・免除の規定に触れなくてよいか。OGL v3.0 の範囲で再利用可（出典表示）。追加の判断は不要。 |
| 編集する場所 | `data/profiles/manchester.ts` の `UK_HEALTH_CLAIMS`（claim `U5b`） |

**承認チェックリスト（U5b）** — ✅ **承認済み**（StarHunting1、2026-10-17。記録: `data/approvals.ts`）。以下は承認時の確認項目

- [x] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [x] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [x] 再利用条件を判断した（OGL v3.0：出典表示で可）
- [x] 金額・日付がある場合、確認日が文言に併記されている
- [x] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [x] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### C1（候補 C1）— 条件つき推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | IRCCの案内では、6か月以内のプログラムなら一般に就学許可（study permit）は不要ですが、入国には有効な渡航書類（eTAまたは訪問者ビザ）が必要です。どちらが必要かは国籍によって異なります。 |
| 公開予定の文言（English） | IRCC says a study permit is generally not needed for a programme of 6 months or less, but you still need a valid travel document to enter (an eTA or a visitor visa); which one depends on your nationality. |
| 公式出典 | [IRCC (Government of Canada)](https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=484&top=15)<br>[IRCC (Government of Canada)](https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=1289&top=23) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | 6か月未満のプログラム・コース。就学許可の例外は別規定。eTA/ビザの要否は国籍で異なる（C2参照）。 |
| 利用条件（商用再利用） | Government of Canada terms: non-commercial reproduction allowed, commercial reuse not confirmed – facts paraphrased, link only |
| 推奨と理由 | **条件つき推奨**：IRCCの回答（qnum=484）と一致。ページに更新日なし。Canada.ca の文章の商用再利用は未確認：言い換え＋リンクで足りると判断する場合のみ承認。 |
| 画面上の表示場所 | Country page → Visa → Official information（Canada · visa.official） |
| 現在の状態 | unverified（承認記録なし） |
| 対象（国籍） | 国籍により eTA または訪問者ビザ（C2 参照） |
| 対象（滞在期間・コース） | 6か月以内のプログラム |
| 対象（ビザ区分） | 就学許可（study permit）不要／eTA・訪問者ビザ |
| 既存表示との違い | Canada.ca の文章は引用せず言い換えのみ |
| 承認前に人が決めること | Canada.ca の商用再利用が未確認。「言い換え＋リンク」で足りると判断して承認するか、書面で確認するか、リンクのみにするか。 |
| 編集する場所 | `data/countries.ts` の `CAN_VISA_CLAIMS`（claim `C1`） |

**承認チェックリスト（C1）** — 承認者が1件ずつ印を付けます。**全部に印が付くまで `verified` にしません。**

- [ ] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [ ] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [ ] 再利用条件を判断した（Canada.ca／BC州：言い換え＋リンクで足りると判断した、または書面確認を得た）
- [ ] 金額・日付がある場合、確認日が文言に併記されている
- [ ] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [ ] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### C3（候補 C3）— 条件つき推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | IRCCは、6か月を超えて学習する場合は就学許可（study permit）が必要としています。申請料は study permit のページに記載されています（最新額はそちらで確認）。 |
| 公開予定の文言（English） | IRCC says you must get a study permit if you want to study for longer than 6 months; the study permit page lists the application fee (check the current amount there). |
| 公式出典 | [IRCC (Government of Canada)](https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=484&top=15)<br>[IRCC (Government of Canada)](https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | 6か月を超えるプログラム。料金の金額は画面に載せていない。 |
| 利用条件（商用再利用） | Government of Canada terms: non-commercial reproduction allowed, commercial reuse not confirmed – facts paraphrased, link only |
| 推奨と理由 | **条件つき推奨**：旧文言の「渡航前に申請」「学習を続ける可能性がある場合」は読んだページに逐語の記載がなかったため、確認できた記載に置き換えた。study permit ページの日付 2026-04-24。Canada.ca の商用再利用は未確認。 |
| 画面上の表示場所 | Country page → Visa → Official information（Canada · visa.official） |
| 現在の状態 | unverified（承認記録なし） |
| 対象（国籍） | 国籍を問わず |
| 対象（滞在期間・コース） | 6か月を超えるプログラム |
| 対象（ビザ区分） | 就学許可（study permit） |
| 既存表示との違い | 旧文言「渡航前に申請」「学習を続ける可能性がある場合」は逐語の記載が確認できず、確認できた記載に置換。申請料の金額は載せていない |
| 承認前に人が決めること | C1 と同じ（Canada.ca の再利用条件）。 |
| 編集する場所 | `data/countries.ts` の `CAN_VISA_CLAIMS`（claim `C3`） |

**承認チェックリスト（C3）** — 承認者が1件ずつ印を付けます。**全部に印が付くまで `verified` にしません。**

- [ ] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [ ] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [ ] 再利用条件を判断した（Canada.ca／BC州：言い換え＋リンクで足りると判断した、または書面確認を得た）
- [ ] 金額・日付がある場合、確認日が文言に併記されている
- [ ] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [ ] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### C2（候補 C2）— 条件つき推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | eTAが必要かどうかは国籍と移動手段で異なります。査証免除国の国籍で航空機を使う場合は必要で、陸路・バス・鉄道・船では不要です。 |
| 公開予定の文言（English） | The eTA requirement depends on your nationality and how you travel: it is needed if you are from a visa-exempt country and fly to Canada, and not needed if you travel by car, bus, train or boat. |
| 公式出典 | [IRCC (Government of Canada)](https://ircc.canada.ca/english/helpcentre/answer.asp?qnum=1289&top=23) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | 査証免除国の国籍で6か月未満の学習。それ以外の国籍は訪問者ビザなど別の書類。 |
| 利用条件（商用再利用） | Government of Canada terms: non-commercial reproduction allowed, commercial reuse not confirmed – facts paraphrased, link only |
| 推奨と理由 | **条件つき推奨**：IRCCの回答（qnum=1289）と一致。更新日なし。Canada.ca の商用再利用は未確認（言い換え＋リンクのみ）。 |
| 画面上の表示場所 | Country page → Visa → Points to note（Canada · visa.notes） |
| 現在の状態 | unverified（承認記録なし） |
| 対象（国籍） | 査証免除国の国籍（それ以外は訪問者ビザなど） |
| 対象（滞在期間・コース） | 6か月未満の学習 |
| 対象（ビザ区分） | eTA（航空機で入国する場合） |
| 既存表示との違い | 変更なし |
| 承認前に人が決めること | C1 と同じ（Canada.ca の再利用条件）。 |
| 編集する場所 | `data/countries.ts` の `CAN_NOTES_CLAIMS`（claim `C2`） |

**承認チェックリスト（C2）** — 承認者が1件ずつ印を付けます。**全部に印が付くまで `verified` にしません。**

- [ ] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [ ] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [ ] 再利用条件を判断した（Canada.ca／BC州：言い換え＋リンクで足りると判断した、または書面確認を得た）
- [ ] 金額・日付がある場合、確認日が文言に併記されている
- [ ] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [ ] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### C4-ref（候補 C4）— 保留

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | 州の医療保険は就学許可の期間と州によって異なります。ブリティッシュコロンビア州は「暮らし」の項目をご覧ください。 |
| 公開予定の文言（English） | Provincial health coverage depends on the permit length and the province – see the Daily life section for British Columbia. |
| 公式出典 | [Government of British Columbia](https://www2.gov.bc.ca/gov/content/health/accessing-health-care/health-fee-international-students) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | Vancouver の医療欄（C4a〜C4c）への案内で、出典に基づく独立した記述ではない。 |
| 利用条件（商用再利用） | Province of British Columbia copyright: no reproduction or redistribution without prior written permission – facts paraphrased, link only |
| 推奨と理由 | **保留**：保留：出典のページにある記述ではなく、StudyAtlas 自身の案内文。C4a〜C4c を承認する方が適切で、この文はリンクのみに書き換え可能。 |
| 画面上の表示場所 | Country page → Visa → Points to note（Canada · visa.notes） |
| 現在の状態 | unverified（承認記録なし） |
| 対象（国籍） | — |
| 対象（滞在期間・コース） | — |
| 対象（ビザ区分） | — |
| 既存表示との違い | StudyAtlas 自身の案内文で、出典ページの記述ではない |
| 承認前に人が決めること | 保留。承認せず、C4a〜C4c を承認するか、この文をリンクのみに書き換える。 |
| 編集する場所 | `data/countries.ts` の `CAN_NOTES_CLAIMS`（claim `C4-ref`） |

**承認チェックリスト（C4-ref）** — 承認者が1件ずつ印を付けます。**全部に印が付くまで `verified` にしません。**

- [ ] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [ ] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [ ] 再利用条件を判断した（Canada.ca／BC州：言い換え＋リンクで足りると判断した、または書面確認を得た）
- [ ] 金額・日付がある場合、確認日が文言に併記されている
- [ ] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [ ] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### C4a（候補 C4）— 条件つき推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | ブリティッシュコロンビア州の国際学生ヘルスフィー（2026-10-15に確認したページでは月額75カナダドル）は、有効な就学許可を持ち、年間で少なくとも6か月は州内にいる国際学生が対象で、州の医療保険（MSP）に加入します。個々の滞在が対象になるかは、公式ページでご確認ください。 |
| 公開予定の文言（English） | In British Columbia, the International Student Health Fee (CAD 75 a month on the page read on 2026-10-15) applies to international students on a valid study permit who are in the province for at least six months of the year, and they enrol in the Medical Services Plan (MSP). Whether a particular stay is covered should be checked on the official page. |
| 公式出典 | [Government of British Columbia](https://www2.gov.bc.ca/gov/content/health/accessing-health-care/health-fee-international-students) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | BC州のみ（他州は別制度）。有効な就学許可があり、年間で少なくとも6か月は州内にいる学生（K-12・高等教育を含む）。金額は変更されうる。 |
| 利用条件（商用再利用） | Province of British Columbia copyright: no reproduction or redistribution without prior written permission – facts paraphrased, link only |
| 推奨と理由 | **条件つき推奨**：BC州ページ（公開 2024-01-08、更新 2026-01-30）と一致。旧文言「6か月以上有効な就学許可」は不正確だったため Ver.1.3.4 で修正済み。BC州の著作権は書面許可なしの複製を禁止：言い換え＋リンクで足りると判断する場合のみ承認。 |
| 画面上の表示場所 | Vancouver city page → Daily life → Healthcare（Vancouver · living.healthcare） |
| 現在の状態 | unverified（承認記録なし） |
| 対象（国籍） | 有効な就学許可を持つ国際学生（BC州） |
| 対象（滞在期間・コース） | 年間で少なくとも6か月は州内に滞在 |
| 対象（ビザ区分） | 就学許可（study permit） |
| 既存表示との違い | 旧文言「6か月以上有効な就学許可」は不正確だったため Ver.1.3.4 で修正済み。金額（月75カナダドル）に確認日を併記 |
| 承認前に人が決めること | BC州の著作権は書面許可なしの複製・再配布を禁止。「事実の言い換え＋リンク」で足りるか、BC州に書面で確認するか。医療費は Planner に自動計上しない。 |
| 編集する場所 | `data/profiles/vancouver.ts` の `BC_HEALTH_CLAIMS`（claim `C4a`） |

**承認チェックリスト（C4a）** — 承認者が1件ずつ印を付けます。**全部に印が付くまで `verified` にしません。**

- [ ] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [ ] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [ ] 再利用条件を判断した（Canada.ca／BC州：言い換え＋リンクで足りると判断した、または書面確認を得た）
- [ ] 金額・日付がある場合、確認日が文言に併記されている
- [ ] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [ ] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### C4b（候補 C4）— 条件つき推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | 同ページによると、MSPから正式に脱退した成人の学生は対象外で、未成年は脱退できません。 |
| 公開予定の文言（English） | The page says adult students who formally opt out of MSP are exempt from the fee, and minors cannot opt out. |
| 公式出典 | [Government of British Columbia](https://www2.gov.bc.ca/gov/content/health/accessing-health-care/health-fee-international-students) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | 成人のみ。脱退すると州の医療保険は使えない（民間保険は本人の責任）。 |
| 利用条件（商用再利用） | Province of British Columbia copyright: no reproduction or redistribution without prior written permission – facts paraphrased, link only |
| 推奨と理由 | **条件つき推奨**：BC州ページの Q5 と一致。C4a と同じ著作権の条件。 |
| 画面上の表示場所 | Vancouver city page → Daily life → Healthcare（Vancouver · living.healthcare） |
| 現在の状態 | unverified（承認記録なし） |
| 対象（国籍） | 成人の国際学生（未成年は脱退不可） |
| 対象（滞在期間・コース） | MSP 加入期間 |
| 対象（ビザ区分） | 就学許可（study permit） |
| 既存表示との違い | 変更なし |
| 承認前に人が決めること | C4a と同じ（BC州の再利用条件）。脱退すると州の医療保険が使えない点を画面で伝えているか。 |
| 編集する場所 | `data/profiles/vancouver.ts` の `BC_HEALTH_CLAIMS`（claim `C4b`） |

**承認チェックリスト（C4b）** — 承認者が1件ずつ印を付けます。**全部に印が付くまで `verified` にしません。**

- [ ] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [ ] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [ ] 再利用条件を判断した（Canada.ca／BC州：言い換え＋リンクで足りると判断した、または書面確認を得た）
- [ ] 金額・日付がある場合、確認日が文言に併記されている
- [ ] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [ ] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

### C4c（候補 C4）— 条件つき推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | 加入前に待機期間（居住開始月の残り＋2か月）があり、その間は民間保険の加入が案内されています。 |
| 公開予定の文言（English） | There is a waiting period (the rest of the month you become resident plus two months), and the page advises private insurance until it ends. |
| 公式出典 | [Government of British Columbia](https://www2.gov.bc.ca/gov/content/health/accessing-health-care/health-fee-international-students) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | MSPに加入する学生。居住開始日で待機期間の長さが決まる。 |
| 利用条件（商用再利用） | Province of British Columbia copyright: no reproduction or redistribution without prior written permission – facts paraphrased, link only |
| 推奨と理由 | **条件つき推奨**：BC州ページ（「balance of the month in which residency is established, plus two months」「should carry private insurance」）と一致。C4a と同じ著作権の条件。保険の助言ではありません。 |
| 画面上の表示場所 | Vancouver city page → Daily life → Healthcare（Vancouver · living.healthcare） |
| 現在の状態 | unverified（承認記録なし） |
| 対象（国籍） | MSP に加入する学生 |
| 対象（滞在期間・コース） | 居住開始月の残り＋2か月の待機 |
| 対象（ビザ区分） | 就学許可（study permit） |
| 既存表示との違い | 変更なし（保険の助言ではない） |
| 承認前に人が決めること | C4a と同じ（BC州の再利用条件）。 |
| 編集する場所 | `data/profiles/vancouver.ts` の `BC_HEALTH_CLAIMS`（claim `C4c`） |

**承認チェックリスト（C4c）** — 承認者が1件ずつ印を付けます。**全部に印が付くまで `verified` にしません。**

- [ ] 公式出典のページを開き、公開予定の文言（日本語・English）の数値・語が一致している
- [ ] 対象（国籍・滞在期間・ビザ区分）と適用条件・例外が、文言と読み違えない形で書かれている
- [ ] 再利用条件を判断した（Canada.ca／BC州：言い換え＋リンクで足りると判断した、または書面確認を得た）
- [ ] 金額・日付がある場合、確認日が文言に併記されている
- [ ] 画面の表示場所と、Planner に自動計上されないこと（ビザ・保険）を確認した
- [ ] 承認の記録を書いた：`approval: { by: "承認者名", at: "YYYY-MM-DD", compared: "比べた内容" }`、`checkedAt`、`period`

## 5. Vancouver の気候データ（K1）: 承認済み・本番反映（Ver.1.4.3）— 画面は 1991–2020、1981–2010 は履歴

| 項目 | 旧（履歴・画面には表示しない） | 現在（画面・verified・承認済み） |
|---|---|---|
| 承認 | — | StarHunting1・2026-10-17 |
| 年間降水量 | （月の合計 1189.0 mm） | ECCC の年値 1159.5 mm（画面に表示） |
| 基準期間 | 1981–2010 | 1991–2020 |
| 観測地点 | VANCOUVER INT'L A（気候ID 1108447） | VANCOUVER INTERNATIONAL (AIRPORT) – composite of 1108447 and 1108395 |
| 状態 | verified | verified |
| 単位 | 気温 ℃（日平均・日最高・日最低の月平均）、降水量 mm（月合計） | 同じ（ECCC の行: Daily Average / Daily Maximum / Daily Minimum (°C)、Precipitation (mm)） |
| 取得日・方法 | 2026-10-13・ECCC GeoMet API（2012-10-10 計算） | 2026-10-16・ECCC 一括CSV（BC州）を1回取得（Actions run 38904919856） |
| 出典URL | https://climate.weather.gc.ca/climate_normals/ | https://climate.weather.gc.ca/climate_normals/index_e.html（一括ダウンロード: `/climate_normals/download/1991_e.html?area=province&province[]=BC&product[]=data&product[]=station_inventory`） |
| 利用許諾 | Environment and Climate Change Canada Data Services End-use Licence v2.1.1 (August 2026)（商用利用可・出典表示が必要） | 同じ |
| 出典表示（画面に表示する文言） | Contains information licenced under the Data Server End-use Licence of Environment and Climate Change Canada. | 同じ |

**観測地点・合成観測所の条件**: 1991–2020 の値は ECCC の「合成観測所」（normals code C）VANCOUVER INTERNATIONAL (AIRPORT) のもので、気候ID **1108447（VANCOUVER INT'L A）と 1108395（VANCOUVER INTL A、WMO 71892、YVR）** を組み合わせています（北緯49.20・西経123.18・標高4.3 m）。観測所IDは2013年前後で切り替わるため、30年分は2つのIDの観測をつないだものです。1981–2010 は旧ID 1108447 のみです。品質コード: 気温 B、降水量 C（ECCC の凡例による）。承認者は、この合成が「バンクーバー国際空港の平年値」として適切かを判断してください。

| 月 | 日平均 旧→新 (℃) | 差 | 日最高 旧→新 (℃) | 差 | 日最低 旧→新 (℃) | 差 | 降水量 旧→新 (mm) | 差 |
|---|---|---|---|---|---|---|---|---|
| 1月 | 4.1 → 4.1 | 0.0 | 6.9 → 6.8 | -0.1 | 1.4 → 1.4 | 0.0 | 168.4 → 174.0 | +5.6 |
| 2月 | 4.9 → 4.7 | -0.2 | 8.2 → 7.9 | -0.3 | 1.6 → 1.5 | -0.1 | 104.6 → 90.8 | -13.8 |
| 3月 | 6.9 → 6.7 | -0.2 | 10.3 → 10.1 | -0.2 | 3.4 → 3.3 | -0.1 | 113.9 → 106.4 | -7.5 |
| 4月 | 9.4 → 9.4 | 0.0 | 13.2 → 13.1 | -0.1 | 5.6 → 5.7 | +0.1 | 88.5 → 85.5 | -3.0 |
| 5月 | 12.8 → 13.0 | +0.2 | 16.7 → 16.9 | +0.2 | 8.8 → 9.0 | +0.2 | 65.0 → 59.1 | -5.9 |
| 6月 | 15.7 → 15.8 | +0.1 | 19.6 → 19.6 | 0.0 | 11.7 → 11.9 | +0.2 | 53.8 → 51.1 | -2.7 |
| 7月 | 18.0 → 18.2 | +0.2 | 22.1 → 22.4 | +0.3 | 13.7 → 13.9 | +0.2 | 35.6 → 34.1 | -1.5 |
| 8月 | 18.0 → 18.2 | +0.2 | 22.2 → 22.4 | +0.2 | 13.8 → 14.0 | +0.2 | 36.7 → 36.1 | -0.6 |
| 9月 | 14.9 → 15.2 | +0.3 | 18.9 → 19.1 | +0.2 | 10.8 → 11.2 | +0.4 | 50.9 → 51.9 | +1.0 |
| 10月 | 10.3 → 10.3 | 0.0 | 13.5 → 13.5 | 0.0 | 7.0 → 7.0 | 0.0 | 120.8 → 123.9 | +3.1 |
| 11月 | 6.3 → 6.4 | +0.1 | 9.2 → 9.3 | +0.2 | 3.5 → 3.6 | +0.1 | 188.9 → 174.6 | -14.3 |
| 12月 | 3.6 → 3.9 | +0.3 | 6.3 → 6.6 | +0.3 | 0.8 → 1.2 | +0.4 | 161.9 → 172.2 | +10.3 |

年間降水量（月の合計）: 1189.0 mm → 1159.7 mm（-29.3）。ECCC の年値（1991–2020）は 1159.5 mm。

**画面を切り替えた影響**（2026-10-17 の承認を受けて Ver.1.4.3 で反映済み）:
- 都市ページの「気候」と都市比較の月別表の値が、上表の「新」に変わる（気温は最大 ±0.4 ℃、降水量は月により最大 ±14 mm 程度の増減）。
- 「最新の標準期間（1991–2020）ではありません」という注意書きは、期間の終わりが 2020 になるため表示されなくなる（Manchester は 1971–2000 のまま注意書きが残る）。
- 画面の確認状況は「確認済み」（承認記録つき）。観測所の表記は合成観測所の名称と気候IDに変わった。
- 出典表示（ECCC の文言）と出典URL（上表）が表示される。
- 切り替え内容: `data/official/vancouver.ts` で 1991–2020 を `climate`（承認記録は `data/approvals.ts`）、旧 1981–2010 を `climateAlt`（履歴、非表示）に入れ替えた。1981–2010 と 1991–2020 の値は混在させない。

**整合性の機械チェック**（入力ミスの検出用。出典との照合は人が行います）:

| 確認項目 | 結果 | 詳細 |
|---|---|---|
| 12か月分がそろっている | ✅ 一致 | 12 か月 |
| 各月で 日最低 ≤ 日平均 ≤ 日最高 | ✅ 一致 | 全12か月で成立 |
| 値が現実的な範囲（気温 −40〜45 ℃、月降水量 0〜1000 mm） | ✅ 一致 | 範囲内 |
| 月降水量の合計が公表の年値（1159.5 mm）と、月値12個の四捨五入の最大誤差（±0.6 mm）以内で一致 | ✅ 一致 | 合計 1159.7 mm、差 0.2 mm |
| 最暖月が7〜8月、最寒月が12〜2月（北半球の気候として自然） | ✅ 一致 | 最暖 7月、最寒 12月 |
| 観測所ID・期間・出典URL・取得日・引用が記録されている | ✅ 一致 | 1108447+1108395／1991–2020／2026-10-16 |

- 年平均気温など、気温の年値は記録していません。承認者が ECCC の CSV（Year 列）と月別値を照合してください。
- 旧 1981–2010 との差は上表のとおり（気温は最大 ±0.4 ℃、月降水量は最大 −14.3〜+10.3 mm）。基準期間が10年ずれたこと（1981–2010 → 1991–2020）と、観測所が単独の 1108447 から合成観測所（1108447＋1108395）に変わったことの両方が考えられ、この資料だけではどちらの影響かを分けられません。

### ECCC の元 CSV との照合結果（Ver.1.4.2、GitHub Actions run 39051554489・2026-10-17）

ECCC の一括CSV（`1991-2020_Canadian_Climate_Normals_BC_Data.csv`、ブリティッシュコロンビア州、HTTP 200、1回だけ取得、robots.txt 許可）の「VANCOUVER INTERNATIONAL (AIRPORT)」の Normal の行と、保存済みの値を列の見出し（NORMALS_ELEMENT）で突き合わせた結果です。取得したCSVは保存していません。

| 要素（CSV の NORMALS_ELEMENT） | 月別12値 | ECCC の年値 | 月値の平均／合計 | コード |
|---|---|---|---|---|
| Daily Average (°C) | **12/12 一致** | 10.5 | 平均 10.49 | B |
| Daily Maximum (°C) | **12/12 一致** | 14.0 | 平均 13.98 | B |
| Daily Minimum (°C) | **12/12 一致** | 7.0 | 平均 6.97 | B |
| Precipitation (mm) | **12/12 一致** | 1159.5 | 合計 1159.7 | C |

- **一致**：48個すべて（4要素×12か月）。不一致は 0 件。
- **年値**：気温の年値は月値の平均を小数第1位に丸めた値と一致（10.49→10.5、13.98→14.0、6.97→7.0）。降水量は ECCC の年値 1159.5 mm と月値の合計 1159.7 mm で **0.2 mm 差**。月値12個はそれぞれ小数第1位への四捨五入なので、合計には最大 ±0.6 mm の誤差が入りうる範囲に収まっている（0.2 mm は範囲内）。ただし ECCC が年値をどう算出しているか（月値の合計か、年ごとの値の平均か）は CSV や資料に書かれておらず、**差の原因を断定はできません**。
- **観測所**（観測所一覧より）：合成観測所 VANCOUVER INTERNATIONAL (AIRPORT)（NORMALS_CODE C）。構成：VANCOUVER INT'L A（気候ID 1108447、TC識別子 YVR、WMO なし、北緯49.20・西経-123.18、標高4.3 m）と VANCOUVER INTL A（気候ID 1108395、WMO 71892、YVR、北緯49.19・西経-123.18、標高4.3 m）。ID は保存値（1108447＋1108395）と一致。
- **単位・期間**：気温 °C、降水量 mm。ECCC の 1991–2020 カナダ気候平年値（Normal）。保存値の期間表記 1991–2020 と一致。
- **ライセンス**（ECCC の公式ページで確認、HTTP 200）：Environment and Climate Change Canada Data Services End-use Licence **Version 2.1.1（2026年8月版）**。「商用目的を含めて」世界的・無償・永続的・非独占で利用可。出典表示：「Contains information licenced under the Data Server End-use Licence of Environment and Climate Change Canada.」（本サイトはこの文言を表示する設定）。保存値の記録は v2.1 と書いているので、版番号を 2.1.1 に直す余地がある（内容の違いは未確認）。
- **未確認・未解決**：①コード B（気温）・C（降水量）の意味（ECCC の凡例）は今回確認していません。②降水量の年値の差 0.2 mm の算出方法。③この照合は Actions が取得した CSV と保存値の機械的な一致で、**人による承認ではありません**。

### 気候データ承認チェックリスト（K1）

- [ ] ECCC の公式ページ／一括CSVを開き、観測所（合成観測所 VANCOUVER INTERNATIONAL (AIRPORT)、気候ID 1108447・1108395）が一致している
- [ ] 月別の日平均・日最高・日最低（℃）と降水量（mm）の48個の値が上表の「新」と一致している（年値も照合）— Actions の機械照合では全一致（上の結果）。人の最終確認はここ
- [ ] 単位・基準期間（1991–2020）・品質コード（気温 B、降水量 C）を確認した
- [ ] ライセンス（ECCC Data Services End-use Licence v2.1.1）と出典表示の文言が画面に出る設定になっている
- [ ] 画面を切り替えたときの影響（上記）を読み、1981–2010 を履歴（`climateAlt`）に残す手順に同意した
- [x] 承認の記録を書いた（2026-10-17、StarHunting1。`data/approvals.ts`）

**Manchester**: 1991–2020 は取り込めていません（旧 1971–2000 のまま）。理由は `data/APPROVAL_CANDIDATES.md` の「気候データの承認候補」を参照。

## 6. Toronto・London の家賃統計（Ver.1.5.1）: 照合済み・承認待ち（verified ではありません）

公式データとの再照合は 2026-10-17 の GitHub Actions（run 39065320556、読み取り専用・robots.txt 順守・再試行なし）で実施し、**5つの数値すべてが公式と一致**しました。ここに書いてあるのは承認の**準備**だけです。承認記録（`RENT_APPROVALS`）が空の間、数値は画面にも比較にも出ず、どれも verified になりません。承認は**数値ごと**（Toronto 4件・London 1件）に別々にできます。

| 項目 | 内容 |
|---|---|
| Toronto の出典 | Statistics Canada 表 34-10-0133-01（CMHC 賃貸市場調査）。地域メンバー125「Toronto, Ontario」＝国勢調査都市圏（CMA）コード535（geoLevel 503）。Toronto 市そのものではなく、より広い都市圏全体 |
| Toronto の定義 | 構造タイプ3「Row and apartment structures of three units and over」の、間取り別の平均家賃（調査対象年2025、2025-12-17公表）。学生向け住居・語学学校の滞在先・留学生の平均ではない |
| London の出典 | ONS Price Index of Private Rents（PIPR）月次価格統計、2026年9月16日版 Table 1。地域コード E12000007「London」＝イングランドの地域区分（グレーター・ロンドン）。区ごとの値ではなく地域全体の平均 |
| London の定義 | 民間賃貸住宅すべて（新規契約と既存契約）の月額家賃の平均、2026年8月、1ポンド単位に丸め。ONSは「開発中の公式統計」としている |
| ライセンス（Toronto） | CMHC Licence Agreement for the Use of Data：情報（および付加価値製品）の使用・複製・公表・配布・販売を許可（取消可能・世界的・無償）。**商用利用可**。情報は正確に複製し、出典表示（Source: CMHC, 製品名, 基準日。…as is basis with the permission of CMHC）が必須。Statistics Canada の表ページがこのCMHCライセンスを参照 |
| ライセンス（London） | Open Government Licence v3.0：複製・公表・配布・改変・**商用利用可**。出典表示「Contains public sector information licensed under the Open Government Licence v3.0」。PIPRのデータセットページに「特に断りがない限りOGL v3.0」と明記 |
| 再利用許諾の確認日 | 2026-10-17（`data/official/RIGHTS.md`。検証状態とは別の記録） |

### 6.1 数値ごとの照合と承認の準備

| 数値 | 公式（2026-10-17に取得） | サイトの候補 | 照合 | 比較の基準 | 承認の状態 | 承認で記録するダイジェスト |
|---|---|---|---|---|---|---|
| tor-cmhc-rent-bachelor | CMA 535 ・ 1,491 CAD/月 ・ 2025 | 1,491 CAD/月 | 一致 | census metropolitan area・Row and apartment structures of three units and over・Bachelor units・2025 | **未承認**（非表示） | `4a79633baf6e7b89bdd7e14393229e1674567a418856ca355e824e5739eab8cf` |
| tor-cmhc-rent-1br | CMA 535 ・ 1,761 CAD/月 ・ 2025 | 1,761 CAD/月 | 一致 | census metropolitan area・Row and apartment structures of three units and over・One bedroom units・2025 | **未承認**（非表示） | `abbbf002fa77176f0b4b2c9fc214de335c9faefd166c739b4fbf153f180185c1` |
| tor-cmhc-rent-2br | CMA 535 ・ 2,045 CAD/月 ・ 2025 | 2,045 CAD/月 | 一致 | census metropolitan area・Row and apartment structures of three units and over・Two bedroom units・2025 | **未承認**（非表示） | `5085d74860e41547259c36aeb9e6a911d5b64b6a444ba58427f0429c13f08381` |
| tor-cmhc-rent-3br | CMA 535 ・ 2,294 CAD/月 ・ 2025 | 2,294 CAD/月 | 一致 | census metropolitan area・Row and apartment structures of three units and over・Three bedroom units・2025 | **未承認**（非表示） | `923365e8fe0775666ae8e0f82f996234670d48cdb7c8f912a37392859361fdb0` |
| lon-ons-pipr-private-rent-region-month | E12000007 ・ 2,332 GBP/月 ・ 2026-08 | 2,332 GBP/月 | 一致 | region・all dwellings・all sizes・2026-08 | **未承認**（非表示） | `8122055734968c0c56c89125164f69d6ca1650924078dc93cb5710c026cdda09` |

### 6.2 承認の手順（人が行う）

1. 上の公式URL（Statistics Canada の表／ONS の PIPR データセットページ）を自分で開き、数値・地域・期間・単位が上表と一致することを確認する（Actions の機械照合は補助です）。
2. CMHC ライセンスと OGL v3.0 の商用利用の許可、出典表示が画面に出る設定であることを確認する（再利用許諾が曖昧な場合は承認しないでください）。
3. `data/official/cityRents.ts` の `RENT_APPROVALS` に、承認する数値だけを追加する（数値ごとに別のエントリ。他の都市・他の数値は公開されません）:
   `"tor-cmhc-rent-1br": { approvedBy: "（名前）", approvedAt: "YYYY-MM-DD", basis: "（何を何と照合したか）", digest: "（上表のダイジェスト）" }`
4. 数値・出典・期間・定義を後から変更すると、ダイジェストが一致せずビルドが失敗します（承認した内容と違うものは公開されません）。変更した場合は公式データと再照合して承認し直してください。
5. 承認していない数値は、都市ページでは「承認待ち」の説明と公式リンクが残り、都市比較では「承認待ち（数値は未掲載）」と表示されます。Smart Planner には自動計上されません（Toronto・London には Planner の規則がありません）。

### 6.3 承認チェックリスト

- [ ] Toronto 4値（Bachelor 1,491／1BR 1,761／2BR 2,045／3BR 2,294 CAD/月、2025、CMA 535）を公式の表と照合した
- [ ] London 1値（£2,332/月、2026年8月、London region E12000007、全住宅）を公式と照合した
- [ ] CMHC ライセンス（商用利用可・出典表示必須・取消可能）と OGL v3.0 を確認した
- [ ] 「Toronto市ではなくCMA」「London region全体であり区ではない」「学生向け住居ではない」の説明が画面に出ることを確認した
- [ ] 承認記録を `RENT_APPROVALS` に書いた（数値ごと）
