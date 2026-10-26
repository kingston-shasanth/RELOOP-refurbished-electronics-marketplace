import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  AlertTriangle,
  ArrowRightLeft,
  TrendingUp,
  DollarSign,
  Users,
  ShieldCheck,
  Plus,
  ArrowRight,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import ConditionBadge from '../../components/common/ConditionBadge';
import api from '../../services/api';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    activeListings: 0,
    lowStockCount: 0,
    totalOrders: 0,
    totalRevenue: 0,
    paidRevenue: 0,
    pendingCodRevenue: 0,
    pendingTradeIns: 0,
    totalCustomers: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setMetrics(res.data.metrics);
          setRecentOrders(res.data.recentOrders || []);
          setLowStockProducts(res.data.lowStockProducts || []);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <AdminLayout
      title="Admin Operations Dashboard"
      subtitle="Live metrics derived directly from RELOOP MongoDB database collections."
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      {/* 4 Main KPI Cards */}
      <div className="row g-3 mb-4">
        {/* Card 1: Total Revenue with Paid vs Pending COD Distinction */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="reloop-card p-3 bg-white h-100 shadow-xs border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Realized Paid Revenue</span>
              <div className="p-2 rounded bg-success-subtle text-success">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="h3 fw-bold text-dark mb-1 tabular-nums">
              ₹{(metrics.paidRevenue ?? metrics.totalRevenue).toLocaleString('en-IN')}
            </div>
            <div className="d-flex flex-column gap-1 small mt-2 pt-2 border-top">
              <span className="text-success fw-semibold">
                ✓ Paid Orders: <span className="tabular-nums">{metrics.totalOrders}</span> recorded
              </span>
              {Boolean(metrics.pendingCodRevenue) && (
                <span className="text-muted tabular-nums" style={{ fontSize: '0.78rem' }}>
                  ⏳ Pending COD: ₹{metrics.pendingCodRevenue.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Active Products */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="reloop-card p-3 bg-white h-100 shadow-xs border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Active Catalog Listings</span>
              <div className="p-2 rounded bg-primary-subtle text-primary">
                <Package size={18} />
              </div>
            </div>
            <div className="h3 fw-bold text-dark mb-1 tabular-nums">{metrics.activeListings}</div>
            <small className="text-muted">Total in inventory: <span className="tabular-nums">{metrics.totalProducts}</span> units</small>
          </div>
        </div>

        {/* Card 3: Low Stock Alerts */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="reloop-card p-3 bg-white h-100 shadow-xs border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Low Stock Attention</span>
              <div className="p-2 rounded bg-warning-subtle text-warning">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="h3 fw-bold text-dark mb-1 tabular-nums">{metrics.lowStockCount}</div>
            <small className="text-danger fw-semibold">Units with stock ≤ 5 remaining</small>
          </div>
        </div>

        {/* Card 4: Trade-In Requests */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="reloop-card p-3 bg-white h-100 shadow-xs border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted small fw-semibold text-uppercase">Trade-In Queue</span>
              <div className="p-2 rounded bg-info-subtle text-info">
                <ArrowRightLeft size={18} />
              </div>
            </div>
            <div className="h3 fw-bold text-dark mb-1 tabular-nums">{metrics.pendingTradeIns}</div>
            <small className="text-muted">Pending hardware verification</small>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Orders & Low Stock Inventory */}
      <div className="row g-4">
        {/* Recent Orders Table */}
        <div className="col-12 col-lg-8">
          <div className="reloop-card p-4 bg-white shadow-xs">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div>
                <h5 className="fw-bold text-dark mb-0">Recent customer orders</h5>
                <small className="text-muted">Latest transactions processed through server</small>
              </div>
              <Link to="/admin/orders" className="btn btn-reloop-outline btn-sm">
                View All Orders
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-success" />
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="fw-bold text-dark">#{order.orderNumber}</td>
                        <td>
                          <div className="fw-semibold text-dark">{order.user?.name || 'Customer'}</div>
                          <small className="text-muted">{order.user?.email}</small>
                        </td>
                        <td>
                          {order.orderItems?.map((i) => i.title).join(', ') || '1 item'}
                        </td>
                        <td className="fw-bold text-success tabular-nums">
                          ₹{order.pricing?.totalPrice?.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              order.orderStatus === 'Delivered'
                                ? 'bg-success'
                                : order.orderStatus === 'Dispatched'
                                ? 'bg-primary'
                                : 'bg-warning text-dark'
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted small text-center my-4">No orders placed yet.</p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts Column */}
        <div className="col-12 col-lg-4">
          <div className="reloop-card p-4 bg-white shadow-xs">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-bold text-dark mb-0">Low stock units</h5>
              <Link to="/admin/products" className="text-success small fw-semibold text-decoration-none">
                Manage Inventory →
              </Link>
            </div>

            {lowStockProducts.length > 0 ? (
              <div className="d-flex flex-column gap-3">
                {lowStockProducts.map((prod) => (
                  <div key={prod._id} className="d-flex align-items-center justify-content-between border-bottom pb-2">
                    <div className="overflow-hidden me-2">
                      <span className="fw-bold text-dark small d-block text-truncate">{prod.title}</span>
                      <small className="text-muted">{prod.brand} · {prod.conditionGrade}</small>
                    </div>
                    <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">
                      {prod.stockCount} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small text-center my-4">All stock levels healthy.</p>
            )}

            <div className="mt-4 pt-3 border-top">
              <Link to="/admin/products?action=add" className="btn btn-reloop-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1">
                <Plus size={16} /> Add New Refurbished Item
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
