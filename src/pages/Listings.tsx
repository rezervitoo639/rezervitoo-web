import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Grid3X3, Map, Loader2, Search, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import FilterSidebar, { ListingFilters } from "@/components/FilterSidebar";
import ListingsMap from "@/components/ListingsMap";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import { listingService, Listing } from "@/lib/api/listingService";
import { toast } from "sonner";
import { getWilayas } from "@/lib/algeriaLocations";

const ITEMS_PER_PAGE = 10;

/** Parse URL search params into ListingFilters */
function urlToFilters(params: URLSearchParams): ListingFilters {
  const f: ListingFilters = {};
  const s = params.get("search");
  if (s) f.search = s;
  const lt = params.get("listing_type");
  if (lt) f.listing_type = lt;
  const pt = params.get("property_type");
  if (pt) f.property_type = pt;
  const pkg = params.get("package_type");
  if (pkg) f.package_type = pkg;
  const rc = params.get("room_category");
  if (rc) f.room_category = rc;
  const minP = params.get("min_price");
  if (minP) f.min_price = Number(minP);
  const maxP = params.get("max_price");
  if (maxP) f.max_price = Number(maxP);
  const mg = params.get("min_guests");
  if (mg) f.min_guests = Number(mg);
  const ord = params.get("ordering");
  if (ord) f.ordering = ord;
  const w = params.get("wilaya");
  if (w) f.wilaya = w;
  const c = params.get("commune");
  if (c) f.commune = c;
  return f;
}

/** Convert ListingFilters → URLSearchParams */
function filtersToUrl(f: ListingFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.search) p.set("search", f.search);
  if (f.listing_type) p.set("listing_type", f.listing_type);
  if (f.property_type) p.set("property_type", f.property_type);
  if (f.package_type) p.set("package_type", f.package_type);
  if (f.room_category) p.set("room_category", f.room_category);
  if (f.min_price) p.set("min_price", String(f.min_price));
  if (f.max_price) p.set("max_price", String(f.max_price));
  if (f.min_guests) p.set("min_guests", String(f.min_guests));
  if (f.ordering) p.set("ordering", f.ordering);
  if (f.wilaya) p.set("wilaya", f.wilaya);
  if (f.commune) p.set("commune", f.commune);
  return p;
}

/** Convert ListingFilters → API query params */
function filtersToApiParams(f: ListingFilters): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};
  if (f.search) params.search = f.search;
  if (f.listing_type) params.listing_type = f.listing_type;
  if (f.property_type) params.property_type = f.property_type;
  if (f.package_type) params.package_type = f.package_type;
  if (f.room_category) params.room_category = f.room_category;
  if (f.min_price) params.min_price = f.min_price;
  if (f.max_price) params.max_price = f.max_price;
  if (f.min_guests) params.min_guests = f.min_guests;
  if (f.ordering) params.ordering = f.ordering;
  // Build location search from wilaya + commune
  if (f.commune) {
    params.search = [f.search, f.commune].filter(Boolean).join(" ");
  } else if (f.wilaya) {
    params.search = [f.search, f.wilaya].filter(Boolean).join(" ");
  }
  return params;
}

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useLanguage();

  const filters = useMemo(() => urlToFilters(searchParams), [searchParams]);

  // Inline search state (for the top search bar on listings page)
  const [inlineSearch, setInlineSearch] = useState(filters.search || "");

  useEffect(() => {
    setInlineSearch(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    const loadListings = async () => {
      setLoading(true);
      try {
        const apiParams = filtersToApiParams(filters);
        const data = await listingService.fetchListings({
          page: currentPage,
          page_size: ITEMS_PER_PAGE,
          approval_status: "APPROVED",
          is_active: true,
          ...apiParams,
        });
        setListings(data.results);
        setTotalCount(data.count);
      } catch (error) {
        console.error("Failed to load listings", error);
        toast.error(t("common.error") || "Failed to load listings");
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [currentPage, filters, t]);

  const handleApplyFilters = (newFilters: ListingFilters) => {
    setSearchParams(filtersToUrl(newFilters));
    setCurrentPage(1);
  };

  const handleInlineSearch = () => {
    const newFilters = { ...filters, search: inlineSearch.trim() || undefined };
    setSearchParams(filtersToUrl(newFilters));
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Top search bar - Responsive layout */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("filters.searchPlaceholder")}
              value={inlineSearch}
              onChange={(e) => setInlineSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInlineSearch()}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <Button onClick={handleInlineSearch} className="h-12 gap-2 rounded-xl sm:h-auto sm:px-8">
            <Search className="h-4 w-4" />
            <span>{t("hero.search")}</span>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground md:text-3xl">{t("listings.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? "..." : totalCount} {t("listings.rentalsFound")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border bg-card p-1">
              <button
                onClick={() => setView("grid")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span className="hidden sm:inline">{t("listings.grid")}</span>
              </button>
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === "map" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Map className="h-4 w-4" />
                <span className="hidden sm:inline">{t("listings.map")}</span>
              </button>
            </div>
            <Button
              variant="outline"
              className="gap-2 rounded-xl md:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {t("listings.filters")}
            </Button>
          </div>
        </div>

        <div className="mt-6 flex gap-6">
          <div className="hidden w-72 shrink-0 md:block">
            <FilterSidebar onApply={handleApplyFilters} initialFilters={filters} />
          </div>

          {filtersOpen && (
            <div className="fixed inset-0 z-50 md:hidden overflow-hidden">
              <div 
                className="absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity" 
                onClick={() => setFiltersOpen(false)} 
              />
              <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] bg-card shadow-2xl transition-transform duration-300 ease-in-out border-t">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-card px-6 py-4">
                  <h2 className="text-lg font-bold text-foreground">{t("listings.filters")}</h2>
                  <button 
                    onClick={() => setFiltersOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="pb-8 px-2">
                  <FilterSidebar
                    onClose={() => setFiltersOpen(false)}
                    onApply={handleApplyFilters}
                    initialFilters={filters}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">{t("common.loading") || "Loading listings..."}</p>
              </div>
            ) : view === "grid" ? (
              listings.length > 0 ? (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                    {listings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        id={listing.id}
                        image={listing.cover_image}
                        title={listing.title}
                        location={listing.location_text}
                        price={listing.price}
                        type={listing.listing_type}
                        negotiable={listing.negotiable}
                      />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        {t("common.previous") || "Previous"}
                      </Button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-10 h-10 rounded-xl"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        {t("common.next") || "Next"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-lg font-medium text-foreground">{t("listings.noResults") || "No listings found"}</p>
                  <p className="mt-1 text-muted-foreground">{t("listings.tryAdjusting") || "Try adjusting your filters"}</p>
                </div>
              )
            ) : (
              <div className="h-full min-h-[600px]">
                <ListingsMap listings={listings} />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Listings;
