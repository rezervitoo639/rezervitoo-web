'use client';

import React from 'react';
import { Listing } from '../services/ListingService';
import { useI18n } from '../contexts/I18nContext';
import styles from './ListingCard.module.css';

interface ListingCardProps {
  listing: Listing;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { t, language } = useI18n();

  // Helper to format price
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat(language === 'ar' ? 'ar-DZ' : language === 'fr' ? 'fr-DZ' : 'en-US', {
      style: 'currency',
      currency: 'DZD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const typeLabel = t.listings.listingTypes[listing.listing_type as keyof typeof t.listings.listingTypes];

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img 
          src={listing.cover_image} 
          alt={listing.title} 
          className={styles.image}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';
          }}
        />
        <div className={styles.badge}>{typeLabel}</div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{listing.title}</h3>
        <p className={styles.location}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {listing.location_text}
        </p>
        <div className={styles.footer}>
          <div className={styles.priceContainer}>
            <span className={styles.priceLabel}>{t.listings.price}</span>
            <span className={styles.priceValue}>{formatPrice(listing.price)}</span>
          </div>
          <button className={styles.button}>
            {language === 'ar' ? 'عرض التفاصيل' : language === 'fr' ? 'Voir Détails' : 'View Details'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
