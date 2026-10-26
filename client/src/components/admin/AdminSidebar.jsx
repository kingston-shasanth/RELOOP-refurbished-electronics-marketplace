import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ArrowRightLeft,
  Users,
  Store,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import ReloopLogo from '../common/ReloopLogo';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { label: 'Products & Inventory', path: '/admin/products', icon: Package },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Trade-in Requests', path: '/admin/trade-ins', icon: ArrowRightLeft },
    { label: 'Customer Registry', path: '/admin/customers', icon: Users },
  ];

  return (
    <aside className="reloop-admin-sidebar">
      {/* Brand Header */}
      <div className="p-3 border-bottom border-secondary d-flex flex-column gap-1">
        <ReloopLogo variant="light" showTagline={false} to="/admin" />
        <span
          className="badge bg-success-subtle text-success border border-success-subtle mt-1 text-uppercase"
          style={{ width: 'fit-content', fontSize: '0.68rem', letterSpacing: '0.05em' }}
        >
          Admin Console
        </span>
      </div>

      {/* Nav Links */}
      <div className="p-3 flex-grow-1 overflow-y-auto">
        <div className="text-secondary small fw-bold text-uppercase mb-2" style={{ fontSize: '0.68rem' }}>
          Operations & Inventory
        </div>
        <ul className="nav nav-pills flex-column gap-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <li key={idx} className="nav-item">
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `nav-link d-flex align-items-center gap-2 py-2 px-3 rounded text-white ${
                      isActive ? 'bg-success fw-semibold' : 'text-secondary hover-bg-dark'
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? 'var(--reloop-green)' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#CBD5E1',
                  })}
                >
                  <Icon size={18} />
                  <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>

        <div className="text-secondary small fw-bold text-uppercase mt-4 mb-2" style={{ fontSize: '0.68rem' }}>
          External Shortcuts
        </div>
        <ul className="nav nav-pills flex-column gap-1">
          <li className="nav-item">
            <Link
              to="/"
              className="nav-link d-flex align-items-center gap-2 py-2 px-3 text-secondary rounded"
              style={{ color: '#CBD5E1' }}
            >
              <Store size={18} />
              <span style={{ fontSize: '0.9rem' }}>Public Storefront</span>
            </Link>
          </li>
        </ul>
      </div>

      {/* User Footer Card */}
      <div className="p-3 border-top border-secondary bg-dark-subtle d-flex align-items-center justify-content-between">
        <div className="overflow-hidden me-2">
          <span className="d-block text-white fw-bold small text-truncate">
            {user?.name || 'Administrator'}
          </span>
          <span className="d-block text-secondary small text-truncate" style={{ fontSize: '0.72rem' }}>
            {user?.email || 'admin@reloop.com'}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger p-1"
          onClick={() => {
            logout('admin');
            navigate('/login');
          }}
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
