import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  ShoppingBag,
  IndianRupee,
  Calendar,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const fetchCustomers = async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      const res = await api.get(`/admin/customers?${params.toString()}`);
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error('Failed to load customers:', err);
      setError('Unable to load customer directory. Please verify administrator permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  const totalSpentAll = customers.reduce((acc, c) => acc + (c.totalSpent || 0), 0);
  const activeBuyersCount = customers.filter((c) => c.orderCount > 0).length;

  return (
    <AdminLayout
      title="Customer Registry"
      subtitle="Registered platform customers, procurement history and verification status"
      breadcrumbs={[{ label: 'Customer Registry' }]}
    >
      {/* KPI Overview Cards */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-lg-4">
          <div className="reloop-card p-3 bg-white h-100 border-start border-4 border-success">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary small fw-semibold text-uppercase">Total Customers</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">{customers.length}</h3>
                <small className="text-muted">Registered accounts</small>
              </div>
              <div className="p-3 bg-success-subtle text-success rounded-circle">
                <Users size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div className="reloop-card p-3 bg-white h-100 border-start border-4 border-primary">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary small fw-semibold text-uppercase">Active Buyers</span>
                <h3 className="fw-bold text-primary mt-1 mb-0">{activeBuyersCount}</h3>
                <small className="text-muted">Customers with &ge; 1 order</small>
              </div>
              <div className="p-3 bg-primary-subtle text-primary rounded-circle">
                <ShoppingBag size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-lg-4">
          <div className="reloop-card p-3 bg-white h-100 border-start border-4 border-warning">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-secondary small fw-semibold text-uppercase">Cumulative Spend</span>
                <h3 className="fw-bold text-dark mt-1 mb-0">₹{totalSpentAll.toLocaleString('en-IN')}</h3>
                <small className="text-muted">Total platform GMV from registered accounts</small>
              </div>
              <div className="p-3 bg-warning-subtle text-warning rounded-circle">
                <IndianRupee size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="reloop-card p-3 bg-white mb-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-start-0"
                placeholder="Search by customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-auto">
            <button type="submit" className="btn btn-reloop-primary btn-sm px-3">
              Search
            </button>
          </div>
          {search && (
            <div className="col-auto">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  fetchCustomers('');
                }}
              >
                Clear
              </button>
            </div>
          )}
          <div className="col-auto ms-auto">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              onClick={() => fetchCustomers(search)}
              disabled={loading}
              title="Refresh customer records"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Customer Registry Table */}
      <div className="reloop-card bg-white shadow-xs overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-secondary fw-semibold">
                <th className="ps-3 py-3">Customer</th>
                <th className="py-3">Email Address</th>
                <th className="py-3">Registered On</th>
                <th className="py-3 text-center">Orders</th>
                <th className="py-3 text-end">Total Spent</th>
                <th className="py-3 text-center">Status</th>
                <th className="pe-3 py-3 text-end">Last Order</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-success" role="status" />
                    <span className="ms-2 text-muted">Retrieving customer registry from database...</span>
                  </td>
                </tr>
              ) : customers.length > 0 ? (
                customers.map((cust) => (
                  <tr key={cust._id}>
                    <td className="ps-3">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-success text-white fw-bold d-flex align-items-center justify-content-center text-uppercase"
                          style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
                        >
                          {cust.name ? cust.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <span className="fw-semibold text-dark d-block">{cust.name}</span>
                          <span className="badge bg-light text-secondary border small">ID: {cust._id?.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1 text-secondary small">
                        <Mail size={13} className="text-muted" />
                        <span>{cust.email}</span>
                      </div>
                    </td>
                    <td className="small text-muted">
                      {cust.createdAt
                        ? new Date(cust.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="text-center">
                      <span className={`badge ${cust.orderCount > 0 ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-light text-muted'}`}>
                        {cust.orderCount} {cust.orderCount === 1 ? 'Order' : 'Orders'}
                      </span>
                    </td>
                    <td className="text-end fw-bold text-dark">
                      ₹{Number(cust.totalSpent || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="text-center">
                      {cust.orderCount > 0 ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
                          <CheckCircle2 size={12} /> Verified Buyer
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary border">
                          Registered
                        </span>
                      )}
                    </td>
                    <td className="pe-3 text-end small text-muted">
                      {cust.lastOrder
                        ? new Date(cust.lastOrder).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'No orders yet'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="reloop-empty-state max-w-sm mx-auto p-4">
                      <Users size={36} className="text-secondary mb-2" />
                      <h6 className="fw-bold text-dark">No Customer Accounts Found</h6>
                      <p className="text-muted small mb-0">
                        {search ? `No accounts matched "${search}".` : 'No registered customer accounts in database.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
