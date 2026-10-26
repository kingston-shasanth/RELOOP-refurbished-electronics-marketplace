import React, { useState } from 'react';
import productManifest from '../../data/productImagesManifest.json';

/**
 * RELOOP High-Fidelity Product Image Component
 * 
 * Sourcing & Standards:
 * - Prioritizes verified local genuine photographic assets over illustrations.
 * - Automatically resolves product slugs, titles, and paths against productImagesManifest.
 * - Upgrades legacy .svg mockups to authentic manufacturer / CC photographic files.
 * - Uses object-fit: contain with standardized padding and framing to preserve device integrity.
 * - Robust error handling without infinite retry loops.
 */

// Category-level genuine photographic fallbacks
const CATEGORY_PHOTO_FALLBACKS = {
  laptops: '/images/products/apple-macbook-air-m1.jpg',
  smartphones: '/images/products/apple-iphone-13.jpg',
  tablets: '/images/products/apple-ipad-air-4.png',
  audio: '/images/products/sony-wh1000xm4.jpg',
  wearables: '/images/products/apple-watch-7.jpg',
  gaming: '/images/products/ps5-digital.jpg',
  cameras: '/images/products/sony-a6400.jpg',
  'pc components': '/images/products/rtx-3070-ti.jpg',
  default: '/images/products/apple-macbook-air-m1.jpg',
};

export default function ProductImage({
  src,
  alt = 'Refurbished Device',
  slug = '',
  category = '',
  productTitle = '',
  className = '',
  style = {},
  loading = 'lazy',
  aspectRatio = '4 / 3',
}) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  // Resolve category fallback
  const getCategoryFallback = () => {
    const cat = (category || '').toLowerCase().trim();
    for (const [key, fallbackPath] of Object.entries(CATEGORY_PHOTO_FALLBACKS)) {
      if (cat.includes(key)) return fallbackPath;
    }
    return CATEGORY_PHOTO_FALLBACKS.default;
  };

  // Lookup photographic asset in manifest by slug or title
  const getManifestCandidate = () => {
    if (slug && productManifest[slug]?.localPath) {
      return productManifest[slug].localPath;
    }
    if (productTitle) {
      const titleLower = productTitle.toLowerCase();
      for (const [key, record] of Object.entries(productManifest)) {
        if (titleLower.includes(key.replace(/-/g, ' ')) || key.includes(titleLower)) {
          return record.localPath;
        }
      }
    }
    return null;
  };

  // Resolve best photographic image
  // Priority order:
  // 1. Valid backend/uploaded image src (not legacy .svg)
  // 2. Static photographic manifest candidate (slug or title match)
  // 3. Category-specific photographic fallback
  const resolveImageSource = () => {
    if (hasError) {
      return getCategoryFallback();
    }

    // 1. Valid product image URL/path returned by backend takes highest priority
    if (src && typeof src === 'string' && src.trim() !== '') {
      const trimmed = src.trim();
      // If it's a legacy .svg illustration, upgrade to genuine photographic asset
      if (trimmed.endsWith('.svg') && !trimmed.includes('fallback')) {
        const manifestCandidate = getManifestCandidate();
        if (manifestCandidate) return manifestCandidate;
        return getCategoryFallback();
      }
      return trimmed;
    }

    // 2. Static manifest fallback lookup
    const manifestCandidate = getManifestCandidate();
    if (manifestCandidate) {
      return manifestCandidate;
    }

    // 3. Default to smart category photographic fallback
    return getCategoryFallback();
  };

  const effectiveSrc = resolveImageSource();

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      e.currentTarget.onerror = null;
      e.currentTarget.src = getCategoryFallback();
    }
  };

  return (
    <img
      src={effectiveSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      style={{
        objectFit: 'contain',
        maxWidth: '100%',
        maxHeight: '100%',
        ...style,
      }}
    />
  );
}
