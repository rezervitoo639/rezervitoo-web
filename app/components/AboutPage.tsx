'use client';

import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import styles from './AboutPage.module.css';

export default function AboutPage() {
    const { t, language } = useI18n();

    return (
        <div className={styles.aboutPage}>
            <div className={styles.pageHeader}>
                <div className="container">
                    <h1>{t.about.title}</h1>
                    <p>{t.about.subtitle}</p>
                </div>
            </div>

            {/* Story Section */}
            <section className="section">
                <div className="container container-narrow">
                    <p className={styles.storyText}>{t.about.story}</p>
                </div>
            </section>

            {/* Mission, Vision & Values */}
            <section className={`${styles.valuesSection} section`}>
                <div className="container">
                    <div className={styles.valuesGrid}>
                        <div className={`${styles.valueCard} ${styles.cardMission}`}>
                            <div className={styles.valueIcon}>
                                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3>{t.about.mission.title}</h3>
                            <p>{t.about.mission.description}</p>
                        </div>

                        <div className={`${styles.valueCard} ${styles.cardVision}`}>
                            <div className={styles.valueIcon}>
                                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            </div>
                            <h3>{t.about.vision.title}</h3>
                            <p>{t.about.vision.description}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className={`${styles.coreValues} section`}>
                <div className="container">
                    <h2 className={styles.sectionTitle}>{t.about.values.title}</h2>
                    <div className="grid grid-4">
                        <div className="card">
                            <div className={styles.coreValueIcon}>
                                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <h4>{t.about.values.trust}</h4>
                            <p>{language === 'ar' ? 'نبني الثقة من خلال التحقق والشفافية' : language === 'fr' ? 'Nous construisons la confiance par la vérification et la transparence' : 'We build trust through verification and transparency'}</p>
                        </div>

                        <div className="card">
                            <div className={styles.coreValueIcon}>
                                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <h4>{t.about.values.innovation}</h4>
                            <p>{language === 'ar' ? 'نبتكر باستمرار لتحسين تجربتك' : language === 'fr' ? 'Nous innovons constamment pour améliorer votre expérience' : 'We constantly innovate to improve your experience'}</p>
                        </div>

                        <div className="card">
                            <div className={styles.coreValueIcon}>
                                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                    />
                                </svg>
                            </div>
                            <h4>{t.about.values.quality}</h4>
                            <p>{language === 'ar' ? 'نلتزم بأعلى معايير الجودة' : language === 'fr' ? 'Nous nous engageons aux plus hauts standards de qualité' : 'We commit to the highest standards of quality'}</p>
                        </div>

                        <div className="card">
                            <div className={styles.coreValueIcon}>
                                <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            </div>
                            <h4>{t.about.values.support}</h4>
                            <p>{language === 'ar' ? 'دعم متواصل لضمان نجاحك' : language === 'fr' ? 'Support continu pour assurer votre succès' : 'Continuous support to ensure your success'}</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
