import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect') || '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        navigate(redirect);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMsg(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh', backgroundColor: 'var(--reloop-bg)' }}>
      <div className="container-xl">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="reloop-card overflow-hidden shadow-md border-0 bg-white">
              <div className="row g-0">
                {/* Left Brand Banner */}
                <div
                  className="col-12 col-md-5 p-4 p-lg-5 d-flex flex-column justify-content-between"
                  style={{ backgroundColor: '#EBF3EE', borderRight: '1px solid #E2E8F0' }}
                >
                  <div>
                    <span
                      className="badge bg-success-subtle text-success text-uppercase fw-bold mb-3"
                      style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}
                    >
                      Join RELOOP Today
                    </span>
                    <h2 className="display-6 fw-extrabold text-navy mb-3" style={{ color: 'var(--reloop-navy)', lineHeight: 1.2 }}>
                      Renewed tech. <br />
                      <span className="text-success">Verified quality.</span>
                    </h2>
                    <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
                      Create your free customer account to track orders, access digital product passports, save favorite devices, and trade in old electronics.
                    </p>

                    <ul className="list-unstyled d-flex flex-column gap-2 small text-dark mb-4">
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} className="text-success" />
                        <span className="fw-semibold">Free delivery on orders over ₹999</span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} className="text-success" />
                        <span className="fw-semibold">Dedicated digital product passports</span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} className="text-success" />
                        <span className="fw-semibold">7-day hassle-free return policy</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-3 border-top border-secondary-subtle">
                    <small className="text-muted d-flex align-items-center gap-2">
                      <ShieldCheck size={16} className="text-success" />
                      Academic Assessment Environment (IA III)
                    </small>
                  </div>
                </div>

                {/* Right Form */}
                <div className="col-12 col-md-7 p-4 p-lg-5">
                  <div className="d-flex border-bottom mb-4">
                    <Link
                      to="/login"
                      className="btn btn-link text-decoration-none text-muted pb-2 px-3"
                    >
                      Sign In
                    </Link>
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none fw-bold text-success border-bottom border-success border-2 pb-2 px-3 rounded-0"
                    >
                      Create Account
                    </button>
                  </div>

                  <h4 className="fw-bold text-dark mb-1">Create your customer account</h4>
                  <p className="text-muted small mb-4">Enter your details to register on RELOOP.</p>

                  {errorMsg && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
                      <AlertCircle size={16} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark">Full Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Kingston Shasanth"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark">Email address *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark">Contact Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-semibold text-dark">Password *</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Choose a secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-reloop-primary w-100 py-2 fw-semibold mb-3"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Register Account'}
                    </button>

                    <div className="text-center small text-muted">
                      Already have an account?{' '}
                      <Link to="/login" className="text-success fw-semibold text-decoration-none">
                        Sign in
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
