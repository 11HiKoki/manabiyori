# まなびより

気づきと人との記録帳。

## アプリの目的

仕事とプライベートで得た気づき、学び、失敗、教訓を記録し、週・月・年単位で振り返って次の行動に活かすためのアプリです。

人物プロフィールと会話メモも残せるため、人との関わりから見えたことも後から振り返れます。

## 主な機能

- Supabase Auth による新規登録、ログイン、ログアウト
- 通常メモの登録、一覧、詳細、編集、削除
- 種別と感情の複数選択
- 週・月・年の振り返り
- 週の開始日設定（月曜日 / 日曜日）
- 人物プロフィールの登録、一覧、詳細、編集、削除
- 人物ごとの会話メモ履歴の追加、一覧、編集、削除

## 技術構成

- Expo
- React Native
- TypeScript
- Supabase Auth
- Supabase Database
- AsyncStorage

## セットアップ方法

```bash
npm install
```

Supabase 側では `supabase/schema.sql` を実行して、必要なテーブルとRLSポリシーを作成します。

既存DBで `memos.type` / `memos.emotion` から `memos.types` / `memos.emotions` へ移行する場合は、`supabase/alter_memos_types_emotions.sql` を使います。

## .env の設定方法

`.env.example` を参考に、プロジェクトルートに `.env` を作成します。

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

アプリで使うキーは Supabase の anon public key のみです。`service_role` key は使いません。

## 起動方法

```bash
npm start
```

Webで確認する場合:

```bash
npm run web
```

型チェック:

```bash
npm run typecheck
```

## Web公開

Expo Webの本番ビルド:

```bash
npm run build:web
```

ビルド結果は `dist` に出力されます。

Vercelで公開する場合:

- Build Command: `npm run build:web`
- Output Directory: `dist`
- Environment Variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Netlifyで公開する場合:

- Build Command: `npm run build:web`
- Publish Directory: `dist`
- Environment Variables:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

`.env` はGit管理せず、公開先の管理画面で環境変数を設定します。

## Supabaseで必要なテーブル

- `memos`
- `tags`
- `memo_tags`
- `reflection_notes`
- `people`
- `conversation_notes`

現時点では `tags` / `memo_tags` / `reflection_notes` の保存処理は未実装です。

## 注意点

- RLSにより、基本的にログイン中ユーザー本人のデータだけを操作します。
- `.env` はGit管理しません。
- DB構造を変更した場合は、`src/supabase/types.ts` も合わせて更新してください。
- 週の開始日は端末内のAsyncStorageに保存します。

## 今後追加したい機能候補

- タグ登録とタグ検索
- 振り返りコメントのSupabase保存
- 共有機能
- 人物プロフィールへの会話メモ内容の反映
- 通知やリマインダー
- エクスポート
