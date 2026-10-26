import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReloopLogo from './ReloopLogo';
import DevologicsSignature from './DevologicsSignature';
import { ShieldCheck, RefreshCw, Send, CheckCircle2, Award, Lock, ExternalLink } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="reloop-footer">
      <div className="container-xl">
        <div className="row g-4 g-lg-5 mb-5">
          {/* Brand & Purpose Column */}
          <div className="col-12 col-lg-4">
            <ReloopLogo variant="light" showTagline={true} />
            <p className="mt-3 text-secondary small pe-lg-4" style={{ lineHeight: 1.65, fontSize: '0.88rem' }}>
              RELOOP is India’s dedicated certified renewed electronics marketplace. Every device undergoes
              standardized 50-point diagnostic checks, carries a verifiable Digital Product Passport, and is
              backed by our customer warranty protection.
            </p>
            <div className="d-flex align-items-center gap-2 text-success small fw-semibold mt-3" style={{ fontSize: '0.84rem' }}>
              <RefreshCw size={15} />
              <span>Circular Technology · Electronic Waste Reduction</span>
            </div>
          </div>

          {/* Shop Column */}
          <div className="col-6 col-md-3 col-lg-2">
            <h5>Shop</h5>
            <Link to="/products?category=Smartphones">Smartphones</Link>
            <Link to="/products?category=Laptops">Renewed Laptops</Link>
            <Link to="/products?category=Tablets">Tablets & iPads</Link>
            <Link to="/products?category=Audio">Audio & ANC</Link>
            <Link to="/products?category=Gaming">Gaming Consoles</Link>
            <Link to="/products?category=PC%20Components">PC Components</Link>
            <Link to="/trade-in" className="text-warning fw-semibold">
              Instant Trade-In
            </Link>
          </div>

          {/* Customer Care Column */}
          <div className="col-6 col-md-3 col-lg-2">
            <h5>Customer Care</h5>
            <Link to="/account">Order Tracking</Link>
            <Link to="/account">Shipping & Delivery</Link>
            <Link to="/products">Return & Warranty</Link>
            <Link to="/compare">Device Comparison</Link>
            <Link to="/trade-in">Trade-In Valuation</Link>
            <Link to="/account">Account Settings</Link>
          </div>

          {/* Company & Verification Column */}
          <div className="col-6 col-md-3 col-lg-2">
            <h5>Trust & Standards</h5>
            <Link to="/">50-Point Inspection</Link>
            <Link to="/">Digital Passports</Link>
            <Link to="/">Refurbishment Grades</Link>
            <Link to="/">Battery Standards</Link>
            <Link to="/admin" className="text-info fw-semibold">
              Admin Portal
            </Link>
          </div>

          {/* Newsletter Column */}
          <div className="col-12 col-md-6 col-lg-2">
            <h5>Stay Updated</h5>
            <p className="small text-secondary mb-3" style={{ fontSize: '0.84rem', lineHeight: 1.5 }}>
              Receive refurbished drop alerts and device care guides (Demonstration Feature).
            </p>
            <form onSubmit={handleSubscribe}>
              <div className="input-group">
                <input
                  type="email"
                  className="form-control bg-dark border-secondary text-white"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ fontSize: '0.82rem' }}
                />
                <button type="submit" className="btn btn-reloop-primary px-3" title="Subscribe (Demo)">
                  {subscribed ? <CheckCircle2 size={16} /> : <Send size={15} />}
                </button>
              </div>
            </form>
            {subscribed && (
              <small className="text-success d-block mt-2" style={{ fontSize: '0.78rem' }}>
                ✓ Sample subscription received!
              </small>
            )}

            <div className="d-flex align-items-center gap-2 mt-4 text-secondary small" style={{ fontSize: '0.8rem' }}>
              <Lock size={15} className="text-success" />
              <span>Encrypted Checkout Protocol</span>
            </div>
          </div>
        </div>
      </div>

      {/* Devologics Signature Strip (Exact Credit, Copyright & Dotted Trail Canvas) */}
      <DevologicsSignature />
    </footer>
  );
}
