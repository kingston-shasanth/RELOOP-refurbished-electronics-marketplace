import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  LogIn,
  UserPlus,
  UserCheck,
  Zap,
  QrCode,
  Smartphone,
  Check,
  Printer,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  Clock,
  KeyRound,
  X,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductImage from '../components/common/ProductImage';
import OrderCelebration from '../components/common/OrderCelebration';
import api from '../services/api';
import { notifyDataChanged } from '../services/syncChannel';

// Formatters for Demo Card Inputs
const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
};

const formatCvv = (value) => {
  return value.replace(/\D/g, '').slice(0, 4);
};

// Card Brand Detector
const detectCardBrand = (cardNumber) => {
  const clean = (cardNumber || '').replace(/\s/g, '');
  if (/^4/.test(clean)) return { name: 'Visa', color: '#1A1F71', badge: 'VISA' };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', color: '#EB001B', badge: 'MASTERCARD' };
  if (/^(60|65|81|82)/.test(clean)) return { name: 'RuPay', color: '#097939', badge: 'RUPAY' };
  if (/^3[47]/.test(clean)) return { name: 'American Express', color: '#2E77BC', badge: 'AMEX' };
  return { name: 'Visa', color: '#087F5B', badge: 'DEMO CARD' };
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, subtotal, deliveryFee, grandTotal, clearCart } = useCart();
  const { user, token, login } = useAuth();

  // Address state initialized with user profile or fallbacks
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: user?.shippingAddress?.street || '',
    city: user?.shippingAddress?.city || '',
    state: user?.shippingAddress?.state || '',
    postalCode: user?.shippingAddress?.postalCode || '',
    country: 'India',
  });

  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Sync shippingAddress when user changes
  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || '+91 98765 43210',
        street: prev.street || user.shippingAddress?.street || '12, Green Park Avenue',
        city: prev.city || user.shippingAddress?.city || 'Bengaluru',
        state: prev.state || user.shippingAddress?.state || 'Karnataka',
        postalCode: prev.postalCode || user.shippingAddress?.postalCode || '560001',
        country: 'India',
      }));
    }
  }, [user]);

  // Payment state: 'Simulated Card' | 'UPI Simulator' | 'Cash on Delivery'
  const [paymentMethod, setPaymentMethod] = useState('Simulated Card');
  const [testCard, setTestCard] = useState({
    number: '4242 4242 4242 4242',
    expiry: '12/28',
    cvv: '123',
    nameOnCard: user?.name || 'Authorized Customer',
  });

  // UPI Simulation State
  const [upiMode, setUpiMode] = useState('vpa'); // 'vpa' | 'qr'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('evaluator@oksbi');
  const [upiSimulatedSuccess, setUpiSimulatedSuccess] = useState(true);
  const [cardSimulatedSuccess, setCardSimulatedSuccess] = useState(true);
  const [qrCountdown, setQrCountdown] = useState(180);

  // Simulated 3D-Secure / OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTimer, setOtpTimer] = useState(119);
  const [otpError, setOtpError] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);

  // Multi-stage Payment Progress State
  const [paymentStage, setPaymentStage] = useState('idle'); // 'idle' | 'initiating' | 'validating' | 'authorizing' | 'success'
  const [progressPercent, setProgressPercent] = useState(0);

  // Post-order confirmation state
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // QR Timer Countdown
  useEffect(() => {
    let interval = null;
    if (paymentMethod === 'UPI Simulator' && upiMode === 'qr' && qrCountdown > 0) {
      interval = setInterval(() => setQrCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [paymentMethod, upiMode, qrCountdown]);

  // OTP Timer Countdown
  useEffect(() => {
    let interval = null;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  const cardBrand = detectCardBrand(testCard.number);

  // Evaluator Instant One-Click Sign-In
  const handleQuickCustomerLogin = async () => {
    setQuickLoginLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/login', {
        email: 'customer@reloop.com',
        password: 'password123',
      });
      if (res.data.success) {
        login(res.data.user, res.data.token);
      }
    } catch (err) {
      console.error('Quick login failed:', err);
      setErrorMsg(err.response?.data?.message || 'Quick login failed. Please sign in manually.');
    } finally {
      setQuickLoginLoading(false);
    }
  };

  // Pre-flight validation before payment modal or execution
  const validateForm = () => {
    const activeToken = token || localStorage.getItem('reloop_customer_token') || localStorage.getItem('reloop_token');
    if (!user || !activeToken) {
      setErrorMsg('Authentication session required. Please sign in to finalize your order.');
      return false;
    }

    if (!agreeTerms) {
      setErrorMsg('Please agree to the return, warranty and inspection terms.');
      return false;
    }

    if (!shippingAddress.fullName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      setErrorMsg('Please fill in complete shipping address details.');
      return false;
    }

    if (paymentMethod === 'Simulated Card') {
      const cleanNum = testCard.number.replace(/\s/g, '');
      if (cleanNum.length < 12) {
        setErrorMsg('Please enter a valid 16-digit simulated card number.');
        return false;
      }
      if (!testCard.expiry || testCard.expiry.length < 4) {
        setErrorMsg('Please enter a valid expiry date (MM/YY).');
        return false;
      }
    }

    if (paymentMethod === 'UPI Simulator' && upiMode === 'vpa') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setErrorMsg('Please provide a valid demo UPI ID (e.g., evaluator@oksbi).');
        return false;
      }
    }

    return true;
  };

  // Primary Submission Trigger
  const handlePlaceOrderClick = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validateForm()) return;

    if (paymentMethod === 'Simulated Card') {
      // Launch Simulated 3D-Secure / OTP Verification
      setOtpCode('');
      setOtpError('');
      setOtpTimer(119);
      setShowOtpModal(true);
    } else if (paymentMethod === 'UPI Simulator') {
      // Run Multi-stage simulation
      executeOrderPlacement();
    } else {
      // Cash on Delivery
      executeOrderPlacement();
    }
  };

  // Execute Order Placement with Multi-Stage Feedback
  const executeOrderPlacement = async () => {
    setSubmitting(true);
    setPaymentStage('initiating');
    setProgressPercent(25);

    try {
      // Stage 1 -> Stage 2
      await new Promise((r) => setTimeout(r, 600));
      setPaymentStage('validating');
      setProgressPercent(55);

      // Stage 2 -> Stage 3
      await new Promise((r) => setTimeout(r, 700));
      setPaymentStage('authorizing');
      setProgressPercent(85);

      // Build authoritative order payload
      const payload = {
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod,
        paymentDetails: {
          paymentMethod,
          simulatedSuccess: paymentMethod === 'Cash on Delivery' ? false : true,
          status: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
          cardBrand: paymentMethod === 'UPI Simulator' ? 'UPI' : cardBrand.name,
          cardLast4: paymentMethod === 'UPI Simulator' ? 'UPI' : testCard.number.replace(/\s/g, '').slice(-4) || '4242',
        },
      };

      const res = await api.post('/orders', payload);

      if (res.data.success) {
        setProgressPercent(100);
        setPaymentStage('success');
        clearCart();
        try {
          localStorage.setItem('reloop_cart', JSON.stringify([]));
          localStorage.removeItem('reloop_cart');
        } catch (e) {}
        setConfirmedOrder(res.data.order);
        notifyDataChanged('orders', res.data.order._id);
        notifyDataChanged('products');
        setShowOtpModal(false);
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      setPaymentStage('idle');
      if (err.response?.status === 401) {
        setErrorMsg('Your session has expired. Please sign in again to authorize this order.');
      } else {
        setErrorMsg(err.response?.data?.message || 'Failed to place order. Please check inputs and retry.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // OTP Verification Handler
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setOtpError('Please enter the 6-digit demo verification code.');
      return;
    }
    setOtpVerifying(true);
    setOtpError('');

    await new Promise((r) => setTimeout(r, 500));
    setOtpVerifying(false);
    setShowOtpModal(false);
    executeOrderPlacement();
  };

  const isAuthenticated = Boolean(user && (token || localStorage.getItem('reloop_customer_token') || localStorage.getItem('reloop_token')));

  // Render Post-Order Confirmation Receipt Screen
  if (confirmedOrder) {
    const orderNumber = confirmedOrder.orderNumber || confirmedOrder._id;

    return (
      <div className="py-5" style={{ backgroundColor: '#FAF9F6', minHeight: '80vh' }}>
        <OrderCelebration orderId={orderNumber} />
        <div className="container-xl" style={{ maxWidth: '860px' }}>
          {/* Success Banner */}
          <div className="reloop-card p-4 p-md-5 bg-white shadow-md text-center mb-4 border-0">
            <div
              className="p-3 rounded-circle d-inline-flex mb-3 reloop-success-pulse"
              style={{ backgroundColor: '#E6FCF5', color: '#087F5B' }}
            >
              <CheckCircle2 size={48} />
            </div>

            <span
              className="badge px-3 py-1 mb-2 text-uppercase fw-bold"
              style={{
                backgroundColor: '#E6FCF5',
                color: '#087F5B',
                border: '1px solid #C3FAE8',
                letterSpacing: '0.06em',
                fontSize: '0.78rem',
              }}
            >
              Order Confirmed & Certified
            </span>

            <h1 className="h3 fw-bold text-dark mb-2">Thank you for your order, {shippingAddress.fullName || user?.name}!</h1>
            <p className="text-muted small mb-4" style={{ maxWidth: '540px', margin: '0 auto', lineHeight: 1.6 }}>
              Your order <strong className="text-dark">#{orderNumber}</strong> has been received and entered into the RELOOP laboratory queue for final 50-point diagnostic seal inspection prior to dispatch.
            </p>

            {/* Order Quick Metadata Strip */}
            <div className="row g-2 p-3 rounded-3 bg-light border text-start mb-4">
              <div className="col-6 col-md-3">
                <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>ORDER NUMBER</span>
                <strong className="text-dark small tabular-nums">#{orderNumber}</strong>
              </div>
              <div className="col-6 col-md-3">
                <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>PAYMENT METHOD</span>
                <span className="badge bg-success-subtle text-success small">{paymentMethod}</span>
              </div>
              <div className="col-6 col-md-3">
                <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>PAYMENT STATUS</span>
                <strong className="small" style={{ color: (confirmedOrder.paymentDetails?.status === 'Paid' || confirmedOrder.paymentStatus === 'Paid') ? '#087F5B' : '#D97706' }}>
                  {(confirmedOrder.paymentDetails?.status === 'Paid' || confirmedOrder.paymentStatus === 'Paid') ? '✓ Paid (Simulated)' : 'Pending (Doorstep COD)'}
                </strong>
              </div>
              <div className="col-6 col-md-3">
                <span className="text-muted d-block small" style={{ fontSize: '0.75rem' }}>ESTIMATED DELIVERY</span>
                <strong className="text-dark small">3 Business Days</strong>
              </div>
            </div>

            {/* Stepper Tracking Indicator */}
            <div className="p-3 mb-4 rounded bg-white border">
              <h6 className="fw-bold text-dark text-start mb-3 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                Fulfillment & Diagnostic Pipeline
              </h6>
              <div className="d-flex align-items-center justify-content-between position-relative">
                <div className="text-center" style={{ zIndex: 2 }}>
                  <div className="p-2 rounded-circle bg-success text-white mx-auto mb-1" style={{ width: '32px', height: '32px' }}>
                    <Check size={16} />
                  </div>
                  <span className="small fw-bold text-dark d-block" style={{ fontSize: '0.74rem' }}>Order Placed</span>
                  <span className="text-success small" style={{ fontSize: '0.68rem' }}>Confirmed</span>
                </div>
                <div className="flex-grow-1 border-top border-success" style={{ height: '2px', margin: '0 -10px' }} />
                <div className="text-center" style={{ zIndex: 2 }}>
                  <div className="p-2 rounded-circle bg-primary text-white mx-auto mb-1" style={{ width: '32px', height: '32px' }}>
                    <ShieldCheck size={16} />
                  </div>
                  <span className="small fw-bold text-dark d-block" style={{ fontSize: '0.74rem' }}>Lab Inspection</span>
                  <span className="text-primary small" style={{ fontSize: '0.68rem' }}>In Progress</span>
                </div>
                <div className="flex-grow-1 border-top border-secondary-subtle" style={{ height: '2px', margin: '0 -10px' }} />
                <div className="text-center opacity-50" style={{ zIndex: 2 }}>
                  <div className="p-2 rounded-circle bg-light border text-muted mx-auto mb-1" style={{ width: '32px', height: '32px' }}>
                    <Truck size={16} />
                  </div>
                  <span className="small text-muted d-block" style={{ fontSize: '0.74rem' }}>Dispatched</span>
                  <span className="text-muted small" style={{ fontSize: '0.68rem' }}>Pending</span>
                </div>
                <div className="flex-grow-1 border-top border-secondary-subtle" style={{ height: '2px', margin: '0 -10px' }} />
                <div className="text-center opacity-50" style={{ zIndex: 2 }}>
                  <div className="p-2 rounded-circle bg-light border text-muted mx-auto mb-1" style={{ width: '32px', height: '32px' }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="small text-muted d-block" style={{ fontSize: '0.74rem' }}>Delivered</span>
                  <span className="text-muted small" style={{ fontSize: '0.68rem' }}>Pending</span>
                </div>
              </div>
            </div>

            {/* Ordered Items List */}
            <div className="border rounded-3 p-3 bg-light text-start mb-4">
              <h6 className="fw-bold text-dark mb-3 small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                Purchased Certified Devices
              </h6>
              <div className="d-flex flex-column gap-2">
                {(confirmedOrder.orderItems || confirmedOrder.items)?.map((item, idx) => (
                  <div key={idx} className="d-flex justify-content-between align-items-center bg-white p-2 rounded border">
                    <div className="d-flex align-items-center gap-2">
                      <div className="p-1 rounded bg-light border" style={{ width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ProductImage
                          src={item.image || item.product?.primaryImage || item.product?.images?.[0]}
                          alt={item.title || 'Product'}
                          slug={item.product?.slug || item.slug}
                          category={item.product?.category || item.category}
                          productTitle={item.title}
                          style={{ maxHeight: '36px', objectFit: 'contain' }}
                        />
                      </div>
                      <div>
                        <strong className="text-dark small d-block">{item.title}</strong>
                        <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                          Qty: {item.quantity} · {item.conditionGrade || 'Certified Refurbished'} · 12-Month Cover Included
                        </small>
                      </div>
                    </div>
                    <span className="fw-bold text-dark small tabular-nums">
                      ₹{((item.unitPrice || item.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown in Confirmation */}
              <div className="mt-3 pt-2 border-top d-flex justify-content-between align-items-center small">
                <span className="text-muted">Total Paid via {confirmedOrder.paymentDetails?.paymentMethod || paymentMethod}:</span>
                <span className="fw-bold text-success fs-6 tabular-nums">
                  ₹{(confirmedOrder.pricing?.totalPrice || confirmedOrder.pricing?.grandTotal || confirmedOrder.totalAmount || grandTotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-3">
              <button
                type="button"
                className="btn btn-reloop-outline px-4 py-2 small fw-semibold d-inline-flex align-items-center gap-2"
                onClick={() => window.print()}
              >
                <Printer size={16} /> Print / Save Invoice
              </button>
              <Link
                to={`/account?orderPlaced=${orderNumber}`}
                className="btn btn-reloop-primary px-4 py-2 small fw-bold d-inline-flex align-items-center gap-2"
              >
                View in Account Orders <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="btn btn-link text-muted small text-decoration-none">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Empty Cart Screen
  if (cartItems.length === 0) {
    return (
      <div className="container-xl py-5 text-center">
        <div className="reloop-empty-state max-w-md mx-auto my-5 p-5 bg-white shadow-xs">
          <ShoppingBag size={48} className="text-muted mb-3 mx-auto" />
          <h4 className="text-dark mb-2">No items to checkout</h4>
          <p className="text-muted mb-4">Please add products to your cart before proceeding to checkout.</p>
          <Link to="/products" className="btn btn-reloop-primary">
            Browse Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="container-xl">
        {/* Header & Stepper Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-2 border-bottom">
          <div>
            <h1 className="h3 fw-bold text-dark mb-1">Secure Checkout</h1>
            <p className="text-muted small mb-0">Review your delivery details, payment method, and complete your order.</p>
          </div>
          <div className="d-flex align-items-center gap-2 text-success small fw-semibold mt-2 mt-md-0">
            <Lock size={15} /> 100% SECURE CHECKOUT · 256-BIT ENCRYPTION
          </div>
        </div>

        {/* Stepper Indicator */}
        <div className="row g-2 mb-4 text-center">
          <div className="col-4">
            <div className={`p-2 border rounded small fw-bold ${isAuthenticated ? 'bg-success text-white' : 'bg-primary text-white'}`}>
              1. {isAuthenticated ? '✓ Customer Verified' : 'Sign in / Account'}
            </div>
          </div>
          <div className="col-4">
            <div className={`p-2 border rounded small fw-bold ${isAuthenticated ? 'bg-success text-white' : 'bg-light text-muted'}`}>
              2. Delivery Address
            </div>
          </div>
          <div className="col-4">
            <div className={`p-2 border rounded small fw-bold ${isAuthenticated ? 'bg-success text-white' : 'bg-light text-muted'}`}>
              3. Review & Payment
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="alert alert-danger d-flex align-items-center justify-content-between gap-2 mb-4 shadow-xs">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={18} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {!isAuthenticated && (
              <Link to="/login?redirect=/checkout" className="btn btn-sm btn-outline-danger text-nowrap ms-3">
                Sign In Now
              </Link>
            )}
          </div>
        )}

        <div className="row g-4">
          {/* Left Column: Form Steps */}
          <div className="col-12 col-lg-8">
            {!isAuthenticated ? (
              /* Unauthenticated View: Clear Sign-In & Demo Quick-Login */
              <div className="reloop-card p-4 p-md-5 bg-white shadow-xs mb-4">
                <div className="text-center max-w-lg mx-auto">
                  <div className="rounded-circle bg-success-subtle text-success p-3 d-inline-flex mb-3">
                    <UserCheck size={36} />
                  </div>
                  <h4 className="fw-bold text-dark mb-2">Sign in to complete your purchase</h4>
                  <p className="text-muted small mb-4" style={{ lineHeight: 1.6 }}>
                    Every RELOOP certified device comes with a permanent digital product passport, 50-point diagnostic seal, and 12-month warranty linked directly to your customer account.
                  </p>

                  <div className="d-flex flex-column flex-sm-row justify-content-center gap-3 mb-4">
                    <Link
                      to="/login?redirect=/checkout"
                      className="btn btn-reloop-primary px-4 py-2 d-flex align-items-center justify-content-center gap-2"
                    >
                      <LogIn size={18} /> Sign In to Proceed
                    </Link>
                    <Link
                      to="/register?redirect=/checkout"
                      className="btn btn-reloop-outline px-4 py-2 d-flex align-items-center justify-content-center gap-2"
                    >
                      <UserPlus size={18} /> Create New Account
                    </Link>
                  </div>

                  {/* Sandbox Evaluation Quick Access */}
                  <div className="p-3 rounded bg-light border text-start">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-bold text-dark d-flex align-items-center gap-1">
                        <Zap size={14} className="text-success" /> Assessment / Evaluation Quick-Fill:
                      </span>
                      <span className="badge bg-success-subtle text-success" style={{ fontSize: '0.68rem' }}>
                        ONE-CLICK ACCESS
                      </span>
                    </div>
                    <p className="text-muted small mb-3" style={{ fontSize: '0.82rem' }}>
                      Click below to immediately log in as the verified demo customer (<code>customer@reloop.com</code>) and unlock checkout without navigating away:
                    </p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success w-100 fw-bold py-2"
                      onClick={handleQuickCustomerLogin}
                      disabled={quickLoginLoading}
                    >
                      {quickLoginLoading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Signing in demo customer...
                        </span>
                      ) : (
                        '⚡ Continue as Verified Demo Customer'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Authenticated View: Delivery & Payment Form */
              <form onSubmit={handlePlaceOrderClick}>
                {/* Verified Customer Status Bar */}
                <div className="p-3 mb-4 rounded bg-success-subtle text-success-emphasis border border-success-subtle d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                  <div className="d-flex align-items-center gap-2 small">
                    <CheckCircle2 size={18} className="text-success flex-shrink-0" />
                    <span>
                      Signed in as <strong>{user.name}</strong> ({user.email}) · Customer Account Active
                    </span>
                  </div>
                  <Link to="/login?redirect=/checkout" className="small text-decoration-none text-success fw-semibold">
                    Switch Account
                  </Link>
                </div>

                {/* Step 1: Delivery Address */}
                <div className="reloop-card p-4 mb-4 bg-white shadow-xs">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <Truck size={20} className="text-success" /> 1. Delivery address
                    </h5>
                    <button
                      type="button"
                      className="btn btn-link text-success p-0 small fw-bold text-decoration-none"
                      onClick={() => setIsEditingAddress(!isEditingAddress)}
                    >
                      {isEditingAddress ? 'Done Editing' : 'Edit / Change Address'}
                    </button>
                  </div>

                  {!isEditingAddress ? (
                    <div className="border rounded p-3 bg-light d-flex justify-content-between align-items-start">
                      <div>
                        <span className="badge bg-success-subtle text-success mb-1">Shipping Destination</span>
                        <h6 className="fw-bold text-dark mb-1">{shippingAddress.fullName || user.name}</h6>
                        <p className="text-muted small mb-1">
                          {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.postalCode}
                        </p>
                        <small className="text-muted">Contact: {shippingAddress.phone || user.phone || 'Phone on file'}</small>
                      </div>
                    </div>
                  ) : (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Recipient Full Name *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={shippingAddress.fullName}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Phone Number *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={shippingAddress.phone}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-semibold">Street Address *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">City *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">State *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={shippingAddress.state}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Postal Code *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 2: Payment Method */}
                <div className="reloop-card p-4 mb-4 bg-white shadow-xs">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <CreditCard size={20} className="text-success" /> 2. Payment Method (Simulated Sandbox)
                    </h5>
                    <span className="badge bg-warning-subtle text-warning border border-warning-subtle small">
                      Zero Real Money Charged
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-2 mb-4">
                    {/* Option 1: Simulated Card */}
                    <label
                      className={`border rounded p-3 d-flex align-items-start gap-3 cursor-pointer ${
                        paymentMethod === 'Simulated Card' ? 'bg-light border-success' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Simulated Card"
                        className="form-check-input mt-1"
                        checked={paymentMethod === 'Simulated Card'}
                        onChange={() => setPaymentMethod('Simulated Card')}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark d-flex align-items-center justify-content-between">
                          <span>Debit / Credit Card (Simulated 3D-Secure Sandbox)</span>
                          <span className="badge bg-success-subtle text-success small">DEMO GATEWAY</span>
                        </div>
                        <small className="text-muted">
                          Simulated card authorization with live card brand recognition and interactive demo OTP authentication.
                        </small>
                      </div>
                    </label>

                    {/* Option 2: Simulated UPI */}
                    <label
                      className={`border rounded p-3 d-flex align-items-start gap-3 cursor-pointer ${
                        paymentMethod === 'UPI Simulator' ? 'bg-light border-success' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="UPI Simulator"
                        className="form-check-input mt-1"
                        checked={paymentMethod === 'UPI Simulator'}
                        onChange={() => setPaymentMethod('UPI Simulator')}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark d-flex align-items-center justify-content-between">
                          <span>UPI Simulator (GPay / PhonePe / Paytm / Dynamic QR)</span>
                          <span className="badge bg-success-subtle text-success small">DEMO SANDBOX</span>
                        </div>
                        <small className="text-muted">
                          Simulated UPI payment verification via instant VPA verification or live animated demo QR scan.
                        </small>
                      </div>
                    </label>

                    {/* Option 3: Cash on Delivery */}
                    <label
                      className={`border rounded p-3 d-flex align-items-start gap-3 cursor-pointer ${
                        paymentMethod === 'Cash on Delivery' ? 'bg-light border-success' : ''
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Cash on Delivery"
                        className="form-check-input mt-1"
                        checked={paymentMethod === 'Cash on Delivery'}
                        onChange={() => setPaymentMethod('Cash on Delivery')}
                      />
                      <div className="flex-grow-1">
                        <div className="fw-bold text-dark d-flex align-items-center justify-content-between">
                          <span>Cash on Delivery (COD)</span>
                          <span className="badge bg-secondary-subtle text-secondary small">PAY AT DOORSTEP</span>
                        </div>
                        <small className="text-muted">
                          Pay cash or card upon doorstep receipt and package seal verification. Payment status recorded as Pending.
                        </small>
                      </div>
                    </label>
                  </div>

                  {/* =======================================================
                      SIMULATED CARD INTERACTION CONTAINER
                      ======================================================= */}
                  {paymentMethod === 'Simulated Card' && (
                    <div className="p-3 p-md-4 rounded border bg-light mb-4">
                      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-3 gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <CreditCard size={18} className="text-success" />
                          <span className="fw-bold small text-dark">Simulated Card Sandbox</span>
                          <span className="badge bg-dark text-white" style={{ fontSize: '0.68rem' }}>
                            {cardBrand.badge}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-link text-success p-0 small text-decoration-none fw-bold"
                          onClick={() => {
                            setTestCard({
                              number: '4242 4242 4242 4242',
                              expiry: '12/28',
                              cvv: '123',
                              nameOnCard: user?.name || 'Authorized Customer',
                            });
                            setCardSimulatedSuccess(true);
                          }}
                        >
                          ⚡ Autofill Demo Card
                        </button>
                      </div>

                      <div className="row g-4 align-items-center">
                        {/* Interactive Card Mockup Preview */}
                        <div className="col-12 col-md-5">
                          <div className="reloop-card-mockup">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <div className="emv-chip" />
                              <span className="fw-bold small text-white-50" style={{ letterSpacing: '0.08em' }}>
                                {cardBrand.badge}
                              </span>
                            </div>

                            <div className="card-number-embossed mb-3 tabular-nums text-white">
                              {testCard.number || '•••• •••• •••• ••••'}
                            </div>

                            <div className="d-flex justify-content-between align-items-end text-white">
                              <div>
                                <small className="text-white-50 d-block" style={{ fontSize: '0.65rem' }}>CARDHOLDER</small>
                                <span className="small fw-semibold text-uppercase">
                                  {testCard.nameOnCard || 'DEMO USER'}
                                </span>
                              </div>
                              <div className="text-end">
                                <small className="text-white-50 d-block" style={{ fontSize: '0.65rem' }}>EXPIRES</small>
                                <span className="small fw-semibold tabular-nums">
                                  {testCard.expiry || 'MM/YY'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Input Fields */}
                        <div className="col-12 col-md-7">
                          <div className="row g-2">
                            <div className="col-12">
                              <label className="form-label small text-muted mb-1">Simulated Card Number</label>
                              <div className="input-group input-group-sm">
                                <input
                                  type="text"
                                  className="form-control font-monospace"
                                  placeholder="4242 4242 4242 4242"
                                  value={testCard.number}
                                  onChange={(e) =>
                                    setTestCard({ ...testCard, number: formatCardNumber(e.target.value) })
                                  }
                                  maxLength={19}
                                />
                                <span className="input-group-text bg-white small text-success fw-bold">
                                  {cardBrand.badge}
                                </span>
                              </div>
                            </div>

                            <div className="col-6">
                              <label className="form-label small text-muted mb-1">Valid Thru (MM/YY)</label>
                              <input
                                type="text"
                                className="form-control form-control-sm font-monospace"
                                placeholder="12/28"
                                value={testCard.expiry}
                                onChange={(e) =>
                                  setTestCard({ ...testCard, expiry: formatExpiry(e.target.value) })
                                }
                                maxLength={5}
                              />
                            </div>

                            <div className="col-6">
                              <label className="form-label small text-muted mb-1">CVV / CVC</label>
                              <input
                                type="password"
                                className="form-control form-control-sm font-monospace"
                                placeholder="123"
                                value={testCard.cvv}
                                onChange={(e) =>
                                  setTestCard({ ...testCard, cvv: formatCvv(e.target.value) })
                                }
                                maxLength={4}
                              />
                            </div>

                            <div className="col-12">
                              <label className="form-label small text-muted mb-1">Cardholder Full Name</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Name on card"
                                value={testCard.nameOnCard}
                                onChange={(e) => setTestCard({ ...testCard, nameOnCard: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top">
                        <span className="small text-muted d-flex align-items-center gap-1">
                          <CheckCircle2 size={15} className="text-success" />
                          <span>3D Secure Sandbox Ready</span>
                        </span>
                        <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
                          Will prompt for demo OTP upon clicking Place Order
                        </span>
                      </div>
                    </div>
                  )}

                  {/* =======================================================
                      SIMULATED UPI INTERACTION CONTAINER
                      ======================================================= */}
                  {paymentMethod === 'UPI Simulator' && (
                    <div className="p-3 p-md-4 rounded border bg-light mb-4">
                      {/* UPI Mode Selector */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className={`btn btn-sm ${upiMode === 'vpa' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setUpiMode('vpa')}
                          >
                            <Smartphone size={14} className="me-1" /> Pay via UPI ID
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${upiMode === 'qr' ? 'btn-dark' : 'btn-outline-secondary'}`}
                            onClick={() => setUpiMode('qr')}
                          >
                            <QrCode size={14} className="me-1" /> Scan Dynamic QR
                          </button>
                        </div>
                        <span className="badge bg-success-subtle text-success small">Zero Real Charges</span>
                      </div>

                      {/* App Selector Pills */}
                      <div className="mb-3">
                        <label className="form-label small text-muted mb-1">Select Preferred UPI App:</label>
                        <div className="upi-app-selector-grid">
                          {[
                            { id: 'gpay', name: 'Google Pay' },
                            { id: 'phonepe', name: 'PhonePe' },
                            { id: 'paytm', name: 'Paytm' },
                            { id: 'bhim', name: 'BHIM' },
                            { id: 'cred', name: 'CRED' },
                          ].map((app) => (
                            <div
                              key={app.id}
                              className={`upi-app-pill ${selectedUpiApp === app.id ? 'active' : ''}`}
                              onClick={() => setSelectedUpiApp(app.id)}
                            >
                              {app.name}
                            </div>
                          ))}
                        </div>
                      </div>

                      {upiMode === 'vpa' ? (
                        /* VPA ID Mode */
                        <div>
                          <label className="form-label small text-muted mb-1">Virtual Payment Address (UPI ID)</label>
                          <div className="input-group input-group-sm mb-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="evaluator@oksbi"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-success"
                              onClick={() => setUpiSimulatedSuccess(true)}
                            >
                              Verify VPA
                            </button>
                          </div>

                          {/* Quick Autofill Pills */}
                          <div className="d-flex flex-wrap gap-1 align-items-center mb-3">
                            <span className="text-muted small" style={{ fontSize: '0.72rem' }}>Quick Demo VPAs:</span>
                            {['evaluator@oksbi', 'customer@ybl', 'reloop@icici'].map((vpa) => (
                              <button
                                key={vpa}
                                type="button"
                                className="badge bg-white border text-dark fw-normal cursor-pointer"
                                onClick={() => {
                                  setUpiId(vpa);
                                  setUpiSimulatedSuccess(true);
                                }}
                              >
                                {vpa}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Dynamic QR Mode */
                        <div className="text-center py-2">
                          <div className="upi-qr-box mb-2">
                            {/* Simulated SVG QR Representation */}
                            <svg viewBox="0 0 100 100" width="140" height="140" fill="#0B1220">
                              <rect x="0" y="0" width="30" height="30" fill="#0B1220" />
                              <rect x="5" y="5" width="20" height="20" fill="#FFFFFF" />
                              <rect x="10" y="10" width="10" height="10" fill="#0B1220" />

                              <rect x="70" y="0" width="30" height="30" fill="#0B1220" />
                              <rect x="75" y="5" width="20" height="20" fill="#FFFFFF" />
                              <rect x="80" y="10" width="10" height="10" fill="#0B1220" />

                              <rect x="0" y="70" width="30" height="30" fill="#0B1220" />
                              <rect x="5" y="75" width="20" height="20" fill="#FFFFFF" />
                              <rect x="10" y="80" width="10" height="10" fill="#0B1220" />

                              <rect x="40" y="10" width="10" height="20" fill="#0B1220" />
                              <rect x="10" y="40" width="20" height="10" fill="#0B1220" />
                              <rect x="40" y="40" width="20" height="20" fill="#087F5B" />
                              <rect x="70" y="40" width="10" height="15" fill="#0B1220" />
                              <rect x="40" y="70" width="20" height="10" fill="#0B1220" />
                              <rect x="70" y="70" width="20" height="20" fill="#0B1220" />
                            </svg>
                            <div className="upi-qr-scanner-line" />
                          </div>

                          <div className="small fw-semibold text-dark mb-1">
                            Scan with Any UPI App to Pay ₹{grandTotal.toLocaleString('en-IN')}
                          </div>
                          <div className="text-muted small mb-3" style={{ fontSize: '0.74rem' }}>
                            <Clock size={12} className="me-1" /> QR expires in {Math.floor(qrCountdown / 60)}:
                            {(qrCountdown % 60).toString().padStart(2, '0')} (Demo Sandbox)
                          </div>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success fw-bold py-1 px-3"
                            onClick={() => executeOrderPlacement()}
                          >
                            ⚡ Simulate Instant Approval from Mobile App
                          </button>
                        </div>
                      )}

                      <div className="text-muted small mt-2 pt-2 border-top" style={{ fontSize: '0.76rem' }}>
                        Simulated UPI sandbox for evaluation. No actual bank transfers or real UPI PIN required.
                      </div>
                    </div>
                  )}

                  {/* Cash on Delivery Notice */}
                  {paymentMethod === 'Cash on Delivery' && (
                    <div className="p-3 rounded border bg-light mb-4">
                      <div className="small text-muted">
                        <strong className="text-dark">Doorstep Delivery Terms:</strong> Please keep exact cash or debit card ready for the courier agent upon arrival. An official invoice and Digital Product Passport warranty registration will be confirmed in your account.
                      </div>
                    </div>
                  )}

                  <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                    <strong>Demonstration Disclosure:</strong> RELOOP is an educational full-stack e-commerce application. Card and UPI interactions are simulated; no real monetary transactions take place, and no payment credentials are saved.
                  </div>
                </div>

                {/* Step 3: Review & Place Order */}
                <div className="reloop-card p-4 bg-white shadow-xs">
                  <h5 className="fw-bold text-dark mb-3">3. Review and place order</h5>

                  <div className="form-check mb-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="termsCheck"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                    />
                    <label className="form-check-label small text-muted" htmlFor="termsCheck">
                      I agree to the 7-day return terms, 50-point diagnostic inspection verification, and refurbished warranty guidelines.
                    </label>
                  </div>

                  <button
                    type="submit"
                    id="reloop-complete-order-btn"
                    className="btn btn-reloop-primary btn-lg w-100 py-3 fw-bold"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" />
                        Authorizing Order...
                      </span>
                    ) : (
                      <span>Complete Order (₹{grandTotal.toLocaleString('en-IN')}) →</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column: Order Summary with Measured Sticky Offset */}
          <div className="col-12 col-lg-4">
            <div className="reloop-card p-4 bg-white shadow-sm checkout-sticky-summary">
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">Items in order ({cartItems.length})</h5>

              <div className="d-flex flex-column gap-3 mb-3 max-h-60 overflow-auto" style={{ maxHeight: '280px' }}>
                {cartItems.map((item) => (
                  <div key={item.product._id} className="d-flex align-items-center gap-2 border-bottom pb-2">
                    <div style={{ width: '48px', height: '48px' }} className="border rounded p-1 bg-light flex-shrink-0 d-flex align-items-center justify-content-center">
                      <ProductImage
                        src={item.product.primaryImage || item.product.images?.[0]}
                        alt={item.product.title}
                        slug={item.product.slug}
                        category={item.product.category}
                        productTitle={item.product.title}
                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                      />
                    </div>
                    <div className="flex-grow-1 overflow-hidden">
                      <span className="d-block small fw-bold text-dark text-truncate">{item.product.title}</span>
                      <small className="text-muted">
                        Qty: {item.quantity} · {item.product.conditionGrade}
                      </small>
                    </div>
                    <span className="small fw-bold text-dark tabular-nums">
                      ₹{(item.product.refurbishedPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              <ul className="list-unstyled mb-3 small">
                <li className="d-flex justify-content-between py-1 text-muted">
                  <span>Subtotal:</span>
                  <span className="fw-semibold text-dark tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </li>
                <li className="d-flex justify-content-between py-1 text-muted">
                  <span>Delivery:</span>
                  <span className="fw-semibold text-success">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </li>
                <li className="d-flex justify-content-between pt-2 border-top text-dark fs-5">
                  <span className="fw-bold">Total Payable:</span>
                  <span className="fw-extrabold text-success tabular-nums">₹{grandTotal.toLocaleString('en-IN')}</span>
                </li>
              </ul>

              <div className="p-2 rounded bg-success-subtle text-success small text-center fw-semibold">
                ✓ 7-day easy returns & 50-point diagnostic seal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================
          SIMULATED 3D-SECURE / OTP VERIFICATION MODAL
          ====================================================================== */}
      {showOtpModal && (
        <div className="simulated-otp-modal-backdrop">
          <div className="simulated-otp-modal p-4">
            <div className="d-flex justify-content-between align-items-center pb-2 mb-3 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <KeyRound size={20} className="text-success" />
                <h6 className="fw-bold mb-0 text-dark">Demo 3D-Secure Authentication</h6>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowOtpModal(false)}
                aria-label="Cancel"
              />
            </div>

            <div className="p-3 mb-3 rounded bg-light border">
              <div className="d-flex justify-content-between text-muted small mb-1">
                <span>Merchant:</span>
                <strong className="text-dark">RELOOP Refurbished Tech</strong>
              </div>
              <div className="d-flex justify-content-between text-muted small mb-1">
                <span>Card Number:</span>
                <span className="font-monospace text-dark">
                  •••• •••• •••• {testCard.number.replace(/\s/g, '').slice(-4) || '4242'}
                </span>
              </div>
              <div className="d-flex justify-content-between text-muted small">
                <span>Amount:</span>
                <strong className="text-success tabular-nums">₹{grandTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-bold text-dark mb-0">Enter One-Time Password (OTP)</label>
                  <button
                    type="button"
                    className="btn btn-link text-success p-0 small fw-bold text-decoration-none"
                    onClick={() => {
                      setOtpCode('123456');
                      setOtpError('');
                    }}
                  >
                    ⚡ Autofill Demo OTP (123456)
                  </button>
                </div>

                <input
                  type="text"
                  className="form-control form-control-lg text-center font-monospace fs-4 fw-bold letter-spacing-lg"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    if (otpError) setOtpError('');
                  }}
                  maxLength={6}
                  autoFocus
                />
                {otpError && <div className="text-danger small mt-1">{otpError}</div>}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4 text-muted small" style={{ fontSize: '0.78rem' }}>
                <span>
                  <Clock size={13} className="me-1" /> Expires in {otpTimer}s
                </span>
                <button
                  type="button"
                  className="btn btn-link text-muted p-0 small text-decoration-none"
                  onClick={() => setOtpTimer(119)}
                >
                  Resend Demo OTP
                </button>
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-50 py-2 small fw-semibold"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-reloop-primary w-50 py-2 fw-bold"
                  disabled={otpVerifying}
                >
                  {otpVerifying ? 'Verifying...' : 'Authorize Payment'}
                </button>
              </div>
            </form>

            <div className="text-center text-muted small mt-3 pt-2 border-top" style={{ fontSize: '0.72rem' }}>
              RELOOP Sandbox Banking Simulator · No actual funds or SMS messages
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================
          MULTI-STAGE PAYMENT PROGRESS OVERLAY
          ====================================================================== */}
      {paymentStage !== 'idle' && !confirmedOrder && (
        <div className="simulated-otp-modal-backdrop">
          <div className="simulated-otp-modal p-4 text-center" style={{ maxWidth: '400px' }}>
            <div className="spinner-border text-success mb-3" style={{ width: '48px', height: '48px' }} role="status" />
            <h5 className="fw-bold text-dark mb-1">Authorizing Payment Simulation</h5>
            <p className="text-muted small mb-4">Please do not refresh or close this browser window.</p>

            <div className="progress mb-3" style={{ height: '6px' }}>
              <div
                className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${progressPercent}%`, transition: 'width 0.4s ease' }}
              />
            </div>

            <div className="d-flex flex-column gap-2 text-start">
              <div
                className={`payment-stepper-stage ${
                  paymentStage === 'initiating' ? 'active' : 'completed'
                }`}
              >
                <CheckCircle2 size={16} /> 1. Initializing secure sandbox session...
              </div>
              <div
                className={`payment-stepper-stage ${
                  paymentStage === 'validating'
                    ? 'active'
                    : progressPercent > 55
                    ? 'completed'
                    : ''
                }`}
              >
                <CheckCircle2 size={16} /> 2. Validating demo authorization tokens...
              </div>
              <div
                className={`payment-stepper-stage ${
                  paymentStage === 'authorizing'
                    ? 'active'
                    : progressPercent > 85
                    ? 'completed'
                    : ''
                }`}
              >
                <CheckCircle2 size={16} /> 3. Authorizing sandbox settlement...
              </div>
              <div className={`payment-stepper-stage ${progressPercent === 100 ? 'active' : ''}`}>
                <CheckCircle2 size={16} /> 4. Generating Digital Product Passport...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
