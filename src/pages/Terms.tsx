import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";

const Terms = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-heading text-4xl font-bold mb-8">{t("terms.title")}</h1>
            <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground space-y-6">
              <section><h2 className="text-xl font-bold text-foreground">{t("terms.section1Title")}</h2><p className="whitespace-pre-wrap">{t("terms.section1")}</p></section>
              <section><h2 className="text-xl font-bold text-foreground">{t("terms.section2Title")}</h2><p className="whitespace-pre-wrap">{t("terms.section2")}</p></section>
              <section><h2 className="text-xl font-bold text-foreground">{t("terms.section3Title")}</h2><p className="whitespace-pre-wrap">{t("terms.section3")}</p></section>
              <section><h2 className="text-xl font-bold text-foreground">{t("terms.section4Title")}</h2><p className="whitespace-pre-wrap">{t("terms.section4")}</p></section>
              <section><h2 className="text-xl font-bold text-foreground">{t("terms.section5Title")}</h2><p className="whitespace-pre-wrap">{t("terms.section5")}</p></section>
              <section><h2 className="text-xl font-bold text-foreground">{t("terms.section6Title")}</h2><p className="whitespace-pre-wrap">{t("terms.section6")}</p></section>
              <section><h2 className="text-xl font-bold text-foreground">{t("terms.section7Title")}</h2><p className="whitespace-pre-wrap">{t("terms.section7")}</p></section>
              <section><h2 className="text-xl font-bold text-foreground">{t("terms.section8Title")}</h2><p className="whitespace-pre-wrap">{t("terms.section8")}</p></section>
            </div>
            <p className="mt-12 text-sm text-muted-foreground italic">{t("terms.lastUpdated")}</p>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Terms;
