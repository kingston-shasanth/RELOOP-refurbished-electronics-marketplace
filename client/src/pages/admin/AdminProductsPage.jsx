import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminProductModal from '../../components/admin/AdminProductModal';
import ConditionBadge from '../../components/common/ConditionBadge';
import ProductImage from '../../components/common/ProductImage';
import api from '../../services/api';

export default function AdminProductsPage() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const autoAdd = queryParams.get('action') === 'add';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const [showModal, setShowModal] = useState(autoAdd);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [alertMsg, setAlertMsg] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (category !== 'All') params.append('category', category);
      params.append('limit', 50);

      const res = await api.get(`/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
        setTotalProducts(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title || 'this product'}"?\n\nThis will remove the product record, inventory allocation, and associated Digital Product Passport from MongoDB. This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await api.delete(`/products/${id}`);
      if (res.data.success) {
        setAlertMsg({ type: 'success', text: `Product "${title || id}" deleted from MongoDB.` });
        fetchProducts();
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setAlertMsg({ type: 'danger', text: 'Failed to delete product.' });
    }
  };

  const handleSaveSuccess = (savedProduct) => {
    setAlertMsg({ type: 'success', text: `Product "${savedProduct.title}" saved successfully to MongoDB!` });
    fetchProducts();
  };

  return (
    <AdminLayout
      title="Product Inventory Management"
      subtitle="Create, update, inspect, and delete refurbished catalog items with MongoDB persistence."
      breadcrumbs={[{ label: 'Products & Inventory' }]}
    >
      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} d-flex align-items-center justify-content-between py-2 small mb-4`}>
          <span>{alertMsg.text}</span>
          <button type="button" className="btn-close" onClick={() => setAlertMsg(null)} />
        </div>
      )}

      {/* Top Controls: Search, Category, Add Product Action */}
      <div className="reloop-card p-3 mb-4 bg-white shadow-xs">
        <div className="row g-3 align-items-center justify-content-between">
          <div className="col-12 col-md-7">
            <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <Search size={15} className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by product title, brand, or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="form-select form-select-sm"
                style={{ width: 'auto', minWidth: '150px' }}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Laptops">Laptops</option>
                <option value="Smartphones">Mobiles</option>
                <option value="Tablets">Tablets</option>
                <option value="Audio">Audio</option>
                <option value="PC Components">PC Components</option>
              </select>

              <button type="submit" className="btn btn-reloop-navy btn-sm px-3">
                Search
              </button>
            </form>
          </div>

          <div className="col-12 col-md-auto text-md-end">
            <button
              type="button"
              className="btn btn-reloop-primary btn-sm d-flex align-items-center gap-1"
              onClick={() => {
                setEditingProduct(null);
                setShowModal(true);
              }}
            >
              <Plus size={16} /> Add New Product
            </button>
          </div>
        </div>
      </div>

      {/* Master Products Table */}
      <div className="reloop-card p-0 bg-white overflow-hidden shadow-xs mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 small">
            <thead className="table-light">
              <tr>
                <th style={{ width: '38%' }}>Product Details</th>
                <th>Price</th>
                <th>Condition</th>
                <th>Stock</th>
                <th>Category</th>
                <th style={{ width: '15%' }} className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-success" />
                    <span className="ms-2 text-muted">Loading catalogue records...</span>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((prod) => (
                  <tr key={prod._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <ProductImage
                          src={prod.primaryImage || prod.images?.[0]}
                          alt={prod.title}
                          slug={prod.slug}
                          category={prod.category}
                          productTitle={prod.title}
                          style={{ width: '45px', height: '45px', objectFit: 'contain' }}
                          className="border rounded p-1 bg-light flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <a
                            href={`/products/${prod.slug || prod._id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="fw-bold text-dark text-truncate d-block text-decoration-none"
                            title={prod.title}
                          >
                            {prod.title}
                          </a>
                          <small className="text-muted">
                            SKU: {prod.slug?.toUpperCase() || 'RLP'} · {prod.brand}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="fw-bold text-dark tabular-nums">
                        ₹{prod.refurbishedPrice?.toLocaleString('en-IN')}
                      </div>
                      {prod.originalRetailPrice > prod.refurbishedPrice && (
                        <small className="text-muted text-decoration-line-through tabular-nums">
                          ₹{prod.originalRetailPrice?.toLocaleString('en-IN')}
                        </small>
                      )}
                    </td>

                    <td>
                      <ConditionBadge grade={prod.conditionGrade} />
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          prod.stockCount <= 3
                            ? 'bg-danger-subtle text-danger border border-danger-subtle'
                            : prod.stockCount <= 7
                            ? 'bg-warning-subtle text-warning-emphasis'
                            : 'bg-success-subtle text-success'
                        } px-2 py-1 tabular-nums`}
                      >
                        {prod.stockCount} units
                      </span>
                    </td>

                    <td className="text-muted">{prod.category}</td>

                    <td className="text-end">
                      <div className="d-inline-flex gap-1">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary py-1 px-2 d-flex align-items-center gap-1"
                          onClick={() => {
                            setEditingProduct(prod);
                            setShowModal(true);
                          }}
                          title="Edit Product"
                        >
                          <Edit size={13} /> Edit
                        </button>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger py-1 px-2 d-flex align-items-center gap-1"
                          onClick={() => handleDelete(prod._id, prod.title)}
                          title="Delete Product"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">
                    No products found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Add/Edit Modal */}
      {showModal && (
        <AdminProductModal
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSaved={handleSaveSuccess}
        />
      )}
    </AdminLayout>
  );
}
