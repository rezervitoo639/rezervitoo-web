'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../i18n/translations';

interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.en;
    dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('ar');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load saved language from localStorage
        const savedLang = localStorage.getItem('language') as Language;
        if (savedLang && ['ar', 'en', 'fr'].includes(savedLang)) {
            setLanguage(savedLang);
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('language', language);
            document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
            document.documentElement.setAttribute('lang', language);
        }
    }, [language, mounted]);

    const value: I18nContextType = {
        language,
        setLanguage,
        t: translations[language],
        dir: language === 'ar' ? 'rtl' : 'ltr',
    };

    if (!mounted) {
        return null;
    }

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (context === undefined) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};
