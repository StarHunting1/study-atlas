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
| `NEXT_PUBLIC_MAP_STYLE_URL` | 地図スタイルのURL（未設定ならMapLibreのデモ） | ブラウザに公開される（秘密キーは入れない） |
| `SEARCH_API_URL` / `SEARCH_API_KEY` | 将来の多言語検索API | サーバー専用 |

## 7. 地図タイルについて
- 既定は `https://demotiles.maplibre.org/style.json`（APIキー不要）。開発・動作確認用のデモ用途です。**利用条件・稼働保証は、この環境から公式ページを確認できていません**。本番や多人数利用の前にMapLibreの公式情報で確認してください。
- このデモスタイルは国境データを含むため、国のクリック選択・ハイライトが動きます。
- 別のタイル提供元（MapTiler、Protomapsなど）へ切り替える場合は、利用規約・料金・キーの要否を確認し、`NEXT_PUBLIC_MAP_STYLE_URL` を設定します。ただし国クリックの処理（`components/WorldMap.tsx`）は、そのスタイルの国境レイヤー名に合わせて調整が必要です。ドメイン制限付きのキーを使う場合は、Vercelのドメインを許可してください。
- 地図が読み込めないときは、警告を表示し、国ボタン・都市一覧・検索から同じ操作ができます。
