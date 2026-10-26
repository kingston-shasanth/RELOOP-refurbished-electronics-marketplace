import React from 'react';

/**
 * Reusable Product Card Skeleton Loader
 * Renders an accessible shimmer placeholder with identical aspect ratios and typography heights.
 */
export default function ProductSkeleton({ count = 1 }) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, idx) => (
        <div key={idx} className="col">
          <div className="skeleton-card" aria-hidden="true">
            {/* Top Badge placeholder */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="skeleton-box" style={{ width: '70px', height: '22px', borderRadius: '9999px' }}></div>
              <div className="skeleton-box" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
            </div>

            {/* Product Image Box */}
            <div className="skeleton-box skeleton-image"></div>

            {/* Title lines */}
            <div className="skeleton-box skeleton-text" style={{ width: '85%' }}></div>
            <div className="skeleton-box skeleton-text" style={{ width: '55%', height: '12px' }}></div>

            {/* Rating placeholder */}
            <div className="skeleton-box skeleton-text mt-1" style={{ width: '40%', height: '12px' }}></div>

            {/* Price & Action row */}
            <div className="pt-2 border-top mt-auto">
              <div className="d-flex align-items-baseline gap-2 mb-2">
                <div className="skeleton-box" style={{ width: '90px', height: '24px' }}></div>
                <div className="skeleton-box" style={{ width: '60px', height: '16px' }}></div>
              </div>
              <div className="skeleton-box" style={{ width: '100%', height: '36px', borderRadius: '6px' }}></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
