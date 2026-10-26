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
      className="reloop-campaign-carousel-section position-relative py-3 py-lg-4"
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
          className="reloop-carousel-container position-relative overflow-hidden rounded-4 shadow-md"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            backgroundColor: '#05080F',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            minHeight: '440px',
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
                <div
                  key={slide.id}
                  className="reloop-carousel-slide flex-shrink-0 w-100 position-relative"
                  style={{
                    minHeight: '440px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  aria-hidden={!isActive}
                >
                  {/* Poster Image Background Layer */}
                  <div
                    className="position-absolute top-0 end-0 bottom-0 w-100 h-100"
                    style={{
                      overflow: 'hidden',
                      pointerEvents: 'none',
                    }}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center right',
                        opacity: 0.88,
                        transform: isActive ? 'scale(1.02)' : 'scale(1)',
                        transition: 'transform 6s ease, opacity 0.6s ease',
                      }}
                    />
                    {/* Deep Cinematic Gradient Overlay for Maximum Text Contrast */}
                    <div
                      className="position-absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(90deg, #05080F 0%, rgba(5, 8, 15, 0.94) 42%, rgba(5, 8, 15, 0.6) 70%, rgba(5, 8, 15, 0.25) 100%)',
                      }}
                    />
                  </div>

                  {/* Content Overlay */}
                  <div className="container-fluid px-4 px-lg-5 py-4 position-relative" style={{ zIndex: 2 }}>
                    <div className="row">
                      <div className="col-12 col-md-8 col-lg-7">
                        {/* Tag Pill */}
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span
                            className="badge px-3 py-1 text-uppercase fw-bold"
                            style={{
                              backgroundColor: 'rgba(8, 127, 91, 0.22)',
                              color: '#20C997',
                              border: '1px solid rgba(32, 201, 151, 0.35)',
                              letterSpacing: '0.08em',
                              fontSize: '0.74rem',
                            }}
                          >
                            <Sparkles size={13} className="me-1" /> {slide.tag}
                          </span>
                          <span
                            className="badge px-2 py-1 text-uppercase fw-semibold d-none d-sm-inline-flex"
                            style={{
                              backgroundColor: 'rgba(233, 185, 73, 0.16)',
                              color: '#E9B949',
                              border: '1px solid rgba(233, 185, 73, 0.3)',
                              fontSize: '0.7rem',
                            }}
                          >
                            {slide.badge}
                          </span>
                        </div>

                        {/* Title */}
                        <h2
                          className="display-6 fw-bold text-white mb-2"
                          style={{
                            fontFamily: "'Manrope', sans-serif",
                            letterSpacing: '-0.025em',
                            lineHeight: 1.15,
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                          }}
                        >
                          {slide.title}
                        </h2>

                        {/* Subtitle */}
                        <p
                          className="lead text-light mb-3"
                          style={{
                            fontSize: '1rem',
                            color: '#CBD5E1',
                            maxWidth: '560px',
                            lineHeight: 1.55,
                            textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                          }}
                        >
                          {slide.subtitle}
                        </p>

                        {/* Highlight */}
                        <div className="d-flex align-items-center gap-2 mb-4 text-warning small fw-bold">
                          <Zap size={16} className="text-warning flex-shrink-0" />
                          <span style={{ color: '#E9B949', letterSpacing: '0.02em' }}>{slide.highlight}</span>
                        </div>

                        {/* Key Specs Pills */}
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
                          {slide.stats.map((s, si) => (
                            <div
                              key={si}
                              className="px-2 py-1 rounded small"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                backdropFilter: 'blur(8px)',
                                color: '#E2E8F0',
                                fontSize: '0.78rem',
                              }}
                            >
                              <span style={{ color: '#94A3B8' }}>{s.label}: </span>
                              <strong className="text-white">{s.val}</strong>
                            </div>
                          ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="d-flex flex-wrap align-items-center gap-3">
                          <Link
                            to={slide.link}
                            className="btn btn-reloop-primary px-4 py-2 fw-bold d-inline-flex align-items-center gap-2"
                            style={{
                              boxShadow: '0 4px 18px rgba(8, 127, 91, 0.4)',
                              fontSize: '0.92rem',
                            }}
                          >
                            {slide.ctaText} <ArrowRight size={16} />
                          </Link>
                          <Link
                            to="/products"
                            className="btn btn-outline-light px-3 py-2 fw-semibold small"
                            style={{
                              borderColor: 'rgba(255, 255, 255, 0.25)',
                              fontSize: '0.88rem',
                            }}
                          >
                            All Categories
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            className="carousel-control-btn position-absolute top-50 start-0 translate-middle-y ms-3 rounded-circle d-flex align-items-center justify-content-center text-white border-0"
            onClick={goToPrev}
            aria-label="Previous Campaign Slide"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(11, 18, 32, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              zIndex: 10,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronLeft size={22} />
          </button>

          <button
            type="button"
            className="carousel-control-btn position-absolute top-50 end-0 translate-middle-y me-3 rounded-circle d-flex align-items-center justify-content-center text-white border-0"
            onClick={goToNext}
            aria-label="Next Campaign Slide"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: 'rgba(11, 18, 32, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              zIndex: 10,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ChevronRight size={22} />
          </button>

          {/* Bottom Bar: Indicators & Counter */}
          <div
            className="position-absolute bottom-0 start-0 end-0 px-4 py-3 d-flex align-items-center justify-content-between"
            style={{ zIndex: 10, pointerEvents: 'none' }}
          >
            {/* Pill Indicator Dots */}
            <div className="d-flex align-items-center gap-2" style={{ pointerEvents: 'auto' }}>
              {CAMPAIGN_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goToSlide(idx)}
                  aria-label={`Jump to slide ${idx + 1}: ${s.title}`}
                  className="border-0 p-0 rounded-pill"
                  style={{
                    height: '6px',
                    width: idx === currentIndex ? '32px' : '10px',
                    backgroundColor: idx === currentIndex ? '#087F5B' : 'rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>

            {/* Slide Index Badge */}
            <div
              className="badge px-2 py-1 rounded text-white-50 small"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(6px)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '0.74rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
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
