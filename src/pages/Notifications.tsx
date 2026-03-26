import { useState, useEffect } from "react";
import { 
  Bell, 
  Check, 
  Trash2, 
  ChevronRight, 
  MoreVertical,
  Calendar,
  User,
  Star,
  ShieldCheck,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  notificationService, 
  AppNotification 
} from "@/lib/api/notificationService";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar, fr, enUS } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const Notifications = () => {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const getLocale = () => {
    if (language === "ar") return ar;
    if (language === "fr") return fr;
    return enUS;
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.fetchNotifications();
      setNotifications(data.results);
      
      // Fetch the total count of unread notifications using the filter
      const unreadData = await notificationService.fetchNotifications({ 
        is_read: "false", 
        page_size: 1 
      });
      setUnreadCount(unreadData.count);
    } catch (error) {
      toast.error("Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error("Error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notifications.find(n => n.id === id && !n.is_read)) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success(t("notifications.markAllAsRead"));
    } catch (error) {
      toast.error("Error");
    }
  };

  const getNotificationIcon = (type: string) => {
    const tLower = type.toLowerCase();
    if (tLower.includes("booking")) return <Calendar className="h-5 w-5 text-blue-500" />;
    if (tLower.includes("review")) return <Star className="h-5 w-5 text-yellow-500" />;
    if (tLower.includes("verified")) return <ShieldCheck className="h-5 w-5 text-green-500" />;
    if (tLower.includes("rejected")) return <XCircle className="h-5 w-5 text-red-500" />;
    return <Bell className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />
      
      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">{t("notifications.title")}</h1>
            <p className="mt-1 text-muted-foreground">
              {unreadCount > 0 
                ? `${unreadCount} ${t("notifications.new")}` 
                : t("notifications.empty")}
            </p>
          </div>
          {notifications.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="rounded-xl"
            >
              <Check className="mr-2 h-4 w-4" />
              {t("notifications.markAllAsRead")}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl border-none shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-card py-20 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Bell className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">{t("notifications.empty")}</h3>
              <p className="mt-2 text-muted-foreground">{t("notifications.emptyDesc")}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`group relative overflow-hidden rounded-2xl border-none shadow-sm transition-all hover:shadow-md ${
                  !notification.is_read ? "ring-1 ring-primary/20" : ""
                }`}
              >
                {!notification.is_read && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
                )}
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-4 sm:gap-6">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12 ${
                      !notification.is_read ? "bg-primary/10" : "bg-muted"
                    }`}>
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`text-base font-semibold sm:text-lg ${
                            !notification.is_read ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            {t(`notifications.${notification.notification_type.toLowerCase()}`) || notification.title}
                          </h3>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            {!notification.is_read && (
                              <DropdownMenuItem 
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="cursor-pointer"
                              >
                                <Check className="mr-2 h-4 w-4" /> {t("notifications.markAllAsRead")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDelete(notification.id)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> {t("notifications.delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <p className={`mt-1 text-sm sm:text-base leading-relaxed ${
                        !notification.is_read ? "text-foreground/90" : "text-muted-foreground"
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(notification.created_at), "PPP p", { locale: getLocale() })}
                        </div>
                        {!notification.is_read && (
                          <Badge variant="secondary" className="px-2 py-0 h-5 bg-primary/10 text-primary border-none text-[10px]">
                            {t("notifications.new")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;
