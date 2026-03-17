import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, Facebook, Instagram, Linkedin, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";
import { supportService, SupportContact } from "@/lib/api/supportService";

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState<SupportContact | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const loadContact = async () => {
      try {
        const data = await supportService.fetchSupportContact();
        setContactInfo(data);
      } catch (error) {
        console.error("Failed to load support contact", error);
      }
    };
    loadContact();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success(t("contact.successMessage"));
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl font-bold md:text-5xl">{t("contact.title")}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{t("contact.subtitle")}</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0"><Phone className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-heading font-bold text-xl">{t("contact.callUs")}</h3>
                  <p className="mt-1 text-muted-foreground">{t("contact.callDesc")}</p>
                  <p className="mt-2 text-lg font-semibold text-primary">+213 (0) 551 16 02 11</p>
                </div>
              </div>
              
              {contactInfo?.whatsapp_phone && (
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-green-600 shrink-0"><MessageSquare className="h-6 w-6" /></div>
                  <div>
                    <h3 className="font-heading font-bold text-xl">WhatsApp</h3>
                    <p className="mt-1 text-muted-foreground">Message us on WhatsApp for quick support</p>
                    <a href={`https://wa.me/${contactInfo.whatsapp_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-2 block text-lg font-semibold text-green-600 hover:underline">
                      {contactInfo.whatsapp_phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0"><Mail className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-heading font-bold text-xl">{t("contact.emailUs")}</h3>
                  <p className="mt-1 text-muted-foreground">{t("contact.emailDesc")}</p>
                  <p className="mt-2 text-lg font-semibold text-primary">contact@rezervitoo.dz</p>
                </div>
              </div>

              {(contactInfo?.facebook || contactInfo?.instagram || contactInfo?.linkedin) && (
                <div className="pt-4">
                  <h3 className="font-heading font-bold text-xl mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    {contactInfo.facebook && (
                      <a href={contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border hover:border-primary transition-colors text-muted-foreground hover:text-primary shadow-sm">
                        <Facebook className="h-6 w-6" />
                      </a>
                    )}
                    {contactInfo.instagram && (
                      <a href={contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border hover:border-primary transition-colors text-muted-foreground hover:text-primary shadow-sm">
                        <Instagram className="h-6 w-6" />
                      </a>
                    )}
                    {contactInfo.linkedin && (
                      <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border hover:border-primary transition-colors text-muted-foreground hover:text-primary shadow-sm">
                        <Linkedin className="h-6 w-6" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0"><MapPin className="h-6 w-6" /></div>
                <div>
                  <h3 className="font-heading font-bold text-xl">{t("contact.visitUs")}</h3>
                  <p className="mt-1 text-muted-foreground">{t("contact.visitDesc")}</p>
                  <p className="mt-2 text-lg font-semibold text-primary">Cyber Parc de Sidi Abdellah, Alger</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="rounded-3xl border bg-card p-8 shadow-large">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("contact.fullName")}</label>
                    <input required type="text" className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder={t("contact.namePlaceholder")} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("contact.emailAddress")}</label>
                    <input required type="email" className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("contact.subject")}</label>
                  <input required type="text" className="w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder={t("contact.subjectPlaceholder")} value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("contact.message")}</label>
                  <textarea required rows={5} className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder={t("contact.messagePlaceholder")} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                </div>
                <Button type="submit" size="lg" className="w-full rounded-xl gap-2 font-semibold" disabled={isSubmitting}>
                  <Send className={`h-4 w-4 ${isSubmitting ? "animate-pulse" : ""}`} />
                  {isSubmitting ? t("contact.sending") : t("contact.send")}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
