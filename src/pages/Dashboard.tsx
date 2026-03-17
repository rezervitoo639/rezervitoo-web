import { useState, useEffect } from "react";
import { List, CheckCircle, TrendingUp, PlusCircle, CalendarCheck } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import { listingService } from "@/lib/api/listingService";
import { bookingService } from "@/lib/api/bookingService";
import { authService } from "@/lib/api/authService";

const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState([
    { label: t("dashboard.totalListings"), value: "0", icon: List, color: "from-blue-500 to-indigo-600", lightColor: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
    { label: t("dashboard.activeListings"), value: "0", icon: CheckCircle, color: "from-emerald-500 to-teal-600", lightColor: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
    { label: t("dashboard.totalViews"), value: "0", icon: TrendingUp, color: "from-amber-500 to-orange-600", lightColor: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const user = await authService.fetchMe();
        const [listingsData, bookingsData] = await Promise.all([
          listingService.fetchListings({ owner: user.id }),
          bookingService.fetchBookings()
        ]);

        const totalListings = listingsData.count;
        const activeListings = listingsData.results.filter(l => l.approval_status === "APPROVED" && l.is_active).length;
        const totalBookings = bookingsData.count;

        setStats([
          { label: t("dashboard.totalListings"), value: totalListings.toString(), icon: List, color: "from-blue-500 to-indigo-600", lightColor: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
          { label: t("dashboard.activeListings"), value: activeListings.toString(), icon: CheckCircle, color: "from-emerald-500 to-teal-600", lightColor: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
          { label: t("dashboard.totalViews"), value: totalBookings.toString(), icon: TrendingUp, color: "from-amber-500 to-orange-600", lightColor: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
        ]);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [t]);

  return (
    <DashboardLayout>
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.welcome")}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {loading ? (
             Array(3).fill(0).map((_, i) => (
                <div key={i} className="rounded-2xl border bg-card p-5 shadow-sm animate-pulse">
                  <div className="h-10 w-10 bg-muted rounded-xl mb-4" />
                  <div className="h-6 w-16 bg-muted mb-2" />
                  <div className="h-4 w-24 bg-muted" />
                </div>
             ))
          ) : (
            stats.map((stat) => (
              <div key={stat.label} className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
                <div className={`absolute inset-0 bg-gradient-to-br transition-opacity opacity-0 group-hover:opacity-10 ${stat.color}`} />
                <div className="relative flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br shadow-sm ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="font-heading text-lg font-semibold text-foreground">{t("dashboard.quickActions")}</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link to="/dashboard/create" className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20">
                <PlusCircle className="h-4 w-4" />
                {t("dashboard.addNewListing")}
              </Link>
              <Link to="/dashboard/listings" className="flex items-center justify-center gap-2 rounded-xl border bg-background px-5 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted">
                <List className="h-4 w-4" />
                {t("dashboard.viewMyListings")}
              </Link>
              <Link to="/dashboard/bookings" className="flex items-center justify-center gap-2 rounded-xl border bg-background px-5 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted">
                <CalendarCheck className="h-4 w-4" />
                {t("dashboard.viewMyBookings")}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-foreground">{t("dashboard.recentActivity") || "Recent Activity"}</h2>
              <button className="text-xs font-medium text-primary hover:underline">{t("common.viewAll") || "View all"}</button>
            </div>
            <div className="mt-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted/50">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">New booking for "Luxury Villa"</div>
                    <div className="text-xs text-muted-foreground">Today at 2:30 PM</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
