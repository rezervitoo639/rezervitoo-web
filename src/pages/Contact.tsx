import { motion } from "framer-motion";
import { Facebook, Instagram, Linkedin, MessageSquare, Loader2, Music2, LifeBuoy } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { supportService, SupportContact } from "@/lib/api/supportService";

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="font-heading text-4xl font-bold md:text-5xl">{t("contact.title")}</h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">{t("contact.subtitle")}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-secondary/10">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold md:text-4xl">{t("faq.title")}</h2>
            <div className="mt-4 mx-auto h-1 w-20 bg-primary rounded-full"></div>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <AccordionItem 
                key={i} 
                value={`item-${i}`}
                className="border rounded-2xl px-6 bg-card data-[state=open]:border-primary/50 transition-all duration-300 shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="text-start font-heading font-bold text-lg py-5 hover:no-underline">
                  {t(`faq.q${i}`)}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-md leading-relaxed pb-6">
                  {t(`faq.a${i}`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
