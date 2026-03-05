'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '../contexts/I18nContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Register() {
    const { t } = useI18n();

    return (
        <>
            <Header />
            <main style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '80vh' }}>
                <div className="container">
                    <div style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        textAlign: 'center',
                        background: 'var(--bg-card)',
                        padding: '48px',
                        borderRadius: '24px',
                        boxShadow: 'var(--shadow-lg)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <h1 style={{ marginBottom: '24px', fontSize: '2.5rem' }}>{t.registerPage.title}</h1>

                        <div style={{
                            background: 'rgba(52, 152, 219, 0.1)',
                            padding: '24px',
                            borderRadius: '16px',
                            marginBottom: '40px',
                            border: '1px solid var(--primary-color)'
                        }}>
                            <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                                {t.registerPage.message}
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center' }}>
                            <Link href="/#download" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                                {t.registerPage.ctaApp}
                            </Link>
                            <Link href="/" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                                {t.registerPage.backHome}
                            </Link>
                        </div>


                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
