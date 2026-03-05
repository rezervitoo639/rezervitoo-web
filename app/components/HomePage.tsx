'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useI18n } from '../contexts/I18nContext';
import styles from './HomePage.module.css';

export default function HomePage() {
    const { t, language } = useI18n();
    const sectionsRef = useRef<HTMLElement[]>([]);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px',
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(styles.revealed);
                }
            });
        }, observerOptions);

        sectionsRef.current.forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className={styles.homePage}>
            {/* Hero Section */}
            <section className={styles.hero} ref={(el) => { if (el) sectionsRef.current.push(el); }}>
                <div className={styles.heroBackground}>
                    <img
                        src="/hero_background.png"
                        alt="Algerian Sahara"
                        className={styles.heroImage}
                    />
                    <div className={styles.heroOverlay} />
                </div>
                <div className="container">
                    <div className={styles.heroContent}>
                        <div className={styles.heroText}>
                            <p className={styles.tagline}>{t.hero.tagline}</p>
                            <h1>
                                {t.hero.headline} <span className="gradient-text">rezervitoo</span>
                            </h1>
                            <p className={styles.subheadline}>{t.hero.subheadline}</p>
                            <div className={styles.heroActions}>
                                <a href="#download" className="btn btn-primary btn-large">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                        />
                                    </svg>
                                    {t.hero.downloadNow}
                                </a>
                                <a href="#services" className="btn btn-secondary btn-large">
                                    {t.hero.learnMore}
                                </a>
                            </div>
                            <p className={styles.availableOn}>{t.hero.availableOn}</p>
                            <div className={styles.storeBadges}>
                                <img
                                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40'%3E%3Crect width='120' height='40' rx='5' fill='%23000'/%3E%3Ctext x='60' y='25' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3EApp Store%3C/text%3E%3C/svg%3E"
                                    alt="Download on App Store"
                                />
                                <img
                                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='135' height='40'%3E%3Crect width='135' height='40' rx='5' fill='%23000'/%3E%3Ctext x='67.5' y='25' font-family='Arial' font-size='12' fill='white' text-anchor='middle'%3EGoogle Play%3C/text%3E%3C/svg%3E"
                                    alt="Get it on Google Play"
                                />
                            </div>

                            <div className={styles.heroStats}>
                                <div className={styles.heroStatItem}>
                                    <span className={styles.heroStatNumber}>10K+</span>
                                    <span className={styles.heroStatLabel}>{t.stats.users}</span>
                                </div>
                                <div className={styles.heroStatDivider} />
                                <div className={styles.heroStatItem}>
                                    <span className={styles.heroStatNumber}>2.5K+</span>
                                    <span className={styles.heroStatLabel}>{t.stats.properties}</span>
                                </div>
                                <div className={styles.heroStatDivider} />
                                <div className={styles.heroStatItem}>
                                    <span className={styles.heroStatNumber}>48+</span>
                                    <span className={styles.heroStatLabel}>{t.stats.cities}</span>
                                </div>
                                <div className={styles.heroStatDivider} />
                                <div className={styles.heroStatItem}>
                                    <span className={styles.heroStatNumber}>15K+</span>
                                    <span className={styles.heroStatLabel}>{t.stats.reviews}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className={`${styles.services} section scroll-reveal`} ref={(el) => { if (el) sectionsRef.current.push(el); }}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2>{t.services.title}</h2>
                        <p>{t.services.subtitle}</p>
                    </div>
                    <div className={styles.servicesGrid}>
                        <div className={`${styles.serviceCard} ${styles.cardHotel}`}>
                            <div className={styles.serviceIcon}>
                                <img src="/service_hotels.png" alt={t.services.hotels.title} />
                            </div>
                            <h3>{t.services.hotels.title}</h3>
                            <p>{t.services.hotels.description}</p>
                        </div>
                        <div className={`${styles.serviceCard} ${styles.cardHostel}`}>
                            <div className={styles.serviceIcon}>
                                <img src="/service_hostels.png" alt={t.services.hostels.title} />
                            </div>
                            <h3>{t.services.hostels.title}</h3>
                            <p>{t.services.hostels.description}</p>
                        </div>
                        <div className={`${styles.serviceCard} ${styles.cardRentals}`}>
                            <div className={styles.serviceIcon}>
                                <img src="/service_rentals.png" alt={t.services.privateRentals.title} />
                            </div>
                            <h3>{t.services.privateRentals.title}</h3>
                            <p>{t.services.privateRentals.description}</p>
                        </div>
                        <div className={`${styles.serviceCard} ${styles.cardAgencies}`}>
                            <div className={styles.serviceIcon}>
                                <img src="/service_agencies.png" alt={t.services.travelAgencies.title} />
                            </div>
                            <h3>{t.services.travelAgencies.title}</h3>
                            <p>{t.services.travelAgencies.description}</p>
                        </div>
                    </div>

                    <div className={styles.servicesFooter}>
                        <Link href="/services" className="btn btn-secondary btn-large">
                            {language === 'ar' ? 'عرض تفاصيل الخدمات' : language === 'fr' ? 'Voir détails des services' : 'View Detailed Services'}
                            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginInlineStart: 'var(--spacing-sm)' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className={`${styles.howItWorks} section scroll-reveal`} ref={(el) => { if (el) sectionsRef.current.push(el); }}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2>{t.howItWorks.title}</h2>
                    </div>
                    <div className={styles.stepsGrid}>
                        {t.howItWorks.steps.map((step, index) => (
                            <div key={index} className={styles.stepCard}>
                                <div className={styles.stepNumber}>{index + 1}</div>
                                <h3>{step}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform Section */}
            <section className={`${styles.platform} section scroll-reveal`} ref={(el) => { if (el) sectionsRef.current.push(el); }}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2>{t.platform.title}</h2>
                        <p>{t.platform.subtitle}</p>
                    </div>
                    <div className={styles.platformGrid}>
                        <div className={`${styles.platformCard} ${styles.cardBlue}`}>
                            <div className={styles.platformHeader}>
                                <div className={styles.platformIcon}>
                                    <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3>{t.platform.travelers.title}</h3>
                                    <p>{t.platform.travelers.subtitle}</p>
                                </div>
                            </div>
                            <ul className={styles.featureList}>
                                {t.platform.travelers.features.map((feature, index) => (
                                    <li key={index}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <a href="#download" className="btn btn-primary">
                                {t.hero.downloadNow}
                            </a>
                        </div>

                        <div className={`${styles.platformCard} ${styles.cardGreen}`}>
                            <div className={styles.platformHeader}>
                                <div className={styles.platformIcon}>
                                    <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <h3>{t.platform.providers.title}</h3>
                                    <p>{t.platform.providers.subtitle}</p>
                                </div>
                            </div>
                            <div className={styles.providerCategories}>
                                {t.platform.providers.categories.map((category, index) => (
                                    <div key={index} className={styles.categoryBadge}>
                                        {category}
                                    </div>
                                ))}
                            </div>
                            <ul className={styles.featureList}>
                                {t.platform.providers.features.map((feature, index) => (
                                    <li key={index}>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <a href="/register" className="btn btn-primary">
                                {t.nav.forProviders}
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={`${styles.features} section scroll-reveal`} ref={(el) => { if (el) sectionsRef.current.push(el); }}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2>{t.features.title}</h2>
                        <p>{t.features.subtitle}</p>
                    </div>
                    <div className="grid grid-4">
                        <div className={`${styles.featureCard} ${styles.featureCardBlue}`}>
                            <div className={styles.featureIcon}>
                                <img src="/feat_booking.png" alt={t.features.booking.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            </div>
                            <h4>{t.features.booking.title}</h4>
                            <p>{t.features.booking.description}</p>
                        </div>
                        <div className={`${styles.featureCard} ${styles.featureCardPink}`}>
                            <div className={styles.featureIcon}>
                                <img src="/feat_verification.png" alt={t.features.verification.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                            </div>
                            <h4>{t.features.verification.title}</h4>
                            <p>{t.features.verification.description}</p>
                        </div>
                        <div className={`${styles.featureCard} ${styles.featureCardGreen}`}>
                            <div className={styles.featureIcon} style={{ background: 'var(--accent-green)', color: 'white' }}>
                                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h4>{t.features.pricing.title}</h4>
                            <p>{t.features.pricing.description}</p>
                        </div>
                        <div className={`${styles.featureCard} ${styles.featureCardOrange}`}>
                            <div className={styles.featureIcon} style={{ background: 'var(--accent-orange)', color: 'white' }}>
                                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h4>{t.features.support.title}</h4>
                            <p>{t.features.support.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Become a Partner Section */}
            <section id="partner" className={`${styles.partner} section scroll-reveal`} ref={(el) => { if (el) sectionsRef.current.push(el); }}>
                <div className="container">
                    <div className={styles.partnerContent}>
                        <div className={styles.partnerText}>
                            <h2>{t.partner.title}</h2>
                            <p className={styles.subheadline}>{t.partner.description}</p>

                            <div className={styles.partnerTypes}>
                                {t.partner.types.map((type, index) => (
                                    <span key={index} className={styles.typeBadge}>{type}</span>
                                ))}
                            </div>

                            <div className={styles.partnerBenefits}>
                                {t.partner.benefits.map((benefit, index) => (
                                    <div key={index} className={styles.benefitItem}>
                                        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>{benefit}</span>
                                    </div>
                                ))}
                            </div>

                            <Link href="/register" className="btn btn-primary btn-large">
                                {t.partner.cta}
                            </Link>
                        </div>
                        <div className={styles.partnerVisual}>
                            <img src="https://images.unsplash.com/photo-1543269664-76bc3997d9ea?auto=format&fit=crop&q=80&w=1000" alt="Become a Partner" />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className={`${styles.faq} section scroll-reveal`} ref={(el) => { if (el) sectionsRef.current.push(el); }}>
                <div className="container">
                    <div className={styles.sectionHeader}>
                        <h2>{t.faq.title}</h2>
                    </div>
                    <div className={styles.faqList}>
                        {t.faq.items.map((item, index) => (
                            <div key={index} className={styles.faqItem}>
                                <h3>{item.question}</h3>
                                <p>{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* App Download Section */}
            <section id="download" className={`${styles.downloadSection} section scroll-reveal`} ref={(el) => { if (el) sectionsRef.current.push(el); }}>
                <div className="container">
                    <div className={styles.downloadContent}>
                        <div className={styles.downloadText}>
                            <h2>{t.download.title}</h2>
                            <p className={styles.downloadSubtitle}>{t.download.subtitle}</p>
                            <p>{t.download.description}</p>
                            <div className={styles.downloadButtons}>
                                <a href="#" className={styles.storeButton}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                    </svg>
                                    <div>
                                        <div className={styles.storeBadgeSmall}>{language === 'ar' ? 'حمّل من' : 'Download on'}</div>
                                        <div className={styles.storeBadgeLarge}>App Store</div>
                                    </div>
                                </a>
                                <a href="#" className={styles.storeButton}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                                    </svg>
                                    <div>
                                        <div className={styles.storeBadgeSmall}>{language === 'ar' ? 'حمّل من' : 'Get it on'}</div>
                                        <div className={styles.storeBadgeLarge}>Google Play</div>
                                    </div>
                                </a>
                            </div>
                        </div>
                        <div className={styles.downloadVisual}>
                            <div className={styles.mockupContainer}>
                                <div className={styles.mockupWrapper}>
                                    <div className={styles.mockupFrame}>
                                        <img
                                            src="/app-user-screenshot.png"
                                            alt="User App"
                                            className={styles.mockupImage}
                                        />
                                    </div>
                                    <span className={styles.mockupLabel}>{language === 'ar' ? 'تطبيق المستخدم' : 'User App'}</span>
                                </div>
                                <div className={styles.mockupWrapper}>
                                    <div className={styles.mockupFrame}>
                                        <img
                                            src="/app-provider-screenshot.png"
                                            alt="Provider App"
                                            className={styles.mockupImage}
                                        />
                                    </div>
                                    <span className={styles.mockupLabel}>{language === 'ar' ? 'تطبيق مقدم الخدمة' : 'Provider App'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
