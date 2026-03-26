import { motion } from "framer-motion";
import { Bed, Map, Layout, ShieldCheck, Headphones } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";

const Services = () => {
  const { t } = useLanguage();

  const services = [
    { icon: Bed, title: t("services.accommodation"), desc: t("services.accommodationDesc") },
    { icon: Map, title: t("services.travelPackages"), desc: t("services.travelPackagesDesc") },
    { icon: Layout, title: t("services.providerDashboard"), desc: t("services.providerDashboardDesc") },
    { icon: ShieldCheck, title: t("services.verifiedListings"), desc: t("services.verifiedListingsDesc") },
    { icon: Headphones, title: t("services.support"), desc: t("services.supportDesc") },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="py-20 md:py-32 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-heading text-4xl font-bold md:text-6xl">{t("services.title")}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t("services.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <motion.div key={service.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="group relative rounded-3xl border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-large">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <service.icon className="h-7 w-7" />
                </div>
                <h3 className="font-heading text-xl font-bold">{service.title}</h3>
                <p className="mt-3 text-muted-foreground">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <div className="rounded-3xl bg-secondary/30 p-12 md:p-20">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">{t("services.ctaTitle")}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{t("services.ctaDesc")}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/listings"><Button size="lg" className="rounded-xl px-8 font-semibold">{t("services.browseStays")}</Button></Link>
            <Link to="/register"><Button size="lg" variant="outline" className="rounded-xl px-8 font-semibold">{t("services.joinProvider")}</Button></Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
