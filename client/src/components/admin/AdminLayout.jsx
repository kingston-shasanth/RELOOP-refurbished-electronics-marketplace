import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { Bell, ShieldCheck, User } from 'lucide-react';

export default function AdminLayout({ children, title, subtitle, breadcrumbs = [] }) {
  const { user, isAdmin } = useAuth();

  // Route protection: ensure user is logged in as admin
  // For university presentation convenience, if not logged in as admin, show notice or redirect
  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-5 text-center">
        <div className="reloop-card p-5 max-w-md mx-auto" style={{ maxWidth: '500px', margin: '4rem auto' }}>
          <h4 className="text-danger mb-3">Admin Access Restricted</h4>
          <p className="text-muted mb-4">
            You must be logged in as an Administrator to view the management console.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-reloop-primary">
              Sign In as Admin
            </Link>
            <Link to="/" className="btn btn-reloop-outline">
              Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <AdminSidebar />

      <main className="reloop-admin-content flex-grow-1">
        {/* Top Header Row with Breadcrumbs & Profile Pill */}
        <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0 small">
              <li className="breadcrumb-item">
                <Link to="/admin" className="text-decoration-none text-muted">Admin</Link>
              </li>
              {breadcrumbs.map((crumb, idx) => (
                <li
                  key={idx}
                  className={`breadcrumb-item ${idx === breadcrumbs.length - 1 ? 'active fw-semibold' : ''}`}
                >
                  {crumb.path ? (
                    <Link to={crumb.path} className="text-decoration-none text-muted">{crumb.label}</Link>
                  ) : (
                    crumb.label
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-1 text-success small fw-semibold">
              <ShieldCheck size={16} /> Live DB Active
            </div>

            <div className="vr" />

            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
              >
                A
              </div>
              <div className="d-none d-sm-block text-start line-height-sm">
                <span className="d-block fw-semibold small text-dark">{user.name}</span>
                <span className="text-muted" style={{ fontSize: '0.72rem' }}>Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Title Block */}
        {(title || subtitle) && (
          <div className="mb-4">
            {title && <h2 className="h4 fw-bold text-dark mb-1">{title}</h2>}
            {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
          </div>
        )}

        {/* Content Body */}
        {children}
      </main>
    </div>
  );
}
