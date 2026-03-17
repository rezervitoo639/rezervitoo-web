import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import ar from "./translations/ar.json";
import en from "./translations/en.json";
import fr from "./translations/fr.json";

export type Language = "ar" | "en" | "fr";

const translations: Record<Language, Record<string, string>> = { ar, en, fr };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("lang") as Language;
    return saved && translations[saved] ? saved : "ar";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
  }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string | number>): string => {
      let translation = translations[language]?.[key] || translations.en?.[key] || key;
      
      if (replacements) {
        Object.entries(replacements).forEach(([k, v]) => {
          translation = translation.replace(`{${k}}`, String(v));
        });
      }
      
      return translation;
    },
    [language]
  );

  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
