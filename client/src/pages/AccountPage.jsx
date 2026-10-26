import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRightLeft,
  Heart,
  MapPin,
  ShieldCheck,
  LogOut,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  Check,
  Download,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import ConditionBadge from '../components/common/ConditionBadge';
import ProductImage from '../components/common/ProductImage';
import DigitalPassportModal from '../components/passport/DigitalPassportModal';
import api from '../services/api';
import { subscribeToSync } from '../services/syncChannel';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [tradeIns, setTradeIns] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [selectedProductForPassport, setSelectedProductForPassport] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const orderPlacedId = queryParams.get('orderPlaced');
  const tabParam = queryParams.get('tab');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam === 'saved' ? 'saved' : tabParam);
    }
  }, [tabParam]);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      const [ordersRes, tradeInsRes] = await Promise.all([
        api.get('/orders/my-orders'),
        api.get('/trade-in/my-requests'),
      ]);

      if (ordersRes.data?.success) {
        setOrders(ordersRes.data.orders);
      }
      if (tradeInsRes.data?.success) {
        setTradeIns(tradeInsRes.data.requests);
      }
    } catch (err) {
      console.error('Error fetching account data:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setAuthError('Customer session expired or unauthorized. Please sign in to view your orders.');
      } else {
        setAuthError(err.response?.data?.message || 'Could not load your records. Please check connectivity.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to cross-tab synchronization events
    const unsubscribe = subscribeToSync((event) => {
      if (event.entity === 'orders' || event.entity === 'trade-in') {
        fetchData();
      }
    });

    // Revalidate on tab focus / visibility
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user]);

  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'all') return true;
    if (orderFilter === 'processing') return order.orderStatus === 'Order Placed' || order.orderStatus === 'Inspected & Packed';
    if (orderFilter === 'shipped') return order.orderStatus === 'Dispatched' || order.orderStatus === 'Out for Delivery';
    if (orderFilter === 'delivered') return order.orderStatus === 'Delivered';
    if (orderFilter === 'cancelled') return order.orderStatus === 'Cancelled';
    return true;
  });

  if (!user) {
    return (
      <div className="py-5" style={{ minHeight: '60vh', backgroundColor: 'var(--reloop-bg)' }}>
        <div className="container-xl">
          <div className="reloop-card p-5 max-w-md mx-auto text-center bg-white shadow-xs" style={{ maxWidth: '480px', margin: '3rem auto' }}>
            <div className="p-3 rounded-circle bg-light d-inline-flex mb-3 text-success">
              <ShieldCheck size={36} />
            </div>
            <h4 className="fw-bold text-dark mb-2">Customer Sign-In Required</h4>
            <p className="text-muted small mb-4">
              Please sign in to view your verified orders, live fulfillment tracking, and trade-in inspection vouchers.
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Link to="/login?redirect=/account" className="btn btn-reloop-primary px-4">
                Sign In to Account
              </Link>
              <Link to="/products" className="btn btn-reloop-outline px-3">
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="container-xl">
        {/* Authentication Notice if Session Clobbered */}
        {authError && (
          <div className="alert alert-warning d-flex align-items-center justify-content-between mb-4 shadow-sm">
            <div className="d-flex align-items-center gap-2">
              <AlertCircle size={20} className="text-warning-emphasis" />
              <span className="small fw-semibold">{authError}</span>
            </div>
            <Link to="/login?redirect=/account" className="btn btn-sm btn-dark px-3 py-1">
              Sign In
            </Link>
          </div>
        )}

        {/* Placed Order Celebration Alert */}
        {orderPlacedId && (
          <div className="alert alert-success d-flex align-items-center justify-content-between mb-4 shadow-sm">
            <div className="d-flex align-items-center gap-2">
              <CheckCircle2 size={24} className="text-success" />
              <div>
                <h6 className="mb-0 fw-bold">Order Confirmed! Order Number: {orderPlacedId}</h6>
                <small className="text-muted">
                  Your simulated payment was authorized. 50-point diagnostic seal is being prepared for dispatch.
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() => navigate('/account')}
            />
          </div>
        )}

        <div className="row g-4">
          {/* Left Customer Navigation Sidebar */}
          <aside className="col-12 col-md-4 col-lg-3">
            <div className="reloop-card p-4 bg-white shadow-xs">
              <div className="d-flex align-items-center gap-3 pb-3 mb-3 border-bottom">
                <div
                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold fs-5"
                  style={{ width: '48px', height: '48px' }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'K'}
                </div>
                <div className="overflow-hidden">
                  <h6 className="fw-bold text-dark mb-0 text-truncate">{user?.name || 'Kingston Shasanth'}</h6>
                  <small className="text-muted text-truncate d-block">{user?.email || 'customer@reloop.com'}</small>
                </div>
              </div>

              <div className="d-flex flex-column gap-1">
                <button
                  type="button"
                  className={`btn text-start d-flex align-items-center gap-2 py-2 px-3 rounded ${
                    activeTab === 'orders' ? 'btn-reloop-primary' : 'btn-light text-dark'
                  }`}
                  onClick={() => setActiveTab('orders')}
                >
                  <ShoppingBag size={17} /> My Orders ({orders.length})
                </button>

                <button
                  type="button"
                  className={`btn text-start d-flex align-items-center gap-2 py-2 px-3 rounded ${
                    activeTab === 'tradein' ? 'btn-reloop-primary' : 'btn-light text-dark'
                  }`}
                  onClick={() => setActiveTab('tradein')}
                >
                  <ArrowRightLeft size={17} /> Trade-in Requests ({tradeIns.length})
                </button>

                <button
                  type="button"
                  className={`btn text-start d-flex align-items-center gap-2 py-2 px-3 rounded ${
                    activeTab === 'saved' ? 'btn-reloop-primary' : 'btn-light text-dark'
                  }`}
                  onClick={() => setActiveTab('saved')}
                >
                  <Heart size={17} /> Saved Items ({wishlistItems.length})
                </button>

                <button
                  type="button"
                  className={`btn text-start d-flex align-items-center gap-2 py-2 px-3 rounded ${
                    activeTab === 'addresses' ? 'btn-reloop-primary' : 'btn-light text-dark'
                  }`}
                  onClick={() => setActiveTab('addresses')}
                >
                  <MapPin size={17} /> Saved Addresses
                </button>

                <div className="border-top my-2" />

                <button
                  type="button"
                  className="btn btn-outline-danger text-start d-flex align-items-center gap-2 py-2 px-3"
                  onClick={() => {
                    logout('customer');
                    navigate('/login');
                  }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="col-12 col-md-8 col-lg-9">
            {/* Tab: My Orders */}
            {activeTab === 'orders' && (
              <div>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
                  <div>
                    <h2 className="h4 fw-bold text-dark mb-1">My orders</h2>
                    <p className="text-muted small mb-0">Track purchases, delivery updates and warranty details.</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-reloop-outline btn-sm d-flex align-items-center gap-1"
                    onClick={() => alert('Download complete order history summary PDF initiated.')}
                  >
                    <Download size={14} /> Download order history
                  </button>
                </div>

                {/* Status Tabs */}
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((filterKey) => (
                    <button
                      key={filterKey}
                      type="button"
                      className={`btn btn-sm text-capitalize ${
                        orderFilter === filterKey ? 'btn-reloop-navy' : 'btn-outline-secondary'
                      }`}
                      onClick={() => setOrderFilter(filterKey)}
                    >
                      {filterKey === 'all' ? `All orders (${orders.length})` : filterKey}
                    </button>
                  ))}
                </div>

                {/* Orders List */}
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status" />
                    <p className="text-muted small mt-2">Loading orders...</p>
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <div className="d-flex flex-column gap-4">
                    {filteredOrders.map((order) => {
                      const isDelivered = order.orderStatus === 'Delivered';
                      const isDispatched = order.orderStatus === 'Dispatched' || isDelivered;
                      const isPacked = order.orderStatus === 'Inspected & Packed' || isDispatched;

                      return (
                        <div key={order._id} className="reloop-card p-4 bg-white shadow-xs">
                          {/* Order Card Header */}
                          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center pb-3 mb-3 border-bottom gap-2">
                            <div>
                              <span className="fw-bold text-dark fs-6 me-2">Order #{order.orderNumber}</span>
                              <span className="text-muted small">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <div>
                              <span
                                className={`badge ${
                                  isDelivered
                                    ? 'bg-success text-white'
                                    : order.orderStatus === 'Dispatched'
                                    ? 'bg-primary text-white'
                                    : 'bg-warning text-dark'
                                } px-3 py-2`}
                              >
                                {order.orderStatus}
                              </span>
                            </div>
                          </div>

                          {/* Items in this Order */}
                          <div className="d-flex flex-column gap-3 mb-4">
                            {order.orderItems?.map((item, idx) => (
                              <div key={idx} className="d-flex align-items-center justify-content-between gap-3">
                                <div className="d-flex align-items-center gap-3">
                                  <ProductImage
                                    src={item.image}
                                    alt={item.title}
                                    productTitle={item.title}
                                    style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                                    className="border rounded p-1 bg-light"
                                  />
                                  <div>
                                    <h6 className="fw-bold text-dark mb-1">{item.title}</h6>
                                    <div className="d-flex align-items-center gap-2 small text-muted">
                                      <ConditionBadge grade={item.conditionGrade} />
                                      <span>Qty: {item.quantity}</span>
                                      <span>·</span>
                                      <button
                                        type="button"
                                        className="btn btn-link text-success p-0 text-decoration-none small fw-semibold"
                                        onClick={() => setSelectedProductForPassport(item.product)}
                                      >
                                        Digital Passport Available ↗
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                <div className="fw-bold text-dark">
                                  ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Fulfillment Stepper */}
                          <div className="p-3 bg-light rounded mb-2">
                            <div className="d-flex justify-content-between position-relative small text-center">
                              {/* Step 1 */}
                              <div className="d-flex flex-column align-items-center">
                                <div
                                  className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mb-1"
                                  style={{ width: '24px', height: '24px' }}
                                >
                                  <Check size={14} />
                                </div>
                                <span className="fw-bold text-dark">Order Confirmed</span>
                              </div>

                              {/* Step 2 */}
                              <div className="d-flex flex-column align-items-center">
                                <div
                                  className={`rounded-circle d-flex align-items-center justify-content-center mb-1 ${
                                    isPacked ? 'bg-success text-white' : 'bg-secondary text-white'
                                  }`}
                                  style={{ width: '24px', height: '24px' }}
                                >
                                  {isPacked ? <Check size={14} /> : '2'}
                                </div>
                                <span className={isPacked ? 'fw-bold text-dark' : 'text-muted'}>
                                  Packed & Tested
                                </span>
                              </div>

                              {/* Step 3 */}
                              <div className="d-flex flex-column align-items-center">
                                <div
                                  className={`rounded-circle d-flex align-items-center justify-content-center mb-1 ${
                                    isDispatched ? 'bg-success text-white' : 'bg-secondary text-white'
                                  }`}
                                  style={{ width: '24px', height: '24px' }}
                                >
                                  {isDispatched ? <Check size={14} /> : '3'}
                                </div>
                                <span className={isDispatched ? 'fw-bold text-dark' : 'text-muted'}>
                                  Dispatched
                                </span>
                              </div>

                              {/* Step 4 */}
                              <div className="d-flex flex-column align-items-center">
                                <div
                                  className={`rounded-circle d-flex align-items-center justify-content-center mb-1 ${
                                    isDelivered ? 'bg-success text-white' : 'bg-secondary text-white'
                                  }`}
                                  style={{ width: '24px', height: '24px' }}
                                >
                                  {isDelivered ? <Check size={14} /> : '4'}
                                </div>
                                <span className={isDelivered ? 'fw-bold text-dark' : 'text-muted'}>
                                  Delivered
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="reloop-empty-state">
                    <h5 className="text-dark mb-1">No orders found</h5>
                    <p className="text-muted small mb-3">You have not placed any orders matching this filter.</p>
                    <Link to="/products" className="btn btn-reloop-primary btn-sm">
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Trade-in Requests */}
            {activeTab === 'tradein' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h2 className="h4 fw-bold text-dark mb-1">Trade-in submissions</h2>
                    <p className="text-muted small mb-0">Track device valuation inspection and issued vouchers.</p>
                  </div>
                  <Link to="/trade-in" className="btn btn-reloop-primary btn-sm">
                    New Valuation
                  </Link>
                </div>

                {tradeIns.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {tradeIns.map((item) => (
                      <div key={item._id} className="reloop-card p-4 bg-white shadow-xs">
                        <div className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom">
                          <h6 className="fw-bold text-dark mb-0">{item.brand} {item.modelName}</h6>
                          <span className="badge bg-warning-subtle text-warning-emphasis px-3 py-1">
                            {item.status}
                          </span>
                        </div>
                        <div className="row g-2 small text-muted mb-2">
                          <div className="col-md-4">
                            <strong>Reported Condition:</strong> {item.cosmeticGrade}
                          </div>
                          <div className="col-md-4">
                            <strong>Estimated Value:</strong> ₹{item.estimatedValue?.toLocaleString('en-IN')}
                          </div>
                          <div className="col-md-4">
                            <strong>Voucher Code:</strong> {item.voucherCode || 'Pending Lab Verification'}
                          </div>
                        </div>
                        <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                          {item.verificationDisclosure}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="reloop-empty-state">
                    <h5 className="text-dark mb-1">No Trade-in Submissions</h5>
                    <p className="text-muted small mb-3">Estimate your old device's value and receive store vouchers.</p>
                    <Link to="/trade-in" className="btn btn-reloop-primary btn-sm">
                      Calculate Trade-In
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Saved Items / Wishlist */}
            {activeTab === 'saved' && (
              <div>
                <h2 className="h4 fw-bold text-dark mb-1">Saved items (Wishlist)</h2>
                <p className="text-muted small mb-4">Items you've bookmarked for later consideration.</p>

                {wishlistItems.length > 0 ? (
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
                    {wishlistItems.map((prod) => (
                      <div key={prod._id} className="col">
                        <div className="reloop-card p-3 bg-white h-100 d-flex flex-column">
                          <ProductImage
                            src={prod.primaryImage || prod.images?.[0]}
                            alt={prod.title}
                            slug={prod.slug}
                            category={prod.category}
                            productTitle={prod.title}
                            style={{ height: '140px', objectFit: 'contain' }}
                            className="my-2"
                          />
                          <h6 className="fw-bold text-dark line-clamp-1 mb-1">{prod.title}</h6>
                          <div className="fw-bold text-success fs-5 mb-2">
                            ₹{prod.refurbishedPrice?.toLocaleString('en-IN')}
                          </div>
                          <div className="d-flex gap-2 mt-auto">
                            <Link to={`/products/${prod.slug || prod._id}`} className="btn btn-reloop-primary btn-sm flex-grow-1">
                              View Item
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => removeFromWishlist(prod._id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="reloop-empty-state">
                    <h5 className="text-dark mb-1">Your wishlist is empty</h5>
                    <p className="text-muted small mb-3">Click the heart icon on any product to save it here.</p>
                    <Link to="/products" className="btn btn-reloop-primary btn-sm">
                      Explore Products
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Addresses */}
            {activeTab === 'addresses' && (
              <div>
                <h2 className="h4 fw-bold text-dark mb-1">Saved addresses</h2>
                <p className="text-muted small mb-4">Default shipping destinations for your orders.</p>

                <div className="reloop-card p-4 bg-white shadow-xs max-w-md">
                  <span className="badge bg-success-subtle text-success mb-2">Default Address</span>
                  <h6 className="fw-bold text-dark">{user?.name || 'Kingston Shasanth'}</h6>
                  <p className="text-muted small mb-1">
                    {user?.shippingAddress?.street || '12, Green Park, Hosur'}, {user?.shippingAddress?.city || 'Hosur'}, {user?.shippingAddress?.state || 'Tamil Nadu'} - {user?.shippingAddress?.postalCode || '635109'}
                  </p>
                  <small className="text-muted">Contact: {user?.phone || '+91 98765 43210'}</small>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Digital Passport Modal when launched from order item */}
      {selectedProductForPassport && (
        <DigitalPassportModal
          product={selectedProductForPassport}
          onClose={() => setSelectedProductForPassport(null)}
        />
      )}
    </div>
  );
}
