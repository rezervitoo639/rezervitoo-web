import { useState, useEffect } from "react";
import { Pencil, Trash2, Eye, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import { listingService, Listing } from "@/lib/api/listingService";
import { authService } from "@/lib/api/authService";
import { toast } from "sonner";

const MyListings = () => {
  const { t } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const loadMyListings = async () => {
      setLoading(true);
      try {
        const user = await authService.fetchMe();
        const data = await listingService.fetchListings({ owner: user.id });
        setListings(data.results);
      } catch (error) {
        console.error("Failed to load my listings", error);
        toast.error(t("errors.listings.loadMine"));
      } finally {
        setLoading(false);
      }
    };
    loadMyListings();
  }, []);

  const typeLabel: Record<string, string> = {
    PROPERTY: t("createListing.propertyLabel"),
    HOTEL_ROOM: t("createListing.hotelLabel"),
    HOSTEL_BED: t("createListing.hostelLabel"),
    TRAVEL_PACKAGE: t("createListing.packageLabel"),
  };

  const handleDeleteListing = async (id: number) => {
    const confirmed = window.confirm(t("myListings.confirmDelete") || "Are you sure you want to delete this listing?");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await listingService.deleteListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
      toast.success(t("myListings.deletedSuccess") || "Listing deleted successfully.");
    } catch (error: any) {
      toast.error(error.message || t("errors.listings.delete") || "Failed to delete listing.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">{t("myListings.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{listings.length} {t("home.listings")}</p>
          </div>
          <Link to="/dashboard/create"><Button className="rounded-xl">{t("myListings.addListing")}</Button></Link>
        </div>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-semibold">{t("listings.noResults")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("myListings.noListings")}</p>
              <Link to="/dashboard/create" className="mt-6">
                <Button variant="outline">{t("myListings.addListing")}</Button>
              </Link>
            </div>
          ) : (
            listings.map((listing) => (
              <div key={listing.id} className="flex items-center gap-4 rounded-2xl border bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover">
                <img src={listing.cover_image} alt={listing.title} className="h-20 w-28 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                      {typeLabel[listing.listing_type] || listing.listing_type}
                    </span>
                    <h3 className="font-heading text-base font-semibold text-foreground truncate">{listing.title}</h3>
                  </div>
                  <p className="mt-0.5 text-sm text-primary font-semibold">{Number(listing.price).toLocaleString()} {t("common.da")}</p>
                  <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${listing.approval_status === "APPROVED" ? "bg-accent text-accent-foreground" : "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"}`}>
                    {listing.approval_status === "APPROVED" ? t("common.approved") : t("common.pending")}
                  </span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link to={`/listing/${listing.id}`}><Button variant="outline" size="icon" className="rounded-xl"><Eye className="h-4 w-4" /></Button></Link>
                  <Link to={`/dashboard/edit/${listing.id}`}><Button variant="outline" size="icon" className="rounded-xl"><Pencil className="h-4 w-4" /></Button></Link>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteListing(listing.id)}
                    disabled={deletingId === listing.id}
                  >
                    {deletingId === listing.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyListings;
