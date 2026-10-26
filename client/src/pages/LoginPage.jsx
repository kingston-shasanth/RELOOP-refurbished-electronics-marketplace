import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle, User, KeyRound } from 'lucide-react';
import ReloopLogo from '../components/common/ReloopLogo';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.user, res.data.token);
        if (res.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate(redirect);
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
      setErrorMsg(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@reloop.com');
      setPassword('admin123');
    } else {
      setEmail('customer@reloop.com');
      setPassword('password123');
    }
    setErrorMsg('');
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh', backgroundColor: 'var(--reloop-bg)' }}>
      <div className="container-xl">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="reloop-card overflow-hidden shadow-md border-0 bg-white">
              <div className="row g-0">
                {/* Left Brand Value Proposition Banner */}
                <div
                  className="col-12 col-md-5 p-4 p-lg-5 d-flex flex-column justify-content-between"
                  style={{ backgroundColor: '#EBF3EE', borderRight: '1px solid #E2E8F0' }}
                >
                  <div>
                    <span
                      className="badge bg-success-subtle text-success text-uppercase fw-bold mb-3"
                      style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}
                    >
                      Welcome to RELOOP
                    </span>
                    <h2 className="display-6 fw-extrabold text-navy mb-3" style={{ color: 'var(--reloop-navy)', lineHeight: 1.2 }}>
                      Better tech. <br />
                      <span className="text-success">Better value.</span>
                    </h2>
                    <p className="text-secondary small mb-4" style={{ lineHeight: 1.6 }}>
                      Shop professionally inspected refurbished electronics with transparent condition grades, lab-verified battery health, and warranty-backed confidence.
                    </p>

                    <ul className="list-unstyled d-flex flex-column gap-2 small text-dark mb-4">
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} className="text-success" />
                        <span className="fw-semibold">50-point quality checked devices</span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} className="text-success" />
                        <span className="fw-semibold">Clear condition reports & passports</span>
                      </li>
                      <li className="d-flex align-items-center gap-2">
                        <CheckCircle2 size={16} className="text-success" />
                        <span className="fw-semibold">6–12 month warranty & easy returns</span>
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

                {/* Right Authentication Form */}
                <div className="col-12 col-md-7 p-4 p-lg-5">
                  <div className="d-flex border-bottom mb-4">
                    <button
                      type="button"
                      className="btn btn-link text-decoration-none fw-bold text-success border-bottom border-success border-2 pb-2 px-3 rounded-0"
                    >
                      Sign In
                    </button>
                    <Link
                      to="/register"
                      className="btn btn-link text-decoration-none text-muted pb-2 px-3"
                    >
                      Create Account
                    </Link>
                  </div>

                  <h4 className="fw-bold text-dark mb-1">Welcome back</h4>
                  <p className="text-muted small mb-3">
                    Sign in to manage your orders, saved products, trade-ins, or access admin console.
                  </p>

                  {/* Evaluator Quick-Fill Buttons */}
                  <div className="p-3 rounded bg-light border mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <small className="fw-semibold text-secondary">
                        Fast Sign-In for Verified Roles:
                      </small>
                      <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>SANDBOX</span>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        onClick={() => setDemoCredentials('customer')}
                      >
                        <User size={13} /> Customer Account
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                        onClick={() => setDemoCredentials('admin')}
                      >
                        <KeyRound size={13} /> Admin Console
                      </button>
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-3">
                      <AlertCircle size={16} />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
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
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-semibold text-dark mb-0">Password *</label>
                        <a href="#forgot" className="small text-muted text-decoration-none" onClick={(e) => { e.preventDefault(); alert('Demo password reset: password123 (Customer) or admin123 (Admin)'); }}>
                          Forgot password?
                        </a>
                      </div>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control"
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-reloop-primary w-100 py-2 fw-semibold mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" />
                          Authenticating...
                        </span>
                      ) : (
                        'Sign In to RELOOP'
                      )}
                    </button>

                    <div className="text-center small text-muted">
                      New to RELOOP?{' '}
                      <Link to="/register" className="text-success fw-semibold text-decoration-none">
                        Create an account
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
