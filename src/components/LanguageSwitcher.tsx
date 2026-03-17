import { Globe } from "lucide-react";
import { useLanguage, type Language } from "@/i18n/LanguageContext";

const languages: { code: Language; label: string }[] = [
  { code: "ar", label: "العربية" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

const LanguageSwitcher = ({ variant = "dropdown" }: { variant?: "dropdown" | "inline" }) => {
  const { language, setLanguage } = useLanguage();

  if (variant === "inline") {
    return (
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`text-sm transition-colors ${
              language === lang.code
                ? "font-semibold text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{languages.find((l) => l.code === language)?.label}</span>
      </button>
      <div className="absolute end-0 top-full z-50 mt-1 hidden w-36 overflow-hidden rounded-xl border bg-card shadow-elevated group-hover:block">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`block w-full px-4 py-2.5 text-start text-sm transition-colors hover:bg-muted ${
              language === lang.code ? "bg-accent font-semibold text-accent-foreground" : "text-foreground"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSwitcher;
