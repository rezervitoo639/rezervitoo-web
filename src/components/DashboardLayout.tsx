import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, List, PlusCircle, User, Menu, X, CalendarCheck } from "lucide-react";
import { useState } from "react";
import Navbar from "./Navbar";
import { useLanguage } from "@/i18n/LanguageContext";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  const sidebarItems = [
    { title: t("nav.dashboard"), url: "/dashboard", icon: LayoutDashboard },
    { title: t("nav.myListings"), url: "/dashboard/listings", icon: List },
    { title: t("nav.addListing"), url: "/dashboard/create", icon: PlusCircle },
    { title: t("nav.bookings"), url: "/dashboard/bookings", icon: CalendarCheck },
    { title: t("nav.profile"), url: "/dashboard/profile", icon: User },
  ];

  const isActive = (url: string) => {
    if (url === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(url);
  };

  return (
    <div className="min-h-screen bg-muted/50 dark:bg-slate-950">
      <Navbar />
      
      {/* Mobile Dashboard Header */}
      <div className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-card/80 px-4 backdrop-blur-md md:hidden">
        <h2 className="text-base font-bold text-foreground">
          {t("nav.provider")}
        </h2>
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary transition-colors hover:bg-primary/20 dark:hover:bg-primary/30"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      <div className="container mx-auto flex gap-0 px-0 md:px-4 md:py-10">
        <aside
          className={`fixed inset-y-0 start-0 z-50 w-72 transform border-e bg-card/95 backdrop-blur-xl transition-transform duration-300 ease-in-out md:relative md:inset-auto md:z-auto md:w-64 md:translate-x-0 rtl:md:translate-x-0 md:rounded-3xl md:border md:bg-card md:shadow-sm md:h-[calc(100vh-8rem)] md:sticky md:top-24 flex flex-col ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
          }`}
        >
          <div className="flex h-16 items-center justify-between px-6 md:h-auto md:py-6 md:block border-b">
            <h2 className="text-lg font-bold text-foreground">
              {t("nav.provider")}
            </h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden rounded-lg p-1 hover:bg-muted"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
            {sidebarItems.map((item) => (
              <Link
                key={item.url}
                to={item.url}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all ${
                  isActive(item.url)
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-foreground/20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 p-4 md:p-0 md:ms-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
