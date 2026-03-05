'use client';

import { useI18n } from '../contexts/I18nContext';
import styles from '../components/LegalPage.module.css';

export default function TermsPage() {
    const { t, language } = useI18n();
    const terms = t.termsPage;

    if (!terms) return null;

    return (
        <div className={styles.legalPage} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={styles.legalContainer}>
                <div className={styles.legalHeader}>
                    <h1>{terms.title}</h1>
                    <p className={styles.lastUpdated}>{terms.lastUpdated}</p>
                </div>

                <div className={styles.legalContent}>
                    <p className={styles.introText}>
                        {terms.introduction}
                    </p>

                    {terms.sections.map((section: any, index: number) => (
                        <div key={index} className={styles.section}>
                            <h2>{section.title}</h2>
                            <p>{section.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
