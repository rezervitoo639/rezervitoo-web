import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  MapPin, Phone, Star, 
  CheckCircle2, Clock, AlertCircle, 
  Calendar, Shield, Building, LayoutGrid,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { authService, UserProfile } from "@/lib/api/authService";
import { listingService, Listing } from "@/lib/api/listingService";
import { toast } from "sonner";
import ListingCard from "@/components/ListingCard";

const ProviderPublicProfile = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const [provider, setProvider] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviderData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const [userData, listingData] = await Promise.all([
          authService.fetchUserById(id),
          listingService.fetchListings({ 
            owner: id, // Assuming the backend supports owner ID filter
            approval_status: "APPROVED",
            is_active: true
          })
        ]);
        setProvider(userData);
        setListings(listingData.results);
      } catch (error) {
        console.error("Failed to load provider profile", error);
        toast.error(t("common.error") || "Failed to load provider profile");
      } finally {
        setLoading(false);
      }
    };

    loadProviderData();
  }, [id, t]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-bold">{t("common.error")}</h2>
          <p className="mt-2 text-muted-foreground">Provider not found</p>
          <Link to="/listings" className="mt-6">
            <Button>{t("common.back")}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const statusConfig = {
    VERIFIED: {
      icon: CheckCircle2,
      label: t("providerPublic.verifiedProvider"),
      className: "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
    },
    PENDING: {
      icon: Clock,
      label: t("providerPublic.reviewPending"),
      className: "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400",
    },
    UNVERIFIED: {
      icon: AlertCircle,
      label: t("providerProfile.unverified"),
      className: "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
    },
  };

  const status = statusConfig[provider.verification_status] || statusConfig.UNVERIFIED;
  const StatusIcon = status.icon;

  const displayName = provider.role === "HOTEL" 
    ? (provider as any).hotel_name 
    : provider.role === "AGENCY" 
    ? (provider as any).agency_name 
    : provider.role === "HOSTEL"
    ? (provider as any).hostel_name
    : `${provider.first_name} ${provider.last_name}`;

  const roleLabel = provider.role === "HOST" ? t("register.host") 
    : provider.role === "HOTEL" ? t("register.hotel")
    : provider.role === "HOSTEL" ? t("register.hostel")
    : provider.role === "AGENCY" ? t("register.agency")
    : t("common.provider");

  return (
    <div className="min-h-screen bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border bg-card shadow-card"
        >
          <div className="h-40 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          
          <div className="relative px-6 pb-8 pt-0 md:px-10">
            <div className="flex flex-col items-center md:flex-row md:items-end md:gap-8">
              <div className="relative -mt-16 overflow-hidden rounded-full border-4 border-card bg-accent shadow-xl">
                <div className="flex h-32 w-32 items-center justify-center">
                  {provider.pfp ? (
                    <img src={authService.resolveMediaUrl(provider.pfp) || ""} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-heading text-4xl font-bold text-accent-foreground">
                      {provider.first_name?.[0]}{provider.last_name?.[0]}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex-1 text-center md:mt-0 md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                  <h1 className="font-heading text-3xl font-bold text-foreground">
                    {displayName}
                  </h1>
                  <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {status.label}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground md:justify-start">
                  <span className="flex items-center gap-1.5">
                    <Building className="h-4 w-4" />
                    {roleLabel}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {t("providerPublic.joined")} {new Date(provider.created_at).toLocaleDateString(language === "ar" ? "ar-DZ" : language === "fr" ? "fr-FR" : "en-GB", { month: "long", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    {t("providerPublic.identityVerified")}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex w-full flex-col gap-3 md:mt-0 md:w-auto md:flex-row">
                <a href={`tel:${provider.phone}`} className="w-full md:w-auto">
                  <Button className="w-full gap-2 rounded-xl" size="lg">
                    <Phone className="h-4 w-4" />
                    {t("providerPublic.call")}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {[
            { label: t("providerPublic.listings"), value: listings.length.toString(), icon: LayoutGrid },
            { label: t("providerPublic.reviews"), value: "0", icon: Star },
            { label: t("providerPublic.rating"), value: "0.0", icon: Star },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center rounded-2xl border bg-card p-4 text-center shadow-sm"
            >
               <stat.icon className="h-5 w-5 text-primary/60" />
               <div className="mt-2 text-xl font-bold">{stat.value}</div>
               <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold">{t("providerPublic.listingsFrom")} {displayName}</h2>
          </div>
          
          {listings.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <div key={listing.id}>
                  <ListingCard 
                    id={listing.id}
                    image={listing.cover_image}
                    title={listing.title}
                    location={listing.location_text}
                    price={listing.price}
                    type={listing.listing_type}
                    negotiable={listing.negotiable}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center">
              <p className="text-muted-foreground">{t("listings.noResults")}</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProviderPublicProfile;
