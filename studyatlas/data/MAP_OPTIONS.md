# 地図の本番対応（Ver.1.3.5）

## 結論
トップページの地図を **サイト同梱の静的SVG（Natural Earth 1:110m の国境、パブリックドメイン）** に切り替え、MapLibre のデモタイルは使わなくなりました。外部への地図リクエスト・APIキー・アカウント・料金・アクセス制限・利用規模の上限は一切ありません（Playwright で表示を確認し、外部リクエスト 0 件）。`maplibre-gl` 依存も削除しました。

## 比較（この環境から公式ページ本文を直接読めたものはなく、WebSearch の要約で確認。確認度を併記）
| 候補 | 利用規約・料金・キー | 出典表示 | 本番（商用）での可否 | 確認度 | 判断 |
|---|---|---|---|---|---|
| MapLibre デモタイル（`demotiles.maplibre.org`、従来） | キー不要。リポジトリの説明は「Demo vector tiles … for web, helloworld and CI tests」。稼働保証・利用条件の記載は確認できず | — | **本番用途ではない**（デモ・CI 用と説明。公式の「本番不可」文言は未確認） | 検索要約 | 廃止 |
| OSM 公式タイル（`tile.openstreetmap.org`） | 寄付で運営。ポリシー上、重い利用は事前許可なしで禁止、商用の本番サイトは自動では許可されず、予告なくブロックされうる。User-Agent と出典表示が必要 | 必須（OpenStreetMap contributors） | 商用常用は不適（代替の OSM 派生サービスか自前ホストを案内） | 検索要約（ポリシーは変更されうる） | 不採用 |
| MapTiler / Stadia / Protomaps（クラウド）等の商用プロバイダー | アカウント登録・APIキー・無料枠の上限・有料契約が必要になる想定 | プロバイダーごとに必須 | 規約・料金・キーの確認と契約が必要 | **未評価**（新しい外部サービスの登録・有料契約を行わない方針のため見送り） | 見送り |
| 自前ホストのタイル（Protomaps PMTiles 等） | 自分で配信するため外部の料金・キーなし。ただしホスティングと OSM データの出典表示（ODbL）が必要で、実装・運用の追加作業が大きい | 必須（OSM） | 可能だが今回の範囲外 | 未評価 | 将来の選択肢 |
| **同梱の静的SVG（Natural Earth）** | 配布条件: Natural Earth は「All versions … are in the public domain … No permission is needed to use Natural Earth. Crediting the authors is unnecessary」（複数のミラーで同文を確認）。変換パッケージ `world-atlas` は ISC ライセンス（LICENSE を同梱パッケージで確認） | 任意（「Made with Natural Earth」。画面に小さく表示） | **可**（外部依存なし） | 検索要約＋パッケージの LICENSE を直接確認 | **採用** |

## 制約と注意
- 道路・地名・ズームでの詳細表示はない（国と都市マーカーだけ）。必要になったら上の「自前ホスト」を検討する。
- 国境は Natural Earth の de facto 方針による粗い背景で、特定の境界についての主張ではない（`data/worldMap.ts` の冒頭に記載）。
- Natural Earth のデータには Washington Post のライセンス（地図作成目的の非独占）に関する注記があり、ベースマップ用途の範囲での利用。
- 再生成: `world-atlas`（countries-110m）＋ `topojson-client` ＋ `d3-geo`（equirectangular）で一度だけ生成。座標変換は `x=(lon+180)*1000/360, y=(90-lat)*1000/360`。
