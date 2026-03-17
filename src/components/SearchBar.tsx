import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const LISTING_TYPES = [
  { key: "PROPERTY", labelKey: "common.property" },
  { key: "HOTEL_ROOM", labelKey: "common.hotelRoom" },
  { key: "HOSTEL_BED", labelKey: "common.hostel" },
  { key: "TRAVEL_PACKAGE", labelKey: "common.travelPackage" },
] as const;

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [listingType, setListingType] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (listingType) params.set("listing_type", listingType);
    navigate(`/listings?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="w-full space-y-3">
      {/* Type pills */}
      <div className="flex flex-wrap gap-2">
        {LISTING_TYPES.map((tp) => (
          <button
            key={tp.key}
            type="button"
            onClick={() => setListingType(listingType === tp.key ? "" : tp.key)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              listingType === tp.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20"
            }`}
          >
            {t(tp.labelKey)}
          </button>
        ))}
      </div>

      {/* Search input */}
      <div className="flex items-center p-1.5 rounded-2xl border bg-card shadow-elevated transition-shadow focus-within:ring-2 focus-within:ring-primary/20">
        <div className="flex flex-1 items-center gap-3 px-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder={t("hero.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        <Button onClick={handleSearch} className="h-11 gap-2 rounded-xl px-6 shadow-sm">
          <Search className="h-4 w-4" />
          {t("hero.search")}
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
