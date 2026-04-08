import { useState, useEffect } from "react";
import { Bell, Check, Trash2, ExternalLink } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  notificationService, 
  AppNotification
} from "@/lib/api/notificationService";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ar, fr, enUS } from "date-fns/locale";
import { Link } from "react-router-dom";

const NotificationDropdown = () => {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const getLocale = () => {
    if (language === "ar") return ar;
    if (language === "fr") return fr;
    return enUS;
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Fetch the most recent 5 notifications for the dropdown list
      const data = await notificationService.fetchNotifications({ page_size: 5 });
      setNotifications(data.results);
      
      // Fetch the total count of unread notifications using the filter
      const unreadData = await notificationService.fetchNotifications({ 
        is_read: "false", 
        page_size: 1 
      });
      setUnreadCount(unreadData.count);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);

    const disconnect = notificationService.connectToRealtimeNotifications((incoming) => {
      setNotifications((prev) => [incoming, ...prev].slice(0, 5));
      setUnreadCount((prev) => prev + 1);
      toast.message(incoming.message || t("notifications.title"));
    });

    return () => {
      clearInterval(interval);
      disconnect();
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Re-fetch to keep count accurate if needed
      fetchNotifications();
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success(t("notifications.markAllAsRead"));
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl outline-none ring-0 focus:ring-0">
          <Bell className="h-[1.1rem] w-[1.1rem]" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 sm:w-96" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-heading font-semibold">{t("notifications.title")}</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs text-primary"
              onClick={handleMarkAllRead}
            >
              {t("notifications.markAllAsRead")}
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          <div className="flex flex-col">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                  <Bell className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("notifications.empty")}
                </p>
                <p className="px-6 mt-1 text-xs text-muted-foreground">
                  {t("notifications.emptyDesc")}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`group relative flex flex-col gap-1 border-b p-4 transition-colors hover:bg-muted/50 ${
                    !notification.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                        )}
                        <span className="text-sm font-semibold leading-none">
                          {t(`notifications.${notification.notification_type.toLowerCase()}`) || notification.title}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <span className="mt-1.5 block text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        {formatDistanceToNow(new Date(notification.created_at), { 
                          addSuffix: true,
                          locale: getLocale() 
                        })}
                      </span>
                    </div>
                    <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                      {!notification.is_read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="border-t p-2">
          <Link 
            to="/notifications" 
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            {t("notifications.viewAll")}
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
