import { useState, useEffect, useMemo } from "react";
import { X, CalendarDays, Users, User, Phone, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { authService } from "@/lib/api/authService";
import { bookingService } from "@/lib/api/bookingService";
import { useLanguage } from "@/i18n/LanguageContext";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

interface BookingModalProps {
  listing: {
    id: string | number;
    title: string;
    price: number;
    listing_type: string;
    max_guests?: number;
    selectedSchedule?: { id?: number; start_date: string; max_capacity: number; spots_booked: number };
  };
  onClose: () => void;
}

const BookingModal = ({ listing, onClose }: BookingModalProps) => {
  const { t, language } = useLanguage();
  
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [blockedRanges, setBlockedRanges] = useState<{ from: Date; to: Date }[]>([]);
  const [loadingBlockedDates, setLoadingBlockedDates] = useState(false);
  const [guests, setGuests] = useState(1);
  const [booked, setBooked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await authService.fetchMe();
        setGuestName(`${user.first_name || ""} ${user.last_name || ""}`.trim());
        setGuestPhone(user.phone || "");
      } catch (error) {
        // Fallback or ignore if not logged in
      }
    };
    loadUser();
  }, []);

  const isPackage = listing.listing_type === "TRAVEL_PACKAGE";
  const availableSpotsForSchedule = (listing.selectedSchedule?.max_capacity || 0) - (listing.selectedSchedule?.spots_booked || 0);
  const noCapacityForSelectedSchedule = isPackage && !!listing.selectedSchedule && availableSpotsForSchedule <= 0;
  const maxGuests = isPackage
    ? Math.max(1, availableSpotsForSchedule)
    : Math.max(1, listing.max_guests || 20);

  useEffect(() => {
    if (isPackage) return;

    const loadBlockedDates = async () => {
      setLoadingBlockedDates(true);
      try {
        const unavailable = await bookingService.fetchListingUnavailableDates(listing.id);
        const ranges = unavailable
          .filter((item) => item.start_date && item.end_date)
          .map((item) => ({ from: new Date(item.start_date), to: new Date(item.end_date) }));
        setBlockedRanges(ranges);
      } catch (error) {
        setBlockedRanges([]);
      } finally {
        setLoadingBlockedDates(false);
      }
    };

    void loadBlockedDates();
  }, [isPackage, listing.id]);

  const disabledDays = useMemo(
    () => [{ before: new Date() }, ...blockedRanges],
    [blockedRanges],
  );

  const blockedStartDays = useMemo(
    () => blockedRanges.map((range) => range.from),
    [blockedRanges],
  );

  const blockedEndDays = useMemo(
    () => blockedRanges.map((range) => range.to),
    [blockedRanges],
  );

  useEffect(() => {
    if (!dateRange?.from) {
      setStartDate("");
      setEndDate("");
      return;
    }

    const format = (d: Date) => {
      const year = d.getFullYear();
      const month = `${d.getMonth() + 1}`.padStart(2, "0");
      const day = `${d.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    setStartDate(format(dateRange.from));
    setEndDate(dateRange.to ? format(dateRange.to) : "");
  }, [dateRange]);

  const nights = !isPackage && startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
    : 0;

  const total = isPackage
    ? listing.price * guests               // price × guests_count (per person)
    : nights * listing.price;              // price × nights

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) { toast.error(t("bookingModal.errorNameRequired")); return; }
    if (!guestPhone.trim() || guestPhone.replace(/\D/g, "").length < 9) { toast.error(t("bookingModal.errorPhoneInvalid")); return; }
    if (!isPackage) {
      if (!startDate || !endDate) { toast.error(t("bookingModal.errorDatesRequired")); return; }
      if (nights < 1) { toast.error(t("bookingModal.errorCheckoutAfterCheckin")); return; }
    } else {
      if (!listing.selectedSchedule?.id) {
        toast.error(t("bookingModal.selectDate") || "Please select a departure date first");
        return;
      }
      if (noCapacityForSelectedSchedule) {
        toast.error("No spots available for this departure date.");
        return;
      }
    }

    setLoading(true);
    try {
      const payload: any = {
        listing: Number(listing.id),
        guests_count: Number(guests),
      };

      if (isPackage) {
        payload.schedule = Number(listing.selectedSchedule?.id);
      } else {
        payload.start_date = startDate;
        payload.end_date = endDate;
      }

      console.log("Creating booking with payload:", payload);
      await bookingService.createBooking(payload);
      setBooked(true);
      toast.success(t("bookingModal.success"));
    } catch (error: any) {
      console.error("Booking creation failed", error);
      toast.error(error.message || t("common.error") || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border bg-card shadow-2xl overflow-y-auto max-h-[90dvh]">
        <div className="flex items-center justify-between border-b px-6 py-4 sticky top-0 bg-card z-10">
          <h2 className="font-heading text-lg font-bold text-foreground">
            {isPackage ? t("bookingModal.bookPackage") : t("bookingModal.bookListing")}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {booked ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
              <CheckCircle2 className="h-8 w-8 text-accent-foreground" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground">{t("bookingModal.success")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("bookingModal.successDesc")} <strong>{listing.title}</strong> {t("bookingModal.confirmShortly")}
            </p>
            <div className="w-full rounded-xl border bg-muted/40 p-4 text-left text-sm space-y-1.5">
              <p className="text-muted-foreground">{t("bookingModal.fullName")}: <span className="font-medium text-foreground">{guestName}</span></p>
              <p className="text-muted-foreground">{t("bookingModal.phone")}: <span className="font-medium text-foreground">{guestPhone}</span></p>
              {!isPackage && <>
                <p className="text-muted-foreground">{t("bookingModal.checkIn")}: <span className="font-medium text-foreground">{startDate}</span></p>
                <p className="text-muted-foreground">{t("bookingModal.checkOut")}: <span className="font-medium text-foreground">{endDate}</span></p>
              </>}
              <p className="text-muted-foreground">{t("bookingModal.guests")}: <span className="font-medium text-foreground">{guests}</span></p>
              <p className="mt-2 font-semibold text-primary border-t pt-2">{t("bookingModal.total")}: {total.toLocaleString()} {t("common.da")}</p>
              <p className="text-[10px] text-muted-foreground">{t("common.status")}: <span className="font-semibold text-orange-500">{t("common.pending")}</span></p>
            </div>
            <Button className="w-full rounded-xl" onClick={onClose}>{t("common.close")}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            {/* Listing summary */}
            <div className="rounded-xl border bg-muted/30 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{listing.title}</p>
              <p className="text-lg font-bold text-primary">
                {listing.price.toLocaleString()} {t("common.da")}
                <span className="text-sm font-normal text-muted-foreground">
                  {isPackage ? t("listing.perPerson") : t("listing.perNight")}
                </span>
              </p>
            </div>

            {/* Trip Schedule Selection (if package) */}
            {isPackage && listing.selectedSchedule && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-primary mb-1">{t("bookingModal.selectDate")}</p>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  {new Date(listing.selectedSchedule.start_date).toLocaleDateString(language === "ar" ? "ar-DZ" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {listing.selectedSchedule.max_capacity - listing.selectedSchedule.spots_booked} {t("bookingModal.availableSpots")}
                </p>
              </div>
            )}

            {isPackage && !listing.selectedSchedule && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {t("bookingModal.selectDate")}
              </div>
            )}

            {/* Guest name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <User className="h-3.5 w-3.5" /> {t("bookingModal.fullName")}
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={t("bookingModal.namePlaceholder")}
                className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> {t("bookingModal.phone")}
              </label>
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                placeholder={t("bookingModal.phonePlaceholder")}
                className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>

            {/* Date fields – only for accommodation */}
            {!isPackage && (
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" /> {t("bookingModal.checkIn")} / {t("bookingModal.checkOut")}
                </label>
                <div className="rounded-xl border bg-background p-2">
                  <Calendar
                    mode="range"
                    numberOfMonths={1}
                    selected={dateRange}
                    onSelect={setDateRange}
                    disabled={disabledDays}
                    modifiers={{
                      unavailable: blockedRanges,
                      unavailable_start: blockedStartDays,
                      unavailable_end: blockedEndDays,
                    }}
                    modifiersClassNames={{
                      unavailable:
                        "!bg-red-100 !text-red-700 hover:!bg-red-100",
                      unavailable_start:
                        "!bg-red-500 !text-white hover:!bg-red-500",
                      unavailable_end:
                        "!bg-red-500 !text-white hover:!bg-red-500",
                    }}
                    classNames={{
                      selected:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                      range_middle:
                        "aria-selected:bg-primary/15 aria-selected:text-primary",
                      range_start:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                      range_end:
                        "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    }}
                  />
                </div>
                {loadingBlockedDates && (
                  <p className="text-xs text-muted-foreground">Loading unavailable dates...</p>
                )}
                {!loadingBlockedDates && blockedRanges.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Unavailable dates are disabled on the calendar.
                  </p>
                )}
              </div>
            )}

            {/* Package info note */}
            {isPackage && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                {t("bookingModal.packageNote")}
              </div>
            )}

            {/* Guests count */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> {isPackage ? t("bookingModal.spots") : t("bookingModal.guests")}
              </label>
              <input
                type="number"
                min={1}
                max={maxGuests}
                value={guests}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (Number.isNaN(next)) return;
                  setGuests(Math.min(maxGuests, Math.max(1, next)));
                }}
                className="mt-1.5 w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Price breakdown */}
            {(nights > 0 || isPackage) && (
              <div className="rounded-xl border bg-primary/5 px-4 py-3 text-sm">
                {!isPackage ? (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{listing.price.toLocaleString()} {t("common.da")} × {nights} {nights > 1 ? t("bookingModal.nights") : t("bookingModal.night")}</span>
                    <span>{total.toLocaleString()} {t("common.da")}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-muted-foreground">
                    <span>{listing.price.toLocaleString()} {t("common.da")} × {guests} {guests > 1 ? t("bookingModal.persons") : t("bookingModal.person")}</span>
                    <span>{total.toLocaleString()} {t("common.da")}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-between font-bold text-foreground border-t pt-2">
                  <span>{t("bookingModal.total")}</span>
                  <span className="text-primary">{total.toLocaleString()} {t("common.da")}</span>
                </div>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full rounded-xl" disabled={loading || noCapacityForSelectedSchedule}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("bookingModal.confirm")}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              {t("bookingModal.pendingNote")}
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
