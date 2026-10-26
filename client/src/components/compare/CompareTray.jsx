import React from 'react';
import { Link } from 'react-router-dom';
import { X, RefreshCw, ArrowRight } from 'lucide-react';
import ProductImage from '../common/ProductImage';
import { useCompare } from '../../context/CompareContext';

export default function CompareTray() {
  const { compareItems, compareCount, removeFromCompare, clearCompare } = useCompare();

  if (compareCount === 0) return null;

  return (
    <div
      className="position-fixed bottom-0 start-50 translate-middle-x bg-white shadow-lg border rounded-top px-3 py-2 d-flex align-items-center gap-3"
      style={{ zIndex: 1040, minWidth: '320px', maxWidth: '640px' }}
    >
      <div className="d-flex align-items-center gap-2">
        <RefreshCw size={18} className="text-success" />
        <span className="fw-semibold small text-nowrap">Compare ({compareCount}/4):</span>
      </div>

      <div className="d-flex align-items-center gap-2 flex-grow-1 overflow-x-auto py-1">
        {compareItems.map((item) => (
          <div
            key={item._id}
            className="position-relative border rounded p-1 bg-light d-flex align-items-center flex-shrink-0"
            style={{ width: '45px', height: '45px' }}
            title={item.title}
          >
            <ProductImage
              src={item.primaryImage || (item.images && item.images[0])}
              alt={item.title}
              slug={item.slug}
              category={item.category}
              productTitle={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
            <button
              type="button"
              className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger border-0 p-1"
              onClick={() => removeFromCompare(item._id)}
              title="Remove"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>

      <div className="d-flex align-items-center gap-2 flex-shrink-0">
        <Link to="/compare" className="btn btn-reloop-primary btn-sm py-1 px-3 d-flex align-items-center gap-1">
          Compare <ArrowRight size={14} />
        </Link>
        <button
          type="button"
          className="btn btn-link text-muted btn-sm p-1 text-decoration-none"
          onClick={clearCompare}
          title="Clear all"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
