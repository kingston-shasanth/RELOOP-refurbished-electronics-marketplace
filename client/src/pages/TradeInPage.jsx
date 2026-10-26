import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRightLeft,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  CheckCircle2,
  ShieldCheck,
  Trash2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function TradeInPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [deviceCategory, setDeviceCategory] = useState('Smartphones');
  const [brand, setBrand] = useState('Apple');
  const [modelName, setModelName] = useState('iPhone 13 (128GB)');
  const [storage, setStorage] = useState('128GB');
  const [purchaseYear, setPurchaseYear] = useState('2022');
  const [batteryHealth, setBatteryHealth] = useState('90-100%');
  const [screenCondition, setScreenCondition] = useState('No visible cracks');
  const [functionalCondition, setFunctionalCondition] = useState('Fully functional · Minor signs of use');
  const [cosmeticGrade, setCosmeticGrade] = useState('Good (Minor Scratches)');

  const [valuationResult, setValuationResult] = useState({
    estimatedValue: 14500,
    indicativeRange: '₹13,500–₹16,000',
    breakdown: {
      baseModelValue: 16000,
      cosmeticAdjustment: 1000,
      functionalDeductions: 1500,
      batteryAdjustment: -1000,
    },
  });

  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setCalculating(true);
    setErrorMsg('');
    try {
      const res = await api.post('/trade-in/calculate', {
        category: deviceCategory,
        brand,
        modelName,
        functionalState: {
          powersOn: true,
          screenIntact: screenCondition === 'No visible cracks',
          touchResponsive: true,
          camerasWork: true,
          batteryWorking: true,
        },
        cosmeticGrade,
        batteryHealth,
      });

      if (res.data.success) {
        setValuationResult(res.data.data);
      }
    } catch (err) {
      console.error('Calculation failed:', err);
      setErrorMsg('Could not calculate estimate. Please verify the device details.');
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!user) {
      navigate('/login?redirect=/trade-in');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await api.post('/trade-in/submit', {
        deviceCategory,
        brand,
        modelName: `${modelName} (${storage})`,
        specifications: `Purchased: ${purchaseYear}, Battery: ${batteryHealth}, Screen: ${screenCondition}`,
        functionalState: {
          powersOn: true,
          screenIntact: screenCondition === 'No visible cracks',
          touchResponsive: true,
          camerasWork: true,
          batteryWorking: true,
        },
        cosmeticGrade,
        estimatedValue: valuationResult.estimatedValue,
        valuationBreakdown: valuationResult.breakdown,
      });

      if (res.data.success) {
        setSubmitSuccess(true);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit trade-in request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    { name: 'Smartphones', label: 'Smartphone', icon: Smartphone },
    { name: 'Laptops', label: 'Laptop', icon: Laptop },
    { name: 'Tablets', label: 'Tablet', icon: Tablet },
    { name: 'Wearables', label: 'Wearable', icon: Watch },
  ];

  return (
    <div className="py-4">
      <div className="container-xl">
        {/* Hero Section */}
        <div className="reloop-card p-4 p-md-5 mb-4 bg-white border-success-subtle shadow-xs">
          <div className="row align-items-center g-4">
            <div className="col-12 col-lg-8">
              <span className="badge bg-success-subtle text-success text-uppercase fw-bold mb-2" style={{ fontSize: '0.72rem' }}>
                Trade In · Upgrade · Reuse
              </span>
              <h1 className="display-5 fw-bold text-dark mb-2" style={{ color: 'var(--reloop-navy)' }}>
                Your old device deserves a second life.
              </h1>
              <p className="text-muted lead mb-0" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                Get an estimated trade-in quote for eligible electronics, then send the device for inspection. Final vouchers depend on physical verification of the model and reported diagnostic condition.
              </p>
            </div>
            <div className="col-12 col-lg-4 text-center">
              <div className="p-4 bg-light rounded-circle d-inline-flex mb-2">
                <ArrowRightLeft size={56} className="text-success" />
              </div>
              <div className="fw-bold text-dark">Instant Explainable Valuation</div>
              <small className="text-muted">Zero hidden deductions · Certified Data Wipe</small>
            </div>
          </div>
        </div>

        {submitSuccess ? (
          <div className="reloop-card p-5 bg-white text-center shadow-sm max-w-md mx-auto my-4">
            <CheckCircle2 size={56} className="text-success mb-3" />
            <h3 className="fw-bold text-dark mb-2">Trade-In Request Submitted!</h3>
            <p className="text-muted mb-4">
              Your trade-in estimation of <strong>₹{valuationResult.estimatedValue.toLocaleString('en-IN')}</strong> for{' '}
              <strong>{brand} {modelName}</strong> has been logged into our inspection queue.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <Link to="/account?tab=tradein" className="btn btn-reloop-primary">
                View in Account Portal
              </Link>
              <button
                type="button"
                className="btn btn-reloop-outline"
                onClick={() => setSubmitSuccess(false)}
              >
                Estimate Another Device
              </button>
            </div>
          </div>
        ) : (
          /* Calculator & Results 2-Column Row */
          <div className="row g-4">
            {/* Left Column: Form Questionnaire */}
            <div className="col-12 col-lg-7">
              <div className="reloop-card p-4 bg-white shadow-xs">
                <h4 className="fw-bold text-dark mb-1">Estimate your device value</h4>
                <p className="text-muted small mb-4">
                  Select the closest match. This is a transparent preliminary estimate.
                </p>

                {/* Device Category Selector */}
                <div className="row row-cols-2 row-cols-sm-4 g-2 mb-4">
                  {categories.map((cat, idx) => {
                    const Icon = cat.icon;
                    const isSelected = deviceCategory === cat.name;
                    return (
                      <div key={idx} className="col">
                        <button
                          type="button"
                          className={`btn w-100 p-2 text-center border rounded ${
                            isSelected ? 'btn-reloop-primary border-success' : 'btn-light text-muted'
                          }`}
                          onClick={() => setDeviceCategory(cat.name)}
                        >
                          <Icon size={20} className="d-block mx-auto mb-1" />
                          <span className="small fw-semibold">{cat.label}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleCalculate}>
                  <div className="row g-3">
                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Brand *</label>
                      <select
                        className="form-select form-select-sm"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                      >
                        <option value="Apple">Apple</option>
                        <option value="Samsung">Samsung</option>
                        <option value="Dell">Dell</option>
                        <option value="HP">HP</option>
                        <option value="Lenovo">Lenovo</option>
                        <option value="Sony">Sony</option>
                      </select>
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Model Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-6 col-sm-4">
                      <label className="form-label small fw-semibold">Storage / Specs</label>
                      <select
                        className="form-select form-select-sm"
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                      >
                        <option value="64GB">64GB</option>
                        <option value="128GB">128GB</option>
                        <option value="256GB">256GB</option>
                        <option value="512GB">512GB</option>
                        <option value="1TB">1TB</option>
                      </select>
                    </div>

                    <div className="col-6 col-sm-4">
                      <label className="form-label small fw-semibold">Purchase Year</label>
                      <select
                        className="form-select form-select-sm"
                        value={purchaseYear}
                        onChange={(e) => setPurchaseYear(e.target.value)}
                      >
                        <option value="2024">2024 (Under 1 year)</option>
                        <option value="2023">2023 (~2 years)</option>
                        <option value="2022">2022 (~3 years)</option>
                        <option value="2021">2021 (~4 years)</option>
                        <option value="2020">2020 or older</option>
                      </select>
                    </div>

                    <div className="col-12 col-sm-4">
                      <label className="form-label small fw-semibold">Battery Health</label>
                      <select
                        className="form-select form-select-sm"
                        value={batteryHealth}
                        onChange={(e) => setBatteryHealth(e.target.value)}
                      >
                        <option value="90-100%">90–100% (High)</option>
                        <option value="80-90%">80–90% (Good)</option>
                        <option value="Below 80%">Below 80% (Degraded)</option>
                      </select>
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Screen Condition</label>
                      <select
                        className="form-select form-select-sm"
                        value={screenCondition}
                        onChange={(e) => setScreenCondition(e.target.value)}
                      >
                        <option value="No visible cracks">Flawless (No visible cracks)</option>
                        <option value="Minor hairline scratches">Minor hairline scratches</option>
                        <option value="Cracked / Broken glass">Cracked glass / Dead pixels</option>
                      </select>
                    </div>

                    <div className="col-12 col-sm-6">
                      <label className="form-label small fw-semibold">Cosmetic Grade Assessment</label>
                      <select
                        className="form-select form-select-sm"
                        value={cosmeticGrade}
                        onChange={(e) => setCosmeticGrade(e.target.value)}
                      >
                        <option value="Flawless">Flawless (Like Brand New)</option>
                        <option value="Good (Minor Scratches)">Good (Minor signs of use)</option>
                        <option value="Fair (Heavy Wear)">Fair (Visible dents/heavy scuffs)</option>
                        <option value="Damaged">Damaged / Non-functional parts</option>
                      </select>
                    </div>

                    <div className="col-12 mt-4">
                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-reloop-primary px-4 py-2"
                          disabled={calculating}
                        >
                          {calculating ? 'Calculating...' : 'Calculate Estimated Value →'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-reloop-outline px-3"
                          onClick={() => {
                            setModelName('iPhone 13');
                            setBrand('Apple');
                            setCosmeticGrade('Good (Minor Scratches)');
                            handleCalculate();
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Transparent Valuation Summary */}
            <div className="col-12 col-lg-5">
              <div className="reloop-card p-4 bg-white shadow-sm sticky-top" style={{ top: '85px' }}>
                <span className="badge bg-success-subtle text-success text-uppercase fw-bold mb-2" style={{ fontSize: '0.7rem' }}>
                  Estimated Trade-In Quote
                </span>
                <h5 className="fw-bold text-dark mb-1">Your explainable estimate</h5>
                <p className="text-muted small mb-3">Calculated via RELOOP Algorithmic Pricing Protocol 2.1.</p>

                {/* Big Price Range Card */}
                <div className="p-4 rounded-3 text-center bg-light border border-success-subtle mb-4">
                  <span className="text-muted small d-block mb-1">Indicative Range for this Selection:</span>
                  <div className="display-6 fw-extrabold text-success mb-1 tabular-nums">
                    {valuationResult.indicativeRange}
                  </div>
                  <small className="text-muted d-block">
                    Estimated Value: <strong className="tabular-nums">₹{valuationResult.estimatedValue?.toLocaleString('en-IN')}</strong>
                  </small>
                </div>

                {/* Mathematical Breakdown Table */}
                <h6 className="fw-bold text-dark small text-uppercase mb-2">Itemized Breakdown</h6>
                <ul className="list-unstyled mb-4 small">
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Base Model Value ({brand} {modelName}):</span>
                    <span className="fw-bold text-dark tabular-nums">
                      ₹{valuationResult.breakdown?.baseModelValue?.toLocaleString('en-IN') || '16,000'}
                    </span>
                  </li>
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Cosmetic Grade Multiplier:</span>
                    <span className="fw-semibold text-success tabular-nums">
                      +₹{valuationResult.breakdown?.cosmeticAdjustment?.toLocaleString('en-IN') || '0'}
                    </span>
                  </li>
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Functional State Deductions:</span>
                    <span className="fw-semibold text-danger tabular-nums">
                      -₹{valuationResult.breakdown?.functionalDeductions?.toLocaleString('en-IN') || '0'}
                    </span>
                  </li>
                  <li className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted">Battery Degradation Adjustment:</span>
                    <span className="fw-semibold text-danger tabular-nums">
                      ₹{valuationResult.breakdown?.batteryAdjustment?.toLocaleString('en-IN') || '0'}
                    </span>
                  </li>
                </ul>

                {errorMsg && (
                  <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2">
                    <Info size={15} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-reloop-primary w-100 py-3 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Submitting to Inspection Queue...
                    </span>
                  ) : (
                    <span>Save Estimate & Request Pickup →</span>
                  )}
                </button>

                <div className="p-2 rounded bg-light border text-muted small" style={{ fontSize: '0.74rem' }}>
                  <Info size={14} className="text-success me-1 d-inline" />
                  <strong>Notice:</strong> This provisional quote is generated via transparent pricing rules. Final store voucher release requires physical verification at our certified facility.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3 Trust Pillars */}
        <div className="row g-3 mt-5 pt-3 border-top">
          <div className="col-12 col-md-4">
            <div className="reloop-card p-3 bg-white h-100 d-flex align-items-center gap-3">
              <ShieldCheck size={28} className="text-success flex-shrink-0" />
              <div>
                <h6 className="fw-bold text-dark small mb-1">Clear, Explainable Valuation</h6>
                <p className="text-muted small mb-0">No black-box deductions. Every parameter is visible and justified.</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="reloop-card p-3 bg-white h-100 d-flex align-items-center gap-3">
              <Lock size={28} className="text-success flex-shrink-0" />
              <div>
                <h6 className="fw-bold text-dark small mb-1">Certified Data Sanitization</h6>
                <p className="text-muted small mb-0">Multi-pass cryptographic data wipe performed on all accepted hardware.</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="reloop-card p-3 bg-white h-100 d-flex align-items-center gap-3">
              <ArrowRightLeft size={28} className="text-success flex-shrink-0" />
              <div>
                <h6 className="fw-bold text-dark small mb-1">Direct Store Voucher</h6>
                <p className="text-muted small mb-0">Apply your quote immediately toward any certified renewed device.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
