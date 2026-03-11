'use client';

import React from 'react';
import FeaturedListings from '../components/FeaturedListings';
import { useI18n } from '../contexts/I18nContext';

export default function ExplorePage() {
    const { t } = useI18n();

    return (
        <main className="pt-24 min-h-screen">
            <div className="container">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold mb-4">{t.nav.explore}</h1>
                    <p className="text-xl text-muted-foreground">{t.hero.subheadline}</p>
                </div>
                <FeaturedListings />
            </div>
        </main>
    );
}
