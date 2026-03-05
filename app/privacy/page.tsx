'use client';

import { useI18n } from '../contexts/I18nContext';
import styles from '../components/LegalPage.module.css';

export default function PrivacyPage() {
    const { t, language } = useI18n();
    const privacy = t.privacyPage;

    if (!privacy) return null;

    return (
        <div className={styles.legalPage} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={styles.legalContainer}>
                <div className={styles.legalHeader}>
                    <h1>{privacy.title}</h1>
                    <p className={styles.lastUpdated}>{privacy.lastUpdated}</p>
                </div>

                <div className={styles.legalContent}>
                    <p className={styles.introText}>
                        {privacy.introduction}
                    </p>

                    {privacy.sections.map((section: any, index: number) => (
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
