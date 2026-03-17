import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const Privacy = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-heading text-4xl font-bold mb-8">{t("privacy.title")}</h1>
            <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground space-y-6">
              <section><h2 className="text-xl font-bold text-foreground">{t("privacy.section1Title")}</h2><p>{t("privacy.section1")}</p></section>
              <section><h2 className="text-xl font-bold text-foreground">{t("privacy.section2Title")}</h2><p>{t("privacy.section2")}</p></section>
              <section><h2 className="text-xl font-bold text-foreground">{t("privacy.section3Title")}</h2><p>{t("privacy.section3")}</p></section>
              <section><h2 className="text-xl font-bold text-foreground">{t("privacy.section4Title")}</h2><p>{t("privacy.section4")}</p></section>
              <section><h2 className="text-xl font-bold text-foreground">{t("privacy.section5Title")}</h2><p>{t("privacy.section5")}</p></section>
            </div>
            <p className="mt-12 text-sm text-muted-foreground italic">{t("privacy.lastUpdated")}</p>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Privacy;
