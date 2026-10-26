import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const CAMPAIGN_SLIDES = [
  {
    id: 'laptops-pro',
    tag: 'RELOOP SIGNATURE COLLECTION',
    title: 'Refurbished Pro Workstations',
    subtitle: 'Apple MacBook Pro, Air & Dell XPS with 50-point diagnostic seal and guaranteed battery health.',
    highlight: 'Up to 45% below original retail MRP',
    badge: '12-Month Hardware Cover',
    ctaText: 'Explore Pro Laptops',
    link: '/products?category=Laptops',
    image: '/images/campaigns/campaign-laptops.jpg',
    theme: 'emerald',
    stats: [
      { label: 'Condition', val: 'Pristine A+' },
      { label: 'Battery Health', val: '≥ 90% OEM' },
      { label: 'Delivery', val: 'Free Express' },
    ],
  },
  {
    id: 'smartphones-flagship',
    tag: '5G CERTIFIED FLAGSHIPS',
    title: 'Iconic Smartphones. Renewed.',
    subtitle: 'Pristine Apple iPhone 13, Samsung Galaxy S22 & Google Pixel with authentic factory screens.',
    highlight: 'Starting from ₹17,999 with DPP Passport',
    badge: 'Authentic OEM Telemetry',
    ctaText: 'Browse 5G Flagships',
    link: '/products?category=Smartphones',
    image: '/images/campaigns/campaign-smartphones.jpg',
    theme: 'blue',
    stats: [
      { label: 'OLED Panels', val: '0 Dead Pixels' },
      { label: 'Camera Sensor', val: 'Calibrated' },
      { label: 'Returns', val: '7-Day Free' },
    ],
  },
  {
    id: 'gaming-audio',
    tag: 'HIGH-PERFORMANCE HARDWARE',
    title: 'Next-Gen Gaming & Studio Audio',
    subtitle: 'PlayStation 5, Steam Deck, Switch OLED and Sony WH-1000XM4 audiophile noise cancellation.',
    highlight: 'Rigorous benchmark thermal tested',
    badge: 'Zero Drift Certified',
    ctaText: 'View Gaming & Audio',
    link: '/products?category=Gaming',
    image: '/images/campaigns/campaign-gaming.jpg',
    theme: 'purple',
    stats: [
      { label: 'Thermals', val: 'Clean / Repasted' },
      { label: 'Controls', val: '100% Tested' },
      { label: 'Audio Latency', val: '< 20ms' },
    ],
  },
  {
    id: 'circular-tradein',
    tag: 'CIRCULAR TECH INITIATIVE',
    title: 'Instant Device Valuation & Trade-In',
    subtitle: 'Exchange your pre-owned smartphone, laptop or tablet in 60 seconds. Direct instant credit.',
    highlight: 'Zero e-waste. Verified valuation engine',
    badge: 'Transparent Ledger',
    ctaText: 'Value Your Old Device',
    link: '/trade-in',
    image: '/images/campaigns/campaign-tradein.jpg',
    theme: 'amber',
    stats: [
      { label: 'Valuation Time', val: '60 Seconds' },
      { label: 'Doorstep Pickup', val: 'Included' },
      { label: 'E-Waste Saved', val: '100% Tracked' },
    ],
  },
];

export default function CampaignCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const autoplayTimerRef = useRef(null);
  const containerRef = useRef(null);

  const total = CAMPAIGN_SLIDES.length;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
  };

  // Autoplay management (5.5 seconds, paused on hover/focus)
  useEffect(() => {
    if (isPaused) {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
      return;
    }

    autoplayTimerRef.current = setInterval(() => {
      goToNext();
    }, 5500);

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current);
    };
  }, [isPaused, goToNext]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      goToNext();
    } else if (e.key === 'ArrowLeft') {
      goToPrev();
    }
  };

  // Touch handlers for mobile/laptop touch screens
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) {
      goToNext();
    } else if (diff < -50) {
      goToPrev();
    }
    setTouchStartX(null);
  };

  const currentSlide = CAMPAIGN_SLIDES[currentIndex];

  return (
    <section
      className="reloop-campaign-carousel-section position-relative py-3"
      aria-label="Promotional Campaigns Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      <div className="container-xl">
        <div
          className="reloop-carousel-container position-relative overflow-hidden rounded-4 shadow-sm"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            backgroundColor: '#0B1220',
            border: '1px solid #E7E9ED',
            aspectRatio: '21 / 9',
            maxHeight: '420px',
            minHeight: '260px',
          }}
        >
          {/* Slides Track */}
          <div
            className="reloop-carousel-track d-flex h-100"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {CAMPAIGN_SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <Link
                  key={slide.id}
                  to={slide.link}
                  className="reloop-carousel-slide flex-shrink-0 w-100 h-100 position-relative d-block text-decoration-none"
                  aria-hidden={!isActive}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`${slide.title} — ${slide.highlight}`}
                >
                  {/* Clean, Unobscured Poster Image */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchpriority={idx === 0 ? 'high' : 'auto'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      display: 'block',
                      transition: 'transform 6s ease',
                      transform: isActive ? 'scale(1.015)' : 'scale(1)',
                    }}
                  />
                </Link>
              );
            })}
          </div>

          {/* Navigation Chevrons */}
          <button
            type="button"
            className="carousel-control-btn position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle d-flex align-items-center justify-content-center text-white border-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrev();
            }}
            aria-label="Previous Campaign Slide"
            style={{
              width: '42px',
              height: '42px',
              backgroundColor: 'rgba(11, 18, 32, 0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              zIndex: 10,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            className="carousel-control-btn position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle d-flex align-items-center justify-content-center text-white border-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Next Campaign Slide"
            style={{
              width: '42px',
              height: '42px',
              backgroundColor: 'rgba(11, 18, 32, 0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              zIndex: 10,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronRight size={22} />
          </button>

          {/* Bottom Bar: Indicators & Counter */}
          <div
            className="position-absolute bottom-0 start-0 end-0 px-4 py-3 d-flex align-items-center justify-content-between"
            style={{
              zIndex: 10,
              pointerEvents: 'none',
              background: 'linear-gradient(to top, rgba(5, 8, 15, 0.45) 0%, transparent 100%)',
            }}
          >
            {/* Pill Indicator Dots */}
            <div className="d-flex align-items-center gap-2" style={{ pointerEvents: 'auto' }}>
              {CAMPAIGN_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  aria-label={`Jump to slide ${idx + 1}: ${s.title}`}
                  className="border-0 p-0 rounded-pill"
                  style={{
                    height: '6px',
                    width: idx === currentIndex ? '32px' : '10px',
                    backgroundColor: idx === currentIndex ? '#087F5B' : 'rgba(255, 255, 255, 0.55)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                />
              ))}
            </div>

            {/* Slide Index Badge */}
            <div
              className="badge px-2 py-1 rounded text-white small"
              style={{
                backgroundColor: 'rgba(11, 18, 32, 0.7)',
                backdropFilter: 'blur(6px)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '0.74rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              0{currentIndex + 1} / 0{total}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
