import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { getWilayas, getCommunes } from "@/lib/algeriaLocations";

export interface ListingFilters {
  search?: string;
  listing_type?: string;
  property_type?: string;
  package_type?: string;
  room_category?: string;
  min_price?: number;
  max_price?: number;
  min_guests?: number;
  ordering?: string;
  wilaya?: string;
  commune?: string;
}

interface FilterSidebarProps {
  className?: string;
  onClose?: () => void;
  onApply?: (filters: ListingFilters) => void;
  initialFilters?: ListingFilters;
}

const FilterSidebar = ({ className = "", onClose, onApply, initialFilters }: FilterSidebarProps) => {
  const { t, language } = useLanguage();
  const isAr = language === "ar";

  const [search, setSearch] = useState(initialFilters?.search || "");
  const [listingType, setListingType] = useState(initialFilters?.listing_type || "");
  const [propertyType, setPropertyType] = useState(initialFilters?.property_type || "");
  const [packageType, setPackageType] = useState(initialFilters?.package_type || "");
  const [roomCategory, setRoomCategory] = useState(initialFilters?.room_category || "");
  const [minPrice, setMinPrice] = useState<string>(initialFilters?.min_price?.toString() || "");
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters?.max_price?.toString() || "");
  const [minGuests, setMinGuests] = useState<string>(initialFilters?.min_guests?.toString() || "");
  const [ordering, setOrdering] = useState(initialFilters?.ordering || "");
  const [wilaya, setWilaya] = useState(initialFilters?.wilaya || "");
  const [commune, setCommune] = useState(initialFilters?.commune || "");

  const wilayas = useMemo(() => getWilayas(), []);
  const communes = useMemo(() => (wilaya ? getCommunes(wilaya) : []), [wilaya]);

  const listingTypes = [
    { key: "PROPERTY", label: t("common.property") },
    { key: "HOTEL_ROOM", label: t("common.hotelRoom") },
    { key: "HOSTEL_BED", label: t("common.hostel") },
    { key: "TRAVEL_PACKAGE", label: t("common.travelPackage") },
  ];

  const propertyTypes = [
    { key: "HOUSE", label: t("types.house") },
    { key: "APARTMENT", label: t("types.apartment") },
    { key: "VILLA", label: t("types.villa") },
    { key: "CABIN", label: t("types.cabin") },
    { key: "STUDIO", label: t("types.studio") },
  ];

  const packageTypes = [
    { key: "LOCAL", label: t("packageTypes.local") },
    { key: "HAJJ", label: t("packageTypes.hajj") },
    { key: "UMRAH", label: t("packageTypes.umrah") },
    { key: "INTERNATIONAL", label: t("packageTypes.international") },
  ];

  const roomCategories = [
    { key: "SINGLE", label: t("roomCategories.single") },
    { key: "DOUBLE", label: t("roomCategories.double") },
    { key: "SUITE", label: t("roomCategories.suite") },
    { key: "DELUXE", label: t("roomCategories.deluxe") },
    { key: "FAMILY", label: t("roomCategories.family") },
  ];

  const orderingOptions = [
    { key: "-created_at", label: t("filters.newest") },
    { key: "created_at", label: t("filters.oldest") },
    { key: "price", label: t("filters.priceLowHigh") },
    { key: "-price", label: t("filters.priceHighLow") },
  ];

  const handleApply = () => {
    const filters: ListingFilters = {};
    if (search.trim()) filters.search = search.trim();
    if (listingType) filters.listing_type = listingType;
    if (listingType === "PROPERTY" && propertyType) filters.property_type = propertyType;
    if (listingType === "TRAVEL_PACKAGE" && packageType) filters.package_type = packageType;
    if (listingType === "HOTEL_ROOM" && roomCategory) filters.room_category = roomCategory;
    if (minPrice) filters.min_price = Number(minPrice);
    if (maxPrice) filters.max_price = Number(maxPrice);
    if (minGuests) filters.min_guests = Number(minGuests);
    if (ordering) filters.ordering = ordering;
    if (wilaya) {
      const w = wilayas.find((wl) => wl.code === wilaya);
      if (w) filters.wilaya = w.nameAscii;
    }
    if (commune) filters.commune = commune;
    onApply?.(filters);
    onClose?.();
  };

  const handleReset = () => {
    setSearch("");
    setListingType("");
    setPropertyType("");
    setPackageType("");
    setRoomCategory("");
    setMinPrice("");
    setMaxPrice("");
    setMinGuests("");
    setOrdering("");
    setWilaya("");
    setCommune("");
    onApply?.({});
  };

  const handleWilayaChange = (code: string) => {
    setWilaya(code);
    setCommune("");
  };

  const selectClass = "mt-2 w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none dark:border-slate-800";

  return (
    <div className={`rounded-2xl border bg-card p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-foreground" />
          <h3 className="font-heading text-base font-semibold text-foreground">{t("filters.title")}</h3>
        </div>
        {onClose && (
          <button onClick={onClose}>
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="mt-6 space-y-5">
        {/* Search */}
        <div>
          <label className="text-sm font-medium text-foreground">{t("filters.search")}</label>
          <input
            type="text"
            placeholder={t("filters.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Location: Wilaya */}
        <div>
          <label className="text-sm font-medium text-foreground">{t("filters.wilaya")}</label>
          <select
            value={wilaya}
            onChange={(e) => handleWilayaChange(e.target.value)}
            className={selectClass}
          >
            <option value="">{t("filters.allWilayas")}</option>
            {wilayas.map((w) => (
              <option key={w.code} value={w.code}>
                {w.code} - {isAr ? w.nameAr : w.nameAscii}
              </option>
            ))}
          </select>
        </div>

        {/* Location: Commune */}
        {wilaya && communes.length > 0 && (
          <div>
            <label className="text-sm font-medium text-foreground">{t("filters.commune")}</label>
            <select
              value={commune}
              onChange={(e) => setCommune(e.target.value)}
              className={selectClass}
            >
              <option value="">{t("filters.allCommunes")}</option>
              {communes.map((c) => (
                <option key={c.nameAscii} value={c.nameAscii}>
                  {isAr ? c.nameAr : c.nameAscii}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Listing Type */}
        <div>
          <label className="text-sm font-medium text-foreground">{t("filters.type")}</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {listingTypes.map((tp) => (
              <button
                key={tp.key}
                type="button"
                onClick={() => {
                  setListingType(listingType === tp.key ? "" : tp.key);
                  setPropertyType("");
                  setPackageType("");
                  setRoomCategory("");
                }}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  listingType === tp.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/50"
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-type filters */}
        {listingType === "PROPERTY" && (
          <div>
            <label className="text-sm font-medium text-foreground">{t("filters.propertyType")}</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {propertyTypes.map((tp) => (
                <button
                  key={tp.key}
                  type="button"
                  onClick={() => setPropertyType(propertyType === tp.key ? "" : tp.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    propertyType === tp.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {tp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {listingType === "HOTEL_ROOM" && (
          <div>
            <label className="text-sm font-medium text-foreground">{t("filters.roomCategory")}</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {roomCategories.map((tp) => (
                <button
                  key={tp.key}
                  type="button"
                  onClick={() => setRoomCategory(roomCategory === tp.key ? "" : tp.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    roomCategory === tp.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {tp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {listingType === "TRAVEL_PACKAGE" && (
          <div>
            <label className="text-sm font-medium text-foreground">{t("filters.packageType")}</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {packageTypes.map((tp) => (
                <button
                  key={tp.key}
                  type="button"
                  onClick={() => setPackageType(packageType === tp.key ? "" : tp.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    packageType === tp.key
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {tp.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium text-foreground">{t("filters.priceRange")}</label>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              placeholder={t("filters.min")}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <span className="text-muted-foreground">—</span>
            <input
              type="number"
              placeholder={t("filters.max")}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Min Guests */}
        <div>
          <label className="text-sm font-medium text-foreground">{t("filters.minGuests")}</label>
          <input
            type="number"
            min={1}
            placeholder={t("filters.minGuestsPlaceholder")}
            value={minGuests}
            onChange={(e) => setMinGuests(e.target.value)}
            className="mt-2 w-full rounded-xl border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Ordering */}
        <div>
          <label className="text-sm font-medium text-foreground">{t("filters.sortBy")}</label>
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className={selectClass}
          >
            <option value="">{t("filters.defaultSort")}</option>
            {orderingOptions.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={handleApply} className="w-full rounded-xl">{t("filters.apply")}</Button>
          <Button onClick={handleReset} variant="ghost" className="w-full rounded-xl text-xs">{t("filters.reset")}</Button>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
