-- お知らせテーブル
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- お知らせ内容
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success'

  -- ターゲット設定（nullの場合は全ユーザー向け）
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 既読管理テーブル
CREATE TABLE IF NOT EXISTS public.notification_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 同じユーザーが同じ通知を複数回既読にできないようにする
  UNIQUE(notification_id, user_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_target_user_id_idx ON public.notifications(target_user_id);
CREATE INDEX IF NOT EXISTS notification_reads_user_id_idx ON public.notification_reads(user_id);
CREATE INDEX IF NOT EXISTS notification_reads_notification_id_idx ON public.notification_reads(notification_id);

-- RLS有効化
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 全ユーザー向けまたは自分宛のお知らせを閲覧可能
CREATE POLICY "Users can view relevant notifications" ON public.notifications
  FOR SELECT TO authenticated USING (
    target_user_id IS NULL OR target_user_id = auth.uid()
  );

-- RLSポリシー: サービスロールのみがお知らせを作成可能（管理者用）
CREATE POLICY "Service role can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- RLSポリシー: サービスロールのみがお知らせを更新可能
CREATE POLICY "Service role can update notifications" ON public.notifications
  FOR UPDATE USING (true);

-- RLSポリシー: サービスロールのみがお知らせを削除可能
CREATE POLICY "Service role can delete notifications" ON public.notifications
  FOR DELETE USING (true);

-- RLSポリシー: ユーザーは自分の既読情報を閲覧可能
CREATE POLICY "Users can view own reads" ON public.notification_reads
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RLSポリシー: ユーザーは自分の既読情報を作成可能
CREATE POLICY "Users can insert own reads" ON public.notification_reads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLSポリシー: ユーザーは自分の既読情報を削除可能
CREATE POLICY "Users can delete own reads" ON public.notification_reads
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- updated_at自動更新トリガー
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
