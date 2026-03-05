'use client';

import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import styles from './ServicesPage.module.css';

export default function ServicesPage() {
    const { t } = useI18n();

    const detailedServices = [
        {
            id: 'hotels',
            title: t.services.hotels.title,
            description: t.services.hotels.description,
            longDescription: t.services.hotels.description + " " + (t.hero.subheadline || ""),
            features: t.servicesPage.features.hotels,
            image: "/service_hotels.png",
            className: styles.cardHotel
        },
        {
            id: 'hostels',
            title: t.services.hostels.title,
            description: t.services.hostels.description,
            longDescription: t.services.hostels.description + " " + (t.hero.subheadline || ""),
            features: t.servicesPage.features.hostels,
            image: "/service_hostels.png",
            className: styles.cardHostel
        },
        {
            id: 'rentals',
            title: t.services.privateRentals.title,
            description: t.services.privateRentals.description,
            longDescription: t.services.privateRentals.description + " " + (t.hero.subheadline || ""),
            features: t.servicesPage.features.rentals,
            image: "/service_rentals.png",
            className: styles.cardRentals
        },
        {
            id: 'agencies',
            title: t.services.travelAgencies.title,
            description: t.services.travelAgencies.description,
            longDescription: t.services.travelAgencies.description + " " + (t.hero.subheadline || ""),
            features: t.servicesPage.features.agencies,
            image: "/service_agencies.png",
            className: styles.cardAgencies
        }
    ];

    return (
        <div className={styles.servicesPage}>
            <div className={styles.pageHeader}>
                <div className="container">
                    <h1>{t.services.title}</h1>
                    <p>{t.services.subtitle}</p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    <div className={styles.detailedGrid}>
                        {detailedServices.map((service) => (
                            <div key={service.id} className={`${styles.detailCard} ${service.className}`}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.detailIcon}>
                                        <img src={service.image} alt={service.title} />
                                    </div>
                                    <div className={styles.headerInfo}>
                                        <h2>{service.title}</h2>
                                        <p className={styles.accentText}>{service.description}</p>
                                    </div>
                                </div>
                                <div className={styles.cardBody}>
                                    <p>{service.longDescription}</p>
                                    <div className={styles.featuresList}>
                                        <h4>{t.servicesPage.keyFeatures}</h4>
                                        <ul>
                                            {service.features.map((feat, i) => (
                                                <li key={i}>
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    {feat}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className={`${styles.ctaSection} section`}>
                <div className="container">
                    <div className={styles.ctaBox}>
                        <h2>{t.servicesPage.cta.title}</h2>
                        <p>{t.servicesPage.cta.subtitle}</p>
                        <div className={styles.ctaButtons}>
                            <a href="/#download" className="btn btn-primary btn-large">{t.servicesPage.cta.download}</a>
                            <a href="/contact" className="btn btn-secondary btn-large">{t.servicesPage.cta.support}</a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
