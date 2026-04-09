import { useNavigate, useParams, Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { listingService, Listing, PackageListing, getTranslatedName } from "@/lib/api/listingService";
import { useEffect, useState } from "react";
import { 
  Loader2, MapPin, Phone, Wifi, Car, Wind, Utensils, Waves, Shield,
  Star, Users, Building, CalendarDays, Heart, BookOpen,
  MessageSquare, Flag, ThumbsUp, AlertTriangle, Bed, Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageGallery from "@/components/ImageGallery";
import BookingModal from "@/components/BookingModal";
import ReviewModal from "@/components/ReviewModal";
import ReportModal from "@/components/ReportModal";
import { toast } from "sonner";
import { authService } from "@/lib/api/authService";
import { supportService } from "@/lib/api/supportService";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const StarDisplay = ({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`${size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5"} ${
          s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"
        }`}
      />
    ))}
  </div>
);

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const [searchParams] = useSearchParams();
  const reviewBookingId = searchParams.get("reviewBookingId");
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [providerPhone, setProviderPhone] = useState<string | null>(null);

  const [isNormalUser, setIsNormalUser] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.fetchMe();
        const userType = user.account_type?.toUpperCase();
        setIsLoggedIn(true);
        setIsNormalUser(userType === "USER" || userType === "CLIENT" || userType === "CUSTOMER" || !userType);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadListing = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await listingService.fetchListingById(id);
        setListing(data);
        if (data.is_wishlisted !== undefined) {
          setWishlisted(data.is_wishlisted);
        }
        
        // Fetch provider phone
        if (data.owner) {
          const providerData = await authService.fetchUserById(data.owner);
          setProviderPhone(providerData.phone);
        }
      } catch (error) {
        console.error("Failed to load listing details", error);
        toast.error(t("errors.listings.details"));
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id, t]);

  // Auto-open review modal if reviewBookingId is present
  useEffect(() => {
    if (reviewBookingId && isLoggedIn && isNormalUser) {
      setShowReview(true);
    }
  }, [reviewBookingId, isLoggedIn, isNormalUser]);

  const handleWishlist = async () => {
    if (!isLoggedIn) {
      toast.error(t("listingDetails.wishlistLogin"));
      navigate("/login", { state: { from: `/listing/${id}` } });
      return;
    }
    if (!isNormalUser) {
      toast.error(t("listingDetails.wishlistUserOnly"));
      return;
    }
    
    try {
      const res = await supportService.toggleWishlist(id!);
      setWishlisted(res.wishlisted);
      toast.success(res.wishlisted ? t("listingDetails.wishlistAdded") : t("listingDetails.wishlistRemoved"));
    } catch (error) {
      toast.error(t("errors.listings.wishlist"));
    }
  };

  const handleActionRequireLogin = (action: () => void) => {
    if (!isLoggedIn) {
      toast.error(t("login.signInToAccount"));
      navigate("/login", { state: { from: `/listing/${id}` } });
      return;
    }
    action();
  };

  const getListingTypeConfig = (type: string) => {
    switch (type) {
      case "PROPERTY": return { label: t("common.property"), className: "bg-slate-700/90 text-white" };
      case "HOTEL_ROOM": return { label: t("common.hotelRoom"), className: "bg-cyan-500/90 text-white" };
      case "HOSTEL_BED": return { label: t("common.hostel"), className: "bg-amber-500/90 text-white" };
      case "TRAVEL_PACKAGE": return { label: t("common.travelPackage"), className: "bg-rose-500/90 text-white" };
      default: return { label: type, className: "bg-accent/30 text-foreground" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">{t("common.loading") || "Loading details..."}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-40 text-center">
          <p className="text-lg font-medium text-foreground">{t("common.error") || "Listing not found"}</p>
          <Link to="/listings" className="mt-4 text-primary hover:underline">{t("nav.listings")}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const reviews = (listing as any).reviews || [];

  
  // Construct location display from state/province if location_text is missing
  const locationDisplay = listing.location_text || 
    (listing.province && listing.state && listing.province !== listing.state 
      ? `${listing.province}, ${listing.state}` 
      : listing.province || listing.state || "");

  const typeConfig = getListingTypeConfig(listing.listing_type);

  // Helper for amenity icons
  const getAmenityIcon = (amenity: any) => {
    const n = (amenity.name_en || amenity.name || "").toLowerCase();
    if (n.includes("wifi")) return <Wifi className="h-5 w-5 text-primary" />;
    if (n.includes("park")) return <Car className="h-5 w-5 text-primary" />;
    if (n.includes("ac") || n.includes("clim")) return <Wind className="h-5 w-5 text-primary" />;
    if (n.includes("pool") || n.includes("piscine")) return <Waves className="h-5 w-5 text-primary" />;
    if (n.includes("secur")) return <Shield className="h-5 w-5 text-primary" />;
    if (n.includes("breakfast") || n.includes("food") || n.includes("petit")) return <Utensils className="h-5 w-5 text-primary" />;
    if (n.includes("kitchen") || n.includes("cuisin")) return <Utensils className="h-5 w-5 text-primary" />;
    return <Building className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <Navbar />

      {/* Modals */}
      {showBooking && (
        <BookingModal 
          listing={{ 
            id: listing.id, 
            title: listing.title, 
            price: parseFloat(listing.price), 
            listing_type: listing.listing_type,
            max_guests: (listing as any).max_guests,
            selectedSchedule: listing.listing_type === "TRAVEL_PACKAGE" && selectedSchedule !== null && (listing as PackageListing).schedules
              ? (listing as PackageListing).schedules[selectedSchedule] 
              : undefined
          }} 
          onClose={() => setShowBooking(false)} 
        />
      )}
      {showReview && (
        <ReviewModal 
          listing={{ id: listing.id, title: listing.title }} 
          bookingId={reviewBookingId || undefined}
          onClose={() => setShowReview(false)} 
        />
      )}
      {showReport && (
        <ReportModal listing={{ id: listing.id, title: listing.title, owner_name: listing.owner_name }} onClose={() => setShowReport(false)} />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="lg:flex lg:gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <ImageGallery images={listing.images?.map(img => img.image) || []} />

            <div className="mt-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeConfig.className}`}>
                      {typeConfig.label}
                    </span>
                    <button
                      onClick={handleWishlist}
                      className="flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      <Heart className={`h-3.5 w-3.5 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                      {wishlisted ? t("listingDetails.saved") : t("listingDetails.save")}
                    </button>
                  </div>
                  <h1 className="mt-3 font-heading text-2xl font-bold text-foreground md:text-3xl">
                    {listing.title}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{locationDisplay}</span>
                  </div>
                </div>
                <div className={`${language === "ar" ? "text-left" : "text-right"}`}>
                  <div className="text-2xl font-bold text-primary">{parseFloat(listing.price || "0").toLocaleString()} {t("common.da")}</div>
                  <div className="text-sm text-muted-foreground">
                    {listing.listing_type === "TRAVEL_PACKAGE" ? t("listing.perPerson") : t("listing.perNight")}
                  </div>
                  {listing.negotiable && (
                    <div className="mt-1 text-xs font-medium text-green-600 bg-green-50 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full inline-block">
                      {t("listingDetails.negotiable")}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 border-y py-4">
                {listing.listing_type === "PROPERTY" && (
                  <>
                    <div className="flex items-center gap-2"><Building className="h-5 w-5 text-muted-foreground" /><span className="font-medium">{(listing as any).bedrooms} {t("listingDetails.bedrooms")}</span></div>
                    <div className="flex items-center gap-2"><Waves className="h-5 w-5 text-muted-foreground" /><span className="font-medium">{(listing as any).bathrooms} {t("listingDetails.bathrooms")}</span></div>
                  </>
                )}
                {listing.listing_type === "HOTEL_ROOM" && (
                  <>
                    <div className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" fill="currentColor" /><span className="font-medium">{(listing as any).hotel_stars} {t("listingDetails.starHotel")}</span></div>
                    <div className="flex items-center gap-2"><Building className="h-5 w-5 text-muted-foreground" /><span className="font-medium">{(listing as any).room_category}</span></div>
                  </>
                )}
                {listing.listing_type === "HOSTEL_BED" && (listing as any).room_type && (
                  <>
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">
                        {t(`roomTypes.${(listing as any).room_type}`) || ((listing as any).room_type === "DORM" ? t("listingDetails.dormitory") : t("listingDetails.privateRoom"))}
                      </span>
                    </div>
                    {(listing as any).gender && (
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{t(`genders.${(listing as any).gender}`) || (listing as any).gender}</span>
                      </div>
                    )}
                  </>
                )}
                {listing.listing_type === "TRAVEL_PACKAGE" && (
                  <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /><span className="font-medium">{(listing as PackageListing).itinerary_items?.length} {t("listingDetails.days")}</span></div>
                )}
              </div>

              <div className="mt-8">
                <h2 className="font-heading text-lg font-semibold text-foreground">{t("listingDetails.description")}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{listing.description}</p>
              </div>

              {listing.listing_type === "TRAVEL_PACKAGE" && (listing as PackageListing).itinerary_items ? (
                <div className="mt-8">
                  <h2 className="font-heading text-lg font-semibold text-foreground">{t("listingDetails.itinerary")}</h2>
                  <div className={`mt-4 space-y-6 border-l-2 border-primary/20 ${language === "ar" ? "mr-2 pr-6 border-r-2 border-l-0" : "ml-2 pl-6"} relative`}>
                    {(listing as PackageListing).itinerary_items.map((day) => (
                      <div key={day.id} className="relative">
                        <div className={`absolute ${language === "ar" ? "-right-[35px]" : "-left-[35px]"} top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground`}>
                          {day.day}
                        </div>
                        <h3 className="font-semibold text-foreground">{day.title || `${t("listingDetails.day")} ${day.day}`}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{day.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  <h2 className="font-heading text-lg font-semibold text-foreground">{t("listingDetails.amenities")}</h2>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {listing.amenity_details?.map((amenity) => (
                      <div key={amenity.id} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                        {getAmenityIcon(amenity)}
                        <span className="text-sm font-medium text-foreground">{getTranslatedName(amenity, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {listing.restriction_details && listing.restriction_details.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    {t("createListing.restrictions")}
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {listing.restriction_details.map((restriction) => (
                      <div key={restriction.id} className="flex items-center gap-3 rounded-xl border bg-red-500/5 px-4 py-3">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">{getTranslatedName(restriction, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {listing.nearby_details && listing.nearby_details.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                    <Map className="h-5 w-5 text-teal-500" />
                    {t("createListing.nearbyPlaces") || "Nearby Places"}
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {listing.nearby_details.map((nearby) => (
                      <div key={nearby.id} className="flex items-center gap-3 rounded-xl border bg-teal-500/5 px-4 py-3">
                        <MapPin className="h-4 w-4 text-teal-500" />
                        <span className="text-sm font-medium text-teal-700 dark:text-teal-400">{getTranslatedName(nearby, language)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(listing as any).beds && (listing as any).beds.length > 0 && (
                <div className="mt-8">
                  <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                    <Bed className="h-5 w-5 text-blue-500" />
                    {t("createListing.bedroomConfigs") || "Beds"}
                  </h2>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(listing as any).beds.map((bed: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Bed className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">{getTranslatedName(bed.bed_type_details, language)}</span>
                        </div>
                        <span className="text-sm font-bold bg-muted px-2 py-0.5 rounded-md">x{bed.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {listing.listing_type === "TRAVEL_PACKAGE" && (listing as PackageListing).schedules && (
                <div className="mt-10" id="schedules-section">
                  <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    {t("listingDetails.schedules")}
                  </h2>
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(listing as PackageListing).schedules.map((sched, idx) => (
                      <button
                        key={sched.id}
                        onClick={() => setSelectedSchedule(idx)}
                        className={`text-start relative overflow-hidden rounded-2xl border p-4 transition-all hover:shadow-md ${
                          selectedSchedule === idx 
                            ? "border-primary bg-primary/5 ring-1 ring-primary" 
                            : "bg-card hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-foreground">
                            {new Date(sched.start_date).toLocaleDateString(language === "ar" ? "ar-DZ" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                          {selectedSchedule === idx && (
                            <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                              <ThumbsUp className="h-2 w-2 text-primary-foreground fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                          <Users className="h-3.5 w-3.5" />
                          {sched.spots_available} {t("bookingModal.availableSpots")}
                        </div>
                        {selectedSchedule === idx && (
                          <div className="absolute top-0 right-0 h-1 w-full bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {listing.location_lat && listing.location_lng && (
                <div className="mt-10">
                  <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                    <MapPin className="h-5 w-5 text-red-500" />
                    {t("listingDetails.location") || "Location"}
                  </h2>
                  <div className="h-[300px] w-full rounded-2xl overflow-hidden border">
                    <MapContainer 
                      center={[listing.location_lat, listing.location_lng]} 
                      zoom={14} 
                      className="h-full w-full z-10"
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[listing.location_lat, listing.location_lng]} />
                    </MapContainer>
                  </div>
                </div>
              )}

              <div className="mt-10">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    {t("listingDetails.guestReviews")}
                    <span className="text-sm font-normal text-muted-foreground">({reviews.length})</span>
                  </h2>
                  {isNormalUser && (
                    <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => setShowReview(true)}>
                      <ThumbsUp className="h-3.5 w-3.5" /> {t("listingDetails.writeReview")}
                    </Button>
                  )}
                </div>
                {reviews.length > 0 ? (
                  <div className="mt-4 flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-foreground">
                        {((listing as any).average_rating || 5).toFixed(1)}
                      </div>
                      <StarDisplay rating={(listing as any).average_rating || 5} size="md" />
                      <div className="mt-1 text-xs text-muted-foreground">{reviews.length} {t("listingDetails.reviews")}</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-xl border bg-muted/30 p-8 text-center">
                    <div className="text-4xl font-bold text-foreground">
                      {t("listingDetails.new") || "New"}
                    </div>
                    <p className="text-sm text-muted-foreground">{t("listingDetails.noReviews")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="mt-8 lg:mt-0 lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border bg-card p-6 shadow-card">
                <h3 className="font-heading text-base font-semibold text-foreground">{t("listingDetails.provider")}</h3>
                  <div className="mt-4 flex items-center gap-4">
                    <Link to={`/provider/${listing.owner}`} className="flex items-center gap-4 transition-opacity hover:opacity-80">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-accent">
                        <div className="flex h-full w-full items-center justify-center font-bold text-accent-foreground">
                          {listing.owner_name ? listing.owner_name[0] : "P"}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{listing.owner_name}</p>
                        <p className="text-xs text-muted-foreground">{t("listingDetails.hostSince")} 2024</p>
                      </div>
                    </Link>
                  </div>
                <Link to={`/provider/${listing.owner}`} className="w-full">
                  <Button className="mt-4 w-full gap-2 rounded-xl" size="lg" variant="secondary">
                    {t("listingDetails.viewProfile")}
                  </Button>
                </Link>
              </div>

              <div className="rounded-2xl border bg-card p-5 shadow-card space-y-3">
                <h3 className="font-heading text-sm font-semibold text-foreground">{t("listingDetails.actions")}</h3>
                <Button
                  className="w-full gap-2 rounded-xl"
                  size="lg"
                  onClick={() => {
                    if (listing.listing_type === "TRAVEL_PACKAGE" && selectedSchedule === null) {
                      toast.error(t("bookingModal.selectDate"));
                      document.getElementById("schedules-section")?.scrollIntoView({ behavior: "smooth" });
                      return;
                    }
                    handleActionRequireLogin(() => setShowBooking(true));
                  }}
                >
                  <BookOpen className="h-4 w-4" />
                  {listing.listing_type === "TRAVEL_PACKAGE" ? t("listingDetails.bookPackage") : t("listingDetails.bookNow")}
                </Button>

                {providerPhone && (
                  <a href={`tel:${providerPhone}`} className="w-full">
                    <Button
                      variant="outline"
                      className="w-full gap-2 rounded-xl text-primary border-primary hover:bg-primary/5"
                      size="lg"
                    >
                      <Phone className="h-4 w-4" />
                      {t("listing.callProvider")}
                    </Button>
                  </a>
                )}
                
                {isNormalUser && (
                  <button
                    onClick={() => setShowReport(true)}
                    className="w-full text-center text-xs text-muted-foreground hover:text-destructive flex items-center justify-center gap-1 pt-1"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {t("listingDetails.reportListing")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ListingDetails;
