import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, CheckCircle2, XCircle, Search, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../services/api';

export default function AdminTradeInsPage() {
  const [tradeIns, setTradeIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState(null);

  const fetchTradeIns = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trade-in');
      if (res.data.success) {
        setTradeIns(res.data.tradeIns);
      }
    } catch (err) {
      console.error('Failed to load trade-ins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeIns();
  }, []);

  const handleApprove = async (id, value) => {
    try {
      const res = await api.patch(`/trade-in/${id}`, {
        status: 'Approved',
        approvedValue: value,
        inspectorNotes: 'Diagnostics physically verified at RELOOP Lab. Store voucher code released.',
      });

      if (res.data.success) {
        setAlertMsg({ type: 'success', text: 'Trade-in approved and voucher code generated!' });
        fetchTradeIns();
      }
    } catch (err) {
      console.error('Approve failed:', err);
      setAlertMsg({ type: 'danger', text: 'Failed to update trade-in.' });
    }
  };

  return (
    <AdminLayout
      title="Trade-in Inspection & Valuation Queue"
      subtitle="Review customer self-reported device diagnostics, approve valuations, and issue store vouchers."
      breadcrumbs={[{ label: 'Trade-In Queue' }]}
    >
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} d-flex align-items-center justify-content-between py-2 small mb-4`}>
          <span>{alertMsg.text}</span>
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)} />
        </div>
      )}

      <div className="reloop-card p-0 bg-white overflow-hidden shadow-xs mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th>Customer</th>
                <th>Device Category</th>
                <th>Brand & Model</th>
                <th>Reported Condition</th>
                <th>Estimated Value</th>
                <th>Voucher Code</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    Loading trade-in queue...
                  </td>
                </tr>
              ) : tradeIns.length > 0 ? (
                tradeIns.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="fw-semibold text-dark">{item.user?.name || 'Customer'}</div>
                      <small className="text-muted">{item.user?.email}</small>
                    </td>
                    <td>{item.deviceCategory}</td>
                    <td className="fw-bold text-dark">{item.brand} {item.modelName}</td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {item.cosmeticGrade}
                      </span>
                    </td>
                    <td className="fw-bold text-success tabular-nums">
                      ₹{item.estimatedValue?.toLocaleString('en-IN')}
                    </td>
                    <td>
                      {item.voucherCode ? (
                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                          {item.voucherCode}
                        </span>
                      ) : (
                        <span className="text-muted small">Not Issued</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === 'Approved'
                            ? 'bg-success'
                            : item.status === 'Rejected'
                            ? 'bg-danger'
                            : 'bg-warning text-dark'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {item.status !== 'Approved' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-reloop-primary py-1 px-2"
                          onClick={() => handleApprove(item._id, item.estimatedValue)}
                        >
                          Approve & Issue Voucher
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    No trade-in submissions in queue.
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
