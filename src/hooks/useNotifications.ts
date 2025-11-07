import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/api/notifications";
import { toast } from "sonner";

/**
 * お知らせ一覧を取得
 */
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    staleTime: 1000 * 60, // 1分
  });
}

/**
 * 未読件数を取得
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    staleTime: 1000 * 30, // 30秒
  });
}

/**
 * お知らせを既読にする
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * すべてのお知らせを既読にする
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("すべてのお知らせを既読にしました");
    },
    onError: (error) => {
      console.error("Mark all as read error:", error);
      toast.error("既読処理に失敗しました");
    },
  });
}
