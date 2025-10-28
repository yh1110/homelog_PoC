# HomeLog PoC - Supabase統合セットアップガイド

このガイドでは、Phase3（Supabase統合）後のセットアップ手順を説明します。

## 前提条件

- Node.js 18.x 以上
- Supabaseアカウント
- Supabaseプロジェクトが作成済み

## 1. データベースのセットアップ

### ステップ 1-1: SQLスキーマの実行

1. Supabase Dashboard にログイン
2. 左メニューから「SQL Editor」を選択
3. プロジェクトルートの `supabase_schema.sql` ファイルの内容をコピー
4. SQL Editorに貼り付けて実行

これにより以下が作成されます：
- `items` テーブル
- インデックス（パフォーマンス最適化用）
- RLSポリシー（セキュリティ）
- 更新日時自動更新トリガー

### ステップ 1-2: Storageバケットの作成

1. Supabase Dashboard → Storage
2. 「Create a new bucket」をクリック
3. 設定：
   - Bucket name: `item-images`
   - Public bucket: `ON`
4. 「Create bucket」をクリック

### ステップ 1-3: Storage RLSポリシーの設定

1. Storage → item-images → Policies
2. 以下の3つのポリシーを作成：

**ポリシー1: Upload (INSERT)**
```sql
bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

**ポリシー2: View (SELECT)**
```sql
bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

**ポリシー3: Delete (DELETE)**
```sql
bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]
```

## 2. アプリケーションのセットアップ

### ステップ 2-1: 依存関係のインストール

```bash
npm install
```

### ステップ 2-2: 環境変数の設定

`.env.local` ファイルは既に存在しますが、内容を確認してください：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

これらの値はSupabase Dashboard → Settings → API から取得できます。

## 3. アプリケーションの起動

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### 初回セットアップ

1. 「新規登録」タブからアカウントを作成
2. 確認メールが送信されます（開発環境では自動確認される場合があります）
3. ログインしてアプリケーションを使用開始

## 4. 機能の確認

### 認証機能
- [ ] 新規登録ができる
- [ ] ログインができる
- [ ] ログアウトができる
- [ ] 未認証時に認証ページへリダイレクトされる

### アイテム管理機能
- [ ] アイテムの追加ができる
- [ ] アイテムの一覧が表示される
- [ ] アイテムの詳細が表示される
- [ ] アイテムの削除ができる

### 画像機能
- [ ] 画像をアップロードできる
- [ ] アップロードした画像が表示される
- [ ] アイテム削除時に画像も削除される

### データ分離
- [ ] 他のユーザーのデータが表示されない
- [ ] 別アカウントでログインすると異なるデータが表示される

## 5. トラブルシューティング

### エラー: "Invalid API key"
- `.env.local` の `VITE_SUPABASE_ANON_KEY` が正しいか確認
- 開発サーバーを再起動

### エラー: "relation items does not exist"
- `supabase_schema.sql` を実行したか確認
- SQL Editor でエラーが出ていないか確認

### 画像アップロードエラー
- `item-images` バケットが作成されているか確認
- Storage RLSポリシーが設定されているか確認
- ファイルサイズが5MB以下か確認

### データが表示されない
- RLSポリシーが正しく設定されているか確認
- ブラウザのコンソールにエラーが出ていないか確認
- `auth.uid()` が正しく取得できているか確認

## 6. 本番デプロイ

### Vercel / Netlify デプロイ

1. 環境変数を設定：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. ビルドコマンド：
```bash
npm run build
```

3. 出力ディレクトリ：
```
dist
```

### Supabase 設定

1. Authentication → URL Configuration
   - Site URL: デプロイ先のURL
   - Redirect URLs: デプロイ先のURL + `/auth`

## 7. データベース管理

### データのバックアップ

Supabase Dashboard → Database → Backups から自動バックアップを設定できます。

### データのエクスポート

```sql
-- CSV形式でエクスポート
COPY (SELECT * FROM items) TO STDOUT WITH CSV HEADER;
```

### データのインポート

Supabase Dashboard → Table Editor → Import から CSV/JSONをインポートできます。

## 8. セキュリティのベストプラクティス

- ✅ RLSポリシーを必ず有効化
- ✅ 環境変数をGitにコミットしない
- ✅ ANON KEYのみをクライアントで使用
- ✅ SERVICE KEYは絶対にクライアントに露出しない
- ✅ 定期的にSupabaseのセキュリティログを確認

## 9. 次のステップ

- [ ] メール認証の設定をカスタマイズ
- [ ] パスワードリセット機能の実装
- [ ] プロフィール編集機能の追加
- [ ] アイテムの編集機能の追加
- [ ] カテゴリのカスタマイズ機能
- [ ] エクスポート機能（CSV/JSON）
- [ ] PWA対応
- [ ] オフライン対応

## サポート

問題が解決しない場合：
- Supabase公式ドキュメント: https://supabase.com/docs
- プロジェクトIssues: GitHub Issues
