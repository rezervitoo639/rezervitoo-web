import { useState, useEffect } from "react";
import { CalendarCheck, MapPin, Clock, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { bookingService, Booking } from "@/lib/api/bookingService";

const UserBookings = () => {
  const { t, language } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("ALL");

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

  const handleCancelBooking = async (id: number) => {
    try {
      await bookingService.cancelBooking(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: "CANCELLED" } : b)));
      toast.success(t("userBookings.successCancelled"));
    } catch (error: any) {
      toast.error(error.message || t("errors.bookings.cancel"));
    }
  };

  const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    PENDING:   { label: t("common.pending"),   icon: Clock,         className: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800" },
    ACCEPTED:  { label: t("common.accepted"),  icon: CheckCircle2,  className: "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" },
    REJECTED:  { label: t("common.rejected"),  icon: XCircle,       className: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" },
    CANCELLED: { label: t("common.cancelled"), icon: XCircle,       className: "text-gray-500 bg-gray-50 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-700" },
    COMPLETED: { label: t("common.completed"), icon: CheckCircle2,  className: "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
  };

  const typeLabel: Record<string, string> = {
    PROPERTY: t("common.property"), 
    HOTEL_ROOM: t("common.hotelRoom"),
    HOSTEL_BED: t("common.hostel"), 
    TRAVEL_PACKAGE: t("common.travelPackage"),
  };

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <h1 className="font-heading text-2xl font-bold text-foreground">{t("userBookings.title")}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          {bookings.length} {bookings.length === 1 ? t("userBookings.totalBookings") : t("userBookings.totalBookingsPlural")}
        </p>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ALL", "PENDING", "ACCEPTED", "COMPLETED", "CANCELLED", "REJECTED"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${filter === s ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:text-foreground"}`}
            >
              {s === "ALL" ? t("userBookings.all") : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground/30" />
            <p className="text-lg font-semibold text-foreground">{t("userBookings.noBookings")}</p>
            <Link to="/listings"><Button className="mt-2 rounded-xl">{t("userBookings.browseListings")}</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const sc = statusConfig[booking.status] || statusConfig.PENDING;
              const StatusIcon = sc.icon;
              const isExpanded = expanded === booking.id;
              const nights = booking.listing_type_at_booking !== "TRAVEL_PACKAGE"
                ? Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / 86400000)
                : null;

              return (
                <div key={booking.id} className="overflow-hidden rounded-2xl border bg-card shadow-card">
                  <div className="flex gap-0 sm:gap-4">
                    {/* Cover image */}
                    <Link to={`/listing/${booking.listing_details.id}`} className="hidden sm:block shrink-0">
                      <img
                        src={booking.listing_details.cover_image}
                        alt={booking.listing_details.title}
                        className="h-full w-28 object-cover"
                      />
                    </Link>
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/30 rounded-full px-2 py-0.5 text-foreground">
                              {typeLabel[booking.listing_type_at_booking]}
                            </span>
                            <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${sc.className}`}>
                              <StatusIcon className="h-3 w-3" /> {sc.label}
                            </span>
                          </div>
                          <Link to={`/listing/${booking.listing_details.id}`}>
                            <h3 className="mt-1.5 font-heading font-semibold text-foreground hover:text-primary transition-colors">
                              {booking.listing_details.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3" /> {booking.listing_details.location_text}
                          </div>
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

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span><span className="font-medium text-foreground">{t("userBookings.checkIn")}:</span> {booking.start_date}</span>
                        <span><span className="font-medium text-foreground">{t("userBookings.checkOut")}:</span> {booking.end_date}</span>
                        <span><span className="font-medium text-foreground">{t("listingDetails.guests")}:</span> {booking.guests_count}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {t("userBookings.bookingId")} #{booking.id} · {new Date(booking.created_at).toLocaleDateString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-GB")}
                        </span>
                        <div className="flex gap-2">
                          {booking.status === "PENDING" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl text-xs"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              {t("userBookings.cancel")}
                            </Button>
                          )}
                          {booking.status === "COMPLETED" && (
                            <Link to={`/listing/${booking.listing_details.id}?reviewBookingId=${booking.id}`}>
                              <Button size="sm" variant="outline" className="rounded-xl text-xs">{t("userBookings.review")}</Button>
                            </Link>
                          )}
                          <Button size="sm" variant="ghost" className="rounded-xl text-xs gap-1" onClick={() => setExpanded(isExpanded ? null : booking.id)}>
                            {t("userBookings.details")} {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-2 border-t pt-3 space-y-1 text-xs text-muted-foreground">
                          <p><span className="font-medium text-foreground">{t("userBookings.listingId")}:</span> #{booking.listing}</p>
                          <p><span className="font-medium text-foreground">{t("userBookings.bookedOn")}:</span> {new Date(booking.created_at).toLocaleString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-GB")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default UserBookings;
