import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import ProductSkeleton from '../components/common/ProductSkeleton';
import ProductImage from '../components/common/ProductImage';
import CampaignCarousel from '../components/home/CampaignCarousel';
import api from '../services/api';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchCatalog();
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

            {/* Hero Visual Composition with Real Device Photography */}
            <div className="col-12 col-lg-5 text-center">
              <div
                className="position-relative p-4 rounded-4 bg-white shadow-sm border"
                style={{ borderColor: '#E7E9ED' }}
              >
                <div
                  className="product-image-container mb-3"
                  style={{
                    height: '270px',
                    backgroundColor: '#FFFFFF',
                    border: 'none',
                    padding: '1.5rem',
                  }}
                >
                  <ProductImage
                    src="/images/products/apple-macbook-air-m1.jpg"
                    alt="Certified MacBook Air Renewed"
                    slug="apple-macbook-air-m1"
                    category="Laptops"
                    productTitle="Apple MacBook Air 13.3 M1"
                    loading="eager"
                  />
                </div>

                <div
                  className="bg-dark text-white px-3 py-2 rounded-pill small d-inline-flex align-items-center gap-2 shadow-sm"
                  style={{ fontSize: '0.78rem', backgroundColor: '#0B1220' }}
                >
                  <ShieldCheck size={16} style={{ color: '#20C997' }} />
                  <span>50-Point Diagnostic Check Passed · Grade A+ Pristine</span>
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
          1.5. PREMIUM HORIZONTAL DEALS CAMPAIGN POSTER CAROUSEL
          ====================================================================== */}
      <CampaignCarousel />

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
              <div className="p-4 rounded-4 bg-white text-dark shadow-lg border text-start" style={{ borderColor: '#E7E9ED' }}>
                <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <div className="d-flex align-items-center gap-2">
                    <QrCode size={20} style={{ color: '#087F5B' }} />
                    <span className="fw-bold small" style={{ letterSpacing: '0.04em' }}>LIVE PASSPORT TELEMETRY</span>
                  </div>
                  <span
                    className="badge border"
                    style={{
                      backgroundColor: '#E6FCF5',
                      color: '#087F5B',
                      borderColor: '#C3FAE8',
                      fontSize: '0.72rem',
                    }}
                  >
                    Lab Score: 98/100
                  </span>
                </div>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="p-2 border rounded d-flex align-items-center justify-content-center"
                    style={{ width: '68px', height: '68px', backgroundColor: '#FAF9F6' }}
                  >
                    <ProductImage
                      src="/images/products/apple-macbook-air-m1.jpg"
                      alt="MacBook Air M1 Telemetry Sample"
                      slug="apple-macbook-air-m1"
                      category="Laptops"
                      productTitle="Apple MacBook Air M1"
                      style={{ maxHeight: '52px', objectFit: 'contain' }}
                    />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.94rem' }}>Apple MacBook Air M1</h6>
                    <small className="text-muted" style={{ fontSize: '0.78rem' }}>Passport ID: RLP-2026-M1AIR-9884</small>
                  </div>
                </div>

                <div className="small border-top pt-2 d-flex flex-column gap-2 text-secondary" style={{ fontSize: '0.82rem' }}>
                  <div className="d-flex justify-content-between">
                    <span>Battery Health:</span>
                    <strong style={{ color: '#087F5B' }}>96% Verified OEM Capacity</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Retina Panel Integrity:</span>
                    <strong className="text-dark">Pass (0 Dead Pixels)</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Chassis Cosmetic Grade:</span>
                    <strong className="text-dark">Pristine (Grade A+)</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>E-Waste Diverted:</span>
                    <strong style={{ color: '#087F5B' }}>1.8 kg Diverted</strong>
                  </div>
                </div>
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
