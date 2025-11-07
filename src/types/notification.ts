export type NotificationType = "info" | "warning" | "success";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  target_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationRead {
  id: string;
  notification_id: string;
  user_id: string;
  read_at: string;
}

export interface NotificationWithReadStatus extends Notification {
  is_read: boolean;
  read_at?: string;
}
