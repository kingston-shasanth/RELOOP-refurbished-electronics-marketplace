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
  const [touchStartX, setTouchStartX] = useState(null);
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

  // Unconditional 1.5s continuous auto-scroll
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAMPAIGN_SLIDES.length);
    }, 1500);

    return () => clearInterval(timer);
  }, []);

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
      onKeyDown={handleKeyDown}
      ref={containerRef}
    >
      <div className="container-xl">
        <div
          className="reloop-carousel-container position-relative overflow-hidden rounded-4 shadow-md mx-auto"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            backgroundColor: '#05080F',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            height: 'clamp(280px, 44vw, 440px)',
            width: '100%',
            position: 'relative',
          }}
        >
          {/* Slides Track */}
          <div
            className="reloop-carousel-track d-flex h-100"
            style={{
              width: `${CAMPAIGN_SLIDES.length * 100}%`,
              transform: `translateX(-${(currentIndex * 100) / CAMPAIGN_SLIDES.length}%)`,
              transition: 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
              willChange: 'transform',
            }}
          >
            {CAMPAIGN_SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <Link
                  key={slide.id}
                  to={slide.link}
                  className="reloop-carousel-slide flex-shrink-0 h-100 position-relative d-flex align-items-center justify-content-center text-decoration-none overflow-hidden"
                  style={{
                    width: `${100 / CAMPAIGN_SLIDES.length}%`,
                    flex: `0 0 ${100 / CAMPAIGN_SLIDES.length}%`,
                  }}
                  aria-hidden={!isActive}
                  tabIndex={isActive ? 0 : -1}
                  aria-label={`${slide.title} — ${slide.highlight}`}
                >
                  {/* Ambient Blurred Aura Background: seamlessly extends poster colors across wide viewports */}
                  <div
                    className="position-absolute inset-0 w-100 h-100 overflow-hidden"
                    style={{ pointerEvents: 'none' }}
                    aria-hidden="true"
                  >
                    <img
                      src={slide.image}
                      alt=""
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        filter: 'blur(32px) brightness(0.35)',
                        transform: 'scale(1.15)',
                        opacity: 0.65,
                      }}
                    />
                  </div>

                  {/* Complete, Unclipped, High-Definition Original Campaign Poster */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    fetchpriority={idx === 0 ? 'high' : 'auto'}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      width: 'auto',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center',
                      display: 'block',
                      position: 'relative',
                      zIndex: 1,
                      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      transform: isActive ? 'scale(1)' : 'scale(0.98)',
                    }}
                  />
                </Link>
              );
            })}
          </div>

          {/* Navigation Chevrons */}
          <button
            type="button"
            className="carousel-control-btn position-absolute top-50 start-0 translate-middle-y ms-2 ms-md-3 rounded-circle d-flex align-items-center justify-content-center text-white border-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrev();
            }}
            aria-label="Previous Campaign Slide"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(11, 18, 32, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              zIndex: 10,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <ChevronLeft size={24} />
          </button>

          <button
            type="button"
            className="carousel-control-btn position-absolute top-50 end-0 translate-middle-y me-2 ms-md-3 rounded-circle d-flex align-items-center justify-content-center text-white border-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Next Campaign Slide"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(11, 18, 32, 0.75)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              zIndex: 10,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <ChevronRight size={24} />
          </button>

          {/* Bottom Bar: Indicators & Counter */}
          <div
            className="position-absolute bottom-0 start-0 end-0 px-3 px-md-4 py-2 py-md-3 d-flex align-items-center justify-content-between"
            style={{
              zIndex: 10,
              pointerEvents: 'none',
              background: 'linear-gradient(to top, rgba(5, 8, 15, 0.6) 0%, transparent 100%)',
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
                    height: '7px',
                    width: idx === currentIndex ? '36px' : '10px',
                    backgroundColor: idx === currentIndex ? '#087F5B' : 'rgba(255, 255, 255, 0.6)',
                    transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  }}
                />
              ))}
            </div>

            {/* Slide Index Badge */}
            <div
              className="badge px-2 py-1 rounded text-white small"
              style={{
                backgroundColor: 'rgba(11, 18, 32, 0.75)',
                backdropFilter: 'blur(8px)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '0.76rem',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.25)',
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
