import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  ArrowRightLeft,
  ChevronLeft,
} from 'lucide-react';
import ConditionBadge from '../components/common/ConditionBadge';
import ProductImage from '../components/common/ProductImage';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    totalItemsCount,
    subtotal,
    totalSavings,
    deliveryFee,
    grandTotal,
    discountAmount,
    promoCode,
    updateQuantity,
    removeFromCart,
    applyPromo,
  } = useCart();

  const [inputPromo, setInputPromo] = useState('');
  const [promoMessage, setPromoMessage] = useState(null);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!inputPromo.trim()) return;
    const res = applyPromo(inputPromo);
    setPromoMessage(res);
  };

  if (cartItems.length === 0) {
    return (
      <div className="container-xl py-5">
        <div className="reloop-empty-state max-w-md mx-auto my-5 p-5 bg-white shadow-xs">
          <div className="rounded-circle bg-light text-muted d-inline-flex p-4 mb-3">
            <ShoppingBag size={48} className="text-secondary" />
          </div>
          <h4 className="fw-bold text-dark mb-2">Your shopping cart is empty</h4>
          <p className="text-muted small mb-4">
            Explore our curated catalog of certified renewed laptops, smartphones, tablets, and components.
          </p>
          <Link to="/products" className="btn btn-reloop-primary px-4 py-2">
            Explore Renewed Tech <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="container-xl">
        {/* Header Row */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div>
            <h1 className="h3 fw-bold text-dark mb-1">
              Your shopping cart ({totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'})
            </h1>
            <p className="text-muted small mb-0">
              Your selected devices, transparent condition grades and warranty details.
            </p>
          </div>
          <Link to="/products" className="btn btn-link text-muted small text-decoration-none d-flex align-items-center gap-1">
            <ChevronLeft size={16} /> Continue shopping
          </Link>
        </div>

        <div className="row g-4">
          {/* Left Column: Cart Items List */}
          <div className="col-12 col-lg-8">
            <div className="d-flex flex-column gap-3 mb-4">
              {cartItems.map((item) => {
                const prod = item.product;
                const unitPrice = prod.refurbishedPrice;
                const original = prod.originalRetailPrice || unitPrice;
                const savingsPercent = original > unitPrice ? Math.round(((original - unitPrice) / original) * 100) : 0;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div key={prod._id} className="reloop-card p-3 bg-white shadow-xs">
                    <div className="row align-items-center g-3">
                      {/* Product Thumbnail */}
                      <div className="col-auto">
                        <Link to={`/products/${prod.slug || prod._id}`}>
                          <div
                            className="border rounded p-1 bg-light d-flex align-items-center justify-content-center"
                            style={{ width: '80px', height: '80px' }}
                          >
                            <ProductImage
                              src={prod.primaryImage || (prod.images && prod.images[0])}
                              alt={prod.title}
                              slug={prod.slug}
                              category={prod.category}
                              productTitle={prod.title}
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                            />
                          </div>
                        </Link>
                      </div>

                      {/* Product Info */}
                      <div className="col">
                        <Link to={`/products/${prod.slug || prod._id}`} className="text-decoration-none">
                          <h6 className="fw-bold text-dark mb-1 line-clamp-1">{prod.title}</h6>
                        </Link>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                          <ConditionBadge grade={prod.conditionGrade} />
                          <span className="text-muted small">·</span>
                          <span className="text-muted small">{prod.warrantyMonths || 6}-month warranty</span>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="d-flex align-items-center gap-3">
                          <div className="input-group input-group-sm" style={{ width: '105px' }}>
                            <button
                              type="button"
                              className="btn btn-outline-secondary px-2"
                              onClick={() => updateQuantity(prod._id, item.quantity - 1)}
                              title="Decrease quantity"
                            >
                              <Minus size={13} />
                            </button>
                            <input
                              type="text"
                              className="form-control text-center bg-white px-1"
                              value={item.quantity}
                              readOnly
                            />
                            <button
                              type="button"
                              className="btn btn-outline-secondary px-2"
                              onClick={() => updateQuantity(prod._id, item.quantity + 1)}
                              disabled={item.quantity >= (prod.stockCount || 10)}
                              title="Increase quantity"
                            >
                              <Plus size={13} />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="btn btn-link text-danger p-0 small text-decoration-none d-flex align-items-center gap-1"
                            onClick={() => removeFromCart(prod._id)}
                            title="Remove item"
                          >
                            <Trash2 size={15} /> Remove
                          </button>
                        </div>
                      </div>

                      {/* Price & Savings */}
                      <div className="col-auto text-end">
                        <div className="fw-bold text-dark fs-5 tabular-nums">
                          ₹{itemTotal.toLocaleString('en-IN')}
                        </div>
                        {original > unitPrice && (
                          <div className="small text-muted text-decoration-line-through tabular-nums">
                            ₹{(original * item.quantity).toLocaleString('en-IN')}
                          </div>
                        )}
                        {savingsPercent > 0 && (
                          <span className="reloop-badge-discount small d-inline-block mt-1">
                            Save {savingsPercent}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Free Qualification Notice */}
            <div className="p-3 bg-success-subtle text-success-emphasis rounded border border-success-subtle d-flex align-items-center gap-2 small mb-4">
              <ShieldCheck size={18} className="text-success flex-shrink-0" />
              <div className="w-100">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <strong>Free Express Shipping:</strong>
                  <span className="badge bg-success text-white">Unlocked</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.82rem' }}>
                  Your cart qualifies for priority insured delivery across India with 50-point diagnostic seal.
                </div>
              </div>
            </div>

            {/* Trade-In Banner */}
            <div className="reloop-card p-4 bg-white border-warning-subtle shadow-xs">
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
                <div>
                  <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                    <ArrowRightLeft size={18} className="text-warning" /> Want to save even more?
                  </h6>
                  <p className="text-muted small mb-0">
                    Trade in an eligible old device and use your certified voucher toward this order.
                  </p>
                </div>
                <Link to="/trade-in" className="btn btn-reloop-outline btn-sm text-nowrap">
                  Estimate Trade-In Value →
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="col-12 col-lg-4">
            <div className="reloop-card p-4 bg-white shadow-sm sticky-top" style={{ top: '85px' }}>
              <h5 className="fw-bold text-dark mb-3 pb-2 border-bottom">Order summary</h5>

              <ul className="list-unstyled mb-3 small">
                <li className="d-flex justify-content-between py-2 text-muted">
                  <span>Subtotal ({totalItemsCount} items):</span>
                  <span className="fw-semibold text-dark tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </li>

                {totalSavings > 0 && (
                  <li className="d-flex justify-content-between py-2 text-success">
                    <span>Product savings:</span>
                    <span className="fw-semibold tabular-nums">-₹{totalSavings.toLocaleString('en-IN')}</span>
                  </li>
                )}

                {discountAmount > 0 && (
                  <li className="d-flex justify-content-between py-2 text-success">
                    <span>Promo discount ({promoCode}):</span>
                    <span className="fw-semibold tabular-nums">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </li>
                )}

                <li className="d-flex justify-content-between py-2 text-muted">
                  <span>Delivery:</span>
                  <span className="fw-semibold text-success">
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </li>

                <li className="d-flex justify-content-between py-2 text-muted border-bottom">
                  <span>Applicable GST:</span>
                  <span className="text-muted">Included in price</span>
                </li>

                <li className="d-flex justify-content-between pt-3 text-dark fs-5">
                  <span className="fw-bold">Total:</span>
                  <span className="fw-extrabold text-success tabular-nums">₹{grandTotal.toLocaleString('en-IN')}</span>
                </li>
              </ul>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyCoupon} className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="fw-semibold small text-muted mb-0 d-flex align-items-center gap-1">
                    <Tag size={13} /> Promo code
                  </label>
                  <button
                    type="button"
                    className="btn btn-link p-0 text-decoration-none small text-success fw-semibold"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => {
                      setInputPromo('RELOOP10');
                      applyPromo('RELOOP10');
                    }}
                  >
                    ⚡ Auto-apply RELOOP10
                  </button>
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control form-control-sm text-uppercase"
                    placeholder="Enter coupon code"
                    value={inputPromo}
                    onChange={(e) => setInputPromo(e.target.value)}
                  />
                  <button type="submit" className="btn btn-reloop-outline btn-sm">
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <small className={`d-block mt-1 ${promoMessage.success ? 'text-success' : 'text-danger'}`}>
                    {promoMessage.message}
                  </small>
                )}
              </form>

              {/* Checkout CTA */}
              <button
                type="button"
                className="btn btn-reloop-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2 mb-3"
                onClick={() => navigate('/checkout')}
              >
                Proceed to checkout <ArrowRight size={18} />
              </button>

              <div className="text-center text-muted small" style={{ fontSize: '0.75rem' }}>
                <span className="d-block mb-1">🔒 Secure checkout · Zero payment card data stored</span>
                <span className="d-block text-success fw-semibold">✓ 6–12 month warranty included with all items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
