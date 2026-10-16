# StudyAtlas デプロイ手順（開発・テスト専用 / 非公開）

構成: GitHub（Private）→ Vercel（自動デプロイ）→ Vercel Authenticationで全デプロイを保護

## 0. 事前に必要なもの
- GitHubアカウント（無料でOK）
- Vercelアカウント（無料のHobbyプランでOK。「Continue with GitHub」で作ると連携が楽です）
- Mac上のターミナルと、Git（`git --version` で確認。無ければ `xcode-select --install`）

## 1. GitHubにPrivateリポジトリを作る
1. https://github.com/new を開く
2. Repository name: `studyatlas`
3. **Private** を選択（READMEや.gitignoreの追加はしない）
4. 「Create repository」を押す

## 2. コードをGitHubに送る（Macのターミナル）
ZIPを解凍したフォルダで:
```
cd studyatlas
git init
git add .
git commit -m "Initial commit: StudyAtlas Ver.1.0"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/studyatlas.git
git push -u origin main
```
パスワードを聞かれたら、GitHubのパスワードではなくPersonal Access Token（Settings → Developer settings → Tokens）を使います。

## 3. Vercelにデプロイ
1. https://vercel.com/new を開く
2. 「Import Git Repository」で `studyatlas` を選ぶ（出ない場合は「Adjust GitHub App Permissions」でこのリポジトリを許可）
3. Framework Presetが **Next.js** になっていることを確認し、設定は変えず「Deploy」
4. 環境変数は必須ではありません（任意設定は下記）
5. ビルドが失敗したら、ビルドログの赤いエラー文をそのままClaudeに貼ってください。修正します

## 4. 非公開にする（重要）
1. Vercelのプロジェクト → Settings → **Deployment Protection**
2. **Vercel Authentication** をオン
3. 保護範囲を **All Deployments**（本番を含む全デプロイ）にして保存
4. 確認: ログインしていないブラウザ（シークレットウィンドウ）でURLを開き、Vercelのログイン画面が出ればOK
※ iPhone/iPad/Macでは、同じVercelアカウントでログインすれば開けます。

## 5. 今後の更新の流れ
- コードを変更 → `git add . && git commit -m "説明" && git push`
- pushするとVercelが自動でビルドしてデプロイします（`main`が本番、他ブランチはPreview）
- Claudeに変更を頼む場合は、GitHubをこの環境に連携しておくと同じリポジトリを直接更新できます（claude.aiの設定 → Connectors で GitHub を接続）

## 6. 環境変数（すべて任意）
| 名前 | 用途 | 公開範囲 |
|---|---|---|
| `SEARCH_API_URL` / `SEARCH_API_KEY` | 将来の多言語検索API | サーバー専用 |

## 7. 地図について（Ver.1.3.5 で変更）
- トップページの地図は、サイトに同梱した **静的SVG**（`data/worldMap.ts`）です。地図タイル・外部サービス・APIキー・料金・アクセス制限はありません。以前使っていた MapLibre のデモタイル（`demotiles.maplibre.org`）は本番用ではないため廃止しました。
- 元データは Natural Earth 1:110m の国境（パブリックドメイン。「No permission is needed to use Natural Earth」）。`world-atlas` パッケージ経由で一度だけ変換して同梱しています（再生成の手順は `data/worldMap.ts` の先頭コメント）。
- 国のクリック選択・ハイライト・都市ボタンは同じように動きます。地図は読み込みに失敗しません（失敗時の警告表示は残してあります）。
- 道路や地名の入った地図が必要になった場合は、利用規約・料金・キーの要否・出典表示を確認したうえで、タイル提供元（自前ホストの Protomaps など）を検討してください。OpenStreetMap 公式のタイルサーバーは、商用サイトの常用や大量利用に事前許可が必要です。
