import { motion } from "framer-motion";
import { Search, Home, Users, Phone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import { useLanguage } from "@/i18n/LanguageContext";

import heroBg from "@/assets/hero_background.png";
import clientAppImg from "@/assets/about/client_app_screenshot.png";
import providerAppImg from "@/assets/about/provider_app_screenshot.png";
import city1 from "@/assets/city-1.jpg";
import city2 from "@/assets/city-2.jpg";
import city3 from "@/assets/city-3.jpg";
import city4 from "@/assets/city-4.jpg";

import { useState, useEffect } from "react";
import { listingService, Listing } from "@/lib/api/listingService";
import { POPULAR_WILAYAS, getWilayas } from "@/lib/algeriaLocations";

const cityImages = [city1, city2, city3, city4, city1, city2];

const Index = () => {
  const { t, language } = useLanguage();
  const isAr = language === "ar";
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationCounts, setLocationCounts] = useState<{ name: string; nameAr: string; code: string; count: number }[]>([]);

  useEffect(() => {
    const loadLatestListings = async () => {
      setLoading(true);
      try {
        const data = await listingService.fetchListings({
          page_size: 6,
          approval_status: "APPROVED",
          is_active: true,
        });
        setListings(data.results);
      } catch (error) {
        console.error("Failed to load hero listings", error);
      } finally {
        setLoading(false);
      }
    };

    loadLatestListings();
  }, []);

  // Load popular location counts
  useEffect(() => {
    const wilayas = getWilayas();
    const loadCounts = async () => {
      const results = await Promise.all(
        POPULAR_WILAYAS.map(async (code) => {
          const w = wilayas.find((wl) => wl.code === code);
          if (!w) return null;
          try {
            const data = await listingService.fetchListings({
              page_size: 1,
              approval_status: "APPROVED",
              is_active: true,
              search: w.nameAscii,
            });
            return { name: w.nameAscii, nameAr: w.nameAr, code, count: data.count };
          } catch {
            return { name: w.nameAscii, nameAr: w.nameAr, code, count: 0 };
          }
        })
      );
      setLocationCounts(results.filter(Boolean) as any);
    };
    loadCounts();
  }, []);

  const steps = [
    { icon: Home, title: t("home.step1Title"), desc: t("home.step1Desc") },
    { icon: Search, title: t("home.step2Title"), desc: t("home.step2Desc") },
    { icon: Phone, title: t("home.step3Title"), desc: t("home.step3Desc") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="container relative mx-auto px-4 py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="font-heading text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80">
              {t("hero.subtitle")}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-2xl"
          >
            <SearchBar />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="outline" className="h-12 rounded-xl border-white/20 bg-white/10 px-4 font-semibold text-white backdrop-blur-md hover:bg-white/20">
                <div className="me-2 flex h-6 w-6 items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.523 15.3414C18.1109 14.8364 18.5 14.0414 18.5 13.1364C18.5 12.2314 18.1109 11.4364 17.523 10.9314L5.686 4.14141C4.836 3.65141 3.75 4.28141 3.75 5.25141V20.9814C3.75 21.9514 4.836 22.5814 5.686 22.0914L17.523 15.3414Z" />
                  </svg>
                </div>
                <div className="text-start">
                  <p className="text-[8px] uppercase opacity-60 leading-none mb-0.5">Get it on</p>
                  <p className="text-xs font-bold leading-none">Google Play</p>
                </div>
              </Button>
              <Button variant="outline" className="h-12 rounded-xl border-white/20 bg-white/10 px-4 font-semibold text-white backdrop-blur-md hover:bg-white/20">
                <div className="me-2 flex h-6 w-6 items-center justify-center">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.71 19.5C17.88 20.74 17 22 15.81 22C14.62 22 14.27 21.33 12.9 21.33C11.53 21.33 11.1 22 10 22C8.9 22 8 20.64 7.17 19.41C5.47 17.11 4.18 13.43 5.92 10.45C6.77 9 8.28 8.12 9.9 8.12C11.13 8.12 12.21 8.91 13 8.91C13.79 8.91 15.13 8 16.5 8.11C17.08 8.13 18.72 8.35 19.74 9.84C19.66 9.89 17.65 11.06 17.65 13.68C17.65 16.73 20.3 17.73 20.3 17.73C20.25 17.82 19.86 19.22 18.71 19.5ZM13 6.64C13.56 5.91 13.91 4.93 13.91 3.94C13.91 3.78 13.88 3.58 13.84 3.39C12.83 3.44 11.66 4.09 11 4.85C10.41 5.53 9.9 6.51 9.9 7.55C9.9 7.74 9.92 7.93 9.97 8.08C11.09 8 12.33 7.42 13 6.64Z" />
                  </svg>
                </div>
                <div className="text-start">
                  <p className="text-[8px] uppercase opacity-60 leading-none mb-0.5">Download on the</p>
                  <p className="text-xs font-bold leading-none">App Store</p>
                </div>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl">{t("home.popularLocations")}</h2>
            <p className="mt-2 text-muted-foreground">{t("home.popularLocationsDesc")}</p>
          </div>
          <Link to="/listings" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
            {t("home.viewAll")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(locationCounts.length > 0 ? locationCounts : POPULAR_WILAYAS.map((code, i) => ({ name: "", nameAr: "", code, count: 0 }))).slice(0, 6).map((loc, i) => (
            <motion.div
              key={loc.code}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link
                to={`/listings?wilaya=${isAr ? loc.nameAr : loc.name}`}
                className="group relative block overflow-hidden rounded-2xl"
              >
                <div className="aspect-[4/3]">
                  <img
                    src={cityImages[i % cityImages.length]}
                    alt={isAr ? loc.nameAr : loc.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 to-transparent" />
                <div className="absolute bottom-4 start-4">
                  <h3 className="font-heading text-lg font-semibold text-primary-foreground">
                    {isAr ? loc.nameAr : loc.name || "..."}
                  </h3>
                  <p className="text-sm text-primary-foreground/80">
                    {loc.count} {t("home.listings")}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Latest Listings */}
      <section className="bg-secondary/50">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl">{t("home.latestListings")}</h2>
              <p className="mt-2 text-muted-foreground">{t("home.latestListingsDesc")}</p>
            </div>
            <Link to="/listings" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline md:flex">
              {t("home.viewAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8">
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-muted" />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing, i) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <ListingCard
                      id={listing.id}
                      image={listing.cover_image}
                      title={listing.title}
                      location={listing.location_text}
                      price={listing.price}
                      type={listing.listing_type}
                      negotiable={listing.negotiable}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">{t("listings.noResults")}</p>
            )}
          </div>
        </div>
      </section>

      {/* Experiences Section */}
      <section className="py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* For Travelers */}
          <div className="grid gap-12 lg:grid-cols-2 items-center mb-24">
            <motion.div 
              initial={{ opacity: 0, x: isAr ? 30 : -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6 }}
            >
              <div className="relative mx-auto w-full max-w-[260px]">
                <div className="relative rounded-[2.5rem] border-[6px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden aspect-[9/19]">
                  <div className="absolute top-0 left-1/2 z-20 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-slate-900"></div>
                  <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-background">
                    <img src={clientAppImg} alt="Traveler Experience" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: isAr ? -30 : 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold font-heading">{t("about.clientTitle")}</h2>
              <p className="text-lg text-muted-foreground">{t("about.clientDesc")}</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{t(`about.clientFeature${i}`)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* For Providers */}
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <motion.div 
              initial={{ opacity: 0, x: isAr ? 30 : -30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 space-y-6"
            >
              <h2 className="text-3xl font-bold font-heading">{t("about.providerTitle")}</h2>
              <p className="text-lg text-muted-foreground">{t("about.providerDesc")}</p>
              <ul className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium">{t(`about.providerFeature${i}`)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: isAr ? -30 : 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }} 
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="relative mx-auto w-full max-w-[260px]">
                <div className="relative rounded-[2.5rem] border-[6px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden aspect-[9/19]">
                  <div className="absolute top-0 left-1/2 z-20 h-5 w-24 -translate-x-1/2 rounded-b-xl bg-slate-900"></div>
                  <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-background">
                    <img src={providerAppImg} alt="Provider Experience" className="h-full w-full object-cover" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-secondary/30 rounded-3xl mt-20 mb-20">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-foreground md:text-3xl">{t("home.howItWorks")}</h2>
          <p className="mt-2 text-muted-foreground">{t("home.howItWorksDesc")}</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                <step.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary">
        <div className="container mx-auto px-4 py-16 text-center md:py-20">
          <h2 className="font-heading text-2xl font-bold text-primary-foreground md:text-3xl">
            {t("home.ctaTitle")}
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            {t("home.ctaDesc")}
          </p>
          <Link to="/dashboard/create">
            <Button size="lg" variant="secondary" className="mt-6 rounded-xl font-semibold">
              {t("home.ctaButton")}
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
