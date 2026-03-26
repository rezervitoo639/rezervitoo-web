import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Facebook, Instagram, Linkedin, Phone, Mail } from "lucide-react";
import { supportService, SupportContact } from "@/lib/api/supportService";

const TikTokIcon = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const Footer = () => {
  const { t } = useLanguage();
  const [contactInfo, setContactInfo] = useState<SupportContact | null>(null);

  useEffect(() => {
    const loadContact = async () => {
      try {
        const data = await supportService.fetchSupportContact();
        setContactInfo(data);
      } catch (error) {
        console.error("Failed to load footer social links", error);
      }
    };
    loadContact();
  }, []);

  const socialLinks = contactInfo ? [
    contactInfo.facebook && {
      href: contactInfo.facebook,
      icon: Facebook,
      label: "Facebook",
    },
    contactInfo.instagram && {
      href: contactInfo.instagram,
      icon: Instagram,
      label: "Instagram",
    },
    contactInfo.whatsapp_phone && {
      href: `https://wa.me/${contactInfo.whatsapp_phone.replace(/\D/g, "")}`,
      icon: Phone,
      label: "WhatsApp",
    },
    contactInfo.tiktok && {
      href: contactInfo.tiktok,
      icon: TikTokIcon,
      label: "TikTok",
    },
    contactInfo.linkedin && {
      href: contactInfo.linkedin,
      icon: Linkedin,
      label: "LinkedIn",
    },
  ].filter(Boolean) as { href: string; icon: any; label: string }[] : [];

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo-full.png" alt="rezervitoo" className="h-10 w-auto" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t("footer.tagline")}</p>

            {/* Email Contact */}
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              <Mail className="h-4 w-4" />
              <a href="mailto:rezervitoo639@gmail.com">rezervitoo639@gmail.com</a>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    title={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">{t("footer.platform")}</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/listings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.browseListings")}</Link></li>
              <li><Link to="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.ourServices")}</Link></li>
              <li><Link to="/dashboard/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.postListing")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">{t("footer.company")}</h4>
            <ul className="mt-3 space-y-2">
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.about")}</Link></li>
              <li><Link to="/contact#faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("faq.title")}</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.contact")}</Link></li>
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("footer.terms")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading text-sm font-semibold text-foreground">{t("footer.language")}</h4>
            <div className="mt-3">
              <LanguageSwitcher variant="inline" />
            </div>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Rezervitoo. {t("footer.rights")}.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
