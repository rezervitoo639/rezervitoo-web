import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Heart, CalendarCheck, User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { authService, UserProfile } from "@/lib/api/authService";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(authService.getUserData());
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;
  const isLoggedIn = !!user;
  
  const userType = user?.account_type?.toUpperCase();
  const isUser = userType === "USER" || userType === "CLIENT" || userType === "CUSTOMER" || (isLoggedIn && !userType);
  const isProvider = userType === "PROVIDER";

  useEffect(() => {
    // Refresh user data on mount
    const refreshUser = async () => {
      try {
        if (authService.getAccessToken()) {
          const data = await authService.fetchMe();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      }
    };
    refreshUser();

    // Listen for storage changes (for login/logout in other tabs)
    const handleStorage = () => setUser(authService.getUserData());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [location.pathname]); // Refresh on navigation

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success(t("nav.logout"));
      navigate("/login");
      setUserMenuOpen(false);
      setMobileOpen(false);
    } catch (error) {
      authService.clearAuth();
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Rezervitoo" className="h-10 w-auto" />
          <span className="font-heading text-xl font-bold text-primary">Rezervitoo</span>
        </Link>

        {!isProvider && (
          <div className="hidden items-center gap-1 md:flex">
            <Link to="/" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive("/") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("nav.home")}</Link>
            <Link to="/listings" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive("/listings") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("nav.listings")}</Link>
            <Link to="/services" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive("/services") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("nav.services")}</Link>
            <Link to="/about" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive("/about") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("nav.about")}</Link>
            <Link to="/contact" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive("/contact") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("nav.contact")}</Link>
            {isUser && (
              <>
                <Link to="/wishlist" className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive("/wishlist") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <Heart className="h-4 w-4" /> {t("nav.wishlist")}
                </Link>
                <Link to="/my-bookings" className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive("/my-bookings") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <CalendarCheck className="h-4 w-4" /> {t("nav.myBookings")}
                </Link>
              </>
            )}
          </div>
        )}

        {isProvider && !location.pathname.startsWith("/dashboard") && (
          <div className="hidden items-center gap-1 md:flex">
            <Link to="/dashboard" className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isActive("/dashboard") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>{t("nav.dashboard")}</Link>
          </div>
        )}

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <LanguageSwitcher />
          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 rounded-xl border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user?.first_name ? user.first_name[0] : ""}
                  {user?.last_name ? user.last_name[0] : ""}
                </div>
                <span className="max-w-[120px] truncate text-foreground">{user?.first_name} {user?.last_name}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute end-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border bg-card shadow-elevated">
                  <div className="border-b bg-muted/30 px-4 py-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {user?.account_type === "PROVIDER" ? `${t("nav.provider")} · ${user.role}` : t("nav.customer")}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">{user?.email}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    {isProvider && (
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> {t("nav.dashboard")}
                      </Link>
                    )}
                    {isProvider && (
                      <Link to="/dashboard/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" /> {t("nav.profile")}
                      </Link>
                    )}
                    {isUser && (
                      <Link to="/my-bookings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted">
                        <CalendarCheck className="h-4 w-4 text-muted-foreground" /> {t("nav.myBookings")}
                      </Link>
                    )}
                    {isUser && (
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" /> {t("nav.profile")}
                      </Link>
                    )}
                    {isUser && (
                      <Link to="/wishlist" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted">
                        <Heart className="h-4 w-4 text-muted-foreground" /> {t("nav.wishlist")}
                      </Link>
                    )}
                    <div className="my-1 border-t" />
                    <button onClick={handleLogout} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                      <LogOut className="h-4 w-4" /> {t("nav.logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"><Button variant="ghost" size="sm">{t("nav.login")}</Button></Link>
              <Link to="/register"><Button variant="outline" size="sm">{t("nav.register")}</Button></Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t bg-card px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {isLoggedIn && (
              <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {user?.first_name ? user.first_name[0] : ""}
                  {user?.last_name ? user.last_name[0] : ""}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-muted-foreground">{user?.account_type === "PROVIDER" ? user.role : t("nav.customer")}</p>
                </div>
              </div>
            )}

            <Link to="/" className="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileOpen(false)}>{t("nav.home")}</Link>
            <Link to="/listings" className="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileOpen(false)}>{t("nav.listings")}</Link>
            <Link to="/services" className="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileOpen(false)}>{t("nav.services")}</Link>
            <Link to="/about" className="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileOpen(false)}>{t("nav.about")}</Link>
            <Link to="/contact" className="rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileOpen(false)}>{t("nav.contact")}</Link>
            {isUser && <>
              <Link to="/wishlist" className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileOpen(false)}>
                <Heart className="h-4 w-4" /> {t("nav.wishlist")}
              </Link>
              <Link to="/my-bookings" className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileOpen(false)}>
                <CalendarCheck className="h-4 w-4" /> {t("nav.myBookings")}
              </Link>
            </>}
            {isProvider && <>
              <Link to="/dashboard" className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileOpen(false)}>
                <LayoutDashboard className="h-4 w-4" /> {t("nav.dashboard")}
              </Link>
              <Link to="/dashboard/bookings" className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-foreground hover:bg-accent" onClick={() => setMobileOpen(false)}>
                <CalendarCheck className="h-4 w-4" /> {t("nav.bookings")}
              </Link>
            </>}

            <div className="my-2 border-t" />
            <div className="px-4 py-2 flex items-center justify-between">
              <LanguageSwitcher variant="inline" />
              <ThemeToggle />
            </div>
            <div className="my-1 border-t" />
            {isLoggedIn ? (
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10">
                <LogOut className="h-4 w-4" /> {t("nav.logout")}
              </button>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">{t("nav.login")}</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full">{t("nav.register")}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
