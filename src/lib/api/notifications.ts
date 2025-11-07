import supabase from "@/lib/supabase";
import type {
  Notification,
  NotificationRead,
  NotificationWithReadStatus,
} from "@/types/notification";

/**
 * お知らせ一覧を取得（既読状態含む）
 */
export async function getNotifications(): Promise<
  NotificationWithReadStatus[]
> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // お知らせを取得
  const { data: notifications, error: notificationsError } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (notificationsError) throw notificationsError;

  // 既読情報を取得
  const { data: reads, error: readsError } = await supabase
    .from("notification_reads")
    .select("*")
    .eq("user_id", user.id);

  if (readsError) throw readsError;

  // 既読情報をマップ化
  const readsMap = new Map(
    (reads || []).map((read) => [read.notification_id, read])
  );

  // お知らせに既読状態を付与
  return (notifications || []).map((notification) => {
    const read = readsMap.get(notification.id);
    return {
      ...notification,
      is_read: !!read,
      read_at: read?.read_at,
    };
  });
}

/**
 * 未読件数を取得
 */
export async function getUnreadCount(): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 全お知らせを取得
  const { data: notifications, error: notificationsError } = await supabase
    .from("notifications")
    .select("id");

  if (notificationsError) throw notificationsError;
  if (!notifications || notifications.length === 0) return 0;

  const notificationIds = notifications.map((n) => n.id);

  // 既読済みのお知らせIDを取得
  const { data: reads, error: readsError } = await supabase
    .from("notification_reads")
    .select("notification_id")
    .eq("user_id", user.id)
    .in("notification_id", notificationIds);

  if (readsError) throw readsError;

  const readIds = new Set((reads || []).map((r) => r.notification_id));
  return notificationIds.filter((id) => !readIds.has(id)).length;
}

/**
 * お知らせを既読にする
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("notification_reads").insert({
    notification_id: notificationId,
    user_id: user.id,
  });

  if (error) {
    // 既に既読の場合はエラーを無視
    if (error.code === "23505") return; // unique constraint violation
    throw error;
  }
}

/**
 * すべてのお知らせを既読にする
 */
export async function markAllAsRead(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 全お知らせを取得
  const { data: notifications, error: notificationsError } = await supabase
    .from("notifications")
    .select("id");

  if (notificationsError) throw notificationsError;
  if (!notifications || notifications.length === 0) return;

  // 既読情報を一括挿入（重複は無視）
  const reads = notifications.map((notification) => ({
    notification_id: notification.id,
    user_id: user.id,
  }));

  const { error } = await supabase.from("notification_reads").upsert(reads, {
    onConflict: "notification_id,user_id",
    ignoreDuplicates: true,
  });

  if (error) throw error;
}

/**
 * お知らせを削除（既読情報も削除される）
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 既読情報を削除
  const { error: readError } = await supabase
    .from("notification_reads")
    .delete()
    .eq("notification_id", notificationId)
    .eq("user_id", user.id);

  if (readError) throw readError;

  // お知らせ自体は削除しない（管理者のみが削除可能）
  // ユーザー側では既読情報を削除することで「非表示」扱いにする
}
