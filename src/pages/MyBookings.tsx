import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, MapPin, ChevronDown, ChevronUp, Users, Phone, User, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import { bookingService, Booking } from "@/lib/api/bookingService";
import { useSearchParams } from "react-router-dom";

const MyBookings = () => {
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const bid = searchParams.get("bookingId");
    if (!bid || !bookings.length) return;
    const el = document.getElementById(`booking-${bid}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [searchParams, bookings]);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        const data = await bookingService.fetchBookings();
        setBookings(data.results);
      } catch (error) {
        toast.error(t("errors.bookings.load"));
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [t]);


  const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    PENDING:   { label: t("common.pending"),  icon: Clock,        className: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800" },
    ACCEPTED:  { label: t("common.accepted"), icon: CheckCircle2, className: "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
    REJECTED:  { label: t("common.rejected"), icon: XCircle,      className: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" },
    COMPLETED: { label: t("common.completed"),icon: CheckCircle2, className: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
    CANCELLED: { label: t("common.cancelled"), icon: XCircle,      className: "text-gray-500 bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700" },
  };

  const typeLabel: Record<string, string> = {
    PROPERTY: t("common.property"), 
    HOTEL_ROOM: t("common.hotelRoom"),
    HOSTEL_BED: t("common.hostel"), 
    TRAVEL_PACKAGE: t("common.travelPackage"),
  };

  const handleAccept = async (id: number) => {
    try {
      await bookingService.acceptBooking(id);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "ACCEPTED" } : b));
      toast.success(t("myBookingsProvider.successAccepted"));
    } catch (error) {
      toast.error(t("errors.bookings.accept"));
    }
  };

  const handleReject = async (id: number) => {
    try {
      await bookingService.rejectBooking(id);
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: "REJECTED" } : b));
      toast.error(t("myBookingsProvider.successRejected"));
    } catch (error) {
      toast.error(t("errors.bookings.reject"));
    }
  };

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);
  const pendingCount = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <DashboardLayout>
      <div className="max-w-3xl" dir={language === "ar" ? "rtl" : "ltr"}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">{t("myBookingsProvider.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {bookings.length} {t("myBookingsProvider.total")} · {pendingCount > 0 && <span className="font-semibold text-orange-500">{pendingCount} {t("myBookingsProvider.pendingCount")}</span>}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mt-5 flex flex-wrap gap-2">
          {["ALL", "PENDING", "ACCEPTED", "REJECTED", "COMPLETED", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}
            >
              {s === "ALL" ? t("myBookingsProvider.all") : statusConfig[s]?.label || s}
              {s === "PENDING" && pendingCount > 0 && <span className={`${language === "ar" ? "mr-1.5" : "ml-1.5"} rounded-full bg-orange-500 px-1.5 py-0.5 text-[9px] text-white font-bold`}>{pendingCount}</span>}
            </button>
          ))}
        </div>

        {/* Bookings list */}
        <div className="mt-5 space-y-4">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="mt-4 text-sm text-muted-foreground">{t("common.loading")}</p>
             </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">{t("myBookingsProvider.noBookings")}</div>
          ) : (
            filtered.map((booking) => {
              const sc = statusConfig[booking.status] || statusConfig.PENDING;
              const StatusIcon = sc.icon;
              const isExpanded = expanded === booking.id;
              const nights = booking.listing_type_at_booking !== "TRAVEL_PACKAGE"
                ? Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / 86400000)
                : null;

              return (
                <div id={`booking-${booking.id}`} key={booking.id} className="overflow-hidden rounded-2xl border bg-card shadow-card scroll-mt-24">
                  <div className="flex gap-0 sm:gap-4">
                    <div className="hidden sm:block shrink-0">
                      <img src={booking.listing_details.cover_image} alt={booking.listing_details.title} className="h-full w-28 object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold uppercase bg-accent/30 rounded-full px-2 py-0.5 text-foreground">{typeLabel[booking.listing_type_at_booking]}</span>
                            <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${sc.className}`}>
                              <StatusIcon className="h-3 w-3" /> {sc.label}
                            </span>
                          </div>
                          <h3 className="mt-1.5 font-heading font-semibold text-foreground">{booking.listing_details.title}</h3>
                        </div>
                        <div className={language === "ar" ? "text-left" : "text-right"}>
                          <div className="text-lg font-bold text-primary">{Number(booking.total_price).toLocaleString()} {t("common.da")}</div>
                          <div className="text-xs text-muted-foreground">
                            {nights 
                              ? `${nights} ${nights > 1 ? t("listingDetails.nights") : t("listingDetails.night")}` 
                              : `${booking.guests_count} ${booking.guests_count > 1 ? t("listingDetails.guests") : t("listingDetails.guest")}`}
                          </div>
                        </div>
                      </div>

                      {/* Guest contact card */}
                      {booking.guest_details && (
                        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate">{booking.guest_details.name}</span>
                            <div className="flex flex-wrap gap-2">
                              <a href={`tel:${booking.guest_details.phone}`} className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline">
                                <Phone className="h-3 w-3" />{booking.guest_details.phone}
                              </a>
                              <a href={`mailto:${booking.guest_details.email}`} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:underline truncate">
                                <Mail className="h-3 w-3" />{booking.guest_details.email}
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {booking.guests_count} {t("myBookingsProvider.guests")}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {booking.start_date} → {booking.end_date}</span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">{t("myBookingsProvider.booking")} #{booking.id}</span>
                        <div className="flex gap-2">
                          {booking.status === "PENDING" && (
                            <>
                              <Button size="sm" className="rounded-xl gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs" onClick={() => handleAccept(booking.id)}>
                                <CheckCircle2 className="h-3.5 w-3.5" /> {t("myBookingsProvider.accept")}
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10 text-xs gap-1.5" onClick={() => handleReject(booking.id)}>
                                <XCircle className="h-3.5 w-3.5" /> {t("myBookingsProvider.reject")}
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" className="rounded-xl text-xs gap-1" onClick={() => setExpanded(isExpanded ? null : booking.id)}>
                            {t("myBookingsProvider.details")} {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-2 border-t pt-3 space-y-1 text-xs text-muted-foreground">
                          <p><span className="font-medium text-foreground">{t("myBookingsProvider.listingId")}:</span> #{booking.listing}</p>
                          {booking.guest_details && (
                            <>
                              <p><span className="font-medium text-foreground">{t("myBookingsProvider.customer")}:</span> {booking.guest_details.name}</p>
                              <p><span className="font-medium text-foreground">{t("myBookingsProvider.phone")}:</span> <a href={`tel:${booking.guest_details.phone}`} className="text-primary hover:underline">{booking.guest_details.phone}</a></p>
                              <p><span className="font-medium text-foreground">Email:</span> <a href={`mailto:${booking.guest_details.email}`} className="hover:underline">{booking.guest_details.email}</a></p>
                            </>
                          )}
                          <p><span className="font-medium text-foreground">{t("myBookingsProvider.submitted")}:</span> {new Date(booking.created_at).toLocaleString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-GB")}</p>
                          <p><span className="font-medium text-foreground">{t("myBookingsProvider.totalPrice")}:</span> {Number(booking.total_price).toLocaleString()} {t("common.da")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyBookings;
