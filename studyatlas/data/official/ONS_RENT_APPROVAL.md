# ONS 家賃データ 承認シート（Ver.1.2.3）

対象はこの1件だけです：**マンチェスター（ONS地域コード E08000003）の民間賃貸住宅すべての平均月額家賃、2026年8月、£1,373／月**。
**まだ承認されていません。** `data/official/onsRent.ts` の `ONS_RENT_APPROVAL` は `null` のままで、サイトには何も表示されず、`verified` にもなっていません。
承認できるのは人だけです。このシートは、承認の前に何を何と見比べるかをまとめたものです。

## 承認する値（これ以外は承認の対象外）
| 項目 | 内容 |
|---|---|
| 値・単位 | 1,373 GBP／月（1ポンド単位に丸め済み） |
| 対象月 | 2026年8月（Excelでは 2026-08-01） |
| 範囲 | マンチェスター市（地方自治体）の民間賃貸住宅**すべて**の平均。新規契約と既存契約の両方。寝室数・物件タイプ別ではない |
| 学生向けではない | 大学寮の料金でも、留学生・学生の平均でもない（カードの条件欄に日英で明記済み） |
| データ公表日 | 2026-09-16（PIPR月次価格統計 2026年9月16日版） |
| 出典 | Office for National Statistics（ONS）。Price Index of Private Rents（PIPR） |
| ライセンス | Open Government Licence v3.0。出典表示：「Source: Office for National Statistics licensed under the Open Government Licence v3.0.」 |

## 照合した結果（すべて一致）
| 照合先 | 確認した内容 | 結果 |
|---|---|---|
| ONS公式ページ（マンチェスター）<br>https://www.ons.gov.uk/visualisations/housingpriceslocal/E08000003 | 「The average monthly private rent in Manchester was £1,373 in August 2026. This was an increase from £1,317 in August 2025, a 4.2% rise.」URLが E08000003。出典欄は「Price Index of Private Rents from the Office for National Statistics」 | 値・月・地域コード一致 |
| ONS公式Excel（2026年9月16日版）<br>https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/priceindexofprivaterentsukmonthlypricestatistics | シート `Table 1`、**34163行目**：A=2026-08-01、B=E08000003、C=Manchester、D=North West、**H（Rental price）=1373**、G（Annual change）=4.198189。前2か月は34162行目=1365（7月）、34161行目=1358（6月） | 値・月・地域コード・地域名一致。ページの前年比 +4.2% とも一致 |
| 単位（Excelの Notes シート） | note 6「Private rental prices are rounded to the nearest £1.」／ note 1 季節調整なし ／ note 2 指数は2023年1月=100 | 月額・ポンド・1ポンド単位に丸めと確認 |
| 定義（Excelの表紙シート） | 「It covers both new and existing tenancies in the private rental sector. PIPR is constructed using administrative data on rents」「These series are official statistics in development.」 | 範囲の記述と一致 |
| 公表日（Excelの表紙シート） | 「originally published at 9:30am on 16 September 2026」。ファイルのフォルダ名も 16september2026 | 一致 |
| ライセンス（ONS利用規約、データセットページのフッター） | 「Most content on this website is … published under the Open Government Licence (OGL). Some content is exempt」（対象外は第三者の写真・イラスト・動画）。フッター：「All content is available under the Open Government Licence v3.0, except where otherwise stated」 | OGL v3.0 で再利用可。この値は対象外に当たらない |
| 取得ルール（ONS fair use policy、bot guide） | 連絡先付きの User-Agent、月2リクエスト、429 では Retry-After を守る | 満たしている（権利記録に記載） |
| 収集済みの記録（`data/collected/snapshot.json`） | 値1373・単位GBP／月・2026-08・E08000003・公表日2026-09-16・ライセンス・証拠の引用が一致。収集側の検証8項目すべて通過、未確認事項なし。状態は `unverified` | 一致（収集処理は verified にしません） |
| 出典登録・権利記録・表示ルール | Manchester向けに登録、OGL v3.0 で permitted、収集 allowed、表示は full | 一致 |

上記は、`npx tsx tests/onsrentdisplay.test.ts` が毎回自動で突き合わせています（21項目すべて通過、不一致0）。
読み取りの元になった GitHub Actions の実行：PR #21 の調査（Excelの構造と34161〜34163行目）、PR #22 のドライラン（実際のExcelから 34163行目・1373 を取得）、PR #23 のデータ収集（スナップショットへ保存）。

## 承認の前に、ご自身で見ていただきたい箇所
1. 上のONSページ：「£1,373」「August 2026」と、URL末尾の E08000003。
2. 上のデータセットページから 2026年9月16日版の xlsx を開き、`Table 1` の 34163行目：H列が 1373、A列が 2026-08-01、B列が E08000003。
3. 表紙シートの「new and existing tenancies」、Notes の note 6（1ポンド単位に丸め）。

## 承認の前に、知っておいていただきたい点（未確認・注意）
- ONSは「英国全体の直近2か月の家賃推計は暫定値で、改定されることがある」と記載しています。マンチェスターの2026年8月の値も、次回公表（**2026年10月21日**）で改定される可能性が否定できません。承認は「この月・この値」に固定され、改定された場合は自動では更新されません（新しいレビューが必要です）。
- ONSは本統計を「開発中の公式統計（official statistics in development）」としています。
- ONSの公表レポート（bulletin）は読めていません（取得時にHTTP 502）。定義は Excel の表紙シートで確認しました。
- 私（Claude）はブラウザでONSのページを開いたのではなく、GitHub Actions のログに出力された公式ページ・Excelの内容を読んで照合しています。上の「ご自身で見ていただきたい箇所」は、その確認を人の目で行うためのものです。
- ライセンスの読み方は実務上の解釈で、法的助言ではありません（権利記録の `expertReview` は false）。

## 承認する場合の変更（これだけ）
`data/official/onsRent.ts` の次の1行を、レビュー付きのPRで書き換えます。氏名と日付はご自身で入れてください。
```ts
export const ONS_RENT_APPROVAL: RentApproval | null = {
  approvedBy: "<氏名>", approvedAt: "<YYYY-MM-DD>",
  basis: "ONS Manchester page and PIPR workbook (16 Sep 2026 edition, Table 1 row 34163) compared: GBP 1,373, 2026-08, E08000003",
};
```
- 氏名・日付・比較内容のどれかが空だったり、候補が自身の検証に通らない場合は、ビルド時に失敗します。
- 承認後、既存の住居カードの「都市の賃貸市場（全世帯対象・学生寮ではありません）」に、`verified` のカードが1枚出ます。「出典・適用条件を見る」に、出典2か所、対象条件、対象月、取得日・確認日、ライセンスが表示されます。ほかの都市、Planner、比較表、主要数値は変わりません。
- 取り消すには、この値を `null` に戻すだけです。

承認が済むまで、`approvedBy` と `approvedAt` は設定しません。
