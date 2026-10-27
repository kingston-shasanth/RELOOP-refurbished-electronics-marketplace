import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  RotateCcw,
  Leaf,
  ArrowRight,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Watch,
  Gamepad2,
  Camera,
  Cpu,
  ArrowRightLeft,
  Sparkles,
  Zap,
  CheckCircle2,
  QrCode,
  Tag,
  Flame,
  BadgeCheck,
  Search,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/common/ProductSkeleton';
import ProductImage from '../components/common/ProductImage';
import CampaignCarousel from '../components/home/CampaignCarousel';
import api from '../services/api';
import { subscribeToSync } from '../services/syncChannel';

const HERO_SHOWCASE_SLIDES = [
  {
    id: 'gpu-rtx',
    title: 'Colorful iGame GeForce RTX™ Ultra OC White',
    category: 'PC Components',
    spec: 'Triple 90mm Axial-Flow Fans · Holographic Accent',
    condition: '50-Point Diagnostic Check Passed · Grade A+ Pristine',
    image: '/images/products/geforce-rtx-igame-white.png',
    link: '/products?category=PC%20Components',
    badge: 'Flagship GPU · Lab Tested',
    badgeColor: '#E6FCF5',
    badgeTextColor: '#087F5B',
  },
  {
    id: 'macbook-air-m1',
    title: 'Apple MacBook Air 13.3" (M1 Silicon)',
    category: 'Laptops',
    spec: 'Retina Display · 96% Original Battery Health',
    condition: '50-Point Diagnostic Check Passed · Grade A+ Pristine',
    image: '/images/products/apple-macbook-air-m1.jpg',
    link: '/products?category=Laptops',
    badge: 'Apple Silicon Ultrabook',
    badgeColor: '#EFF6FF',
    badgeTextColor: '#2563EB',
  },
  {
    id: 'ps5-digital',
    title: 'Sony PlayStation 5 Digital Console',
    category: 'Gaming',
    spec: 'Custom AMD Zen 2 · 825GB Ultra-Fast NVMe',
    condition: '50-Point Diagnostic Check Passed · Grade A+ Pristine',
    image: '/images/products/ps5-digital.jpg',
    link: '/products?category=Gaming',
    badge: 'Next-Gen 4K 120Hz',
    badgeColor: '#FAF5FF',
    badgeTextColor: '#7C3AED',
  },
  {
    id: 'sony-wh1000xm4',
    title: 'Sony WH-1000XM4 Wireless ANC',
    category: 'Audio',
    spec: 'Dual Noise Sensor · 30-Hour Battery Life',
    condition: '50-Point Diagnostic Check Passed · Grade A+ Pristine',
    image: '/images/products/sony-wh1000xm4.jpg',
    link: '/products?category=Audio',
    badge: 'Hi-Res LDAC Audio',
    badgeColor: '#FEF3C7',
    badgeTextColor: '#D97706',
  },
  {
    id: 'iphone-13',
    title: 'Apple iPhone 13 (Super Retina XDR)',
    category: 'Smartphones',
    spec: 'A15 Bionic · Authentic Super Retina XDR Screen',
    condition: '50-Point Diagnostic Check Passed · Grade A+ Pristine',
    image: '/images/products/apple-iphone-13.jpg',
    link: '/products?category=Smartphones',
    badge: '5G Certified Flagship',
    badgeColor: '#ECFDF5',
    badgeTextColor: '#059669',
  },
];

export default function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto-sliding hero device showcase state (1.5s frequency)
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroTouchStartX, setHeroTouchStartX] = useState(null);

  const nextHeroSlide = useCallback(() => {
    setHeroSlide((prev) => (prev + 1) % HERO_SHOWCASE_SLIDES.length);
  }, []);

  const prevHeroSlide = useCallback(() => {
    setHeroSlide((prev) => (prev - 1 + HERO_SHOWCASE_SLIDES.length) % HERO_SHOWCASE_SLIDES.length);
  }, []);

  // Unconditional 1.5s continuous auto-scroll for hero device showcase
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % HERO_SHOWCASE_SLIDES.length);
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const handleHeroTouchStart = (e) => {
    setHeroTouchStartX(e.touches[0].clientX);
  };

  const handleHeroTouchEnd = (e) => {
    if (heroTouchStartX === null) return;
    const diff = heroTouchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextHeroSlide();
    } else if (diff < -45) {
      prevHeroSlide();
    }
    setHeroTouchStartX(null);
  };

  const fetchCatalog = async () => {
    try {
      const res = await api.get('/products?limit=100');
      if (res.data.success) {
        setAllProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to load catalogue products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();

    // Revalidate when product changes occur in other tabs
    const unsubscribe = subscribeToSync((event) => {
      if (event.entity === 'products') {
        fetchCatalog();
      }
    });

    // Revalidate when tab regains focus or visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCatalog();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  // Filter distinct product merchandising rows without redundancy
  const featuredProducts = allProducts.filter((p) => p.isFeatured).slice(0, 4);
  const laptopProducts = allProducts.filter((p) => p.category === 'Laptops').slice(0, 4);
  const phoneProducts = allProducts.filter((p) => p.category === 'Smartphones').slice(0, 4);
  const entertainmentProducts = allProducts.filter((p) => ['Gaming', 'Audio'].includes(p.category)).slice(0, 4);
  const componentsAndCameras = allProducts.filter((p) => ['Cameras', 'PC Components'].includes(p.category)).slice(0, 4);

  // 8 Curated Categories with verified coverage (>=9 models per category)
  const categories = [
    { name: 'Smartphones', path: '/products?category=Smartphones', icon: Smartphone, count: '9 Models', badge: 'Popular' },
    { name: 'Laptops', path: '/products?category=Laptops', icon: Laptop, count: '9 Models', badge: 'Top Value' },
    { name: 'Tablets', path: '/products?category=Tablets', icon: Tablet, count: '9 Models', badge: null },
    { name: 'Audio', path: '/products?category=Audio', icon: Headphones, count: '9 Models', badge: null },
    { name: 'Wearables', path: '/products?category=Wearables', icon: Watch, count: '9 Models', badge: 'Fitness' },
    { name: 'Gaming', path: '/products?category=Gaming', icon: Gamepad2, count: '9 Consoles', badge: 'Hot' },
    { name: 'Cameras', path: '/products?category=Cameras', icon: Camera, count: '9 Models', badge: null },
    { name: 'PC Components', path: '/products?category=PC%20Components', icon: Cpu, count: '9 Hardware', badge: 'DIY' },
  ];

  return (
    <div className="reloop-homepage">
      {/* ======================================================================
          FIRST-SCREEN: PROMINENT HORIZONTAL DEALS CAMPAIGN POSTER CAROUSEL
          Directly below navigation — 100% visible on initial desktop viewport
          ====================================================================== */}
      <CampaignCarousel />

      {/* ======================================================================
          1. HERO SECTION: EDITORIAL TYPOGRAPHY & REAL DEVICE PHOTOGRAPHY
          ====================================================================== */}
      <section className="py-4 py-lg-5" style={{ backgroundColor: '#FAF9F6', borderBottom: '1px solid #E7E9ED' }}>
        <div className="container-xl">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-lg-7">
              <span
                className="badge mb-3 px-3 py-1 text-uppercase fw-semibold"
                style={{
                  backgroundColor: '#E6FCF5',
                  color: '#087F5B',
                  border: '1px solid #C3FAE8',
                  letterSpacing: '0.06em',
                  fontSize: '0.78rem',
                }}
              >
                <Sparkles size={14} className="me-1" /> Certified Renewed Tech Hub
              </span>

              <h1
                className="display-5 fw-bold mb-3"
                style={{
                  letterSpacing: '-0.03em',
                  lineHeight: 1.15,
                  color: '#0B1220',
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                Quality Renewed. <br />
                <span style={{ color: '#087F5B' }}>Value Restored.</span>
              </h1>

              <p
                className="lead mb-4"
                style={{
                  maxWidth: '560px',
                  fontSize: '1.08rem',
                  lineHeight: 1.6,
                  color: '#687386',
                }}
              >
                Shop certified pre-owned Apple MacBooks, iPhones, Samsung flagships, gaming consoles and PC hardware.
                Every device passes a standardized 50-point diagnostic inspection and includes an authentic Digital Product Passport.
              </p>

              <div className="d-flex flex-wrap align-items-center gap-3">
                <Link to="/products" className="btn btn-reloop-primary px-4 py-2 fw-bold">
                  Browse Renewed Devices <ArrowRight size={18} />
                </Link>
                <Link to="/trade-in" className="btn btn-reloop-outline px-4 py-2 fw-semibold">
                  <ArrowRightLeft size={16} /> Instant Trade-In Valuation
                </Link>
              </div>

              {/* Verified Trust Badges */}
              <div className="d-flex flex-wrap align-items-center gap-3 mt-4 pt-2 text-muted small">
                <span className="d-inline-flex align-items-center gap-1">
                  <CheckCircle2 size={16} className="text-success" /> 12-Month Hardware Cover
                </span>
                <span>·</span>
                <span className="d-inline-flex align-items-center gap-1">
                  <CheckCircle2 size={16} className="text-success" /> 50-Point Certified Lab Check
                </span>
                <span>·</span>
                <span className="d-inline-flex align-items-center gap-1">
                  <CheckCircle2 size={16} className="text-success" /> Free Express Delivery
                </span>
              </div>
            </div>

            {/* Hero Visual Composition with Auto-Sliding Real Device Showcase */}
            <div className="col-12 col-lg-5">
              <div
                className="position-relative rounded-4 bg-white shadow-sm border overflow-hidden hero-showcase-card"
                style={{ borderColor: '#E7E9ED', height: '390px' }}
                onTouchStart={handleHeroTouchStart}
                onTouchEnd={handleHeroTouchEnd}
              >
                {/* Horizontal Sliding Track */}
                <div
                  className="d-flex h-100"
                  style={{
                    transform: `translateX(-${(heroSlide * 100) / HERO_SHOWCASE_SLIDES.length}%)`,
                    transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                    width: `${HERO_SHOWCASE_SLIDES.length * 100}%`,
                    willChange: 'transform',
                  }}
                >
                  {HERO_SHOWCASE_SLIDES.map((slide, idx) => (
                    <Link
                      key={slide.id}
                      to={slide.link}
                      className="d-flex flex-column align-items-center justify-content-between text-decoration-none h-100 position-relative p-3 pt-3 pb-4"
                      style={{
                        flex: `0 0 ${100 / HERO_SHOWCASE_SLIDES.length}%`,
                        width: `${100 / HERO_SHOWCASE_SLIDES.length}%`,
                        background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
                      }}
                    >
                      {/* Top Badges & Product Name */}
                      <div className="w-100 d-flex justify-content-between align-items-center px-2" style={{ zIndex: 3 }}>
                        <div className="d-flex align-items-center gap-2 text-truncate" style={{ maxWidth: '80%' }}>
                          <span
                            className="badge px-2.5 py-1 text-uppercase fw-bold shadow-xs"
                            style={{
                              backgroundColor: slide.badgeColor,
                              color: slide.badgeTextColor,
                              fontSize: '0.72rem',
                              letterSpacing: '0.04em',
                              borderRadius: '6px',
                              border: '1px solid rgba(0,0,0,0.06)',
                            }}
                          >
                            <Sparkles size={12} className="me-1" />
                            {slide.badge}
                          </span>
                          <span className="fw-semibold text-dark small text-truncate d-none d-sm-inline">
                            {slide.title}
                          </span>
                        </div>
                        <span className="badge bg-light text-muted border small" style={{ fontSize: '0.68rem' }}>
                          {idx + 1} / {HERO_SHOWCASE_SLIDES.length}
                        </span>
                      </div>

                      {/* Full-Size Device Imagery (Unobstructed, Maximized Display Area) */}
                      <div
                        className="w-100 d-flex align-items-center justify-content-center flex-grow-1"
                        style={{
                          height: '290px',
                          padding: '0.5rem 0.5rem 1.25rem',
                          position: 'relative',
                        }}
                      >
                        <img
                          src={slide.image}
                          alt={slide.title}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: '100%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.12))',
                            transition: 'transform 0.3s ease',
                          }}
                        />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Left / Right Chevron Controls */}
                <button
                  type="button"
                  className="hero-showcase-control position-absolute top-50 start-0 translate-middle-y ms-2 rounded-circle d-flex align-items-center justify-content-center text-white border-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    prevHeroSlide();
                  }}
                  aria-label="Previous Slide"
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'rgba(11, 18, 32, 0.75)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 6,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  className="hero-showcase-control position-absolute top-50 end-0 translate-middle-y me-2 rounded-circle d-flex align-items-center justify-content-center text-white border-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    nextHeroSlide();
                  }}
                  aria-label="Next Slide"
                  style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: 'rgba(11, 18, 32, 0.75)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 6,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <ChevronRight size={20} />
                </button>

                {/* Bottom Navigation Dots Indicator */}
                <div
                  className="position-absolute bottom-0 start-50 translate-middle-x mb-2.5 d-flex align-items-center justify-content-center"
                  style={{ zIndex: 5, pointerEvents: 'auto' }}
                >
                  <div
                    className="d-flex align-items-center gap-1.5 px-2 py-1 rounded-pill"
                    style={{ backgroundColor: 'rgba(11, 18, 32, 0.35)', backdropFilter: 'blur(4px)' }}
                  >
                    {HERO_SHOWCASE_SLIDES.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        type="button"
                        className={`hero-showcase-dot ${heroSlide === dotIdx ? 'active' : ''}`}
                        onClick={() => setHeroSlide(dotIdx)}
                        aria-label={`Go to slide ${dotIdx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Value Pillars Strip */}
          <div className="row g-3 mt-4 pt-3 border-top" style={{ borderColor: '#E7E9ED' }}>
            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center gap-3 p-3 bg-white rounded border h-100" style={{ borderColor: '#E7E9ED' }}>
                <div className="p-2 rounded-circle" style={{ backgroundColor: '#E6FCF5', color: '#087F5B' }}>
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0 small">50-Point Diagnostic</h6>
                  <span className="text-muted" style={{ fontSize: '0.76rem' }}>100% Functionality Tested</span>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center gap-3 p-3 bg-white rounded border h-100" style={{ borderColor: '#E7E9ED' }}>
                <div className="p-2 rounded-circle" style={{ backgroundColor: '#E6FCF5', color: '#087F5B' }}>
                  <Award size={22} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0 small">12-Month Cover</h6>
                  <span className="text-muted" style={{ fontSize: '0.76rem' }}>Hardware Warranty Included</span>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center gap-3 p-3 bg-white rounded border h-100" style={{ borderColor: '#E7E9ED' }}>
                <div className="p-2 rounded-circle" style={{ backgroundColor: '#E6FCF5', color: '#087F5B' }}>
                  <RotateCcw size={22} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0 small">7-Day Free Returns</h6>
                  <span className="text-muted" style={{ fontSize: '0.76rem' }}>Customer Protection</span>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="d-flex align-items-center gap-3 p-3 bg-white rounded border h-100" style={{ borderColor: '#E7E9ED' }}>
                <div className="p-2 rounded-circle" style={{ backgroundColor: '#E6FCF5', color: '#087F5B' }}>
                  <Leaf size={22} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-0 small">Circular Tech</h6>
                  <span className="text-muted" style={{ fontSize: '0.76rem' }}>E-Waste Diverted Tracked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          2. COORDINATED OFFER TILES
          ====================================================================== */}
      <section className="py-4 py-md-5">
        <div className="container-xl">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <Link to="/products?category=Laptops" className="text-decoration-none">
                <div
                  className="reloop-card h-100 p-4 d-flex flex-column justify-content-between reloop-card-hover"
                  style={{
                    background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFBEB 100%)',
                    borderColor: '#FDE68A',
                  }}
                >
                  <div>
                    <span className="badge mb-2" style={{ backgroundColor: '#E9B949', color: '#0B1220', fontWeight: 700 }}>
                      WORKSTATION DEALS
                    </span>
                    <h5 className="fw-bold text-dark mb-1">Renewed Laptops</h5>
                    <p className="text-secondary small mb-0">Save up to 45% on MacBook Air, Dell XPS and Lenovo ThinkPads.</p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-warning-subtle">
                    <span className="fw-bold text-dark small">From ₹36,999</span>
                    <span className="btn btn-sm btn-dark px-2 py-1" style={{ fontSize: '0.75rem' }}>Explore &rarr;</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <Link to="/products?category=Smartphones" className="text-decoration-none">
                <div
                  className="reloop-card h-100 p-4 d-flex flex-column justify-content-between reloop-card-hover"
                  style={{
                    background: 'linear-gradient(145deg, #FFFFFF 0%, #F0F9FF 100%)',
                    borderColor: '#BAE6FD',
                  }}
                >
                  <div>
                    <span className="badge bg-primary text-white mb-2" style={{ fontWeight: 700 }}>
                      5G FLAGSHIPS
                    </span>
                    <h5 className="fw-bold text-dark mb-1">Smartphones</h5>
                    <p className="text-secondary small mb-0">iPhone 13, Galaxy S22 and Pixel 7 with verified OEM battery health.</p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-primary-subtle">
                    <span className="fw-bold text-dark small">From ₹27,499</span>
                    <span className="btn btn-sm btn-primary px-2 py-1" style={{ fontSize: '0.75rem' }}>Explore &rarr;</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <Link to="/products?category=Gaming" className="text-decoration-none">
                <div
                  className="reloop-card h-100 p-4 d-flex flex-column justify-content-between reloop-card-hover"
                  style={{
                    background: 'linear-gradient(145deg, #FFFFFF 0%, #E6FCF5 100%)',
                    borderColor: '#C3FAE8',
                  }}
                >
                  <div>
                    <span className="badge mb-2" style={{ backgroundColor: '#087F5B', color: '#FFFFFF', fontWeight: 700 }}>
                      CONSOLES & AUDIO
                    </span>
                    <h5 className="fw-bold text-dark mb-1">Gaming Gear</h5>
                    <p className="text-secondary small mb-0">PlayStation 5, Switch OLED and Steam Deck tested and renewed.</p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top border-success-subtle">
                    <span className="fw-bold text-dark small">From ₹22,499</span>
                    <span className="btn btn-sm btn-success px-2 py-1" style={{ fontSize: '0.75rem' }}>Explore &rarr;</span>
                  </div>
                </div>
              </Link>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <Link to="/trade-in" className="text-decoration-none">
                <div
                  className="reloop-card h-100 p-4 d-flex flex-column justify-content-between reloop-card-hover"
                  style={{
                    background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
                    borderColor: '#CBD5E1',
                  }}
                >
                  <div>
                    <span className="badge bg-secondary text-white mb-2" style={{ fontWeight: 700 }}>
                      INSTANT CREDIT
                    </span>
                    <h5 className="fw-bold text-dark mb-1">Trade-In Programme</h5>
                    <p className="text-secondary small mb-0">Receive instant valuation credits for your old device to purchase renewed tech.</p>
                  </div>
                  <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
                    <span className="fw-bold text-dark small">Fast Valuation</span>
                    <span className="btn btn-sm btn-dark px-2 py-1" style={{ fontSize: '0.75rem' }}>Estimate &rarr;</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          3. CATEGORY DISCOVERY (8 DISTINCT CATEGORIES)
          ====================================================================== */}
      <section className="py-4 bg-white border-top border-bottom" style={{ borderColor: '#E7E9ED' }}>
        <div className="container-xl">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.25rem' }}>Explore Categories</h4>
              <span className="text-muted small">8 certified electronics categories with guaranteed hardware coverage</span>
            </div>
            <Link to="/products" className="text-decoration-none fw-semibold small d-flex align-items-center gap-1" style={{ color: '#087F5B' }}>
              View All Catalogue <ArrowRight size={14} />
            </Link>
          </div>

          <div className="row row-cols-2 row-cols-sm-4 row-cols-lg-8 g-2">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="col">
                  <Link to={cat.path} className="text-decoration-none">
                    <div
                      className="p-3 text-center rounded border bg-light h-100 reloop-card-hover position-relative"
                      style={{ borderColor: '#E7E9ED' }}
                    >
                      {cat.badge && (
                        <span
                          className="position-absolute top-0 end-0 badge border m-1"
                          style={{
                            fontSize: '0.62rem',
                            backgroundColor: '#E6FCF5',
                            color: '#087F5B',
                            borderColor: '#C3FAE8',
                          }}
                        >
                          {cat.badge}
                        </span>
                      )}
                      <div
                        className="p-2 mx-auto rounded-circle bg-white shadow-xs mb-2"
                        style={{
                          width: '46px',
                          height: '46px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#087F5B',
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <h6 className="fw-bold text-dark mb-0 text-truncate" style={{ fontSize: '0.84rem' }}>
                        {cat.name}
                      </h6>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {cat.count}
                      </span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================================
          4. FEATURED PRODUCTS WITH REAL MODEL PHOTOGRAPHY
          ====================================================================== */}
      <section className="py-5">
        <div className="container-xl">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex align-items-center gap-2">
                <Flame size={20} className="text-danger" />
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.3rem' }}>Trending Renewed Devices</h4>
              </div>
              <span className="text-muted small">Hand-picked top-tier electronics verified by RELOOP laboratory</span>
            </div>
            <Link to="/products?featured=true" className="text-decoration-none fw-semibold small d-flex align-items-center gap-1" style={{ color: '#087F5B' }}>
              See All Deals <ArrowRight size={15} />
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((prod) => (
                <div key={prod._id} className="col">
                  <ProductCard product={prod} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center text-muted py-4">No trending devices available.</div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================================
          5. CURATED LAPTOPS & WORKSTATIONS
          ====================================================================== */}
      <section className="py-5 bg-white border-top border-bottom" style={{ borderColor: '#E7E9ED' }}>
        <div className="container-xl">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex align-items-center gap-2">
                <Laptop size={20} className="text-primary" />
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.3rem' }}>Laptops for Work & Study</h4>
              </div>
              <span className="text-muted small">Apple MacBooks, Dell XPS and ThinkPads with guaranteed OEM battery capacity</span>
            </div>
            <Link to="/products?category=Laptops" className="text-decoration-none fw-semibold small d-flex align-items-center gap-1" style={{ color: '#087F5B' }}>
              Browse All Laptops <ArrowRight size={15} />
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : laptopProducts.length > 0 ? (
              laptopProducts.map((prod) => (
                <div key={prod._id} className="col">
                  <ProductCard product={prod} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center text-muted py-4">No laptop records available.</div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================================
          6. POPULAR SMARTPHONES
          ====================================================================== */}
      <section className="py-5">
        <div className="container-xl">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex align-items-center gap-2">
                <Smartphone size={20} style={{ color: '#087F5B' }} />
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.3rem' }}>Popular Smartphones & Mobiles</h4>
              </div>
              <span className="text-muted small">Pristine condition iPhones, Samsung Galaxy and Pixel devices with clean displays</span>
            </div>
            <Link to="/products?category=Smartphones" className="text-decoration-none fw-semibold small d-flex align-items-center gap-1" style={{ color: '#087F5B' }}>
              Browse All Phones <ArrowRight size={15} />
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : phoneProducts.length > 0 ? (
              phoneProducts.map((prod) => (
                <div key={prod._id} className="col">
                  <ProductCard product={prod} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center text-muted py-4">No phone records available.</div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================================
          7. GAMING, AUDIO & PC HARDWARE
          ====================================================================== */}
      <section className="py-5 bg-white border-top border-bottom" style={{ borderColor: '#E7E9ED' }}>
        <div className="container-xl">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <div className="d-flex align-items-center gap-2">
                <Gamepad2 size={20} className="text-warning" />
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.3rem' }}>Gaming, Audio & Hardware</h4>
              </div>
              <span className="text-muted small">Next-gen consoles, noise-cancelling headphones, cameras and high-performance PC components</span>
            </div>
            <Link to="/products?category=Gaming" className="text-decoration-none fw-semibold small d-flex align-items-center gap-1" style={{ color: '#087F5B' }}>
              Explore Gaming & Audio <ArrowRight size={15} />
            </Link>
          </div>

          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            ) : entertainmentProducts.length > 0 ? (
              entertainmentProducts.map((prod) => (
                <div key={prod._id} className="col">
                  <ProductCard product={prod} />
                </div>
              ))
            ) : (
              <div className="col-12 text-center text-muted py-4">No items available.</div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================================
          8. 50-POINT DIAGNOSTIC & REFURBISHMENT PROCESS EXPLAINER
          ====================================================================== */}
      <section className="py-5" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="container-xl">
          <div className="text-center max-w-700 mx-auto mb-5" style={{ maxWidth: '680px' }}>
            <span
              className="badge px-3 py-1 mb-2 text-uppercase fw-semibold"
              style={{
                backgroundColor: '#E6FCF5',
                color: '#087F5B',
                border: '1px solid #C3FAE8',
                fontSize: '0.78rem',
              }}
            >
              Standardized Quality Architecture
            </span>
            <h3 className="fw-bold text-dark mb-2" style={{ fontSize: '1.85rem' }}>
              How RELOOP Eliminates the Trust Deficit
            </h3>
            <p className="text-muted small" style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
              Unlike unverified second-hand classifieds, every device sold on RELOOP follows a rigorous 4-stage refurbishment workflow.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-12 col-md-6 col-lg-3">
              <div className="reloop-card p-4 h-100 bg-white">
                <div className="fw-bold text-muted small mb-2">STAGE 01</div>
                <div className="p-2 rounded-circle bg-light d-inline-flex mb-3" style={{ color: '#087F5B' }}>
                  <Search size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Intake & Provenance Check</h5>
                <p className="text-muted small mb-0" style={{ fontSize: '0.84rem', lineHeight: 1.55 }}>
                  Verification of serial numbers, OEM origin, and blacklists to ensure zero counterfeit or stolen units enter inventory.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="reloop-card p-4 h-100 bg-white">
                <div className="fw-bold text-muted small mb-2">STAGE 02</div>
                <div className="p-2 rounded-circle bg-light d-inline-flex mb-3" style={{ color: '#087F5B' }}>
                  <Activity size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>50-Point Diagnostic Lab</h5>
                <p className="text-muted small mb-0" style={{ fontSize: '0.84rem', lineHeight: 1.55 }}>
                  Screen uniformity, touch responsiveness, battery discharge cycles, thermal throttling, RF radios, and ports.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="reloop-card p-4 h-100 bg-white">
                <div className="fw-bold text-muted small mb-2">STAGE 03</div>
                <div className="p-2 rounded-circle bg-light d-inline-flex mb-3" style={{ color: '#087F5B' }}>
                  <Layers size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Precision Refurbishment</h5>
                <p className="text-muted small mb-0" style={{ fontSize: '0.84rem', lineHeight: 1.55 }}>
                  Ultrasonic cleaning, OEM component servicing, thermal paste refresh on compute hardware, and sanitization.
                </p>
              </div>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <div className="reloop-card p-4 h-100 bg-white">
                <div className="fw-bold text-muted small mb-2">STAGE 04</div>
                <div className="p-2 rounded-circle bg-light d-inline-flex mb-3" style={{ color: '#087F5B' }}>
                  <BadgeCheck size={24} />
                </div>
                <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.05rem' }}>Digital Passport Minting</h5>
                <p className="text-muted small mb-0" style={{ fontSize: '0.84rem', lineHeight: 1.55 }}>
                  Each unit receives an immutable digital passport with complete component telemetry and warranty registration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          9. DIGITAL PRODUCT PASSPORT INNOVATION SHOWCASE
          ====================================================================== */}
      <section className="py-5" style={{ backgroundColor: '#0B1220', color: '#FFFFFF' }}>
        <div className="container-xl">
          <div className="row align-items-center g-4 g-lg-5">
            <div className="col-12 col-lg-7">
              <span
                className="badge mb-3 px-3 py-1 text-uppercase fw-semibold"
                style={{
                  backgroundColor: 'rgba(8, 127, 91, 0.2)',
                  color: '#20C997',
                  border: '1px solid rgba(32, 201, 151, 0.3)',
                  letterSpacing: '0.06em',
                  fontSize: '0.78rem',
                }}
              >
                RELOOP Circular Technology Initiative
              </span>

              <h2 className="display-6 fw-bold mb-3" style={{ letterSpacing: '-0.02em', color: '#FFFFFF' }}>
                The RELOOP Digital Product Passport
              </h2>

              <p className="lead mb-4" style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: 1.6 }}>
                Every device sold on RELOOP includes an immutable digital provenance passport. Scan to inspect verified battery health, component replacement history, lab diagnostic telemetry, and carbon savings metrics.
              </p>

              <div className="row g-3 mb-4">
                <div className="col-sm-6">
                  <div className="p-3 rounded border border-secondary" style={{ backgroundColor: '#0F172A' }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <ShieldCheck size={18} style={{ color: '#20C997' }} />
                      <span className="fw-bold small text-white">50-Point Diagnostic Check</span>
                    </div>
                    <small style={{ color: '#94A3B8' }}>Display, battery cycle, ports, camera, RF and logic board verified.</small>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="p-3 rounded border border-secondary" style={{ backgroundColor: '#0F172A' }}>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <Leaf size={18} style={{ color: '#20C997' }} />
                      <span className="fw-bold small text-white">E-Waste Prevented</span>
                    </div>
                    <small style={{ color: '#94A3B8' }}>Real-time measurement of e-waste diversion and carbon offset per device.</small>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap align-items-center gap-3">
                <Link to="/products" className="btn btn-reloop-primary px-4 py-2 fw-bold">
                  Browse Certified Devices
                </Link>
                <Link to="/trade-in" className="btn btn-reloop-outline text-white border-light px-4 py-2 fw-semibold">
                  Value Your Old Device
                </Link>
              </div>
            </div>

            <div className="col-12 col-lg-5">
              <div
                className="p-4 rounded-4 text-start position-relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #131E33 0%, #0B1220 100%)',
                  border: '1px solid rgba(32, 201, 151, 0.35)',
                  boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 30px rgba(32, 201, 151, 0.08)',
                }}
              >
                {/* Glowing accent border line */}
                <div
                  className="position-absolute top-0 start-0 end-0"
                  style={{
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #20C997, transparent)',
                  }}
                />

                {/* Header: Live Telemetry Indicator & Lab Score */}
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2.5 border-bottom" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="d-inline-block rounded-circle"
                      style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#20C997',
                        boxShadow: '0 0 8px #20C997',
                      }}
                    />
                    <QrCode size={18} style={{ color: '#20C997' }} />
                    <span className="fw-bold small text-white" style={{ letterSpacing: '0.06em', fontSize: '0.78rem' }}>
                      LIVE PASSPORT TELEMETRY
                    </span>
                  </div>
                  <span
                    className="badge border"
                    style={{
                      backgroundColor: 'rgba(32, 201, 151, 0.15)',
                      color: '#20C997',
                      borderColor: 'rgba(32, 201, 151, 0.4)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}
                  >
                    Lab Score: 98/100 · Grade A+
                  </span>
                </div>

                {/* Featured Device Preview Card */}
                <div
                  className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3 border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div
                    className="p-2 rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: '74px',
                      height: '74px',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    <ProductImage
                      src="/images/products/apple-macbook-air-m1.jpg"
                      alt="MacBook Air M1 Telemetry Sample"
                      slug="apple-macbook-air-m1"
                      category="Laptops"
                      productTitle="Apple MacBook Air M1"
                      style={{ maxHeight: '58px', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>
                  <div className="text-truncate">
                    <h6 className="fw-bold mb-1 text-white text-truncate" style={{ fontSize: '0.94rem' }}>
                      Apple MacBook Air 13.3" (M1)
                    </h6>
                    <div className="small font-monospace mb-1" style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                      RLP-2026-M1AIR-9884
                    </div>
                    <span
                      className="badge rounded-pill text-uppercase"
                      style={{
                        backgroundColor: 'rgba(56, 189, 248, 0.15)',
                        color: '#38BDF8',
                        fontSize: '0.65rem',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                      }}
                    >
                      Cryptographically Sealed
                    </span>
                  </div>
                </div>

                {/* Telemetry Metrics 2x2 Grid */}
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <div
                      className="p-2.5 rounded-2 border h-100"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.07)',
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <small style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Battery Health</small>
                        <ShieldCheck size={13} style={{ color: '#20C997' }} />
                      </div>
                      <div className="fw-bold text-white small mb-1" style={{ fontSize: '0.86rem' }}>
                        96% <span style={{ color: '#20C997', fontSize: '0.72rem' }}>OEM Capacity</span>
                      </div>
                      <div className="progress" style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{ width: '96%', backgroundColor: '#20C997' }}
                          aria-valuenow="96"
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className="p-2.5 rounded-2 border h-100"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.07)',
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <small style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Retina Panel</small>
                        <CheckCircle2 size={13} style={{ color: '#20C997' }} />
                      </div>
                      <div className="fw-bold text-white small mb-1" style={{ fontSize: '0.86rem' }}>
                        Pass <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>(0 Dead Pixels)</span>
                      </div>
                      <div className="small" style={{ color: '#20C997', fontSize: '0.7rem' }}>
                        Factory Calibrated
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className="p-2.5 rounded-2 border h-100"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.07)',
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <small style={{ color: '#94A3B8', fontSize: '0.72rem' }}>Cosmetic Grade</small>
                        <Sparkles size={13} style={{ color: '#E9B949' }} />
                      </div>
                      <div className="fw-bold text-white small mb-1" style={{ fontSize: '0.86rem' }}>
                        Grade A+ <span style={{ color: '#E9B949', fontSize: '0.72rem' }}>Pristine</span>
                      </div>
                      <div className="small" style={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                        Zero Micro-Scratches
                      </div>
                    </div>
                  </div>

                  <div className="col-6">
                    <div
                      className="p-2.5 rounded-2 border h-100"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.07)',
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <small style={{ color: '#94A3B8', fontSize: '0.72rem' }}>E-Waste Offset</small>
                        <Leaf size={13} style={{ color: '#20C997' }} />
                      </div>
                      <div className="fw-bold text-white small mb-1" style={{ fontSize: '0.86rem' }}>
                        1.8 kg <span style={{ color: '#20C997', fontSize: '0.72rem' }}>Diverted</span>
                      </div>
                      <div className="small" style={{ color: '#94A3B8', fontSize: '0.7rem' }}>
                        46.5 kg CO₂e Saved
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blockchain Provenance Ledger Hash */}
                <div
                  className="p-2 rounded-2 d-flex align-items-center justify-content-between mb-3 font-monospace"
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.35)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    fontSize: '0.7rem',
                    color: '#94A3B8',
                  }}
                >
                  <span className="text-truncate me-2">SHA-256: 7f8a9d12c84b...e890c41e</span>
                  <span className="badge bg-dark text-success border border-secondary flex-shrink-0" style={{ fontSize: '0.62rem' }}>
                    POLYGON SYNCED
                  </span>
                </div>

                {/* Action Link */}
                <Link
                  to="/products?category=Laptops"
                  className="btn btn-sm w-100 fw-bold d-flex align-items-center justify-content-center gap-2 py-2"
                  style={{
                    background: 'linear-gradient(90deg, #087F5B 0%, #099268 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    boxShadow: '0 4px 14px rgba(8, 127, 91, 0.35)',
                  }}
                >
                  <Activity size={15} />
                  <span>Explore Certified Devices with Live DPP</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================================
          10. INSTANT TRADE-IN PROMOTION BANNER
          ====================================================================== */}
      <section className="py-5" style={{ backgroundColor: '#FAF9F6' }}>
        <div className="container-xl">
          <div
            className="p-4 p-md-5 rounded-4 shadow-sm border"
            style={{
              background: 'linear-gradient(135deg, #0B1220 0%, #151F33 100%)',
              color: '#FFFFFF',
              borderColor: '#1E293B',
            }}
          >
            <div className="row align-items-center g-4">
              <div className="col-12 col-lg-8">
                <span
                  className="badge mb-2 px-3 py-1 text-uppercase fw-semibold"
                  style={{
                    backgroundColor: 'rgba(233, 185, 73, 0.2)',
                    color: '#E9B949',
                    border: '1px solid rgba(233, 185, 73, 0.4)',
                    fontSize: '0.75rem',
                  }}
                >
                  Circular Exchange Ecosystem
                </span>
                <h3 className="fw-bold mb-2 text-white" style={{ fontSize: '1.8rem' }}>
                  Upgrade Responsibly with Instant Trade-In
                </h3>
                <p className="text-secondary small mb-0" style={{ color: '#94A3B8', fontSize: '0.94rem', lineHeight: 1.6 }}>
                  Got an older phone, tablet, or laptop? Get an instant verified trade-in valuation in less than 60 seconds and apply your credit directly towards certified renewed hardware.
                </p>
              </div>
              <div className="col-12 col-lg-4 text-lg-end">
                <Link to="/trade-in" className="btn btn-reloop-primary px-4 py-2 fw-bold">
                  Calculate Valuation <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
