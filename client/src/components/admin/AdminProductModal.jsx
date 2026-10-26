import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Eye, AlertCircle, Image as ImageIcon, Upload, CheckCircle2, RefreshCw } from 'lucide-react';
import ConditionBadge from '../common/ConditionBadge';
import ProductImage from '../common/ProductImage';
import api from '../../services/api';

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

export default function AdminProductModal({ product, onClose, onSaved }) {
  const isEditing = Boolean(product && product._id);
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    brand: 'Apple',
    category: 'Laptops',
    subcategory: '',
    refurbishedPrice: '',
    originalRetailPrice: '',
    stockCount: 5,
    conditionGrade: 'Pristine',
    conditionSummary: '',
    primaryImage: '/images/products/apple-macbook-air-m1.jpg',
    images: ['/images/products/apple-macbook-air-m1.jpg'],
    specifications: {
      processor: 'Apple M1 Chip',
      ram: '8GB Unified',
      storage: '256GB SSD',
      display: '13.3-inch Retina',
      graphics: 'Integrated GPU',
      os: 'macOS',
      batteryHealthPercent: 95,
    },
    warrantyMonths: 12,
    diagnosticScore: 96,
  });

  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || '',
        slug: product.slug || '',
        brand: product.brand || 'Apple',
        category: product.category || 'Laptops',
        subcategory: product.subcategory || '',
        refurbishedPrice: product.refurbishedPrice || '',
        originalRetailPrice: product.originalRetailPrice || '',
        stockCount: product.stockCount !== undefined ? product.stockCount : 5,
        conditionGrade: product.conditionGrade || 'Pristine',
        conditionSummary: product.conditionSummary || '',
        primaryImage: product.primaryImage || '',
        images: product.images && product.images.length > 0 ? product.images : [product.primaryImage || ''],
        specifications: {
          processor: product.specifications?.processor || '',
          ram: product.specifications?.ram || '',
          storage: product.specifications?.storage || '',
          display: product.specifications?.display || '',
          graphics: product.specifications?.graphics || '',
          os: product.specifications?.os || '',
          batteryHealthPercent: product.specifications?.batteryHealthPercent || 92,
        },
        warrantyMonths: product.warrantyMonths || 12,
        diagnosticScore: product.digitalPassportId?.diagnosticSummaryScore || 95,
      });
    }
  }, [product]);

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(`File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Limit is 5MB.`);
      return;
    }

    setUploadingImage(true);
    setErrorMsg('');
    setUploadSuccessMsg('');

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await api.post('/upload', {
          image: reader.result,
        });

        if (res.data.success) {
          setFormData((prev) => ({
            ...prev,
            primaryImage: res.data.filePath,
            images: [res.data.filePath],
          }));
          setUploadSuccessMsg(`Uploaded: ${res.data.fileName}`);
        }
      } catch (err) {
        console.error('Image upload failed:', err);
        setErrorMsg(err.response?.data?.message || 'Failed to upload image. Please try again.');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.title || !formData.title.trim()) {
      setErrorMsg('Please enter a product title (required).');
      return;
    }

    if (formData.refurbishedPrice === '' || isNaN(Number(formData.refurbishedPrice)) || Number(formData.refurbishedPrice) < 0) {
      setErrorMsg('Please enter a valid non-negative refurbished price.');
      return;
    }

    if (formData.stockCount === '' || isNaN(Number(formData.stockCount)) || Number(formData.stockCount) < 0) {
      setErrorMsg('Please enter a valid non-negative stock count.');
      return;
    }

    // Resolve image: optional, defaults to authentic category photograph if omitted
    const catKey = (formData.category || 'laptops').toLowerCase();
    const fallbackImage = CATEGORY_PHOTO_FALLBACKS[catKey] || CATEGORY_PHOTO_FALLBACKS.default;
    const finalPrimaryImage = formData.primaryImage?.trim() || fallbackImage;
    const finalImages = formData.images && formData.images.length > 0 && formData.images[0]?.trim()
      ? formData.images
      : [finalPrimaryImage];

    const payload = {
      ...formData,
      title: formData.title.trim(),
      refurbishedPrice: Number(formData.refurbishedPrice),
      originalRetailPrice: Number(formData.originalRetailPrice || formData.refurbishedPrice),
      stockCount: Number(formData.stockCount || 0),
      primaryImage: finalPrimaryImage,
      images: finalImages,
    };

    setSaving(true);
    try {
      if (isEditing) {
        const res = await api.put(`/products/${product._id}`, payload);
        if (res.data.success) {
          onSaved(res.data.product);
          onClose();
        }
      } else {
        const res = await api.post('/products', payload);
        if (res.data.success) {
          onSaved(res.data.product);
          onClose();
        }
      }
    } catch (err) {
      console.error('Save product error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save product. Please check values.');
    } finally {
      setSaving(false);
    }
  };

  const original = Number(formData.originalRetailPrice) || Number(formData.refurbishedPrice);
  const current = Number(formData.refurbishedPrice) || 0;
  const discountPercent = original > current ? Math.round(((original - current) / original) * 100) : 0;

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(16, 42, 69, 0.7)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
          {/* Header */}
          <div className="modal-header bg-dark text-white border-0 py-3 px-4" style={{ backgroundColor: 'var(--reloop-navy)' }}>
            <div>
              <h5 className="modal-title mb-0 fw-bold text-white">
                {isEditing ? `Edit Product: ${product.title}` : 'Add New Refurbished Product'}
              </h5>
              <small className="text-secondary">
                Listing with certified diagnostic parameters, specifications, and live preview.
              </small>
            </div>
            <button type="button" className="btn btn-sm text-white-50 p-1 border-0" onClick={onClose}>
              <X size={22} />
            </button>
          </div>

          {/* Form Tabs */}
          <div className="px-4 pt-3 bg-light border-bottom">
            <ul className="nav nav-tabs border-0">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link small fw-semibold ${activeTab === 'basic' ? 'active text-success' : 'text-muted'}`}
                  onClick={() => setActiveTab('basic')}
                >
                  1. Basic Information
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link small fw-semibold ${activeTab === 'pricing' ? 'active text-success' : 'text-muted'}`}
                  onClick={() => setActiveTab('pricing')}
                >
                  2. Pricing & Stock
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link small fw-semibold ${activeTab === 'specs' ? 'active text-success' : 'text-muted'}`}
                  onClick={() => setActiveTab('specs')}
                >
                  3. Hardware Specs
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link small fw-semibold ${activeTab === 'passport' ? 'active text-success' : 'text-muted'}`}
                  onClick={() => setActiveTab('passport')}
                >
                  4. Condition & Passport
                </button>
              </li>
            </ul>
          </div>

          {/* Modal Body */}
          <div className="modal-body p-4" style={{ backgroundColor: 'var(--reloop-bg)' }}>
            {errorMsg && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-4">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="row g-4">
              {/* Left Column: Form Fields */}
              <div className="col-12 col-lg-8">
                <form onSubmit={handleSubmit} id="adminProductForm">
                  {/* Tab 1: Basic Information */}
                  {activeTab === 'basic' && (
                    <div className="reloop-card p-4 bg-white shadow-xs">
                      <h6 className="fw-bold text-dark mb-3">Basic Listing Details</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Brand *</label>
                          <select
                            className="form-select form-select-sm"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            required
                          >
                            <option value="Apple">Apple</option>
                            <option value="Dell">Dell</option>
                            <option value="HP">HP</option>
                            <option value="Lenovo">Lenovo</option>
                            <option value="Samsung">Samsung</option>
                            <option value="Sony">Sony</option>
                            <option value="NVIDIA">NVIDIA</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Category *</label>
                          <select
                            className="form-select form-select-sm"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            required
                          >
                            <option value="Laptops">Laptops</option>
                            <option value="Smartphones">Smartphones (Mobiles)</option>
                            <option value="Tablets">Tablets</option>
                            <option value="Audio">Audio</option>
                            <option value="Wearables">Wearables</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Cameras">Cameras</option>
                            <option value="PC Components">PC Components</option>
                          </select>
                        </div>

                        <div className="col-12">
                          <label className="form-label small fw-semibold">Product Title *</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Apple MacBook Air M1 (2020) · 8GB/256GB"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Slug (URL Key)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="apple-macbook-air-m1"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Subcategory</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Ultrabook, Flagship, GPU"
                            value={formData.subcategory}
                            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label small fw-semibold d-flex justify-content-between align-items-center mb-1">
                            <span>Product Photograph *</span>
                            {uploadSuccessMsg && (
                              <span className="text-success small fw-semibold d-flex align-items-center gap-1">
                                <CheckCircle2 size={13} /> {uploadSuccessMsg}
                              </span>
                            )}
                          </label>

                          {/* Image File Picker & Direct Upload */}
                          <div className="p-3 border rounded bg-light mb-2">
                            <div className="d-flex flex-column flex-sm-row gap-2 align-items-sm-center justify-content-between mb-2">
                              <div>
                                <span className="small fw-bold text-dark d-block">Upload Local Photo File:</span>
                                <small className="text-muted">Supports JPEG, PNG, WebP up to 5MB.</small>
                              </div>
                              <div>
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  className="d-none"
                                  accept="image/jpeg,image/png,image/webp"
                                  onChange={handleImageFileUpload}
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-reloop-primary d-flex align-items-center gap-1 text-nowrap"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={uploadingImage}
                                >
                                  {uploadingImage ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm" role="status" /> Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={14} /> Choose & Upload Photo
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Preset Genuine Product Photography Selector */}
                            <div className="row g-2 align-items-center pt-2 border-top">
                              <div className="col-12 col-sm-auto">
                                <small className="text-muted fw-semibold">Or select from library:</small>
                              </div>
                              <div className="col">
                                <select
                                  className="form-select form-select-sm"
                                  value={formData.primaryImage}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      primaryImage: e.target.value,
                                      images: [e.target.value],
                                    })
                                  }
                                >
                                  <option value="">-- Choose Authentic Product Photo --</option>
                                  <option value="/images/products/apple-macbook-air-m1.jpg">Apple MacBook Air M1</option>
                                  <option value="/images/products/dell-xps-13-9305.jpg">Dell XPS 13</option>
                                  <option value="/images/products/apple-iphone-13.jpg">Apple iPhone 13</option>
                                  <option value="/images/products/samsung-galaxy-s22.jpg">Samsung Galaxy S22</option>
                                  <option value="/images/products/google-pixel-7.jpg">Google Pixel 7</option>
                                  <option value="/images/products/apple-ipad-air-4.png">Apple iPad Air 4</option>
                                  <option value="/images/products/sony-wh1000xm4.jpg">Sony WH-1000XM4</option>
                                  <option value="/images/products/apple-watch-7.jpg">Apple Watch Series 7</option>
                                  <option value="/images/products/ps5-digital.jpg">PlayStation 5 Digital</option>
                                  <option value="/images/products/nintendo-switch-oled.jpg">Nintendo Switch OLED</option>
                                  <option value="/images/products/sony-a6400.jpg">Sony Alpha A6400</option>
                                  <option value="/images/products/rtx-3070-ti.jpg">NVIDIA RTX 3070 Ti</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Active Image Path Field - Optional with category fallback */}
                          <div className="input-group input-group-sm">
                            <span className="input-group-text bg-light text-muted">Active Path (Optional)</span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="/images/products/... (leaves category default if empty)"
                              value={formData.primaryImage}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  primaryImage: e.target.value,
                                  images: [e.target.value],
                                })
                              }
                            />
                          </div>
                          <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                            Optional: If omitted, RELOOP automatically assigns a genuine category reference photograph.
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Pricing & Stock */}
                  {activeTab === 'pricing' && (
                    <div className="reloop-card p-4 bg-white shadow-xs">
                      <h6 className="fw-bold text-dark mb-3">Pricing & Inventory Allocation</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Refurbished Selling Price (INR) *</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="45999"
                            value={formData.refurbishedPrice}
                            onChange={(e) => setFormData({ ...formData, refurbishedPrice: e.target.value })}
                            required
                            min="0"
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Original Retail Price / MRP (INR)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="62900"
                            value={formData.originalRetailPrice}
                            onChange={(e) => setFormData({ ...formData, originalRetailPrice: e.target.value })}
                            min="0"
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Stock Quantity *</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={formData.stockCount}
                            onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                            required
                            min="0"
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Warranty Duration (Months) *</label>
                          <select
                            className="form-select form-select-sm"
                            value={formData.warrantyMonths}
                            onChange={(e) => setFormData({ ...formData, warrantyMonths: e.target.value })}
                          >
                            <option value="6">6 Months Standard</option>
                            <option value="12">12 Months Extended</option>
                            <option value="24">24 Months Premium</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Hardware Specifications */}
                  {activeTab === 'specs' && (
                    <div className="reloop-card p-4 bg-white shadow-xs">
                      <h6 className="fw-bold text-dark mb-3">Technical Hardware Specifications</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Processor (CPU)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={formData.specifications.processor}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: { ...formData.specifications, processor: e.target.value },
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Memory (RAM)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={formData.specifications.ram}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: { ...formData.specifications, ram: e.target.value },
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Storage Capacity</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={formData.specifications.storage}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: { ...formData.specifications, storage: e.target.value },
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Display</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={formData.specifications.display}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: { ...formData.specifications, display: e.target.value },
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Graphics (GPU)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={formData.specifications.graphics}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: { ...formData.specifications, graphics: e.target.value },
                              })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Operating System</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={formData.specifications.os}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: { ...formData.specifications, os: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Condition & Passport */}
                  {activeTab === 'passport' && (
                    <div className="reloop-card p-4 bg-white shadow-xs">
                      <h6 className="fw-bold text-dark mb-3">Refurbished Grading & Diagnostic Passport</h6>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Condition Grade *</label>
                          <select
                            className="form-select form-select-sm"
                            value={formData.conditionGrade}
                            onChange={(e) => setFormData({ ...formData, conditionGrade: e.target.value })}
                          >
                            <option value="Pristine">Pristine (Like New)</option>
                            <option value="Excellent">Excellent</option>
                            <option value="Good">Good</option>
                            <option value="Fair">Fair</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Diagnostic Score (0–100)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            max="100"
                            value={formData.diagnosticScore}
                            onChange={(e) => setFormData({ ...formData, diagnosticScore: e.target.value })}
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Battery Health Metric (%)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            min="0"
                            max="100"
                            value={formData.specifications.batteryHealthPercent}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specifications: {
                                  ...formData.specifications,
                                  batteryHealthPercent: Number(e.target.value),
                                },
                              })
                            }
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label small fw-semibold">Condition Summary & Disclosures</label>
                          <textarea
                            className="form-control form-control-sm"
                            rows={3}
                            placeholder="e.g. Minimal signs of handling. Fully functional and lab inspected."
                            value={formData.conditionSummary}
                            onChange={(e) => setFormData({ ...formData, conditionSummary: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Right Column: Live Storefront Preview Card */}
              <div className="col-12 col-lg-4">
                <div className="reloop-card p-3 bg-white shadow-xs sticky-top" style={{ top: '10px' }}>
                  <div className="d-flex align-items-center gap-1 text-success small fw-bold text-uppercase mb-2">
                    <Eye size={15} /> Storefront Live Preview
                  </div>

                  <div className="border rounded p-3 bg-white">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <ConditionBadge grade={formData.conditionGrade} />
                      <span className="small text-muted">{formData.warrantyMonths}m warranty</span>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-center bg-light rounded p-2 mb-2"
                      style={{ height: '140px' }}
                    >
                      <ProductImage
                        src={formData.primaryImage}
                        alt="Preview"
                        slug={formData.slug}
                        category={formData.category}
                        productTitle={formData.title}
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                      />
                    </div>

                    <h6 className="fw-bold text-dark small line-clamp-1 mb-1">
                      {formData.title || 'Untitled Refurbished Item'}
                    </h6>
                    <small className="text-muted d-block mb-2">
                      {formData.specifications.processor} · {formData.specifications.ram}
                    </small>

                    <div className="d-flex align-items-baseline gap-2 mb-2">
                      <span className="fw-bold text-dark fs-5">
                        ₹{Number(formData.refurbishedPrice || 0).toLocaleString('en-IN')}
                      </span>
                      {original > current && (
                        <span className="small text-muted text-decoration-line-through">
                          ₹{original.toLocaleString('en-IN')}
                        </span>
                      )}
                      {discountPercent > 0 && (
                        <span className="reloop-badge-discount small">
                          SAVE {discountPercent}%
                        </span>
                      )}
                    </div>

                    <div className="p-2 rounded bg-light border text-muted small" style={{ fontSize: '0.72rem' }}>
                      ✓ Preview automatically reflects form updates.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer bg-white border-top py-2 px-4 d-flex justify-content-between">
            <button type="button" className="btn btn-reloop-outline btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              form="adminProductForm"
              className="btn btn-reloop-primary btn-sm px-4"
              disabled={saving}
            >
              {saving ? 'Saving to Database...' : isEditing ? 'Save Changes' : 'Create & Publish Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
