import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Trash2, ShoppingBag, ArrowLeft, Check, X } from 'lucide-react';
import ConditionBadge from '../components/common/ConditionBadge';
import ProductImage from '../components/common/ProductImage';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';

export default function ComparePage() {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();

  if (compareItems.length === 0) {
    return (
      <div className="container-xl py-5 text-center">
        <div className="reloop-empty-state max-w-md mx-auto my-5 p-5 bg-white shadow-xs">
          <RefreshCw size={48} className="text-secondary mb-3" />
          <h4 className="fw-bold text-dark mb-2">No Devices to Compare</h4>
          <p className="text-muted small mb-4">
            Select up to 4 renewed devices from the catalog to compare condition grades, battery health, and specifications side by side.
          </p>
          <Link to="/products" className="btn btn-reloop-primary">
            Browse Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="container-xl">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div>
            <h1 className="h3 fw-bold text-dark mb-1">Side-by-side device comparison</h1>
            <p className="text-muted small mb-0">
              Comparing {compareItems.length} {compareItems.length === 1 ? 'device' : 'devices'} across condition, battery health, and specs.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={clearCompare}
            >
              Clear Comparison
            </button>
            <Link to="/products" className="btn btn-reloop-outline btn-sm">
              <ArrowLeft size={14} /> Add More Devices
            </Link>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="reloop-card p-0 bg-white overflow-hidden shadow-xs">
          <div className="table-responsive">
            <table className="table table-bordered mb-0 align-middle">
              <thead>
                <tr className="bg-light text-center">
                  <th style={{ width: '200px' }} className="text-start p-3 bg-light text-muted small text-uppercase">
                    Specification
                  </th>
                  {compareItems.map((prod) => (
                    <th key={prod._id} style={{ minWidth: '220px' }} className="p-3 bg-white text-center">
                      <div className="position-relative">
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger position-absolute top-0 end-0 p-0 text-decoration-none"
                          onClick={() => removeFromCompare(prod._id)}
                          title="Remove from comparison"
                        >
                          <X size={16} />
                        </button>
                        <ProductImage
                          src={prod.primaryImage || prod.images?.[0]}
                          alt={prod.title}
                          slug={prod.slug}
                          category={prod.category}
                          productTitle={prod.title}
                          style={{ height: '110px', objectFit: 'contain' }}
                          className="my-2"
                        />
                        <Link to={`/products/${prod.slug || prod._id}`} className="text-decoration-none">
                          <h6 className="fw-bold text-dark small line-clamp-2 mb-1">{prod.title}</h6>
                        </Link>
                        <div className="fw-bold text-success fs-5 mb-2 tabular-nums">
                          ₹{prod.refurbishedPrice?.toLocaleString('en-IN')}
                        </div>
                        <button
                          type="button"
                          className="btn btn-reloop-primary btn-sm w-100 py-1"
                          onClick={() => addToCart(prod, 1)}
                        >
                          <ShoppingBag size={14} /> Add to Cart
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th className="bg-light text-dark small">Condition Grade</th>
                  {compareItems.map((prod) => (
                    <td key={prod._id} className="text-center">
                      <ConditionBadge grade={prod.conditionGrade} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="bg-light text-dark small">Battery Health</th>
                  {compareItems.map((prod) => (
                    <td key={prod._id} className="text-center">
                      {['Smartphones', 'Laptops', 'Tablets', 'Wearables', 'Audio'].includes(prod.category) ? (
                        <span className="fw-bold text-success tabular-nums">
                          {prod.specifications?.batteryHealthPercent || 92}% Capacity
                        </span>
                      ) : (
                        <span className="text-muted small">N/A (Mains Powered)</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="bg-light text-dark small">Warranty Protection</th>
                  {compareItems.map((prod) => (
                    <td key={prod._id} className="text-center fw-semibold text-dark">
                      {prod.warrantyMonths || 12} Months Comprehensive
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="bg-light text-dark small">Processor (CPU)</th>
                  {compareItems.map((prod) => (
                    <td key={prod._id} className="text-center small">
                      {prod.specifications?.processor || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="bg-light text-dark small">Memory (RAM)</th>
                  {compareItems.map((prod) => (
                    <td key={prod._id} className="text-center small">
                      {prod.specifications?.ram || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="bg-light text-dark small">Storage</th>
                  {compareItems.map((prod) => (
                    <td key={prod._id} className="text-center small">
                      {prod.specifications?.storage || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="bg-light text-dark small">Display</th>
                  {compareItems.map((prod) => (
                    <td key={prod._id} className="text-center small">
                      {prod.specifications?.display || 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="bg-light text-dark small">Original Retail Price</th>
                  {compareItems.map((prod) => (
                    <td key={prod._id} className="text-center small text-muted text-decoration-line-through tabular-nums">
                      ₹{(prod.originalRetailPrice || prod.refurbishedPrice).toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>
                <tr>
                  <th className="bg-light text-dark small">Calculated Savings</th>
                  {compareItems.map((prod) => {
                    const original = prod.originalRetailPrice || prod.refurbishedPrice;
                    const diff = original - prod.refurbishedPrice;
                    return (
                      <td key={prod._id} className="text-center small fw-bold text-success tabular-nums">
                        Save ₹{Math.max(0, diff).toLocaleString('en-IN')}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
