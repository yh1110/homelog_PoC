-- HomeLog PoC - Supabase Schema
-- データベーススキーマとRLSポリシー定義

-- ============================================
-- 1. カテゴリマスタテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name_ja TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初期データ投入
INSERT INTO categories (id, name_ja) VALUES
  ('furniture', '家具'),
  ('appliance', '家電')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. アイテムテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id TEXT REFERENCES categories(id) NOT NULL,
  name TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  price NUMERIC(10, 2),
  notes TEXT,

  -- 画像・書類関連
  image_url TEXT,
  warranty_url TEXT,
  receipt_url TEXT,
  manual_url TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- インデックス作成
-- ============================================
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);
CREATE INDEX IF NOT EXISTS items_category_id_idx ON items(category_id);
CREATE INDEX IF NOT EXISTS items_purchase_date_idx ON items(purchase_date DESC);

-- ============================================
-- RLS有効化
-- ============================================
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLSポリシー: SELECT
-- ============================================
DROP POLICY IF EXISTS "Users can view own items" ON items;
CREATE POLICY "Users can view own items"
ON items
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- RLSポリシー: INSERT
-- ============================================
DROP POLICY IF EXISTS "Users can insert own items" ON items;
CREATE POLICY "Users can insert own items"
ON items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RLSポリシー: UPDATE
-- ============================================
DROP POLICY IF EXISTS "Users can update own items" ON items;
CREATE POLICY "Users can update own items"
ON items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- RLSポリシー: DELETE
-- ============================================
DROP POLICY IF EXISTS "Users can delete own items" ON items;
CREATE POLICY "Users can delete own items"
ON items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- 更新日時自動更新トリガー
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_items_updated_at ON items;
CREATE TRIGGER update_items_updated_at
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Storage バケット設定 (手動で実行してください)
-- ============================================
-- 1. Supabase Dashboard → Storage → Create new bucket
-- 2. Bucket name: "item-images"
-- 3. Public bucket: ON

-- Storage RLS ポリシー (Supabase Dashboard → Storage → Policies で設定)
--
-- Policy: "Users can upload own images"
-- INSERT with check:
-- bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy: "Users can view own images"
-- SELECT using:
-- bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]
--
-- Policy: "Users can delete own images"
-- DELETE using:
-- bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]
