import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  RotateCcw,
  Wrench,
  Heart,
  ShoppingBag,
  Zap,
  MapPin,
  Star,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import ConditionBadge from '../components/common/ConditionBadge';
import ProductImage from '../components/common/ProductImage';
import DigitalPassportModal from '../components/passport/DigitalPassportModal';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { subscribeToSync } from '../services/syncChannel';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const { showToast } = useToast();

  const fetchProduct = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/products/${id}`);
      if (res.data.success) {
        setProduct(res.data.product);
        setSelectedImage((prev) => prev || res.data.product.primaryImage || res.data.product.images?.[0] || '');
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();

    // Revalidate when product changes occur in other tabs
    const unsubscribe = subscribeToSync((event) => {
      if (event.entity === 'products' || event.entity === 'passport') {
        fetchProduct(true);
      }
    });

    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchProduct(true);
      }
    };

    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      unsubscribe();
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-xl py-5">
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="skeleton-box rounded-3" style={{ height: '440px', width: '100%' }}></div>
          </div>
          <div className="col-12 col-lg-6 d-flex flex-column gap-3">
            <div className="skeleton-box rounded" style={{ height: '24px', width: '30%' }}></div>
            <div className="skeleton-box rounded" style={{ height: '36px', width: '85%' }}></div>
            <div className="skeleton-box rounded" style={{ height: '40px', width: '50%' }}></div>
            <div className="skeleton-box rounded" style={{ height: '80px', width: '100%' }}></div>
            <div className="skeleton-box rounded" style={{ height: '50px', width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-xl py-5 text-center">
        <div className="reloop-empty-state max-w-md mx-auto my-5 p-5">
          <h4 className="text-dark mb-2">Device Not Found</h4>
          <p className="text-muted mb-4">The renewed device you are looking for has been moved or sold out.</p>
          <Link to="/products" className="btn btn-reloop-primary">
            Browse All Available Tech
          </Link>
        </div>
      </div>
    );
  }

  const isFavorited = isInWishlist(product._id);
  const isCompared = isInCompare(product._id);

  const originalPrice = product.originalRetailPrice || product.refurbishedPrice;
  const currentPrice = product.refurbishedPrice;
  const discountPercent = originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.primaryImage];

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.trim().length === 6) {
      setPincodeResult({
        available: true,
        message: `Delivery available to ${pincode} in 2-3 business days. Free delivery.`,
      });
    } else {
      setPincodeResult({
        available: false,
        message: 'Please enter a valid 6-digit Indian PIN code.',
      });
    }
  };

  const handleBuyNow = () => {
    addToCart(product, 1);
    navigate('/checkout');
  };

  return (
    <div className="py-4">
      <div className="container-xl">
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small text-muted">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none text-muted">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/products" className="text-decoration-none text-muted">Products</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to={`/products?category=${product.category}`} className="text-decoration-none text-muted">
                {product.category}
              </Link>
            </li>
            <li className="breadcrumb-item active fw-semibold text-truncate" style={{ maxWidth: '300px' }}>
              {product.title}
            </li>
          </ol>
        </nav>

        {/* Main 2-Column Product Detail Layout */}
        <div className="row g-4 mb-5">
          {/* Left Column: Image Gallery */}
          <div className="col-12 col-lg-6">
            <div className="d-flex flex-column-reverse flex-sm-row gap-3">
              {/* Vertical Thumbnail Strip */}
              {imagesList.length > 1 && (
                <div className="d-flex flex-sm-column gap-2 overflow-auto" style={{ maxWidth: '100px' }}>
                  {imagesList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`btn p-1 border rounded bg-white ${selectedImage === img ? 'border-success border-2 shadow-xs' : 'border-light'}`}
                      style={{ width: '70px', height: '70px', flexShrink: 0 }}
                      onClick={() => setSelectedImage(img)}
                    >
                      <ProductImage
                        src={img}
                        alt={`${product.title} thumb ${idx + 1}`}
                        slug={product.slug}
                        category={product.category}
                        productTitle={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Large Image Preview Container */}
              <div
                className="reloop-card p-4 flex-grow-1 bg-white d-flex align-items-center justify-content-center position-relative"
                style={{ minHeight: '440px' }}
              >
                <ProductImage
                  src={selectedImage}
                  alt={product.title}
                  slug={product.slug}
                  category={product.category}
                  productTitle={product.title}
                  className="img-fluid"
                  style={{ maxHeight: '380px', objectFit: 'contain' }}
                />
                <span className="position-absolute top-0 start-0 m-3">
                  <ConditionBadge grade={product.conditionGrade} />
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Condition, Pricing, Passport Trigger, Actions */}
          <div className="col-12 col-lg-6">
            <div className="ps-lg-3">
              <span className="badge bg-success text-white text-uppercase px-2 py-1 mb-2" style={{ fontSize: '0.7rem' }}>
                ✓ RELOOP Certified Renewed
              </span>

              <h1 className="h3 fw-bold text-dark mb-1">{product.title}</h1>

              <div className="d-flex flex-wrap align-items-center gap-3 mb-3 small text-muted">
                <div className="d-flex align-items-center text-warning">
                  <Star size={16} fill="currentColor" />
                  <span className="ms-1 fw-bold text-dark">{product.rating || 4.8}</span>
                  <span className="text-muted ms-1">
                    ({product.reviewCount ? `${product.reviewCount} customer reviews` : 'Refurbished Grade Score'})
                  </span>
                </div>
                <span>·</span>
                <span>SKU: {product.slug?.toUpperCase() || 'RLP-TECH'}</span>
                <span>·</span>
                <span className="text-success fw-semibold">
                  {product.stockCount > 0 ? `In Stock (${product.stockCount} units)` : 'Out of Stock'}
                </span>
              </div>

              {/* Price Block */}
              <div className="p-3 rounded bg-white border mb-3">
                <div className="d-flex align-items-baseline gap-3 mb-1">
                  <span className="display-6 fw-extrabold text-dark tabular-nums" style={{ color: 'var(--reloop-navy)' }}>
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  {originalPrice > currentPrice && (
                    <span className="h5 text-muted text-decoration-line-through mb-0 tabular-nums">
                      ₹{originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="reloop-badge-discount fs-6 tabular-nums">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>
                <small className="text-muted d-block">
                  Inclusive of all taxes · Free door-to-door delivery · Zero hidden fees
                </small>
              </div>

              {/* Condition & Digital Passport Section */}
              <div className="reloop-card p-3 mb-4 bg-white border-success-subtle">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold small text-dark">Condition Grade:</span>
                    <ConditionBadge grade={product.conditionGrade} />
                  </div>
                  <button
                    type="button"
                    className="btn btn-link text-success p-0 fw-bold small text-decoration-none d-flex align-items-center gap-1"
                    onClick={() => setShowPassportModal(true)}
                  >
                    View Digital Product Passport <ExternalLink size={14} />
                  </button>
                </div>
                <p className="text-muted small mb-0">{product.conditionSummary}</p>
              </div>

              {/* 4 Trust Tiles */}
              <div className="row g-2 mb-4">
                <div className="col-6 col-sm-3">
                  <div className="p-2 border rounded text-center bg-white">
                    <Award size={18} className="text-success mb-1" />
                    <div className="fw-bold small text-dark">{product.warrantyMonths || 12} Months</div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>Warranty</span>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="p-2 border rounded text-center bg-white">
                    <ShieldCheck size={18} className="text-success mb-1" />
                    <div className="fw-bold small text-dark">50-Point</div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>Quality Check</span>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="p-2 border rounded text-center bg-white">
                    <RotateCcw size={18} className="text-success mb-1" />
                    <div className="fw-bold small text-dark">7 Days</div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>Easy Returns</span>
                  </div>
                </div>
                <div className="col-6 col-sm-3">
                  <div className="p-2 border rounded text-center bg-white">
                    <Wrench size={18} className="text-success mb-1" />
                    <div className="fw-bold small text-dark">Original OEM</div>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>Parts Disclosed</span>
                  </div>
                </div>
              </div>

              {/* Delivery PIN Code Checker */}
              <div className="mb-4">
                <label className="fw-bold small text-dark mb-1 d-flex align-items-center gap-1">
                  <MapPin size={14} className="text-success" /> Estimate Delivery Time
                </label>
                <form onSubmit={handlePincodeCheck} className="d-flex gap-2" style={{ maxWidth: '320px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Enter 6-digit PIN code"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  />
                  <button type="submit" className="btn btn-reloop-outline btn-sm text-nowrap">
                    Check
                  </button>
                </form>
                {pincodeResult && (
                  <small className={`d-block mt-1 ${pincodeResult.available ? 'text-success' : 'text-danger'}`}>
                    {pincodeResult.message}
                  </small>
                )}
              </div>

              {/* Action Buttons */}
              <div className="d-flex flex-wrap align-items-center gap-3 pt-2 border-top">
                <button
                  type="button"
                  className="btn btn-reloop-primary px-4 py-2 flex-grow-1"
                  onClick={() => {
                    addToCart(product, 1);
                    showToast(`Added ${product.title} to cart`, 'success');
                  }}
                  disabled={product.stockCount <= 0}
                >
                  <ShoppingBag size={18} />
                  {product.stockCount > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>

                <button
                  type="button"
                  className="btn btn-reloop-navy px-4 py-2 flex-grow-1"
                  onClick={handleBuyNow}
                  disabled={product.stockCount <= 0}
                >
                  <Zap size={18} /> Buy Now
                </button>

                <button
                  type="button"
                  className={`btn p-2 rounded border ${isFavorited ? 'text-danger bg-light' : 'text-muted bg-white'}`}
                  onClick={() => {
                    toggleWishlist(product);
                    showToast(isFavorited ? `Removed from wishlist` : `Added to wishlist`, 'info');
                  }}
                  title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                  <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>

                <button
                  type="button"
                  className={`btn p-2 rounded border ${isCompared ? 'text-success bg-light' : 'text-muted bg-white'}`}
                  onClick={() => {
                    if (isCompared) {
                      removeFromCompare(product._id);
                      showToast(`Removed from comparison`, 'info');
                    } else {
                      addToCompare(product);
                      showToast(`Added to comparison tray`, 'info');
                    }
                  }}
                  title={isCompared ? 'Remove from compare' : 'Add to comparison'}
                >
                  <RefreshCw size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content Sections */}
        <div className="reloop-card p-4 bg-white mt-4">
          <ul className="nav nav-tabs mb-4 border-bottom">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link fw-semibold ${activeTab === 'overview' ? 'active text-success border-success border-bottom-0' : 'text-muted'}`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link fw-semibold ${activeTab === 'specifications' ? 'active text-success border-success border-bottom-0' : 'text-muted'}`}
                onClick={() => setActiveTab('specifications')}
              >
                Hardware Specifications
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link fw-semibold ${activeTab === 'condition' ? 'active text-success border-success border-bottom-0' : 'text-muted'}`}
                onClick={() => setActiveTab('condition')}
              >
                Condition & Inspection Report
              </button>
            </li>
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link fw-semibold ${activeTab === 'warranty' ? 'active text-success border-success border-bottom-0' : 'text-muted'}`}
                onClick={() => setActiveTab('warranty')}
              >
                Warranty & Easy Returns
              </button>
            </li>
          </ul>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div>
              <h5 className="fw-bold text-dark mb-3">About this certified renewed device</h5>
              <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>
                The <strong>{product.title}</strong> has undergone our standardized 50-point technical inspection protocol.
                Our certified technicians inspect power delivery, battery life cycle, thermal paste efficiency, screen pixel integrity, and port throughput.
                Any cosmetic handling is transparently documented in the condition grade, ensuring you receive exceptional tech at substantial savings.
              </p>
              <div className="p-3 bg-light rounded d-flex align-items-center gap-3">
                <ShieldCheck size={28} className="text-success" />
                <div>
                  <h6 className="mb-0 fw-bold text-dark">Digital Product Passport Enclosed</h6>
                  <small className="text-muted">
                    This unit comes with a verifiable digital passport including serial number, inspection scorecard, and battery health report.
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Specifications Table */}
          {activeTab === 'specifications' && (
            <div className="table-responsive">
              <table className="table table-bordered table-striped mb-0 small">
                <tbody>
                  <tr>
                    <th style={{ width: '30%' }} className="bg-light text-dark">Brand</th>
                    <td>{product.brand}</td>
                  </tr>
                  <tr>
                    <th className="bg-light text-dark">Category</th>
                    <td>{product.category} ({product.subcategory || 'Standard'})</td>
                  </tr>
                  <tr>
                    <th className="bg-light text-dark">Processor</th>
                    <td>{product.specifications?.processor || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th className="bg-light text-dark">System Memory (RAM)</th>
                    <td>{product.specifications?.ram || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th className="bg-light text-dark">Storage Capacity</th>
                    <td>{product.specifications?.storage || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th className="bg-light text-dark">Display Specifications</th>
                    <td>{product.specifications?.display || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th className="bg-light text-dark">Graphics (GPU)</th>
                    <td>{product.specifications?.graphics || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th className="bg-light text-dark">Operating System</th>
                    <td>{product.specifications?.os || 'N/A'}</td>
                  </tr>
                  <tr>
                    <th className="bg-light text-dark">Battery Health Metric</th>
                    <td>
                      {['Smartphones', 'Laptops', 'Tablets', 'Wearables', 'Audio'].includes(product.category) ? (
                        <span className="fw-bold text-success">
                          {product.specifications?.batteryHealthPercent || 92}% Original Capacity
                        </span>
                      ) : (
                        <span className="text-muted small">
                          N/A (Mains / Bus Powered Component)
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="text-muted small mt-2" style={{ fontSize: '0.75rem' }}>
                * Specifications, diagnostic ratings, and battery metrics represent verified lab testing benchmarks.
              </div>
            </div>
          )}

          {/* Tab 3: Condition Report */}
          {activeTab === 'condition' && (
            <div>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-bold text-dark mb-0">Transparent Condition Assessment</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-reloop-primary"
                  onClick={() => setShowPassportModal(true)}
                >
                  Open Full Digital Passport Modal
                </button>
              </div>
              <p className="text-muted mb-3">{product.conditionSummary}</p>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="border rounded p-3 bg-light">
                    <h6 className="fw-bold text-dark small">Display & Glass</h6>
                    <p className="text-muted small mb-0">Passed 100% dead pixel, pressure mark, and digitizer latency tests.</p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3 bg-light">
                    <h6 className="fw-bold text-dark small">Power & Battery Health</h6>
                    <p className="text-muted small mb-0">
                      {['Smartphones', 'Laptops', 'Tablets', 'Wearables', 'Audio'].includes(product.category) ? (
                        <>Measured at <strong>{product.specifications?.batteryHealthPercent || 94}%</strong> original capacity under full workload benchmarking.</>
                      ) : (
                        <>Mains-powered component verified under maximum power load draw and thermals.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Warranty & Returns */}
          {activeTab === 'warranty' && (
            <div>
              <h5 className="fw-bold text-dark mb-3">Warranty Protection & 7-Day Easy Returns</h5>
              <ul className="text-muted small" style={{ lineHeight: 1.8 }}>
                <li><strong>{product.warrantyMonths || 12} Months Comprehensive Warranty:</strong> Covers logic board, screen defects, internal audio drivers, power delivery, and hardware failures.</li>
                <li><strong>7-Day Hassle-Free Returns:</strong> Not satisfied with the cosmetic feel or performance? Return for a 100% refund with doorstep pickup.</li>
                <li><strong>Doorstep Replacement:</strong> In case of any warranty claim, RELOOP arranges doorstep pickup and repair in our certified labs.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Digital Product Passport Modal */}
      {showPassportModal && (
        <DigitalPassportModal
          product={product}
          passport={product.digitalPassportId}
          onClose={() => setShowPassportModal(false)}
        />
      )}
    </div>
  );
}
