# 家具家電管理 (HomeLog PoC)

家具・家電の購入情報を一元管理するWebアプリケーションです。購入日、価格、保証期間などを記録し、簡単に検索・閲覧できます。

## 特徴

- **カテゴリ別管理**: 家具・家電をカテゴリごとに整理
- **統計情報**: 月別購入額のグラフ表示、総支出・アイテム数の集計
- **検索機能**: 商品名から素早く検索
- **詳細記録**: 購入日、価格、メモ、保証期間などを記録
- **レスポンシブデザイン**: モバイル・デスクトップ両対応

## 技術スタック

### フロントエンド

- **React 18.3** - UIライブラリ
- **TypeScript 5.8** - 型安全な開発
- **Vite 5.4** - 高速ビルドツール
- **React Router 6.30** - ルーティング
- **TanStack Query 5.83** - サーバーステート管理

### UIコンポーネント

- **shadcn/ui** - Radix UIベースのコンポーネントライブラリ
- **Tailwind CSS 3.4** - ユーティリティファーストCSS
- **Lucide React** - アイコンセット
- **Recharts 2.15** - グラフ描画

### フォームとバリデーション

- **React Hook Form 7.61** - フォーム管理
- **Zod 3.25** - スキーマバリデーション

## プロジェクト構造

```text
homelog_PoC/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui コンポーネント
│   │   ├── AddItemDialog.tsx    # アイテム追加ダイアログ
│   │   ├── CategoryTab.tsx      # カテゴリ別タブ
│   │   ├── Header.tsx           # ヘッダーコンポーネント
│   │   ├── HomeTab.tsx          # ホームタブ
│   │   ├── ItemCard.tsx         # アイテムカード
│   │   ├── ItemDetailDialog.tsx # 詳細表示ダイアログ
│   │   ├── ItemList.tsx         # アイテム一覧
│   │   ├── MonthlyPurchaseChart.tsx  # 月別購入グラフ
│   │   ├── SearchDialog.tsx     # 検索ダイアログ
│   │   └── StatisticsCards.tsx  # 統計カード
│   ├── hooks/
│   │   ├── use-mobile.tsx   # モバイル判定フック
│   │   └── use-toast.ts     # トースト通知フック
│   ├── lib/
│   │   └── utils.ts         # ユーティリティ関数
│   ├── pages/
│   │   ├── Index.tsx        # メインページ
│   │   └── NotFound.tsx     # 404ページ
│   ├── App.tsx              # アプリケーションルート
│   └── main.tsx             # エントリーポイント
├── public/                  # 静的ファイル
├── index.html
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## セットアップ

### 前提条件

- Node.js 18.x 以上
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone <YOUR_GIT_URL>
cd homelog_PoC

# 依存関係のインストール
npm install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

### ビルド

```bash
# 本番用ビルド
npm run build

# 開発モードでビルド
npm run build:dev
```

### プレビュー

```bash
npm run preview
```

### リント

```bash
npm run lint
```

## 主な機能

### アイテム管理

- アイテムの追加、閲覧、削除
- 商品名、カテゴリ、購入日、価格、メモの記録

### カテゴリ表示

- ホーム: 全アイテムの一覧と統計
- 家具: 家具カテゴリのアイテム
- 家電: 家電カテゴリのアイテム

### 統計情報

- 総支出額の表示
- アイテム数の集計
- 月別購入額のグラフ表示

### 検索機能

- 商品名による検索（準備中）

## データモデル

```typescript
interface Item {
  id: string;
  name: string;
  category: "furniture" | "appliance";
  purchaseDate: string;
  price: number;
  notes?: string;
}
```

## 今後の拡張予定

- [ ] データの永続化（localStorage/IndexedDB）
- [ ] 写真アップロード機能
- [ ] レシート画像からの自動読み取り
- [ ] 保証期間の通知機能
- [ ] エクスポート機能（CSV/JSON）
- [ ] カテゴリのカスタマイズ
- [ ] 詳細検索・フィルター機能

## Lovableプロジェクト情報

このプロジェクトは[Lovable](https://lovable.dev)を使用して開発されています。

**プロジェクトURL**: <https://lovable.dev/projects/5cbb1283-8121-4935-8d3d-7fcb38cec0bc>

### Lovableでの編集

Lovableプロジェクトページから直接編集できます。変更は自動的にこのリポジトリにコミットされます。

### カスタムドメインの接続

Project > Settings > Domainsから独自ドメインを接続できます。

詳細: [カスタムドメインの設定](https://docs.lovable.dev/features/custom-domain#custom-domain)

## ライセンス

Private

---

**Note**: これはProof of Concept（PoC）版です。実用化に向けてデータベース連携やバックエンドAPIの実装を検討中です。
