# 承認シート（Ver.1.3.6）— 政府情報の主張ごとの承認と Vancouver 気候データ

_`npm run approvals` が `data/approvalSheet.ts` と各データから生成します。手で編集しないでください。_

**これは承認ではありません。** 全ての主張・気候データは `unverified` のままで、画面にも「未確認」と表示されます。自動のページ確認（GitHub Actions）だけで `verified` にすることはありません。`verified` にできるのは、人が下の手順で承認の記録（承認者・日付・比較した内容）を書いた主張だけです（`data/validate.ts` が検査し、無いとビルドが失敗します）。

## 1. 承認の単位と手順

- 画面の1つの項目（Fact）は、複数の主張（claim）からできています。**主張ごと**に `status` と承認記録を持つので、1件ずつ承認できます。Fact 全体は「全ての主張が verified」のときだけ verified になり、一部だけ承認した場合は、画面で主張ごとに確認状況が表示されます。
- 承認する手順: ①根拠のURLを開いて文言・数値が一致することを確認 → ②下の「編集する場所」の該当 claim で `status: "verified"` にし、`approval: { by: "氏名", at: "YYYY-MM-DD", compared: "何と何を比べたか" }`、`period`、`checkedAt` を設定 → ③`npm test` と `npm run approvals`。
- 保留の主張は承認できません（`hold` のまま verified にするとビルドが失敗します）。文言を直すか、リンクのみにしてください。
- ビザ・医療費は、承認後も Planner に自動計上しません（`tests/releasecheck.test.ts`）。

## 2. 候補（U1〜U6、C1〜C4）と主張の対応

| 候補 | 主張 | 推奨 | 状態 |
|---|---|---|---|
| U1 | U1 | U1: 推奨 | U1: unverified |
| U2 | U2 | U2: 推奨 | U2: unverified |
| U3 | U3 | U3: 推奨 | U3: unverified |
| U4 | U4 | U4: 推奨 | U4: unverified |
| U5 | U5-visa, U5a, U5b | U5-visa: 推奨 / U5a: 推奨 / U5b: 推奨 | U5-visa: unverified, U5a: unverified, U5b: unverified |
| U6 | U6 | U6: 推奨 | U6: unverified |
| C1 | C1 | C1: 条件つき推奨 | C1: unverified |
| C2 | C2 | C2: 条件つき推奨 | C2: unverified |
| C3 | C3 | C3: 条件つき推奨 | C3: unverified |
| C4 | C4-ref, C4a, C4b, C4c | C4-ref: 保留 / C4a: 条件つき推奨 / C4b: 条件つき推奨 / C4c: 条件つき推奨 | C4-ref: unverified, C4a: unverified, C4b: unverified, C4c: unverified |

集計: 主張 15 件（推奨 8／条件つき推奨 6／保留 1）。verified は 0 件。

## 3. 保留すべき情報

- **C4-ref**（候補 C4）: 保留：出典のページにある記述ではなく、StudyAtlas 自身の案内文。C4a〜C4c を承認する方が適切で、この文はリンクのみに書き換え可能。
- **U5（旧文言）の「訪問者の滞在にはIHSがなく保険が必要」**: 読んだページにない推論のため画面から削除済み（承認対象にしていない）。
- **C3 の旧文言「渡航前に申請」「学習を続ける可能性がある場合」**: 逐語の記載が確認できず、確認できた記載に置き換え済み。
- **Canada.ca の商用再利用（C1・C2・C3）と BC州の転載（C4a〜c）**: 利用条件が未確認／書面許可が必要なため、承認する場合も「言い換え＋リンクのみ」で足りるという判断が必要。許可を得ない限り引用・転載はしない。

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
| 現在の状態 | unverified（承認記録なし） |
| 編集する場所 | `data/countries.ts` の `GBR_VISA_CLAIMS`（claim `U1`） |

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
| 現在の状態 | unverified（承認記録なし） |
| 編集する場所 | `data/countries.ts` の `GBR_VISA_CLAIMS`（claim `U2`） |

### U4（候補 U4）— 推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | それより長いコースは Student visa で、認可を受けた学校（licensed student sponsor）での受講許可が必要です（16歳以上）。 |
| 公開予定の文言（English） | Longer courses need a Student visa, which requires a place on a course with a licensed student sponsor (age 16 or over). |
| 公式出典 | [GOV.UK (Home Office)](https://www.gov.uk/student-visa) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | 16歳以上、licensed student sponsor の受講許可、資金・英語力など。16・17歳は保護者の同意が必要（Child Student visa の可能性）。ページの申請料£558は画面に載せていない。 |
| 利用条件（商用再利用） | Open Government Licence v3.0 – Contains public sector information licensed under the Open Government Licence v3.0 |
| 推奨と理由 | **推奨**：gov.uk/student-visa（ページ更新 2024-10-31）と一致。旧文言の「学位取得も」は読んだページに直接の根拠がなく削除。 |
| 画面上の表示場所 | Country page → Visa → Official information（United Kingdom · visa.official） |
| 現在の状態 | unverified（承認記録なし） |
| 編集する場所 | `data/countries.ts` の `GBR_VISA_CLAIMS`（claim `U4`） |

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
| 現在の状態 | unverified（承認記録なし） |
| 編集する場所 | `data/countries.ts` の `GBR_VISA_CLAIMS`（claim `U6`） |

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
| 現在の状態 | unverified（承認記録なし） |
| 編集する場所 | `data/countries.ts` の `GBR_NOTES_CLAIMS`（claim `U3`） |

### U5-visa（候補 U5）— 推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | 医療付加金（IHS）は申請時に前払いし、英国外から申請する6か月以内のコースでは支払い不要とされています。 |
| 公開予定の文言（English） | The healthcare surcharge (IHS) is paid upfront with the application; it is not payable when you apply from outside the UK for 6 months or less. |
| 公式出典 | [GOV.UK (Home Office)](https://www.gov.uk/healthcare-immigration-application/how-much-pay) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | 金額と6か月の扱いは、ビザの期間・申請場所・年齢で変わります。Manchester の「暮らし → 医療」の記述を参照。 |
| 利用条件（商用再利用） | Open Government Licence v3.0 – Contains public sector information licensed under the Open Government Licence v3.0 |
| 推奨と理由 | **推奨**：gov.uk/healthcare-immigration-application/how-much-pay（ページ更新 2024-11-28）と一致。Manchester の医療欄の記述と同じ候補。 |
| 画面上の表示場所 | Country page → Visa → Points to note（United Kingdom · visa.notes） |
| 現在の状態 | unverified（承認記録なし） |
| 編集する場所 | `data/countries.ts` の `GBR_NOTES_CLAIMS`（claim `U5-visa`） |

### U5a（候補 U5）— 推奨

| 項目 | 内容 |
|---|---|
| 公開予定の文言（日本語） | Student visa や短期学習ビザでは、通常、ビザ申請時に医療付加金（IHS）を支払い、その後NHSを利用できます。2026-10-15に確認したページでは学生料金は年£776（その他の多くの申請は年£1,035）です。 |
| 公開予定の文言（English） | With a Student visa or Short-term study visa you normally pay the Immigration Health Surcharge (IHS) with the visa application, and can then use the NHS. On the page read on 2026-10-15 the student rate is £776 per year (£1,035 per year for most other applications). |
| 公式出典 | [GOV.UK (Home Office)](https://www.gov.uk/healthcare-immigration-application/how-much-pay)<br>[GOV.UK (Home Office)](https://www.gov.uk/visa-to-study-english) |
| 確認日・対象期間 | 2026-10-15・2026-10（Actions のページ確認） |
| 適用条件と例外 | Student visa／短期学習ビザの申請者。18歳未満も年£776、その他は年£1,035。金額はビザの期間と申請場所で変わる（U5b）。Plannerには自動計上しない。 |
| 利用条件（商用再利用） | Open Government Licence v3.0 – Contains public sector information licensed under the Open Government Licence v3.0 |
| 推奨と理由 | **推奨**：gov.uk/healthcare-immigration-application/how-much-pay（更新 2024-11-28）および短期学習ビザのページ（「usually costs £776」）と一致。料金は変わるので日付を維持。 |
| 画面上の表示場所 | Manchester city page → Daily life → Healthcare（Manchester · living.healthcare） |
| 現在の状態 | unverified（承認記録なし） |
| 編集する場所 | `data/profiles/manchester.ts` の `UK_HEALTH_CLAIMS`（claim `U5a`） |

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
| 現在の状態 | unverified（承認記録なし） |
| 編集する場所 | `data/profiles/manchester.ts` の `UK_HEALTH_CLAIMS`（claim `U5b`） |

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
| 編集する場所 | `data/countries.ts` の `CAN_VISA_CLAIMS`（claim `C1`） |

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
| 編集する場所 | `data/countries.ts` の `CAN_VISA_CLAIMS`（claim `C3`） |

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
| 編集する場所 | `data/countries.ts` の `CAN_NOTES_CLAIMS`（claim `C2`） |

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
| 編集する場所 | `data/countries.ts` の `CAN_NOTES_CLAIMS`（claim `C4-ref`） |

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
| 編集する場所 | `data/profiles/vancouver.ts` の `BC_HEALTH_CLAIMS`（claim `C4a`） |

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
| 編集する場所 | `data/profiles/vancouver.ts` の `BC_HEALTH_CLAIMS`（claim `C4b`） |

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
| 編集する場所 | `data/profiles/vancouver.ts` の `BC_HEALTH_CLAIMS`（claim `C4c`） |

## 5. Vancouver の気候データ（K1）: 1981–2010（画面の確認済み値）と 1991–2020（承認待ち候補）

| 項目 | 現在（画面・verified） | 候補（未表示・unverified） |
|---|---|---|
| 基準期間 | 1981–2010 | 1991–2020 |
| 観測地点 | VANCOUVER INT'L A（気候ID 1108447） | VANCOUVER INTERNATIONAL (AIRPORT) – composite of 1108447 and 1108395 |
| 状態 | verified | unverified |
| 単位 | 気温 ℃（日平均・日最高・日最低の月平均）、降水量 mm（月合計） | 同じ（ECCC の行: Daily Average / Daily Maximum / Daily Minimum (°C)、Precipitation (mm)） |
| 取得日・方法 | 2026-10-13・ECCC GeoMet API（2012-10-10 計算） | 2026-10-16・ECCC 一括CSV（BC州）を1回取得（Actions run 38904919856） |
| 出典URL | https://climate.weather.gc.ca/climate_normals/ | https://climate.weather.gc.ca/climate_normals/index_e.html（一括ダウンロード: `/climate_normals/download/1991_e.html?area=province&province[]=BC&product[]=data&product[]=station_inventory`） |
| 利用許諾 | Environment and Climate Change Canada Data Services End-use Licence v2.1（商用利用可・出典表示が必要） | 同じ |
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

**画面を切り替えたときの影響**（承認するまで切り替えません）:
- 都市ページの「気候」と都市比較の月別表の値が、上表の「新」に変わる（気温は最大 ±0.4 ℃、降水量は月により最大 ±14 mm 程度の増減）。
- 「最新の標準期間（1991–2020）ではありません」という注意書きは、期間の終わりが 2020 になるため表示されなくなる（Manchester は 1971–2000 のまま注意書きが残る）。
- 画面の確認状況は、承認して `status: "verified"` にした時点でだけ「確認済み」になる。観測所の表記は合成観測所の名称と気候IDに変わる。
- 出典表示（ECCC の文言）と出典URL（上表）が表示される。
- 切り替え手順: `data/official/vancouver.ts` で `climateAlt` を `climate` に入れ替え（旧 1981–2010 は `climateAlt` へ）、`status`・`note`（承認者・日付）を更新。それまでは本番の確認済み値（1981–2010）を変更しません。

**Manchester**: 1991–2020 は取り込めていません（旧 1971–2000 のまま）。理由は `data/APPROVAL_CANDIDATES.md` の「気候データの承認候補」を参照。
