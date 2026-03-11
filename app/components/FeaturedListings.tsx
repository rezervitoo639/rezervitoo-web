'use client';

import React, { useEffect, useState } from 'react';
import { Listing, ListingService } from '../services/ListingService';
import ListingCard from './ListingCard';
import { useI18n } from '../contexts/I18nContext';
import styles from './FeaturedListings.module.css';

const FeaturedListings: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      // Fetch top 8 approved listings
      const data = await ListingService.getListings({ 
        approval_status: 'APPROVED',
        is_active: 'true',
        ordering: '-created_at'
      });
      setListings(data.results.slice(0, 8));
      setLoading(false);
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <section className={styles.section}>
        <div className="container">
          <div className={styles.header}>
            <div className={styles.skeletonTitle}></div>
          </div>
          <div className={styles.grid}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={styles.skeletonCard}></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <span className={styles.tagline}>{t.listings.featured}</span>
            <h2 className={styles.title}>{t.listings.featured}</h2>
          </div>
          <button className={styles.viewAll}>
            {t.listings.viewAll}
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
        <div className={styles.grid}>
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedListings;
