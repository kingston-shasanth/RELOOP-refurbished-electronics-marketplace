import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, ShieldCheck, HelpCircle, RefreshCw, LogOut, LayoutDashboard } from 'lucide-react';
import ReloopLogo from './ReloopLogo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const headerRef = useRef(null);

  const { user, isAdmin, logout } = useAuth();
  const { totalItemsCount, subtotal } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();

  const navigate = useNavigate();

  // Measure dynamic header height and update custom property for sticky offset
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--reloop-header-height', `${height}px`);
      }
    };

    updateHeaderHeight();

    let resizeObserver;
    if (window.ResizeObserver && headerRef.current) {
      resizeObserver = new ResizeObserver(() => updateHeaderHeight());
      resizeObserver.observe(headerRef.current);
    }

    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const categoryParam = selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}${categoryParam}`);
    } else if (selectedCategory !== 'All') {
      navigate(`/products?category=${encodeURIComponent(selectedCategory)}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="reloop-header" ref={headerRef}>
      {/* Top Announcement Bar */}
      <div className="reloop-topbar">
        <div className="container-xl d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <ShieldCheck size={15} className="text-success" />
            <span>Certified refurbished electronics · 50-point quality verified</span>
          </div>
          <div className="d-none d-md-flex align-items-center gap-3">
            <span>Free delivery over ₹999</span>
            <span>·</span>
            <span>7-day easy returns</span>
            <span>·</span>
            <Link to="/trade-in" className="text-decoration-none text-muted hover-green">
              Trade-In Programme
            </Link>
            <span>·</span>
            <span className="d-flex align-items-center gap-1">
              <HelpCircle size={14} /> Help Centre
            </span>
          </div>
        </div>
      </div>

      {/* Main Brand & Search Navigation */}
      <div className="container-xl py-2 py-md-3">
        <div className="row align-items-center g-2 g-md-3">
          {/* Brand Logo */}
          <div className="col-auto">
            <ReloopLogo variant="dark" />
          </div>

          {/* Search Input with Integrated Category Selector */}
          <div className="col order-3 order-lg-2">
            <form onSubmit={handleSearchSubmit} className="d-flex">
              <div className="input-group" style={{ maxWidth: '720px', margin: '0 auto' }}>
                <select
                  className="form-select bg-light text-muted border-end-0 flex-grow-0 d-none d-sm-block"
                  style={{ width: 'auto', maxWidth: '160px', fontSize: '0.88rem' }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  <option value="Smartphones">Smartphones</option>
                  <option value="Laptops">Laptops</option>
                  <option value="Tablets">Tablets</option>
                  <option value="Audio">Audio</option>
                  <option value="Wearables">Wearables</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Cameras">Cameras</option>
                  <option value="PC Components">PC Components</option>
                </select>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for phones, laptops, tablets and components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '0.92rem' }}
                />

                <button
                  type="submit"
                  className="btn btn-reloop-primary px-3 px-md-4 rounded-end"
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  title="Search"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Right Action Icons (Account, Wishlist, Compare, Cart) */}
          <div className="col-auto order-2 order-lg-3 ms-auto">
            <div className="d-flex align-items-center gap-2 gap-md-3">
              {/* Compare Indicator (if any items selected) */}
              {compareCount > 0 && (
                <Link
                  to="/compare"
                  className="d-flex align-items-center gap-1 text-decoration-none px-2 py-1 rounded bg-light border position-relative text-dark"
                  title="Device Comparison"
                >
                  <RefreshCw size={17} className="text-success" />
                  <span className="d-none d-md-inline" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    Compare
                  </span>
                  <span className="badge bg-success rounded-pill" style={{ fontSize: '0.7rem' }}>
                    {compareCount}
                  </span>
                </Link>
              )}

              {/* Account Dropdown / Link */}
              <div className="position-relative">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-1 text-dark"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={{ fontSize: '0.88rem' }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center bg-light border"
                    style={{ width: '34px', height: '34px' }}
                  >
                    <User size={18} className="text-secondary" />
                  </div>
                  <div className="text-start d-none d-md-block line-height-sm">
                    <span className="d-block text-muted" style={{ fontSize: '0.72rem' }}>
                      {user ? 'Welcome,' : 'Account'}
                    </span>
                    <span className="fw-semibold" style={{ fontSize: '0.84rem' }}>
                      {user ? user.name.split(' ')[0] : 'Sign in / Register'}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div
                    className="dropdown-menu show shadow-lg border-0 position-absolute end-0 mt-2 p-2"
                    style={{ minWidth: '220px', zIndex: 1050, borderRadius: '8px' }}
                  >
                    {user ? (
                      <>
                        <div className="px-3 py-2 border-bottom mb-2">
                          <span className="fw-bold d-block text-dark">{user.name}</span>
                          <small className="text-muted">{user.email}</small>
                          {isAdmin && (
                            <span className="badge bg-primary text-white d-block mt-1" style={{ width: 'fit-content' }}>
                              Administrator
                            </span>
                          )}
                        </div>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="dropdown-item d-flex align-items-center gap-2 text-primary fw-semibold py-2"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <LayoutDashboard size={16} /> Admin Console
                          </Link>
                        )}

                        <Link
                          to="/account"
                          className="dropdown-item py-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Orders & Account
                        </Link>

                        <div className="dropdown-divider" />
                        <button
                          type="button"
                          className="dropdown-item d-flex align-items-center gap-2 text-danger py-2"
                          onClick={() => {
                            logout('customer');
                            setShowUserMenu(false);
                            navigate('/');
                          }}
                        >
                          <LogOut size={16} /> Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="p-2 text-center border-bottom mb-2">
                          <Link
                            to="/login"
                            className="btn btn-reloop-primary w-100 mb-2"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Sign In
                          </Link>
                          <small className="text-muted">
                            New customer?{' '}
                            <Link
                              to="/register"
                              className="text-success fw-semibold"
                              onClick={() => setShowUserMenu(false)}
                            >
                              Register
                            </Link>
                          </small>
                        </div>
                        <Link
                          to="/login"
                          className="dropdown-item py-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Order History
                        </Link>
                        <Link
                          to="/login"
                          className="dropdown-item py-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Saved Items
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist Link */}
              <Link
                to="/account?tab=saved"
                className="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-1 text-dark position-relative"
                title="Wishlist"
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-light border position-relative"
                  style={{ width: '34px', height: '34px' }}
                >
                  <Heart size={18} className="text-secondary" />
                  {wishlistCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <div className="text-start d-none d-lg-block">
                  <span className="d-block text-muted" style={{ fontSize: '0.72rem' }}>
                    Saved
                  </span>
                  <span className="fw-semibold" style={{ fontSize: '0.84rem' }}>
                    Wishlist
                  </span>
                </div>
              </Link>

              {/* Shopping Cart Trigger */}
              <Link
                to="/cart"
                className="btn btn-link text-decoration-none d-flex align-items-center gap-2 p-1 text-dark position-relative"
                title="Shopping Cart"
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center bg-light border position-relative"
                  style={{ width: '34px', height: '34px' }}
                >
                  <ShoppingBag size={18} className="text-success" />
                  {totalItemsCount > 0 && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {totalItemsCount}
                    </span>
                  )}
                </div>
                <div className="text-start d-none d-md-block">
                  <span className="d-block text-muted" style={{ fontSize: '0.72rem' }}>
                    Cart ({totalItemsCount})
                  </span>
                  <span className="fw-bold text-success tabular-nums" style={{ fontSize: '0.84rem' }}>
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
