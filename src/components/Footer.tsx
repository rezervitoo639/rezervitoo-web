import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo-full.png" alt="rezervitoo" className="h-10 w-auto" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t("footer.tagline")}</p>
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
