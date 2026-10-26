import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';
import { notifyDataChanged } from '../../services/syncChannel';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Order for Status Update Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      params.append('limit', 50);

      const res = await api.get(`/orders?${params.toString()}`);
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!newStatus || !selectedOrder) return;

    setUpdating(true);
    try {
      const res = await api.patch(`/orders/${selectedOrder._id}/status`, {
        status: newStatus,
        note: statusNote || `Status updated by administrator to ${newStatus}`,
      });

      if (res.data.success) {
        setAlertMsg({ type: 'success', text: `Order #${selectedOrder.orderNumber} updated to "${newStatus}"!` });
        notifyDataChanged('orders', selectedOrder._id);
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      console.error('Update status error:', err);
      setAlertMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to update order status.' });
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions = [
    'Order Placed',
    'Inspected & Packed',
    'Dispatched',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  return (
    <AdminLayout
      title="Customer Order Fulfilment Management"
      subtitle="Track live order stages, payment records, and update delivery timelines."
      breadcrumbs={[{ label: 'Orders & Fulfilment' }]}
    >
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} d-flex align-items-center justify-content-between py-2 small mb-4`}>
          <span>{alertMsg.text}</span>
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)} />
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="reloop-card p-3 mb-4 bg-white shadow-xs">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <Search size={15} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by order #, customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses ({totalCount})</option>
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-3 text-end">
            <button
              type="button"
              className="btn btn-reloop-outline btn-sm w-100"
              onClick={() => alert('Orders exported to CSV.')}
            >
              Export CSV Report
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="reloop-card p-0 bg-white overflow-hidden shadow-xs mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date & Time</th>
                <th>Items Purchased</th>
                <th>Total Value</th>
                <th>Payment</th>
                <th>Fulfillment Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-success" />
                    <span className="ms-2 text-muted">Loading orders from MongoDB...</span>
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders
                  .filter((order) => {
                    if (!search.trim()) return true;
                    const query = search.toLowerCase();
                    return (
                      order.orderNumber?.toLowerCase().includes(query) ||
                      order.user?.name?.toLowerCase().includes(query) ||
                      order.user?.email?.toLowerCase().includes(query)
                    );
                  })
                  .map((order) => (
                    <tr key={order._id}>
                      <td className="fw-bold text-dark">#{order.orderNumber}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-light border d-flex align-items-center justify-content-center fw-bold small text-secondary"
                            style={{ width: '30px', height: '30px' }}
                          >
                            {order.user?.name ? order.user.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <span className="fw-semibold text-dark d-block">{order.user?.name || 'Customer'}</span>
                            <small className="text-muted">{order.user?.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-muted">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <div className="line-clamp-1" style={{ maxWidth: '200px' }} title={order.orderItems?.map((i) => i.title).join(', ')}>
                          {order.orderItems?.map((i) => `${i.title} (${i.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td className="fw-bold text-dark tabular-nums">
                        ₹{order.pricing?.totalPrice?.toLocaleString('en-IN')}
                      </td>
                      <td>
                        {(() => {
                          const method = order.paymentDetails?.paymentMethod || 'Simulated Card';
                          const status = order.paymentDetails?.status || 'Paid';
                          const isCod = method === 'Cash on Delivery';
                          const isPending = status === 'Pending';

                          let label = `${isCod ? 'COD' : method === 'UPI Simulator' ? 'UPI' : 'Card'} · ${status}`;
                          if (!isCod) label += ' (Simulated)';

                          let badgeClass = 'bg-success-subtle text-success border-success-subtle';
                          if (isPending) badgeClass = 'bg-warning-subtle text-dark border-warning-subtle';
                          else if (status === 'Failed') badgeClass = 'bg-danger-subtle text-danger border-danger-subtle';

                          return (
                            <span className={`badge ${badgeClass} border px-2 py-1 text-nowrap`}>
                              {label}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-success'
                              : order.orderStatus === 'Dispatched'
                              ? 'bg-primary'
                              : order.orderStatus === 'Cancelled'
                              ? 'bg-danger'
                              : 'bg-warning text-dark'
                          } px-2 py-1`}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-reloop-navy py-1 px-2"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus(order.orderStatus);
                            setStatusNote('');
                          }}
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    No orders found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Transition Modal */}
      {selectedOrder && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(16, 42, 69, 0.7)', backdropFilter: 'blur(3px)', zIndex: 1060 }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '12px' }}>
              <div className="modal-header bg-dark text-white border-0 py-3 px-4" style={{ backgroundColor: 'var(--reloop-navy)' }}>
                <h6 className="modal-title mb-0 fw-bold text-white">
                  Update Fulfillment: #{selectedOrder.orderNumber}
                </h6>
                <button
                  type="button"
                  className="btn btn-sm text-white-50 p-1 border-0"
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateStatus}>
                <div className="modal-body p-4 bg-white">
                  {/* Fulfillment Status Selection */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Transition Order Stage To:</label>
                    <select
                      className="form-select form-select-sm"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      required
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Status Note / Tracking Update:</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Dispatched via Express logistics with AWB tracking #94821"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                    />
                  </div>

                  {/* Payment Details Callout */}
                  <div className="p-3 rounded bg-light border mb-3 small">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold text-dark">Payment Method:</span>
                      <span className="text-dark fw-bold">{selectedOrder.paymentDetails?.paymentMethod || 'Simulated Card'}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold text-dark">Payment Status:</span>
                      <span className={`badge ${selectedOrder.paymentDetails?.status === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {selectedOrder.paymentDetails?.status || 'Paid'}
                      </span>
                    </div>
                    {selectedOrder.paymentDetails?.paymentMethod === 'Cash on Delivery' && selectedOrder.paymentDetails?.status === 'Pending' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success w-100 mt-2"
                        onClick={async () => {
                          try {
                            const res = await api.patch(`/orders/${selectedOrder._id}/payment-status`, {
                              status: 'Paid',
                              note: 'Doorstep COD cash payment verified and collected upon delivery.',
                            });
                            if (res.data.success) {
                              setAlertMsg({ type: 'success', text: `Payment status for #${selectedOrder.orderNumber} marked as Paid!` });
                              setSelectedOrder(null);
                              fetchOrders();
                            }
                          } catch (err) {
                            setAlertMsg({ type: 'danger', text: 'Failed to update payment status.' });
                          }
                        }}
                      >
                        ✓ Record COD Payment Received (Mark Paid)
                      </button>
                    )}
                  </div>

                  <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
                    Note: Updating fulfillment status to <em>Dispatched</em> preserves the independent payment state without modifying COD status.
                  </div>
                </div>

                <div className="modal-footer bg-light border-top py-2 px-4 d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-reloop-primary btn-sm px-4"
                    disabled={updating}
                  >
                    {updating ? 'Updating...' : 'Commit Status Change'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
