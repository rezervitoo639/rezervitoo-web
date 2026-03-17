import { useState, useEffect } from "react";
import { Heart, MapPin, Star, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";
import { supportService, WishlistItem } from "@/lib/api/supportService";

const Wishlist = () => {
  const { t, language } = useLanguage();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = async () => {
      setLoading(true);
      try {
        const data = await supportService.fetchWishlist();
        setWishlist(data.results);
      } catch (error) {
        // Only toast if it's not a 401 which is handled by auth
        console.error("Failed to load wishlist", error);
      } finally {
        setLoading(false);
      }
    };
    loadWishlist();
  }, []);

  const listingTypeLabel: Record<string, string> = {
    PROPERTY: t("common.property"),
    HOTEL_ROOM: t("common.hotelRoom"),
    HOSTEL_BED: t("common.hostel"),
    TRAVEL_PACKAGE: t("common.travelPackage"),
  };

  const handleRemove = async (id: number, listingId: number, title: string) => {
    try {
      await supportService.toggleWishlist(listingId);
      setWishlist((prev) => prev.filter((item) => item.id !== id));
      toast.success(`"${title}" ${t("wishlist.removedFromWishlist")}`);
    } catch (error) {
      toast.error("Failed to remove from wishlist");
    }
  };

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
              <Heart className="h-6 w-6 fill-primary text-primary" />
              {t("wishlist.title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {wishlist.length} {wishlist.length === 1 ? t("wishlist.savedListings") : t("wishlist.savedListingsPlural")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/30" />
            <h2 className="font-heading text-xl font-semibold text-foreground">{t("wishlist.empty")}</h2>
            <p className="text-sm text-muted-foreground">{t("wishlist.emptyDesc")}</p>
            <Link to="/listings">
              <Button className="mt-2 rounded-xl gap-2">
                {t("wishlist.exploreListings")} <ArrowRight className={`h-4 w-4 ${language === "ar" ? "rotate-180" : ""}`} />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => {
              const d = item.listing_details;
              return (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border bg-card shadow-card transition-all hover:shadow-card-hover"
                >
                  <Link to={`/listing/${d.id}`}>
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={d.cover_image}
                        alt={d.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <span className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-3 rounded-full bg-card/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur-sm`}>
                        {listingTypeLabel[d.listing_type] || d.listing_type}
                      </span>
                    </div>
                  </Link>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/listing/${d.id}`} className="flex-1">
                        <h3 className="font-heading font-semibold text-foreground hover:text-primary transition-colors">
                          {d.title}
                        </h3>
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id, d.id, d.title)}
                        className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title={t("wishlist.removeFromWishlist")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {d.location_text}
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">{Number(d.price).toLocaleString()} {t("common.da")}</span>
                        <span className="text-xs text-muted-foreground">/{t("listingDetails.night")}</span>
                      </div>
                    </div>

                    <Link to={`/listing/${d.id}`}>
                      <Button variant="outline" size="sm" className="mt-3 w-full rounded-xl gap-2">
                        {t("common.viewDetails")} <ArrowRight className={`h-3.5 w-3.5 ${language === "ar" ? "rotate-180" : ""}`} />
                      </Button>
                    </Link>
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

export default Wishlist;
