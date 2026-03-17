import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MapPin, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { supportService } from "@/lib/api/supportService";
import { toast } from "sonner";
import { authService } from "@/lib/api/authService";

interface ListingCardProps {
  id: string | number;
  image: string;
  title: string;
  location: string;
  price: number | string;
  priceUnit?: string;
  type?: string;
  negotiable?: boolean;
  isWishlisted?: boolean;
}

const ListingCard = ({
  id,
  image,
  title,
  location,
  price,
  priceUnit,
  type,
  negotiable,
  isWishlisted: initialWishlisted = false,
}: ListingCardProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);

  const getTypeConfig = (typeStr: string) => {
    const tKeys: Record<string, string> = {
      "APARTMENT": "types.apartment",
      "HOUSE": "types.house",
      "VILLA": "types.villa",
      "STUDIO": "types.studio",
      "CABIN": "types.cabin",
      "ROOM": "types.room",
      "PROPERTY": "common.property",
      "HOTEL_ROOM": "common.hotelRoom",
      "HOTEL": "common.hotelRoom",
      "HOSTEL": "common.hostel",
      "HOSTEL_BED": "common.hostel",
      "TRAVEL_PACKAGE": "common.travelPackage",
      "PACKAGE": "common.travelPackage"
    };

    const colorClasses: Record<string, string> = {
      "APARTMENT": "bg-blue-500/90 text-white",
      "HOUSE": "bg-indigo-500/90 text-white",
      "VILLA": "bg-purple-500/90 text-white",
      "STUDIO": "bg-pink-500/90 text-white",
      "CABIN": "bg-orange-500/90 text-white",
      "ROOM": "bg-emerald-500/90 text-white",
      "HOTEL_ROOM": "bg-cyan-500/90 text-white",
      "HOTEL": "bg-cyan-500/90 text-white",
      "HOSTEL": "bg-amber-500/90 text-white",
      "HOSTEL_BED": "bg-amber-500/90 text-white",
      "TRAVEL_PACKAGE": "bg-rose-500/90 text-white",
      "PACKAGE": "bg-rose-500/90 text-white",
      "PROPERTY": "bg-slate-700/90 text-white"
    };

    const key = typeStr.toUpperCase();
    const transKey = tKeys[key];
    const label = transKey ? t(transKey) : typeStr;
    const className = colorClasses[key] || "bg-card/90 text-foreground";

    return { label, className };
  };

  const typeConfig = type ? getTypeConfig(type) : null;

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const user = await authService.fetchMe();
      const userType = user.account_type?.toUpperCase();
      const isUser = userType === "USER" || userType === "CLIENT" || userType === "CUSTOMER" || !userType;
      
      if (!isUser) {
        toast.error(t("listingDetails.wishlistUserOnly"));
        return;
      }
      const res = await supportService.toggleWishlist(id);
      setWishlisted(res.wishlisted);
      toast.success(res.wishlisted ? t("listingDetails.wishlistAdded") : t("listingDetails.wishlistRemoved"));
    } catch {
      toast.error(t("listingDetails.wishlistLogin"));
      navigate("/login", { state: { from: window.location.pathname } });
    }
  };

  return (
    <Link to={`/listing/${id}`} className="group block">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300 group-hover:shadow-card-hover group-hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {typeConfig && (
            <span className={`absolute start-3 top-3 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm shadow-sm ${typeConfig.className}`}>
              {typeConfig.label}
            </span>
          )}
          {negotiable && (
            <span className="absolute end-12 top-3 rounded-full bg-green-500/90 dark:bg-emerald-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm uppercase tracking-wider">
              {t("listingDetails.negotiable")}
            </span>
          )}
          <button
            onClick={handleWishlist}
            className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/90 text-foreground shadow-sm backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
          >
            <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
          </button>
        </div>
        <div className="p-4">
          <h3 className="font-heading text-base font-semibold text-foreground line-clamp-1">
            {title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>{location}</span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-primary">
                {typeof price === "string" ? parseFloat(price).toLocaleString() : price.toLocaleString()} {t("common.da")}
              </span>
              <span className="text-sm text-muted-foreground">{priceUnit || (type === "TRAVEL_PACKAGE" ? t("listing.perPerson") : t("listing.perNight"))}</span>
            </div>
            <Button size="sm" variant="outline" className="text-xs">
              {t("listing.viewDetails")}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
