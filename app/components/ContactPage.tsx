'use client';

import React, { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import styles from './ContactPage.module.css';

export default function ContactPage() {
    const { t } = useI18n();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add form submission logic here
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className={styles.contactPage}>
            <div className={styles.pageHeader}>
                <div className="container">
                    <h1>{t.contact.title}</h1>
                    <p>{t.contact.subtitle}</p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    <div className={styles.contactGrid}>
                        {/* Contact Form */}
                        <div className={styles.formSection}>

                            <form onSubmit={handleSubmit} className={styles.contactForm}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">{t.contact.name}</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="email">{t.contact.email}</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="phone">{t.contact.phone}</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="message">{t.contact.message}</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className={styles.textarea}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary btn-large">
                                    {t.contact.send}
                                </button>
                            </form>
                        </div>

                        {/* Contact Info */}
                        <div className={styles.infoSection}>
                            <div className={styles.infoCard}>
                                <div className={styles.infoIcon}>
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <h3>{t.contact.location}</h3>
                                <p>Algiers, Algeria</p>
                                <p>16000</p>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.infoIcon}>
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3>{t.contact.emailUs}</h3>
                                <p>contact@rezervitoo.com</p>
                                <p>support@rezervitoo.com</p>
                            </div>

                            <div className={styles.infoCard}>
                                <div className={styles.infoIcon}>
                                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                        />
                                    </svg>
                                </div>
                                <h3>{t.contact.callUs}</h3>
                                <p>+213 xxx xxx xxx</p>
                                <p>+213 xxx xxx xxx</p>
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className={styles.mapSection}>
                        <h2>{t.contact.location}</h2>
                        <div className={styles.mapContainer}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d206253.94896058927!2d2.9842624!3d36.7538259!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb26977ea5725%3A0x66f3146678e8be89!2sAlgiers%2C%20Algeria!5e0!3m2!1sen!2s!4v1234567890"
                                width="100%"
                                height="450"
                                style={{ border: 0, borderRadius: 'var(--radius-xl)' }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
