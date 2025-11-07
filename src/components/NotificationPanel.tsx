import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, X, Loader2 } from "lucide-react";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import type { NotificationType } from "@/types/notification";

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationPanel = ({ open, onOpenChange }: NotificationPanelProps) => {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const unreadNotifications = notifications.filter((n) => !n.is_read);

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              通知一覧
            </SheetTitle>
            {unreadNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsReadMutation.isPending}
              >
                {markAllAsReadMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                すべて既読
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p>読み込み中...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>お知らせはありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    notification.is_read
                      ? "bg-background border-border hover:bg-accent/50"
                      : "bg-accent/10 border-primary/20 hover:bg-accent/20"
                  }`}
                  onClick={() =>
                    handleNotificationClick(
                      notification.id,
                      notification.is_read
                    )
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant={getNotificationVariant(notification.type)}
                          className="text-xs"
                        >
                          {getNotificationTypeLabel(notification.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(notification.created_at),
                            {
                              addSuffix: true,
                              locale: ja,
                            }
                          )}
                        </span>
                        {!notification.is_read && (
                          <span className="h-2 w-2 rounded-full bg-primary"></span>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

function getNotificationVariant(
  type: NotificationType
): "default" | "destructive" | "secondary" | "outline" {
  switch (type) {
    case "success":
      return "default";
    case "warning":
      return "secondary";
    case "info":
      return "default";
    default:
      return "outline";
  }
}

function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case "success":
      return "お知らせ";
    case "warning":
      return "重要";
    case "info":
      return "お知らせ";
    default:
      return "お知らせ";
  }
}

export default NotificationPanel;
