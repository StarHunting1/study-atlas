# トラックパッド操作（Ver.1.3.7c）

PC のトラックパッド（MacBook など）で、**2本指スワイプ＝地図を上下左右に移動**、**2本指ピンチ＝拡大縮小**、マウスドラッグ＝移動、マウスホイール＝ズーム（従来どおり）。スマホ・iPad のタッチ操作は変更なし（`(pointer: coarse)` では処理を入れない）。地図の外ではページが通常どおりスクロールする（処理は地図の要素にだけ付けている）。

- 実装: `lib/wheel.ts`（判定）＋ `components/InteractiveMap.tsx`（地図の要素に wheel を capture で登録。スワイプと判定したイベントだけ止めて `panBy`、それ以外は MapLibre の既存のズームに渡す）。Safari のピンチは gesture イベントで処理。
- 判定: ①Ctrl 付き＝ピンチ（Chrome/Edge/Firefox はトラックパッドのピンチを ctrl+wheel で送る）→ズーム。②⌘/Option を押しながら＝ズーム。③ホイール1ノッチ（Firefox の行/ページ単位、または縦方向のみで `wheelDeltaY` が120の倍数、`wheelDeltaY` が無い環境では50px以上の整数）→ズーム。④それ以外（横成分あり、小さい値・小数、スワイプ直後の慣性）→移動。スワイプ開始後220msは慣性として「移動」を維持し、途中でズームに切り替わらない。
- **制約（完全には区別できない）**: ブラウザはトラックパッドとマウスを同じ wheel イベントで送るため推定です。**macOS では多くのマウスのホイールが小さい連続値を送り、トラックパッドと見分けられない**ため、その場合は「移動」になります（Windows/Linux の一般的なマウスや Firefox の行単位は「ズーム」）。そのときは **⌘ または Option を押しながらスクロール**、または地図右上の＋/−でズームできます。
- 確認: 判定ロジックのテスト（`tests/wheel.test.ts`）と、ヘッドレス Chromium での合成 wheel イベント（スワイプで中心が移動しズームは不変、ピンチでズーム、実マウスホイールでズーム、地図の外でページがスクロール、ドラッグ移動、タッチ環境では処理なし）。**実機（MacBook のトラックパッド）での確認はできていません。**

---

# 地図の見た目の改善（Ver.1.3.7b）

## 色が乏しくなった原因
1. **スタイルの選択**: Ver.1.3.7 で使った OpenFreeMap の `positron` は、もともと白〜灰色の**モノトーン**のスタイル（背景用の落ち着いた地図）で、海・陸・国境の色の差が小さい。色が乏しく見えたのは CSS ではなく、このスタイルの設計による。
2. **国の強調がなくなった**: Ver.1.3.5 の SVG 地図は対応国を青く塗っていたが、タイル地図には国ポリゴンがなく（タイルは国境の「線」のみ）、選択国・対応国の塗り分けが無くなった。
3. **ピン**: 小さい青い点（白縁のみ）で、灰色の背景では目立たない一方、同色系の国バッジと区別しにくかった。
4. **フォールバックSVG**: 水色（sky-50）と灰色の陸地で、タイル地図と配色が揃っていなかった。

## 実施した改善
- **スタイルを `liberty`（OpenFreeMap の標準的なカラースタイル）に変更**。低倍率では Natural Earth の陰影起伏、拡大すると OSM のベクターが表示される。
- **ベクターレイヤーを描画内容ごとに再配色**（`lib/mapStyle.ts`。レイヤーIDではなく source-layer と種類で判定）: 背景=ベージュ `#efe8d6`、海・河川=落ち着いた青 `#a9cde3`、森=緑 `#cddfba`、草地 `#dce8c9`、公園 `#cfe2bd`、**国境=濃い茶 `#6b604b`（太め）**、州境=薄い茶 `#b9ae98`、係争線は国境とは別扱い。CI の実描画で、`boundary_2`/`boundary_3`/`water`/`park`/`landcover_*`/`waterway_*`/`background` に反映されていることを確認（run 38915334147 以降の出力）。
- **国の強調**: Natural Earth 1:110m の国境（パブリックドメイン）から対応国のGeoJSONを同梱（`data/countryShapes.ts`、約50KB、外部通信なし）し、対応国は緑の薄い塗り＋輪郭、**選択中の国は濃い塗り＋紺の太い輪郭**。拡大すると塗りは消え、タイル自身の国境に切り替わる。
- **ピン**: 白い縁と影つきの紺の丸。選択国の都市は大きな緑のリング、選択中の都市は紺の二重リングで常に名前を表示。他の国のピンは通常サイズ。国バッジ（件数）も選択国では緑。
- **フォールバックSVG**も同じ配色（海＝青、陸＝ベージュ、対応国＝緑、選択国＝濃い緑＋紺の輪郭、ピン＝紺）で、国・都市の選択に合わせて拡大し、都市名を表示。
- **OpenFreeMap の帰属表示・利用条件は維持**（スタイルの帰属表示は MapLibre が自動表示。小さい画面では (i) ボタンの裏に折りたたみ、ページ下部に常時表示）。

## 国選択と地図の連動
- 国ボタン／国バッジ／地図上の国の塗り → `fitBounds`（国の輪郭と登録都市がすべて入る範囲、余白は画面サイズに応じて 28〜110px、最大ズーム 6.5）。
- 都市の選択 → `flyTo`（ズーム 8.5。スマホでは都市カードに隠れないよう下に余白）。「国の一覧に戻る」→ 世界全体（スマホ幅でも収まるよう最小ズームを −1 に設定）。
- 選択中の国の都市ピンを強調、都市一覧は選択国に合わせて更新。

## 言語
- StudyAtlas の国名・都市名は `lib/names.ts`（データの翻訳）の1か所から表示: 日本語＝カナダ／イギリス／オーストラリア、英語＝Canada／United Kingdom／Australia。コンポーネントへの直書きはテストで禁止。英語の検索ヒントの「UK」も「United Kingdom」に統一。
- **背景タイル内の地名**: OpenFreeMap のタイルは `name:ja` / `name:en` などの言語別の名前を持つため、言語切替時に地名レイヤーの `text-field` を `name:ja`（日本語）／`name:en`（英語）に切り替え、無い場合は `name:latin` → `name` にフォールバック（空の地名にならない）。日本語のグリフは公式フォントサーバーで確認済み（`Noto Sans Regular` の 12288–12543 と 19968–20223 が 200）。名前の無い地物は現地語のまま表示される（タイル側の仕様）。切替を止めたい場合は `NEXT_PUBLIC_MAP_JA_LABELS=0`。

## 実際の描画確認（外部通信ができる GitHub Actions 上のヘッドレス Chromium）
- **OpenFreeMap の実タイルが描画されることを確認**（`data-map-state="idle"`、帰属表示 “OpenFreeMap © OpenMapTiles Data from OpenStreetMap”）。スマホ390・iPad820・PC1280で確認。サンドボックス（開発環境）は外部に接続できないため、この確認は CI の実行（run 38917499385 以降）で行った。

---

# 地図の本番対応（Ver.1.3.7 で更新）

## 現状（Ver.1.3.7）
トップページの地図を、**MapLibre GL JS ＋ OpenFreeMap（無料の公開ベクタータイル）** のインタラクティブ地図に戻しました（ドラッグ移動・スクロール/ピンチでズーム・都市ピン・ピン選択で都市カード・一覧やカード選択で該当都市へ移動）。タイルに接続できない場合（またはWebGLが使えない場合）は、Ver.1.3.5 の同梱SVG地図に自動で切り替わり、都市探索は止まりません。MapLibre のデモタイルは使っていません。有料契約・APIキー・アカウント登録は不要です。

### OpenFreeMap の確認結果（公式ページ・Actions run 38911674070、2026-10-16 に各ページ1回取得）
| 項目 | 公式の記載・確認結果 |
|---|---|
| 商用利用 | 公式トップの FAQ「Is commercial usage allowed? **Yes.**」 |
| 料金・上限 | 「Using our public instance is completely free: there are **no limits on the number of map views or requests**.」 |
| APIキー・登録 | 「There's no registration, no user database, no API keys, and no cookies.」 |
| 帰属表示 | 「**Attribution is required.** If you are using MapLibre, they are automatically added」。表示文言: 「OpenFreeMap © OpenMapTiles Data from OpenStreetMap」（OpenFreeMap の部分は任意）。本サイトでは地図内の帰属表示（MapLibre が自動表示）に加え、ページ下部にも表示 |
| 利用規約 | https://openfreemap.org/tos/（2026-10-14 更新）: 「completely free service provided “as-is,” with no warranties」。可用性の保証なし（SLAなし）。**これが唯一のリスク**で、接続できない場合は同梱SVG地図に切り替わる |
| 運営・費用 | 寄付・サポートプランで運営（Hyperknot Software）。自前ホスト用の週次プラネットダウンロードもある（将来の選択肢） |
| 動作確認 | スタイル `https://tiles.openfreemap.org/styles/positron`・TileJSON・世界タイル1枚がすべて 200、`access-control-allow-origin: *`（ブラウザから利用可）。タイルは `max-age=315360000` で長期キャッシュ |
| オフライン保存 | 1回3,000タイルまたは50MBまで可（本サイトでは使用しない） |

### VersaTiles との比較（採用せず）
公式トップ: 「no API keys, charges no usage fees, and does not track your users」「free of any commercial interests」。スタイル（`/assets/styles/colorful/style.json`）とタイル（`/tiles/osm/2/1/1`）は 200・CORS 可で、**同じく利用可能な代替**。ただし利用条件の専用ページ（docs の use_tiles ページは 404）と帰属表示の文言を公式ページで確認できなかったため、第一候補にはしていない。OpenFreeMap が止まった場合の切替先候補（`NEXT_PUBLIC_MAP_STYLE_URL` で差し替え可能）。

### 設定・運用
- 既定スタイル: OpenFreeMap `liberty`（Ver.1.3.7b で positron から変更）。`NEXT_PUBLIC_MAP_STYLE_URL` で別スタイルに変更できる（ブラウザに公開されるため秘密キーは入れない）。
- 接続失敗の判定: スタイル取得エラー、または9秒以内に読み込みが終わらない場合。失敗時は画面上部に「簡易地図を表示しています」と表示。
- スマホ（タッチ端末）では2本指で地図を動かす設定（ページのスクロールを妨げないため）。キーボードは地図の矢印キー・＋/−、ピンはタブで移動して Enter。
- 同じ国の近いピン（画面上で44px未満）は国のバッジ（件数つき）にまとめ、押すとその国の都市が見えるまでズームする。

---

# 以前の記録（Ver.1.3.5）

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
