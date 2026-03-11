'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../contexts/ThemeContext';
import { Language } from '../i18n/translations';
import styles from './Header.module.css';

export default function Header() {
    const { t, language, setLanguage, dir } = useI18n();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const languages: { code: Language; label: string }[] = [
        { code: 'ar', label: t.language.arabic },
        { code: 'en', label: t.language.english },
        { code: 'fr', label: t.language.french },
    ];

    return (
        <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
            <div className="container">
                <div className={styles.headerContent}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <img
                            src="/logo.svg"
                            alt="rezervitoo"
                            className={styles.logoImg}
                        />
                        <span className={styles.logoText}>rezervitoo</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className={styles.nav}>
                        <Link href="/">{t.nav.home}</Link>
                        <Link href="/explore">{t.nav.explore}</Link>
                        <Link href="/services">{t.nav.services}</Link>
                        <Link href="/about">{t.nav.about}</Link>
                        <Link href="/contact">{t.nav.contact}</Link>
                    </nav>

                    {/* Actions */}
                    <div className={styles.actions}>
                        {/* Language Switcher */}
                        <div className={styles.languageSelector}>
                            <button className={styles.languageBtn} aria-label="Select language">
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                                    />
                                </svg>
                                <span className={styles.currentLang}>{language.toUpperCase()}</span>
                            </button>
                            <div className={styles.languageDropdown}>
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguage(lang.code)}
                                        className={language === lang.code ? styles.active : ''}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme Toggle */}
                        <button className={styles.themeToggle} onClick={toggleTheme} aria-label={t.theme.toggle}>
                            {theme === 'light' ? (
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                    />
                                </svg>
                            ) : (
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            )}
                        </button>

                        {/* Download Button */}
                        <Link href="#download" className={`btn btn-primary btn-small ${styles.downloadBtn}`}>
                            {t.nav.downloadApp}
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <button
                            className={styles.menuToggle}
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {!isMenuOpen ? (
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
                <nav className={styles.mobileNav}>
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>{t.nav.home}</Link>
                    <Link href="/explore" onClick={() => setIsMenuOpen(false)}>{t.nav.explore}</Link>
                    <Link href="/services" onClick={() => setIsMenuOpen(false)}>{t.nav.services}</Link>
                    <Link href="/about" onClick={() => setIsMenuOpen(false)}>{t.nav.about}</Link>
                    <Link href="/contact" onClick={() => setIsMenuOpen(false)}>{t.nav.contact}</Link>
                    <Link href="#download" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                        {t.nav.downloadApp}
                    </Link>
                </nav>
            </div>
        </header>
    );
}
