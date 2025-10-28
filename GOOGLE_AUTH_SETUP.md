# Google OAuth 認証セットアップガイド

HomeLogアプリケーションでGoogle OAuth認証を設定する手順です。

## 1. Google Cloud Console でOAuth設定

### ステップ 1-1: プロジェクト作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. プロジェクト名: `HomeLog` など任意の名前

### ステップ 1-2: OAuth同意画面の設定

1. 左メニューから「APIとサービス」→「OAuth同意画面」を選択
2. User Type: **外部** を選択（個人開発の場合）
3. 「作成」をクリック

**必須項目を入力:**
- アプリ名: `HomeLog`
- ユーザーサポートメール: 自分のメールアドレス
- デベロッパーの連絡先情報: 自分のメールアドレス

4. スコープ: デフォルトのまま（追加不要）
5. テストユーザー: 開発中は自分のGoogleアカウントを追加
6. 「保存して次へ」→「ダッシュボードに戻る」

### ステップ 1-3: 認証情報の作成

1. 左メニューから「APIとサービス」→「認証情報」を選択
2. 「認証情報を作成」→「OAuthクライアントID」をクリック
3. アプリケーションの種類: **ウェブアプリケーション**
4. 名前: `HomeLog Web Client`

**承認済みのリダイレクトURIを追加:**
```
https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
```

例: `https://rtzmnlluysnyifapxquz.supabase.co/auth/v1/callback`

5. 「作成」をクリック
6. **クライアントID**と**クライアントシークレット**をコピーして保存

## 2. Supabase でGoogle OAuth設定

### ステップ 2-1: 認証プロバイダーの有効化

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクトを選択
3. 左メニューから「Authentication」→「Providers」を選択
4. 「Google」を選択

### ステップ 2-2: Google認証情報の設定

**入力項目:**
- Google enabled: **ON**にする
- Client ID (for OAuth): Google Cloud Consoleでコピーした**クライアントID**を貼り付け
- Client Secret (for OAuth): Google Cloud Consoleでコピーした**クライアントシークレット**を貼り付け

5. 「Save」をクリック

### ステップ 2-3: Site URLとRedirect URLsの設定

1. 「Authentication」→「URL Configuration」を選択
2. **Site URL**:
   - 開発環境: `http://localhost:5173`
   - 本番環境: デプロイ先のURL（例: `https://homelog.vercel.app`）
3. **Redirect URLs**:
   - 開発環境: `http://localhost:5173/`
   - 本番環境: デプロイ先のURL（例: `https://homelog.vercel.app/`）

## 3. 動作確認

### 開発環境での確認

1. アプリケーションを起動:
```bash
npm run dev
```

2. ブラウザで `http://localhost:5173` を開く
3. 自動的に `/auth` ページにリダイレクトされる
4. 「Googleでログイン」ボタンをクリック
5. Googleアカウント選択画面が表示される
6. アカウントを選択してログイン
7. ログイン成功後、メインページにリダイレクトされる

### 確認項目

- [ ] Googleログインボタンが表示される
- [ ] ボタンをクリックするとGoogle認証画面が開く
- [ ] 認証後にアプリケーションに戻る
- [ ] ログイン状態が保持される
- [ ] ヘッダーにユーザーメールアドレスが表示される
- [ ] ログアウトできる

## 4. 本番環境デプロイ時の追加設定

### Vercel / Netlify デプロイ時

1. **Google Cloud Console**:
   - 承認済みのリダイレクトURIに本番URLを追加:
   ```
   https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
   ```

2. **Supabase Dashboard**:
   - Site URLを本番URLに変更
   - Redirect URLsに本番URLを追加

3. **環境変数**（デプロイ先で設定）:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## 5. トラブルシューティング

### エラー: "redirect_uri_mismatch"

**原因**: Google Cloud ConsoleのリダイレクトURIが間違っている

**解決方法**:
1. Google Cloud Console → 認証情報 → OAuthクライアントIDを開く
2. 承認済みのリダイレクトURIに正しいSupabase CallbackURLを追加:
   ```
   https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback
   ```
3. 保存して数分待つ（反映に時間がかかる場合がある）

### エラー: "access_denied"

**原因**: OAuth同意画面が未公開 または テストユーザーに追加されていない

**解決方法**:
1. Google Cloud Console → OAuth同意画面
2. 公開ステータスを確認
3. 開発中の場合: テストユーザーに自分のGoogleアカウントを追加

### ログイン後に白い画面が表示される

**原因**: Supabaseの Site URL / Redirect URLs が正しく設定されていない

**解決方法**:
1. Supabase Dashboard → Authentication → URL Configuration
2. Site URLとRedirect URLsを確認
3. 開発環境: `http://localhost:5173` と `http://localhost:5173/`
4. 本番環境: 実際のデプロイURLを設定

### "Invalid client ID"エラー

**原因**: SupabaseにGoogle認証情報が正しく設定されていない

**解決方法**:
1. Supabase Dashboard → Authentication → Providers → Google
2. Client IDとClient Secretを再確認
3. Google Cloud Consoleで作成した正しい値が入力されているか確認

## 6. セキュリティのベストプラクティス

- ✅ Client Secretは絶対に公開しない（Supabaseのみに保存）
- ✅ 本番環境では承認済みリダイレクトURIを厳密に設定
- ✅ OAuth同意画面で必要最小限のスコープのみ要求
- ✅ 開発中はテストユーザーのみに限定
- ✅ 本番公開時は「本番環境」に移行してレビュー申請

## 7. 参考リンク

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## 次のステップ

Google認証が正常に動作したら:
- [ ] データベーススキーマを実行 (`supabase_schema.sql`)
- [ ] Storageバケットを作成 (`item-images`)
- [ ] アイテムのCRUD操作を確認
- [ ] 画像アップロード機能を確認
